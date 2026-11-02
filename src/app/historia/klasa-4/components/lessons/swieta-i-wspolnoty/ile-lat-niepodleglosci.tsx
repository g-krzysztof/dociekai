'use client';

import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';

const EVENT = 1918;

/**
 * Przypominajka L11 (z L8, dystans 3): ile lat minęło od 1918 roku do
 * tegorocznego 11 listopada? Dziecko ustawia licznik − / + (± 1, ± 10).
 * Obie daty są naszej ery — odejmujemy bez poprawki. Poza postępem.
 */
export function IleLatNiepodleglosci({ color }: { color: string }) {
  const now = new Date().getFullYear();
  const answer = now - EVENT;
  const [value, setValue] = useState(100);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const bump = (d: number) => {
    setValue((v) => Math.max(0, v + d));
    setMsg(null);
  };

  const check = () => {
    if (value === answer) {
      setOk(true);
      setMsg(null);
    } else if (value === answer + 1) {
      setMsg('O jeden za dużo. Obie daty są naszej ery — nie ma tu szczeliny roku zero, więc odejmujemy zwyczajnie.');
    } else {
      setMsg(`${value}? Policz ${now} − ${EVENT}.`);
    }
  };

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <p>
        11 listopada {now} roku Polska będzie świętować kolejne urodziny niepodległości. Która to
        rocznica? Ile lat minie od {EVENT} roku?
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {[-10, -1].map((d) => (
          <button key={d} type="button" aria-label={`${d < 0 ? 'Odejmij' : 'Dodaj'} ${Math.abs(d)}`} onClick={() => bump(d)} disabled={ok} className="flex cursor-pointer items-center border px-2 py-1 font-mono disabled:opacity-40">
            <Minus className="h-3 w-3" aria-hidden />
            {Math.abs(d)}
          </button>
        ))}
        <span className="min-w-14 text-center font-mono text-2xl font-bold tabular-nums" aria-live="polite">
          {value}
        </span>
        {[1, 10].map((d) => (
          <button key={d} type="button" aria-label={`${d < 0 ? 'Odejmij' : 'Dodaj'} ${Math.abs(d)}`} onClick={() => bump(d)} disabled={ok} className="flex cursor-pointer items-center border px-2 py-1 font-mono disabled:opacity-40">
            <Plus className="h-3 w-3" aria-hidden />
            {d}
          </button>
        ))}
        {!ok && (
          <button type="button" onClick={check} className="cursor-pointer border px-3 py-1 font-semibold" style={{ borderColor: color, color }}>
            Sprawdź
          </button>
        )}
      </div>
      {msg && (
        <p className="text-destructive" aria-live="polite">
          {msg}
        </p>
      )}
      {ok && (
        <p aria-live="polite">
          <Check className="mr-1 inline h-4 w-4" style={{ color }} aria-hidden />
          {answer}. rocznica. Dziś zobaczysz, dlaczego cały kraj pamięta tę datę naraz.
        </p>
      )}
    </div>
  );
}
