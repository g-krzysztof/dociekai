'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, Coins, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ColumnGrid, type ColumnCellData } from '../../column-grid';
import { buildSubtractionSteps, reducedTopDigit } from '../../../lib/column-algorithm';

const ITEM = { name: 'Zestaw farb i pędzelków', price: 3286 };
/** Banknot 50 zł — same zera w zapisie, więc pożyczka musi przejść przez dwie kolumny z rzędu. */
const BANKNOTE = 5000;
const CHANGE = BANKNOTE - ITEM.price;

const STEPS = buildSubtractionSteps(BANKNOTE, ITEM.price);

function solvedCells(): ColumnCellData[] {
  const places = STEPS.length;
  return Array.from({ length: places }, (_, pos) => {
    const stepIndex = places - 1 - pos;
    const step = STEPS[stepIndex];
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

function formatGrosze(value: number): string {
  const zl = Math.floor(value / 100);
  const gr = value % 100;
  return `${zl},${String(gr).padStart(2, '0')} zł`;
}

interface ResztaChallengeProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: liczenie reszty przy płaceniu gotówką — realny
 * przykład z listy przewodnika o zapisie pisemnym. Banknot 50 zł ma same
 * zera w zapisie (5000 gr), więc obliczenie reszty samo z siebie wymaga
 * pożyczania przez dwie kolumny z rzędu — dokładnie tego, co ta lekcja uczy.
 */
export function ResztaChallenge({ color, onComplete }: ResztaChallengeProps) {
  const [value, setValue] = useState('');
  const [state, setState] = useState<'idle' | 'answered'>('idle');

  const isCorrect = Number(value.trim().replace(',', '.')) === CHANGE;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (state === 'answered' || !value.trim()) return;
    setState('answered');
    if (Number(value.trim().replace(',', '.')) === CHANGE) onComplete?.();
  };

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <Coins className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Płacisz w sklepie banknotem {formatGrosze(BANKNOTE)}. Ile grosze wynosi reszta, jaką
          powinna wydać kasjerka?
        </p>
      </div>

      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <div className="mx-auto max-w-xs font-mono text-sm">
          <div className="flex justify-between border-b border-dashed py-1.5">
            <span>{ITEM.name}</span>
            <span className="tabular-nums">{formatGrosze(ITEM.price)}</span>
          </div>
          <div className="flex justify-between py-1.5 font-bold">
            <span>PŁACISZ</span>
            <span className="tabular-nums">{formatGrosze(BANKNOTE)}</span>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <label htmlFor="reszta-total" className="text-sm font-semibold">
            Reszta:
          </label>
          <Input
            id="reszta-total"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={state === 'answered'}
            inputMode="numeric"
            autoComplete="off"
            placeholder="w groszach, np. 1200"
            className={cn(
              'w-36 font-mono text-base',
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
                  <X className="h-4 w-4" /> Poprawna odpowiedź: {CHANGE} gr
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
                operator="−"
                cells={solvedCells()}
                showPlaceLabels
                reserveAnnotationRow
                ariaLabel={`Odejmowanie pisemne ${BANKNOTE} minus ${ITEM.price}, wynik ${CHANGE}`}
              />
            </div>
            <p
              className="text-center text-sm font-semibold leading-relaxed"
              style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
            >
              Kasjerka wyda {formatGrosze(CHANGE)} reszty — a policzyłeś/aś to dokładnie tak samo,
              jak każde inne odejmowanie pisemne z zerami.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
