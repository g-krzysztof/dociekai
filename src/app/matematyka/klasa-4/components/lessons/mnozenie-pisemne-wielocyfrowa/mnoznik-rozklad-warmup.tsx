'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface BreakdownOption {
  id: string;
  text: string;
  correct: boolean;
}

interface BreakdownRound {
  id: string;
  multiplier: number;
  options: BreakdownOption[];
  note: string;
}

const ROUNDS: BreakdownRound[] = [
  {
    id: 'r1',
    multiplier: 34,
    options: [
      { id: 'a', text: '4 dziesiątki i 3 jedności', correct: false },
      { id: 'b', text: '3 dziesiątki i 4 jedności', correct: true },
      { id: 'c', text: '34 dziesiątki i 0 jedności', correct: false },
    ],
    note: '34 to 3 pełne dziesiątki (30) i 4 pojedyncze jedności: 30 + 4 = 34.',
  },
  {
    id: 'r2',
    multiplier: 26,
    options: [
      { id: 'a', text: '6 dziesiątek i 2 jedności', correct: false },
      { id: 'b', text: '20 dziesiątek i 6 jedności', correct: false },
      { id: 'c', text: '2 dziesiątki i 6 jedności', correct: true },
    ],
    note: '26 to 2 dziesiątki (20) i 6 jedności: 20 + 6 = 26.',
  },
  {
    id: 'r3',
    multiplier: 213,
    options: [
      { id: 'a', text: '2 setki, 1 dziesiątka i 3 jedności', correct: true },
      { id: 'b', text: '3 setki, 1 dziesiątka i 2 jedności', correct: false },
      { id: 'c', text: '2 setki, 3 dziesiątki i 1 jedność', correct: false },
    ],
    note: '213 to 2 setki (200), 1 dziesiątka (10) i 3 jedności: 200 + 10 + 3 = 213.',
  },
  {
    id: 'r4',
    multiplier: 140,
    options: [
      { id: 'a', text: '1 setka, 0 dziesiątek i 4 jedności', correct: false },
      { id: 'b', text: '1 setka, 4 dziesiątki i 0 jedności', correct: true },
      { id: 'c', text: '14 setek i 0 jedności', correct: false },
    ],
    note: '140 to 1 setka (100) i 4 dziesiątki (40) — jedności jest zero: 100 + 40 + 0 = 140.',
  },
];

interface MnoznikRozkladWarmupProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: zanim dziecko zacznie liczyć iloczyny cząstkowe, przypomina
 * sobie, jak rozkłada się mnożnik wielocyfrowy na miejsca dziesiętne — to
 * właśnie ten rozkład decyduje, ile będzie iloczynów cząstkowych i o ile
 * kolumn każdy z nich trzeba przesunąć. Runda 4 (140) po cichu zapowiada, że
 * mnożnik też może mieć cyfrę zero — bez uczenia jeszcze skrótu z pomijaniem
 * wiersza, to temat osobnej, późniejszej lekcji o liczbach zakończonych
 * zerami.
 */
export function MnoznikRozkladWarmup({ color, onComplete }: MnoznikRozkladWarmupProps) {
  const [index, setIndex] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];

  const pick = (option: BreakdownOption) => {
    if (pickedId !== null) return;
    setPickedId(option.id);
    if (option.correct) setScore((prev) => prev + 1);
  };

  const next = () => {
    if (index + 1 < ROUNDS.length) {
      setIndex((prev) => prev + 1);
      setPickedId(null);
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
        <h3 className="mb-2 text-xl font-bold">Rozłóż mnożnik</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Ten sam rozkład na dziesiątki, setki i jedności powie Ci za chwilę, ile iloczynów
          cząstkowych policzysz i o ile kolumn każdy z nich przesunąć.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((item, i) => (
          <span
            key={item.id}
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
          <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
            Na ile dziesiątek, setek i jedności rozkłada się mnożnik{' '}
            <strong className="font-mono" style={{ color }}>
              {round.multiplier}
            </strong>
            ?
          </p>

          <div className="grid gap-3">
            {round.options.map((option) => {
              const reveal = pickedId !== null;
              const isPicked = pickedId === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => pick(option)}
                  disabled={reveal}
                  className={cn(
                    'flex items-center justify-center gap-2 border px-4 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed sm:text-base',
                    !reveal && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    reveal && option.correct && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !option.correct && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !option.correct && 'opacity-55'
                  )}
                >
                  {reveal && option.correct && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                  {reveal && isPicked && !option.correct && <X className="h-4 w-4 shrink-0 text-rose-600" />}
                  {option.text}
                </button>
              );
            })}
          </div>

          {pickedId !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-4 p-4 text-center text-sm leading-relaxed',
                round.options.find((o) => o.id === pickedId)?.correct
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <strong>{round.options.find((o) => o.id === pickedId)?.correct ? 'Dobrze! ' : 'Prawie. '}</strong>
              {round.note}
            </motion.div>
          )}

          {pickedId !== null && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>{index + 1 < ROUNDS.length ? 'Następna runda' : 'Zakończ'}</Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
