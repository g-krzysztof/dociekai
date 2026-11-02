'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface Example {
  id: string;
  label: string;
  steps: string;
  explain: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'podwajanie',
    label: '7 × 8',
    steps: '7 × 8 = 7 × 4 × 2 = 28 × 2 = 56',
    explain: 'Trudny fakt zamieniasz na dwa łatwiejsze: 7 × 4 znasz dobrze, a podwojenie 28 to tylko dodanie go do siebie.',
  },
  {
    id: 'mnozenie-przez-9',
    label: '9 × 6',
    steps: '9 × 6 = 10 × 6 − 6 = 60 − 6 = 54',
    explain: 'Mnożenie przez 9 zawsze łatwiej policzyć jako „przez 10 i odejmij jeden raz tę liczbę”.',
  },
  {
    id: 'dzielenie-przez-mnozenie',
    label: '72 : 8',
    steps: '72 : 8 = ? → 8 × 9 = 72 → więc 72 : 8 = 9',
    explain: 'Dzielenie to pytanie o brakujący czynnik — myślisz o tabliczce mnożenia „od tyłu”, dokładnie jak w trójkącie faktów.',
  },
];

interface MultiplicationExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: trzy sprytne sposoby na trudniejsze fakty z tabliczki mnożenia i dzielenia. */
export function MultiplicationExamples({ color, onComplete }: MultiplicationExamplesProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${revealed}`);

  const example = EXAMPLES[index];
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

      <h3 className="mb-4 text-center font-mono text-2xl font-black tabular-nums sm:text-3xl" style={{ color }}>
        {example.label}
      </h3>

      {revealed && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-2 text-center font-mono text-base font-bold tabular-nums sm:text-lg" style={{ color }}>
            {example.steps}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{example.explain}</p>
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
