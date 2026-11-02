'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkedExample {
  id: string;
  skeleton: string;
  reveal: string;
  formula: string;
}

const EXAMPLES: WorkedExample[] = [
  {
    id: 'parking',
    skeleton: 'Szkielet: „Na parkingu stało ___ samochodów. Przyjechało jeszcze ___ samochodów. Ile jest teraz samochodów razem?” Cel: wynik 20.',
    reveal: 'Na parkingu stało 12 samochodów. Przyjechało jeszcze 8 samochodów.',
    formula: '12 + 8 = 20',
  },
  {
    id: 'zagadka-dzielenie',
    skeleton: 'Szkielet zagadki: „Jestem liczbą, która po podzieleniu przez 5 daje 6. Jaką jestem liczbą?”',
    reveal: 'Skoro liczba podzielona przez 5 daje 6, to znaczy, że jest to 6 piątek złożonych w jedną liczbę.',
    formula: '6 × 5 = 30',
  },
];

interface BuilderWorkedExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: dwa gotowe wzorce — jeden zwykłe zadanie tekstowe, jeden zagadka liczbowa — ten sam rytm „ukryte → pokaż" co inne showcase'y w kursie. */
export function BuilderWorkedExamples({ color, onComplete }: BuilderWorkedExamplesProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setRevealed(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {EXAMPLES.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{EXAMPLES.length}
        </span>
      </div>

      <p className="mb-4 text-sm leading-relaxed sm:text-base">{example.skeleton}</p>

      {!revealed ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Zap className="h-4 w-4" aria-hidden />
            Zobacz gotowe zadanie
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 p-4 dark:bg-emerald-950/40">
          <p className="text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">{example.reveal}</p>
          <p className="mt-2 text-center font-mono text-lg font-bold tabular-nums text-emerald-900 dark:text-emerald-100">{example.formula}</p>
        </motion.div>
      )}

      {revealed && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
            {isLast ? 'Do ćwiczeń' : 'Kolejny przykład'}
          </Button>
        </div>
      )}
    </div>
  );
}
