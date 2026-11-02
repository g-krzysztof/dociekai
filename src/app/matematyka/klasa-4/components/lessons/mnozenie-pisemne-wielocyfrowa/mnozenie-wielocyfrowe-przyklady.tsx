'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { LongMultiplicationGrid, type LongMultiplicationRow } from './long-multiplication-grid';
import { buildLongMultiplicationLayout } from '../../../lib/column-algorithm';

interface Example {
  id: string;
  a: number;
  multiplier: number;
  note: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'bez-przeniesienia',
    a: 21,
    multiplier: 13,
    note: 'Żaden z iloczynów cząstkowych nie wymaga przeniesienia — najprostszy możliwy przypadek, więc samo przesunięcie drugiego wiersza widać najwyraźniej.',
  },
  {
    id: 'przeniesienie-w-czastkowym',
    a: 47,
    multiplier: 23,
    note: 'Pierwszy iloczyn cząstkowy (47 × 3 = 141) sam w sobie wymaga przeniesienia — dokładnie tak, jak w mnożeniu przez liczbę jednocyfrową z poprzedniej lekcji.',
  },
  {
    id: 'przeniesienie-w-dodawaniu',
    a: 218,
    multiplier: 34,
    note: 'Tym razem to dodawanie gotowych iloczynów cząstkowych (872 + 6540) wymaga przeniesienia — ostatni krok całego algorytmu to zwykłe dodawanie pisemne.',
  },
  {
    id: 'mnoznik-trzycyfrowy',
    a: 24,
    multiplier: 213,
    note: 'Mnożnik ma aż trzy cyfry, więc powstają trzy iloczyny cząstkowe, przesunięte o 0, 1 i 2 kolumny. Kolejność liczb nie ma znaczenia — 24 × 213 to to samo, co 213 × 24, bo mnożenie jest przemienne.',
  },
];

interface MnozenieWielocyfrowePrzykladyProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: 4 w pełni rozwiązane mnożenia przez liczbę wielocyfrową, od czystego przesunięcia po mnożnik trzycyfrowy z trzema iloczynami cząstkowymi. */
export function MnozenieWielocyfrowePrzyklady({ color, onComplete }: MnozenieWielocyfrowePrzykladyProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${revealed}`);

  const example = EXAMPLES[index];
  const layout = buildLongMultiplicationLayout(example.a, example.multiplier);
  const rows: LongMultiplicationRow[] = layout.partials.map((partial) => ({
    digits: partial.digits,
    revealed: true,
  }));
  const isLast = index === EXAMPLES.length - 1;

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setRevealed(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {EXAMPLES.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{EXAMPLES.length}
        </span>
      </div>

      <div className="text-center">
        <h3 className="mb-5 font-mono text-2xl font-black tracking-wide sm:text-3xl" style={{ color }}>
          {example.a} × {example.multiplier}
        </h3>

        {!revealed ? (
          <Button onClick={() => setRevealed(true)}>Policz w słupku</Button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 flex justify-center overflow-x-auto">
              <LongMultiplicationGrid
                color={color}
                topDigits={layout.topDigits}
                multiplierDigits={layout.multiplierDigits}
                rows={rows}
                sumDigits={layout.sumDigits}
                showPlaceLabels
                ariaLabel={`Mnożenie pisemne ${example.a} razy ${example.multiplier}, wynik ${layout.total}`}
              />
            </div>
            <p className="mx-auto max-w-md text-sm leading-relaxed sm:text-base">{example.note}</p>
          </motion.div>
        )}
      </div>

      {revealed && (
        <div className="mt-5 flex justify-end">
          <Button onClick={next} className="gap-1.5">
            {isLast ? 'Zakończ' : 'Następny przykład'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
