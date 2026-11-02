'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, PaintBucket, Search, Undo2, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Blok `debugowanie` — **pierwszy w całym kursie informatyki**, i pierwszy raz,
 * gdy dziecko szuka przyczyny błędu, zamiast wykonywać polecenie.
 *
 * Wyciek kubełka jest najczęstszą awarią w edytorze grafiki i jednocześnie
 * jedynym momentem, w którym „praca na powiększeniu” z podstawy programowej
 * `[3.1]` przestaje być ciekawostką i staje się jedynym sposobem na naprawę:
 * przy 1× dziura wielkości jednej kratki jest po prostu niewidoczna.
 *
 * Wszystko liczy się naprawdę — wypełnianie to przeszukiwanie wszerz, a wyciek
 * wykrywa fakt, że zalanie dobiło do krawędzi płótna (albo do sąsiedniej szyby).
 * Dziura nie jest „zaznaczona jako dziura”: to zwyczajny brak komórki w konturze,
 * więc dziecko szuka jej wzrokiem, a nie zgaduje.
 */

const GW = 20;
const GH = 14;
const ZOOMS = [
  { level: 1, cell: 9, label: '1×' },
  { level: 2, cell: 17, label: '2×' },
  { level: 4, cell: 30, label: '4×' },
];

const OUTLINE = '#1f2937';
const EMPTY = '#ffffff';

const idx = (x: number, y: number) => y * GW + x;
const cellX = (i: number) => i % GW;
const cellY = (i: number) => Math.floor(i / GW);

function lineCells(x0: number, y0: number, x1: number, y1: number): number[] {
  const cells: number[] = [];
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x);
  const dy = -Math.abs(y1 - y);
  const sx = x < x1 ? 1 : -1;
  const sy = y < y1 ? 1 : -1;
  let error = dx + dy;
  for (;;) {
    cells.push(idx(x, y));
    if (x === x1 && y === y1) break;
    const doubled = 2 * error;
    if (doubled >= dy) {
      error += dy;
      x += sx;
    }
    if (doubled <= dx) {
      error += dx;
      y += sy;
    }
  }
  return cells;
}

/** Kontur elipsy: komórki wewnątrz, które mają choć jednego sąsiada na zewnątrz. */
function ellipseOutline(cx: number, cy: number, rx: number, ry: number): number[] {
  const inside = (x: number, y: number) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  const cells: number[] = [];
  for (let y = 0; y < GH; y += 1) {
    for (let x = 0; x < GW; x += 1) {
      if (!inside(x, y)) continue;
      if (!inside(x + 1, y) || !inside(x - 1, y) || !inside(x, y + 1) || !inside(x, y - 1)) {
        cells.push(idx(x, y));
      }
    }
  }
  return cells;
}

/** Dziura zawsze siada na istniejącej komórce konturu — nigdy „obok” niego. */
function gapNear(outline: number[], x: number, y: number): number {
  return outline.reduce((best, cell) => {
    const distance = Math.hypot(cellX(cell) - x, cellY(cell) - y);
    const bestDistance = Math.hypot(cellX(best) - x, cellY(best) - y);
    return distance < bestDistance ? cell : best;
  }, outline[0]);
}

/** Polska odmiana: 1 dziura, 2–4 dziury, 0 i 5+ dziur. */
function gapsWord(count: number): string {
  if (count === 1) return 'dziura';
  const last = count % 10;
  const lastTwo = count % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'dziury';
  return 'dziur';
}

function fillFrom(walls: Set<number>, seed: number): { cells: number[]; escaped: boolean } {
  const cells: number[] = [];
  const seen = new Set<number>([seed]);
  const queue = [seed];
  let escaped = false;
  while (queue.length > 0) {
    const cell = queue.shift() as number;
    cells.push(cell);
    const x = cellX(cell);
    const y = cellY(cell);
    if (x === 0 || y === 0 || x === GW - 1 || y === GH - 1) escaped = true;
    [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ].forEach(([nx, ny]) => {
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) return;
      const key = idx(nx, ny);
      if (seen.has(key) || walls.has(key)) return;
      seen.add(key);
      queue.push(key);
    });
  }
  return { cells, escaped };
}

interface Puzzle {
  id: string;
  title: string;
  brief: string;
  paint: string;
  outline: number[];
  gaps: number[];
  seed: number;
  /** Obszar, który MA się zamalować — po naprawie zalanie musi trafić dokładnie w niego. */
  target: Set<number>;
  spillNote: string;
}

