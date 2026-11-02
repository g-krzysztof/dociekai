'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BLOCKS,
  CATEGORIES,
  CATEGORY_ORDER,
  canDrop,
  hasHat,
  make,
  nextValue,
  type Block,
  type BlockType,
  type Category,
} from './engine';

/**
 * Paleta klocków i obszar skryptów — czyli to, co w Scratchu robi się palcem.
 *
 * **Przeciąganie jest tu treścią lekcji, nie wygodą.** Cała różnica między
 * „klocki leżą obok siebie” a „klocki są doczepione” istnieje wyłącznie w geście:
 * klocek złapany wychodzi ze stosu i idzie za palcem, a stos otwiera się w
 * miejscu, w którym go upuścisz. Dlatego bench nie ma trybu „kliknij, żeby
 * wstawić w wybrane miejsce” — kliknięcie dokłada klocek na koniec (i to jest
 * droga dla klawiatury), ale wstawianie w środek wymaga przeciągnięcia.
 *
 * Reguła kształtu z prawdziwego Scratcha pilnuje się sama: kapelusz nie wejdzie w
 * środek stosu, a zwykły klocek nie wejdzie nad kapelusz. Zamiast odmawiać
 * upuszczenia, bench **przyciąga klocek do najbliższego legalnego miejsca i pisze
 * jednym zdaniem, dlaczego** — dziecko dowiaduje się o kształcie palcem, a nie z
 * akapitu, i nie zostaje z klockiem, którego nie da się nigdzie położyć.
 *
 * **Miejsce wstawienia liczy się z położenia klocków, nie ze szczelin między
 * nimi** (indeks = ile klocków ma środek powyżej wskaźnika). Pierwsza wersja
 * rozsuwała szczeliny w trakcie przeciągania i przez to przesuwała cały stos pod
 * palcem — klocek lądował o jedno miejsce wyżej, niż celowało dziecko. Teraz
 * wysokość stosu jest stała: przeciągany klocek wychodzi z niego, a jego miejsce
 * zajmuje **placeholder tej samej wysokości**, który tylko wędruje w górę i w dół.
 *
 * Stosów może być kilka (`stacks`), bo w `FixRun` usterką bywa właśnie to, że
 * klocek leży osobno zamiast być doczepiony — a wtedy zielona flaga go nie
 * uruchamia.
 */

export interface ActiveRange {
  stack: number;
  from: number;
  to: number;
}

interface BenchProps {
  color: string;
  stacks: Block[][];
  onStacksChange: (stacks: Block[][]) => void;
  /** Typy klocków w palecie — lekcja daje tylko te, które są jej potrzebne. */
  available: BlockType[];
  category: Category;
  onCategoryChange: (category: Category) => void;
  /** Podświetlenie wykonywanych instrukcji — tak samo jak w Scratchu. */
  active?: ActiveRange | null;
  /** W czasie biegu programu nie da się przestawiać klocków. */
  locked?: boolean;
  /** Zgłasza dołożenie klocka do skryptu — `pokaz` po tym poznaje wykonanie kroku. */
  onAdd?: (type: BlockType) => void;
  /**
   * Podpisy nad stosami. Od lekcji 26 jeden stos to zwykle **skrypt jednego
   * duszka**, a bez podpisu nie da się powiedzieć, czyj jest — a cała lekcja
   * jest o tym, kto co usłyszał.
   *
   * Podpisy **zatrzymują też sprzątanie pustych stosów**: nazwany stos należy do
   * duszka i musi zostać na planszy nawet pusty, bo inaczej po skasowaniu
   * ostatniego klocka reszta stosów przeskoczyłaby o jedno miejsce i podpisy
   * zaczęłyby kłamać o tym, czyj jest który skrypt.
   */
  stackLabels?: string[];
  scriptHint?: string;
  /**
   * Własny zestaw wartości owalnego pola dla wybranych klocków — kliknięcie przechodzi po
   * nim zamiast po `BLOCKS[…].values`. Dla zadań, w których trzy domyślne czekania (0,5 / 1 / 2 s)
   * nie starczają na tyle różnych chwil, ile jest duszków.
   */
  valueSets?: Partial<Record<BlockType, (string | number)[]>>;
  className?: string;
}

