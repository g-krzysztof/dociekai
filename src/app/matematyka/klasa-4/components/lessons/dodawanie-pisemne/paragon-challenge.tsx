'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, Receipt, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ColumnGrid, type ColumnCellData } from '../../column-grid';
import { buildAdditionSteps } from '../../../lib/column-algorithm';

const ITEM_A = { name: 'Zeszyt w kratkę', price: 428 };
const ITEM_B = { name: 'Zestaw kredek', price: 397 };
/** Paragon się pomylił o 10 gr — prawdziwa suma (`CORRECT_TOTAL`) jest inna. */
const PRINTED_TOTAL = 815;
const CORRECT_TOTAL = ITEM_A.price + ITEM_B.price;

const STEPS = buildAdditionSteps(ITEM_A.price, ITEM_B.price);

function solvedCells(): ColumnCellData[] {
  const places = STEPS.length;
  return Array.from({ length: places }, (_, pos) => {
    const stepIndex = places - 1 - pos;
    const step = STEPS[stepIndex];
    const rightNeighbor = STEPS[stepIndex - 1];
    return {
      place: step.place,
      top: step.topDigit,
      bottom: step.bottomDigit,
      result: step.resultDigit,
      carry: rightNeighbor && rightNeighbor.outgoingCarry > 0 ? rightNeighbor.outgoingCarry : null,
    };
  });
}

interface ParagonChallengeProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: sprawdzanie paragonu ze sklepu — jeden z przykładów
 * życiowych z przewodnika o zapisie pisemnym. Dziecko liczy prawdziwą sumę
 * pisemnie i porównuje ją z wydrukowaną (celowo błędną) sumą na paragonie.
 */
export function ParagonChallenge({ color, onComplete }: ParagonChallengeProps) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'answered'>('idle');

  const isCorrect = Number(value.trim().replace(',', '.')) === CORRECT_TOTAL;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (state === 'answered' || !value.trim()) return;
    setState('answered');
    if (Number(value.trim().replace(',', '.')) === CORRECT_TOTAL) onComplete?.();
  };

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <Receipt className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Kasjerka wydała paragon za dwa zakupy, ale suma na dole wygląda podejrzanie. Policz
          prawdziwą sumę pisemnie i sprawdź, czy paragon się zgadza.
        </p>
      </div>

      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <div className="mx-auto max-w-xs font-mono text-sm">
          <div className="flex justify-between border-b border-dashed py-1.5">
            <span>{ITEM_A.name}</span>
            <span className="tabular-nums">{ITEM_A.price} gr</span>
          </div>
          <div className="flex justify-between border-b border-dashed py-1.5">
            <span>{ITEM_B.name}</span>
            <span className="tabular-nums">{ITEM_B.price} gr</span>
          </div>
          <div className="flex justify-between py-1.5 font-bold">
            <span>SUMA</span>
            <span className="tabular-nums">{PRINTED_TOTAL} gr</span>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <label htmlFor="paragon-total" className="text-sm font-semibold">
            Prawdziwa suma:
          </label>
          <Input
            id="paragon-total"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={state === 'answered'}
            inputMode="numeric"
            autoComplete="off"
            placeholder="np. 800"
            className={cn(
              'w-28 font-mono text-base',
              state === 'answered' && isCorrect && 'border-emerald-500',
              state === 'answered' && !isCorrect && 'border-rose-400'
            )}
          />
          <span className="text-sm text-muted-foreground">gr</span>
          {state === 'idle' && (
            <Button type="submit" disabled={!value.trim()}>
              Sprawdź
            </Button>
          )}
          {state === 'answered' && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-sm font-semibold',
                isCorrect ? 'text-emerald-600' : 'text-rose-600'
              )}
            >
              {isCorrect ? (
                <>
                  <Check className="h-4 w-4" /> Dobrze!
                </>
              ) : (
                <>
                  <X className="h-4 w-4" /> Poprawna odpowiedź: {CORRECT_TOTAL} gr
                </>
              )}
            </span>
          )}
        </form>

        {state === 'answered' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <div className="mb-3 flex justify-center overflow-x-auto">
              <ColumnGrid
                color={color}
                operator="+"
                cells={solvedCells()}
                showPlaceLabels
                reserveAnnotationRow
                ariaLabel={`Dodawanie pisemne ${ITEM_A.price} plus ${ITEM_B.price}, wynik ${CORRECT_TOTAL}`}
              />
            </div>
            <p
              className="text-center text-sm font-semibold leading-relaxed"
              style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
            >
              Paragon pokazywał {PRINTED_TOTAL} gr, a prawdziwa suma to {CORRECT_TOTAL} gr — kasa
              pomyliła się o {CORRECT_TOTAL - PRINTED_TOTAL} gr.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
