'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DivisionLedger } from './division-ledger';
import { buildLongDivisionSteps } from '../../../lib/long-division';

const DIVIDEND = 636;
const DIVISOR = 6;
const CORRECT_RESULT = buildLongDivisionSteps(DIVIDEND, DIVISOR);
/** Kuba zgubił zero: zamiast 6 : 6 = 1, potem 0 (bo 3 < 6), potem 36 : 6 = 6 (czyli 106), po prostu zniósł 3 razem z 6, jakby to był jeden krok. */
const WRONG_RESULT = 16;

const MISTAKE_STEP_INDEX = 1;
const STEP_CARDS = [
  { label: 'Krok 1', text: 'Znosi cyfrę 6. Liczy 6 : 6.' },
  { label: 'Krok 2', text: 'Znosi cyfrę 3. Liczy 3 : 6.' },
  { label: 'Krok 3', text: 'Znosi cyfrę 6. Liczy 36 : 6.' },
];

interface ZeroDigitHuntProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: audyt cudzego (błędnego) dzielenia pisemnego — tak
 * jak `MistakeHunt`/`ZeroAuditHunt` we wcześniejszych lekcjach modułu,
 * dziecko klika konkretny krok, w którym podejrzewa błąd, zamiast liczyć
 * działanie od zera. Tu błąd to najsłynniejsza pułapka dzielenia pisemnego:
 * pominięte zero w ilorazie, gdy zniesiona cyfra jest mniejsza od dzielnika.
 */
export function ZeroDigitHunt({ color, onComplete }: ZeroDigitHuntProps) {
  const [found, setFound] = useState(false);
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const [value, setValue] = useState('');
  const [answered, setAnswered] = useState(false);

  const isCorrectTotal = Number(value.trim().replace(',', '.')) === CORRECT_RESULT.quotient;

  const pickStep = (stepIndex: number) => {
    if (found || wrongPick !== null) return;
    if (stepIndex === MISTAKE_STEP_INDEX) {
      setFound(true);
      return;
    }
    setWrongPick(stepIndex);
    setTimeout(() => setWrongPick(null), 600);
  };

  const submitTotal = (event: FormEvent) => {
    event.preventDefault();
    if (answered || !value.trim()) return;
    setAnswered(true);
    if (Number(value.trim().replace(',', '.')) === CORRECT_RESULT.quotient) onComplete?.();
  };

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <Search className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Kuba policzył pisemnie {DIVIDEND} : {DIVISOR} i wyszło mu {WRONG_RESULT}. To za mało cyfr
          — w jednym kroku zgubił się iloraz. Kliknij ten krok.
        </p>
      </div>

      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        {!found ? (
          <div className="grid gap-2 sm:grid-cols-3">
            {STEP_CARDS.map((step, i) => (
              <button
                key={step.label}
                type="button"
                onClick={() => pickStep(i)}
                className={cn(
                  'flex flex-col items-start gap-1 border-2 px-4 py-3 text-left text-sm transition-all',
                  wrongPick === i
                    ? 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                    : 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={wrongPick === i ? undefined : { borderColor: `${color}55` }}
              >
                <span className="inline-flex items-center gap-1.5 font-bold" style={wrongPick === i ? undefined : { color }}>
                  {wrongPick === i && <X className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                  {step.label}
                </span>
                <span className="text-muted-foreground">{step.text}</span>
              </button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <p className="text-center text-sm leading-relaxed sm:text-base">
              <strong>Dokładnie tu!</strong> Zniesiona cyfra 3 jest mniejsza od dzielnika 6 — Kuba
              musiał zapisać w ilorazie 0 i dopiero razem z kolejną zniesioną cyfrą (6) liczyć
              dalej: 36 : 6 = 6. Bez tego zera wynik ma za mało cyfr.
            </p>

            <form onSubmit={submitTotal} className="flex flex-wrap items-center justify-center gap-2">
              <label htmlFor="zero-digit-hunt-total" className="text-sm font-semibold">
                Poprawny wynik:
              </label>
              <Input
                id="zero-digit-hunt-total"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                disabled={answered}
                inputMode="numeric"
                autoComplete="off"
                placeholder={`${DIVIDEND} : ${DIVISOR}`}
                className={cn(
                  'w-24 font-mono text-base',
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
                      <X className="h-4 w-4" /> Poprawna odpowiedź: {CORRECT_RESULT.quotient}
                    </>
                  )}
                </span>
              )}
            </form>

            {answered && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex justify-center overflow-x-auto">
                  <DivisionLedger
                    color={color}
                    dividendDigits={CORRECT_RESULT.dividendDigits}
                    divisor={DIVISOR}
                    steps={CORRECT_RESULT.steps}
                    revealedCount={CORRECT_RESULT.steps.length}
                    ariaLabel={`Poprawny zapis: ${DIVIDEND} przez ${DIVISOR}, wynik ${CORRECT_RESULT.quotient}`}
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
