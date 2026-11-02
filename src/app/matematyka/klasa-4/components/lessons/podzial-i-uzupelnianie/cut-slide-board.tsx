'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Move, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cellKey, type GridCell } from '../../../lib/area';
import { boundingBox, isRectangle, mergeCells, partCells, type RectPart } from '../../../lib/area-split';

interface Round {
  id: string;
  story: string;
  /** Nieruchoma część figury. */
  base: GridCell[];
  /** Ruchomy kawałek — opisany rozmiarem i pozycją startową. */
  piece: RectPart;
  moral: string;
}

const rect = (x: number, y: number, width: number, height: number): GridCell[] =>
  partCells({ x, y, width, height });

const ROUNDS: Round[] = [
  {
    id: 'schodek',
    story:
      'Ta figura wygląda jak schodek. Przesuń luźny kawałek tak, żeby powstał z niej zwykły prostokąt.',
    base: mergeCells(rect(0, 0, 2, 1), rect(0, 1, 4, 2)),
    piece: { x: 6, y: 0, width: 2, height: 1 },
    moral: 'Kawałek wskoczył w brakujące miejsce i powstał prostokąt 4 · 3 = 12 kratek.',
  },
  {
    id: 'dostawka',
    story: 'Tym razem kawałek trzeba dostawić z boku, a nie wsunąć w lukę.',
    base: rect(2, 0, 4, 2),
    piece: { x: 0, y: 3, width: 2, height: 2 },
    moral: 'Po dostawieniu wychodzi długi prostokąt 6 · 2 = 12 kratek — pole ani drgnęło.',
  },
  {
    id: 'wcinka',
    story: 'Ostatnia figura ma wcięcie w lewym dolnym rogu. Zapełnij je luźnym kawałkiem.',
    base: mergeCells(rect(0, 0, 5, 2), rect(2, 2, 3, 1)),
    piece: { x: 6, y: 3, width: 2, height: 1 },
    moral: 'Wcięcie zapełnione — prostokąt 5 · 3 = 15 kratek, dokładnie tyle, ile było na starcie.',
  },
];

const COLS = 8;
const ROWS = 5;
const UNIT = 34;

/**
 * Rozgrzewka lekcji o podziale i uzupełnianiu — **flagowa interakcja tej lekcji**.
 *
 * Dziecko przeciąga jeden kawałek figury i widzi, że licznik pola ani drgnie:
 * przesunięcie kawałka nic nie dodaje i nic nie odejmuje, zmienia wyłącznie
 * kształt. To jedyna przesłanka, na której stoi cała reszta lekcji — dopiero
 * dlatego wolno figurę rozcinać i domykać.
 *
 * Pierwszy widżet w kursie, w którym dziecko **przekłada część figury**:
 * wcześniejsze przeciągania zmieniały wymiar (`RectangleBuilder`), kąt
 * (`AngleBuilder`) albo poziom (`MeasureJugLab`), ale nigdy nie przenosiły
 * fragmentu rysunku w inne miejsce.
 */
