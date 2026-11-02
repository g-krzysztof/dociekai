'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  comparisonSign,
  formatDecimal,
  padDecimalPlaces,
  parseDecimal,
} from '../../../lib/decimal';

interface WorkedExample {
  id: string;
  a: string;
  b: string;
  question: string;
  steps: string[];
}

const EXAMPLES: WorkedExample[] = [
  {
    id: 'calosc-decyduje',
    a: '12,7',
    b: '9,86',
    question:
      'Skok Igora miał 12,7 m, skok Mai 9,86 m. „9,86” ma więcej cyfr — czy to znaczy, że skok Mai był dłuższy?',
    steps: [
      'Najpierw części całkowite: 12 i 9. 12 > 9, więc dalej nie trzeba patrzeć.',
      'Liczba cyfr po przecinku nie ma tu żadnego znaczenia — część całkowita już rozstrzygnęła.',
    ],
  },
  {
    id: 'zera-na-koncu',
    a: '4,2',
    b: '4,20',
    question: 'Butelka A to 4,2 litra, butelka B to 4,20 litra. Która mieści więcej?',
    steps: [
      'Części całkowite równe: 4 = 4.',
      'Wyrównaj liczbę miejsc po przecinku — dopisz zero: 4,2 to 4,20.',
      'Teraz oba zapisy to 4,20. Wszystkie rzędy równe, więc butelki mieszczą tyle samo: 4,2 = 4,20.',
    ],
  },
  {
    id: 'setne-decyduja',
    a: '0,405',
    b: '0,41',
    question: 'Śrubka A ma grubość 0,405 cm, śrubka B 0,41 cm. Która jest grubsza?',
    steps: [
      'Części całkowite równe: 0 = 0.',
      'Wyrównaj liczbę miejsc — dopisz zero do 0,41: wychodzi 0,410. Porównujemy 0,405 i 0,410.',
      'Rząd dziesiątych: 4 = 4. Rząd setnych: 0 < 1 — to rozstrzyga. 0,405 < 0,41, więc grubsza jest śrubka B.',
    ],
  },
];

interface CompareDecimalStepsProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: trzy gotowe porównania rozpisane krok po kroku — część całkowita, wyrównanie zer, rzędy od lewej. */
export function CompareDecimalSteps({ color, onComplete }: CompareDecimalStepsProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;

  const { a, b, places, sign } = useMemo(() => {
    const av = parseDecimal(example.a);
    const bv = parseDecimal(example.b);
    const p = Math.max(av.digits.length, bv.digits.length);
    return { a: av, b: bv, places: p, sign: comparisonSign(av, bv) };
  }, [example]);

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

      <div className="mb-3 flex items-center justify-center gap-3 font-mono text-2xl font-black tabular-nums sm:text-3xl">
        <span style={{ color }}>{example.a}</span>
        <span className="text-muted-foreground" aria-hidden>
          {revealed ? sign : '?'}
        </span>
        <span style={{ color }}>{example.b}</span>
      </div>
      <p className="mb-4 text-sm leading-relaxed sm:text-base">{example.question}</p>

      {!revealed ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Zap className="h-4 w-4" aria-hidden />
            Pokaż rozwiązanie
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 p-4 dark:bg-emerald-950/40 sm:p-5"
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
            {formatDecimal(padDecimalPlaces(a, places))} {sign} {formatDecimal(padDecimalPlaces(b, places))}
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
