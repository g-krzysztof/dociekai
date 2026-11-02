'use client';

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { GreenFlag, StopSign } from '../../scratch/stage-view';
import { useProgram } from '../../scratch/use-program';
import { HOME, make, type Block, type Sprite } from '../../scratch/engine';
import { Script } from '../../scratch/loop-stack';

/**
 * „Klatka po klatce” — animacja jako pętla, w której coś się zmienia i coś czeka.
 *
 * Widżet ma dwa pokrętła i **żadnego pola wyboru**: dziecko przestawia klatki w
 * pasku palcem i przeciąga suwak czasu. Obie rzeczy działają na żywo, w trakcie
 * biegu programu, więc różnicę między animacją a miganiem widać w tej samej
 * sekundzie, w której się ją ustawia.
 *
 * **Skrypt jest prawdziwy, nie narysowany.** To ten sam `zawsze [następny
 * kostium, czekaj X s]`, który silnik naprawdę wykonuje — suwak przestawia
 * wartość w klocku, a nie osobną zmienną widżetu. Bez tego lekcja mówiłaby
 * „animacja to pętla”, a pokazywała odtwarzacz.
 *
 * Dwie rzeczy, które ten blok ma powiedzieć i obie wychodzą z pomiaru, nie z
 * akapitu:
 *
 * 1. **Bez czekania nie ma animacji.** Przy zerowym czekaniu pętla i tak oddaje
 *    ekran raz na obieg (Scratch robi to samo), więc klatki lecą 25 razy na
 *    sekundę i zlewają się w migotanie. Licznik klatek na sekundę stoi obok.
 * 2. **`zawsze` nie kończy się samo.** Makieta ścina pokaz po kilkunastu
 *    sekundach i mówi o tym wprost — w Scratchu program kręciłby się do
 *    czerwonego znaku stop.
 */

/** Cztery klatki odbijającej się piłki — kanoniczne ćwiczenie animacji. */
const FRAMES = [
  { id: 'gora', name: 'u góry', cy: 26, rx: 21, ry: 21 },
  { id: 'lot', name: 'w locie', cy: 56, rx: 18, ry: 25 },
  { id: 'ziemia', name: 'przy ziemi', cy: 86, rx: 28, ry: 12 },
  { id: 'odbicie', name: 'odbija się', cy: 58, rx: 16, ry: 28 },
] as const;

const CANON: string[] = FRAMES.map((frame) => frame.id);

/** Wartości suwaka — w sekundach, tak jak stoją w klocku „czekaj”. */
const WAITS = [0, 0.05, 0.1, 0.2, 0.5, 1];

const START: Sprite = { ...HOME, x: 0, y: 0, costume: 0 };

/** Czy kolejność klatek jest obiegiem skoku — w którąkolwiek stronę. */
function isCycle(order: readonly string[]): boolean {
  const twice = [...order, ...order].join('|');
  return twice.includes(CANON.join('|')) || twice.includes([...CANON].reverse().join('|'));
}

/**
 * Para sąsiednich klatek, między którymi piłka przeskakuje najdalej. Zdanie
 * „coś jest nie tak” niczego nie uczy — dziecko ma usłyszeć, **między którymi
 * dwiema klatkami** urwał się ruch.
 */
function biggestJump(order: readonly string[]): [string, string] | null {
  let worst: [string, string] | null = null;
  let gap = 1;
  for (let i = 0; i < order.length; i += 1) {
    const from = CANON.indexOf(order[i]);
    const to = CANON.indexOf(order[(i + 1) % order.length]);
    const distance = Math.min((to - from + CANON.length) % CANON.length, (from - to + CANON.length) % CANON.length);
    if (distance > gap) {
      gap = distance;
      worst = [order[i], order[(i + 1) % order.length]];
    }
  }
  return worst;
}

/** Nazwa klatki po polsku — werdykty cytują ją dziecku. */
function frameName(id: string): string {
  return FRAMES.find((frame) => frame.id === id)?.name ?? id;
}

interface FlipbookProps {
  color: string;
  onComplete?: () => void;
}

