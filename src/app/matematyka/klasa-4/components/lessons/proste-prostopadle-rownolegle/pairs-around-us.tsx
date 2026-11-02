'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Relation = 'prostopadle' | 'rownolegle';

interface Scene {
  id: string;
  text: string;
  correct: Relation;
  explanation: string;
}

const OPTIONS: { key: Relation; label: string; symbol: string }[] = [
  { key: 'prostopadle', label: 'Prostopadłe', symbol: '⊥' },
  { key: 'rownolegle', label: 'Równoległe', symbol: '∥' },
];

const SCENES: Scene[] = [
  {
    id: 'tory',
    text: 'Dwa proste tory kolejowe biegnące w dal.',
    correct: 'rownolegle',
    explanation:
      'Tory nigdy się nie przetną i cały czas są w tej samej odległości — to proste równoległe (∥).',
  },
  {
    id: 'zeszyt',
    text: 'Górna i lewa krawędź kartki w zeszycie.',
    correct: 'prostopadle',
    explanation:
      'Obie krawędzie spotykają się w rogu kartki pod kątem prostym (90°) — to proste prostopadłe (⊥).',
  },
  {
    id: 'szczeble',
    text: 'Szczeble drabiny — poziome listewki między dwoma bokami.',
    correct: 'rownolegle',
    explanation:
      'Każdy szczebel jest równoległy do pozostałych — nigdy się nie przecinają, odstęp między nimi jest zawsze ten sam.',
  },
  {
    id: 'okno',
    text: 'Pozioma dolna rama okna i pionowy słupek.',
    correct: 'prostopadle',
    explanation:
      'Dolna rama i słupek spotykają się w rogu okna pod kątem prostym — dokładnie tak, jak ramiona ekierki.',
  },
];

interface PairsAroundUsProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: intuicja przed definicją — cztery sceny z życia, każda z parą prostych w jednej z dwóch relacji. */
export function PairsAroundUs({ color, onComplete }: PairsAroundUsProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Relation | null>(null);
  const [shakeKey, setShakeKey] = useState<Relation | null>(null);

  const scene = SCENES[index];
  const isLast = index === SCENES.length - 1;
  const solved = picked === scene.correct;

  const pick = (key: Relation) => {
    if (solved) return;
    if (key === scene.correct) {
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
        {SCENES.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{SCENES.length}
        </span>
      </div>

      <p className="mb-5 text-lg font-bold leading-snug sm:text-xl">{scene.text}</p>
      <p className="mb-4 text-sm text-muted-foreground">
        Jakie są te proste: prostopadłe czy równoległe?
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const isCorrectPick = solved && option.key === scene.correct;
          return (
            <motion.button
              key={option.key}
              type="button"
              onClick={() => pick(option.key)}
              disabled={solved}
              animate={shakeKey === option.key ? { x: [0, -6, 6, -6, 6, 0] } : undefined}
              transition={{ duration: 0.4 }}
              className={cn(
                'cursor-pointer border px-4 py-3 text-left text-sm font-semibold transition-all disabled:cursor-not-allowed sm:text-base',
                !solved && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                solved && !isCorrectPick && 'opacity-55'
              )}
              style={isCorrectPick ? { borderColor: color, backgroundColor: `${color}14`, color } : undefined}
            >
              <span className="mr-2 font-mono" style={{ color }}>
                {option.symbol}
              </span>
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
          {scene.explanation}
        </motion.div>
      )}

      {solved && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>{isLast ? 'Do definicji' : 'Następna scena'}</Button>
        </div>
      )}
    </div>
  );
}