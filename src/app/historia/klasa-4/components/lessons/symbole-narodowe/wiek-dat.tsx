'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { toRoman } from '../../../lib/timeline/dating';

/** Trzy daty tej lekcji i półki wieków (z wabikami „o jeden za mało”). */
const DATES = [1295, 1797, 1927];
const SHELVES = [12, 13, 17, 18, 19, 20];

function century(year: number) {
  return Math.floor((year - 1) / 100) + 1;
}

/**
 * Przypominajka L10 (z L7, dystans 3): w którym wieku? Dziecko stuka datę,
 * potem półkę z cyfrą rzymską. Odrzut przypomina regułę kciuka. Poza
 * postępem (slot `entry`).
 */
export function WiekDat({ color }: { color: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [placed, setPlaced] = useState<Record<number, number>>({});
  const [message, setMessage] = useState<string | null>(null);

  const put = (shelf: number) => {
    if (selected === null) return;
    if (century(selected) === shelf) {
      setPlaced((p) => ({ ...p, [selected]: shelf }));
      setMessage(null);
    } else {
      const last2 = String(selected).slice(-2);
      setMessage(
        `Zasłoń kciukiem „${last2}” w ${selected}: zostaje ${String(selected).slice(0, -2)}, a końcówka to nie 00 — więc dodaj jeden.`
      );
    }
    setSelected(null);
  };

  const all = DATES.every((d) => placed[d]);

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <p>
        Dziś spotkasz trzy daty. W którym wieku każda z nich? Stuknij datę, potem półkę. Pamiętasz
        regułę kciuka?
      </p>
      <div className="flex flex-wrap gap-2">
        {DATES.map((d) => (
          <button
            key={d}
            type="button"
            disabled={!!placed[d]}
            onClick={() => setSelected((s) => (s === d ? null : d))}
            className={`cursor-pointer border px-3 py-1.5 font-mono font-semibold disabled:cursor-default disabled:opacity-50 ${selected === d ? 'text-white' : ''}`}
            style={selected === d ? { background: color, borderColor: color } : undefined}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {SHELVES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => put(s)}
            className="min-h-14 cursor-pointer border-b-4 bg-muted/40 px-2 py-1 text-center hover:bg-muted"
            style={{ borderColor: color }}
          >
            <span className="block font-serif text-base font-semibold">{toRoman(s)} w.</span>
            {DATES.filter((d) => placed[d] === s).map((d) => (
              <span key={d} className="block font-mono text-xs">
                {d}
              </span>
            ))}
          </button>
        ))}
      </div>
      {message && (
        <p className="text-destructive" aria-live="polite">
          {message}
        </p>
      )}
      {all && (
        <p aria-live="polite">
          <Check className="mr-1 inline h-4 w-4" style={{ color }} aria-hidden />
          XIII, XVIII i XX wiek. Te trzy daty to korona orła, narodziny pieśni i dzień, w którym
          została hymnem.
        </p>
      )}
    </div>
  );
}
