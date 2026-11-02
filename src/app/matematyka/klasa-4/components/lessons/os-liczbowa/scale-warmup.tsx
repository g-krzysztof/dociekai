'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { NumberLine } from '../../number-line';

interface Round {
  min: number;
  max: number;
  /** Ile równych działek dzieli odcinek — z tego liczymy wartość jednej kreski. */
  segments: number;
  options: number[];
}

const ROUNDS: Round[] = [
  { min: 0, max: 100, segments: 10, options: [1, 10, 100, 5] },
  { min: 0, max: 1000, segments: 10, options: [10, 100, 1000, 50] },
  { min: 2000, max: 3000, segments: 5, options: [100, 200, 500, 1000] },
  { min: 0, max: 100000, segments: 10, options: [1000, 10000, 100000, 50000] },
];

interface ScaleWarmupProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: ta sama oś może przedstawiać zupełnie różne skale — dziecko odgaduje wartość jednej działki. */
export function ScaleWarmup({ color, onComplete }: ScaleWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];
  const answer = (round.max - round.min) / round.segments;

  const pick = (value: number) => {
    if (picked !== null) return;
    setPicked(value);
    if (value === answer) setScore((prev) => prev + 1);
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
        <h3 className="mb-2 text-xl font-bold">Ta sama oś, inna skala</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Zanim odczytasz punkt na osi, zawsze najpierw sprawdź, ile wart jest jeden odstęp. To
          klucz do reszty tej lekcji.
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
          <h3 className="mb-4 text-lg font-bold leading-snug sm:text-xl">
            Ile wynosi jedna działka (odstęp między kreskami) na tej osi?
          </h3>

          <div className="mb-5">
            <NumberLine
              min={round.min}
              max={round.max}
              majorStep={round.max - round.min}
              minorStep={answer}
              color={color}
              ariaLabel={`Oś liczbowa od ${round.min} do ${round.max}, podzielona na ${round.segments} równych odstępów`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {round.options.map((value) => {
              const isPicked = picked === value;
              const isAnswer = value === answer;
              const reveal = picked !== null;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => pick(value)}
                  disabled={reveal}
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 border px-4 py-3 text-center font-mono text-base font-bold tabular-nums transition-all disabled:cursor-not-allowed',
                    !reveal && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    reveal && isAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !isAnswer && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isAnswer && 'opacity-55'
                  )}
                >
                  {reveal && isAnswer && <Check className="h-4 w-4 shrink-0" />}
                  {reveal && isPicked && !isAnswer && <X className="h-4 w-4 shrink-0" />}
                  {value.toLocaleString('pl-PL')}
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
                Od {round.min.toLocaleString('pl-PL')} do {round.max.toLocaleString('pl-PL')} jest{' '}
                {round.segments} takich samych odstępów, więc jeden odstęp to{' '}
                {(round.max - round.min).toLocaleString('pl-PL')} : {round.segments} ={' '}
                {answer.toLocaleString('pl-PL')}.
              </p>
            </motion.div>
          )}

          {picked !== null && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>
                {index + 1 < ROUNDS.length ? 'Następna oś' : 'Zakończ'}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
