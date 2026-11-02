'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NumberLine } from '../../number-line';

interface Example {
  min: number;
  max: number;
  majorStep: number;
  minorStep: number;
  value: number;
  steps: string[];
}

const EXAMPLES: Example[] = [
  {
    min: 20,
    max: 50,
    majorStep: 10,
    minorStep: 2,
    value: 36,
    steps: [
      'Sąsiednie duże kreski to 30 i 40.',
      'Między nimi jest 5 mniejszych odstępów, więc jeden odstęp to (40 − 30) : 5 = 2.',
      'Punkt jest 3 odstępy dalej niż 30, czyli 30 + 3 × 2 = 36.',
    ],
  },
  {
    min: 2000,
    max: 5000,
    majorStep: 1000,
    minorStep: 200,
    value: 3400,
    steps: [
      'Sąsiednie duże kreski to 3000 i 4000.',
      'Między nimi jest 5 mniejszych odstępów, więc jeden odstęp to (4000 − 3000) : 5 = 200.',
      'Punkt jest 2 odstępy dalej niż 3000, czyli 3000 + 2 × 200 = 3400.',
    ],
  },
  {
    min: 300000,
    max: 600000,
    majorStep: 100000,
    minorStep: 20000,
    value: 480000,
    steps: [
      'Sąsiednie duże kreski to 400 000 i 500 000.',
      'Między nimi jest 5 mniejszych odstępów, więc jeden odstęp to (500 000 − 400 000) : 5 = 20 000.',
      'Punkt jest 4 odstępy dalej niż 400 000, czyli 400 000 + 4 × 20 000 = 480 000.',
    ],
  },
];

interface LineReadingExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: odczytujemy wartość niepodpisanego punktu krok po kroku, na coraz większej skali. */
export function LineReadingExamples({ color, onComplete }: LineReadingExamplesProps) {
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
          <div className="mb-5">
            <NumberLine
              min={example.min}
              max={example.max}
              majorStep={example.majorStep}
              minorStep={example.minorStep}
              color={color}
              markers={[
                {
                  value: example.value,
                  color: allRevealed ? '#10b981' : color,
                  label: allRevealed ? example.value.toLocaleString('pl-PL') : '?',
                },
              ]}
              ariaLabel={`Oś liczbowa od ${example.min} do ${example.max} z zaznaczonym, nieopisanym punktem`}
            />
          </div>

          <div className="min-h-[5.5rem] border-t pt-4">
            <ol className="space-y-2">
              {example.steps.slice(0, reveal).map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed sm:text-base">
                  <span className="w-5 shrink-0 font-mono font-bold tabular-nums" style={{ color }}>
                    {i + 1}.
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            {reveal === 0 && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Volume2 className="h-4 w-4 shrink-0" aria-hidden />
                Ile wynosi zaznaczony punkt? Kliknij „Dalej”, żeby rozłożyć to na kroki.
              </p>
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <Button onClick={advance}>
              {!allRevealed ? 'Dalej' : finishedAll ? 'Zakończ przykłady' : 'Następny przykład'}
              {!finishedAll && <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