function buildPuzzles(): Puzzle[] {
  // 1. Balon — jedna dziura w konturze, u dołu z lewej.
  const balloon = [
    ...ellipseOutline(9, 5, 5.4, 4.2),
    ...lineCells(9, 10, 9, 12),
    ...lineCells(9, 12, 11, 13),
  ];
  const balloonOutline = Array.from(new Set(balloon));
  const balloonGap = gapNear(ellipseOutline(9, 5, 5.4, 4.2), 5, 8);

  // 2. Okno — dziura w ramie i dziura w szprosie między szybami.
  const frame = [
    ...lineCells(4, 2, 15, 2),
    ...lineCells(4, 11, 15, 11),
    ...lineCells(4, 2, 4, 11),
    ...lineCells(15, 2, 15, 11),
    ...lineCells(9, 2, 9, 11),
    ...lineCells(4, 7, 15, 7),
  ];
  const windowOutline = Array.from(new Set(frame));
  const mullionGap = gapNear(lineCells(9, 2, 9, 11), 9, 4);
  const frameGap = gapNear(lineCells(4, 2, 15, 2), 12, 2);

  const closedBalloon = new Set(balloonOutline);
  const closedWindow = new Set(windowOutline);

  return [
    {
      id: 'balon',
      title: 'Zamaluj balon na czerwono',
      brief:
        'Klasyczna sytuacja: klikasz kubełkiem w środku balonu, a kolor zalewa całe płótno. To nie jest zepsuty program — to dziura w konturze.',
      paint: '#ef4444',
      outline: balloonOutline.filter((cell) => cell !== balloonGap),
      gaps: [balloonGap],
      seed: idx(9, 5),
      target: new Set(fillFrom(closedBalloon, idx(9, 5)).cells),
      spillNote:
        'Kontur balonu ma jedną brakującą kratkę — kolor przecisnął się przez nią jak woda przez szparę.',
    },
    {
      id: 'okno',
      title: 'Zamaluj TYLKO lewą górną szybę',
      brief:
        'Teraz trudniej: dziury są dwie i jedna z nich nie jest w ramie okna, tylko w listewce między szybami. Kolor najpierw przeleje się do sąsiedniej szyby, a dopiero potem ucieknie na zewnątrz.',
      paint: '#7dd3fc',
      outline: windowOutline.filter((cell) => cell !== mullionGap && cell !== frameGap),
      gaps: [mullionGap, frameGap],
      seed: idx(6, 4),
      target: new Set(fillFrom(closedWindow, idx(6, 4)).cells),
      spillNote:
        'Jedna dziura była w ramie, druga w listewce między szybami — obie wielkości jednej kratki.',
    },
  ];
}

interface LeakHuntProps {
  color: string;
  onComplete?: () => void;
}

