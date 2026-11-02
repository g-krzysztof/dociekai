'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Verdict = 'prostokat' | 'nie';

interface Round {
  id: string;
  verdict: Verdict;
  explanation: string;
  points: string;
}

const ROUNDS: Round[] = [
  {
    id: 'prostokat',
    verdict: 'prostokat',
    explanation: '4 kąty proste i boki naprzeciwległe równe i równoległe — to prostokąt.',
    points: '70,50 220,50 220,110 70,110',
  },
  {
    id: 'kwadrat',
    verdict: 'prostokat',
    explanation:
      'Kwadrat ma 4 kąty proste i boki naprzeciwległe równe — spełnia wszystkie warunki prostokąta, tylko dodatkowo wszystkie boki są równe. To wciąż prostokąt, tylko szczególny.',
    points: '105,35 185,35 185,115 105,115',
  },
  {
    id: 'romb',
    verdict: 'nie',
    explanation: 'Wszystkie boki są równe, ale kąty nie są proste — to nie prostokąt (to romb).',
    points: '145,28 210,90 145,152 80,90',
  },
  {
    id: 'rownoleglobok',
    verdict: 'nie',
    explanation: 'Boki naprzeciwległe są równe i równoległe, ale kąty nie są proste — to nie prostokąt (to równoległobok).',
    points: '92,45 202,45 180,115 70,115',
  },
  {
    id: 'trapez-prostokatny',
    verdict: 'nie',
    explanation: 'Tylko dwa rogi są proste, nie wszystkie cztery — to nie prostokąt (to trapez prostokątny).',
    points: '70,40 190,40 190,130 70,100',
  },
];

const OPTIONS: { key: Verdict; label: string }[] = [
  { key: 'prostokat', label: 'Prostokąt' },
  { key: 'nie', label: 'To nie prostokąt' },
];

interface RectangleOrNotSortProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: intuicyjna klasyfikacja pięciu czworokątów jako prostokąt / nie prostokąt, bez formalnej definicji. */
export function RectangleOrNotSort({ color, onComplete }: RectangleOrNotSortProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Verdict | null>(null);
  const [shakeKey, setShakeKey] = useState<Verdict | null>(null);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const solved = picked === round.verdict;

  const pick = (key: Verdict) => {
    if (solved) return;
    if (key === round.verdict) {
      setPicked(key);
      return;
    }
    setShakeKey(key);
    setTimeout(() => setShakeKey(null), 400);
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

      <p className="mb-4 text-center text-sm font-semibold sm:text-base">Prostokąt czy nie?</p>

      <svg
        viewBox="0 0 290 180"
        className="mx-auto h-auto w-full max-w-[280px]"
        style={{ color: solved ? '#10b981' : color }}
        role="img"
        aria-label="Czworokąt do sklasyfikowania jako prostokąt lub nie"
      >
        <polygon
          points={round.points}
          fill="currentColor"
          fillOpacity={0.14}
          stroke="currentColor"
          strokeWidth={3}
          strokeLinejoin="round"
        />
      </svg>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {OPTIONS.map((option) => {
          const isCorrectPick = solved && option.key === round.verdict;
          return (
            <motion.button
              key={option.key}
              type="button"
              onClick={() => pick(option.key)}
              disabled={solved}
              animate={shakeKey === option.key ? { x: [0, -6, 6, -6, 6, 0] } : undefined}
              transition={{ duration: 0.4 }}
              className={cn(
                'cursor-pointer border px-3 py-3 text-center text-sm font-semibold transition-all disabled:cursor-not-allowed',
                !solved && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                solved && !isCorrectPick && 'opacity-55'
              )}
              style={isCorrectPick ? { borderColor: color, backgroundColor: `${color}14`, color } : undefined}
            >
              {option.label}
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
          <Button onClick={next}>{isLast ? 'Do definicji' : 'Następna figura'}</Button>
        </div>
      )}
    </div>
  );
}
