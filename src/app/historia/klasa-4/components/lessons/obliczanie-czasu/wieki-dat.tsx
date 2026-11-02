'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { centuryOf, toRoman } from '../../../lib/timeline/dating';
import { formatYear } from './obliczanie';

/** Trzy daty z tej lekcji, zanim padnie pytanie „ile lat minęło”. */
const CARDS = [
  { id: 'kazimierz', year: 1310, event: 'urodziny Kazimierza Wielkiego' },
  { id: 'reforma', year: 1582, event: 'nowy kalendarz' },
  { id: 'august', year: -63, event: 'urodziny Augusta' },
];

const SHELVES = [-1, 1, 14, 15, 16];

const shelfLabel = (c: number) => `${toRoman(Math.abs(c))} w.${c < 0 ? ' p.n.e.' : ''}`;

/**
 * Przypominajka L8 (z L7, dystans 1): stuknij datę, potem półkę jej wieku.
 * Poza postępem (slot `entry`).
 */
export function WiekiDat({ color }: { color: string }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, number>>({});
  const [miss, setMiss] = useState<string | null>(null);
  const finished = CARDS.every((c) => placed[c.id] !== undefined);

  const drop = (shelf: number) => {
    const card = CARDS.find((c) => c.id === picked);
    if (!card) return;
    if (centuryOf(card.year) !== shelf) {
      setMiss(`${formatYear(card.year)} to nie ${shelfLabel(shelf)} — zasłoń dwie ostatnie cyfry i pomyśl o koralikach.`);
      return;
    }
    setMiss(null);
    setPlaced((p) => ({ ...p, [card.id]: shelf }));
    setPicked(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">Pamiętasz kciuk na cyfrach? Stuknij datę, a potem półkę jej wieku.</p>
      <div className="flex flex-wrap gap-2">
        {CARDS.filter((c) => placed[c.id] === undefined).map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setPicked(c.id)}
            className={cn('border px-3 py-1.5 text-sm', picked === c.id && 'font-semibold')}
            style={picked === c.id ? { borderColor: color } : undefined}
          >
            <span className="font-mono tabular-nums">{formatYear(c.year)}</span>{' '}
            <span className="text-xs text-muted-foreground">{c.event}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
        {SHELVES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => drop(s)}
            disabled={!picked}
            className="flex min-h-[3.5rem] flex-col border-b-4 bg-muted/30 p-2 text-left disabled:cursor-default"
            style={{ borderBottomColor: color }}
          >
            <span className="font-serif text-sm font-bold">{shelfLabel(s)}</span>
            <span className="text-[11px] tabular-nums">
              {CARDS.filter((c) => placed[c.id] === s)
                .map((c) => formatYear(c.year))
                .join(', ')}
            </span>
          </button>
        ))}
      </div>
      {miss && (
        <p className="text-sm text-destructive" aria-live="polite">
          {miss}
        </p>
      )}
      {finished && (
        <p className="text-sm" aria-live="polite">
          Wiesz już, <em>kiedy</em> coś się stało. Dziś policzysz, <strong>ile lat minęło</strong> — także wtedy, gdy
          jedna data jest przed naszą erą, a druga po niej.
        </p>
      )}
    </div>
  );
}
