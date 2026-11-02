'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { judgeMini, MINI_SENTENCES, type MiniMark } from './przypominajka-l4';

const NEXT: Record<'brak' | MiniMark, MiniMark | undefined> = { brak: 'fakt', fakt: 'opinia', opinia: undefined };

/**
 * Przypominajka L4 — zakreślacz z L3 w skrócie (dystans 1): stuknięcie
 * zmienia kolor zdania (zielony → żółty → bez koloru). Poza postępem.
 */
export function ZakreslaczMini({ color }: { color: string }) {
  const [marks, setMarks] = useState<Record<string, MiniMark | undefined>>({});
  const [checked, setChecked] = useState<ReturnType<typeof judgeMini> | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        W poprzedniej lekcji zakreślałeś/łaś fakty na zielono, a opinie na żółto. Trzy zdania o książce, która
        pojawi się dziś — <strong>stuknij zdanie</strong>, żeby zmienić jego kolor.
      </p>
      <ul className="space-y-1.5">
        {MINI_SENTENCES.map((s) => {
          const m = marks[s.id];
          const bad = checked?.wrong.some((w) => w.id === s.id);
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={checked?.ok}
                onClick={() => {
                  setChecked(null);
                  setMarks((prev) => ({ ...prev, [s.id]: NEXT[m ?? 'brak'] }));
                }}
                className={cn(
                  'w-full border px-3 py-2 text-left text-sm transition-colors',
                  m === 'fakt' && 'bg-emerald-200/80 dark:bg-emerald-700/60',
                  m === 'opinia' && 'bg-yellow-200/90 dark:bg-yellow-600/60',
                  bad && 'border-destructive'
                )}
                aria-label={`${s.text}${m ? ` — ${m === 'fakt' ? 'zielony, fakt' : 'żółty, opinia'}` : ''}`}
              >
                {s.text}
              </button>
              {bad && <p className="mt-1 text-xs text-destructive">{s.why}</p>}
            </li>
          );
        })}
      </ul>
      {!checked?.ok && (
        <button
          type="button"
          onClick={() => setChecked(judgeMini(marks))}
          className="border px-3 py-1.5 text-sm font-semibold"
          style={{ borderColor: color, color }}
        >
          Sprawdź
        </button>
      )}
      {checked && !checked.ok && checked.missing > 0 && (
        <p className="text-sm text-destructive" aria-live="polite">Każde zdanie potrzebuje koloru.</p>
      )}
      {checked?.ok && (
        <p className="text-sm font-semibold leading-relaxed" style={{ color }} aria-live="polite">
          Dobrze. Dziś zapytamy o coś innego: nie „czy to prawda?”, tylko „dlaczego to się stało i co z tego wynikło?”.
        </p>
      )}
    </div>
  );
}
