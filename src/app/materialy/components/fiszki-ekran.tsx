'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { ZestawFiszek } from '../data/types';
import { Fiszka } from './fiszki';
import { trescNaTekst } from './tresc';

/** Fiszki na stronie: te same karty co w PDF, obracane kliknięciem. */
export function FiszkiEkran({ zestaw }: { zestaw: ZestawFiszek }) {
  const [odwrocone, setOdwrocone] = useState<Set<number>>(() => new Set());
  const wszystkie = odwrocone.size === zestaw.karty.length;

  const przelacz = (i: number) =>
    setOdwrocone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="kartka-kolory" data-przedmiot={zestaw.przedmiot}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--mata-tekst-cichy)]">Kliknij kartę, żeby zobaczyć odpowiedź.</p>
        <button
          type="button"
          onClick={() => setOdwrocone(wszystkie ? new Set() : new Set(zestaw.karty.map((_, i) => i)))}
          className="inline-flex items-center gap-2 rounded-md border border-[var(--mata-linia-mocna)] px-3 py-1.5 text-sm font-semibold text-[var(--mata-tekst)] transition-colors hover:bg-[var(--mata-gleboka)]"
        >
          <RotateCcw aria-hidden className="h-4 w-4" />
          {wszystkie ? 'Pokaż pytania' : 'Pokaż wszystkie odpowiedzi'}
        </button>
      </div>

      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {zestaw.karty.map((karta, i) => {
          const odwrocona = odwrocone.has(i);
          return (
            <li key={i}>
              {/* div zamiast <button>: karta zawiera akapity, których nie wolno zagnieżdżać w przycisku */}
              <div
                role="button"
                tabIndex={0}
                className="fiszka-ekran block w-full cursor-pointer rounded-[10px] text-left"
                data-odwrocona={odwrocona}
                onClick={() => przelacz(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    przelacz(i);
                  }
                }}
                aria-pressed={odwrocona}
                aria-label={`Fiszka ${i + 1}: ${trescNaTekst(karta.awers.pytanie)}${
                  odwrocona ? ` Odpowiedź: ${trescNaTekst(karta.rewers.odpowiedz)}` : ''
                }`}
              >
                <div className="fiszka-ekran-obrot" aria-hidden>
                  <div className="fiszka-ekran-strona cien-kartki rounded-[10px]" data-strona="awers">
                    <Fiszka zestaw={zestaw} fiszka={karta} numer={i + 1} strona="awers" />
                  </div>
                  <div className="fiszka-ekran-strona cien-kartki rounded-[10px]" data-strona="rewers">
                    <Fiszka zestaw={zestaw} fiszka={karta} numer={i + 1} strona="rewers" />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
