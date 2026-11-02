'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildDecimalAddition } from '../../../lib/decimal-addition';
import { ColumnAddGrid } from './column-add-grid';

interface WorkedExample {
  id: string;
  a: string;
  b: string;
  question: string;
  steps: string[];
}

const EXAMPLES: WorkedExample[] = [
  {
    id: 'dopisz-zero',
    a: '2,4',
    b: '3,15',
    question:
      'Jedna deska ma 2,4 m, druga 3,15 m. Zapisy mają różną długość — jak je dodać?',
    steps: [
      '2,4 dopisujemy jako 2,40 — dopiero wtedy obie liczby mają po dwa miejsca po przecinku.',
      'Setne: 0 + 5 = 5. Dziesiąte: 4 + 1 = 5. Jedności: 2 + 3 = 5.',
      'Nigdzie nie ma przeniesienia. Wynik: 5,55 m.',
    ],
  },
  {
    id: 'przez-przecinek',
    a: '0,6',
    b: '0,7',
    question: 'Kubek A to 0,6 litra, kubek B to 0,7 litra. Ile razem?',
    steps: [
      'Dziesiąte: 6 + 7 = 13 dziesiątych.',
      'Zapisujemy cyfrę 3, a 1 całą przenosimy — przez przecinek — do jedności.',
      'Jedności: 0 + 0 + 1 = 1. Wynik: 1,3 litra, a nie 0,13.',
    ],
  },
  {
    id: 'przeniesienie-w-srodku',
    a: '1,45',
    b: '2,8',
    question: 'Ścieżka ma dwa odcinki: 1,45 km i 2,8 km. Jaka jest łączna długość?',
    steps: [
      '2,8 dopisujemy jako 2,80.',
      'Setne: 5 + 0 = 5. Dziesiąte: 4 + 8 = 12 → wpisujemy 2, przenosimy 1 do jedności.',
      'Jedności: 1 + 2 + 1 = 4. Wynik: 4,25 km.',
    ],
  },
];

interface DecimalAddStepsProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: trzy gotowe dodawania w słupku, rozpisane kolumna po kolumnie. */
export function DecimalAddSteps({ color, onComplete }: DecimalAddStepsProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;
  const addition = useMemo(
    () => buildDecimalAddition(example.a, example.b),
    [example.a, example.b]
  );

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setRevealed(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
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

      <p className="mb-2 text-center font-mono text-2xl font-black tabular-nums sm:text-3xl" style={{ color }}>
        {addition.aText} + {addition.bText}
      </p>
      <p className="mb-4 text-sm leading-relaxed sm:text-base">{example.question}</p>

      <ColumnAddGrid
        addition={addition}
        color={color}
        revealed={revealed ? addition.columns.length : 0}
        showAllZeros
      />

      {!revealed ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Zap className="h-4 w-4" aria-hidden />
            Pokaż rozwiązanie
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 dark:bg-emerald-950/40 sm:p-5"
        >
          <ol className="space-y-2">
            {example.steps.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100"
              >
                <span className="mt-0.5 w-5 shrink-0 font-mono text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 border-t border-emerald-200/60 pt-3 font-mono text-base font-bold text-emerald-800 dark:border-emerald-800/60 dark:text-emerald-200">
            {addition.aText} + {addition.bText} = {addition.sumText}
          </p>
        </motion.div>
      )}

      {revealed && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
            {isLast ? 'Do ćwiczeń' : 'Kolejny przykład'}
          </Button>
        </div>
      )}
    </div>
  );
}
