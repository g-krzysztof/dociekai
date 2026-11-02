'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Ruler, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface RoundOption {
  label: string;
  approx: string;
}

interface Round {
  a: RoundOption;
  b: RoundOption;
  correct: 'a' | 'b';
}

const ROUNDS: Round[] = [
  {
    a: { label: 'Ołówek', approx: '18 cm' },
    b: { label: 'But sportowy dziecka', approx: '24 cm' },
    correct: 'b',
  },
  {
    a: { label: 'Samochód osobowy', approx: '4,5 m' },
    b: { label: 'Autobus szkolny', approx: '12 m' },
    correct: 'b',
  },
  {
    a: { label: 'Rzeka Wisła', approx: '1047 km' },
    b: { label: 'Trasa Warszawa–Kraków', approx: '290 km' },
    correct: 'a',
  },
  {
    a: { label: 'Mrówka', approx: '5 mm' },
    b: { label: 'Ziarnko ryżu', approx: '7 mm' },
    correct: 'b',
  },
];

interface DlugoscWarmupProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: co jest dłuższe — na oko, bez linijki. Ostatnia runda pokazuje, że „na oko" ma granice. */
export function DlugoscWarmup({ color, onComplete }: DlugoscWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<'a' | 'b' | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];

  const pick = (choice: 'a' | 'b') => {
    if (picked) return;
    setPicked(choice);
    if (choice === round.correct) setScore((prev) => prev + 1);
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
        <h3 className="mb-2 text-xl font-bold">„Na oko” ma swoje granice</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Czasem różnica jest ogromna, a czasem — jak przy mrówce i ziarnku ryżu — naprawdę trzeba
          zmierzyć. Właśnie po to mamy dokładne jednostki długości.
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
          <p className="mb-4 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground sm:text-base">
            <Ruler className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            Co jest dłuższe — na oko, bez linijki?
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            {(['a', 'b'] as const).map((key) => {
              const option = round[key];
              const isAnswer = key === round.correct;
              const isPicked = picked === key;
              const reveal = picked !== null;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => pick(key)}
                  disabled={reveal}
                  className={cn(
                    'flex flex-col items-center gap-1.5 border px-4 py-5 text-center transition-all disabled:cursor-not-allowed',
                    !reveal && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    reveal && isAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal &&
                      isPicked &&
                      !isAnswer &&
                      'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isAnswer && 'opacity-55'
                  )}
                >
                  {reveal && isAnswer && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                  {reveal && isPicked && !isAnswer && <X className="h-4 w-4 shrink-0 text-rose-600" />}
                  <span className="text-sm font-semibold sm:text-base">{option.label}</span>
                  {reveal && (
                    <span className="font-mono text-xs font-bold tabular-nums" style={{ color }}>
                      ≈ {option.approx}
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
                'mt-4 p-4 text-center text-sm leading-relaxed',
                picked === round.correct
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <strong>{picked === round.correct ? 'Dobre oko! ' : 'Prawie. '}</strong>
              {round.a.label}: ≈ {round.a.approx}, {round.b.label}: ≈ {round.b.approx}.
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
