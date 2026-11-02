'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface Round {
  a: number;
  b: number;
}

/** `a` i `b` mają celowo tę samą liczbę cyfr — to inny przypadek uczy lekcja 1. */
const ROUNDS: Round[] = [
  { a: 342, b: 298 },
  { a: 5124, b: 5089 },
  { a: 60234, b: 60199 },
  { a: 47300, b: 47300 },
];

interface DigitCompareProps {
  color: string;
  onComplete?: () => void;
}

/** Nowe pojęcie: dziecko porównuje cyfry dwóch liczb od lewej, aż znajdzie różnicę. */
export function DigitCompare({ color, onComplete }: DigitCompareProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${roundIndex}-${finished}`);

  const round = ROUNDS[roundIndex];
  const digitsA = String(round.a).split('').map(Number);
  const digitsB = String(round.b).split('').map(Number);
  const length = digitsA.length;

  const firstDiffIndex = digitsA.findIndex((d, i) => d !== digitsB[i]);
  const stoppedAt = firstDiffIndex === -1 ? length : firstDiffIndex + 1;
  const doneRound = revealed >= stoppedAt;
  const symbol = firstDiffIndex === -1 ? '=' : round.a > round.b ? '>' : '<';

  const advance = () => {
    if (!doneRound) {
      setRevealed((prev) => prev + 1);
      return;
    }
    if (roundIndex + 1 < ROUNDS.length) {
      setRoundIndex((prev) => prev + 1);
      setRevealed(0);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Znasz już regułę porównywania!</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Ta sama liczba cyfr? Porównuj je od lewej, aż znajdziesz pierwszą różnicę — ona
          decyduje. Wszystkie takie same? To znak &bdquo;=&rdquo;.
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
          <p className="mb-5 text-sm text-muted-foreground">
            Obie liczby mają {length} {length <= 4 ? 'cyfry' : 'cyfr'}. Porównujcie je kolumna po
            kolumnie, od lewej.
          </p>

          <div className="mb-5 flex justify-center gap-8">
            {[digitsA, digitsB].map((digits, rowIndex) => (
              <div key={rowIndex} className="flex gap-1.5">
                {digits.map((digit, i) => {
                  const shown = i < revealed;
                  const isDiffCol = i === firstDiffIndex && shown;
                  const otherDigit = rowIndex === 0 ? digitsB[i] : digitsA[i];
                  const isBigger = isDiffCol && digit > otherDigit;
                  const isSmaller = isDiffCol && digit < otherDigit;

                  return (
                    <span
                      key={i}
                      className={cn(
                        'flex h-12 w-9 items-center justify-center border font-mono text-xl font-bold tabular-nums sm:h-14 sm:w-11 sm:text-2xl',
                        isBigger && 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40',
                        isSmaller && 'border-rose-300 bg-rose-50/60 text-muted-foreground dark:bg-rose-950/30'
                      )}
                    >
                      {shown ? digit : '·'}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>

          {doneRound && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center justify-center gap-3 p-4 text-center"
              style={{ backgroundColor: `${color}0f` }}
            >
              <span className="font-mono text-lg font-bold tabular-nums">
                {round.a.toLocaleString('pl-PL')}
              </span>
              <span className="font-mono text-2xl font-black" style={{ color }}>
                {symbol}
              </span>
              <span className="font-mono text-lg font-bold tabular-nums">
                {round.b.toLocaleString('pl-PL')}
              </span>
            </motion.div>
          )}

          <div className="flex justify-end">
            <Button onClick={advance}>
              {!doneRound
                ? 'Sprawdź kolejną cyfrę'
                : roundIndex + 1 < ROUNDS.length
                  ? 'Następna para'
                  : 'Zakończ'}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
