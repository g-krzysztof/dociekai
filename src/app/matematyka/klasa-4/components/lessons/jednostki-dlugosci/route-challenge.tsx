'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Bus, Check, Footprints, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Segment {
  id: string;
  label: string;
  icon: typeof Footprints;
  display: string;
  meters: number;
}

const SEGMENTS: Segment[] = [
  {
    id: 'do-przystanku',
    label: 'Pieszo do przystanku autobusowego',
    icon: Footprints,
    display: '450 m',
    meters: 450,
  },
  { id: 'autobus', label: 'Autobusem do lasu', icon: Bus, display: '6 km 300 m', meters: 6300 },
  {
    id: 'do-polany',
    label: 'Pieszo od przystanku do polany',
    icon: Footprints,
    display: '250 m',
    meters: 250,
  },
];

const TOTAL_METERS = SEGMENTS.reduce((sum, segment) => sum + segment.meters, 0);
const TOTAL_KM = TOTAL_METERS / 1000;

interface RouteChallengeProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: trasa wycieczki w trzech odcinkach, część w metrach,
 * część w mieszanych km i m naraz — trzeba wszystko sprowadzić do jednej
 * jednostki, zanim da się je zsumować.
 */
export function RouteChallenge({ color, onComplete }: RouteChallengeProps) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'answered'>('idle');

  const normalized = value.trim().replace(',', '.');
  const isCorrect = Number(normalized) === TOTAL_KM;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (state === 'answered' || !value.trim()) return;
    setState('answered');
    if (Number(normalized) === TOTAL_KM) onComplete?.();
  };

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <MapPin className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Klasa 4a jedzie na wycieczkę do lasu. Trasa ma trzy odcinki — policz, ile kilometrów mają
          razem.
        </p>
      </div>

      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <ol className="mb-5 divide-y border">
          {SEGMENTS.map((segment, i) => (
            <li key={segment.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center border-2 font-mono text-xs font-bold"
                style={{ borderColor: color, color }}
              >
                {i + 1}
              </span>
              <segment.icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="flex-1 text-sm sm:text-base">{segment.label}</span>
              <span
                className="font-mono text-sm font-bold tabular-nums sm:text-base"
                style={{ color }}
              >
                {segment.display}
              </span>
            </li>
          ))}
        </ol>

        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
          <label htmlFor="route-total" className="text-sm font-semibold">
            Cała trasa to razem:
          </label>
          <Input
            id="route-total"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={state === 'answered'}
            inputMode="decimal"
            autoComplete="off"
            placeholder="np. 5"
            className={cn(
              'w-28 font-mono text-base',
              state === 'answered' && isCorrect && 'border-emerald-500',
              state === 'answered' && !isCorrect && 'border-rose-400'
            )}
          />
          <span className="text-sm text-muted-foreground">km</span>
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
                  <X className="h-4 w-4" /> Poprawna odpowiedź: {TOTAL_KM} km
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
            Zamień wszystko na metry: 450 m + 6300 m + 250 m = {TOTAL_METERS} m. A {TOTAL_METERS} m
            to dokładnie {TOTAL_KM} km — bo z metrów na kilometry dzielisz przez 1000.
          </motion.p>
        )}
      </div>
    </div>
  );
}
