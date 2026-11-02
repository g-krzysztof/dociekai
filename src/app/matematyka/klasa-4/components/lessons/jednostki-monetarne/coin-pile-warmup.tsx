'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { formatMoney } from '../../../lib/money';
import { MoneyToken } from './money-token';

interface Round {
  coins: number[];
  options: number[];
  correctIndex: number;
}

const ROUNDS: Round[] = [
  { coins: [50, 20, 20, 10, 5], options: [80, 100, 120], correctIndex: 1 },
  { coins: [100, 50, 50, 20, 10, 5, 2], options: [200, 250, 300], correctIndex: 1 },
  { coins: [200, 200, 100, 50, 20, 10, 5, 2, 1], options: [500, 550, 600], correctIndex: 2 },
  { coins: [1000, 500, 200, 100, 50], options: [1500, 1800, 2000], correctIndex: 1 },
];

/** Deterministyczny „bałagan" — bez Math.random(), żeby SSR i pierwszy render klienta się zgadzały. */
function scatterStyle(i: number): { rotate: number; translateY: number } {
  return { rotate: ((i * 53) % 40) - 20, translateY: ((i * 29) % 14) - 7 };
}

interface CoinPileWarmupProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: bez żadnej reguły — samo wyczucie, ile wart jest stos monet na oko. */
export function CoinPileWarmup({ color, onComplete }: CoinPileWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];
  const total = round.coins.reduce((sum, value) => sum + value, 0);

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
        <h3 className="mb-2 text-xl font-bold">Liczenie „na oko” ma swoje granice</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Za chwilę poznasz dokładny sposób liczenia pieniędzy — grosze i złote osobno, bez
          zgadywania.
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
          <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
            Ile wart jest ten stosik pieniędzy — na oko, bez liczenia po kolei?
          </p>

          <div
            className="mb-5 flex min-h-24 flex-wrap items-center justify-center gap-1.5 p-4"
            style={{ backgroundColor: `${color}0a` }}
            role="img"
            aria-label={`Stos monet i banknotów wart razem ${formatMoney(total)}`}
          >
            {round.coins.map((value, i) => {
              const { rotate, translateY } = scatterStyle(i);
              return (
                <div
                  key={`${index}-${i}`}
                  style={{ transform: `rotate(${rotate}deg) translateY(${translateY}px)` }}
                >
                  <MoneyToken value={value} color={color} size="sm" />
                </div>
              );
            })}
          </div>

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
                  {formatMoney(option)}
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
                picked === round.correctIndex
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <strong>{picked === round.correctIndex ? 'Dobre oko! ' : 'Prawie. '}</strong>
              Razem jest dokładnie {formatMoney(total)} — najszybciej policzysz to, dodając osobno
              monety tego samego typu.
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
