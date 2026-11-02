'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowRightLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { RomanOdometer } from '../../roman-odometer';
import { romanChunksOf } from '../../../lib/roman';

interface Example {
  id: string;
  /** `to-roman` — dana jest liczba arabska, szukamy zapisu rzymskiego. `to-decimal` — odwrotnie. */
  direction: 'to-roman' | 'to-decimal';
  value: number;
  explain: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'e-44',
    direction: 'to-roman',
    value: 44,
    explain: 'Dziesiątki: 4 to XL (50 − 10). Jedności: 4 to IV (5 − 1). Razem: XLIV.',
  },
  {
    id: 'e-1966',
    direction: 'to-decimal',
    value: 1966,
    explain:
      'M to 1000, CM to 900 (1000 − 100), LX to 60, VI to 6. Razem: 1000 + 900 + 60 + 6 = 1966.',
  },
  {
    id: 'e-149',
    direction: 'to-roman',
    value: 149,
    explain: 'Setki: 1 to C. Dziesiątki: 4 to XL. Jedności: 9 to IX (10 − 1). Razem: CXLIX.',
  },
  {
    id: 'e-2444',
    direction: 'to-decimal',
    value: 2444,
    explain:
      'MM to 2000, CD to 400 (500 − 100), XL to 40, IV to 4. Razem: 2000 + 400 + 40 + 4 = 2444.',
  },
];

interface ConversionExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: cztery zamiany w obie strony, z licznikiem odsłaniającym wynik krok po kroku. */
export function ConversionExamples({ color, onComplete }: ConversionExamplesProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${revealed}`);

  const example = EXAMPLES[index];
  const chunks = romanChunksOf(example.value);
  const roman = chunks.map((c) => c.symbols).join('');
  const isLast = index === EXAMPLES.length - 1;

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setRevealed(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {EXAMPLES.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{EXAMPLES.length}
        </span>
      </div>

      <p
        className="mb-3 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em]"
        style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
      >
        <ArrowRightLeft className="h-3.5 w-3.5" aria-hidden />
        {example.direction === 'to-roman' ? 'Liczba → zapis rzymski' : 'Zapis rzymski → liczba'}
      </p>

      <h3
        className="mb-5 text-center font-mono text-2xl font-black tracking-wide sm:text-3xl"
        style={{ color }}
      >
        {example.direction === 'to-roman' ? example.value : roman}
      </h3>

      <div className="mb-4 flex justify-center">
        <RomanOdometer value={revealed ? example.value : 0} color={color} label="wartość" />
      </div>

      {revealed && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p
            className="mb-2 text-center font-mono text-lg font-bold tracking-wide sm:text-xl"
            style={{ color }}
          >
            {example.direction === 'to-roman' ? roman : example.value}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {example.explain}
          </p>
        </motion.div>
      )}

      <div className="mt-4 flex justify-end">
        {!revealed ? (
          <Button onClick={() => setRevealed(true)} className="gap-1.5">
            <Eye className="h-4 w-4" />
            Pokaż rozwiązanie
          </Button>
        ) : (
          <Button onClick={next} className="gap-1.5">
            {isLast ? 'Zakończ' : 'Następny przykład'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
