'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DecimalNumeral } from '../../guides/zapis-dziesietny/decimal-numeral';
import { formatDecimal, type DecimalValue } from '../../../lib/decimal';

interface PlaceItem {
  id: string;
  label: string;
  value: DecimalValue;
}

/** Jedna cyfra 3 na sześciu kolejnych rzędach — od tysięcznych po setki. */
const ITEMS: PlaceItem[] = [
  { id: 'tysieczne', label: '3 tysięczne', value: { whole: 0, digits: [0, 0, 3] } },
  { id: 'setne', label: '3 setne', value: { whole: 0, digits: [0, 3] } },
  { id: 'dziesiete', label: '3 dziesiąte', value: { whole: 0, digits: [3] } },
  { id: 'jednosci', label: '3 jedności', value: { whole: 3, digits: [] } },
  { id: 'dziesiatki', label: '3 dziesiątki', value: { whole: 30, digits: [] } },
  { id: 'setki', label: '3 setki', value: { whole: 300, digits: [] } },
];

const CORRECT_ORDER = ['tysieczne', 'setne', 'dziesiete', 'jednosci', 'dziesiatki', 'setki'];

interface DecimalOrderWarmupProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: ta sama cyfra 3 na sześciu rzędach — dziecko ustawia je od najmniejszego do największego. */
export function DecimalOrderWarmup({ color, onComplete }: DecimalOrderWarmupProps) {
  const [picks, setPicks] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const toggle = (id: string) => {
    if (checked) return;
    if (picks.includes(id)) {
      setPicks((prev) => prev.filter((item) => item !== id));
      return;
    }
    if (picks.length >= ITEMS.length) return;
    setPicks((prev) => [...prev, id]);
  };

  const check = () => {
    setChecked(true);
    onComplete?.();
  };

  const reset = () => {
    setPicks([]);
    setChecked(false);
  };

  const correctCount = picks.filter((id, i) => id === CORRECT_ORDER[i]).length;
  const ready = picks.length === ITEMS.length;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-5 text-sm leading-relaxed sm:text-base">
        Ta sama cyfra <strong>3</strong> stoi na sześciu różnych rzędach — od tysięcznych po setki.
        Klikaj karty <strong>od najmniejszej do największej wartości</strong>.
      </p>

      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {ITEMS.map((item) => {
          const rank = picks.indexOf(item.id);
          const isPicked = rank !== -1;
          const isCorrect = checked && CORRECT_ORDER[rank] === item.id;
          const isWrong = checked && isPicked && !isCorrect;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              disabled={checked || (!isPicked && ready)}
              className={cn(
                'group flex flex-col items-center gap-2 border p-4 text-center transition-all disabled:cursor-not-allowed',
                !checked && !isPicked && ready && 'opacity-40',
                !checked && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                isWrong && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40'
              )}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center text-sm font-black tabular-nums"
                style={{ color: isPicked ? color : `${color}40` }}
                aria-hidden
              >
                {checked ? (
                  isCorrect ? (
                    <Check className="h-5 w-5" />
                  ) : isPicked ? (
                    <X className="h-5 w-5 text-rose-500" />
                  ) : (
                    '–'
                  )
                ) : isPicked ? (
                  rank + 1
                ) : (
                  '–'
                )}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
              <DecimalNumeral value={item.value} color={color} className="text-2xl sm:text-3xl" />
              <span className="sr-only">{formatDecimal(item.value)}</span>
            </button>
          );
        })}
      </div>

      {!checked && (
        <div className="mt-5 flex justify-end">
          <Button onClick={check} disabled={!ready}>
            Sprawdź kolejność
          </Button>
        </div>
      )}

      {checked && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm leading-relaxed">
            <strong style={{ color }}>
              {correctCount} z {ITEMS.length}
            </strong>{' '}
            na dobrym miejscu. Im dalej rząd stoi w prawo od przecinka, tym mniejszą wartość ma ta
            sama cyfra.
          </p>
          <Button variant="outline" onClick={reset} className="shrink-0 gap-2">
            <RotateCcw className="h-4 w-4" />
            Spróbuj ponownie
          </Button>
        </motion.div>
      )}
    </div>
  );
}
