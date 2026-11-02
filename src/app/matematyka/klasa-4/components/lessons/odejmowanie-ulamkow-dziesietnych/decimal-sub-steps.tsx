'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildDecimalSubtraction } from '../../../lib/decimal-subtraction';
import { ColumnSubGrid } from './column-sub-grid';

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
    b: '1,15',
    question: 'Wstążka ma 2,4 m. Odcinasz z niej 1,15 m. Ile zostanie?',
    steps: [
      '2,4 zapisujemy jako 2,40 — dopiero wtedy obie liczby mają po dwa miejsca po przecinku.',
      'Setne: 0 − 5 nie wychodzi, więc pożyczamy 1 od dziesiątych. Dziesiąte maleją z 4 do 3, a setne stają się 10. 10 − 5 = 5.',
      'Dziesiąte: 3 − 1 = 2. Jedności: 2 − 1 = 1. Zostanie 1,25 m.',
    ],
  },
  {
    id: 'przez-przecinek',
    a: '1,2',
    b: '0,8',
    question: 'W butelce jest 1,2 litra soku. Wypijasz 0,8 litra. Ile zostało?',
    steps: [
      'Dziesiąte: 2 − 8 nie wychodzi. Pożyczamy 1 całą — pożyczka przeskakuje przez przecinek.',
      '1 cała to 10 dziesiątych, więc mamy 12 dziesiątych. 12 − 8 = 4.',
      'Jedności: było 1, po pożyczce 0. 0 − 0 = 0. Zostało 0,4 litra — a nie 0,4 przez pomyłkę zapisane jako 1,4.',
    ],
  },
  {
    id: 'lancuch-przez-zero',
    a: '5',
    b: '2,63',
    question: 'Masz 5 zł. Płacisz 2,63 zł. Ile reszty dostajesz?',
    steps: [
      '5 zapisujemy jako 5,00 — teraz obie liczby mają po dwa miejsca po przecinku.',
      'Setne: 0 − 3 nie wychodzi. Chcemy pożyczyć od dziesiątych, ale tam też jest 0 — więc najpierw jedności oddają 1 dziesiątym (5 → 4, dziesiąte 0 → 10), a potem dziesiąte oddają 1 setnym (10 → 9, setne 0 → 10).',
      'Setne: 10 − 3 = 7. Dziesiąte: 9 − 6 = 3. Jedności: 4 − 2 = 2. Reszta to 2,37 zł.',
    ],
  },
];

interface DecimalSubStepsProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: trzy gotowe odejmowania w słupku, rozpisane kolumna po kolumnie. */
export function DecimalSubSteps({ color, onComplete }: DecimalSubStepsProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;
  const subtraction = useMemo(
    () => buildDecimalSubtraction(example.a, example.b),
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

      <p
        className="mb-2 text-center font-mono text-2xl font-black tabular-nums sm:text-3xl"
        style={{ color }}
      >
        {subtraction.aText} − {subtraction.bText}
      </p>
      <p className="mb-4 text-sm leading-relaxed sm:text-base">{example.question}</p>

      <ColumnSubGrid
        subtraction={subtraction}
        color={color}
        revealed={revealed ? subtraction.columns.length : 0}
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
            {subtraction.aText} − {subtraction.bText} = {subtraction.differenceText}
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
