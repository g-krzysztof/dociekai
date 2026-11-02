'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface CompareRound {
  id: string;
  subject: string;
  a: number;
  b: number;
}

const ROUNDS: CompareRound[] = [
  { id: 'samolot', subject: 'Model samolotu', a: 24, b: 144 },
  { id: 'mieszkanie', subject: 'Plan mieszkania', a: 200, b: 50 },
  { id: 'mapa', subject: 'Mapa miasta', a: 25000, b: 5000 },
  { id: 'figurka', subject: 'Figurka kolekcjonerska', a: 12, b: 6 },
];

interface ScaleCompareWarmupProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: który rysunek tego samego przedmiotu będzie większy — mniejsza czy większa druga liczba skali? Ten sam mechanizm co „Prawda/Mit" (`myth-check.tsx`), tu zastosowany do porównania dwóch skal. */
export function ScaleCompareWarmup({ color, onComplete }: ScaleCompareWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const containerRef = useSectionScrollAnchor(`${index}`);

  const round = ROUNDS[index];
  const correct = Math.min(round.a, round.b);
  const isLast = index === ROUNDS.length - 1;

  const choose = (value: number) => {
    if (picked !== null) return;
    setPicked(value);
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
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{ROUNDS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={round.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
          <p className="mb-4 text-center text-sm font-semibold sm:text-base">
            {round.subject}: który rysunek będzie <strong>większy</strong>?
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[round.a, round.b].map((value) => {
              const isCorrect = value === correct;
              const isPicked = value === picked;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => choose(value)}
                  disabled={picked !== null}
                  className={cn(
                    'flex flex-col items-center gap-1 border px-4 py-5 font-mono text-lg font-bold tabular-nums transition-all disabled:cursor-not-allowed',
                    picked === null && 'hover:-translate-y-0.5 hover:shadow-md',
                    picked !== null && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    isPicked && !isCorrect && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    picked !== null && !isPicked && !isCorrect && 'opacity-50'
                  )}
                  style={picked === null ? { borderColor: `${color}55`, color } : undefined}
                >
                  1:{value}
                  {isPicked && (isCorrect ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-rose-600" />)}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-sm leading-relaxed text-muted-foreground"
            >
              Mniejsza druga liczba (1:{correct}) pomniejsza mniej — rysunek wychodzi większy.
            </motion.p>
          )}

          {picked !== null && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>{isLast ? 'Dalej' : 'Następna para'}</Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
