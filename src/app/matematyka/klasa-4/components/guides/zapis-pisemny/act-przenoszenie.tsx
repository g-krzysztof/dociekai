'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GuideAct } from '../guide-act';
import { ColumnGrid, type ColumnCellData } from '../../column-grid';
import { buildAdditionSteps, type AdditionColumnStep, type ColumnPlace } from '../../../lib/column-algorithm';
import { ADDITION_EXAMPLE } from './guide-content';

const STEPS = buildAdditionSteps(ADDITION_EXAMPLE.a, ADDITION_EXAMPLE.b);
const FINAL_SUM = ADDITION_EXAMPLE.a + ADDITION_EXAMPLE.b;

/** Dopełniacz l.mn. — naturalne „kolumna dziesiątek/setek/tysięcy" (jedności się nie odmienia). */
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
    const rightNeighbor = STEPS[stepIndex - 1];
    const carryVisible = Boolean(
      rightNeighbor && stepIndex - 1 < revealedCount && rightNeighbor.outgoingCarry > 0
    );
    return {
      place: step.place,
      top: step.topDigit,
      bottom: step.bottomDigit,
      result: solved ? step.resultDigit : null,
      carry: carryVisible ? rightNeighbor.outgoingCarry : null,
      highlight: stepIndex === revealedCount,
    };
  });
}

function stepNarrative(step: AdditionColumnStep): string {
  const total = step.topDigit + step.bottomDigit + step.incomingCarry;
  const addends = [String(step.topDigit), String(step.bottomDigit)];
  if (step.incomingCarry > 0) addends.push(`${step.incomingCarry} (przeniesienie)`);
  const sumText = `${addends.join(' + ')} = ${total}`;

  if (step.outgoingCarry > 0) {
    const nextPlace = step.index + 1 < STEPS.length ? PLACE_GENITIVE[STEPS[step.index + 1].place] : null;
    return nextPlace
      ? `Kolumna ${step.place}: ${sumText}. To 10 lub więcej, więc zapisujemy tylko ${step.resultDigit}, a „1" przenosimy małą cyfrą nad kolumnę ${nextPlace}.`
      : `Kolumna ${step.place}: ${sumText}. To 10 lub więcej — powstaje nowa kolumna z przeniesioną „1".`;
  }
  return `Kolumna ${step.place}: ${sumText}. Mniej niż 10, więc po prostu zapisujemy ${step.resultDigit}.`;
}

export function ActPrzenoszenie({ color }: { color: string }) {
  return (
    <GuideAct id="przenoszenie" mode="flow">
      <PrzenoszenieBody color={color} />
    </GuideAct>
  );
}

function PrzenoszenieBody({ color }: { color: string }) {
  const [revealed, setRevealed] = useState(0);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const done = revealed >= STEPS.length;
  const currentStep = STEPS[revealed];
  const cells = buildCells(revealed);

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Przenoszenie</h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Gdy suma cyfr w kolumnie wynosi 10 lub więcej, zapisujemy tylko jej cyfrę jedności, a
        drugą dziesiątkę „przenosimy” — małą cyfrą nad sąsiednią kolumnę po lewej. Kliknij, żeby
        policzyć {ADDITION_EXAMPLE.a} + {ADDITION_EXAMPLE.b} kolumna po kolumnie.
      </p>

      <div className="mb-6 flex justify-center overflow-x-auto border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <ColumnGrid
          color={color}
          operator="+"
          cells={cells}
          showPlaceLabels
          reserveAnnotationRow
          ariaLabel={`Dodawanie pisemne ${ADDITION_EXAMPLE.a} plus ${ADDITION_EXAMPLE.b}`}
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
              {ADDITION_EXAMPLE.a} + {ADDITION_EXAMPLE.b} = {FINAL_SUM}
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
