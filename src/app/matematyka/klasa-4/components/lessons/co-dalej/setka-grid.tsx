'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Nowość tej lekcji: pierwszy widżet w kursie, który **podgląda mechanikę
 * klasy 5, nie ucząc jej**. Setka 10×10 — dziecko cieniuje kwadraciki, a odczyt
 * na żywo pokazuje ten sam kawałek na trzy sposoby (N na 100 = N% = 0,NN),
 * łącząc procent z ułamkiem dziesiętnym, który już zna. Zero oceniania,
 * zero „źle" — to zapowiedź, nie ćwiczenie.
 */

const TOTAL = 100;
const SEEN_THRESHOLD = 12;

interface SetkaGridProps {
  color: string;
  onSeen: () => void;
}

export function SetkaGrid({ color, onSeen }: SetkaGridProps) {
  const [shaded, setShaded] = useState<Set<number>>(() => new Set());
  const count = shaded.size;

  useEffect(() => {
    if (count >= SEEN_THRESHOLD) onSeen();
  }, [count, onSeen]);

  const toggle = (i: number) =>
    setShaded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const fillTo = (n: number) => setShaded(new Set(Array.from({ length: n }, (_, i) => i)));

  const decimal = (count / 100).toFixed(2).replace('.', ',');
  const textColor = `color-mix(in oklch, ${color} 82%, black)`;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm font-semibold sm:text-base">Zacieniuj kwadraciki w tej setce.</p>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        Cała plansza to 100 kwadracików — jedna „setka”. Ile zacienisz, tyle procent zacieniowałeś.
      </p>

      <div className="mx-auto grid w-full max-w-[280px] grid-cols-10 gap-0.5">
        {Array.from({ length: TOTAL }, (_, i) => {
          const on = shaded.has(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              aria-label={`Kwadracik ${i + 1}, ${on ? 'zacieniowany' : 'pusty'}`}
              aria-pressed={on}
              className={cn(
                'aspect-square border border-border transition-colors',
                !on && 'bg-background hover:bg-muted'
              )}
              style={on ? { backgroundColor: color, borderColor: color } : undefined}
            />
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fillTo(25)}
          className="cursor-pointer border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/40"
        >
          Zacień 25
        </button>
        <button
          type="button"
          onClick={() => fillTo(50)}
          className="cursor-pointer border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/40"
        >
          Zacień 50
        </button>
        <button
          type="button"
          onClick={() => setShaded(new Set())}
          className="cursor-pointer border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted/40"
        >
          Wyczyść
        </button>
      </div>

      <div
        className="mt-4 border-t-2 p-3 text-center"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <p className="text-sm">
          Zacieniowane: <strong className="tabular-nums">{count}</strong> na 100
        </p>
        <p className="mt-1 font-mono text-lg font-bold tabular-nums" style={{ color: textColor }}>
          {count}/100 = {count}% = {decimal}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Ten sam kawałek całości zapisany na trzy sposoby. Zapis z procentem („%”) poznasz w klasie 5.
        </p>
      </div>
    </div>
  );
}
