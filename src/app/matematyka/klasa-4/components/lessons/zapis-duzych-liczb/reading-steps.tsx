'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CLASS_LABELS, digitGroups, type ClassName } from './place-value';

interface Example {
  value: number;
  /** Fragmenty słowne w kolejności klas (od lewej), zsynchronizowane z `digitGroups(value)`. */
  parts: { className: ClassName; words: string }[];
  full: string;
}

const EXAMPLES: Example[] = [
  {
    value: 82_004,
    parts: [
      { className: 'tysiące', words: 'osiemdziesiąt dwa tysiące' },
      { className: 'jedności', words: 'cztery' },
    ],
    full: 'osiemdziesiąt dwa tysiące cztery',
  },
  {
    value: 630_040,
    parts: [
      { className: 'tysiące', words: 'sześćset trzydzieści tysięcy' },
      { className: 'jedności', words: 'czterdzieści' },
    ],
    full: 'sześćset trzydzieści tysięcy czterdzieści',
  },
  {
    value: 3_070_500,
    parts: [
      { className: 'miliony', words: 'trzy miliony' },
      { className: 'tysiące', words: 'siedemdziesiąt tysięcy' },
      { className: 'jedności', words: 'pięćset' },
    ],
    full: 'trzy miliony siedemdziesiąt tysięcy pięćset',
  },
];

interface ReadingStepsProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: 3 liczby czytane krok po kroku, klasa po klasie. */
export function ReadingSteps({ color, onComplete }: ReadingStepsProps) {
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(0);

  const example = EXAMPLES[index];
  const groups = digitGroups(example.value);
  const allRevealed = reveal >= example.parts.length;
  const moduleTextColor = `color-mix(in oklch, ${color} 88%, black)`;

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

  const isLastExample = index === EXAMPLES.length - 1;
  const finishedAll = isLastExample && allRevealed;

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
          {/* Liczba pogrupowana w klasy */}
          <div className="mb-6 flex flex-wrap items-end justify-center gap-x-5 gap-y-3">
            {groups.map((group, gi) => {
              const isActive = gi === reveal - 1 || (allRevealed && gi < example.parts.length);
              const isUpcoming = gi >= reveal;
              return (
                <div key={gi} className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'flex gap-1 border px-2 py-1.5 transition-colors',
                      isActive && !isUpcoming && 'border-2'
                    )}
                    style={
                      !isUpcoming
                        ? { borderColor: `${color}80`, backgroundColor: `${color}0f` }
                        : undefined
                    }
                  >
                    {group.digits.map((digit, di) => (
                      <span
                        key={di}
                        className="font-mono text-2xl font-bold tabular-nums sm:text-3xl"
                        style={{ color: isUpcoming ? 'var(--muted-foreground)' : color }}
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {CLASS_LABELS[group.className]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Odczyt budowany klasa po klasie */}
          <div className="min-h-[3.5rem] border-t pt-4">
            <p className="flex items-start gap-2 text-lg font-bold leading-snug sm:text-xl">
              <Volume2 className="mt-1 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
              <span>
                {reveal === 0 && <span className="text-muted-foreground">…</span>}
                {example.parts.slice(0, reveal).map((part, i) => (
                  <span key={i} style={{ color: moduleTextColor }}>
                    {i > 0 ? ' ' : ''}
                    {part.words}
                  </span>
                ))}
              </span>
            </p>
            {allRevealed && (
              <p className="mt-2 text-sm text-muted-foreground">
                Zapisujemy: <strong className="font-mono">{example.full}</strong>
              </p>
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <Button onClick={advance}>
              {!allRevealed
                ? 'Czytaj dalej'
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
