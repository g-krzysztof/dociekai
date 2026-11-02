'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Check, Popcorn, Utensils, Waves, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { buildTimeJumps, formatDuration, totalMinutes } from '../../../lib/time';
import { digital24 } from '../../../lib/clock';

interface Activity {
  id: string;
  label: string;
  icon: typeof Waves;
  start: { h: number; m: number };
  end: { h: number; m: number };
}

const ACTIVITIES: Activity[] = [
  { id: 'basen', label: 'Basen', icon: Waves, start: { h: 10, m: 15 }, end: { h: 11, m: 0 } },
  { id: 'obiad', label: 'Obiad w restauracji', icon: Utensils, start: { h: 11, m: 30 }, end: { h: 12, m: 10 } },
  { id: 'kino', label: 'Seans w kinie', icon: Popcorn, start: { h: 14, m: 20 }, end: { h: 16, m: 5 } },
];

const DURATIONS = ACTIVITIES.map((activity) => {
  const jumps = buildTimeJumps(totalMinutes(activity.start.h, activity.start.m), totalMinutes(activity.end.h, activity.end.m));
  return jumps.reduce((sum, j) => sum + j.deltaMinutes, 0);
});

const TOTAL_MINUTES = DURATIONS.reduce((sum, m) => sum + m, 0);

interface PlanDniaChallengeProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: sobotni plan Zosi jako trzy pary godzin wejścia i
 * wyjścia — inaczej niż w zadaniu o plecaku (tam gotowe masy trzeba było
 * tylko zsumować), tu każdy odcinek trzeba najpierw samodzielnie policzyć
 * metodą doliczania z kroku wyżej, a dopiero potem zsumować w minutach.
 */
export function PlanDniaChallenge({ color, onComplete }: PlanDniaChallengeProps) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'answered'>('idle');

  const isCorrect = Number(value.trim().replace(',', '.')) === TOTAL_MINUTES;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (state === 'answered' || !value.trim()) return;
    setState('answered');
    if (Number(value.trim().replace(',', '.')) === TOTAL_MINUTES) onComplete?.();
  };

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <CalendarClock className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Zosia zaplanowała sobotę. Policz, ile minut w sumie zajęły jej te trzy zajęcia — bez
          przerw między nimi.
        </p>
      </div>

      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <ol className="mb-5 divide-y border">
          {ACTIVITIES.map((activity, i) => (
            <li key={activity.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center border-2 font-mono text-xs font-bold"
                style={{ borderColor: color, color }}
              >
                {i + 1}
              </span>
              <activity.icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="flex-1 text-sm sm:text-base">{activity.label}</span>
              <span className="font-mono text-sm font-bold tabular-nums sm:text-base" style={{ color }}>
                {digital24(activity.start.h, activity.start.m)}–{digital24(activity.end.h, activity.end.m)}
              </span>
            </li>
          ))}
        </ol>

        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
          <label htmlFor="plan-dnia-total" className="text-sm font-semibold">
            Razem te trzy zajęcia trwały:
          </label>
          <Input
            id="plan-dnia-total"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={state === 'answered'}
            inputMode="numeric"
            autoComplete="off"
            placeholder="np. 60"
            className={cn(
              'w-24 font-mono text-base',
              state === 'answered' && isCorrect && 'border-emerald-500',
              state === 'answered' && !isCorrect && 'border-rose-400'
            )}
          />
          <span className="text-sm text-muted-foreground">min</span>
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
                  <X className="h-4 w-4" /> Poprawna odpowiedź: {TOTAL_MINUTES} min
                </>
              )}
            </span>
          )}
        </form>

        {state === 'answered' && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            Basen: {formatDuration(DURATIONS[0])}, obiad: {formatDuration(DURATIONS[1])}, kino:{' '}
            {formatDuration(DURATIONS[2])}. Razem {DURATIONS[0]} + {DURATIONS[1]} + {DURATIONS[2]} ={' '}
            {TOTAL_MINUTES} min, czyli {formatDuration(TOTAL_MINUTES)}.
          </motion.p>
        )}
      </div>
    </div>
  );
}
