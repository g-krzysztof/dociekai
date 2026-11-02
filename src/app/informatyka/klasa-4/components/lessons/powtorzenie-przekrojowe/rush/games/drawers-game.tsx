'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { pick, type GameProps } from '../types';

/**
 * Dział 5 — **SZUKAJ!** Piętnaście szuflad, w każdej kartka z liczbą, liczby
 * rosną od lewej do prawej. Dziecko ma cztery otwarcia na znalezienie
 * jednej kartki — tyle, ile potrzeba, gdy zaczyna się od środka i za każdym
 * razem odrzuca połowę (2⁴ − 1 = 15). Ta sama różnica, co w `DrawerHunt`:
 * poza kolejnością trzeba by otwierać po kolei.
 */

const MAX_OPENS = 4;
const TARGET_INDEXES = [2, 5, 9, 12, 10, 4, 13];

/** Piętnaście rosnących liczb, ta sama lista dla tego samego ziarna. */
function makeValues(seed: number): number[] {
  const values: number[] = [];
  let value = 6 + (Math.abs(seed) * 7) % 9;
  for (let i = 0; i < 15; i += 1) {
    value += 3 + ((Math.abs(seed) * 13 + i * 17) % 6);
    values.push(value);
  }
  return values;
}

export function DrawersGame({ finish, seed }: GameProps) {
  const values = makeValues(seed);
  const targetIndex = pick(TARGET_INDEXES, seed);
  const target = values[targetIndex];
  const [opened, setOpened] = useState<number[]>([]);
  const [message, setMessage] = useState('Otwórz szufladę.');

  const open = (index: number) => {
    if (opened.includes(index)) return;
    const next = [...opened, index];
    setOpened(next);
    const value = values[index];
    if (value === target) {
      setMessage(`Jest! W szufladzie ${index + 1} leży ${target}.`);
      finish(true);
      return;
    }
    setMessage(value < target ? `${value} to za mało — szukana jest dalej w prawo.` : `${value} to za dużo — szukana jest bardziej w lewo.`);
    if (next.length >= MAX_OPENS) finish(false);
  };

  return (
    <div className="flex h-full flex-col justify-between gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm">
          Szukana kartka: <span className="text-3xl font-black tabular-nums">{target}</span>
        </p>
        <p className="text-sm tabular-nums text-muted-foreground">
          Otwarcia: {opened.length}/{MAX_OPENS}
        </p>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {values.map((value, index) => {
          const isOpen = opened.includes(index);
          return (
            <button
              key={index}
              type="button"
              onClick={() => open(index)}
              disabled={isOpen}
              aria-label={isOpen ? `Szuflada ${index + 1}: ${value}` : `Szuflada ${index + 1}`}
              className={cn(
                'flex h-12 flex-col items-center justify-center border-2 text-sm font-bold tabular-nums transition-colors',
                isOpen
                  ? value === target
                    ? 'border-emerald-500 bg-emerald-500/20'
                    : 'border-slate-300 bg-muted text-muted-foreground'
                  : 'cursor-pointer border-amber-500/60 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40'
              )}
            >
              {isOpen ? value : <span className="h-1.5 w-5 bg-amber-700/60" aria-hidden />}
              <span className="text-[9px] font-normal leading-none text-muted-foreground">{index + 1}</span>
            </button>
          );
        })}
      </div>
      <p className="min-h-[2.5rem] text-sm leading-snug" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
