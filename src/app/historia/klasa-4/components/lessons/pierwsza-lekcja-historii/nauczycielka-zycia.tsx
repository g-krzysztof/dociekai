'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Dla dociekliwych (D) — „Czy historia jest nauczycielką życia?”. Nie jest
 * blokiem i nie liczy się do postępu (powłoka nie ma jeszcze bloków
 * `optional`, więc D stoi pod ostatnim blokiem jako dopisek).
 *
 * Gest: suwak „tak ↔ nie”. Im dalej w jedną stronę, tym więcej argumentów tej
 * strony — a pośrodku zdanie, które godzi obie (F-I.1-10): historia uczy, ale
 * gotowych rozwiązań nie daje.
 *
 * Cyceron, „O mówcy” II 36 (ok. 55 p.n.e.): *historia … magistra vitae*.
 */

const YES = [
  'Kronika miasteczka naprawdę podpowiedziała, gdzie nie stawiać szkoły.',
  'Ludzie, którzy pamiętają dawne epidemie, szybciej wiedzą, jak się chronić.',
];
const NO = [
  'Nic nie powtarza się dokładnie tak samo — dzisiejsza rzeka może płynąć inaczej niż sto lat temu.',
  'Ludzie często znają dawne błędy, a i tak je powtarzają.',
];

export function NauczycielkaZycia({ color }: { color: string }) {
  const [value, setValue] = useState(0);
  const yes = value < 0 ? YES.slice(0, Math.min(YES.length, -value)) : [];
  const no = value > 0 ? NO.slice(0, Math.min(NO.length, value)) : [];

  return (
    <aside className="space-y-4 rounded-lg border border-dashed p-5" aria-label="Dla dociekliwych">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        <Sparkles className="h-4 w-4" aria-hidden /> Dla dociekliwych · nie liczy się do postępu
      </p>
      <p className="text-base leading-relaxed">
        Ponad dwa tysiące lat temu rzymski mówca Cyceron nazwał historię <em>magistra vitae</em> —{' '}
        <strong>nauczycielką życia</strong>. Czy miał rację? Przesuń suwak w stronę, która cię przekonuje.
      </p>

      <div className="space-y-1">
        <input
          type="range"
          min={-2}
          max={2}
          step={1}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          aria-label="Czy historia jest nauczycielką życia? Od tak do nie"
          className="w-full"
          style={{ accentColor: color }}
        />
        <div className="flex justify-between text-xs font-semibold">
          <span>tak</span>
          <span>nie</span>
        </div>
      </div>

      <div className="grid min-h-[5.5rem] gap-3 text-sm leading-relaxed sm:grid-cols-2">
        <ul className="space-y-1">
          {yes.map((arg) => (
            <li key={arg} className="rounded-md bg-emerald-50 px-3 py-2 dark:bg-emerald-950/40">
              {arg}
            </li>
          ))}
        </ul>
        <ul className="space-y-1">
          {no.map((arg) => (
            <li key={arg} className="rounded-md bg-amber-50 px-3 py-2 dark:bg-amber-950/40">
              {arg}
            </li>
          ))}
        </ul>
      </div>
      {value === 0 ? (
        <p className="text-sm text-muted-foreground">Suwak stoi pośrodku. Przesuń go i zobacz, co mówi każda strona.</p>
      ) : (
        <p className="text-sm leading-relaxed">
          Obie strony mają argumenty. Historia pozwala uczyć się na błędach dawnych ludzi —{' '}
          <strong>ale gotowych rozwiązań nie daje</strong>: myśleć trzeba samemu.
        </p>
      )}
    </aside>
  );
}
