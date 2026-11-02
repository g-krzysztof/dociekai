'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FractionBarGlyph } from '../../fraction-bar-glyph';

interface WorkedExample {
  id: string;
  title: string;
  question: string;
  from: { licznik: number; mianownik: number };
  to: { licznik: number; mianownik: number };
  steps: string[];
  answer: string;
}

const EXAMPLES: WorkedExample[] = [
  {
    id: 'rozszerzanie',
    title: 'Rozszerzanie',
    question: 'Zapisz ułamek 2/5 tak, żeby jego mianownik wynosił 15.',
    from: { licznik: 2, mianownik: 5 },
    to: { licznik: 6, mianownik: 15 },
    steps: [
      'Najpierw pytanie: przez ile trzeba pomnożyć 5, żeby wyszło 15? Przez 3 — bo 5 · 3 = 15.',
      'Tą samą liczbą mnożymy licznik: 2 · 3 = 6. Każdy z dwóch zamalowanych kawałków rozpadł się na trzy mniejsze.',
      'Mnożenie tylko mianownika zmieniłoby wartość ułamka — dlatego obie liczby zawsze idą w parze.',
    ],
    answer: '2/5 = 6/15',
  },
  {
    id: 'skracanie',
    title: 'Skracanie do postaci nieskracalnej',
    question: 'Skróć ułamek 12/18 tak daleko, jak się da.',
    from: { licznik: 12, mianownik: 18 },
    to: { licznik: 2, mianownik: 3 },
    steps: [
      'Szukamy liczby, przez którą dzielą się OBIE: 12 i 18 dzielą się przez 2, więc dzielimy — wychodzi 6/9.',
      '6 i 9 dzielą się jeszcze przez 3, więc dzielimy drugi raz — wychodzi 2/3.',
      '2 i 3 nie mają już wspólnego dzielnika większego od 1, więc to postać nieskracalna. Można było też od razu podzielić przez 6.',
    ],
    answer: '12/18 = 6/9 = 2/3',
  },
];

function fillSet(licznik: number): Set<number> {
  return new Set(Array.from({ length: licznik }, (_, i) => i));
}

interface ScaleWorkedExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: po jednym gotowym rozwiązaniu w każdą stronę — rozszerzanie do zadanego mianownika i skracanie aż do postaci nieskracalnej. */
export function ScaleWorkedExamples({ color, onComplete }: ScaleWorkedExamplesProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

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

          <div className="mb-3 grid gap-3">
            {[example.from, example.to].map((side, i) => (
              <div key={`${side.licznik}-${side.mianownik}`}>
                <p className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">
                    {i === 0 ? 'Przed' : 'Po'}
                  </span>
                  <span className="font-mono text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                    {side.licznik}/{side.mianownik}
                  </span>
                </p>
                <FractionBarGlyph
                  color="#10b981"
                  mianownik={side.mianownik}
                  filled={fillSet(side.licznik)}
                  ariaLabel={`${i === 0 ? 'Przed' : 'Po'}: ${side.licznik} z ${side.mianownik} części`}
                />
              </div>
            ))}
          </div>

          <p className="font-mono text-base font-bold text-emerald-800 dark:text-emerald-200">{example.answer}</p>
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
