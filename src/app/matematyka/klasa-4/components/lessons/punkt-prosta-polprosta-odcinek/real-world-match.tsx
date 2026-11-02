'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GeoKind } from './geo-figure';

interface Scene {
  id: string;
  text: string;
  correct: GeoKind;
  explanation: string;
}

const OPTIONS: { key: GeoKind; label: string }[] = [
  { key: 'punkt', label: 'Punkt' },
  { key: 'prosta', label: 'Prosta' },
  { key: 'polprosta', label: 'Półprosta' },
  { key: 'odcinek', label: 'Odcinek' },
];

const SCENES: Scene[] = [
  {
    id: 'latarka',
    text: 'Promień latarki świecącej w ciemnym pokoju.',
    correct: 'polprosta',
    explanation: 'Światło zaczyna się w latarce (jeden początek) i świeci dalej — to półprosta.',
  },
  {
    id: 'linijka',
    text: 'Krawędź linijki od znaczka 0 cm do znaczka 20 cm.',
    correct: 'odcinek',
    explanation: 'Dwa wyraźne końce (0 cm i 20 cm) — to odcinek, ma dokładną, mierzalną długość.',
  },
  {
    id: 'olowek',
    text: 'Czubek świeżo zaostrzonego ołówka, dotykający kartki.',
    correct: 'punkt',
    explanation: 'To dokładne miejsce dotyku — bez rozmiaru, bez długości. Punkt.',
  },
  {
    id: 'tory',
    text: 'Proste tory kolejowe, które biegną do samego horyzontu — w obie strony.',
    correct: 'prosta',
    explanation: 'Żadnego początku, żadnego końca, w obie strony — to prosta.',
  },
];

interface RealWorldMatchProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: intuicja przed definicją — cztery sceny z życia, każda pasuje do innego z czterech obiektów. */
export function RealWorldMatch({ color, onComplete }: RealWorldMatchProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<GeoKind | null>(null);
  const [shakeKey, setShakeKey] = useState<GeoKind | null>(null);

  const scene = SCENES[index];
  const isLast = index === SCENES.length - 1;
  const solved = picked === scene.correct;

  const pick = (key: GeoKind) => {
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
      <p className="mb-4 text-sm text-muted-foreground">Który to obiekt geometryczny?</p>

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
