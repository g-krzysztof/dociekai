import { Fragment } from 'react';
import type { Tresc as TrescText } from '../data/types';

// `{3/4}` → ułamek, `{2 3/4}` → liczba mieszana. Reszta tekstu bez zmian.
const ULAMEK = /\{(?:(\d+) )?(\d+)\/(\d+)\}/g;

/** Tekst materiału z ułamkami piętrowymi. Czytnik ekranu dostaje „3/4”. */
export function Tresc({ tekst }: { tekst: TrescText }) {
  const czesci: React.ReactNode[] = [];
  let ostatni = 0;

  for (const m of tekst.matchAll(ULAMEK)) {
    const [calosc, cale, licznik, mianownik] = m;
    const start = m.index ?? 0;
    if (start > ostatni) czesci.push(tekst.slice(ostatni, start));
    czesci.push(
      <Fragment key={start}>
        <span className="sr-only">{cale ? `${cale} i ${licznik}/${mianownik}` : `${licznik}/${mianownik}`}</span>
        <span aria-hidden className="whitespace-nowrap">
          {cale && <span className="ulamek-calosc">{cale}</span>}
          <span className="ulamek">
            <span>{licznik}</span>
            <span>{mianownik}</span>
          </span>
        </span>
      </Fragment>,
    );
    ostatni = start + calosc.length;
  }
  if (ostatni < tekst.length) czesci.push(tekst.slice(ostatni));

  return <>{czesci}</>;
}

/** Tekst bez znaczników — do metadanych, alt i nazw. */
export const trescNaTekst = (tekst: TrescText) =>
  tekst.replace(ULAMEK, (_, cale, l, m) => (cale ? `${cale} ${l}/${m}` : `${l}/${m}`));
