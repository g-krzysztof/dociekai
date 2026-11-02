'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface Round {
  value: number;
  root: number | null;
}

const ROUNDS: Round[] = [
  { value: 16, root: 4 },
  { value: 20, root: null },
  { value: 36, root: 6 },
  { value: 40, root: null },
];

interface SquareSpotterProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: bez liczenia — czy ta liczba to liczba kwadratowa (wynik mnożenia liczby przez samą siebie)? */
export function SquareSpotter({ color, onComplete }: SquareSpotterProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];
  const isSquare = round.root !== null;

  const pick = (guess: boolean) => {
    if (picked !== null) return;
    setPicked(guess);
    if (guess === isSquare) setScore((prev) => prev + 1);
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
        <h3 className="mb-2 text-xl font-bold">Liczby kwadratowe mają swój wzór</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          1, 4, 9, 16, 25, 36… to wyniki mnożenia liczby przez samą siebie. W tej lekcji zobaczysz
          dokładnie, skąd się biorą — i poznasz ich przestrzennego kuzyna, sześcian.
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
          <h3 className="mb-4 text-center font-mono text-3xl font-black tabular-nums sm:text-4xl" style={{ color }}>
            {round.value}
          </h3>
          <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
            Czy tę liczbę da się otrzymać, mnożąc jakąś liczbę przez samą siebie?
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[true, false].map((guess) => {
              const isAnswer = isSquare === guess;
              const isPicked = picked === guess;
              const reveal = picked !== null;

              return (
                <button
                  key={String(guess)}
                  type="button"
                  onClick={() => pick(guess)}
                  disabled={reveal}
                  className={cn(
                    'flex items-center justify-center gap-2 border px-4 py-5 text-center text-sm font-semibold transition-all disabled:cursor-not-allowed sm:text-base',
                    !reveal && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    reveal && isAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !isAnswer && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isAnswer && 'opacity-55'
                  )}
                >
                  {reveal && isAnswer && <Check className="h-4 w-4 shrink-0" />}
                  {reveal && isPicked && !isAnswer && <X className="h-4 w-4 shrink-0" />}
                  {guess ? 'Tak, to kwadratowa' : 'Nie, to nie ona'}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-4 p-4 text-sm leading-relaxed',
                picked === isSquare
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <strong>{picked === isSquare ? 'Dobrze! ' : 'Prawie. '}</strong>
              {isSquare
                ? `${round.value} to liczba kwadratowa: ${round.root} × ${round.root} = ${round.value}.`
                : `${round.value} nie jest liczbą kwadratową — żadna liczba pomnożona przez samą siebie nie da akurat ${round.value}.`}
            </motion.div>
          )}

          {picked !== null && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>{index + 1 < ROUNDS.length ? 'Następna runda' : 'Zakończ'}</Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