export function CutSlideBoard({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState<GridCell>({ x: ROUNDS[0].piece.x, y: ROUNDS[0].piece.y });
  const [grab, setGrab] = useState<GridCell | null>(null);

  const allDone = index >= ROUNDS.length;
  const round = ROUNDS[Math.min(index, ROUNDS.length - 1)];
  const isLast = index === ROUNDS.length - 1;

  const piece: RectPart = { ...round.piece, x: pos.x, y: pos.y };
  const pieceCells = partCells(piece);
  const figure = [...round.base, ...pieceCells];
  const solved = isRectangle(figure);
  const box = boundingBox(figure);

  const baseKeys = new Set(round.base.map(cellKey));

  const canPlace = (x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x + round.piece.width > COLS || y + round.piece.height > ROWS) return false;
    return partCells({ ...round.piece, x, y }).every((cell) => !baseKeys.has(cellKey(cell)));
  };

  const pointerToCell = (event: React.PointerEvent): GridCell | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const bounds = svg.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) * (COLS * UNIT)) / bounds.width;
    const y = ((event.clientY - bounds.top) * (ROWS * UNIT)) / bounds.height;
    return { x: Math.floor(x / UNIT), y: Math.floor(y / UNIT) };
  };

  const startDrag = (event: React.PointerEvent) => {
    if (solved) return;
    const cell = pointerToCell(event);
    if (!cell) return;
    const inside = pieceCells.some((item) => item.x === cell.x && item.y === cell.y);
    if (!inside) return;
    svgRef.current?.setPointerCapture(event.pointerId);
    setGrab({ x: cell.x - pos.x, y: cell.y - pos.y });
  };

  const moveDrag = (event: React.PointerEvent) => {
    if (!grab) return;
    const cell = pointerToCell(event);
    if (!cell) return;
    const x = cell.x - grab.x;
    const y = cell.y - grab.y;
    if (canPlace(x, y)) setPos({ x, y });
  };

  const endDrag = () => setGrab(null);

  const reset = () => setPos({ x: round.piece.x, y: round.piece.y });

  const next = () => {
    if (isLast) {
      setIndex(ROUNDS.length);
      onComplete?.();
      return;
    }
    const following = ROUNDS[index + 1];
    setIndex(index + 1);
    setPos({ x: following.piece.x, y: following.piece.y });
  };

  if (allDone) {
    return (
      <div className="border-l-2 bg-white p-5 dark:bg-zinc-900/80 sm:p-6" style={{ borderColor: color }}>
        <p className="flex items-center gap-2 text-base font-bold" style={{ color }}>
          <Check className="h-5 w-5" aria-hidden /> Trzy figury, trzy razy to samo pole
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Za każdym razem przesunięcie kawałka zmieniło kształt, a licznik pola stał w miejscu. Skoro
          tak, to figurę wolno w myślach rozcinać i przekładać — a na tym stoją obie metody z tej
          lekcji.
        </p>
      </div>
    );
  }

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            Figura {index + 1} z {ROUNDS.length}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{round.story}</p>
        </div>
        <div className="flex gap-1.5 pt-1">
          {ROUNDS.map((item, i) => (
            <span
              key={item.id}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: i <= index ? color : `${color}33` }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${COLS * UNIT} ${ROWS * UNIT}`}
            className="w-full touch-none select-none"
            role="img"
            aria-label="Figura na kratownicy z jednym ruchomym kawałkiem"
            data-piece={`${pos.x},${pos.y}`}
            data-grabbing={grab ? 'yes' : 'no'}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
          >
            <rect x={0} y={0} width={COLS * UNIT} height={ROWS * UNIT} fill="#fff" fillOpacity={0.001} />

            <g stroke={`${color}22`} strokeWidth={1}>
              {Array.from({ length: COLS + 1 }, (_, i) => (
                <line key={`v${i}`} x1={i * UNIT} y1={0} x2={i * UNIT} y2={ROWS * UNIT} />
              ))}
              {Array.from({ length: ROWS + 1 }, (_, i) => (
                <line key={`h${i}`} x1={0} y1={i * UNIT} x2={COLS * UNIT} y2={i * UNIT} />
              ))}
            </g>

            {/* Ramka obejmująca całą figurę — zamyka się w prostokąt dopiero po trafieniu. */}
            <motion.rect
              animate={{
                x: box.x * UNIT,
                y: box.y * UNIT,
                width: box.width * UNIT,
                height: box.height * UNIT,
              }}
              initial={false}
              transition={{ type: 'tween', duration: 0.15 }}
              x={box.x * UNIT}
              y={box.y * UNIT}
              width={box.width * UNIT}
              height={box.height * UNIT}
              fill="none"
              stroke={color}
              strokeOpacity={solved ? 0 : 0.45}
              strokeWidth={2}
              strokeDasharray="6 4"
            />

            {/* Nieruchoma część */}
            {round.base.map((cell) => (
              <rect
                key={cellKey(cell)}
                x={cell.x * UNIT + 1}
                y={cell.y * UNIT + 1}
                width={UNIT - 2}
                height={UNIT - 2}
                fill={color}
                fillOpacity={0.24}
                stroke={color}
                strokeWidth={1}
              />
            ))}

            {/* Ruchomy kawałek */}
            <motion.g
              animate={{ x: pos.x * UNIT, y: pos.y * UNIT }}
              initial={false}
              transition={grab ? { duration: 0 } : { type: 'tween', duration: 0.15 }}
              className={solved ? 'cursor-default' : 'cursor-grab'}
            >
              <rect
                x={2}
                y={2}
                width={round.piece.width * UNIT - 4}
                height={round.piece.height * UNIT - 4}
                fill={color}
                fillOpacity={0.55}
                stroke={color}
                strokeWidth={2.5}
              />
              {!grab && !solved && (
                <g transform={`translate(${(round.piece.width * UNIT) / 2}, ${(round.piece.height * UNIT) / 2})`}>
                  <circle r={9} fill="#fff" fillOpacity={0.85} />
                  <path
                    d="M -5 0 L 5 0 M 0 -5 L 0 5 M -5 0 L -3 -2 M -5 0 L -3 2 M 5 0 L 3 -2 M 5 0 L 3 2 M 0 -5 L -2 -3 M 0 -5 L 2 -3 M 0 5 L -2 3 M 0 5 L 2 3"
                    stroke={color}
                    strokeWidth={1.6}
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>
              )}
            </motion.g>
          </svg>
          <p className="mt-1 text-xs text-muted-foreground">
            Chwyć jaśniejszy kawałek i przeciągnij go po kratkach. Przerywana ramka pokazuje, ile
            miejsca zajmuje cała figura — gdy wypełni ją bez luk, będzie prostokątem.
          </p>
        </div>

        <div>
          <div className="border p-4" style={{ backgroundColor: `${color}0d` }}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pole figury</p>
            <p className="font-mono text-3xl font-bold tabular-nums" style={{ color }}>
              {figure.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              kratek — ta liczba nie zmienia się przy żadnym przesunięciu
            </p>
          </div>

          {solved && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 border-l-2 px-3 py-2 text-sm leading-relaxed"
              style={{ borderColor: color, backgroundColor: `${color}0f` }}
            >
              {round.moral}
            </motion.p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {solved ? (
              <Button size="sm" onClick={next} style={{ backgroundColor: color }}>
                {isLast ? 'Zakończ' : 'Następna figura'}
              </Button>
            ) : (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Move className="h-4 w-4" aria-hidden /> Przeciągnij kawałek na miejsce
              </p>
            )}
            <Button size="sm" variant="ghost" onClick={reset}>
              <RotateCcw className="mr-1 h-4 w-4" aria-hidden /> Cofnij
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
