'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LongMultiplicationGrid, type LongMultiplicationRow } from './long-multiplication-grid';
import { buildLongMultiplicationLayout, digitsOf, shiftDigits } from '../../../lib/column-algorithm';

const A = 27;
const MULTIPLIER = 14;
const CORRECT_LAYOUT = buildLongMultiplicationLayout(A, MULTIPLIER);
/** Kuba zapomniał przesunąć drugi iloczyn cząstkowy (27 × 1 = 27) o kolumnę — zapisał go tak, jakby to było zwykłe 27, a nie 270. */
const WRONG_ROW_INDEX = 1;
const WRONG_ROWS: LongMultiplicationRow[] = [
  { digits: CORRECT_LAYOUT.partials[0].digits, revealed: true },
  { digits: shiftDigits(digitsOf(CORRECT_LAYOUT.partials[1].value, 4), 0), revealed: true },
];
const WRONG_SUM = digitsOf(
  CORRECT_LAYOUT.partials.reduce((sum, p) => sum + p.value, 0),
  4
);

interface PrzesuniecieHuntProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: audyt gotowego (błędnego) mnożenia — tak jak
 * poprzednia lekcja uczyła klikać konkretną KOLUMNĘ z błędem, tu trzeba
 * kliknąć konkretny WIERSZ, w którym zabrakło przesunięcia. To ten sam
 * "sprawdzanie cudzej pracy" model interakcji, zastosowany do nowego rodzaju
 * błędu, jaki wprowadza właśnie ta lekcja.
 */
export function PrzesuniecieHunt({ color, onComplete }: PrzesuniecieHuntProps) {
  const [found, setFound] = useState(false);
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const [value, setValue] = useState('');
  const [answered, setAnswered] = useState(false);

  const isCorrectTotal = Number(value.trim().replace(',', '.')) === CORRECT_LAYOUT.total;

  const pickRow = (rowIndex: number) => {
    if (found || wrongPick !== null) return;
    if (rowIndex === WRONG_ROW_INDEX) {
      setFound(true);
      return;
    }
    setWrongPick(rowIndex);
    setTimeout(() => setWrongPick(null), 600);
  };

  const submitTotal = (event: FormEvent) => {
    event.preventDefault();
    if (answered || !value.trim()) return;
    setAnswered(true);
    if (Number(value.trim().replace(',', '.')) === CORRECT_LAYOUT.total) onComplete?.();
  };

  const wrongRowsWithHighlight: LongMultiplicationRow[] = WRONG_ROWS.map((row, i) => ({
    ...row,
    highlight: found && i === WRONG_ROW_INDEX,
  }));

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <Search className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Kuba policzył w zeszycie {A} × {MULTIPLIER} i wyszło mu{' '}
          {WRONG_SUM.reduce<string>((acc, d) => (d == null ? acc : acc + d), '')}. To zła
          odpowiedź — w jednym wierszu zapomniał o czymś ważnym. Kliknij ten wiersz.
        </p>
      </div>

      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <div className="mb-4 flex justify-center overflow-x-auto">
          <LongMultiplicationGrid
            color={color}
            topDigits={CORRECT_LAYOUT.topDigits}
            multiplierDigits={CORRECT_LAYOUT.multiplierDigits}
            rows={wrongRowsWithHighlight}
            sumDigits={WRONG_SUM}
            showPlaceLabels
            ariaLabel={`Zapis Kuby: ${A} razy ${MULTIPLIER}`}
          />
        </div>

        {!found ? (
          <div className="grid grid-cols-2 gap-2">
            {[
              { index: 0, label: `Pierwszy wiersz (${A} × ${CORRECT_LAYOUT.partials[0].digit})` },
              { index: 1, label: `Drugi wiersz (${A} × ${CORRECT_LAYOUT.partials[1].digit})` },
            ].map((option) => (
              <button
                key={option.index}
                type="button"
                onClick={() => pickRow(option.index)}
                className={cn(
                  'flex items-center justify-center gap-1.5 border-2 px-3 py-3 text-sm font-semibold transition-all',
                  wrongPick === option.index
                    ? 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                    : 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={wrongPick === option.index ? undefined : { borderColor: `${color}55`, color }}
              >
                {wrongPick === option.index && <X className="h-4 w-4 shrink-0" aria-hidden />}
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <p className="text-center text-sm leading-relaxed sm:text-base">
              <strong>Dokładnie tu!</strong> {A} × {CORRECT_LAYOUT.partials[1].digit} ={' '}
              {CORRECT_LAYOUT.partials[1].value} to iloczyn przez cyfrę dziesiątek mnożnika, więc
              powinien być przesunięty o jedną kolumnę w lewo — a Kuba zapisał go tak, jakby to
              było zwykłe {CORRECT_LAYOUT.partials[1].value}, bez przesunięcia.
            </p>

            <form onSubmit={submitTotal} className="flex flex-wrap items-center justify-center gap-2">
              <label htmlFor="przesuniecie-hunt-total" className="text-sm font-semibold">
                Poprawny wynik:
              </label>
              <Input
                id="przesuniecie-hunt-total"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                disabled={answered}
                inputMode="numeric"
                autoComplete="off"
                placeholder={`${A} × ${MULTIPLIER}`}
                className={cn(
                  'w-28 font-mono text-base',
                  answered && isCorrectTotal && 'border-emerald-500',
                  answered && !isCorrectTotal && 'border-rose-400'
                )}
              />
              {!answered && (
                <Button type="submit" disabled={!value.trim()}>
                  Sprawdź
                </Button>
              )}
              {answered && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-sm font-semibold',
                    isCorrectTotal ? 'text-emerald-600' : 'text-rose-600'
                  )}
                >
                  {isCorrectTotal ? (
                    <>
                      <Check className="h-4 w-4" /> Dobrze!
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" /> Poprawna odpowiedź: {CORRECT_LAYOUT.total}
                    </>
                  )}
                </span>
              )}
            </form>

            {answered && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex justify-center overflow-x-auto">
                  <LongMultiplicationGrid
                    color={color}
                    topDigits={CORRECT_LAYOUT.topDigits}
                    multiplierDigits={CORRECT_LAYOUT.multiplierDigits}
                    rows={CORRECT_LAYOUT.partials.map((p) => ({ digits: p.digits, revealed: true }))}
                    sumDigits={CORRECT_LAYOUT.sumDigits}
                    showPlaceLabels
                    ariaLabel={`Poprawny zapis: ${A} razy ${MULTIPLIER}, wynik ${CORRECT_LAYOUT.total}`}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
