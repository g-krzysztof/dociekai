'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Delete, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { formatDecimal, readDecimal, type DecimalValue } from '../../../lib/decimal';

interface Round {
  licznik: number;
  mianownik: number;
}

/** Mianownik zawsze 10/100/1000 — liczba miejsc po przecinku to liczba jego zer. */
const ROUNDS: Round[] = [
  { licznik: 3, mianownik: 10 },
  { licznik: 7, mianownik: 100 },
  { licznik: 45, mianownik: 100 },
  { licznik: 6, mianownik: 1000 },
  { licznik: 250, mianownik: 1000 },
];

const KEYPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

function placesOf(mianownik: number): number {
  return String(mianownik).length - 1;
}

/** Cyfry liczby po przecinku — licznik dopełniony zerami z przodu do liczby miejsc. */
function targetDigitsOf({ licznik, mianownik }: Round): number[] {
  const places = placesOf(mianownik);
  return String(licznik).padStart(places, '0').split('').map(Number);
}

interface FractionToDecimalBuilderProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: dziecko dostaje ułamek o mianowniku 10/100/1000 i samo buduje
 * jego zapis dziesiętny, cyfra po cyfrze — łącznie z zerami wypełniającymi
 * puste miejsca z przodu (7/100 → 0,07).
 */
export function FractionToDecimalBuilder({ color, onComplete }: FractionToDecimalBuilderProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [input, setInput] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${roundIndex}-${finished}`);

  const round = ROUNDS[roundIndex];
  const target = targetDigitsOf(round);
  const complete = input.length === target.length;
  const allCorrect = complete && input.every((digit, i) => digit === target[i]);
  const value: DecimalValue = { whole: 0, digits: input };
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const pressDigit = (digit: number) => {
    if (checked || input.length >= target.length) return;
    setInput((prev) => [...prev, digit]);
  };

  const backspace = () => {
    if (checked || input.length === 0) return;
    setInput((prev) => prev.slice(0, -1));
  };

  const check = () => setChecked(true);

  const next = () => {
    if (roundIndex + 1 < ROUNDS.length) {
      setRoundIndex((prev) => prev + 1);
      setInput([]);
      setChecked(false);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Umiesz już zapisać ułamek jako liczbę z przecinkiem!</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Mianownik mówi, ile miejsc po przecinku, a licznik — jakie w nich stoją cyfry, razem z
          zerami wypełniającymi puste miejsca z przodu.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {roundIndex + 1}/{ROUNDS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={roundIndex}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-5 text-center text-base font-bold leading-snug sm:text-lg">
            Zapisz ten ułamek jako liczbę dziesiętną:
          </p>

          <div className="mb-6 flex items-center justify-center gap-6">
            <BigFraction licznik={round.licznik} mianownik={round.mianownik} color={color} />

            <span className="text-3xl font-black text-muted-foreground" aria-hidden>
              =
            </span>

            <div className="flex items-end gap-1">
              <span className="pb-1 font-mono text-3xl font-black tabular-nums sm:text-4xl" style={{ color }}>
                0
              </span>
              <span className="pb-1 text-3xl font-black leading-none" style={{ color }} aria-hidden>
                ,
              </span>
              {target.map((_, i) => {
                const filled = i < input.length;
                const isNext = i === input.length;
                const isCorrect = checked && filled && input[i] === target[i];
                const isWrong = checked && filled && input[i] !== target[i];

                return (
                  <span
                    key={i}
                    className={cn(
                      'flex h-11 w-9 items-center justify-center border font-mono text-xl font-bold tabular-nums sm:h-12 sm:w-10 sm:text-2xl',
                      !checked && isNext && 'border-2',
                      isCorrect && 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40',
                      isWrong && 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                    )}
                    style={!checked && isNext ? { borderColor: color } : undefined}
                  >
                    {filled ? input[i] : ''}
                  </span>
                );
              })}
            </div>
          </div>

          {!checked ? (
            <div className="flex flex-col items-center gap-4">
              <div className="grid grid-cols-5 gap-2">
                {KEYPAD.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => pressDigit(Number(label))}
                    disabled={input.length >= target.length}
                    className="h-11 w-11 cursor-pointer border font-mono text-lg font-bold transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={backspace}
                  disabled={input.length === 0}
                  aria-label="Cofnij ostatnią cyfrę"
                  className="col-span-2 flex h-11 items-center justify-center gap-1.5 border text-sm font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  <Delete className="h-4 w-4" aria-hidden />
                  Cofnij
                </button>
              </div>
              {complete && <Button onClick={check}>Sprawdź</Button>}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex items-start gap-3 p-4 text-sm leading-relaxed',
                allCorrect
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                <strong>{allCorrect ? 'Dobrze! ' : 'Prawie. '}</strong>
                {allCorrect ? (
                  <>
                    Czytamy to: <strong style={{ color: textColor }}>{readDecimal(value)}</strong>.
                  </>
                ) : (
                  <>
                    Poprawny zapis to <strong>{formatDecimal({ whole: 0, digits: target })}</strong> —
                    sprawdź, czy nie zabrakło zera wypełniającego puste miejsce z przodu.
                  </>
                )}
              </p>
            </motion.div>
          )}

          {checked && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>
                {roundIndex + 1 < ROUNDS.length ? (
                  'Następny ułamek'
                ) : (
                  <>
                    <Check className="mr-1 h-4 w-4" /> Zakończ
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function BigFraction({ licznik, mianownik, color }: { licznik: number; mianownik: number; color: string }) {
  return (
    <span className="inline-flex flex-col items-center font-mono font-black leading-none" style={{ color }}>
      <span className="px-1 text-3xl sm:text-4xl">{licznik}</span>
      <span className="my-1 h-[3px] w-full bg-current" aria-hidden />
      <span className="px-1 text-3xl sm:text-4xl">{mianownik}</span>
    </span>
  );
}
