'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PeelBoard } from './zero-peel-lab';
import { buildZeroShortcut } from '../../../lib/trailing-zeros';

const A = 40;
const B = 205;
/** Kuba wziął środkowe zero w 205 za zero KOŃCOWE — 205 kończy się na 5, więc naprawdę ma zer 0. */
const WRONG_RESULT = 10000;
const CORRECT = buildZeroShortcut(A, B);

type Side = 'a' | 'b';

interface ZeroAuditHuntProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: ten sam model „audytu cudzej pracy" co `MistakeHunt`/
 * `PrzesuniecieHunt` z poprzednich lekcji, zastosowany do błędu właściwego
 * tej lekcji — dziecko klika, KTÓRY z dwóch policzonych czynników ma błędnie
 * policzone zera końcowe (środkowe zero wzięte za końcowe), zamiast kolumny
 * czy wiersza w zapisie pisemnym.
 */
export function ZeroAuditHunt({ color, onComplete }: ZeroAuditHuntProps) {
  const [found, setFound] = useState(false);
  const [wrongPick, setWrongPick] = useState<Side | null>(null);
  const [value, setValue] = useState('');
  const [answered, setAnswered] = useState(false);

  const isCorrectTotal = Number(value.trim().replace(',', '.')) === CORRECT.result;

  const pick = (side: Side) => {
    if (found || wrongPick) return;
    if (side === 'b') {
      setFound(true);
      return;
    }
    setWrongPick(side);
    setTimeout(() => setWrongPick(null), 600);
  };

  const submitTotal = (event: FormEvent) => {
    event.preventDefault();
    if (answered || !value.trim()) return;
    setAnswered(true);
    if (Number(value.trim().replace(',', '.')) === CORRECT.result) onComplete?.();
  };

  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <Search className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Kuba liczy {A} × {B} skrótem przez zera. Twierdzi, że obciął zero z {A} i zero z {B}, policzył
          rdzeń 4 × 25 = 100, dopisał 2 zera i wyszło mu {WRONG_RESULT}. To zła odpowiedź — w jednym z
          dwóch „obciętych zer” się pomylił. Kliknij tę liczbę.
        </p>
      </div>

      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        {!found ? (
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { side: 'a' as const, label: `${A} → obcięto 1 zero` },
                { side: 'b' as const, label: `${B} → obcięto 1 zero` },
              ]
            ).map((option) => (
              <button
                key={option.side}
                type="button"
                onClick={() => pick(option.side)}
                className={cn(
                  'flex items-center justify-center gap-1.5 border-2 px-3 py-4 text-sm font-semibold transition-all',
                  wrongPick === option.side
                    ? 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                    : 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={wrongPick === option.side ? undefined : { borderColor: `${color}55`, color }}
              >
                {wrongPick === option.side && <X className="h-4 w-4 shrink-0" aria-hidden />}
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <p className="text-center text-sm leading-relaxed sm:text-base">
              <strong>Dokładnie tu!</strong> {B} kończy się na 5, nie na zero — to zero w środku
              (między 2 a 5) nie jest zerem końcowym. Naprawdę można obciąć tylko jedno zero, i to z{' '}
              {A}. Rdzeń to więc {A / 10} × {B} = {CORRECT.coreProduct}, a nie 4 × 25.
            </p>

            <div className="flex justify-center">
              <div className="w-full max-w-xs">
                <PeelBoard
                  color={color}
                  idPrefix="audit"
                  shortcut={CORRECT}
                  peeledA={Array.from({ length: CORRECT.aZeros }, (_, i) => i)}
                  peeledB={Array.from({ length: CORRECT.bZeros }, (_, i) => i)}
                  coreRevealed
                  attached
                />
              </div>
            </div>

            <form onSubmit={submitTotal} className="flex flex-wrap items-center justify-center gap-2">
              <label htmlFor="zero-audit-total" className="text-sm font-semibold">
                Poprawny wynik:
              </label>
              <Input
                id="zero-audit-total"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                disabled={answered}
                inputMode="numeric"
                autoComplete="off"
                placeholder={`${A} × ${B}`}
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
                      <X className="h-4 w-4" /> Poprawna odpowiedź: {CORRECT.result}
                    </>
                  )}
                </span>
              )}
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
