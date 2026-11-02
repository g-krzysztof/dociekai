'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Opening = 'maly' | 'duzy';

interface Scene {
  id: string;
  text: string;
  correct: Opening;
  explanation: string;
}

const OPTIONS: { key: Opening; label: string }[] = [
  { key: 'maly', label: 'Mały kąt otwarcia' },
  { key: 'duzy', label: 'Duży kąt otwarcia' },
];

const SCENES: Scene[] = [
  {
    id: 'nozyczki',
    text: 'Nożyczki uchylone tylko odrobinę, żeby przeciąć cienką nitkę.',
    correct: 'maly',
    explanation: 'Ostrza rozeszły się bardzo niewiele — ramiona kąta są blisko siebie, więc kąt otwarcia jest mały.',
  },
  {
    id: 'drzwi',
    text: 'Drzwi otwarte na oścież, aż prawie dotykają ściany.',
    correct: 'duzy',
    explanation: 'Skrzydło drzwi odsunęło się od framugi bardzo daleko — ramiona kąta rozeszły się szeroko.',
  },
  {
    id: 'ksiazka',
    text: 'Książka rozłożona płasko, obie okładki leżą prawie w jednej linii.',
    correct: 'duzy',
    explanation: 'Okładki leżą niemal na wprost siebie — to jeden z największych możliwych kątów otwarcia.',
  },
  {
    id: 'wachlarz',
    text: 'Wachlarz złożony prawie do końca, została tylko wąska szczelina.',
    correct: 'maly',
    explanation: 'Listewki wachlarza są prawie na sobie — kąt między skrajnymi ramionami jest mały.',
  },
];

interface AnglesAroundUsProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: intuicja przed definicją — cztery sceny z życia, każda z innym kątem otwarcia. */
export function AnglesAroundUs({ color, onComplete }: AnglesAroundUsProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Opening | null>(null);
  const [shakeKey, setShakeKey] = useState<Opening | null>(null);

  const scene = SCENES[index];
  const isLast = index === SCENES.length - 1;
  const solved = picked === scene.correct;

  const pick = (key: Opening) => {
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
      <p className="mb-4 text-sm text-muted-foreground">Jaki jest tu kąt otwarcia?</p>

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
          <Button onClick={next}>{isLast ? 'Do wierzchołka i ramion' : 'Następna scena'}</Button>
        </div>
      )}
    </div>
  );
}
