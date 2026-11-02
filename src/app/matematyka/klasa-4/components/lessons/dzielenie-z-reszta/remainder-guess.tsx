'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface Round {
  dividend: number;
  divisor: number;
}

const ROUNDS: Round[] = [
  { dividend: 24, divisor: 6 },
  { dividend: 25, divisor: 6 },
  { dividend: 30, divisor: 5 },
  { dividend: 22, divisor: 4 },
];

type Guess = 'equal' | 'remainder';

interface RemainderGuessProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: bez liczenia reszty — czy to dzielenie wyjdzie równo, korzystając z tabliczki mnożenia? */
export function RemainderGuess({ color, onComplete }: RemainderGuessProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Guess | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];
  const remainder = round.dividend % round.divisor;
  const correct: Guess = remainder === 0 ? 'equal' : 'remainder';

  const pick = (guess: Guess) => {
    if (picked) return;
    setPicked(guess);
    if (guess === correct) setScore((prev) => prev + 1);
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
        <h3 className="mb-2 text-xl font-bold">Nie każde dzielenie wychodzi równo</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Kiedy liczba nie jest w tabliczce mnożenia danego dzielnika, zawsze zostaje jakaś reszta.
          W tej lekcji nauczysz się ją policzyć.
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
          <h3 className="mb-4 text-center font-mono text-2xl font-black tabular-nums sm:text-3xl" style={{ color }}>
            {round.dividend} : {round.divisor}
          </h3>
          <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
            Bez liczenia — skorzystaj z tabliczki mnożenia. Wyjdzie równo, czy zostanie reszta?
          </p>

          <div className="grid grid-cols-2 gap-3">
            {(['equal', 'remainder'] as const).map((guess) => {
              const label = guess === 'equal' ? 'Wyjdzie równo' : 'Zostanie reszta';
              const isAnswer = correct === guess;
              const isPicked = picked === guess;
              const reveal = picked !== null;

              return (
                <button
                  key={guess}
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
                  {label}
                </button>
              );
            })}
          </div>

          {picked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-4 p-4 text-sm leading-relaxed',
                picked === correct
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <strong>{picked === correct ? 'Dobrze! ' : 'Prawie. '}</strong>
              {remainder === 0
                ? `${round.dividend} : ${round.divisor} = ${round.dividend / round.divisor} — to jest w tabliczce mnożenia, więc wychodzi równo.`
                : `${round.dividend} nie jest w tabliczce mnożenia przez ${round.divisor} (najbliższe to ${
                    round.dividend - remainder
                  }), więc zostaje reszta ${remainder}.`}
            </motion.div>
          )}

          {picked && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>{index + 1 < ROUNDS.length ? 'Następna runda' : 'Zakończ'}</Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
