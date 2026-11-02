'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { ColumnGrid, type ColumnCellData } from '../../column-grid';
import { buildAdditionSteps, type AdditionColumnStep } from '../../../lib/column-algorithm';

interface Example {
  id: string;
  a: number;
  b: number;
  note: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'bez-przeniesienia',
    a: 213,
    b: 154,
    note: 'Żadna kolumna nie przekracza 9 — ani razu nie trzeba nic przenosić.',
  },
  {
    id: 'jedno-przeniesienie',
    a: 128,
    b: 47,
    note: 'W kolumnie jedności 8 + 7 = 15 — zapisujemy 5, a „1” przenosimy do kolumny dziesiątek.',
  },
  {
    id: 'kaskada-i-nowa-cyfra',
    a: 685,
    b: 427,
    note: 'Przeniesienie powtarza się w każdej kolejnej kolumnie aż do samego końca — i powstaje zupełnie nowa kolumna tysięcy.',
  },
  {
    id: 'duze-liczby',
    a: 2996,
    b: 1997,
    note: 'Ta sama metoda działa identycznie dla liczb czterocyfrowych — nawet gdy przeniesienie powtarza się trzy razy z rzędu.',
  },
];

function solvedCells(steps: AdditionColumnStep[]): ColumnCellData[] {
  const places = steps.length;
  return Array.from({ length: places }, (_, pos) => {
    const stepIndex = places - 1 - pos;
    const step = steps[stepIndex];
    const rightNeighbor = steps[stepIndex - 1];
    return {
      place: step.place,
      top: step.topDigit,
      bottom: step.bottomDigit,
      result: step.resultDigit,
      carry: rightNeighbor && rightNeighbor.outgoingCarry > 0 ? rightNeighbor.outgoingCarry : null,
    };
  });
}

interface DodawaniePrzykladyProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: 4 w pełni rozwiązane dodawania pisemne, od przypadku bez przeniesienia po czterocyfrowe liczby z potrójną kaskadą. */
export function DodawaniePrzyklady({ color, onComplete }: DodawaniePrzykladyProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${revealed}`);

  const example = EXAMPLES[index];
  const steps = buildAdditionSteps(example.a, example.b);
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
          {example.a} + {example.b}
        </h3>

        {!revealed ? (
          <Button onClick={() => setRevealed(true)}>Policz w słupku</Button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 flex justify-center overflow-x-auto">
              <ColumnGrid
                color={color}
                operator="+"
                cells={solvedCells(steps)}
                showPlaceLabels
                reserveAnnotationRow
                ariaLabel={`Dodawanie pisemne ${example.a} plus ${example.b}, wynik ${example.a + example.b}`}
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
