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
    id: 'mnozenie-przed',
    label: '15 − 2 × 5',
    steps: '2 × 5 = 10, więc 15 − 10 = 5',
    explain: 'Mnożenie liczysz przed odejmowaniem, mimo że w zapisie stoi na końcu.',
  },
  {
    id: 'nawias',
    label: '(9 − 4) × 3',
    steps: '9 − 4 = 5, więc 5 × 3 = 15',
    explain: 'Nawias liczysz najpierw, potem mnożysz wynik.',
  },
  {
    id: 'dwa-dzialania',
    label: '18 : 3 + 2 × 4',
    steps: '18 : 3 = 6, a 2 × 4 = 8, więc 6 + 8 = 14',
    explain: 'Dwa działania mają pierwszeństwo (dzielenie i mnożenie) — oba liczysz przed dodawaniem, kolejność między nimi nie ma tu znaczenia.',
  },
  {
    id: 'pulapka',
    label: 'Krzyś policzył 6 + 4 : 2 jako (6 + 4) : 2 = 5',
    steps: 'To błąd — poprawnie: 4 : 2 = 2, więc 6 + 2 = 8',
    explain: 'W zapisie nie ma żadnego nawiasu — Krzyś dodał go sobie w głowie. Bez nawiasu dzielenie liczysz przed dodawaniem.',
    warning: true,
  },
];

interface OrderExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: trzy poprawne zastosowania reguł i pułapka — dorysowywanie nawiasu, którego nie ma. */
export function OrderExamples({ color, onComplete }: OrderExamplesProps) {
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
