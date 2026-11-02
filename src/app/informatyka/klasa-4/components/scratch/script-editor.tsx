'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import { DragGhost, LooseBlock, Script, Slot } from './loop-stack';
import { BLOCKS, make, nextValue, type Block, type BlockType } from './engine';

/**
 * Edytor skryptu **z klockami obejmującymi** — pętla, w niej „jeżeli”, a w nim
 * „w przeciwnym razie”. `Bench` jest płaski i to jest jego decyzja (patrz
 * `loop-stack.tsx`), więc zadania, w których dziecko układa drzewo, dostają ten
 * edytor: skrypt to drzewo, a upuszczać można w każdą paszczę (`data-slot`) i pod
 * cały skrypt.
 *
 * **Wypromowany z `petle-i-warunki/walk-studio.tsx` przy lekcji 28** — drugiej,
 * której zadanie składa się z zagnieżdżonych klocków („promote on second use”).
 * Przy okazji nauczył się drugiej paszczy, bo robot z lekcji 28 jedzie tylko
 * wtedy, gdy mety jeszcze nie dotyka.
 *
 * Trzy gesty składają się na jedną pracę i wszystkie trzy istnieją w Scratchu:
 * przeciągnięcie klocka z palety w przerywane miejsce, wyciągnięcie klocka ze
 * skryptu **razem z wnętrzem** (puszczony poza skryptem znika) i kliknięcie
 * owalnego pola, żeby zmienić wartość. Stuknięcie klocka w palecie, a potem
 * miejsca w skrypcie, robi to samo co przeciągnięcie — dla dotyku i klawiatury.
 *
 * **Kapelusz stoi na sztywno** (`stack[0]`): zadania, do których ten edytor
 * służy, są o tym, *gdzie względem pętli leży klocek*, nie o kapeluszach.
 *
 * Ścieżki gniazd: `root` to miejsce pod całym skryptem, `"1.0"` — pierwsza
 * paszcza klocka o tej ścieżce, `"1.0!"` — jego druga paszcza.
 */

export interface PaletteItem {
  type: BlockType;
  value?: string | number;
  /**
   * Podpis pod klockiem w palecie. Paleta rysuje sam nagłówek klocka, więc
   * „jeżeli” i „jeżeli … w przeciwnym razie” wyglądają w niej tak samo — podpis
   * mówi, ile mają części.
   */
  note?: string;
}

/** Gniazdo pod całym skryptem; gniazda w paszczach noszą ścieżkę klocka. */
export const ROOT = 'root';

/** Ile pikseli trzeba przesunąć wskaźnik, żeby stuknięcie w klocek stało się jego wyciąganiem. */
const THRESHOLD = 6;

interface Drag {
  block: Block;
  /** Z palety — wtedy `from` jest puste. */
  item: PaletteItem | null;
  /** Ścieżka w skrypcie, jeśli klocek chwycono ze skryptu. */
  from: string | null;
  x: number;
  y: number;
  x0: number;
  y0: number;
  moved: boolean;
}

/* ------------------------------------------------------------------ */
/* Drzewo skryptu                                                      */
/* ------------------------------------------------------------------ */

/** Numer klocka w ścieżce: `"0!"` to klocek nr 0, którego DRUGĄ paszczę mamy zejść. */
function indexOf(part: string): number {
  return Number.parseInt(part, 10);
}

/** Klocek pod ścieżką `"2.0.1"` — kolejne liczby to indeksy w kolejnych paszczach. */
export function findBlock(blocks: Block[], path: string): Block | null {
  let list: Block[] | undefined = blocks;
  let block: Block | null = null;
  for (const part of path.split('.')) {
    block = list?.[indexOf(part)] ?? null;
    if (!block) return null;
    list = part.endsWith('!') ? block.inner2 : block.inner;
  }
  return block;
}

/** Wyjmuje klocek razem z jego wnętrzem — **zmienia** podane drzewo, więc wołaj na kopii. */
function takeBlock(blocks: Block[], path: string): Block | null {
  const parts = path.split('.');
  const index = indexOf(parts.pop() ?? '');
  let list: Block[] | undefined = blocks;
  for (const part of parts) {
    const owner: Block | undefined = list?.[indexOf(part)];
    list = part.endsWith('!') ? owner?.inner2 : owner?.inner;
  }
  return list?.splice(index, 1)[0] ?? null;
}

/** Lista, do której wpada klocek upuszczony w gnieździe: cały skrypt, pierwsza albo druga paszcza. */
function mouthOf(blocks: Block[], slot: string): Block[] | null {
  if (slot === ROOT) return blocks;
  const otherwise = slot.endsWith('!');
  const owner = findBlock(blocks, otherwise ? slot.slice(0, -1) : slot);
  return (otherwise ? owner?.inner2 : owner?.inner) ?? null;
}

/** Czy w drzewie (także w obu paszczach) stoi klocek danego typu. */
export function contains(blocks: Block[], type: BlockType): boolean {
  return blocks.some(
    (block) =>
      block.type === type ||
      (block.inner ? contains(block.inner, type) : false) ||
      (block.inner2 ? contains(block.inner2, type) : false)
  );
}

