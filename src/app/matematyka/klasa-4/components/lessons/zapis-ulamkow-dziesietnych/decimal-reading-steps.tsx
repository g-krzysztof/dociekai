'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DecimalNumeral } from '../../guides/zapis-dziesietny/decimal-numeral';
import {
  DECIMAL_PLACES,
  fractionPartOf,
  readDecimal,
  spellFeminine,
  type DecimalValue,
} from '../../../lib/decimal';
import { plural, type PluralForms } from '../../../lib/plural';

const WHOLE_FORMS: PluralForms = { one: 'cała', few: 'całe', many: 'całych' };

interface Example {
  value: DecimalValue;
}

const EXAMPLES: Example[] = [
  { value: { whole: 2, digits: [5] } },
  { value: { whole: 0, digits: [6, 4] } },
  { value: { whole: 1, digits: [0, 0, 8] } },
];

/** Ta sama droga, którą liczy `readDecimal` — tylko rozbita na dwa oddzielne kawałki do odsłaniania. */
function splitReading(value: DecimalValue): { wholeText: string; fractionText: string } {
  const wholeText = `${spellFeminine(value.whole)} ${plural(value.whole, WHOLE_FORMS)}`;
  if (value.digits.length === 0) return { wholeText, fractionText: '' };

  const place = DECIMAL_PLACES[Math.min(value.digits.length, DECIMAL_PLACES.length) - 1];
  const { licznik } = fractionPartOf(value);
  const fractionText = `${spellFeminine(licznik)} ${plural(licznik, place.forms)}`;

  return { wholeText, fractionText };
}

interface DecimalReadingStepsProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: 3 liczby dziesiętne czytane krok po kroku — najpierw część całkowita, potem część po przecinku. */
export function DecimalReadingSteps({ color, onComplete }: DecimalReadingStepsProps) {
  const [index, setIndex] = useState(0);
  const [reveal, setReveal] = useState(0);

  const example = EXAMPLES[index];
  const { wholeText, fractionText } = splitReading(example.value);
  const allRevealed = reveal >= 2;
  const moduleTextColor = `color-mix(in oklch, ${color} 88%, black)`;
  const isLastExample = index === EXAMPLES.length - 1;
  const finishedAll = isLastExample && allRevealed;

  const advance = () => {
    if (!allRevealed) {
      setReveal((prev) => prev + 1);
      return;
    }
    if (index + 1 < EXAMPLES.length) {
      setIndex((prev) => prev + 1);
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
          <div className="mb-6 flex justify-center gap-2">
            <Segment active={reveal >= 1}>
              <DecimalNumeral
                value={{ whole: example.value.whole, digits: [] }}
                color={reveal >= 1 ? color : 'var(--muted-foreground)'}
                className="text-3xl sm:text-4xl"
              />
            </Segment>
            <span className="pb-1 text-3xl font-black leading-none text-muted-foreground" aria-hidden>
              ,
            </span>
            <Segment active={reveal >= 2}>
              <span
                className="font-mono text-3xl font-black tabular-nums sm:text-4xl"
                style={{ color: reveal >= 2 ? color : undefined }}
              >
                {example.value.digits.join('') || '—'}
              </span>
            </Segment>
          </div>

          <div className="min-h-[3.5rem] border-t pt-4">
            <p className="flex items-start gap-2 text-lg font-bold leading-snug sm:text-xl">
              <Volume2 className="mt-1 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
              <span>
                {reveal === 0 && <span className="text-muted-foreground">…</span>}
                {reveal >= 1 && <span style={{ color: moduleTextColor }}>{wholeText}</span>}
                {reveal >= 2 && fractionText && (
                  <span style={{ color: moduleTextColor }}> i {fractionText}</span>
                )}
              </span>
            </p>
            {allRevealed && (
              <p className="mt-2 text-sm text-muted-foreground">
                Sprawdź: <strong className="font-mono">{readDecimal(example.value)}</strong>
              </p>
            )}
          </div>

          <div className="mt-5 flex justify-end">
            <Button onClick={advance}>
              {!allRevealed
                ? 'Czytaj dalej'
                : finishedAll
                  ? 'Zakończ przykłady'
                  : 'Następny przykład'}
              {!finishedAll && <ChevronRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Segment({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn('flex min-w-[3.5rem] items-center justify-center border px-2 py-1.5', active && 'border-2')}
      style={active ? { borderColor: 'currentColor' } : { borderColor: 'var(--border)' }}
    >
      {children}
    </span>
  );
}
