'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface Round {
  left: string;
  right: string;
  leftValue: number;
  rightValue: number;
}

const ROUNDS: Round[] = [
  { left: '6 × 8', right: '6 × 80', leftValue: 48, rightValue: 480 },
  { left: '9 × 100', right: '90 × 10', leftValue: 900, rightValue: 900 },
  { left: '45 × 10', right: '45 × 100', leftValue: 450, rightValue: 4500 },
  { left: '300 × 10', right: '30 × 100', leftValue: 3000, rightValue: 3000 },
];

type Answer = 'left' | 'right' | 'equal';

function correctAnswerOf(round: Round): Answer {
  if (round.leftValue === round.rightValue) return 'equal';
  return round.leftValue > round.rightValue ? 'left' : 'right';
}

interface ZeroSensDuelProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: bez liczenia na kartce — które działanie da większy wynik, a które tyle samo? */
export function ZeroSensDuel({ color, onComplete }: ZeroSensDuelProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Answer | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];
  const correct = correctAnswerOf(round);

  const pick = (answer: Answer) => {
    if (picked) return;
    setPicked(answer);
    if (answer === correct) setScore((prev) => prev + 1);
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
        <h3 className="mb-2 text-xl font-bold">Dopisanie zera robi różnicę</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Każde dopisane zero to jeszcze jedno mnożenie przez 10. W tej lekcji zobaczysz dokładnie,
          co się wtedy dzieje z cyframi.
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
          <h3 className="mb-4 text-center text-sm font-semibold text-muted-foreground sm:text-base">
            Który wynik jest większy — bez liczenia na kartce?
          </h3>

          <div className="mb-4 grid grid-cols-2 gap-3">
            {(['left', 'right'] as const).map((side) => {
              const label = side === 'left' ? round.left : round.right;
              const isAnswer = correct === side;
              const isPicked = picked === side;
              const reveal = picked !== null;

              return (
                <button
                  key={side}
                  type="button"
                  onClick={() => pick(side)}
                  disabled={reveal}
                  className={cn(
                    'border px-4 py-6 text-center font-mono text-xl font-black tabular-nums transition-all disabled:cursor-not-allowed sm:text-2xl',
                    !reveal && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    reveal && isAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !isAnswer && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isAnswer && 'opacity-55'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => pick('equal')}
            disabled={picked !== null}
            className={cn(
              'w-full border px-4 py-2 text-center text-sm font-medium transition-all disabled:cursor-not-allowed',
              picked === null && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
              picked !== null && correct === 'equal' && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
              picked === 'equal' && correct !== 'equal' && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
              picked !== null && picked !== 'equal' && correct !== 'equal' && 'opacity-55'
            )}
          >
            Tyle samo
          </button>

          {picked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-4 flex items-start gap-3 p-4 text-sm leading-relaxed',
                picked === correct
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              {picked === correct ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              )}
              <p>
                <strong>{picked === correct ? 'Dobrze! ' : 'Prawie. '}</strong>
                {round.left} = {round.leftValue.toLocaleString('pl-PL')}, {round.right} ={' '}
                {round.rightValue.toLocaleString('pl-PL')}.{' '}
                {correct === 'equal'
                  ? 'Obie strony dają dokładnie tyle samo.'
                  : `Większy wynik jest po stronie „${correct === 'left' ? round.left : round.right}”.`}
              </p>
            </motion.div>
          )}

          {picked && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next} className="gap-1.5">
                {index + 1 < ROUNDS.length ? 'Następna runda' : 'Zakończ'}
                {picked === correct && <Sparkles className="h-4 w-4" aria-hidden />}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
