'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Przypominajka L23 (z L22, dystans 1): demokracja = dēmos + krátos. Dziecko
 * skleja słowo z dwóch cząstek spośród czterech — jak w warsztacie słów z L22.
 */
const PARTS = [
  { id: 'demo', pl: 'lud' },
  { id: 'geo', pl: 'ziemia' },
  { id: 'kracja', pl: 'władza' },
  { id: 'logia', pl: 'nauka o…' },
];

export function SlowoPrzypominajka({ color }: { color: string }) {
  const [pick, setPick] = useState<string[]>([]);
  const ok = pick[0] === 'demo' && pick[1] === 'kracja';
  const full = pick.length === 2;

  const tap = (id: string) => {
    if (ok) return;
    setPick((p) => (p.length === 2 ? [id] : [...p, id]));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        W ostatniej lekcji sklejałeś/łaś greckie cząstki. <strong>Sklej słowo „władza ludu”</strong> — stuknij dwie cząstki
        po kolei.
      </p>
      <div className="flex flex-wrap gap-2">
        {PARTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => tap(p.id)}
            className={cn('border-2 bg-white px-2 py-1 text-left text-sm dark:bg-zinc-900', pick.includes(p.id) && 'font-semibold')}
            style={pick.includes(p.id) ? { borderColor: color } : undefined}
          >
            {p.id}
            <span className="block text-[11px] font-normal text-muted-foreground">{p.pl}</span>
          </button>
        ))}
      </div>
      {full && !ok && (
        <p className="text-sm text-destructive">
          „{pick.join('')}” to nie „władza ludu”. Spróbuj jeszcze raz — najpierw kto, potem co.
        </p>
      )}
      {ok && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Demokracja — władza ludu. Grecy wymyślili i słowo, i sposób rządzenia. Ale kto w Atenach był „ludem”? Sprawdź.
        </p>
      )}
    </div>
  );
}
