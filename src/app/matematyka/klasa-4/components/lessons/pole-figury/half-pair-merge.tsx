'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import {
  MERGE_CUTS,
  cellKey,
  halfPath,
  mixedArea,
  type GridCell,
  type HalfCell,
  type MixedFigure,
} from '../../../lib/area';
import { plural } from '../../../lib/plural';

interface Round {
  id: string;
  name: string;
  story: string;
  figure: MixedFigure;
  moral: string;
}

function rect(x: number, y: number, w: number, h: number): GridCell[] {
  const cells: GridCell[] = [];
  for (let dy = 0; dy < h; dy += 1) {
    for (let dx = 0; dx < w; dx += 1) cells.push({ x: x + dx, y: y + dy });
  }
  return cells;
}

const ROUNDS: Round[] = [
  {
    id: 'namiot',
    name: 'Płachta namiotu',
    story:
      'Harcerze rozłożyli płachtę namiotu na kratkowanej macie. Boki są ukośne, więc dwie kratki są przecięte na pół. Policz najpierw całe kratki, a potem zrób coś z połówkami.',
    figure: {
      width: 7,
      height: 4,
      wholes: [...rect(1, 2, 5, 1), ...rect(2, 1, 3, 1)],
      halves: [
        { x: 1, y: 1, cut: 'br' },
        { x: 5, y: 1, cut: 'bl' },
      ],
    },
    moral:
      'Ukośny bok zawsze tnie kratki na pół — i to nie jest problem, tylko zwykła sytuacja. Dwie połówki składasz w jedną całą kratkę i doliczasz do wyniku.',
  },
  {
    id: 'dach',
    name: 'Dach domku',
    story:
      'Ten dach ma ukośne obie połacie, więc połówek jest już cztery. Zasada się nie zmienia: całe osobno, połówki w pary.',
    figure: {
      width: 7,
      height: 4,
      wholes: [...rect(2, 1, 2, 1), ...rect(1, 2, 4, 1)],
      halves: [
        { x: 2, y: 0, cut: 'br' },
        { x: 3, y: 0, cut: 'bl' },
        { x: 1, y: 1, cut: 'br' },
        { x: 4, y: 1, cut: 'bl' },
      ],
    },
    moral:
      'Nie ma znaczenia, gdzie na figurze leżą połówki ani jak są obrócone — każde dwie dają jedną kratkę. Dlatego pole figury z ukośnymi bokami też jest zwykłą liczbą kratek.',
  },
];

const UNIT = 46;
/** Wysokość tacy w kratkach — mieści slot i podpis. */
const TRAY_ROWS = 2;

/** Pozycja slotu na tacy — sloty stoją w rzędzie pod planszą. */
const traySlot = (index: number, boardHeight: number): GridCell => ({
  x: 1 + index * 1.6,
  y: boardHeight + 0.5,
});

type Phase = 'wholes' | 'halves' | 'done';

interface HalfPairMergeProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe (druga nowa interakcja lekcji): dwa oddzielne kawałki
 * figury łączą się w jeden. Dziecko wskazuje dwie dowolne połówki kratki — a
 * te dosłownie zlatują na tacę i składają się tam w kwadrat.
 *
 * Mechanizm jest nowy w kursie: `WholePackBoard` domyka pojemnik po zebraniu
 * pełnego kompletu, `PeelBoard` przenosi ten sam żeton między kontenerami —
 * tutaj dwa *różne* elementy, leżące w różnych miejscach rysunku i obrócone pod
 * różnymi kątami, stają się jednym obiektem. Lot jest animacją atrybutu `d`
 * ścieżki (wierzchołki w stałej kolejności z `halfVertices`), więc trójkąt
 * płynnie obraca się w locie, bez ręcznego liczenia klatek transformacji.
 */
