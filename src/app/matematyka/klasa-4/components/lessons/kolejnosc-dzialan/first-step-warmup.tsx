'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface Round {
  expression: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const ROUNDS: Round[] = [
  {
    expression: '5 + 2 × 3',
    options: ['5 + 2', '2 × 3', 'wynik od razu'],
    correctIndex: 1,
    explanation: 'Mnożenie liczysz przed dodawaniem — nawet jeśli w zapisie stoi dalej.',
  },
  {
    expression: '(6 − 2) × 4',
    options: ['6 − 2', '2 × 4', 'cała reszta naraz'],
    correctIndex: 0,
    explanation: 'Nawiasy zawsze pierwsze — nieważne, co jest w środku.',
  },
  {
    expression: '20 : 4 + 3 × 2',
    options: ['20 : 4', '3 × 2', '4 + 3'],
    correctIndex: 0,
    explanation: 'Dwa działania mają priorytet nad dodawaniem (20 : 4 i 3 × 2) — liczysz je od lewej, więc zaczynasz od 20 : 4.',
  },
  {
    expression: '8 − 3 + 5',
    options: ['3 + 5', '8 − 3', 'kolejność nie ma znaczenia'],
    correctIndex: 1,
    explanation: 'Dodawanie i odejmowanie mają ten sam priorytet — liczysz od lewej, więc najpierw 8 − 3.',
  },
];

interface FirstStepWarmupProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: bez liczenia wyniku — którą część tego wyrażenia policzysz jako pierwszą? */
export function FirstStepWarmup({ color, onComplete }: FirstStepWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === round.correctIndex) setScore((prev) => prev + 1);
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
        <h3 className="mb-2 text-xl font-bold">Wiesz już, od czego zacząć</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Rozpoznanie pierwszego kroku to połowa sukcesu — resztę załatwia konsekwentne
          stosowanie tej samej reguły.
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
            {round.expression}
          </h3>
          <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
            Którą część policzysz jako pierwszą?
          </p>

          <div className="grid gap-2 sm:grid-cols-3">
            {round.options.map((option, i) => {
              const isAnswer = i === round.correctIndex;
              const isPicked = picked === i;
              const reveal = picked !== null;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => pick(i)}
                  disabled={reveal}
                  className={cn(
                    'flex items-center justify-center gap-2 border px-4 py-4 text-center font-mono text-base font-bold tabular-nums transition-all disabled:cursor-not-allowed',
                    !reveal && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    reveal && isAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !isAnswer && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isAnswer && 'opacity-55'
                  )}
                >
                  {reveal && isAnswer && <Check className="h-4 w-4 shrink-0" />}
                  {reveal && isPicked && !isAnswer && <X className="h-4 w-4 shrink-0" />}
                  {option}
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
                picked === round.correctIndex
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <strong>{picked === round.correctIndex ? 'Dobrze! ' : 'Prawie. '}</strong>
              {round.explanation}
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