export function Flipbook({ color, onComplete }: FlipbookProps) {
  const [order, setOrder] = useState<string[]>(() => ['ziemia', 'gora', 'odbicie', 'lot']);
  const [wait, setWait] = useState(4);
  const [done, setDone] = useState(false);
  const held = useRef<number | null>(null);
  const anchorRef = useSectionScrollAnchor(done ? 1 : 0);

  const seconds = WAITS[wait];
  const stack: Block[] = [make('flaga'), make('zawsze', undefined, [make('kostium'), make('czekaj', seconds)])];
  const program = useProgram(stack, START);

  /* Klatek na sekundę liczymy z tego, co naprawdę robi silnik: czekanie plus oddanie ekranu. */
  const fps = Math.round(1000 / (seconds * 1000 + 40));
  const cycled = isCycle(order);
  const paced = seconds >= 0.05 && seconds <= 0.2;
  const ready = cycled && paced && program.attempts > 0;

  useEffect(() => {
    const drop = () => {
      held.current = null;
    };
    window.addEventListener('pointerup', drop);
    return () => window.removeEventListener('pointerup', drop);
  }, []);

  const grab = (index: number) => {
    held.current = index;
  };

  const hover = (index: number) => {
    const from = held.current;
    if (from === null || from === index) return;
    setOrder((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
    held.current = index;
  };

  const finish = () => {
    setDone(true);
    onComplete?.();
  };

  const shown = FRAMES.find((frame) => frame.id === order[(program.sprite.costume ?? 0) % order.length]) ?? FRAMES[0];

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed">
        Cztery rysunki tej samej piłki to jej <strong>kostiumy</strong>. Duszek pokazuje zawsze jeden
        z nich, a animacja to nic innego niż <strong>pętla, która je przełącza</strong>. Ustaw klatki
        w kolejności skoku, uruchom i dobierz czekanie tak, żeby to wyglądało jak odbijająca się
        piłka.
      </p>

      <div className="mt-4 space-y-4 lg:grid lg:gap-4 lg:space-y-0 lg:grid-cols-[minmax(0,230px)_minmax(0,1fr)]">
        <div className="contents lg:block">
          {/* Wyświetlacz zostaje na ekranie: poniżej `lg` przykleja się nad pasek klatek. */}
          <div className="sticky top-9 z-10 -mx-4 bg-white px-4 pb-2 dark:bg-zinc-900 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:dark:bg-transparent">
            <div className="mx-auto max-w-[230px]">
              <div className="flex items-center justify-between border border-b-0 bg-muted/30 px-2 py-1">
                <button
                  type="button"
                  onClick={program.start}
                  title="Uruchom"
                  className="cursor-pointer p-0.5"
                >
                  <GreenFlag lit={program.running} className="h-5 w-5" />
                </button>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {fps} klatek/s
                </span>
                <button type="button" onClick={program.stop} title="Zatrzymaj" className="cursor-pointer p-0.5">
                  <StopSign className="h-5 w-5" />
                </button>
              </div>
              <div className="relative aspect-[4/3] w-full border bg-white dark:bg-zinc-950">
                <svg viewBox="0 0 120 110" className="absolute inset-0 h-full w-full">
                  <line x1={8} y1={99} x2={112} y2={99} stroke="currentColor" strokeWidth={1.5} opacity={0.35} />
                  <ellipse
                    cx={60}
                    cy={shown.cy}
                    rx={shown.rx}
                    ry={shown.ry}
                    fill={color}
                    opacity={0.85}
                  />
                </svg>
              </div>
              <p className="border border-t-0 px-2 py-1 text-center text-[11px] text-muted-foreground">
                kostium: <strong className="text-foreground">{shown.name}</strong>
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
            Kostiumy duszka — przeciągnij, żeby zmienić kolejność
          </p>
          <div className="mt-2 flex gap-2">
            {order.map((id, index) => {
              const frame = FRAMES.find((item) => item.id === id)!;
              const live = id === shown.id && program.running;
              return (
                <div
                  key={id}
                  onPointerDown={() => grab(index)}
                  onPointerEnter={() => hover(index)}
                  className={cn(
                    'flex-1 cursor-grab touch-none select-none border bg-white p-1 text-center dark:bg-zinc-950',
                    live && 'ring-2'
                  )}
                  style={live ? { borderColor: color, boxShadow: `0 0 0 2px ${color}` } : undefined}
                >
                  <svg viewBox="0 0 120 110" className="h-12 w-full">
                    <line x1={8} y1={99} x2={112} y2={99} stroke="currentColor" strokeWidth={2} opacity={0.3} />
                    <ellipse cx={60} cy={frame.cy} rx={frame.rx} ry={frame.ry} fill={color} opacity={0.8} />
                  </svg>
                  <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{index + 1}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <label htmlFor="flipbook-wait" className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
              Czekanie w pętli: {seconds === 0 ? 'brak' : `${seconds} s`}
            </label>
            <input
              id="flipbook-wait"
              type="range"
              min={0}
              max={WAITS.length - 1}
              step={1}
              value={wait}
              onChange={(event) => setWait(Number(event.target.value))}
              className="mt-1.5 w-full cursor-pointer accent-current"
              style={{ color }}
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>bez czekania</span>
              <span>1 s</span>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto border-t pt-3">
            <Script blocks={stack} />
          </div>

          <div className="mt-3">
            <Note color={color} cycled={cycled} jump={biggestJump(order)} seconds={seconds} started={program.attempts > 0} />
            {program.last?.endless && program.finished && (
              <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                Makieta zatrzymała pokaz po kilkunastu sekundach. <strong>Pętla „zawsze” nie kończy
                się sama</strong> — w Scratchu kręciłaby się do czerwonego znaku stop.
              </p>
            )}
            {ready && !done && (
              <button
                type="button"
                onClick={finish}
                className="mt-3 cursor-pointer border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
                style={{ borderColor: color, color }}
              >
                Kończę blok
              </button>
            )}
          </div>
        </div>
      </div>

      {done && (
        <div className="mt-4 p-3" style={{ backgroundColor: `${color}14` }}>
          <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Piłka skacze.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">
            Animacja to <strong>dwa klocki w pętli</strong>: zmień obrazek i poczekaj. Bez czekania
            nie ma animacji, tylko migotanie — a bez pętli jest jedna zmiana kostiumu i koniec. To
            samo zrobisz zaraz sam/sama — na swoim duszku, ze skryptem, który ułożysz własnym palcem.
          </p>
        </div>
      )}
    </div>
  );
}

function Note({
  color,
  cycled,
  jump,
  seconds,
  started,
}: {
  color: string;
  cycled: boolean;
  jump: [string, string] | null;
  seconds: number;
  started: boolean;
}) {
  if (!started)
    return (
      <p className="text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Uruchom zieloną flagą</strong> i patrz na piłkę, a nie na
        pasek. Kolejność i czekanie możesz przestawiać w trakcie — program się nie zatrzyma.
      </p>
    );

  if (!cycled)
    return (
      <p className="text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Piłka skacze, ale nie po kolei.</strong>{' '}
        {jump
          ? `Między „${frameName(jump[0])}” a „${frameName(jump[1])}” przeskakuje pół drogi naraz — między tymi dwiema klatkami brakuje tej, która je łączy.`
          : 'Ustaw klatki tak, żeby piłka schodziła w dół i wracała bez przeskoków.'}
      </p>
    );

  if (seconds === 0)
    return (
      <p className="text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Kolejność dobra, ale bez czekania.</strong> Pętla
        przełącza kostiumy 25 razy na sekundę i oko nie nadąża — widać migotanie zamiast skoku.
        Przeciągnij suwak w prawo.
      </p>
    );

  if (seconds > 0.2)
    return (
      <p className="text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Teraz z kolei za wolno.</strong> Przy takiej przerwie to
        już nie animacja, tylko cztery osobne obrazki pokazywane po kolei. Spróbuj gdzieś w połowie
        suwaka.
      </p>
    );

  return (
    <p className="text-sm leading-relaxed" style={{ color }}>
      <strong>O to chodziło.</strong> Cztery rysunki i jedna pętla wystarczą, żeby piłka skakała.
    </p>
  );
}
