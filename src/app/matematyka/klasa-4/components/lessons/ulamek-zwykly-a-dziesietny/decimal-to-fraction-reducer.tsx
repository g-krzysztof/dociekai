'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { DecimalNumeral } from '../../guides/zapis-dziesietny/decimal-numeral';
import { decimalToFraction, isReduced } from '../../../lib/decimal-fraction';
import type { DecimalValue } from '../../../lib/decimal';

interface Round {
  /** Zapis dziesiętny, np. „0,75". */
  text: string;
  value: DecimalValue;
}

const ROUNDS: Round[] = [
  { text: '0,75', value: { whole: 0, digits: [7, 5] } },
  { text: '0,6', value: { whole: 0, digits: [6] } },
  { text: '0,08', value: { whole: 0, digits: [0, 8] } },
];

const DIVISORS = [2, 3, 5];

interface Step {
  num: number;
  den: number;
  /** Dzielnik, którym doszliśmy do tego wiersza (`null` dla wiersza startowego). */
  by: number | null;
}

interface DecimalToFractionReducerProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Przykłady — kierunek odwrotny: ułamek dziesiętny → zwykły. Cyfry po przecinku
 * zapisujemy nad potęgą 10, a potem skracamy, stukając wspólny dzielnik.
 * Zapis dziesiętny stoi PRZYPIĘTY u góry i nie drgnie przez całe skracanie — to
 * on jest dowodem, że wartość się nie zmienia (jak niezmiennik w `SplitFoldBoard`).
 * Dzielnik, przez który nie dzieli się któraś z liczb, daje drgnięcie i konkret,
 * nigdy blokadę.
 */
export function DecimalToFractionReducer({ color, onComplete }: DecimalToFractionReducerProps) {
  const [index, setIndex] = useState(0);
  const [steps, setSteps] = useState<Step[]>(() => {
    const { rawNum, rawDen } = decimalToFraction(ROUNDS[0].text);
    return [{ num: rawNum, den: rawDen, by: null }];
  });
  const [badDivisor, setBadDivisor] = useState<number | null>(null);
  const [shake, setShake] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];
  const current = steps[steps.length - 1];
  const reduced = isReduced(current.num, current.den);
  const isLast = index === ROUNDS.length - 1;
  const moduleTextColor = `color-mix(in oklch, ${color} 88%, black)`;

  const tapDivisor = (d: number) => {
    if (reduced) return;
    if (current.num % d === 0 && current.den % d === 0) {
      setSteps((prev) => [...prev, { num: current.num / d, den: current.den / d, by: d }]);
      setBadDivisor(null);
      return;
    }
    setBadDivisor(d);
    setShake((s) => s + 1);
  };

  const advance = () => {
    if (isLast) {
      setFinished(true);
      onComplete?.();
      return;
    }
    const nextIndex = index + 1;
    const { rawNum, rawDen } = decimalToFraction(ROUNDS[nextIndex].text);
    setIndex(nextIndex);
    setSteps([{ num: rawNum, den: rawDen, by: null }]);
    setBadDivisor(null);
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Check className="mx-auto mb-4 h-9 w-9" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Umiesz zamienić w drugą stronę!</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Cyfry po przecinku piszemy nad 10, 100 albo 1000 (tyle zer, ile miejsc), a potem skracamy —
          dzieląc licznik i mianownik przez tę samą liczbę, aż nie mają już wspólnego dzielnika.
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
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{ROUNDS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          {/* Przypięty niezmiennik: zapis dziesiętny, który nie drgnie */}
          <div
            className="mb-5 flex items-center justify-center gap-3 border-2 border-dashed p-3"
            style={{ borderColor: `${color}59` }}
          >
            <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              wartość się nie zmienia
            </span>
            <DecimalNumeral value={round.value} color={color} className="text-2xl sm:text-3xl" />
          </div>

          {/* Łańcuch skracania */}
          <div className="mb-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-4">
            {steps.map((step, i) => (
              <span key={i} className="flex items-center gap-3">
                {step.by !== null && (
                  <span className="flex flex-col items-center text-xs font-bold text-muted-foreground">
                    <span>÷ {step.by}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </span>
                )}
                <StackFraction
                  top={step.num}
                  bottom={step.den}
                  color={i === steps.length - 1 && reduced ? '#10b981' : color}
                />
              </span>
            ))}
          </div>

          {!reduced ? (
            <>
              <p className="mb-3 text-center text-sm leading-relaxed">
                Podziel <strong>licznik i mianownik</strong> przez tę samą liczbę. Skracaj, aż się nie
                da.
              </p>
              <motion.div
                key={`chips-${index}-${shake}`}
                initial={badDivisor !== null ? { x: -6 } : false}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 900, damping: 12 }}
                className="flex flex-wrap justify-center gap-2"
              >
                {DIVISORS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => tapDivisor(d)}
                    className="inline-flex h-11 min-w-[3.75rem] items-center justify-center border px-3 font-mono text-base font-bold tabular-nums transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
                  >
                    ÷ {d}
                  </button>
                ))}
              </motion.div>
              {badDivisor !== null && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-center text-sm text-amber-700 dark:text-amber-300"
                >
                  {current.num % badDivisor !== 0 ? current.num : current.den} nie dzieli się przez{' '}
                  {badDivisor} bez reszty — skracać można tylko, gdy <strong>obie</strong> liczby
                  dzielą się przez tę samą.
                </motion.p>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex flex-col gap-3 border-t pt-4 text-sm leading-relaxed sm:flex-row sm:items-center sm:justify-between'
              )}
            >
              <p>
                <strong style={{ color: moduleTextColor }}>
                  {round.text} = {current.num}/{current.den}
                </strong>{' '}
                — {current.num} i {current.den} nie mają już wspólnego dzielnika większego od 1.
              </p>
              <Button onClick={advance} className="shrink-0">
                {isLast ? (
                  <>
                    <Check className="mr-1 h-4 w-4" /> Zakończ
                  </>
                ) : (
                  'Następna liczba'
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StackFraction({ top, bottom, color }: { top: number; bottom: number; color: string }) {
  return (
    <span
      className="inline-flex flex-col items-center font-mono font-black leading-none tabular-nums"
      style={{ color }}
    >
      <span className="px-1 text-2xl sm:text-3xl">{top}</span>
      <span className="my-1 h-[3px] w-full bg-current" aria-hidden />
      <span className="px-1 text-2xl sm:text-3xl">{bottom}</span>
    </span>
  );
}
