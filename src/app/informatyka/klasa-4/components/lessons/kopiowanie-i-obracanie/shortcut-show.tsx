'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, RotateCw, SquareDashed, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PAPER,
  at,
  boxHeight,
  boxWidth,
  cut,
  normalizeBox,
  paste,
  rotateStamp,
  type Box,
  type Grid,
  type Stamp,
} from './stamp';

/**
 * Pokaz krok po kroku — **pierwszy blok z palety `pokaz` w całym kursie** i
 * pierwsze miejsce w repo, w którym dziecko naciska prawdziwe skróty
 * klawiaturowe.
 *
 * Sześć ruchów, z których składa się każde kopiowanie fragmentu rysunku, jest
 * tu wykonywanych, a nie opisanych: zaznaczenie przeciąga się myszą, `Ctrl+C`
 * i `Ctrl+V` naciska się naprawdę, kopię dosuwa się strzałkami, obrót ma
 * przycisk (bo w edytorach nie ma dla niego skrótu — i to też jest wiedza), a
 * `Ctrl+Z` na koniec pokazuje, że całe wklejenie jest **jednym** krokiem
 * historii, nie setką pomalowanych kratek.
 *
 * Makieta okna celowo nie trzyma się języka wizualnego kursu — ma wyglądać jak
 * program, tak samo jak `DesktopFinder` w teście diagnostycznym. Dla pracy bez
 * klawiatury (tablet) jest wyjście awaryjne z przyciskami, tak jak w
 * `MouseKeyboardDrill`.
 */

const W = 20;
const H = 12;

const LEAF_GREEN = '#4ade80';
const LEAF_VEIN = '#15803d';

const LEAF_ROWS: [number, number[]][] = [
  [2, [4, 5]],
  [3, [3, 4, 5, 6]],
  [4, [2, 3, 4, 5, 6, 7]],
  [5, [2, 3, 4, 5, 6, 7]],
  [6, [3, 4, 5, 6]],
  [7, [4, 5]],
];
const VEIN: [number, number][] = [
  [4, 3],
  [4, 4],
  [5, 5],
  [5, 6],
];
/** Ramka listka — po niej sprawdza się, czy zaznaczenie objęło całość. */
const LEAF_BOX: Box = { x0: 2, y0: 2, x1: 7, y1: 7 };
/** Miejsce, w które kopia ma trafić — dosuwane strzałkami, więc dokładnie. */
const TARGET = { x: 12, y: 2 };

function startGrid(): Grid {
  const grid = new Array<string>(W * H).fill(PAPER);
  LEAF_ROWS.forEach(([y, xs]) => {
    xs.forEach((x) => {
      grid[at(W, x, y)] = LEAF_GREEN;
    });
  });
  VEIN.forEach(([x, y]) => {
    grid[at(W, x, y)] = LEAF_VEIN;
  });
  return grid;
}

interface Step {
  id: string;
  label: string;
  /** Co dokładnie nacisnąć — pusty, gdy krok robi się myszą. */
  keys?: string;
  hint: string;
  /** Co z tego ruchu wynika; pokazuje się dopiero po jego wykonaniu. */
  learned: string;
}

const STEPS: Step[] = [
  {
    id: 'zaznacz',
    label: 'Zaznacz listek',
    hint: 'Przeciągnij po płótnie ramkę tak, żeby objęła cały listek — razem z brzegami.',
    learned:
      'Zaznaczenie to zawsze prostokąt. Program nie zaznacza „listka”, tylko wszystko, co jest w ramce.',
  },
  {
    id: 'kopiuj',
    label: 'Skopiuj zaznaczenie',
    keys: 'Ctrl + C',
    hint: 'Naciśnij Ctrl i C. Na ekranie nic się nie zmieni — i tak ma być.',
    learned:
      'Kopiowanie niczego nie widać, bo kopia idzie do schowka — niewidzialnej kieszeni w pamięci komputera.',
  },
  {
    id: 'wklej',
    label: 'Wklej kopię',
    keys: 'Ctrl + V',
    hint: 'Naciśnij Ctrl i V. Kopia wyskoczy obok oryginału, wciąż zaznaczona.',
    learned:
      'Wklejona kopia jeszcze nie jest częścią rysunku — pływa nad nim i da się ją przesuwać.',
  },
  {
    id: 'przesun',
    label: 'Dosuń kopię na miejsce',
    keys: '← ↑ → ↓',
    hint: 'Strzałkami przesuń kopię do przerywanej ramki po prawej. Możesz też przeciągnąć ją palcem.',
    learned:
      'Strzałki przesuwają o jedną kratkę. To jedyny sposób, żeby trafić dokładnie — myszą zawsze wyjdzie o kratkę obok.',
  },
  {
    id: 'obroc',
    label: 'Obróć kopię o 90°',
    hint: 'Kliknij „Obróć w prawo” na pasku narzędzi. Dla obrotu nie ma skrótu — jest w menu.',
    learned:
      'Obrót działa na zaznaczeniu, nie na całym rysunku. Oryginał zostaje taki, jaki był.',
  },
  {
    id: 'cofnij',
    label: 'Cofnij wklejenie',
    keys: 'Ctrl + Z',
    hint: 'Naciśnij Ctrl i Z. Patrz uważnie, ile z rysunku zniknie.',
    learned:
      'Cała kopia zniknęła za jednym razem. Dla historii edytora wklejenie to JEDEN krok, choć zmieniło kilkadziesiąt kratek.',
  },
];

