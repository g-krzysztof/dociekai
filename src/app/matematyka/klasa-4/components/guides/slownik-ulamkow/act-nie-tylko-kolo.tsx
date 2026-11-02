'use client';

import { useState } from 'react';
import { GuideAct } from '../guide-act';
import { FractionNotation } from '../../fraction-notation';
import { FractionTokenRow } from './fraction-token-row';

const TOTAL_CRAYONS = 6;

/**
 * Ten sam mechanizm co `ActLicznikIMianownik` (klik buduje licznik na żywo),
 * ale na grupie osobnych przedmiotów zamiast podzielonego kształtu — dziecko
 * ma zobaczyć, że ułamek to nie tylko „pokrojona figura”.
 */
export function ActNieTylkoKolo({ color }: { color: string }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const toggle = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <GuideAct id="nie-tylko-kolo" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Ułamek to nie tylko koło</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Ten sam pomysł działa dla dowolnej grupy przedmiotów. W pudełku jest {TOTAL_CRAYONS}{' '}
        kredek — stuknij te, które bierzesz do plecaka.
      </p>

      <div className="grid items-center gap-8 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_180px]">
        <FractionTokenRow
          color={color}
          total={TOTAL_CRAYONS}
          selected={selected}
          onToggle={toggle}
          ariaLabel={`${TOTAL_CRAYONS} kredek w pudełku, stuknij te, które bierzesz do plecaka`}
        />

        <FractionNotation licznik={selected.size} mianownik={TOTAL_CRAYONS} color={color} licznikRevealed mianownikRevealed size="md" />
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed sm:text-base" style={{ color: textColor }}>
        Mianownik to teraz wszystkie kredki w pudełku, a licznik to te, które wybrano do plecaka —
        dokładnie ta sama zasada co przy podzielonej pizzy.
      </p>
    </GuideAct>
  );
}
