'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Przypominajka L30 (z L22, dystans 8): w L22 statek płynął ok. 70 km
 * dziennie, a wędrowiec w górach szedł 10–30 km. Ile dni płynie statek
 * 350 km? Most do bloku 1 — Paweł podróżuje tymi samymi morzami.
 */
const OPTIONS = [
  { days: 35, why: 'Tyle szedłby wędrowiec po stromych górach, 10 km dziennie — statek jest dużo szybszy.' },
  { days: 5, why: null },
  { days: 12, why: 'Tyle szedłby piechur po płaskim, 30 km dziennie. A statek płynął ok. 70 km na dzień.' },
];

export function StatekPrzypominajka({ color }: { color: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  const opt = OPTIONS.find((o) => o.days === picked);

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Osiem lekcji temu prowadziłeś/łaś statek i wędrowca po greckich górach i morzach. Statek płynął ok. 70 km dziennie.{' '}
        <strong>Ile dni płynąłby statek z portu do portu odległego o 350 km?</strong>
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.days}
            type="button"
            aria-pressed={picked === o.days}
            onClick={() => setPicked(o.days)}
            className={cn('border-2 bg-white px-3 py-1.5 text-sm tabular-nums dark:bg-zinc-900', picked === o.days && 'font-semibold')}
            style={picked === o.days ? { borderColor: o.why ? 'var(--destructive)' : color } : undefined}
          >
            ok. {o.days} dni
          </button>
        ))}
      </div>
      {opt?.why && <p className="text-sm text-destructive">{opt.why}</p>}
      {opt && !opt.why && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Tak — 5 razy po 70 km. Morze łączyło ludzi szybciej niż lądowe drogi. Dziś zobaczysz, co jeszcze przewoziły statki
          po Morzu Śródziemnym — oprócz towarów.
        </p>
      )}
    </div>
  );
}