interface DragState {
  block: Block;
  /** Skąd klocek został zdjęty — `null`, gdy przyszedł z palety. */
  origin: { stack: number; index: number } | null;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

const DRAG_THRESHOLD = 6;
/** Dalej niż tyle od szczeliny nie przyciągamy — upuszczenie w próżnię oddaje klocek na miejsce. */
const SNAP_DISTANCE = 140;

export function Bench({
  color,
  stacks,
  onStacksChange,
  available,
  category,
  onCategoryChange,
  active,
  locked,
  onAdd,
  stackLabels,
  scriptHint,
  valueSets,
  className,
}: BenchProps) {
  /**
   * Stan przeciągania żyje w refach, a `useState` służy wyłącznie do rysowania.
   * Bez tego `pointerup` potrafił zobaczyć **poprzednie** miejsce upuszczenia:
   * React aktualizuje stan asynchronicznie, a przy szybkim ruchu palca puszczenie
   * przychodzi, zanim ostatni `pointermove` zdąży się przerysować — klocek wracał
   * wtedy tam, skąd go wzięto. Refy są aktualne natychmiast, więc upuszczenie
   * czyta dokładnie to, co widać na ekranie.
   */
  const dragRef = useRef<DragState | null>(null);
  const dropRef = useRef<{ stack: number; index: number } | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [dropAt, setDropAt] = useState<{ stack: number; index: number } | null>(null);
  const [dropNote, setDropNote] = useState<string | null>(null);
  const stackRefs = useRef(new Map<number, HTMLElement>());
  const blockRefs = useRef(new Map<string, HTMLElement>());
  const pending = useRef<{ block: Block; origin: DragState['origin']; x: number; y: number; rect: DOMRect } | null>(
    null
  );
  const stacksRef = useRef(stacks);
  stacksRef.current = stacks;
  /* Stos z podpisem należy do duszka i zostaje, także pusty (patrz `stackLabels`). */
  const keepEmptyRef = useRef(false);
  keepEmptyRef.current = stackLabels != null;

  /* Efekt z nasłuchem okna podpina się raz, więc callbacki czyta z refów, nie z domknięcia. */
  const onStacksChangeRef = useRef(onStacksChange);
  onStacksChangeRef.current = onStacksChange;
  const onAddRef = useRef(onAdd);
  onAddRef.current = onAdd;

  const setStackRef = useCallback((index: number, node: HTMLElement | null) => {
    if (node) stackRefs.current.set(index, node);
    else stackRefs.current.delete(index);
  }, []);

  const setBlockRef = useCallback((key: string, node: HTMLElement | null) => {
    if (node) blockRefs.current.set(key, node);
    else blockRefs.current.delete(key);
  }, []);

  /**
   * Miejsce, w którym wyląduje przeciągany klocek: najbliższy stos, a w nim tyle
   * pozycji, ile klocków ma środek powyżej wskaźnika. Gdy reguła kształtu nie
   * pozwala tam wejść, przyciągamy do najbliższego legalnego miejsca i oddajemy
   * zdanie wyjaśniające — zamiast po prostu odmówić upuszczenia.
   */
  const findDrop = useCallback((type: BlockType, x: number, y: number) => {
    let stackIndex: number | null = null;
    let bestDistance = SNAP_DISTANCE;
    stackRefs.current.forEach((node, index) => {
      const rect = node.getBoundingClientRect();
      const dx = Math.max(rect.left - x, 0, x - rect.right);
      const dy = Math.max(rect.top - y, 0, y - rect.bottom);
      const distance = Math.hypot(dx, dy);
      if (distance < bestDistance) {
        bestDistance = distance;
        stackIndex = index;
      }
    });
    if (stackIndex === null) return { at: null, note: null };

    const stack = stacksRef.current[stackIndex] ?? [];
    let index = 0;
    for (let i = 0; i < stack.length; i += 1) {
      const node = blockRefs.current.get(`${stackIndex}:${i}`);
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      if (y > rect.top + rect.height / 2) index = i + 1;
    }

    if (BLOCKS[type].shape === 'kapelusz' && hasHat(stack))
      return {
        at: null,
        note: 'Ten stos ma już kapelusz, a dwa kapelusze na jednym słupku się nie zmieszczą.',
      };
    if (!canDrop(stack, index, type)) {
      const snapped = BLOCKS[type].shape === 'kapelusz' ? 0 : 1;
      return {
        at: { stack: stackIndex as number, index: snapped },
        note:
          BLOCKS[type].shape === 'kapelusz'
            ? 'Kapelusz ma zaokrąglony wierzch — wchodzi tylko na samą górę stosu.'
            : 'Nad kapeluszem nic nie wejdzie. Klocek doczepia się pod nim.',
      };
    }
    return { at: { stack: stackIndex as number, index }, note: null };
  }, []);

  const append = useCallback(
    (type: BlockType) => {
      const next = stacksRef.current.map((stack) => [...stack]);
      if (next.length === 0) next.push([]);
      const target = next[0];
      if (BLOCKS[type].shape === 'kapelusz') {
        if (!canDrop(target, 0, type)) return;
        target.unshift(make(type));
      } else {
        target.push(make(type));
      }
      onStacksChange(next);
      onAdd?.(type);
    },
    [onStacksChange, onAdd]
  );

  const appendRef = useRef(append);
  appendRef.current = append;

  /**
   * Owalne pole z wartością leży pośrodku klocka, czyli dokładnie tam, gdzie
   * najnaturalniej się go łapie. Dlatego **nie blokuje przeciągania**: dotknięcie
   * zmienia wartość, a pociągnięcie zabiera cały klocek. Ta flaga pilnuje, żeby
   * kliknięcie kończące przeciągnięcie nie zmieniło przy okazji liczby.
   */
  const justDragged = useRef(false);

  /* Ruch i puszczenie palca obsługujemy na oknie — klocek bywa zdjęty ze stosu, więc element źródłowy znika. */
  useEffect(() => {
    const move = (event: PointerEvent) => {
      const held = pending.current;
      if (!held) return;

      if (!dragRef.current) {
        if (Math.hypot(event.clientX - held.x, event.clientY - held.y) <= DRAG_THRESHOLD) return;
        /* Złapany klocek natychmiast wychodzi ze stosu i idzie za palcem — tak jak w Scratchu. */
        if (held.origin) {
          const next = stacksRef.current.map((stack) => [...stack]);
          next[held.origin.stack].splice(held.origin.index, 1);
          stacksRef.current = next;
          onStacksChangeRef.current(next);
        }
        dragRef.current = {
          block: held.block,
          origin: held.origin,
          x: event.clientX,
          y: event.clientY,
          offsetX: held.x - held.rect.left,
          offsetY: held.y - held.rect.top,
        };
        /*
         * Świadomie BEZ `return`: ten sam ruch musi od razu wyliczyć miejsce
         * upuszczenia. Przeglądarka scala serię szybkich `pointermove` w jedno
         * zdarzenie, więc przy energicznym pociągnięciu palcem bywa, że drugiego
         * ruchu już nie ma — a klocek bez wyliczonego celu wracał tam, skąd go
         * wzięto.
         */
      }

      dragRef.current = { ...dragRef.current, x: event.clientX, y: event.clientY };
      setDrag(dragRef.current);
      const found = findDrop(dragRef.current.block.type, event.clientX, event.clientY);
      dropRef.current = found.at;
      setDropAt(found.at);
      setDropNote(found.note);
    };

    const up = () => {
      const held = pending.current;
      const active = dragRef.current;
      pending.current = null;
      dragRef.current = null;
      justDragged.current = active != null;

      if (!active) {
        /* Palec nie ruszył dalej niż o próg — to było kliknięcie, nie przeciągnięcie. */
        if (held && !held.origin) appendRef.current(held.block.type);
        return;
      }

      /* Upuszczenie w próżnię oddaje klocek tam, skąd go wzięto — nic nie ginie. */
      const target = dropRef.current ?? active.origin;
      if (target) {
        const next = stacksRef.current.map((stack) => [...stack]);
        while (next.length <= target.stack) next.push([]);
        next[target.stack].splice(target.index, 0, active.block);
        const cleaned = keepEmptyRef.current
          ? next
          : next.filter((stack, i) => stack.length > 0 || i === 0);
        stacksRef.current = cleaned;
        onStacksChangeRef.current(cleaned);
        if (dropRef.current && !active.origin) onAddRef.current?.(active.block.type);
      }
      dropRef.current = null;
      setDrag(null);
      setDropAt(null);
      setDropNote(null);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [findDrop]);

  const grab = (
    event: ReactPointerEvent<HTMLElement>,
    block: Block,
    origin: DragState['origin']
  ) => {
    if (locked || event.button !== 0) return;
    justDragged.current = false;
    pending.current = {
      block,
      origin,
      x: event.clientX,
      y: event.clientY,
      rect: event.currentTarget.getBoundingClientRect(),
    };
  };

  const changeValue = (stackIndex: number, blockIndex: number) => {
    if (justDragged.current) return;
    const next = stacks.map((stack) => [...stack]);
    const block = next[stackIndex][blockIndex];
    const set = valueSets?.[block.type];
    const value = set ? set[(set.findIndex((item) => item === block.value) + 1) % set.length] : nextValue(block);
    next[stackIndex][blockIndex] = { ...block, value };
    onStacksChange(next);
  };

  const remove = (stackIndex: number, blockIndex: number) => {
    const next = stacks.map((stack) => [...stack]);
    next[stackIndex].splice(blockIndex, 1);
    onStacksChange(stackLabels ? next : next.filter((stack, i) => stack.length > 0 || i === 0));
  };

  /* Egzemplarze wyłącznie do wyświetlenia — `make()` wołane w renderze kręciłoby licznikiem id. */
  const paletteBlocks = useMemo(
    () => available.filter((type) => BLOCKS[type].category === category).map((type) => make(type)),
    [available, category]
  );

  return (
    <div className={cn('grid gap-3 sm:grid-cols-[minmax(0,190px)_minmax(0,1fr)]', className)}>
      <div>
        <div className="flex flex-wrap gap-1">
          {CATEGORY_ORDER.filter((item) => available.some((type) => BLOCKS[type].category === item)).map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => onCategoryChange(item)}
                className={cn(
                  'inline-flex items-center gap-1 border px-1.5 py-1 text-[11px] font-medium transition',
                  category === item ? 'border-foreground' : 'border-transparent text-muted-foreground'
                )}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: CATEGORIES[item].color }}
                />
                {CATEGORIES[item].label}
              </button>
            )
          )}
        </div>

        <div className="mt-2 space-y-2 border bg-zinc-50 p-2 dark:border-zinc-700 dark:bg-zinc-800/60">
          {paletteBlocks.map((block) => (
            <div
              key={block.id}
              role="button"
              tabIndex={locked ? -1 : 0}
              aria-label={`Dodaj klocek ${BLOCKS[block.type].label.replace('{}', String(block.value ?? ''))}`}
              onPointerDown={(event) => grab(event, make(block.type), null)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                append(block.type);
              }}
              className={cn('block w-fit touch-none', locked ? 'opacity-50' : 'cursor-grab')}
            >
              <BlockChip block={block} />
            </div>
          ))}
          {paletteBlocks.length === 0 && (
            <p className="py-2 text-center text-[11px] text-muted-foreground">
              W tej kategorii nie ma dziś nic do wzięcia.
            </p>
          )}
        </div>
        <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
          Przeciągnij klocek do skryptu albo kliknij — dołączy na końcu.
        </p>
      </div>

      <div className="min-w-0">
        <div
          className={cn(
            'min-h-[190px] border bg-[repeating-linear-gradient(45deg,transparent,transparent_9px,rgba(0,0,0,.025)_9px,rgba(0,0,0,.025)_10px)] p-3 dark:border-zinc-700',
            'dark:bg-[repeating-linear-gradient(45deg,transparent,transparent_9px,rgba(255,255,255,.03)_9px,rgba(255,255,255,.03)_10px)]'
          )}
        >
          {stacks.map((stack, stackIndex) => (
            <div
              key={stackIndex}
              ref={(node) => setStackRef(stackIndex, node)}
              className={cn('min-h-[34px]', stackIndex > 0 && 'mt-6')}
            >
              {stackLabels?.[stackIndex] && (
                <p className="mb-1.5 border-b pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {stackLabels[stackIndex]}
                </p>
              )}
              {Array.from({ length: stack.length + 1 }).map((_slot, slot) => (
                <div key={slot}>
                  {dropAt?.stack === stackIndex && dropAt.index === slot && (
                    <Placeholder color={color} />
                  )}
                  {slot < stack.length && (
                    <div
                      ref={(node) => setBlockRef(`${stackIndex}:${slot}`, node)}
                      onPointerDown={(event) => grab(event, stack[slot], { stack: stackIndex, index: slot })}
                      className={cn('group relative w-fit touch-none', !locked && 'cursor-grab')}
                    >
                      <BlockChip
                        block={stack[slot]}
                        editable={!locked}
                        onValueClick={() => changeValue(stackIndex, slot)}
                        running={
                          active?.stack === stackIndex && slot >= active.from && slot <= active.to
                        }
                      />
                      {!locked && (
                        <button
                          type="button"
                          onClick={() => remove(stackIndex, slot)}
                          onPointerDown={(event) => event.stopPropagation()}
                          aria-label="Usuń klocek"
                          className="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full border bg-white text-zinc-600 shadow-sm group-focus-within:flex group-hover:flex dark:bg-zinc-900"
                        >
                          <X className="h-3 w-3" aria-hidden />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {!drag && stacks.every((stack) => stack.length === 0) && (
            <p className="mt-6 text-center text-xs italic text-muted-foreground">
              {scriptHint ?? 'Tu jest pusto. Weź pierwszy klocek z palety obok.'}
            </p>
          )}
        </div>
        {dropNote && (
          <p className="mt-1.5 text-[11px] leading-snug text-amber-700 dark:text-amber-400">
            {dropNote}
          </p>
        )}
      </div>

      {drag && (
        <div
          className="pointer-events-none fixed z-50 opacity-90"
          style={{ left: drag.x - drag.offsetX, top: drag.y - drag.offsetY }}
        >
          <BlockChip block={drag.block} />
        </div>
      )}
    </div>
  );
}

/**
 * Miejsce, w które wpadnie przeciągany klocek. Ma **stałą wysokość klocka**, więc
 * wysokość stosu nie zmienia się w trakcie przeciągania — dzięki temu granice
 * między klockami nie uciekają spod palca i klocek ląduje tam, gdzie dziecko
 * celuje.
 */
function Placeholder({ color }: { color: string }) {
  return (
    <div
      className="h-[27px] w-[120px] rounded-[3px] border-2 border-dashed"
      style={{ borderColor: color, backgroundColor: `${color}12` }}
      aria-hidden
    />
  );
}

/**
 * Jeden klocek. Kształt niesie regułę: kapelusz ma zaokrąglony wierzch (nic nad
 * niego nie wejdzie), zwykły klocek ma wypustkę u dołu i wcięcie u góry, więc
 * doczepione klocki wyglądają jak jeden słupek.
 */
export function BlockChip({
  block,
  editable,
  onValueClick,
  running,
}: {
  block: Block;
  editable?: boolean;
  onValueClick?: () => void;
  running?: boolean;
}) {
  const def = BLOCKS[block.type];
  const background = CATEGORIES[def.category].color;
  const hat = def.shape === 'kapelusz';
  const [before, after] = def.label.split('{}');

  return (
    <div
      className={cn(
        'relative select-none px-2.5 py-1.5 text-[11px] font-semibold leading-tight text-white shadow-sm sm:text-xs',
        hat ? 'rounded-t-[14px] rounded-b-[3px] pt-2.5' : 'rounded-[3px]'
      )}
      style={{
        backgroundColor: background,
        boxShadow: running ? '0 0 0 3px #ffdd55, 0 0 0 5px rgba(255,200,0,.35)' : undefined,
      }}
    >
      <span className="flex items-center gap-1">
        {block.type === 'flaga' && <MiniFlag />}
        {before}
        {def.values &&
          (editable ? (
            <button
              type="button"
              onClick={onValueClick}
              title="Kliknij, żeby zmienić wartość"
              className="rounded-full bg-white px-2 py-[1px] text-[11px] font-bold text-zinc-800"
            >
              {block.value}
            </button>
          ) : (
            <span className="rounded-full bg-white px-2 py-[1px] text-[11px] font-bold text-zinc-800">
              {block.value}
            </span>
          ))}
        {after}
      </span>
      {/* Wypustka u dołu — po niej poznaje się, że pod klockiem coś jeszcze wejdzie. */}
      <span
        className="absolute left-3 top-full h-[5px] w-5 rounded-b-[3px]"
        style={{ backgroundColor: background, zIndex: 1 }}
        aria-hidden
      />
    </div>
  );
}

function MiniFlag() {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" aria-hidden>
      <path d="M5 3v18" stroke="#2f7a2f" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <path d="M6 4.5h12l-3 3.5 3 3.5H6z" fill="#4cbb17" />
    </svg>
  );
}