export function LeakHunt({ color, onComplete }: LeakHuntProps) {
  const puzzles = useMemo(buildPuzzles, []);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  const anchorRef = useSectionScrollAnchor(round);

  const puzzle = puzzles[round];
  const lastRound = round === puzzles.length - 1;

  const next = () => {
    if (lastRound) {
      setDone(true);
      onComplete?.();
      return;
    }
    setRound((prev) => prev + 1);
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Awaria {round + 1} z {puzzles.length}
        </p>
        <div className="flex gap-1.5" aria-hidden>
          {puzzles.map((item, i) => (
            <span
              key={item.id}
              className="h-1.5 w-8"
              style={{ backgroundColor: i < round || done ? color : `${color}25` }}
            />
          ))}
        </div>
      </div>

      <Repair key={puzzle.id} puzzle={puzzle} color={color} onSolved={next} lastRound={lastRound} />

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-l-4 bg-muted/40 p-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <p className="font-bold">Kubełek nie zna kształtów. Zna tylko kolory.</p>
            <p className="mt-2">
              Zalewa wszystko, co ma tę samą barwę i trzyma się razem — i zatrzymuje się dopiero na
              innym kolorze. Dlatego zanim wylejesz kolor,{' '}
              <strong>kontur musi być zamknięty do ostatniej kratki</strong>. A jedna kratka jest za
              mała, żeby ją zobaczyć bez powiększenia — dlatego każdy edytor grafiki ma lupę.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type Phase = 'przed' | 'wyciek' | 'szukam' | 'ok';

function Repair({
  puzzle,
  color,
  onSolved,
  lastRound,
}: {
  puzzle: Puzzle;
  color: string;
  onSolved: () => void;
  /** Ostatnia awaria w bloku — decyduje o napisie na przycisku domykającym. */
  lastRound: boolean;
}) {
  const [walls, setWalls] = useState<Set<number>>(() => new Set(puzzle.outline));
  const [filled, setFilled] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>('przed');
  const [zoom, setZoom] = useState(0);
  const [misses, setMisses] = useState(0);
  const [spilled, setSpilled] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const openGaps = puzzle.gaps.filter((gap) => !walls.has(gap));
  const cell = ZOOMS[zoom].cell;

  const pour = () => {
    const result = fillFrom(walls, puzzle.seed);
    setFilled(result.cells);
    const exact = result.cells.length === puzzle.target.size;
    if (exact) {
      setPhase('ok');
      return;
    }
    setSpilled(!result.escaped);
    setPhase('wyciek');
  };

  const undo = () => {
    setFilled([]);
    setPhase('szukam');
    if (zoom === 0) setZoom(1);
  };

  const tap = (target: number) => {
    if (phase !== 'szukam' && phase !== 'przed') return;
    if (walls.has(target)) return;
    if (puzzle.gaps.includes(target)) {
      setWalls((prev) => new Set(prev).add(target));
      setMisses(0);
      return;
    }
    setMisses((prev) => prev + 1);
  };

  const claim = () => {
    setClaimed(true);
    onSolved();
  };

  const hintAt = misses >= 6 && openGaps.length > 0 ? openGaps[0] : null;
  const filledSet = new Set(filled);

  return (
    <div>
      <p className="mb-1 text-base font-bold sm:text-lg">{puzzle.title}</p>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{puzzle.brief}</p>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          {/* Pasek narzędzi — kubełek, cofanie i lupa, czyli dokładnie to, czego wymaga naprawa */}
          <div className="flex flex-wrap items-center gap-2 border bg-zinc-100 p-2 dark:bg-zinc-800">
            <button
              type="button"
              onClick={pour}
              disabled={phase === 'wyciek' || phase === 'ok'}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 border border-transparent px-3 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: color }}
            >
              <PaintBucket className="h-3.5 w-3.5" aria-hidden />
              Wylej kolor
            </button>
            <button
              type="button"
              onClick={undo}
              disabled={phase !== 'wyciek'}
              className="inline-flex h-9 cursor-pointer items-center gap-1.5 border border-zinc-300 bg-white px-3 text-xs font-bold text-zinc-600 transition-colors hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden />
              Cofnij
            </button>

            <span className="mx-1 h-6 w-px bg-zinc-300 dark:bg-zinc-600" aria-hidden />

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <ZoomIn className="h-3.5 w-3.5" aria-hidden />
              Powiększenie
            </span>
            {ZOOMS.map((item, i) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setZoom(i)}
                aria-pressed={zoom === i}
                className={cn(
                  'h-9 w-10 cursor-pointer border text-xs font-bold transition-colors',
                  zoom === i
                    ? 'border-transparent text-white'
                    : 'border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200'
                )}
                style={zoom === i ? { backgroundColor: color } : undefined}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="max-h-[420px] overflow-auto border border-t-0 bg-zinc-200 p-3 dark:bg-zinc-800">
            <svg
              width={GW * cell}
              height={GH * cell}
              viewBox={`0 0 ${GW * cell} ${GH * cell}`}
              className="mx-auto block bg-white shadow-sm"
              style={{ touchAction: 'manipulation' }}
              role="application"
              aria-label="Rysunek do naprawy — stukaj w kratki, żeby domknąć kontur"
            >
              {Array.from({ length: GW * GH }, (_, i) => {
                const isWall = walls.has(i);
                const isFilled = filledSet.has(i);
                const fill = isWall ? OUTLINE : isFilled ? puzzle.paint : EMPTY;
                return (
                  <rect
                    key={i}
                    x={cellX(i) * cell}
                    y={cellY(i) * cell}
                    width={cell}
                    height={cell}
                    fill={fill}
                    onClick={() => tap(i)}
                    style={{ cursor: phase === 'szukam' ? 'pointer' : 'default' }}
                  />
                );
              })}

              {zoom > 0 && (
                <g stroke="#00000014" strokeWidth={1}>
                  {Array.from({ length: GW - 1 }, (_, i) => (
                    <line
                      key={`v${i}`}
                      x1={(i + 1) * cell}
                      y1={0}
                      x2={(i + 1) * cell}
                      y2={GH * cell}
                    />
                  ))}
                  {Array.from({ length: GH - 1 }, (_, i) => (
                    <line
                      key={`h${i}`}
                      x1={0}
                      y1={(i + 1) * cell}
                      x2={GW * cell}
                      y2={(i + 1) * cell}
                    />
                  ))}
                </g>
              )}

              {hintAt !== null && (
                <motion.rect
                  x={(cellX(hintAt) - 1) * cell}
                  y={(cellY(hintAt) - 1) * cell}
                  width={cell * 3}
                  height={cell * 3}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                />
              )}
            </svg>
          </div>

          <p className="mt-2 text-xs leading-snug text-muted-foreground">
            {phase === 'szukam'
              ? 'Stukaj w kratkę, w której brakuje konturu. Na 1× tego nie widać — po to jest powiększenie.'
              : phase === 'ok'
                ? 'Kolor został tam, gdzie miał zostać.'
                : 'Kliknij „Wylej kolor” i zobacz, co się stanie.'}
          </p>
        </div>

        <div className="min-w-0 space-y-3">
          <AnimatePresence mode="wait">
            {phase === 'wyciek' && (
              <motion.div
                key="wyciek"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="border border-amber-300 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
              >
                <p className="font-bold">
                  {spilled ? 'Przelało się do sąsiedniej szyby.' : 'Kolor uciekł na całe płótno.'}
                </p>
                <p className="mt-1.5">
                  Cofnij to (przycisk obok — w prawdziwym edytorze <strong>Ctrl+Z</strong>), a potem
                  znajdź, którędy uciekł. Przydadzą się większe kratki.
                </p>
              </motion.div>
            )}

            {phase === 'szukam' && (
              <motion.div
                key="szukam"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="border-l-4 bg-muted/40 p-3 text-sm leading-relaxed"
                style={{ borderColor: color }}
              >
                {openGaps.length === 0 ? (
                  <>
                    <p className="flex items-center gap-2 font-bold">
                      <Check className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                      Kontur zamknięty.
                    </p>
                    <p className="mt-1.5">
                      Nie ma już którędy uciec. Wylej kolor jeszcze raz i sprawdź.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="flex items-center gap-2 font-bold">
                      <Search className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                      Do domknięcia: {openGaps.length} {gapsWord(openGaps.length)}
                    </p>
                    <p className="mt-1.5">
                      Powiększ obraz i wodź wzrokiem po konturze. Gdy znajdziesz przerwę — stuknij w
                      nią.
                    </p>
                    {misses >= 3 && misses < 6 && (
                      <p className="mt-2 text-xs opacity-80">
                        Nie trafiłeś/trafiłaś {misses} razy. Nic się nie psuje — szukaj dalej, a jak
                        będzie ciężko, podpowiem miejsce.
                      </p>
                    )}
                    {hintAt !== null && (
                      <p className="mt-2 text-xs font-semibold" style={{ color }}>
                        Podpowiedź: dziura miga w zaznaczonym kwadracie.
                      </p>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {phase === 'ok' && (
              <motion.div
                key="ok"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-l-4 bg-muted/40 p-3 text-sm leading-relaxed"
                style={{ borderColor: color }}
              >
                <p className="flex items-center gap-2 font-bold">
                  <Check className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  Naprawione.
                </p>
                <p className="mt-1.5">{puzzle.spillNote}</p>
                {!claimed && (
                  <button
                    type="button"
                    onClick={claim}
                    className="mt-3 w-full cursor-pointer px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: color }}
                  >
                    {lastRound ? 'Gotowe' : 'Następna awaria'}
                  </button>
                )}
              </motion.div>
            )}

            {phase === 'przed' && (
              <motion.div
                key="przed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border-l-4 bg-muted/40 p-3 text-sm leading-relaxed"
                style={{ borderColor: color }}
              >
                <p className="font-bold">Zanim klikniesz — zgadnij.</p>
                <p className="mt-1.5">Rysunek wygląda na zamknięty. Czy kolor zostanie w środku?</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
