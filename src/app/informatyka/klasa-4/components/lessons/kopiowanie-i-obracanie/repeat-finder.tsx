'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, FlipHorizontal, MoveRight, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import {
  PAPER,
  at,
  boxWidth,
  inkCount,
  makeGrid,
  mergeGrids,
  mirrorGrid,
  normalizeBox,
  rotateGrid,
  sameGrid,
  shiftGrid,
  type Box,
  type Grid,
} from './stamp';

/**
 * Haczyk lekcji — **zaznaczanie zanim padnie słowo „zaznaczanie”**.
 *
 * Dziecko dostaje gotowy wzór i jedno polecenie: przeciągnij ramkę wokół
 * najmniejszego kawałka, z którego da się złożyć całość. Potem maszyna obok
 * **naprawdę składa rysunek z tego, co zostało zaznaczone** — kopia po kopii,
 * na oczach dziecka. Zły kawałek nie jest oceniany ani blokowany: po prostu
 * widać, że złożony rysunek nie wygląda jak wzór (konsekwencja zamiast oceny —
 * ta sama zasada co w `PileOn` i `TwoSides`).
 *
 * Trzy rundy to trzy przekształcenia, które wracają w całej reszcie lekcji:
 * obrót o 90°, przesunięcie i odbicie lustrzane. Żadne z nich nie jest tu
 * nazwane jako reguła do zapamiętania — jest wypisane na maszynie, bo to ona
 * je wykonuje.
 *
 * Cały wzór jest **generowany** z kawałka wzorcowego tą samą funkcją, której
 * używa składanie (`assemble`). Dzięki temu nie da się wpisać do danych obrazka,
 * którego nie da się złożyć — a porównanie „wzór kontra składanka” jest uczciwe.
 */

const SIZE = 16;

type Rule = 'obrot' | 'przesuniecie' | 'odbicie';

const RULE_LABEL: Record<Rule, { name: string; how: string; icon: typeof RotateCw }> = {
  obrot: {
    name: 'obraca o 90° w prawo',
    how: 'kładzie twój kawałek, potem obraca go trzy razy o ćwierć obrotu',
    icon: RotateCw,
  },
  przesuniecie: {
    name: 'przesuwa w bok',
    how: 'kładzie twój kawałek i przesuwa kopie w lewo i w prawo o jego szerokość',
    icon: MoveRight,
  },
  odbicie: {
    name: 'odbija lustrzanie',
    how: 'kładzie twój kawałek i dokłada jego lustrzane odbicie',
    icon: FlipHorizontal,
  },
};

interface Round {
  id: string;
  title: string;
  rule: Rule;
  /** Komórki kawałka wzorcowego — z nich generuje się cały wzór. */
  seed: [number, number, string][];
  /** Ramka kawałka wzorcowego; dla przesunięcia jej szerokość wyznacza odstęp. */
  seedBox: Box;
  /** Ile kolorowych kratek wolno zaznaczyć, zanim padnie „da się mniejszym”. */
  maxInk: number;
  /** Zdanie po udanym złożeniu — mówi, co z tego wynika, nie „brawo”. */
  win: string;
}

const PETAL = '#f472b6';
const HEART = '#facc15';
const PLANK = '#b45309';
const RAIL = '#78350f';
const WING = '#fb923c';
const SPOT = '#c2410c';
const BODY = '#3f3f46';

function cells(coords: [number, number][], color: string): [number, number, string][] {
  return coords.map(([x, y]) => [x, y, color]);
}

const FLOWER_PETAL: [number, number][] = [
  [7, 2],
  [8, 2],
  [6, 3],
  [7, 3],
  [8, 3],
  [9, 3],
  [6, 4],
  [7, 4],
  [8, 4],
  [9, 4],
  [6, 5],
  [7, 5],
  [8, 5],
  [9, 5],
  [7, 6],
  [8, 6],
];

const FENCE_SLICE: [number, number][] = [];
for (let y = 3; y <= 13; y += 1) {
  FENCE_SLICE.push([1, y], [2, y]);
}
const FENCE_RAIL: [number, number][] = [];
for (let x = 1; x <= 4; x += 1) {
  FENCE_RAIL.push([x, 6], [x, 10]);
}

