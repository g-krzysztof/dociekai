'use client';

import { useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type RefObject } from 'react';
import { Check, RefreshCw, Wand2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { GEN_H, GEN_W, GenArt, hitBox, layout } from './gen-scene';
import {
  BRIEF,
  SLOTS,
  VALUE_NAME,
  generate,
  matchesBrief,
  parsePrompt,
  slotValue,
  type Picture,
  type SlotId,
} from './generator';

/**
 * Blok 4 — **generator dopowiada to, czego nie powiesz** `[3.6]`.
 *
 * Dwie połowy, dwie umiejętności z wymagania: *formułowanie zapytania*
 * i *sprawdzanie wyniku*.
 *
 * 1. **Ta sama prośba, inny obrazek.** Pole prośby jest na początku zablokowane
 *    na jednym słowie — „lis” — i dziecko naciska „Generuj” kilka razy.
 *    Za każdym razem dostaje co innego, choć napisało to samo, a przy każdym
 *    obrazku stoi, **co generator zgadł sam**. Dopiero potem pole się odblokowuje
 *    i zadanie brzmi: dopisz tyle, żeby nie musiał zgadywać niczego, co jest
 *    w zamówieniu. To jest gest, którego w kursie nie było: *powtórz tę samą
 *    prośbę i patrz, co się zmienia*.
 * 2. **Sprawdź, zanim oddasz.** Z gotowej prośby generator robi cztery wersje,
 *    z których dwie mają błąd — trzy lisy zamiast dwóch, lis z otwartymi oczami.
 *    Prawdziwe generatory mylą się dokładnie tak: pewnym tonem, w szczególe.
 *    Dziecko stuka błąd na obrazku albo zatwierdza wersję jako zgodną.
 *    Zatwierdzenie wersji z błędem nie blokuje — odsłania błąd i mówi, że
 *    ten obrazek poszedłby do siostry; blok kończy się po ocenie wszystkich
 *    czterech, a przepuszczony błąd daje „sprawdź jeszcze raz”.
 *
 * Klamra z blokiem 3: tam maszyna nie miała przycisku „nie wiem”, tu generator
 * nie ma przycisku „nie jestem pewien” — w obu przypadkach sprawdza człowiek.
 */

const LOCKED_PROMPT = 'lis';
const WARMUP = 3;

interface Generation {
  picture: Picture;
  guessed: SlotId[];
  prompt: string;
}

type Mistake = 'count' | 'awake' | null;

interface Variant {
  picture: Picture;
  mistake: Mistake;
}

/** `missed` — dziecko zatwierdziło wersję z błędem; błąd wychodzi wtedy na obrazku. */
type VariantState = 'open' | 'ok' | 'found' | 'missed';

export function PromptLab({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [prompt, setPrompt] = useState(LOCKED_PROMPT);
  const [history, setHistory] = useState<Generation[]>([]);
  const [stage, setStage] = useState<'prompt' | 'check' | 'done'>('prompt');
  const seed = useRef(1);
  const anchor = useSectionScrollAnchor(stage);

  const parsed = useMemo(() => parsePrompt(prompt), [prompt]);
  const unlocked = history.length >= WARMUP;
  const complete = matchesBrief(parsed.request);
  const latest = history[0];
  const generatedComplete = latest && matchesBrief(parsePrompt(latest.prompt).request);

  const run = () => {
    if (!prompt.trim()) return;
    seed.current += 1;
    const { picture, guessed } = generate(parsed.request, seed.current * 7919 + 13, parsed.many);
    setHistory((all) => [{ picture, guessed, prompt }, ...all].slice(0, 8));
  };

  const variants = useMemo<Variant[]>(() => {
    const make = (offset: number, mistake: Mistake): Variant => {
      const { picture } = generate(BRIEF, 5000 + offset * 131);
      if (mistake === 'count') return { picture: { ...picture, count: 3 }, mistake };
      if (mistake === 'awake') return { picture: { ...picture, awake: 1 }, mistake };
      return { picture, mistake };
    };
    return [make(1, null), make(2, 'awake'), make(3, null), make(4, 'count')];
  }, []);

  return (
    <div className="border bg-white dark:bg-zinc-900/80">
      <div className="border-b p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          Zamówienie od młodszej siostry
        </p>
        <p className="mt-1 text-base font-semibold leading-snug sm:text-lg">
          „Zrób mi obrazek do bajki na dobranoc: dwa lisy śpią pod drzewem, zimą, w nocy.”
        </p>
      </div>

      {stage === 'prompt' && (
        <div ref={anchor} className="p-5 sm:p-6">
          <p className="mb-3 text-sm leading-relaxed sm:text-base">
            {unlocked ? (
              <>
                Za każdym razem inny obrazek — a napisałeś/napisałaś to samo. Wszystko, czego nie ma w prośbie, generator{' '}
                <strong>zgadł sam</strong>. Teraz <strong>dopisz tyle</strong>, żeby nie musiał zgadywać niczego, co jest w
                zamówieniu.
              </>
            ) : (
              <>
                To jest mały generator obrazków. Na razie w prośbie jest jedno słowo. Naciśnij <strong>Generuj</strong>{' '}
                {WARMUP} razy i porównaj, co dostajesz ({history.length} z {WARMUP}).
              </>
            )}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') run();
              }}
              readOnly={!unlocked}
              aria-label="Prośba do generatora"
              className={cn(
                'min-w-0 flex-1 border bg-transparent px-3 py-2 text-base outline-none focus:border-current',
                !unlocked && 'cursor-not-allowed bg-muted/40 text-muted-foreground'
              )}
              style={{ caretColor: color }}
              placeholder="napisz, co ma być na obrazku"
            />
            <button
              type="button"
              onClick={run}
              disabled={!prompt.trim()}
              className="inline-flex cursor-pointer items-center justify-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: color, color }}
            >
              <Wand2 className="h-4 w-4" aria-hidden />
              Generuj
            </button>
          </div>

          {unlocked && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {SLOTS.map((slot) => {
                const value = slotValue(slot.id, parsed.request);
                const wanted = VALUE_NAME[slot.id][String(BRIEF[slot.id])];
                const right = value !== null && parsed.request[slot.id] === BRIEF[slot.id];
                return (
                  <span
                    key={slot.id}
                    className={cn('border px-2 py-0.5 text-xs', value === null && 'border-dashed text-muted-foreground')}
                    style={
                      right
                        ? { borderColor: color, color }
                        : value !== null
                          ? { borderColor: '#d97706', color: '#b45309' }
                          : undefined
                    }
                  >
                    {slot.name}: {value ?? (slot.id === 'count' && parsed.many ? 'więcej niż jedno — ile, zgadnie sam' : 'zgadnie sam')}
                    {value !== null && !right && ` — a w zamówieniu: ${wanted}`}
                  </span>
                );
              })}
            </div>
          )}

          {parsed.unknown.length > 0 && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Tych słów mój mały generator nie zna, więc je pomija: {parsed.unknown.map((word) => `„${word}”`).join(', ')}.
            </p>
          )}

          {parsed.negated.length > 0 && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Tego nie biorę pod uwagę: {parsed.negated.map((phrase) => `„${phrase}”`).join(', ')}. Generatory często mylą
              się przy „nie” — pewniej jest napisać, co <strong>ma być</strong> na obrazku.
            </p>
          )}

          {unlocked && complete && !generatedComplete && (
            <p className="mt-3 text-sm font-semibold" style={{ color }}>
              W prośbie jest już wszystko z zamówienia — naciśnij Generuj i sprawdź obrazek.
            </p>
          )}

          {latest && (
            <div className="mt-5">
              <GenFrame picture={latest.picture} className="max-w-[520px]" />
              <ResultLine generation={latest} color={color} />
            </div>
          )}

          {history.length > 1 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                wcześniejsze obrazki
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {history.slice(1).map((item, index) => (
                  <div key={index} className="w-[120px] shrink-0">
                    <GenFrame picture={item.picture} />
                    <p className="mt-1 truncate text-[11px] text-muted-foreground" title={item.prompt}>
                      „{item.prompt}”
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unlocked && complete && generatedComplete && (
            <div className="mt-5 p-4 text-sm leading-relaxed" style={{ backgroundColor: `${color}12` }}>
              <p>
                <strong>Wszystko z zamówienia jest teraz w prośbie.</strong> Generator dalej zmienia to, czego nie
                napisałeś/napisałaś — gdzie stoi drzewo, ile jest gwiazd — ale tego siostra nie zamawiała. Zamówione rzeczy
                już się nie zmieniają.
              </p>
              <button
                type="button"
                onClick={() => setStage('check')}
                className="mt-3 inline-flex cursor-pointer items-center gap-2 border bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted dark:bg-zinc-900"
                style={{ borderColor: color, color }}
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Poproś o cztery wersje do wyboru
              </button>
            </div>
          )}
        </div>
      )}

      {stage !== 'prompt' && (
        <CheckVariants
          anchor={anchor}
          variants={variants}
          color={color}
          done={stage === 'done'}
          onDone={() => {
            setStage('done');
            onComplete?.();
          }}
        />
      )}
    </div>
  );
}

