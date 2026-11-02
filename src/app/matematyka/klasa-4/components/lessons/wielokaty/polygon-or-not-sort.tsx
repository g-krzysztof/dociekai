'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { polygonPoints, pointsToString } from './polygon-geometry';

type Verdict = 'wielokat' | 'nie';

interface Round {
  id: string;
  verdict: Verdict;
  explanation: string;
  shape: () => React.ReactNode;
}

const REGULAR_TRIANGLE = pointsToString(polygonPoints({ x: 145, y: 90 }, 65, 3, -90));
const REGULAR_HEXAGON = pointsToString(polygonPoints({ x: 145, y: 90 }, 62, 6, -90));
const IRREGULAR_QUAD = pointsToString([
  { x: 115, y: 35 },
  { x: 205, y: 60 },
  { x: 185, y: 145 },
  { x: 90, y: 120 },
]);

const ROUNDS: Round[] = [
  {
    id: 'trojkat',
    verdict: 'wielokat',
    explanation: 'To trójkąt — ma 3 proste boki i jest zamknięty. To wielokąt.',
    shape: () => <polygon points={REGULAR_TRIANGLE} fill="currentColor" fillOpacity={0.14} stroke="currentColor" strokeWidth={3} strokeLinejoin="round" />,
  },
  {
    id: 'okrag',
    verdict: 'nie',
    explanation: 'Nie ma żadnych prostych boków ani wierzchołków — to nie jest wielokąt.',
    shape: () => <circle cx={145} cy={90} r={62} fill="currentColor" fillOpacity={0.14} stroke="currentColor" strokeWidth={3} />,
  },
  {
    id: 'czworokat-nieregularny',
    verdict: 'wielokat',
    explanation: 'Ma 4 proste boki i jest zamknięty, mimo że nie jest równy jak kwadrat. To nadal wielokąt — czworokąt.',
    shape: () => <polygon points={IRREGULAR_QUAD} fill="currentColor" fillOpacity={0.14} stroke="currentColor" strokeWidth={3} strokeLinejoin="round" />,
  },
  {
    id: 'lamana-otwarta',
    verdict: 'nie',
    explanation: 'Boki są proste, ale figura nie jest zamknięta — brakuje jednego boku. To nie jest wielokąt.',
    shape: () => (
      <polyline
        points="70,140 100,45 160,120 210,50"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    id: 'szesciokat',
    verdict: 'wielokat',
    explanation: 'To sześciokąt — 6 prostych boków, zamknięty. To wielokąt.',
    shape: () => <polygon points={REGULAR_HEXAGON} fill="currentColor" fillOpacity={0.14} stroke="currentColor" strokeWidth={3} strokeLinejoin="round" />,
  },
  {
    id: 'polksiezyc',
    verdict: 'nie',
    explanation: 'Jeden bok jest zakrzywiony (łuk), a wielokąt musi mieć wszystkie boki proste — to nie jest wielokąt.',
    shape: () => (
      <path
        d="M 85 55 L 205 55 A 65 65 0 0 1 85 55 Z"
        fill="currentColor"
        fillOpacity={0.14}
        stroke="currentColor"
        strokeWidth={3}
        strokeLinejoin="round"
      />
    ),
  },
];

const OPTIONS: { key: Verdict; label: string }[] = [
  { key: 'wielokat', label: 'Wielokąt' },
  { key: 'nie', label: 'To nie wielokąt' },
];

interface PolygonOrNotSortProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: intuicyjna klasyfikacja sześciu figur jako wielokąt / nie wielokąt, bez formalnej definicji. */
export function PolygonOrNotSort({ color, onComplete }: PolygonOrNotSortProps) {
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

      <p className="mb-4 text-center text-sm font-semibold sm:text-base">Wielokąt czy nie?</p>

      <svg
        viewBox="0 0 290 180"
        className="mx-auto h-auto w-full max-w-[280px]"
        style={{ color: solved ? '#10b981' : color }}
        role="img"
        aria-label="Figura do sklasyfikowania jako wielokąt lub nie"
      >
        {round.shape()}
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
