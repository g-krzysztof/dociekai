'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { ColumnGrid, type ColumnCellData } from '../../column-grid';
import {
  buildSubtractionSteps,
  reducedTopDigit,
  type SubtractionColumnStep,
} from '../../../lib/column-algorithm';

interface Example {
  id: string;
  a: number;
  b: number;
  note: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'bez-pozyczania',
    a: 768,
    b: 435,
    note: 'Każda górna cyfra jest większa od dolnej — żadna kolumna nie wymaga pożyczania.',
  },
  {
    id: 'jedno-pozyczanie',
    a: 453,
    b: 128,
    note: 'W kolumnie jedności 3 jest mniejsze od 8 — pożyczamy 10 z kolumny dziesiątek. Reszta liczy się już bez pożyczania.',
  },
  {
    id: 'podwojne-pozyczanie',
    a: 932,
    b: 457,
    note: 'Pożyczanie powtarza się w dwóch kolumnach z rzędu — każda pożycza od sąsiada po lewej, tak jak przy przenoszeniu w dodawaniu.',
  },
  {
    id: 'pozyczanie-od-zer',
    a: 7003,
    b: 2549,
    note: 'Kolumny dziesiątek i setek mają zapisane zero — same nie mają czego oddać, więc pożyczka przechodzi przez obie, aż dotrze do kolumny tysięcy, która naprawdę ma czym się podzielić.',
  },
];

function solvedCells(steps: SubtractionColumnStep[]): ColumnCellData[] {
  const places = steps.length;
  return Array.from({ length: places }, (_, pos) => {
    const stepIndex = places - 1 - pos;
    const step = steps[stepIndex];
    const displayTop = step.reducedByBorrow ? reducedTopDigit(step) : step.originalTopDigit;
    return {
      place: step.place,
      top: displayTop,
      bottom: step.bottomDigit,
      result: step.resultDigit,
      crossedOut: step.reducedByBorrow ? { from: step.originalTopDigit, to: displayTop } : null,
      borrowedTen: step.borrowed && step.digitAfterReduction >= 0,
    };
  });
}

interface OdejmowaniePrzykladyProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: 4 w pełni rozwiązane odejmowania pisemne, od przypadku bez pożyczania po pożyczanie przez dwie kolumny z zerami. */
export function OdejmowaniePrzyklady({ color, onComplete }: OdejmowaniePrzykladyProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${revealed}`);

  const example = EXAMPLES[index];
  const steps = buildSubtractionSteps(example.a, example.b);
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
          {example.a} − {example.b}
        </h3>

        {!revealed ? (
          <Button onClick={() => setRevealed(true)}>Policz w słupku</Button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 flex justify-center overflow-x-auto">
              <ColumnGrid
                color={color}
                operator="−"
                cells={solvedCells(steps)}
                showPlaceLabels
                reserveAnnotationRow
                ariaLabel={`Odejmowanie pisemne ${example.a} minus ${example.b}, wynik ${example.a - example.b}`}
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
