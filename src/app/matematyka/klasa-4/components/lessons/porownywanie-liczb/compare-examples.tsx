'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Example {
  a: number;
  b: number;
  symbol: '<' | '>' | '=';
  steps: string[];
}

const EXAMPLES: Example[] = [
  {
    a: 812,
    b: 79,
    symbol: '>',
    steps: ['812 ma 3 cyfry, a 79 ma tylko 2 cyfry.', 'Więcej cyfr — większa liczba.', '812 > 79.'],
  },
  {
    a: 6234,
    b: 6801,
    symbol: '<',
    steps: [
      'Obie liczby mają 4 cyfry.',
      'Pierwsza cyfra: 6 = 6 — sprawdzamy dalej.',
      'Druga cyfra: 2 < 8 — już wiadomo.',
      '6234 < 6801.',
    ],
  },
  {
    a: 382450,
    b: 382409,
    symbol: '>',
    steps: [
      'Obie liczby mają 6 cyfr.',
      'Cztery pierwsze cyfry są takie same: 3-8-2-4.',
      'Piąta cyfra: 5 > 0 — tu jest różnica.',
      '382450 > 382409.',
    ],
  },
];

interface CompareExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: pełne rozumowanie porównania liczb, krok po kroku, na trzech różnych przypadkach. */
export function CompareExamples({ color, onComplete }: CompareExamplesProps) {
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(0);

  const example = EXAMPLES[index];
  const allRevealed = reveal >= example.steps.length;
  const isLastExample = index === EXAMPLES.length - 1;
  const finishedAll = isLastExample && allRevealed;

  const advance = () => {
    if (!allRevealed) {
      setReveal((prev) => prev + 1);
      return;
    }
    if (index + 1 < EXAMPLES.length) {
      setIndex((prev) => prev + 1);
      setReveal(0);
      return;
    }
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {EXAMPLES.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{EXAMPLES.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <div className="mb-5 flex items-center justify-center gap-3 p-4" style={{ backgroundColor: `${color}0f` }}>
            <span className="font-mono text-xl font-bold tabular-nums sm:text-2xl">
              {example.a.toLocaleString('pl-PL')}
            </span>
            <span
              className="font-mono text-2xl font-black sm:text-3xl"
              style={{ color: allRevealed ? color : 'var(--muted-foreground)' }}
            >
              {allRevealed ? example.symbol : '?'}
            </span>
            <span className="font-mono text-xl font-bold tabular-nums sm:text-2xl">
              {example.b.toLocaleString('pl-PL')}
            </span>
          </div>

          <ol className="min-h-[6rem] space-y-2">
            {example.steps.slice(0, reveal).map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm leading-relaxed sm:text-base">
                <span className="w-5 shrink-0 font-mono font-bold tabular-nums" style={{ color }}>
                  {i + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>

          <div className="mt-5 flex justify-end">
            <Button onClick={advance}>
              {!allRevealed
                ? 'Dalej'
                : finishedAll
                  ? 'Zakończ przykłady'
                  : 'Następny przykład'}
              {!finishedAll && <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