/* ------------------------------------------------------------------ */
/* Stan edytora                                                        */
/* ------------------------------------------------------------------ */

interface EditorOptions {
  /** Skrypt razem z kapeluszem na wierzchu. Stan trzyma zadanie, nie edytor. */
  stack: Block[];
  /** Nowe drzewo po każdej zmianie — zadanie zapisuje je i, zwykle, zeruje odtwarzacz. */
  onChange: (next: Block[]) => void;
  /** Własne zestawy wartości owalnych pól (np. czujniki, które w tej scenie mają sens). */
  valueSets?: Partial<Record<BlockType, (string | number)[]>>;
}

export function useScriptEditor({ stack, onChange, valueSets }: EditorOptions) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const [armed, setArmed] = useState<PaletteItem | null>(null);

  /* Najświeższy skrypt dla obsługi wskaźnika — okno nasłuchuje przez cały gest i nie może widzieć starego stanu. */
  const latest = useRef(stack);
  const dragRef = useRef<Drag | null>(null);
  const zone = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    latest.current = stack;
  }, [stack]);

  const commit = useCallback(
    (next: Block[]) => {
      latest.current = next;
      onChange(next);
    },
    [onChange]
  );

  /** Które gniazdo jest pod wskaźnikiem — najbliższe środkowi, z marginesem na palec. */
  const slotAt = useCallback((x: number, y: number): string | null => {
    const near = 18;
    let best: string | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const node of Array.from(
      zone.current?.querySelectorAll<HTMLElement>('[data-slot]') ?? []
    )) {
      const rect = node.getBoundingClientRect();
      if (
        x < rect.left - near ||
        x > rect.right + near ||
        y < rect.top - near ||
        y > rect.bottom + near
      )
        continue;
      const distance = Math.hypot(
        x - (rect.left + rect.right) / 2,
        y - (rect.top + rect.bottom) / 2
      );
      if (distance < bestDistance) {
        best = node.dataset.slot ?? null;
        bestDistance = distance;
      }
    }
    return best;
  }, []);

  /** Klocek na koniec listy w podanym gnieździe. */
  const place = useCallback(
    (block: Block, target: string) => {
      const next = structuredClone(latest.current);
      const list = mouthOf(next, target);
      if (!list) return;
      list.push(block);
      setArmed(null);
      commit(next);
    },
    [commit]
  );

  /** Wyciągnięcie klocka ze skryptu — od tej chwili niesie go palec. */
  const lift = useCallback(
    (path: string) => {
      const next = structuredClone(latest.current);
      takeBlock(next, path);
      commit(next);
    },
    [commit]
  );

  const dragging = drag !== null;

  useEffect(() => {
    if (!dragging) return;

    const move = (event: PointerEvent) => {
      const current = dragRef.current;
      if (!current) return;
      const moved =
        current.moved ||
        Math.hypot(event.clientX - current.x0, event.clientY - current.y0) >= THRESHOLD;
      if (moved && !current.moved && current.from !== null) lift(current.from);
      const next = { ...current, x: event.clientX, y: event.clientY, moved };
      dragRef.current = next;
      setDrag(next);
    };

    const end = (event: PointerEvent, drop: boolean) => {
      const current = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!current) return;
      const target = drop ? slotAt(event.clientX, event.clientY) : null;

      if (current.item) {
        const item = current.item;
        /* Stuknięcie bez ruchu wybiera klocek, a nie upuszcza go. */
        if (!current.moved) setArmed((previous) => (previous?.type === item.type ? null : item));
        else if (target) place(current.block, target);
        return;
      }
      /* Klocek wyciągnięty ze skryptu: puszczony w gnieździe wraca do gry, puszczony poza skryptem znika. */
      if (current.moved && target) place(current.block, target);
    };

    const up = (event: PointerEvent) => end(event, true);
    const cancel = (event: PointerEvent) => end(event, false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
  }, [dragging, lift, place, slotAt]);

  const begin = (next: Drag) => {
    dragRef.current = next;
    setDrag(next);
  };

  const grab = (item: PaletteItem) => (event: ReactPointerEvent) => {
    event.preventDefault();
    begin({
      block: make(item.type, item.value),
      item,
      from: null,
      x: event.clientX,
      y: event.clientY,
      x0: event.clientX,
      y0: event.clientY,
      moved: false,
    });
  };

  const pick = (path: string, block: Block, event: ReactPointerEvent) => {
    /* Kapelusz stoi na sztywno. */
    if (path === '0') return;
    begin({
      block,
      item: null,
      from: path,
      x: event.clientX,
      y: event.clientY,
      x0: event.clientX,
      y0: event.clientY,
      moved: false,
    });
  };

  const cycle = (path: string) => {
    const next = structuredClone(latest.current);
    const block = findBlock(next, path);
    if (!block) return;
    block.value = nextValue(block, valueSets?.[block.type]);
    commit(next);
  };

  const toggleArmed = (item: PaletteItem) =>
    setArmed((previous) => (previous?.type === item.type ? null : item));

  const insertArmed = (target: string) => {
    if (armed) place(make(armed.type, armed.value), target);
  };

  /** Zostaje sam kapelusz. */
  const empty = () => commit(latest.current.slice(0, 1));

  return { drag, armed, setArmed, zone, grab, pick, cycle, toggleArmed, insertArmed, empty };
}

