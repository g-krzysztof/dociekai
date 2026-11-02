'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { ColumnGrid, type ColumnCellData } from '../../column-grid';
import { buildMultiplicationSteps, type MultiplicationColumnStep } from '../../../lib/column-algorithm';

interface Example {
  id: string;
  a: number;
  multiplier: number;
  note: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'bez-przeniesienia',
    a: 213,
    multiplier: 3,
    note: 'Każdy iloczyn cyfry i mnożnika jest mniejszy od 10 — żadna kolumna nie wymaga przeniesienia.',
  },
  {
    id: 'jedno-przeniesienie',
    a: 172,
    multiplier: 4,
    note: 'W kolumnie dziesiątek 7 × 4 = 28 — to już przeniesienie. Reszta liczy się już bez kolejnego przeniesienia.',
  },
  {
    id: 'przenoszenie-w-kilku-kolumnach',
    a: 458,
    multiplier: 6,
    note: 'Przeniesienie powtarza się w trzech kolumnach z rzędu — 4, potem 3, potem 2 — dokładnie tak, jak przy przenoszeniu w dodawaniu, tylko o wiele większe.',
  },
  {
    id: 'cyfra-zero',
    a: 305,
    multiplier: 7,
    note: 'Zero razy mnożnik zawsze daje zero — ale kolumna z zerem wciąż może dostać przeniesienie z sąsiedniej kolumny i pokazać inną cyfrę niż 0.',
  },
];

function solvedCells(steps: MultiplicationColumnStep[], multiplier: number): ColumnCellData[] {
  const places = steps.length;
  return Array.from({ length: places }, (_, pos) => {
    const stepIndex = places - 1 - pos;
    const step = steps[stepIndex];
    const rightNeighbor = steps[stepIndex - 1];
    return {
      place: step.place,
      top: step.topDigit,
      bottom: step.place === 'jedności' ? multiplier : null,
      result: step.resultDigit,
      carry: rightNeighbor && rightNeighbor.outgoingCarry > 0 ? rightNeighbor.outgoingCarry : null,
    };
  });
}

interface MnozeniePrzykladyProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: 4 w pełni rozwiązane mnożenia pisemne, od przypadku bez przeniesienia po łańcuch trzech przeniesień i cyfrę zero w mnożnej. */
export function MnozeniePrzyklady({ color, onComplete }: MnozeniePrzykladyProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${revealed}`);

  const example = EXAMPLES[index];
  const steps = buildMultiplicationSteps(example.a, example.multiplier);
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
              <ColumnGrid
                color={color}
                operator="×"
                cells={solvedCells(steps, example.multiplier)}
                showPlaceLabels
                reserveAnnotationRow
                ariaLabel={`Mnożenie pisemne ${example.a} razy ${example.multiplier}, wynik ${example.a * example.multiplier}`}
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
