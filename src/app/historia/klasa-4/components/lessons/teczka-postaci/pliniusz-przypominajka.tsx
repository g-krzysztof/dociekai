'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Przypominajka L31 (z L30, dystans 1): dlaczego historycy cenią list
 * Pliniusza o chrześcijanach? Most do teczki — świadek z zewnątrz i więcej
 * niż jeden świadek.
 */
const OPTIONS = [
  { id: 'a', text: 'Bo Pliniusz był chrześcijaninem i znał gminę od środka.', why: 'Nie był — pisał o chrześcijanach „oni” i pytał cesarza, czy ich karać.' },
  { id: 'b', text: 'Bo jest bardzo stary, a stare źródła zawsze mówią prawdę.', why: 'Wiek źródła nie mówi, czy autor pisał prawdę. Stary wiersz też może kłamać.' },
  { id: 'c', text: 'Bo pisał ktoś z zewnątrz, kto nie miał powodu chwalić chrześcijan — a jednak zapisał o nich coś dobrego.', why: null },
];

export function PliniuszPrzypominajka({ color }: { color: string }) {
  const [picked, setPicked] = useState<string | null>(null);
  const opt = OPTIONS.find((o) => o.id === picked);
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Ostatnio czytałeś/łaś list rzymskiego namiestnika Pliniusza o chrześcijanach. <strong>Dlaczego historycy tak go cenią?</strong>
      </p>
      <div className="space-y-1.5">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={picked === o.id}
            onClick={() => setPicked(o.id)}
            className={cn('block w-full border-2 bg-white px-3 py-1.5 text-left text-sm dark:bg-zinc-900', picked === o.id && 'font-semibold')}
            style={picked === o.id ? { borderColor: o.why ? 'var(--destructive)' : color } : undefined}
          >
            {o.text}
          </button>
        ))}
      </div>
      {opt?.why && <p className="text-sm text-destructive">{opt.why}</p>}
      {opt && !opt.why && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Tak. Dziś dostaniesz całą teczkę takich świadków — i to Ty zdecydujesz, komu wierzyć.
        </p>
      )}
    </div>
  );
}
