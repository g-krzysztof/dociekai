'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Apple, Backpack, Check, GlassWater, PencilRuler, Shirt, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Item {
  id: string;
  label: string;
  icon: typeof Backpack;
  display: string;
  grams: number;
}

const ITEMS: Item[] = [
  { id: 'bidon', label: 'Bidon z wodą', icon: GlassWater, display: '500 g', grams: 500 },
  { id: 'kanapki', label: 'Kanapki i owoce w pudełku', icon: Apple, display: '70 dag', grams: 700 },
  { id: 'przybory', label: 'Zeszyt, piórnik i przybory', icon: PencilRuler, display: '300 g', grams: 300 },
  {
    id: 'kurtka',
    label: 'Kurtka przeciwdeszczowa',
    icon: Shirt,
    display: '1 kg 20 dag',
    grams: 1200,
  },
];

const TOTAL_GRAMS = ITEMS.reduce((sum, item) => sum + item.grams, 0);
const TOTAL_KG = TOTAL_GRAMS / 1000;
const LIMIT_KG = 3;

interface PlecakChallengeProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: plecak na wycieczkę spakowany z czterech przedmiotów,
 * których masy podano w mieszanych jednostkach (g, dag, kg i dag naraz) —
 * trzeba wszystko sprowadzić do gramów, zanim da się je zsumować i
 * porównać z limitem, tak jak w zadaniu o trasie wycieczki z lekcji o
 * długości.
 */
export function PlecakChallenge({ color, onComplete }: PlecakChallengeProps) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'answered'>('idle');

  const normalized = value.trim().replace(',', '.');
  const isCorrect = Number(normalized) === TOTAL_KG;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (state === 'answered' || !value.trim()) return;
    setState('answered');
    if (Number(normalized) === TOTAL_KG) onComplete?.();
  };

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <Backpack className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Zosia pakuje plecak na jednodniową wycieczkę. Nauczyciel powiedział, że plecak nie może
          ważyć więcej niż {LIMIT_KG} kg. Policz, ile waży to, co Zosia już spakowała.
        </p>
      </div>

      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <ol className="mb-5 divide-y border">
          {ITEMS.map((item, i) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center border-2 font-mono text-xs font-bold"
                style={{ borderColor: color, color }}
              >
                {i + 1}
              </span>
              <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="flex-1 text-sm sm:text-base">{item.label}</span>
              <span
                className="font-mono text-sm font-bold tabular-nums sm:text-base"
                style={{ color }}
              >
                {item.display}
              </span>
            </li>
          ))}
        </ol>

        <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
          <label htmlFor="plecak-total" className="text-sm font-semibold">
            Cały plecak waży razem:
          </label>
          <Input
            id="plecak-total"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={state === 'answered'}
            inputMode="decimal"
            autoComplete="off"
            placeholder="np. 1,5"
            className={cn(
              'w-28 font-mono text-base',
              state === 'answered' && isCorrect && 'border-emerald-500',
              state === 'answered' && !isCorrect && 'border-rose-400'
            )}
          />
          <span className="text-sm text-muted-foreground">kg</span>
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
                  <X className="h-4 w-4" /> Poprawna odpowiedź: {TOTAL_KG} kg
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
            Zamień wszystko na gramy: 500 g + 700 g + 300 g + 1200 g = {TOTAL_GRAMS} g. A{' '}
            {TOTAL_GRAMS} g to dokładnie {TOTAL_KG} kg — mieści się w limicie {LIMIT_KG} kg, więc
            Zosia może jeszcze coś dopakować.
          </motion.p>
        )}
      </div>
    </div>
  );
}
