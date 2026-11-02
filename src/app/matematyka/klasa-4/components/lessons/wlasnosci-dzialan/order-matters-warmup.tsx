'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface Round {
  left: string;
  right: string;
  equal: boolean;
  note: string;
}

/** Na przemian: działania, w których kolejność nie ma znaczenia, i takie, w których ma. */
const ROUNDS: Round[] = [
  {
    left: '6 + 9',
    right: '9 + 6',
    equal: true,
    note: 'Dodawanie jest przemienne — kolejność składników nie zmienia sumy.',
  },
  {
    left: '4 × 7',
    right: '7 × 4',
    equal: true,
    note: 'Mnożenie też jest przemienne — to samo pole, policzone z dwóch stron.',
  },
  {
    left: '12 − 5',
    right: '5 − 12',
    equal: false,
    note: 'Odejmowanie NIE jest przemienne: 12 − 5 = 7, ale 5 − 12 wychodzi poniżej zera.',
  },
  {
    left: '20 : 4',
    right: '4 : 20',
    equal: false,
    note: 'Dzielenie też nie jest przemienne: 20 : 4 = 5, a 4 : 20 to ułamek, zupełnie inna liczba.',
  },
  {
    left: '(3 + 2) + 8',
    right: '3 + (2 + 8)',
    equal: true,
    note: 'To łączność dodawania — nieważne, które dwie liczby zsumujesz najpierw.',
  },
  {
    left: '15 − (5 − 2)',
    right: '(15 − 5) − 2',
    equal: false,
    note: 'Przy odejmowaniu grupowanie JEST ważne: lewa strona to 15 − 3 = 12, prawa to 10 − 2 = 8.',
  },
];

interface OrderMattersWarmupProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: czy zamiana kolejności/grupowania zmienia wynik? Wyczucie przed regułą. */
export function OrderMattersWarmup({ color, onComplete }: OrderMattersWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];

  const pick = (value: boolean) => {
    if (picked !== null) return;
    setPicked(value);
    if (value === round.equal) setScore((prev) => prev + 1);
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
        <h3 className="mb-2 text-xl font-bold">Czasem tak, czasem nie — i to jest właśnie temat</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Dodawanie i mnożenie wybaczają zmianę kolejności. Odejmowanie i dzielenie — nie. Zaraz
          zobaczysz, dlaczego.
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
            Czy te dwa działania dają ten sam wynik?
          </p>
          <div className="mb-5 flex items-center justify-center gap-4 font-mono text-xl font-black tabular-nums sm:text-2xl" style={{ color }}>
            <span>{round.left}</span>
            <span className="text-muted-foreground">?</span>
            <span>{round.right}</span>
          </div>

          <div className="flex justify-center gap-3">
            {[
              { value: true, label: 'Tak, równe' },
              { value: false, label: 'Nie, różne' },
            ].map((option) => {
              const isPicked = picked === option.value;
              const isAnswer = option.value === round.equal;
              const reveal = picked !== null;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => pick(option.value)}
                  disabled={reveal}
                  className={cn(
                    'flex items-center gap-2 border px-5 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed',
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
                  {option.label}
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
                picked === round.equal
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                <strong>{picked === round.equal ? 'Dobrze! ' : 'Prawie. '}</strong>
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
