'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LISIECCY } from '../historia-mojej-rodziny/rodzina-lisieckich';

/** Czworo Lisieckich z drzewa L5, pomieszanych — lata urodzenia z tych samych danych. */
const PICK = ['Franek', 'Wincenty', 'Marek', 'Halina'];
const PEOPLE = PICK.map((name) => LISIECCY.find((p) => p.name === name)!).filter(Boolean);
const SORTED = [...PEOPLE].sort((a, b) => (a.born ?? 0) - (b.born ?? 0));

/**
 * Przypominajka L6 (z L5, dystans 1): dziecko stuka czworo Lisieckich **od
 * urodzonego najdawniej** — porządek chronologiczny na rodzinie, zanim pojawi
 * się na całych dziejach. Poza postępem (slot `entry`).
 */
export function LisieccyPoKolei({ color }: { color: string }) {
  const [taken, setTaken] = useState<string[]>([]);
  const [miss, setMiss] = useState<string | null>(null);
  const finished = taken.length === PEOPLE.length;

  const tap = (name: string) => {
    if (taken.includes(name) || finished) return;
    const expected = SORTED[taken.length];
    if (expected.name !== name) {
      const person = PEOPLE.find((p) => p.name === name)!;
      setMiss(`${person.name} urodził(a) się w ${person.born} r. — ktoś z pozostałych przyszedł na świat wcześniej.`);
      return;
    }
    setMiss(null);
    setTaken((t) => [...t, name]);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Pamiętasz drzewo Lisieckich? Stuknij czworo z nich po kolei — <strong>od urodzonego najdawniej</strong>.
      </p>
      <div className="flex flex-wrap gap-2">
        {PEOPLE.map((p) => {
          const index = taken.indexOf(p.name);
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => tap(p.name)}
              disabled={index >= 0}
              className={cn('flex items-center gap-2 border px-3 py-1.5 text-sm', index >= 0 && 'font-semibold')}
              style={index >= 0 ? { borderColor: color } : undefined}
            >
              {index >= 0 && (
                <span className="font-mono text-xs font-bold" style={{ color }}>
                  {index + 1}.
                </span>
              )}
              {p.name}
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{p.born}</span>
            </button>
          );
        })}
      </div>
      {miss && (
        <p className="text-sm text-destructive" aria-live="polite">
          {miss}
        </p>
      )}
      {finished && (
        <p className="text-sm" aria-live="polite">
          Od najdawniejszego do najnowszego — to się nazywa <strong>porządek chronologiczny</strong>. Dziś ułożysz tak
          całe dzieje ludzkości.
        </p>
      )}
    </div>
  );
}
