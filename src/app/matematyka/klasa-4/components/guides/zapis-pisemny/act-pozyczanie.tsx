'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GuideAct } from '../guide-act';
import { ColumnGrid, type ColumnCellData } from '../../column-grid';
import {
  buildSubtractionSteps,
  type SubtractionColumnStep,
  type ColumnPlace,
} from '../../../lib/column-algorithm';
import { SUBTRACTION_EXAMPLE } from './guide-content';

const STEPS = buildSubtractionSteps(SUBTRACTION_EXAMPLE.a, SUBTRACTION_EXAMPLE.b);
const FINAL_DIFFERENCE = SUBTRACTION_EXAMPLE.a - SUBTRACTION_EXAMPLE.b;

const PLACE_GENITIVE: Record<ColumnPlace, string> = {
  jedności: 'jedności',
  dziesiątki: 'dziesiątek',
  setki: 'setek',
  tysiące: 'tysięcy',
};

function buildCells(revealedCount: number): ColumnCellData[] {
  const places = STEPS.length;
  return Array.from({ length: places }, (_, pos) => {
    const stepIndex = places - 1 - pos;
    const step = STEPS[stepIndex];
    const solved = stepIndex < revealedCount;
    const crossingVisible = step.reducedByBorrow && stepIndex <= revealedCount;
    return {
      place: step.place,
      top: crossingVisible ? step.digitAfterReduction : step.originalTopDigit,
      bottom: step.bottomDigit,
      result: solved ? step.resultDigit : null,
      crossedOut: crossingVisible ? { from: step.originalTopDigit, to: step.digitAfterReduction } : null,
      borrowedTen: step.borrowed && solved,
      highlight: stepIndex === revealedCount,
    };
  });
}

function stepNarrative(step: SubtractionColumnStep): string {
  if (!step.borrowed) {
    return `Kolumna ${step.place}: ${step.digitAfterReduction} − ${step.bottomDigit} = ${step.resultDigit}. Górna cyfra jest wystarczająco duża — nic nie trzeba pożyczać.`;
  }
  const neighbor = STEPS[step.index + 1];
  const neighborText = neighbor
    ? ` Pożyczamy ją z kolumny ${PLACE_GENITIVE[neighbor.place]} — jej cyfra ${neighbor.originalTopDigit} zmienia się na ${neighbor.originalTopDigit - 1} (przekreślona).`
    : '';
  return `Kolumna ${step.place}: ${step.digitAfterReduction} to za mało, żeby odjąć ${step.bottomDigit} — pożyczamy 10.${neighborText} ${step.effectiveTopDigit} − ${step.bottomDigit} = ${step.resultDigit}.`;
}

export function ActPozyczanie({ color }: { color: string }) {
  return (
    <GuideAct id="pozyczanie" mode="flow">
      <PozyczanieBody color={color} />
    </GuideAct>
  );
}

function PozyczanieBody({ color }: { color: string }) {
  const [revealed, setRevealed] = useState(0);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const done = revealed >= STEPS.length;
  const currentStep = STEPS[revealed];
  const cells: ColumnCellData[] = buildCells(revealed);

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Pożyczanie</h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Gdy górna cyfra jest mniejsza od dolnej, nie da się jej odjąć wprost — „pożyczamy” 10 z
        sąsiedniej kolumny po lewej: jej cyfrę przekreślamy i zapisujemy nad nią o jeden mniejszą.
        Kliknij, żeby policzyć {SUBTRACTION_EXAMPLE.a} − {SUBTRACTION_EXAMPLE.b} kolumna po
        kolumnie.
      </p>

      <div className="mb-6 flex justify-center overflow-x-auto border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <ColumnGrid
          color={color}
          operator="−"
          cells={cells}
          showPlaceLabels
          reserveAnnotationRow
          ariaLabel={`Odejmowanie pisemne ${SUBTRACTION_EXAMPLE.a} minus ${SUBTRACTION_EXAMPLE.b}`}
        />
      </div>

      <div
        className="mb-6 flex min-h-[76px] items-center border-l-4 p-4 sm:p-5"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.p
              key={revealed}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm leading-relaxed sm:text-base"
            >
              {stepNarrative(currentStep)}
            </motion.p>
          ) : (
            <motion.p
              key="done"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="font-mono text-lg font-black tabular-nums"
              style={{ color: textColor }}
            >
              {SUBTRACTION_EXAMPLE.a} − {SUBTRACTION_EXAMPLE.b} = {FINAL_DIFFERENCE}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-3">
        {!done ? (
          <Button
            type="button"
            size="lg"
            onClick={() => setRevealed((r) => Math.min(STEPS.length, r + 1))}
            style={{ backgroundColor: color }}
          >
            Policz kolumnę: {currentStep.place}
          </Button>
        ) : (
          <Button type="button" size="lg" variant="outline" onClick={() => setRevealed(0)}>
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
            Policz od nowa
          </Button>
        )}
      </div>
    </>
  );
}
