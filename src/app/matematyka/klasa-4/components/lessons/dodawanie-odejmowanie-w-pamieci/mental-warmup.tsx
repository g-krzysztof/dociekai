'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface Round {
  expression: string;
  options: number[];
  correct: number;
  note: string;
}

/** Wyrażenia i dystraktory dobrane tak, by odzwierciedlać typowe potknięcia — nie same losowe liczby. */
const ROUNDS: Round[] = [
  {
    expression: '46 + 30',
    options: [76, 86, 66],
    correct: 76,
    note: 'Zmieniają się tylko dziesiątki: 4 + 3 = 7 dziesiątek, jedności zostają bez zmian.',
  },
  {
    expression: '58 + 7',
    options: [65, 68, 75],
    correct: 65,
    note: 'Do pełnej dziesiątki brakuje 2, więc 7 = 2 + 5: 58 + 2 = 60, potem + 5 = 65.',
  },
  {
    expression: '90 − 40',
    options: [50, 60, 40],
    correct: 50,
    note: 'To odejmowanie samych dziesiątek: 9 − 4 = 5 dziesiątek.',
  },
  {
    expression: '82 − 9',
    options: [73, 74, 71],
    correct: 73,
    note: 'Łatwiej odjąć 10, a potem dodać 1 z powrotem: 82 − 10 = 72, + 1 = 73.',
  },
  {
    expression: '120 + 90',
    options: [210, 200, 220],
    correct: 210,
    note: '90 to prawie 100 — dodaj 100 i odejmij 10: 120 + 100 = 220, − 10 = 210.',
  },
  {
    expression: '205 − 8',
    options: [197, 198, 195],
    correct: 197,
    note: 'Rozkładasz 8 na 5 i 3: 205 − 5 = 200, − 3 = 197.',
  },
];

interface MentalWarmupProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: wyczucie wyniku bez liczenia na kartce — trafiasz, czy zgadujesz? */
export function MentalWarmup({ color, onComplete }: MentalWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];

  const pick = (value: number) => {
    if (picked !== null) return;
    setPicked(value);
    if (value === round.correct) setScore((prev) => prev + 1);
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
        <h3 className="mb-2 text-xl font-bold">Intuicja jest niezła — teraz poznasz metodę</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Zaraz nauczysz się jednej sztuczki, dzięki której nie trzeba już zgadywać — wyniki takich
          działań będziesz liczyć w głowie na pewniaka.
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
          <p className="mb-1 text-center text-sm text-muted-foreground">
            Bez liczenia na kartce — którą odpowiedź czujesz?
          </p>
          <h3
            className="mb-5 text-center font-mono text-3xl font-black tabular-nums sm:text-4xl"
            style={{ color }}
          >
            {round.expression}
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {round.options.map((value) => {
              const isPicked = picked === value;
              const isAnswer = value === round.correct;
              const reveal = picked !== null;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => pick(value)}
                  disabled={reveal}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1.5 border px-3 py-6 transition-all disabled:cursor-not-allowed',
                    !reveal && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    reveal && isAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !isAnswer && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isAnswer && 'opacity-55'
                  )}
                >
                  {reveal &&
                    (isAnswer ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : isPicked ? (
                      <X className="h-4 w-4 text-rose-500" />
                    ) : null)}
                  <span
                    className="font-mono text-2xl font-black tabular-nums sm:text-3xl"
                    style={{ color: reveal && !isAnswer ? undefined : color }}
                  >
                    {value}
                  </span>
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
                picked === round.correct
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                <strong>{picked === round.correct ? 'Dobrze! ' : 'Prawie. '}</strong>
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
                {index + 1 < ROUNDS.length ? 'Następne działanie' : 'Zakończ'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
