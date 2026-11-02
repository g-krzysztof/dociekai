'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface Round {
  a: number;
  b: number;
  c: number;
  d: number;
  note: string;
}

/** Ostatnie trzy pary celowo pokazują ten sam wzór: kwadrat liczby jest zawsze
 * o 1 większy niż iloczyn jej sąsiadów — powtórzenie ma zbudować to skojarzenie. */
const ROUNDS: Round[] = [
  { a: 6, b: 7, c: 5, d: 9, note: '5 × 9 = 45, a 6 × 7 = 42 — mimo podobnych liczb, prawa strona wygrywa.' },
  { a: 8, b: 4, c: 4, d: 9, note: '4 × 9 = 36 jest większe niż 8 × 4 = 32.' },
  { a: 9, b: 9, c: 8, d: 10, note: '9 × 9 = 81, a 8 × 10 = 80 — bardzo blisko, ale kwadrat wygrywa o 1.' },
  { a: 7, b: 7, c: 6, d: 8, note: '7 × 7 = 49, a 6 × 8 = 48. Kwadrat liczby jest zawsze o 1 większy niż iloczyn jej sąsiadów.' },
  { a: 6, b: 6, c: 5, d: 7, note: '6 × 6 = 36, a 5 × 7 = 35 — dokładnie ten sam wzór co przed chwilą.' },
  { a: 8, b: 8, c: 7, d: 9, note: '8 × 8 = 64, a 7 × 9 = 63. Ten wzór działa zawsze — warto go zapamiętać.' },
];

interface ProductDuelProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: pojedynek dwóch iloczynów — kliknij większy, bez liczenia na kartce. */
export function ProductDuel({ color, onComplete }: ProductDuelProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<'left' | 'right' | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];
  const left = round.a * round.b;
  const right = round.c * round.d;
  const answer: 'left' | 'right' = left > right ? 'left' : 'right';

  const pick = (side: 'left' | 'right') => {
    if (picked !== null) return;
    setPicked(side);
    if (side === answer) setScore((prev) => prev + 1);
  };

  const next = () => {
    if (index + 1 < ROUNDS.length) {
      setIndex((prev) => prev + 1);
      setPicked(null);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-extrabold"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          {score}/{ROUNDS.length}
        </motion.div>
        <h3 className="mb-2 text-xl font-bold">Wyczucie masz — teraz czas na tabliczkę</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Im lepiej znasz tabliczkę mnożenia, tym szybciej porównujesz iloczyny bez liczenia w
          słupku. Zaraz poznasz sztuczkę, dzięki której mnożenie i dzielenie idą razem.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
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

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <h3 className="mb-5 text-center text-lg font-bold leading-snug sm:text-xl">
            Który iloczyn jest większy?
          </h3>

          <div className="flex items-stretch gap-4">
            {[
              { side: 'left' as const, a: round.a, b: round.b, value: left },
              { side: 'right' as const, a: round.c, b: round.d, value: right },
            ].map(({ side, a, b, value }) => {
              const isPicked = picked === side;
              const isAnswer = side === answer;
              const reveal = picked !== null;
              return (
                <button
                  key={side}
                  type="button"
                  onClick={() => pick(side)}
                  disabled={reveal}
                  className={cn(
                    'flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 border px-6 py-8 transition-all disabled:cursor-not-allowed',
                    !reveal && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    reveal && isAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !isAnswer && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isAnswer && 'opacity-55'
                  )}
                >
                  {reveal && (isAnswer ? <Check className="h-5 w-5 text-emerald-600" /> : isPicked ? <X className="h-5 w-5 text-rose-500" /> : null)}
                  <span className="font-mono text-2xl font-black tabular-nums sm:text-3xl" style={{ color: reveal && !isAnswer ? undefined : color }}>
                    {a} × {b}
                  </span>
                  {reveal && (
                    <span className="font-mono text-sm font-semibold text-muted-foreground tabular-nums">
                      = {value}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-4 flex items-start gap-3 p-4 text-sm leading-relaxed',
                picked === answer
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                <strong>{picked === answer ? 'Dobrze! ' : 'Prawie. '}</strong>
                {round.note}
              </p>
            </motion.div>
          )}

          {picked !== null && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={next}
                className="cursor-pointer border px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: color }}
              >
                {index + 1 < ROUNDS.length ? 'Następna para' : 'Zakończ'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
