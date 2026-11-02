'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FractionBarGlyph } from '../../fraction-bar-glyph';
import { toMixed, formatMixed } from '../../../lib/mixed-number';

interface WorkedExample {
  id: string;
  title: string;
  question: string;
  dividend: number;
  divisor: number;
  /** Na ile części kroimy każdy przedmiot na rysunku — bywa większe niż dzielnik. */
  cut: number;
  /** Podpis nad rzędem pokrojonych przedmiotów, np. „3 czekolady pokrojone na 4 części”. */
  sourceLabel: string;
  steps: string[];
}

const EXAMPLES: WorkedExample[] = [
  {
    id: 'mniej-niz-calosc',
    title: 'Gdy każdy dostaje mniej niż całość',
    question: 'Trzy jednakowe czekolady dzielimy sprawiedliwie między 4 osoby. Ile czekolady dostanie każda osoba?',
    dividend: 3,
    divisor: 4,
    cut: 4,
    sourceLabel: '3 czekolady, każda pokrojona na 4 części',
    steps: [
      'Kroimy każdą czekoladę na 4 równe części — tyle, ile jest osób.',
      'Każda osoba bierze po jednym kawałku z każdej czekolady, czyli 3 kawałki po jednej czwartej.',
      'To razem 3/4 czekolady. Zapisujemy krótko: 3 : 4 = 3/4 — licznik to dzielna, mianownik to dzielnik.',
    ],
  },
  {
    id: 'wiecej-niz-calosc',
    title: 'Gdy wystarcza na całości i jeszcze zostaje',
    question: 'Siedem takich samych bagietek dzielimy między 2 osoby. Ile dostanie każda?',
    dividend: 7,
    divisor: 2,
    cut: 2,
    sourceLabel: '7 bagietek, każda przekrojona na pół',
    steps: [
      'Robimy dokładnie to samo: kroimy każdą bagietkę na 2 równe części, bo osoby są dwie.',
      'Powstaje 14 połówek, a każda osoba bierze po jednej połówce z każdej bagietki — czyli 7 połówek.',
      '7 : 2 = 7/2. Ten ułamek jest niewłaściwy, więc warto go jeszcze przeczytać jako liczbę mieszaną: 3 1/2 bagietki.',
    ],
  },
];

function fullSet(count: number): Set<number> {
  return new Set(Array.from({ length: count }, (_, i) => i));
}

interface DivisionWorkedExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: jedno dzielenie kończące się ułamkiem właściwym, drugie — niewłaściwym, który czyta się jako liczba mieszana. */
export function DivisionWorkedExamples({ color, onComplete }: DivisionWorkedExamplesProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const share = toMixed(example.dividend, example.divisor);

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
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{EXAMPLES.length}
        </span>
      </div>

      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        {example.title}
      </p>
      <p className="mb-4 text-sm leading-relaxed sm:text-base">{example.question}</p>

      {!revealed ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Zap className="h-4 w-4" aria-hidden />
            Pokaż rozwiązanie
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 p-4 dark:bg-emerald-950/40 sm:p-5">
          <ol className="mb-4 space-y-3">
            {example.steps.map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
                <span className="w-5 shrink-0 font-mono text-base font-bold leading-none tabular-nums text-emerald-700 dark:text-emerald-300">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <p className="mb-1 text-xs font-semibold text-emerald-900 dark:text-emerald-100">{example.sourceLabel}</p>
          <div className="mb-3 space-y-3">
            {Array.from({ length: example.dividend }, (_, i) => (
              <FractionBarGlyph
                key={`src-${i}`}
                color="#10b981"
                mianownik={example.cut}
                filled={fullSet(example.cut)}
                ariaLabel={`Przedmiot ${i + 1} pokrojony na ${example.cut} równych części`}
              />
            ))}
          </div>

          <p className="mb-1 text-xs font-semibold text-emerald-900 dark:text-emerald-100">Porcja jednej osoby</p>
          <div className="mb-3 space-y-3">
            {Array.from({ length: example.dividend }, (_, i) => (
              <FractionBarGlyph
                key={`share-${i}`}
                color="#10b981"
                mianownik={example.cut}
                filled={fullSet(example.cut / example.divisor)}
                ariaLabel={`Z przedmiotu ${i + 1}: ${example.cut / example.divisor} z ${example.cut} części`}
              />
            ))}
          </div>

          <p className="font-mono text-base font-bold text-emerald-800 dark:text-emerald-200">
            {example.dividend} : {example.divisor} = {example.dividend}/{example.divisor}
            {share.whole > 0 ? ` = ${formatMixed(share)}` : ''}
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