interface Floating {
  stamp: Stamp;
  x: number;
  y: number;
}

interface ShortcutShowProps {
  color: string;
  onComplete?: () => void;
}

export function ShortcutShow({ color, onComplete }: ShortcutShowProps) {
  const [grid, setGrid] = useState<Grid>(startGrid);
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Box | null>(null);
  const [clip, setClip] = useState<Stamp | null>(null);
  const [floating, setFloating] = useState<Floating | null>(null);
  const [undone, setUndone] = useState(false);
  const [miss, setMiss] = useState<string | null>(null);
  const [noKeyboard, setNoKeyboard] = useState(false);
  const [done, setDone] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const anchor = useRef<{ x: number; y: number } | null>(null);
  const dragOffset = useRef<{ x: number; y: number } | null>(null);
  const beforePaste = useRef<Grid | null>(null);
  const reported = useRef(false);

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  /* Na dotyku skróty klawiaturowe są nie do naciśnięcia, więc taca z przyciskami
     wchodzi od razu — bez tego dziecko na tablecie utyka na kroku „Ctrl+C”. */
  useEffect(() => {
    if (window.matchMedia?.('(pointer: coarse)').matches) setNoKeyboard(true);
  }, []);

  const advance = () => {
    setMiss(null);
    setStep((value) => Math.min(value + 1, STEPS.length));
  };

  const toCell = (event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * W);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * H);
    return { x: Math.min(W - 1, Math.max(0, x)), y: Math.min(H - 1, Math.max(0, y)) };
  };

  const pointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    svgRef.current = event.currentTarget;
    event.currentTarget.setPointerCapture(event.pointerId);
    frameRef.current?.focus();
    const cell = toCell(event);

    /* Kopia, która jeszcze pływa nad rysunkiem, da się złapać i przeciągnąć. */
    if (
      floating &&
      cell.x >= floating.x &&
      cell.x < floating.x + floating.stamp.w &&
      cell.y >= floating.y &&
      cell.y < floating.y + floating.stamp.h
    ) {
      dragOffset.current = { x: cell.x - floating.x, y: cell.y - floating.y };
      return;
    }

    if (step !== 0) return;
    anchor.current = cell;
    setSel(normalizeBox(cell, cell));
  };

  const pointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const cell = toCell(event);
    if (dragOffset.current && floating) {
      const x = Math.min(W - floating.stamp.w, Math.max(0, cell.x - dragOffset.current.x));
      const y = Math.min(H - floating.stamp.h, Math.max(0, cell.y - dragOffset.current.y));
      setFloating({ ...floating, x, y });
      return;
    }
    if (!anchor.current) return;
    setSel(normalizeBox(anchor.current, cell));
  };

  const pointerUp = () => {
    if (dragOffset.current) {
      dragOffset.current = null;
      checkLanding();
      return;
    }
    if (!anchor.current) return;
    anchor.current = null;
    if (step !== 0 || !sel) return;
    const covers =
      sel.x0 <= LEAF_BOX.x0 && sel.y0 <= LEAF_BOX.y0 && sel.x1 >= LEAF_BOX.x1 && sel.y1 >= LEAF_BOX.y1;
    if (!covers) {
      setMiss('Ramka nie obejmuje całego listka — zacznij nad jego lewym górnym rogiem i pociągnij poniżej prawego dolnego.');
      return;
    }
    if (boxWidth(sel) > 12 || boxHeight(sel) > 10) {
      setMiss('Zaznaczyłeś/zaznaczyłaś prawie całe płótno. Ramka ma obejmować listek, a nie wszystko dookoła.');
      return;
    }
    advance();
  };

  const checkLanding = () => {
    if (step !== 3 || !floating) return;
    if (floating.x === TARGET.x && floating.y === TARGET.y) advance();
  };

  const copy = () => {
    if (step !== 1 || !sel) return;
    setClip(cut(grid, W, sel));
    advance();
  };

  const doPaste = () => {
    if (step !== 2 || !clip || !sel) return;
    setFloating({ stamp: clip, x: Math.min(W - clip.w, sel.x0 + 2), y: Math.min(H - clip.h, sel.y0 + 2) });
    advance();
  };

  const nudge = (dx: number, dy: number) => {
    if (step !== 3 || !floating) return;
    const x = Math.min(W - floating.stamp.w, Math.max(0, floating.x + dx));
    const y = Math.min(H - floating.stamp.h, Math.max(0, floating.y + dy));
    setFloating({ ...floating, x, y });
    if (x === TARGET.x && y === TARGET.y) advance();
  };

  const rotate = () => {
    if (step !== 4 || !floating) return;
    const turned = rotateStamp(floating.stamp);
    /* Obrót zatwierdza wklejenie — w edytorze to samo robi kliknięcie poza zaznaczeniem. */
    beforePaste.current = grid;
    setGrid(paste(grid, W, H, turned, { x: floating.x, y: floating.y }, true));
    setFloating(null);
    setSel(null);
    advance();
  };

  const undo = () => {
    if (step !== 5 || !beforePaste.current) return;
    setGrid(beforePaste.current);
    setUndone(true);
    advance();
    setDone(true);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const chord = event.ctrlKey || event.metaKey;
    if (chord && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      copy();
      return;
    }
    if (chord && event.key.toLowerCase() === 'v') {
      event.preventDefault();
      doPaste();
      return;
    }
    if (chord && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      undo();
      return;
    }
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const move = moves[event.key];
    if (move && step === 3) {
      event.preventDefault();
      nudge(move[0], move[1]);
    }
  };

  const preview = floating ? paste(grid, W, H, floating.stamp, { x: floating.x, y: floating.y }, true) : grid;

  return (
    <div
      ref={frameRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="border bg-white p-4 focus-visible:outline focus-visible:outline-2 dark:bg-zinc-900/80 sm:p-6"
      style={{ outlineColor: color }}
    >
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Jeden listek jest już narysowany. <strong>Sześć ruchów</strong> niżej to wszystko, czego
        potrzeba, żeby zrobić z niego drugi — i te same sześć ruchów działa w każdym edytorze
        grafiki na świecie. Wykonaj je po kolei.
      </p>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Makieta okna programu — celowo poza językiem wizualnym kursu. */}
        <div className="min-w-0">
          <div className="overflow-hidden border border-zinc-300 bg-zinc-100 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex items-center gap-1.5 border-b border-zinc-300 bg-zinc-200 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-700">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
              <span className="ml-2 text-xs text-zinc-600 dark:text-zinc-300">
                listek.png — edytor grafiki
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-300 px-2 py-1.5 dark:border-zinc-700">
              <ToolButton active={step === 0} icon={SquareDashed} label="Zaznacz" />
              <ToolButton
                active={step === 4}
                icon={RotateCw}
                label="Obróć w prawo"
                onClick={rotate}
              />
              <ToolButton active={step === 5} icon={Undo2} label="Cofnij" onClick={undo} />
            </div>

            <svg
              viewBox={`0 0 ${W} ${H}`}
              className={cn('block h-auto w-full touch-none bg-white', step === 0 && 'cursor-crosshair')}
              role="img"
              aria-label="Płótno edytora z listkiem"
              onPointerDown={pointerDown}
              onPointerMove={pointerMove}
              onPointerUp={pointerUp}
              onPointerCancel={pointerUp}
            >
              <rect x={0} y={0} width={W} height={H} fill="#ffffff" />
              {preview.map((cellColor, i) =>
                cellColor === PAPER ? null : (
                  <rect
                    key={i}
                    x={i % W}
                    y={Math.floor(i / W)}
                    width={1}
                    height={1}
                    fill={cellColor}
                  />
                )
              )}

              {/* Miejsce dla kopii — widoczne dopiero, gdy jest co dosuwać. */}
              {step === 3 && floating && (
                <rect
                  x={TARGET.x}
                  y={TARGET.y}
                  width={floating.stamp.w}
                  height={floating.stamp.h}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.16}
                  strokeDasharray="0.5 0.4"
                />
              )}

              {floating && (
                <rect
                  x={floating.x}
                  y={floating.y}
                  width={floating.stamp.w}
                  height={floating.stamp.h}
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth={0.16}
                  strokeDasharray="0.4 0.3"
                />
              )}

              {sel && !floating && (
                <rect
                  x={sel.x0}
                  y={sel.y0}
                  width={boxWidth(sel)}
                  height={boxHeight(sel)}
                  fill="#1d4ed810"
                  stroke="#1d4ed8"
                  strokeWidth={0.16}
                  strokeDasharray="0.4 0.3"
                />
              )}
            </svg>
          </div>

          {!noKeyboard ? (
            <button
              type="button"
              onClick={() => setNoKeyboard(true)}
              className="mt-2 text-xs text-muted-foreground underline underline-offset-4"
            >
              Pracuję na tablecie — nie mam klawiatury
            </button>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <PadButton label="Kopiuj" onClick={copy} disabled={step !== 1} />
              <PadButton label="Wklej" onClick={doPaste} disabled={step !== 2} />
              <PadButton label="←" onClick={() => nudge(-1, 0)} disabled={step !== 3} />
              <PadButton label="↑" onClick={() => nudge(0, -1)} disabled={step !== 3} />
              <PadButton label="↓" onClick={() => nudge(0, 1)} disabled={step !== 3} />
              <PadButton label="→" onClick={() => nudge(1, 0)} disabled={step !== 3} />
              <PadButton label="Cofnij" onClick={undo} disabled={step !== 5} />
            </div>
          )}
        </div>

        {/* Sześć ruchów — bieżący podświetlony, wykonane z wnioskiem pod spodem. */}
        <ol className="space-y-2">
          {STEPS.map((item, index) => {
            const state = index < step ? 'done' : index === step ? 'now' : 'todo';
            return (
              <li
                key={item.id}
                className={cn(
                  'border-l-2 py-1.5 pl-3 transition',
                  state === 'todo' && 'border-transparent opacity-45'
                )}
                style={{ borderColor: state === 'todo' ? undefined : color }}
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs font-bold tabular-nums" style={{ color }}>
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                  {state === 'done' && (
                    <Check className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />
                  )}
                </div>
                {item.keys && (
                  <kbd className="mt-1 inline-block border border-zinc-300 bg-zinc-50 px-1.5 py-0.5 font-mono text-[11px] text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
                    {item.keys}
                  </kbd>
                )}
                {state === 'now' && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.hint}</p>
                )}
                {state === 'done' && (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.learned}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <AnimatePresence>
        {miss && (
          <motion.p
            key={miss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            {miss}
          </motion.p>
        )}
      </AnimatePresence>

      {undone && (
        <div className="mt-4 p-4" style={{ backgroundColor: `${color}14` }}>
          <p className="text-sm font-semibold sm:text-base" style={{ color }}>
            Sześć ruchów, a nowego rysowania zero.
          </p>
          <p className="mt-2 text-sm leading-relaxed">
            Zaznacz → <kbd className="font-mono">Ctrl+C</kbd> →{' '}
            <kbd className="font-mono">Ctrl+V</kbd> → strzałki → obrót →{' '}
            <kbd className="font-mono">Ctrl+Z</kbd>, jeśli coś nie wyszło. Te same skróty działają
            też w edytorze tekstu i w przeglądarce plików — <strong>Ctrl+C i Ctrl+V to nie są
            skróty Painta</strong>, tylko skróty całego komputera.
          </p>
        </div>
      )}
    </div>
  );
}

function ToolButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof RotateCw;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'flex items-center gap-1.5 border px-2 py-1 text-xs transition',
        active
          ? 'border-blue-500 bg-blue-50 font-semibold text-blue-800 dark:bg-blue-950/40 dark:text-blue-200'
          : 'border-zinc-300 text-zinc-600 disabled:opacity-60 dark:border-zinc-600 dark:text-zinc-300'
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}

function PadButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="border border-zinc-300 px-3 py-1.5 text-xs font-medium transition disabled:opacity-35 dark:border-zinc-600"
    >
      {label}
    </button>
  );
}