function GenFrame({ picture, className }: { picture: Picture; className?: string }) {
  return (
    <div className={cn('relative mx-auto w-full overflow-hidden border', className)} style={{ aspectRatio: `${GEN_W} / ${GEN_H}` }}>
      <GenArt picture={picture} className="absolute inset-0" />
    </div>
  );
}

/**
 * Co wyszło — porównane z zamówieniem siostry, nie tylko z prośbą.
 *
 * Samo „nic nie było zgadywane” brzmiało jak sukces także wtedy, gdy prośba
 * mówiła „jeden lis”: generator narysował dokładnie to, co napisane, blok nie
 * szedł dalej, a jedynym śladem był pomarańczowy znaczek nad polem. Dlatego
 * rzeczy napisane inaczej niż w zamówieniu są tu nazwane wprost — i to jest
 * zdanie lekcji: maszyna robi to, co powiesz, nie to, co masz na myśli.
 */
function ResultLine({ generation, color }: { generation: Generation; color: string }) {
  const { picture, guessed } = generation;
  const off = SLOTS.filter((slot) => !guessed.includes(slot.id) && picture[slot.id] !== BRIEF[slot.id]);
  const offList = off
    .map((slot) => `${slot.name} — w prośbie „${slotValue(slot.id, picture)}”, w zamówieniu „${slotValue(slot.id, BRIEF)}”`)
    .join('; ');

  if (guessed.length === 0 && off.length === 0) {
    return (
      <p className="mt-2 text-center text-xs" style={{ color }}>
        Nic nie było zgadywane — wszystko, co tu widać, było w prośbie.
      </p>
    );
  }
  if (guessed.length === 0) {
    return (
      <p className="mx-auto mt-3 max-w-[520px] border border-amber-600/40 bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <strong>Generator niczego nie zgadywał</strong> — narysował dokładnie to, co jest w prośbie. Ale siostra zamówiła
        co innego: {offList}. Popraw prośbę i wygeneruj jeszcze raz.
      </p>
    );
  }
  return (
    <div className="mt-2 space-y-1 text-center text-xs leading-relaxed text-muted-foreground">
      <p>
        <span className="font-semibold">Zgadnięte przez generator:</span>{' '}
        {guessed.map((slot) => `${SLOTS.find((s) => s.id === slot)?.name} (${slotValue(slot, picture)})`).join(', ')}
      </p>
      {off.length > 0 && (
        <p className="text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Napisane inaczej niż w zamówieniu:</span> {offList}.
        </p>
      )}
    </div>
  );
}

