'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { TallyMarks } from '../../tally-marks';

interface Round {
  count: number;
  options: { id: string; value: number }[];
  correctId: string;
  note: string;
}

const ROUNDS: Round[] = [
  {
    count: 6,
    options: [
      { id: 'a', value: 8 },
      { id: 'b', value: 6 },
      { id: 'c', value: 7 },
      { id: 'd', value: 5 },
    ],
    correctId: 'b',
    note: 'Przy kilku kreskach jeszcze łatwo się nie pomylić.',
  },
  {
    count: 9,
    options: [
      { id: 'a', value: 7 },
      { id: 'b', value: 8 },
      { id: 'c', value: 10 },
      { id: 'd', value: 9 },
    ],
    correctId: 'd',
    note: 'Już trudniej ocenić na pierwszy rzut oka, prawda?',
  },
  {
    count: 13,
    options: [
      { id: 'a', value: 13 },
      { id: 'b', value: 11 },
      { id: 'c', value: 15 },
      { id: 'd', value: 12 },
    ],
    correctId: 'a',
    note: 'Im więcej kresek, tym łatwiej się pomylić o jedną albo dwie.',
  },
  {
    count: 17,
    options: [
      { id: 'a', value: 15 },
      { id: 'b', value: 19 },
      { id: 'c', value: 17 },
      { id: 'd', value: 14 },
    ],
    correctId: 'c',
    note: 'Właśnie dlatego Rzymianie wymyślili osobne symbole dla grup — zamiast rysować kreskę za kreską, jedna litera oznaczała od razu 5, 10 czy 50.',
  },
];

interface TallyWarmupProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: oszacuj liczbę kresek bez liczenia po kolei — motywacja do symboli grup. */
export function TallyWarmup({ color, onComplete }: TallyWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];

  const pick = (id: string) => {
    if (picked !== null) return;
    setPicked(id);
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
        <h3 className="mb-2 text-xl font-bold">Liczenie kreska po kresce się nie skaluje</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Rzymianie rozwiązali to symbolami dla grup: V zamiast 5 kresek, X zamiast 10. Zaraz
          poznasz cały ten zestaw.
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
          <h3 className="mb-4 text-center text-lg font-bold leading-snug sm:text-xl">
            Ile kresek widzisz? Oszacuj, nie licz po kolei.
          </h3>

          <div className="mb-5 flex justify-center bg-muted/30 p-4">
            <TallyMarks count={round.count} color={color} />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {round.options.map((option) => {
              const isPicked = picked === option.id;
              const isAnswer = option.id === round.correctId;
              const reveal = picked !== null;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => pick(option.id)}
                  disabled={reveal}
                  className={cn(
                    'flex flex-col items-center gap-1 border px-2 py-3 font-mono text-xl font-black tabular-nums transition-all disabled:cursor-not-allowed sm:text-2xl',
                    !reveal && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    reveal && isAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal &&
                      isPicked &&
                      !isAnswer &&
                      'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isAnswer && 'opacity-55'
                  )}
                  style={!reveal ? { color } : undefined}
                >
                  {reveal &&
                    (isAnswer ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : isPicked ? (
                      <X className="h-4 w-4 text-rose-500" />
                    ) : null)}
                  {option.value}
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
                picked === round.correctId
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                <strong>Naprawdę było {round.count}. </strong>
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
                {index + 1 < ROUNDS.length ? 'Następna grupa' : 'Zakończ'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
