'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  formatCompound,
  formatDecimalWithUnit,
  getUnitPair,
  lastPlaceName,
  leadingZeroCount,
  placesFor,
  readCompound,
  type CompoundExpr,
} from '../../../lib/compound-unit';

interface Example {
  pairId: string;
  big: number;
  small: number;
}

const EXAMPLES: Example[] = [
  { pairId: 'zl-gr', big: 2, small: 50 },
  { pairId: 'm-cm', big: 3, small: 7 },
  { pairId: 'kg-g', big: 1, small: 250 },
];

function exprOf(example: Example): CompoundExpr {
  return { pair: getUnitPair(example.pairId), big: example.big, small: example.small };
}

interface CompoundConversionStepsProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Przykłady: trzy zamiany krok po kroku (jak `DecimalReadingSteps` w lekcji 1
 * modułu) — większa jednostka → część przed przecinkiem; przelicznik →
 * liczba miejsc; mniejsza jednostka → od prawej, z zerami z przodu.
 */
export function CompoundConversionSteps({ color, onComplete }: CompoundConversionStepsProps) {
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(0);

  const example = EXAMPLES[index];
  const expr = exprOf(example);
  const { pair } = expr;
  const places = placesFor(pair.per);
  const zeros = leadingZeroCount(expr);
  const moduleTextColor = `color-mix(in oklch, ${color} 88%, black)`;
  const allRevealed = reveal >= 3;
  const isLast = index === EXAMPLES.length - 1;
  const placesWord = places === 3 ? 'trzy' : 'dwa';
  const zerosWord = places === 3 ? 'trzy zera' : 'dwa zera';

  const steps = [
    <>
      Większa jednostka to <strong>{pair.big}</strong> — jej liczba, <strong>{expr.big}</strong>,
      staje przed przecinkiem.
    </>,
    <>
      1 {pair.big} = <strong>{pair.per}</strong> {pair.small}, a {pair.per} ma {zerosWord} — więc
      liczba dostaje <strong>{placesWord} miejsca po przecinku</strong>.
    </>,
    <>
      <strong>
        {example.small} {pair.small}
      </strong>{' '}
      wpisujemy od prawej, na rząd {lastPlaceName(pair.per)}
      {zeros > 0 ? (
        <>
          , a {zeros === 1 ? 'brakujące miejsce' : 'brakujące miejsca'} z przodu dopełniamy{' '}
          {zeros === 1 ? 'zerem' : 'zerami'}
        </>
      ) : null}{' '}
      → <strong style={{ color }}>{formatDecimalWithUnit(expr)}</strong>.
    </>,
  ];

  const advance = () => {
    if (!allRevealed) {
      setReveal((r) => r + 1);
      return;
    }
    if (!isLast) {
      setIndex((i) => i + 1);
      setReveal(0);
      return;
    }
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {EXAMPLES.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{EXAMPLES.length}
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
          <div className="mb-5 flex flex-wrap items-center justify-center gap-3 text-center">
            <span
              className="font-mono text-2xl font-black tabular-nums sm:text-3xl"
              style={{ color }}
            >
              {formatCompound(expr)}
            </span>
            <span className="text-2xl font-black text-muted-foreground" aria-hidden>
              =
            </span>
            <span className="font-mono text-2xl font-black tabular-nums sm:text-3xl" style={{ color }}>
              {allRevealed ? formatDecimalWithUnit(expr) : '?'}
            </span>
          </div>

          <ol className="space-y-2">
            {steps.map((content, i) => {
              const shown = reveal > i;
              return (
                <li
                  key={i}
                  className={cn(
                    'flex items-start gap-3 border-l-2 py-2 pl-3 text-sm leading-relaxed transition-opacity sm:text-base',
                    shown ? 'opacity-100' : 'opacity-25'
                  )}
                  style={{ borderColor: shown ? color : 'var(--border)' }}
                >
                  <span
                    className="w-5 shrink-0 font-mono text-base font-bold tabular-nums"
                    style={{ color }}
                  >
                    {i + 1}
                  </span>
                  <span>{shown ? content : '…'}</span>
                </li>
              );
            })}
          </ol>

          {allRevealed && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-2 border-t pt-4 text-sm"
            >
              <Volume2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Czytamy: <strong style={{ color: moduleTextColor }}>{readCompound(expr)}</strong>.
              </span>
            </motion.p>
          )}

          <div className="mt-5 flex justify-end">
            <Button onClick={advance}>
              {!allRevealed
                ? 'Pokaż następny krok'
                : isLast
                  ? 'Zakończ przykłady'
                  : 'Następny przykład'}
              {!(allRevealed && isLast) && <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
