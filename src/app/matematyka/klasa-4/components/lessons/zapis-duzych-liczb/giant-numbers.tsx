'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Check,
  Clock3,
  Landmark,
  Moon,
  RotateCcw,
  Trophy,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GiantItem {
  id: string;
  icon: LucideIcon;
  label: string;
  value: number;
  approx?: boolean;
}

/** Kolejność w tablicy jest celowo wymieszana — dzieci ustawiają ją rosnąco same. */
const ITEMS: GiantItem[] = [
  {
    id: 'stadion',
    icon: Trophy,
    label: 'Podawana liczba kibiców na finale mistrzostw świata (Maracanã, 1950 r.)',
    value: 199_854,
  },
  {
    id: 'krakow',
    icon: Landmark,
    label: 'Mieszkańcy Krakowa',
    value: 804_000,
    approx: true,
  },
  {
    id: 'ksiezyc',
    icon: Moon,
    label: 'Średnia odległość Ziemia–Księżyc, w kilometrach',
    value: 384_400,
  },
  {
    id: 'sekundy',
    icon: Clock3,
    label: 'Sekundy w jednym roku (365 dni)',
    value: 31_536_000,
  },
  {
    id: 'warszawa',
    icon: Building2,
    label: 'Mieszkańcy Warszawy',
    value: 1_863_000,
    approx: true,
  },
  {
    id: 'polska',
    icon: Users,
    label: 'Mieszkańcy Polski',
    value: 37_700_000,
    approx: true,
  },
];

/** Poprawna kolejność rosnąco, policzona ręcznie z wartości powyżej. */
const CORRECT_ORDER = ['stadion', 'ksiezyc', 'krakow', 'warszawa', 'sekundy', 'polska'];

interface GiantNumbersProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: dziecko ustawia sześć dużych liczb z życia w kolejności rosnącej. */
export function GiantNumbers({ color, onComplete }: GiantNumbersProps) {
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
        Klikaj karty w kolejności{' '}
        <strong>od najmniejszej do największej liczby</strong>. Numer w rogu pokaże, którą
        wybrałeś jako pierwszą, drugą, trzecią…
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {ITEMS.map((item) => {
          const rank = picks.indexOf(item.id);
          const isPicked = rank !== -1;
          const isCorrect = checked && CORRECT_ORDER[rank] === item.id;
          const isWrong = checked && isPicked && !isCorrect;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              disabled={checked || (!isPicked && ready)}
              className={cn(
                'group flex items-start gap-3 border p-4 text-left transition-all disabled:cursor-not-allowed',
                !checked && !isPicked && ready && 'opacity-40',
                !checked && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                isWrong && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40'
              )}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center text-lg font-black tabular-nums"
                style={{ color: isPicked ? color : `${color}40` }}
                aria-hidden
              >
                {checked ? (
                  isCorrect ? (
                    <Check className="h-6 w-6" />
                  ) : isPicked ? (
                    <X className="h-6 w-6 text-rose-500" />
                  ) : (
                    '–'
                  )
                ) : isPicked ? (
                  rank + 1
                ) : (
                  '–'
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />
                  {item.label}
                </span>
                <span className="block font-mono text-lg font-bold leading-none tabular-nums sm:text-xl">
                  {item.approx ? 'ok. ' : ''}
                  {item.value.toLocaleString('pl-PL')}
                </span>
              </span>
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
            na dobrym miejscu. Więcej cyfr w liczbie prawie zawsze znaczy więcej — nawet jeśli
            pierwsza cyfra wygląda „mniejsza”.
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
