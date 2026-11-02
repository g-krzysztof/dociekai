'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { ColumnGrid, type ColumnCellData } from '../../column-grid';

interface CarryRound {
  id: string;
  digit: number;
  multiplier: number;
  /** Czy iloczyn tej cyfry i mnożnika wymaga przeniesienia (iloczyn ≥ 10). */
  needsCarry: boolean;
  note: string;
}

const ROUNDS: CarryRound[] = [
  { id: 'r1', digit: 3, multiplier: 4, needsCarry: true, note: '3 × 4 = 12 — to więcej niż 9, więc „1” trzeba przenieść dalej.' },
  { id: 'r2', digit: 2, multiplier: 3, needsCarry: false, note: '2 × 3 = 6 — to mniej niż 10, nic nie trzeba przenosić.' },
  {
    id: 'r3',
    digit: 9,
    multiplier: 9,
    needsCarry: true,
    note: '9 × 9 = 81 — to największy możliwy iloczyn dwóch cyfr. Przeniesienie może więc wynosić aż 8, nie tylko 1, jak przy dodawaniu.',
  },
  {
    id: 'r4',
    digit: 0,
    multiplier: 7,
    needsCarry: false,
    note: 'Cokolwiek pomnożone przez 0 daje 0 — zero nigdy nie tworzy przeniesienia.',
  },
];

function cellFor(round: CarryRound): ColumnCellData[] {
  return [{ place: 'jedności', top: round.digit, bottom: round.multiplier }];
}

interface PrzeniesienieWarmupProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: zanim dziecko zacznie liczyć całe działania, uczy się
 * rozpoznawać *kiedy* w ogóle powstaje przeniesienie — samo porównanie
 * iloczynu jednej cyfry i mnożnika z progiem 10, bez liczenia całej kolumny.
 * Runda r3 (9 × 9) od razu zapowiada główną nowość tej lekcji: przeniesienie
 * w mnożeniu bywa dużo większe niż 1.
 */
export function PrzeniesienieWarmup({ color, onComplete }: PrzeniesienieWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];

  const pick = (answer: boolean) => {
    if (picked !== null) return;
    setPicked(answer);
    if (answer === round.needsCarry) setScore((prev) => prev + 1);
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
        <h3 className="mb-2 text-xl font-bold">Będzie przeniesienie?</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Ta sama decyzja — iloczyn 10 lub więcej? — będzie się powtarzać w każdej kolumnie, którą
          dziś policzysz.
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
            W tej kolumnie trzeba pomnożyć {round.digit} × {round.multiplier}. Czy powstanie
            przeniesienie?
          </p>

          <div className="mb-4 flex justify-center">
            <ColumnGrid
              color={color}
              operator="×"
              cells={cellFor(round)}
              ariaLabel={`Kolumna jedności: ${round.digit} razy ${round.multiplier}`}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[true, false].map((answer) => {
              const isAnswer = answer === round.needsCarry;
              const isPicked = picked === answer;
              const reveal = picked !== null;

              return (
                <button
                  key={String(answer)}
                  type="button"
                  onClick={() => pick(answer)}
                  disabled={reveal}
                  className={cn(
                    'flex items-center justify-center gap-2 border px-4 py-4 text-sm font-semibold transition-all disabled:cursor-not-allowed sm:text-base',
                    !reveal && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    reveal && isAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !isAnswer && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isAnswer && 'opacity-55'
                  )}
                >
                  {reveal && isAnswer && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                  {reveal && isPicked && !isAnswer && <X className="h-4 w-4 shrink-0 text-rose-600" />}
                  {answer ? 'Tak, będzie przeniesienie' : 'Nie, bez przeniesienia'}
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
                picked === round.needsCarry
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <strong>{picked === round.needsCarry ? 'Dobrze! ' : 'Prawie. '}</strong>
              {round.note}
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
