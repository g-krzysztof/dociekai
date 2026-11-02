'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Zamknięcie lekcji: „celowo i bezpiecznie” z `[4.1]` sprowadzone do jednej
 * rzeczy, którą dziecko u siebie poprawia. Z sześciu częstych nawyków wybiera
 * jeden — ten najbardziej swój — i dopisuje, co robi zamiast tego.
 *
 * Jeden, a nie wszystkie: postanowienie „od jutra sześć rzeczy inaczej” nie
 * przeżywa tygodnia (ten sam wzorzec co `MyRuleCard` w pierwszej lekcji kursu).
 * Pole na zamiennik jest opcjonalne i nie blokuje ukończenia bloku.
 */

const HABITS = [
  'Trzymam kubek albo butelkę na biurku, tuż przy klawiaturze.',
  'Wyciągam pendrive od razu, bez „Wysuń” / „Bezpiecznie usuń”.',
  'Kable od komputera plączą się pod nogami albo są mocno naciągnięte.',
  'Mam urządzenie (mikrofon, kamerę, skaner), którego nie umiem świadomie użyć.',
  'Czyszczę ekran rękawem, palcem albo mokrą chusteczką.',
  'Wciskam wtyczkę USB na siłę, kiedy nie chce wejść.',
];

interface UseItRightProps {
  color: string;
  onComplete?: () => void;
}

export function UseItRight({ color, onComplete }: UseItRightProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const [swap, setSwap] = useState('');

  const choose = (habit: string) => {
    setPicked(habit);
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Sprzętu używa się <strong>celowo</strong> (wiem, do czego mi każde urządzenie) i{' '}
        <strong>bezpiecznie</strong> (nie niszczę go i nie robię sobie krzywdy).{' '}
        <strong>Zaznacz jedną rzecz</strong> z listy — tę, która u ciebie najbardziej kuleje.
      </p>

      <ul className="grid gap-2 sm:grid-cols-2">
        {HABITS.map((habit) => {
          const isPicked = picked === habit;
          return (
            <li key={habit}>
              <button
                type="button"
                onClick={() => choose(habit)}
                aria-pressed={isPicked}
                className={cn(
                  'flex h-full w-full cursor-pointer items-start gap-3 border p-3 text-left text-sm leading-relaxed transition-colors',
                  isPicked ? 'font-semibold' : 'hover:bg-muted/40'
                )}
                style={isPicked ? { borderColor: color, backgroundColor: `${color}12` } : undefined}
              >
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: isPicked ? color : 'var(--muted-foreground)' }}
                  aria-hidden
                />
                {habit}
              </button>
            </li>
          );
        })}
      </ul>

      {picked && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <div
            className="mx-auto max-w-md border-t-2 p-6 text-center"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color }}>
              Od dziś tego nie robię
            </p>
            <p className="mt-3 text-base font-bold leading-snug sm:text-lg">{picked}</p>
          </div>

          <div className="mt-5 max-w-md">
            <label htmlFor="use-it-right-swap" className="mb-1.5 block text-sm font-semibold">
              A co robisz zamiast tego?{' '}
              <span className="font-normal text-muted-foreground">(nieobowiązkowe)</span>
            </label>
            <input
              id="use-it-right-swap"
              type="text"
              value={swap}
              onChange={(event) => setSwap(event.target.value)}
              placeholder="np. kubek stawiam na osobnym stoliku obok"
              className="w-full border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
            />
            {swap.trim().length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Dobrze — zamiennik jest ważniejszy niż sam zakaz. Łatwiej przestać, gdy wiadomo, co
                w to miejsce.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
