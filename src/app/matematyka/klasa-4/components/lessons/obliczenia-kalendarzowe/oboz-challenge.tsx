'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, Tent, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { buildDateJumps, formatWeeksAndDays } from '../../../lib/calendar';

const YEAR = 2026;
const FROM = { day: 3, monthIndex: 6 }; // 3 lipca
const TO = { day: 24, monthIndex: 7 }; // 24 sierpnia

const JUMPS = buildDateJumps(FROM.day, FROM.monthIndex, TO.day, TO.monthIndex, YEAR);
const TOTAL_DAYS = JUMPS.reduce((sum, j) => sum + j.deltaDays, 0);

interface ObozChallengeProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: obóz sportowy jako jedna para dat, nie gotowy zestaw
 * odcinków do zsumowania (jak w zadaniu o planie dnia z lekcji o zegarze) —
 * dziecko samo musi policzyć upływ dni metodą doliczania z kroku „Nowe
 * pojęcie", zanim zamieni wynik na tygodnie i dni.
 */
export function ObozChallenge({ color, onComplete }: ObozChallengeProps) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'answered'>('idle');

  const isCorrect = Number(value.trim().replace(',', '.')) === TOTAL_DAYS;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (state === 'answered' || !value.trim()) return;
    setState('answered');
    if (Number(value.trim().replace(',', '.')) === TOTAL_DAYS) onComplete?.();
  };

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <Tent className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Zosia jedzie na obóz sportowy 3 lipca, a wraca do domu 24 sierpnia. Policz, ile dni
          upłynie od wyjazdu do powrotu.
        </p>
      </div>

      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-5 text-center font-mono text-xl font-black tracking-wide sm:text-2xl" style={{ color }}>
          3 lipca → 24 sierpnia
        </p>

        <form onSubmit={submit} className="flex flex-wrap items-center justify-center gap-2">
          <label htmlFor="oboz-total" className="text-sm font-semibold">
            To razem:
          </label>
          <Input
            id="oboz-total"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={state === 'answered'}
            inputMode="numeric"
            autoComplete="off"
            placeholder="np. 40"
            className={cn(
              'w-24 font-mono text-base',
              state === 'answered' && isCorrect && 'border-emerald-500',
              state === 'answered' && !isCorrect && 'border-rose-400'
            )}
          />
          <span className="text-sm text-muted-foreground">dni</span>
          {state === 'idle' && (
            <Button type="submit" disabled={!value.trim()}>
              Sprawdź
            </Button>
          )}
          {state === 'answered' && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-sm font-semibold',
                isCorrect ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              {isCorrect ? (
                <>
                  <Check className="h-4 w-4" /> Dobrze!
                </>
              ) : (
                <>
                  <X className="h-4 w-4" /> Poprawna odpowiedź: {TOTAL_DAYS} dni
                </>
              )}
            </span>
          )}
        </form>

        {state === 'answered' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <p className="text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
              {JUMPS.map((jump) => jump.shortLabel).join(' + ')} = {TOTAL_DAYS} dni.
            </p>
            <p className="mt-1 text-center text-sm font-semibold leading-relaxed sm:text-base" style={{ color }}>
              {TOTAL_DAYS} : 7 = {formatWeeksAndDays(TOTAL_DAYS)} — dokładnie tyle trwa obóz Zosi.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
