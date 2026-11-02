'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

/** Lata panowania z tytułu mapy (F-II.4-11). */
const FROM = 1333;
const TO = 1370;
const START = 30;

/**
 * Przypominajka L9 (z L8, dystans 1): ile lat panował Kazimierz Wielki?
 * Obie daty z naszej ery — zwykłe odejmowanie, bez zapadki „− 1”. Dziecko
 * kręci licznikiem (− / +) i sprawdza. Poza postępem (slot `entry`).
 */
export function LataKrola({ color }: { color: string }) {
  const [n, setN] = useState(START);
  const [checked, setChecked] = useState<boolean | null>(null);

  const step = (d: number) => {
    setN((v) => Math.max(0, Math.min(99, v + d)));
    setChecked(null);
  };

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <p>
        Kazimierz Wielki został królem w <strong>{FROM}</strong> roku, a panował do śmierci w{' '}
        <strong>{TO}</strong> roku. Ile lat panował? Pamiętasz liczydło lat — obie daty są z naszej
        ery.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          className="flex h-9 w-9 cursor-pointer items-center justify-center border hover:bg-muted"
          aria-label="Mniej o rok"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <span
          className="w-14 border-b-2 text-center font-mono text-2xl tabular-nums"
          style={{ borderColor: color }}
          aria-live="polite"
        >
          {n}
        </span>
        <button
          type="button"
          onClick={() => step(1)}
          className="flex h-9 w-9 cursor-pointer items-center justify-center border hover:bg-muted"
          aria-label="Więcej o rok"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
        <span>lat</span>
        <button
          type="button"
          onClick={() => setChecked(n === TO - FROM)}
          className="ml-2 cursor-pointer border px-3 py-1.5 font-semibold hover:bg-muted"
          style={{ borderColor: color, color }}
        >
          Sprawdź
        </button>
      </div>
      {checked === false && (
        <p className="text-destructive" aria-live="polite">
          {n === TO - FROM + 1
            ? 'O jeden za dużo — zapadka „− 1” jest tylko dla dat z dwóch er. Tu wystarczy odjąć.'
            : n === TO - FROM - 1
              ? 'O jeden za mało — obie daty z naszej ery, więc po prostu odejmij.'
              : `Odejmij: ${TO} − ${FROM}.`}
        </p>
      )}
      {checked && (
        <p aria-live="polite">
          Tak, <strong>{TO - FROM} lat</strong>. Te właśnie lata — {FROM}–{TO} — zobaczysz za chwilę
          w tytule mapy.
        </p>
      )}
    </div>
  );
}
