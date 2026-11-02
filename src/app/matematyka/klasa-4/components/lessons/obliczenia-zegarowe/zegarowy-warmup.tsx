'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Check, Droplets, Eye, Moon, Wind, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';

type Unit = 's' | 'min' | 'h';

interface Round {
  activity: string;
  icon: LucideIcon;
  unit: Unit;
  approx: string;
}

const UNIT_LABEL: Record<Unit, string> = { s: 'sekundy', min: 'minuty', h: 'godziny' };

const ROUNDS: Round[] = [
  { activity: 'Mrugnięcie okiem', icon: Eye, unit: 's', approx: '≈ 0,3 s' },
  { activity: 'Mycie zębów', icon: Droplets, unit: 'min', approx: '≈ 2 min' },
  { activity: 'Jedna lekcja w szkole', icon: BookOpen, unit: 'min', approx: '≈ 45 min' },
  { activity: 'Cała noc snu', icon: Moon, unit: 'h', approx: '≈ 9 h' },
  { activity: 'Jeden wdech i wydech', icon: Wind, unit: 's', approx: '≈ 4 s' },
];

interface ZegarowyWarmupProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: sekundy, minuty czy godziny? Wyczucie rzędu wielkości jednostek
 * czasu na pięciu codziennych czynnościach, zanim lekcja przejdzie do
 * liczenia upływu czasu — ten sam pomysł co „co jest cięższe" w lekcji o
 * masie, tylko klasyfikacja do trzech jednostek zamiast porównania dwóch.
 */
export function ZegarowyWarmup({ color, onComplete }: ZegarowyWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Unit | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];

  const pick = (unit: Unit) => {
    if (picked) return;
    setPicked(unit);
    if (unit === round.unit) setScore((prev) => prev + 1);
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
        <h3 className="mb-2 text-xl font-bold">Trzy jednostki, jeden dzień</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Mrugnięcie liczysz w sekundach, lekcję w minutach, a sen w godzinach — to samo wyczucie
          przyda się za chwilę, gdy zaczniesz liczyć upływ czasu.
        </p>
      </div>
    );
  }

  const Icon = round.icon;

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
            <Icon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            {round.activity} — to sekundy, minuty czy godziny?
          </p>

          <div className="grid gap-2 sm:grid-cols-3">
            {(['s', 'min', 'h'] as const).map((unit) => {
              const isAnswer = unit === round.unit;
              const isPicked = picked === unit;
              const reveal = picked !== null;

              return (
                <button
                  key={unit}
                  type="button"
                  onClick={() => pick(unit)}
                  disabled={reveal}
                  className={cn(
                    'flex flex-col items-center gap-1 border px-4 py-4 text-center transition-all disabled:cursor-not-allowed',
                    !reveal && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    reveal && isAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !isAnswer && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isAnswer && 'opacity-55'
                  )}
                >
                  {reveal && isAnswer && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                  {reveal && isPicked && !isAnswer && <X className="h-4 w-4 shrink-0 text-rose-600" />}
                  <span className="text-sm font-semibold sm:text-base">{UNIT_LABEL[unit]}</span>
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
                picked === round.unit
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <strong>{picked === round.unit ? 'Dobre wyczucie! ' : 'Prawie. '}</strong>
              {round.activity}: {round.approx}.
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