export type ScriptEditorState = ReturnType<typeof useScriptEditor>;

/* ------------------------------------------------------------------ */
/* Rysunek                                                             */
/* ------------------------------------------------------------------ */

interface ScriptEditorProps {
  editor: ScriptEditorState;
  stack: Block[];
  color: string;
  /** Klocki do wzięcia — stała poza komponentem, żeby próbki nie powstawały co klatkę. */
  palette: PaletteItem[];
  title?: string;
  /** Doklejone między skryptem a paletą — u nas przycisk „Uruchom i pokaż na scenie” dla wąskiego ekranu. */
  afterScript?: ReactNode;
  className?: string;
}

export function ScriptEditor({
  editor,
  stack,
  color,
  palette,
  title = 'Skrypt duszka',
  afterScript,
  className,
}: ScriptEditorProps) {
  const { drag, armed } = editor;
  const active = Boolean(drag || armed);
  const capped = stack[stack.length - 1]?.type === 'zawsze';
  const forever = contains(stack, 'zawsze');

  const samples = useMemo(
    () => palette.map((item) => ({ item, sample: make(item.type, item.value) })),
    [palette]
  );

  const mouth = (path: string, filled: boolean) => (
    <div data-slot={path}>
      <Slot
        color={color}
        label={filled ? 'dołóż na koniec' : 'upuść klocki tutaj'}
        active={active}
        onClick={armed ? () => editor.insertArmed(path) : undefined}
      />
    </div>
  );

  return (
    <div ref={editor.zone} className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
        {title}
      </p>
      <div className="mt-2 overflow-x-auto pb-1">
        <Script
          blocks={stack}
          editable
          onValueClick={(path) => editor.cycle(path)}
          onBlockDown={editor.pick}
          renderMouth={(path, block) => mouth(path, (block.inner?.length ?? 0) > 0)}
          renderElseMouth={(path, block) => mouth(`${path}!`, (block.inner2?.length ?? 0) > 0)}
          footer={
            capped ? (
              <p className="mt-1.5 max-w-[240px] text-[10px] leading-tight text-muted-foreground">
                Pod pętlą „zawsze” nic się nie wykona, więc nie ma tu miejsca na kolejny klocek.
              </p>
            ) : (
              <div data-slot={ROOT} className="mt-1">
                <Slot
                  color={color}
                  label={
                    stack.length === 1 ? 'upuść pierwszy klocek pod flagą' : 'dołóż na koniec skryptu'
                  }
                  active={active}
                  onClick={armed ? () => editor.insertArmed(ROOT) : undefined}
                />
              </div>
            )
          }
        />
      </div>

      {afterScript}

      <div className="mt-4 border-t pt-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
          Klocki do wzięcia
        </p>
        <div className="flex flex-wrap gap-2">
          {samples.map(({ item, sample }) => {
            const chosen = armed?.type === item.type;
            const label = BLOCKS[item.type].label.replace('{}', String(sample.value ?? ''));
            return (
              <div
                key={item.type}
                role="button"
                tabIndex={0}
                aria-label={`Wybierz klocek: ${label}${item.note ? ` (${item.note})` : ''}`}
                aria-pressed={chosen}
                onKeyDown={(event: KeyboardEvent) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  editor.toggleArmed(item);
                }}
                className={cn('rounded-[3px] outline-offset-2', chosen && 'outline outline-2')}
                style={chosen ? { outlineColor: color } : undefined}
              >
                <LooseBlock
                  block={sample}
                  grabbed={drag?.item?.type === item.type}
                  onPointerDown={editor.grab(item)}
                />
                {item.note && (
                  <span className="mt-0.5 block max-w-[190px] text-[10px] leading-tight text-muted-foreground">
                    {item.note}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {armed ? (
            <>
              Wybrany klocek czeka w ręku —{' '}
              <strong className="text-foreground">stuknij przerywane miejsce</strong> w skrypcie,
              żeby go tam włożyć.
            </>
          ) : (
            <>Możesz też stuknąć klocek, a potem miejsce w skrypcie — to samo, co przeciągnięcie.</>
          )}
        </p>
        {stack.length > 1 && (
          <button
            type="button"
            onClick={editor.empty}
            className="mt-3 cursor-pointer border px-3 py-1.5 text-xs transition-colors hover:bg-muted/50"
          >
            opróżnij skrypt
          </button>
        )}
        {forever && (
          <p
            className="mt-3 border-l-2 pl-2 text-[11px] leading-snug text-muted-foreground"
            style={{ borderColor: color }}
          >
            Pętla „zawsze” nie kończy się sama — zatrzymaj program czerwonym znakiem, kiedy
            zobaczysz już dość.
          </p>
        )}
      </div>

      {drag && (drag.moved || drag.item) && <DragGhost block={drag.block} x={drag.x} y={drag.y} />}
    </div>
  );
}
