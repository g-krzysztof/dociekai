'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { buildPerimeterEdges, formatLength, rectangleCorners, totalPerimeter } from './perimeter-geometry';
import type { GeoPoint } from '../../../lib/lines';

interface CompareShape {
  label: string;
  points: GeoPoint[];
  sideLengths: number[];
  unit: string;
}

interface CompareRound {
  id: string;
  shapes: [CompareShape, CompareShape];
  /** Indeks figury (0 lub 1) z większym obwodem. */
  winner: 0 | 1;
  explanation: string;
}

const VIEW = { width: 140, height: 110 };

const ROUNDS: CompareRound[] = [
  {
    id: 'dlugi-pasek-czy-kwadrat',
    shapes: [
      {
        label: 'Figura A',
        points: rectangleCorners({ x: 28, y: 43 }, 84, 24),
        sideLengths: [7, 2, 7, 2],
        unit: 'cm',
      },
      {
        label: 'Figura B',
        points: rectangleCorners({ x: 46, y: 31 }, 48, 48),
        sideLengths: [4, 4, 4, 4],
        unit: 'cm',
      },
    ],
    winner: 0,
    explanation:
      'Figura B wygląda na bardziej „zwartą”, ale to Figura A ma większy obwód: 7 + 2 + 7 + 2 = 18 cm, a Figura B tylko 4 + 4 + 4 + 4 = 16 cm. Wygląd nie wystarczy — trzeba dodać wszystkie boki.',
  },
  {
    id: 'trojkat-czy-prostokat',
    shapes: [
      {
        label: 'Figura A',
        points: [
          { x: 60.6, y: 39.6 },
          { x: 112, y: 90 },
          { x: 28, y: 90 },
        ],
        sideLengths: [6, 7, 5],
        unit: 'cm',
      },
      {
        label: 'Figura B',
        points: rectangleCorners({ x: 52, y: 13 }, 36, 84),
        sideLengths: [3, 7, 3, 7],
        unit: 'cm',
      },
    ],
    winner: 1,
    explanation:
      'Trójkąt (Figura A) ma tylko trzy boki: 6 + 7 + 5 = 18 cm. Wąski prostokąt (Figura B) ma ich cztery: 3 + 7 + 3 + 7 = 20 cm — mimo że zajmuje mniej miejsca na kartce.',
  },
  {
    id: 'kwadrat-czy-nieregularna',
    shapes: [
      {
        label: 'Figura A',
        points: rectangleCorners({ x: 34, y: 19 }, 72, 72),
        sideLengths: [6, 6, 6, 6],
        unit: 'cm',
      },
      {
        label: 'Figura B',
        points: [
          { x: 20, y: 80 },
          { x: 20, y: 25 },
          { x: 95, y: 15 },
          { x: 110, y: 85 },
        ],
        sideLengths: [4, 6, 6, 6],
        unit: 'cm',
      },
    ],
    winner: 0,
    explanation:
      'Rozlazła Figura B sprawia wrażenie większej, ale jej boki dają 4 + 6 + 6 + 6 = 22 cm. Kwadrat (Figura A) ma wszystkie boki równe: 6 + 6 + 6 + 6 = 24 cm — i to on wygrywa.',
  },
];

interface PerimeterCompareProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: który z dwóch podpisanych wielokątów ma większy obwód — na oko to zwodnicze, liczy się tylko suma boków. */
export function PerimeterCompare({ color, onComplete }: PerimeterCompareProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<0 | 1 | null>(null);
  const [shakeIndex, setShakeIndex] = useState<0 | 1 | null>(null);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const solved = picked === round.winner;

  const pick = (choice: 0 | 1) => {
    if (solved) return;
    if (choice === round.winner) {
      setPicked(choice);
      return;
    }
    setShakeIndex(choice);
    setTimeout(() => setShakeIndex(null), 400);
  };

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setPicked(null);
      return;
    }
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{ROUNDS.length}
        </span>
      </div>

      <p className="mb-4 text-center text-sm font-semibold sm:text-base">
        Która figura ma większy obwód — dłuższy „spacer” dookoła?
      </p>

      <div className="grid grid-cols-2 gap-3">
        {round.shapes.map((shape, i) => {
          const choice = i as 0 | 1;
          const isCorrectPick = solved && choice === round.winner;
          const edges = buildPerimeterEdges(shape.points, shape.sideLengths, 14);

          return (
            <motion.button
              key={shape.label}
              type="button"
              onClick={() => pick(choice)}
              disabled={solved}
              animate={shakeIndex === choice ? { x: [0, -6, 6, -6, 6, 0] } : undefined}
              transition={{ duration: 0.4 }}
              className={cn(
                'cursor-pointer border p-2 text-center transition-all disabled:cursor-not-allowed',
                !solved && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                solved && !isCorrectPick && 'opacity-55'
              )}
              style={isCorrectPick ? { borderColor: color, backgroundColor: `${color}14` } : undefined}
            >
              <svg
                viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
                className="mx-auto h-auto w-full max-w-[150px]"
                style={{ color }}
                role="img"
                aria-label={`${shape.label}: wielokąt do porównania obwodu`}
              >
                <polygon
                  points={shape.points.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="currentColor"
                  fillOpacity={0.12}
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                />
                {edges.map((edge, ei) => (
                  <text
                    key={ei}
                    x={edge.labelPoint.x}
                    y={edge.labelPoint.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 10, fontWeight: 700 }}
                    fill="currentColor"
                  >
                    {formatLength(edge.length, shape.unit)}
                  </text>
                ))}
              </svg>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{shape.label}</p>
              {solved && (
                <p className="mt-0.5 font-mono text-sm font-bold tabular-nums" style={{ color }}>
                  {formatLength(totalPerimeter(shape.sideLengths), shape.unit)}
                </p>
              )}
            </motion.button>
          );
        })}
      </div>

      {solved && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          {round.explanation}
        </motion.div>
      )}

      {solved && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>{isLast ? 'Do nowego pojęcia' : 'Następna para'}</Button>
        </div>
      )}
    </div>
  );
}