const WING_ROWS: [number, number[]][] = [
  [3, [4, 5, 6]],
  [4, [2, 3, 4, 5, 6]],
  [5, [1, 2, 3, 4, 5, 6]],
  [6, [1, 2, 3, 4, 5, 6]],
  [7, [2, 3, 4, 5, 6]],
  [8, [3, 4, 5, 6]],
  [9, [2, 3, 4, 5, 6]],
  [10, [2, 3, 4, 5, 6]],
  [11, [3, 4, 5, 6]],
  [12, [5, 6]],
];
const BUTTERFLY_WING: [number, number][] = WING_ROWS.flatMap(([y, xs]) =>
  xs.map((x) => [x, y] as [number, number])
);
const BUTTERFLY_BODY: [number, number][] = [];
for (let y = 4; y <= 12; y += 1) BUTTERFLY_BODY.push([7, y]);

const ROUNDS: Round[] = [
  {
    id: 'kwiat',
    title: 'Kwiat',
    rule: 'obrot',
    seed: [...cells(FLOWER_PETAL, PETAL), ...cells([[7, 7]], HEART)],
    seedBox: { x0: 6, y0: 2, x1: 9, y1: 7 },
    maxInk: 26,
    win: 'Cztery płatki i środek — a narysowany był jeden płatek i jedna kratka środka. Reszta to trzy obroty.',
  },
  {
    id: 'plot',
    title: 'Płot',
    rule: 'przesuniecie',
    seed: [...cells(FENCE_SLICE, PLANK), ...cells(FENCE_RAIL, RAIL)],
    seedBox: { x0: 1, y0: 3, x1: 4, y1: 13 },
    maxInk: 40,
    win: 'Ważna jest szerokość ramki, nie to, od której deski zaczniesz. Każdy kawałek szerokości jednego powtórzenia złoży ten sam płot.',
  },
  {
    id: 'motyl',
    title: 'Motyl',
    rule: 'odbicie',
    seed: [
      ...cells(BUTTERFLY_WING, WING),
      ...cells(
        [
          [3, 5],
          [4, 9],
        ],
        SPOT
      ),
      ...cells(BUTTERFLY_BODY, BODY),
      ...cells(
        [
          [6, 2],
          [5, 1],
        ],
        BODY
      ),
    ],
    seedBox: { x0: 0, y0: 1, x1: 7, y1: 12 },
    maxInk: 84,
    win: 'Prawe skrzydło nie zostało narysowane. Ono jest lewym skrzydłem obejrzanym w lustrze — razem z plamką i czułkiem.',
  },
];

/** Warstwa z samym zaznaczonym fragmentem, na jego oryginalnym miejscu. */
function layerFrom(grid: Grid, box: Box): Grid {
  const layer = makeGrid(SIZE, SIZE);
  for (let y = Math.max(0, box.y0); y <= Math.min(SIZE - 1, box.y1); y += 1) {
    for (let x = Math.max(0, box.x0); x <= Math.min(SIZE - 1, box.x1); x += 1) {
      layer[at(SIZE, x, y)] = grid[at(SIZE, x, y)];
    }
  }
  return layer;
}

/**
 * Kolejne kopie kawałka — osobno, nie od razu zlepione, bo składanie ma się
 * dziać na oczach dziecka warstwa po warstwie.
 */
function assemble(layer: Grid, rule: Rule, pitch: number): Grid[] {
  if (rule === 'obrot') {
    const r1 = rotateGrid(layer, SIZE);
    const r2 = rotateGrid(r1, SIZE);
    const r3 = rotateGrid(r2, SIZE);
    return [layer, r1, r2, r3];
  }
  if (rule === 'odbicie') return [layer, mirrorGrid(layer, SIZE)];
  const steps = [0, 1, -1, 2, -2, 3, -3, 4, -4];
  return steps.map((k) => (k === 0 ? layer : shiftGrid(layer, SIZE, k * pitch)));
}

function buildPattern(round: Round): Grid {
  const seed = makeGrid(SIZE, SIZE);
  round.seed.forEach(([x, y, color]) => {
    seed[at(SIZE, x, y)] = color;
  });
  return mergeGrids(assemble(seed, round.rule, boxWidth(round.seedBox)));
}

interface CanvasProps {
  grid: Grid;
  label: string;
  color: string;
  box?: Box | null;
  onPointerDown?: (event: ReactPointerEvent<SVGSVGElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<SVGSVGElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<SVGSVGElement>) => void;
  interactive?: boolean;
}