export function HalfPairMerge({ color, onComplete }: HalfPairMergeProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('wholes');
  const [tapped, setTapped] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<number[]>([]);
  const [pairs, setPairs] = useState<number[][]>([]);
  const [finished, setFinished] = useState(false);

  const round = ROUNDS[roundIndex] ?? ROUNDS[ROUNDS.length - 1];
  const containerRef = useSectionScrollAnchor(`${roundIndex}-${phase}-${finished}`);

  const wholeCount = round.figure.wholes.length;
  const halfCount = round.figure.halves.length;
  const slotCount = halfCount / 2;
  const area = mixedArea(round.figure);

  /** Docelowa ścieżka połówki: dom albo miejsce na tacy (pierwsza jako `tl`, druga jako `br`). */
  const pathFor = (index: number): string => {
    const pairIndex = pairs.findIndex((pair) => pair.includes(index));
    if (pairIndex >= 0) {
      const slot = traySlot(pairIndex, round.figure.height);
      const position = pairs[pairIndex].indexOf(index);
      return halfPath(slot.x, slot.y, MERGE_CUTS[position], UNIT);
    }
    const half = round.figure.halves[index];
    return halfPath(half.x, half.y, half.cut, UNIT);
  };

  const tapWhole = (cell: GridCell) => {
    const key = cellKey(cell);
    if (tapped.has(key)) return;
    const next = new Set(tapped);
    next.add(key);
    setTapped(next);
    if (next.size === wholeCount) setPhase('halves');
  };

  const tapHalf = (index: number) => {
    if (phase !== 'halves') return;
    if (pairs.some((pair) => pair.includes(index))) return;
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index));
      return;
    }
    const next = [...selected, index];
    if (next.length < 2) {
      setSelected(next);
      return;
    }
    const nextPairs = [...pairs, next];
    setSelected([]);
    setPairs(nextPairs);
    if (nextPairs.length === slotCount) {
      window.setTimeout(() => setPhase('done'), 700);
    }
  };

  const goNext = () => {
    if (roundIndex + 1 < ROUNDS.length) {
      setRoundIndex((i) => i + 1);
      setPhase('wholes');
      setTapped(new Set());
      setSelected([]);
      setPairs([]);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Połówki też się liczą</h3>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
          Figura z ukośnymi bokami ma pole tak samo jak prostokąt — tylko liczysz je w dwóch
          porcjach: najpierw całe kratki, potem połówki dobrane w pary. Dwie połówki to zawsze jedna
          cała kratka.
        </p>
      </div>
    );
  }

  const boardWidth = round.figure.width * UNIT;
  const boardHeight = (round.figure.height + TRAY_ROWS) * UNIT;
  const mergedCount = pairs.length;

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {roundIndex + 1}/{ROUNDS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={round.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            {round.name}
          </p>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{round.story}</p>

          {/* Polecenie bieżącej fazy */}
          <div
            className="mb-3 border-l-2 px-3 py-2 text-sm font-semibold"
            style={{ borderColor: color, color: `color-mix(in oklch, ${color} 88%, black)` }}
          >
            {phase === 'wholes' && (
              <>
                Krok 1 — stuknij po kolei każdą <strong>całą</strong> kratkę figury (
                {tapped.size}/{wholeCount}).
              </>
            )}
            {phase === 'halves' && (
              <>
                Krok 2 — stuknij <strong>dwie połówki</strong>, żeby zlepić z nich jedną całą kratkę
                ({mergedCount}/{slotCount}).
              </>
            )}
            {phase === 'done' && <>Gotowe — całe kratki i połówki policzone.</>}
          </div>

          <div className="mb-4 flex justify-center overflow-x-auto">
            <svg
              viewBox={`0 0 ${boardWidth} ${boardHeight}`}
              className="h-auto w-full max-w-[540px] touch-none select-none"
              role="group"
              aria-label={`${round.name} — figura na kratownicy z tacą na sklejone kratki`}
            >
              {/* Kratownica planszy */}
              <g stroke={`${color}30`} strokeWidth={1}>
                {Array.from({ length: round.figure.width + 1 }, (_, i) => (
                  <line
                    key={`v${i}`}
                    x1={i * UNIT}
                    y1={0}
                    x2={i * UNIT}
                    y2={round.figure.height * UNIT}
                  />
                ))}
                {Array.from({ length: round.figure.height + 1 }, (_, i) => (
                  <line key={`h${i}`} x1={0} y1={i * UNIT} x2={boardWidth} y2={i * UNIT} />
                ))}
              </g>

              {/* Taca — sloty widoczne od początku, żeby było wiadomo, dokąd lecą połówki */}
              <g>
                {Array.from({ length: slotCount }, (_, i) => {
                  const slot = traySlot(i, round.figure.height);
                  return (
                    <rect
                      key={`slot${i}`}
                      x={slot.x * UNIT}
                      y={slot.y * UNIT}
                      width={UNIT}
                      height={UNIT}
                      fill={color}
                      fillOpacity={0.05}
                      stroke={color}
                      strokeOpacity={0.5}
                      strokeWidth={2}
                      strokeDasharray="6 5"
                    />
                  );
                })}
              </g>

              {/* Całe kratki figury */}
              {round.figure.wholes.map((cell) => {
                const key = cellKey(cell);
                const isTapped = tapped.has(key);
                const clickable = phase === 'wholes' && !isTapped;
                return (
                  <rect
                    key={`whole-${key}`}
                    x={cell.x * UNIT + 2}
                    y={cell.y * UNIT + 2}
                    width={UNIT - 4}
                    height={UNIT - 4}
                    fill={color}
                    fillOpacity={isTapped ? 0.55 : 0.1}
                    stroke={color}
                    strokeOpacity={isTapped ? 0.9 : 0.5}
                    strokeWidth={isTapped ? 2 : 1.5}
                    strokeDasharray={clickable ? '5 4' : undefined}
                    className={clickable ? 'cursor-pointer' : undefined}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    aria-label={
                      clickable
                        ? `Policz całą kratkę w kolumnie ${cell.x + 1}, wierszu ${cell.y + 1}`
                        : undefined
                    }
                    onClick={clickable ? () => tapWhole(cell) : undefined}
                    onKeyDown={(event) => {
                      if (clickable && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        tapWhole(cell);
                      }
                    }}
                  />
                );
              })}

              {/* Połówki — lecą na tacę animacją atrybutu `d` */}
              {round.figure.halves.map((half: HalfCell, index) => {
                const isMerged = pairs.some((pair) => pair.includes(index));
                const isSelected = selected.includes(index);
                const clickable = phase === 'halves' && !isMerged;
                return (
                  <motion.path
                    key={`half-${index}`}
                    initial={false}
                    animate={{ d: pathFor(index) }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    fill={color}
                    fillOpacity={isMerged ? 0.55 : isSelected ? 0.5 : 0.16}
                    stroke={color}
                    strokeOpacity={0.9}
                    strokeWidth={isSelected ? 3 : 2}
                    strokeDasharray={clickable && !isSelected ? '5 4' : undefined}
                    className={clickable ? 'cursor-pointer' : undefined}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    aria-label={
                      clickable
                        ? `Wybierz połówkę kratki numer ${index + 1}${isSelected ? ' (wybrana)' : ''}`
                        : undefined
                    }
                    onClick={clickable ? () => tapHalf(index) : undefined}
                    onKeyDown={(event) => {
                      if (clickable && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        tapHalf(index);
                      }
                    }}
                  />
                );
              })}
            </svg>
          </div>

          <p className="mb-4 text-center text-xs text-muted-foreground">
            Pole pod planszą to <strong>taca całości</strong> — każde dwie połówki dają tam jedną
            całą kratkę.
          </p>

          {/* Rachunek budowany na żywo */}
          <div
            className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 border-t-2 p-3 text-center"
            style={{ borderColor: color, backgroundColor: `${color}0f` }}
          >
            <span className="font-mono text-2xl font-bold tabular-nums" style={{ color }}>
              {tapped.size}
            </span>
            <span className="text-sm text-muted-foreground">
              {plural(tapped.size, { one: 'cała kratka', few: 'całe kratki', many: 'całych kratek' })}
            </span>
            <span className="font-mono text-2xl font-bold" style={{ color }}>
              +
            </span>
            <span className="font-mono text-2xl font-bold tabular-nums" style={{ color }}>
              {mergedCount}
            </span>
            <span className="text-sm text-muted-foreground">
              z połówek
            </span>
            {phase === 'done' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-mono text-2xl font-bold tabular-nums"
                style={{ color }}
                data-area-result={area}
              >
                = {area}
              </motion.span>
            )}
          </div>

          {phase === 'done' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{round.moral}</p>
              <p className="mt-2 text-center font-mono text-lg font-bold tabular-nums" style={{ color }}>
                Pole = {area} {plural(area, { one: 'kratka', few: 'kratki', many: 'kratek' })}
              </p>
              <div className="mt-4 flex justify-end">
                <Button onClick={goNext} style={{ backgroundColor: color }}>
                  {roundIndex + 1 < ROUNDS.length ? (
                    'Następna figura'
                  ) : (
                    <>
                      <Check className="mr-1 h-4 w-4" /> Zakończ
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
