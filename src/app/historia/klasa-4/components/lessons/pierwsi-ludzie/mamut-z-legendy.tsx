'use client';

import { useState } from 'react';

/**
 * Przypominajka L15 (z L14, dystans 1): stuknięcie zmienia kolor zdania
 * o smoku wawelskim — zielony: da się sprawdzić, różowy: zmyślone. Kości
 * przy katedrze to m.in. kość mamuta (L14) — mostek do epoki lodowej.
 */
type Mark = 'brak' | 'prawda' | 'fikcja';

const LINES: { id: string; text: string; is: Exclude<Mark, 'brak'> }[] = [
  { id: 'jama', text: 'Pod Wawelem jest jaskinia.', is: 'prawda' },
  { id: 'owce', text: 'Smok co tydzień zjadał owcę.', is: 'fikcja' },
  { id: 'kosci', text: 'Przy drzwiach katedry wiszą wielkie kości.', is: 'prawda' },
  { id: 'siarka', text: 'Smok pił z Wisły, aż pękł.', is: 'fikcja' },
];

const NEXT: Record<Mark, Mark> = { brak: 'prawda', prawda: 'fikcja', fikcja: 'brak' };
const LOOK: Record<Mark, string> = { brak: '', prawda: 'bg-green-200/80 dark:bg-green-900/60', fikcja: 'bg-pink-200/80 dark:bg-pink-900/60' };

export function MamutZLegendy({ color }: { color: string }) {
  const [marks, setMarks] = useState<Record<string, Mark>>({});
  const [checked, setChecked] = useState(false);
  const wrong = LINES.filter((l) => (marks[l.id] ?? 'brak') !== l.is);
  const ok = checked && wrong.length === 0;

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Stuknij każde zdanie: raz — <span className="bg-green-200/80 px-1 dark:bg-green-900/60">da się sprawdzić</span>, dwa razy —{' '}
        <span className="bg-pink-200/80 px-1 dark:bg-pink-900/60">zmyślone</span>.
      </p>
      <ul className="space-y-1.5">
        {LINES.map((l) => {
          const m = marks[l.id] ?? 'brak';
          return (
            <li key={l.id}>
              <button
                type="button"
                disabled={ok}
                onClick={() => {
                  setChecked(false);
                  setMarks((s) => ({ ...s, [l.id]: NEXT[s[l.id] ?? 'brak'] }));
                }}
                className={`w-full border px-2 py-1.5 text-left text-sm disabled:cursor-default ${LOOK[m]}`}
                style={checked && m !== l.is ? { borderColor: 'hsl(var(--destructive))' } : undefined}
              >
                {l.text}
              </button>
            </li>
          );
        })}
      </ul>
      {!ok && (
        <button type="button" onClick={() => setChecked(true)} className="border px-3 py-1.5 text-sm font-semibold text-white" style={{ background: color }}>
          Sprawdź
        </button>
      )}
      {checked && !ok && (
        <p className="text-sm text-destructive">
          {wrong.length === 1 ? 'Jedno zdanie' : `${wrong.length} zdania`} do poprawki — zaznaczone ramką. Czy to da się zobaczyć na
          własne oczy?
        </p>
      )}
      {ok && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Jedna z tych „smoczych” kości należała do mamuta. Mamuty chodziły po zaśnieżonych równinach w epoce lodowej — a
          ludzie wtedy już na nie patrzyli. Dziś cofniesz się do ich czasów.
        </p>
      )}
    </div>
  );
}