function Canvas({
  grid,
  label,
  color,
  box,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  interactive = false,
}: CanvasProps) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={cn(
          'block h-auto w-full border-2 bg-white',
          interactive && 'cursor-crosshair touch-none'
        )}
        style={{ borderColor: `${color}55` }}
        role="img"
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <rect x={0} y={0} width={SIZE} height={SIZE} fill="#ffffff" />
        {grid.map((cellColor, i) =>
          cellColor === PAPER ? null : (
            <rect
              key={i}
              x={i % SIZE}
              y={Math.floor(i / SIZE)}
              width={1}
              height={1}
              fill={cellColor}
            />
          )
        )}
        {box && (
          <rect
            x={box.x0}
            y={box.y0}
            width={box.x1 - box.x0 + 1}
            height={box.y1 - box.y0 + 1}
            fill={`${color}22`}
            stroke={color}
            strokeWidth={0.18}
            strokeDasharray="0.6 0.4"
          />
        )}
      </svg>
    </div>
  );
}

interface RepeatFinderProps {
  color: string;
  onComplete?: () => void;
}

export function RepeatFinder({ color, onComplete }: RepeatFinderProps) {
  const [round, setRound] = useState(0);
  const [box, setBox] = useState<Box | null>(null);
  const [layers, setLayers] = useState<Grid[] | null>(null);
  const [shown, setShown] = useState(0);
  const [verdict, setVerdict] = useState<'ok' | 'duzo' | 'zle' | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [done, setDone] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const anchor = useRef<{ x: number; y: number } | null>(null);
  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(`${round}-${done}`);

  const current = ROUNDS[round];
  const pattern = buildPattern(current);
  const rule = RULE_LABEL[current.rule];
  const RuleIcon = rule.icon;

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  /* Kopie dochodzą po kolei — po to jest to składanie, a nie od razu wynik. */
  useEffect(() => {
    if (!layers || shown >= layers.length) return;
    const timer = window.setTimeout(() => setShown((value) => value + 1), 420);
    return () => window.clearTimeout(timer);
  }, [layers, shown]);

  const toCell = (event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * SIZE);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * SIZE);
    return {
      x: Math.min(SIZE - 1, Math.max(0, x)),
      y: Math.min(SIZE - 1, Math.max(0, y)),
    };
  };

  const startDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (verdict === 'ok') return;
    svgRef.current = event.currentTarget;
    event.currentTarget.setPointerCapture(event.pointerId);
    const cell = toCell(event);
    anchor.current = cell;
    setBox(normalizeBox(cell, cell));
    setLayers(null);
    setShown(0);
    setVerdict(null);
    setNote(null);
  };

  const moveDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!anchor.current) return;
    setBox(normalizeBox(anchor.current, toCell(event)));
  };

  const endDrag = () => {
    anchor.current = null;
  };

  const build = () => {
    if (!box) return;
    const layer = layerFrom(pattern, box);
    const ink = inkCount(layer);
    if (ink === 0) {
      setNote('W ramce nie ma ani jednej kolorowej kratki — maszyna nie ma czego kopiować.');
      return;
    }
    const parts = assemble(layer, current.rule, boxWidth(box));
    const result = mergeGrids(parts);
    const matches = sameGrid(result, pattern);
    setLayers(parts);
    setShown(1);
    setTries((value) => value + 1);

    if (!matches) {
      const missing = pattern.filter(
        (cellColor, i) => cellColor !== PAPER && result[i] === PAPER
      ).length;
      const extra = result.filter(
        (cellColor, i) => cellColor !== PAPER && pattern[i] === PAPER
      ).length;
      setVerdict('zle');
      setNote(
        missing > 0 && extra === 0
          ? `Złożony rysunek ma dziury — brakuje ${missing} kratek. Twój kawałek nie obejmuje wszystkiego, co się powtarza.`
          : missing === 0
            ? `${extra} kratek wylądowało tam, gdzie we wzorze ich nie ma. Ramka zahacza o sąsiedni fragment albo ma złą szerokość.`
            : `Nie zgadza się w ${missing + extra} kratkach — i brakuje, i wystaje. Przyjrzyj się, gdzie dokładnie kończy się jedno powtórzenie.`
      );
      return;
    }

    if (ink > current.maxInk) {
      setVerdict('duzo');
      setNote(
        'Wyszło! Ale zaznaczyłeś/zaznaczyłaś więcej, niż trzeba — w tym kawałku wciąż siedzi coś, co i tak by się powtórzyło. Spróbuj mniejszą ramką.'
      );
      return;
    }
    setVerdict('ok');
    setNote(current.win);
  };

  const next = () => {
    if (round === ROUNDS.length - 1) {
      setDone(true);
      return;
    }
    setRound(round + 1);
    setBox(null);
    setLayers(null);
    setShown(0);
    setVerdict(null);
    setNote(null);
    setTries(0);
  };

  const showAnswer = () => {
    setBox(current.seedBox);
    setLayers(null);
    setShown(0);
    setVerdict(null);
    setNote('Tak wygląda kawałek wzorcowy. Kliknij „Złóż rysunek”, żeby zobaczyć, jak z niego wychodzi całość.');
  };

  const assembled = layers ? mergeGrids(layers.slice(0, Math.max(1, shown))) : makeGrid(SIZE, SIZE);

  if (done) {
    return (
      <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <p className="text-sm font-semibold sm:text-base" style={{ color }}>
          Trzy rysunki, trzy razy jeden kawałek.
        </p>
        <p className="mt-2 text-sm leading-relaxed sm:text-base">
          Kwiat, płot i motyl wyglądają na trzy różne roboty. W rzeczywistości narysowany był w nich
          tylko <strong>płatek, deska i jedno skrzydło</strong> — całą resztę zrobiły trzy ruchy:
          obrót, przesunięcie i odbicie. Dokładnie te trzy ruchy poznasz w tej lekcji, a na końcu
          zrobisz nimi czterolistną koniczynę.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          To nie jest sztuczka na skróty. W programowaniu nazywa się to pętlą i wróci w module o
          Scratchu.
        </p>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          {current.title}{' '}
          <span className="font-normal text-muted-foreground">— rysunek {round + 1} z 3</span>
        </p>
        <div className="flex gap-1.5">
          {ROUNDS.map((item, index) => (
            <span
              key={item.id}
              className="h-1.5 w-6"
              style={{ backgroundColor: index <= round ? color : `${color}33` }}
            />
          ))}
        </div>
      </div>

      <p className="mb-3 text-sm leading-relaxed sm:text-base">
        <strong>Przeciągnij ramkę</strong> po lewym rysunku tak, żeby objęła{' '}
        <strong>najmniejszy kawałek</strong>, z którego da się złożyć całość. Potem maszyna spróbuje
        złożyć z niego rysunek obok.
      </p>

      <div
        className="mb-4 flex items-start gap-2 border-l-2 p-2.5 text-xs sm:text-sm"
        style={{ borderColor: color, backgroundColor: `${color}0f` }}
      >
        <RuleIcon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
        <span>
          <strong>Maszyna {rule.name}:</strong> {rule.how}.
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Canvas
          grid={pattern}
          label="Wzór — zaznacz tutaj"
          color={color}
          box={box}
          interactive
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
        />
        <Canvas grid={assembled} label="Złożone z twojego kawałka" color={color} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={build}
          disabled={!box || verdict === 'ok'}
          className="px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          Złóż rysunek
        </button>
        {verdict === 'ok' && (
          <button
            type="button"
            onClick={next}
            className="border-2 px-4 py-2 text-sm font-semibold transition"
            style={{ borderColor: color, color }}
          >
            {round === ROUNDS.length - 1 ? 'Podsumowanie' : 'Następny rysunek'}
          </button>
        )}
        {tries >= 3 && verdict !== 'ok' && (
          <button
            type="button"
            onClick={showAnswer}
            className="text-sm font-medium text-muted-foreground underline underline-offset-4"
          >
            Pokaż, gdzie jest ten kawałek
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {note && (
          <motion.p
            key={note}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'mt-3 flex items-start gap-2 p-3 text-sm leading-relaxed',
              verdict === 'ok' ? 'text-foreground' : 'text-muted-foreground'
            )}
            style={{ backgroundColor: verdict === 'ok' ? `${color}14` : undefined }}
          >
            {verdict === 'ok' && (
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            )}
            <span>{note}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
