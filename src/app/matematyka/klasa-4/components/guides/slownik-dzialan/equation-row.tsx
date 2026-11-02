'use client';

import { useState } from 'react';
import { TermSlot } from './term-slot';
import type { Term } from './guide-content';

interface EquationRowProps {
  terms: [Term, Term, Term];
  operator: string;
  color: string;
}

/**
 * Jedno działanie jako trzy klocki do odsłonięcia, np. `8 + 5 = 13`. Stan
 * odsłonięcia jest lokalny dla tego równania — inne równanie na stronie ma
 * własny, niezależny stan.
 */
export function EquationRow({ terms, operator, color }: EquationRowProps) {
  const [revealed, setRevealed] = useState([false, false, false]);

  const reveal = (index: number) => {
    setRevealed((prev) => prev.map((value, i) => (i === index ? true : value)));
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <TermSlot
        value={terms[0].value}
        term={terms[0].term}
        color={color}
        selected={revealed[0]}
        onSelect={() => reveal(0)}
      />
      <span className="text-2xl font-black text-muted-foreground sm:text-3xl">{operator}</span>
      <TermSlot
        value={terms[1].value}
        term={terms[1].term}
        color={color}
        selected={revealed[1]}
        onSelect={() => reveal(1)}
      />
      <span className="text-2xl font-black text-muted-foreground sm:text-3xl">=</span>
      <TermSlot
        value={terms[2].value}
        term={terms[2].term}
        color={color}
        selected={revealed[2]}
        onSelect={() => reveal(2)}
      />
    </div>
  );
}
