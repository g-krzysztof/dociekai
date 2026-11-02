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
  left: { name: string; licznik: number; mianownik: number };
  right: { name: string; licznik: number; mianownik: number };
  same: string;
  rule: string;
  answer: string;
}

const EXAMPLES: WorkedExample[] = [
  {
    id: 'ten-sam-mianownik',
    title: 'Ten sam mianownik',
    question:
      'Dwie takie same tabliczki czekolady podzielono po 8 równych kostek. Ola zjadła 3 kostki, Bartek 5 kostek. Kto zjadł więcej?',
    left: { name: 'Ola', licznik: 3, mianownik: 8 },
    right: { name: 'Bartek', licznik: 5, mianownik: 8 },
    same: 'Obie tabliczki podzielono tak samo — na 8 kostek. Kostki są więc jednakowej wielkości.',
    rule: 'Przy tym samym mianowniku decyduje licznik: większy licznik to więcej takich samych kawałków, czyli większy ułamek.',
    answer: '3/8 < 5/8 — więcej zjadł Bartek.',
  },
  {
    id: 'ten-sam-licznik',
    title: 'Ten sam licznik',
    question:
      'Dwie takie same pizze pokrojono inaczej: pierwszą na 3 kawałki, drugą na 7. Kasia wzięła 2 kawałki z pierwszej pizzy, Michał 2 kawałki z drugiej. Kto zjadł więcej?',
    left: { name: 'Kasia', licznik: 2, mianownik: 3 },
    right: { name: 'Michał', licznik: 2, mianownik: 7 },
    same: 'Oboje wzięli po 2 kawałki — ten sam licznik. Ale kawałki nie są tej samej wielkości.',
    rule: 'Przy tym samym liczniku decyduje mianownik — odwrotnie, niż podpowiada intuicja: większy mianownik tnie całość na drobniejsze kawałki, więc daje mniejszy ułamek.',
    answer: '2/3 > 2/7 — więcej zjadła Kasia, choć 7 to większa liczba niż 3.',
  },
];

interface CompareWorkedExamplesProps {
  color: string;
  onComplete?: () => void;
}

function fillSet(licznik: number): Set<number> {
  return new Set(Array.from({ length: licznik }, (_, i) => i));
}

/** Przykłady: po jednym gotowym rozwiązaniu na każdą z dwóch reguł — najpierw pytanie „co tu jest takie samo?", potem paski i wniosek. */
export function CompareWorkedExamples({ color, onComplete }: CompareWorkedExamplesProps) {
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
          <p className="mb-4 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
            <strong>Krok 1.</strong> {example.same}
          </p>

          <div className="mb-4 space-y-3">
            {[example.left, example.right].map((side, i) => (
              <div key={`${side.name}-${i}`}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">{side.name}</span>
                  <span className="font-mono text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                    {side.licznik}/{side.mianownik}
                  </span>
                </div>
                <FractionBarGlyph
                  color="#10b981"
                  mianownik={side.mianownik}
                  filled={fillSet(side.licznik)}
                  ariaLabel={`${side.name}: pasek podzielony na ${side.mianownik} równych części, zamalowane ${side.licznik}`}
                />
              </div>
            ))}
          </div>

          <p className="mb-3 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
            <strong>Krok 2.</strong> {example.rule}
          </p>
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
