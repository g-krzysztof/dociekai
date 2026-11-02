'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { polygonPoints, pointsToString, POLYGON_NAMES } from './polygon-geometry';

interface Round {
  id: string;
  sides: number;
  patchLabel: string;
  question: string;
  options: number[];
  explanation: string;
}

const ROUNDS: Round[] = [
  {
    id: 'czarna-lata',
    sides: 5,
    patchLabel: 'czarna łata',
    question: 'Przyjrzyj się czarnej łacie na piłce. Ile ma boków?',
    options: [4, 5, 6, 8],
    explanation: 'Czarna łata ma 5 boków — to pięciokąt. Klasyczna piłka ma 12 takich łat.',
  },
  {
    id: 'biala-lata',
    sides: 6,
    patchLabel: 'biała łata',
    question: 'A ile boków ma biała łata, obok niej?',
    options: [5, 6, 7, 3],
    explanation: 'Biała łata ma 6 boków — to sześciokąt. Klasyczna piłka ma 20 takich łat.',
  },
];

interface SoccerBallCaseProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: piłka nożna zbudowana z pięciokątów i sześciokątów. */
export function SoccerBallCase({ color, onComplete }: SoccerBallCaseProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [shakeValue, setShakeValue] = useState<number | null>(null);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const solved = picked === round.sides;
  const shapePoints = polygonPoints({ x: 80, y: 75 }, 55, round.sides, -90);

  const pick = (value: number) => {
    if (solved) return;
    if (value === round.sides) {
      setPicked(value);
      return;
    }
    setShakeValue(value);
    setTimeout(() => setShakeValue(null), 400);
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

      <div className="grid items-center gap-5 sm:grid-cols-[160px_1fr]">
        <div>
          <svg
            viewBox="0 0 160 150"
            className="mx-auto h-auto w-full max-w-[160px]"
            role="img"
            aria-label={`${round.patchLabel} z piłki nożnej`}
          >
            <polygon
              points={pointsToString(shapePoints)}
              fill={solved ? '#10b981' : `${color}22`}
              stroke={solved ? '#10b981' : color}
              strokeWidth={3}
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-center text-xs font-semibold text-muted-foreground">
            {round.patchLabel}
          </p>
        </div>

        <div>
          <p className="mb-4 text-sm leading-relaxed sm:text-base">{round.question}</p>
          <div className="grid grid-cols-4 gap-2">
            {round.options.map((value) => {
              const isCorrectPick = solved && value === round.sides;
              return (
                <motion.button
                  key={value}
                  type="button"
                  onClick={() => pick(value)}
                  disabled={solved}
                  animate={shakeValue === value ? { x: [0, -6, 6, -6, 6, 0] } : undefined}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    'cursor-pointer border px-2 py-3 text-center font-mono text-base font-bold transition-all disabled:cursor-not-allowed',
                    !solved && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    solved && !isCorrectPick && 'opacity-40'
                  )}
                  style={isCorrectPick ? { borderColor: color, backgroundColor: `${color}14`, color } : undefined}
                >
                  {value}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {solved && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          {round.explanation}
          {isLast && (
            <p className="mt-2">
              Czy zauważyłeś/aś? Piłka ma pięciokąty ({POLYGON_NAMES[5]}) i sześciokąty (
              {POLYGON_NAMES[6]}) obok siebie — nazwa wielokąta nie zależy od koloru ani wielkości,
              tylko od liczby boków.
            </p>
          )}
        </motion.div>
      )}

      {solved && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>{isLast ? 'Do quizu' : 'Kolejna łata'}</Button>
        </div>
      )}
    </div>
  );
}
