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
  warning?: boolean;
}

const EXAMPLES: Example[] = [
  {
    id: 'przez-4',
    label: 'Czy 348 dzieli się przez 4?',
    steps: 'Ostatnie dwie cyfry: 48. 48 : 4 = 12, więc tak.',
    explain: 'Przy podzielności przez 4 liczy się tylko to, co robią ostatnie dwie cyfry, potraktowane jak osobna liczba.',
  },
  {
    id: 'przez-9',
    label: 'Czy 639 dzieli się przez 9?',
    steps: '6 + 3 + 9 = 18, a 18 : 9 = 2, więc tak.',
    explain: 'Przy podzielności przez 9 (i przez 3) liczy się suma WSZYSTKICH cyfr, nie tylko ostatnich.',
  },
  {
    id: 'przez-100',
    label: 'Czy 500 dzieli się przez 100?',
    steps: 'Ostatnie dwie cyfry to 00, więc tak.',
    explain: 'Podzielność przez 100 to najprostsza reguła — liczba musi kończyć się dwoma zerami.',
  },
  {
    id: 'pulapka',
    label: 'Kasia sprawdzała 123 : 3, sumując tylko dwie ostatnie cyfry: 2 + 3 = 5',
    steps: 'To błąd — poprawnie: 1 + 2 + 3 = 6, a 6 dzieli się przez 3, więc 123 DZIELI się przez 3',
    explain:
      'Przy podzielności przez 3 (tak samo jak przez 9) trzeba zsumować KAŻDĄ cyfrę liczby, nie tylko ostatnie dwie — to reguła dla podzielności przez 4 czy 100, nie przez 3.',
    warning: true,
  },
];

interface DivisibilityExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: trzy poprawne sprawdzenia różnych reguł i pułapka — mylenie reguły sumy cyfr z regułą ostatnich cyfr. */
export function DivisibilityExamples({ color, onComplete }: DivisibilityExamplesProps) {
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

      <h3 className="mb-4 text-center text-lg font-bold leading-snug sm:text-xl" style={{ color }}>
        {example.label}
      </h3>

      {revealed && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-2 text-center font-mono text-base font-bold tabular-nums sm:text-lg" style={{ color }}>
            {example.steps}
          </p>
          <p
            className={
              example.warning
                ? 'bg-amber-50 p-3 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
                : 'text-sm leading-relaxed text-muted-foreground sm:text-base'
            }
          >
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