/**
 * Gdzie na obrazku jest błąd wersji — ta sama geometria, z której go rysujemy.
 * Nadmiarowe lisy to błąd całej gromadki, nie jednego lisa, więc przy „trzech
 * zamiast dwóch” liczy się stuknięcie gdziekolwiek w rząd zwierząt; stojący
 * lis to błąd jednego zwierzęcia.
 */
function mistakeBox(variant: Variant) {
  const boxes = layout(variant.picture).animals.map((placed) => hitBox(placed, 12));
  if (variant.mistake === 'awake') return boxes[variant.picture.awake ?? 0];
  return {
    left: Math.max(4, Math.min(...boxes.map((b) => b.left))),
    right: Math.min(GEN_W - 4, Math.max(...boxes.map((b) => b.right))),
    top: Math.min(...boxes.map((b) => b.top)),
    bottom: Math.min(GEN_H - 4, Math.max(...boxes.map((b) => b.bottom))),
  };
}

/** Które zwierzę stuknięto: najbliższe, jeśli palec trafił w kilka obrysów naraz. */
function tappedAnimal(picture: Picture, x: number, y: number) {
  let best = -1;
  let bestDistance = Infinity;
  layout(picture).animals.forEach((placed, index) => {
    const b = hitBox(placed, 12);
    if (x < b.left || x > b.right || y < b.top || y > b.bottom) return;
    const distance = Math.hypot(x - placed.x, y - (placed.y - 24));
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

const MISSED_NOTE: Record<NonNullable<Mistake>, string> = {
  count: 'Zatwierdzone — a lisy są tu trzy, siostra zamówiła dwa. Generator nie powiedział o tym ani słowa, więc ten obrazek poszedłby do niej z błędem.',
  awake: 'Zatwierdzone — a jeden lis stoi i ma otwarte oczy, choć w zamówieniu oba śpią. Generator nic o tym nie powiedział, więc ten obrazek poszedłby do siostry z błędem.',
};

function CheckVariants({
  anchor,
  variants,
  color,
  done,
  onDone,
}: {
  anchor: RefObject<HTMLDivElement | null>;
  variants: Variant[];
  color: string;
  done: boolean;
  onDone: () => void;
}) {
  const [states, setStates] = useState<VariantState[]>(variants.map(() => 'open'));
  const [notes, setNotes] = useState<(string | null)[]>(variants.map(() => null));
  const missed = states.filter((state) => state === 'missed').length;
  const settled = states.every((state) => state !== 'open');

  const note = (index: number, text: string) => setNotes((all) => all.map((value, i) => (i === index ? text : value)));

  const settle = (index: number, state: VariantState, text: string) => {
    const nextStates = states.map((value, i) => (i === index ? state : value));
    setStates(nextStates);
    note(index, text);
    if (nextStates.every((value) => value !== 'open') && !done) onDone();
  };

  const tap = (index: number, event: ReactMouseEvent<HTMLDivElement>) => {
    if (states[index] !== 'open') return;
    const variant = variants[index];
    const box = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * GEN_W;
    const y = ((event.clientY - box.top) / box.height) * GEN_H;
    const hit = tappedAnimal(variant.picture, x, y);

    if (variant.mistake) {
      const b = mistakeBox(variant);
      const onMistake = x >= b.left && x <= b.right && y >= b.top && y <= b.bottom;
      if (variant.mistake === 'count' && onMistake) {
        settle(index, 'found', 'Tak — lisy są trzy, a siostra zamówiła dwa. Generator policzył źle i nic nie powiedział.');
        return;
      }
      if (variant.mistake === 'awake' && hit === variant.picture.awake) {
        settle(index, 'found', 'Tak — ten lis ma otwarte oczy i stoi. W zamówieniu oba śpią.');
        return;
      }
    }
    note(
      index,
      hit >= 0
        ? 'Ten lis jest w porządku: leży i ma zamknięte oczy.'
        : 'W tym miejscu wszystko zgadza się z zamówieniem. Stuknij w błąd, jeśli go widzisz — albo zatwierdź obrazek przyciskiem pod nim.'
    );
  };

  /**
   * Zatwierdzenie wersji z błędem nie jest blokadą, tylko skutkiem: błąd
   * wychodzi na obrazku, a obrazek „poszedłby do siostry”. Wcześniej był tu
   * sam komunikat „przyjrzyj się jeszcze raz” — kolejne kliknięcia nic nie
   * zmieniały i blok stał, a strona nie mówiła, że błąd trzeba stuknąć.
   */
  const approve = (index: number) => {
    if (states[index] !== 'open') return;
    const mistake = variants[index].mistake;
    if (mistake) settle(index, 'missed', MISSED_NOTE[mistake]);
    else settle(index, 'ok', 'Zgadza się: dwa lisy, śpią, pod drzewem, zima, noc.');
  };

  const again = () => {
    setStates(variants.map(() => 'open'));
    setNotes(variants.map(() => null));
  };

  return (
    <div ref={anchor} className="p-5 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Generator zrobił cztery wersje w sekundę. <strong>Nie wszystkie są dobre</strong> — generatory mylą się w
        szczegółach i nigdy o tym nie mówią. Sprawdź każdą z zamówieniem: jeśli widzisz błąd,{' '}
        <strong>stuknij go na obrazku</strong>; jeśli wszystko się zgadza, zatwierdź.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {variants.map((variant, index) => {
          const state = states[index];
          const marked = state === 'found' || state === 'missed';
          const b = marked ? mistakeBox(variant) : null;
          return (
            <div key={index} className="border p-3" style={state !== 'open' ? { borderColor: state === 'missed' ? '#d97706' : color } : undefined}>
              <p className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>wersja {index + 1}</span>
                {state === 'ok' && (
                  <span className="inline-flex items-center gap-1" style={{ color }}>
                    <Check className="h-3.5 w-3.5" aria-hidden /> zgodna
                  </span>
                )}
                {state === 'found' && (
                  <span className="inline-flex items-center gap-1" style={{ color }}>
                    <X className="h-3.5 w-3.5" aria-hidden /> błąd znaleziony
                  </span>
                )}
                {state === 'missed' && (
                  <span className="inline-flex items-center gap-1 text-amber-700">
                    <X className="h-3.5 w-3.5" aria-hidden /> błąd przepuszczony
                  </span>
                )}
              </p>
              <div
                role="button"
                tabIndex={-1}
                aria-label={`Wersja ${index + 1} — stuknij w miejsce, w którym widzisz błąd`}
                onClick={(event) => tap(index, event)}
                className={cn('relative w-full overflow-hidden border', state === 'open' ? 'cursor-crosshair' : 'cursor-default')}
                style={{ aspectRatio: `${GEN_W} / ${GEN_H}` }}
              >
                <GenArt picture={variant.picture} className="absolute inset-0" />
                {b && (
                  <svg viewBox={`0 0 ${GEN_W} ${GEN_H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
                    <rect
                      x={b.left}
                      y={b.top}
                      width={b.right - b.left}
                      height={b.bottom - b.top}
                      rx={14}
                      fill="none"
                      stroke={state === 'missed' ? '#f59e0b' : color}
                      strokeWidth={3}
                      strokeDasharray="7 5"
                    />
                  </svg>
                )}
              </div>
              {state === 'open' && (
                <button
                  type="button"
                  onClick={() => approve(index)}
                  className="mt-2 inline-flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted"
                  style={{ borderColor: color, color }}
                >
                  <Check className="h-3.5 w-3.5" aria-hidden />
                  zgodna z zamówieniem
                </button>
              )}
              {notes[index] && <p className="mt-2 text-xs leading-relaxed">{notes[index]}</p>}
            </div>
          );
        })}
      </div>

      {done && settled && (
        <div className="mt-5 space-y-2 p-4 text-sm leading-relaxed sm:text-base" style={{ backgroundColor: `${color}12` }}>
          {missed === 0 ? (
            <p>
              <strong>Dwie wersje dobre, dwie z błędem — oba błędy złapane.</strong> Generator zrobił je w sekundę, ale to
              ty wiesz, która się nadaje — i to ty za nią odpowiadasz, bo to ty dajesz ją siostrze.
            </p>
          ) : (
            <p>
              <strong>
                Dwie wersje dobre, dwie z błędem — i {missed === 1 ? 'jeden błąd przeszedł' : 'oba błędy przeszły'}{' '}
                niezauważone.
              </strong>{' '}
              Tak właśnie mylą się generatory: pewnym tonem, w drobiazgu, bez słowa ostrzeżenia. Dlatego każdą wersję
              sprawdza się z zamówieniem, zanim się ją komuś da.
            </p>
          )}
          <p>
            Tak działa każde narzędzie, które tworzy obrazki albo teksty: <strong>to, czego nie powiesz, dopowie samo</strong>,
            a to, co zrobi, trzeba sprawdzić. I jeszcze jedno — obrazek z generatora podpisuje się uczciwie:{' '}
            <em>„wygenerowane przez AI”</em>.
          </p>
          {missed > 0 && (
            <button
              type="button"
              onClick={again}
              className="inline-flex cursor-pointer items-center gap-2 border bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted dark:bg-zinc-900"
              style={{ borderColor: color, color }}
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Sprawdź jeszcze raz
            </button>
          )}
        </div>
      )}
    </div>
  );
}
