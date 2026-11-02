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
    id: 'podstawowy',
    label: '19 : 4',
    steps: '4 × 4 = 16, a 19 − 16 = 3, więc 19 : 4 = 4 r 3',
    explain: 'Szukasz, ile razy 4 mieści się w 19 bez przekraczania jej — 4 razy — a to, co zostaje, to reszta.',
  },
  {
    id: 'drugi',
    label: '27 : 5',
    steps: '5 × 5 = 25, a 27 − 25 = 2, więc 27 : 5 = 5 r 2',
    explain: 'Sprawdzasz najbliższą wielokrotność 5, która nie przekracza 27 — to 25, więc iloraz to 5, a reszta 2.',
  },
  {
    id: 'reszta-zero',
    label: '32 : 8',
    steps: '8 × 4 = 32, a 32 − 32 = 0, więc 32 : 8 = 4 r 0',
    explain: 'Czasem reszta wynosi 0 — wtedy liczba dzieli się bez reszty, dokładnie tak jak w poprzedniej lekcji.',
  },
  {
    id: 'pulapka',
    label: 'Ola policzyła: 29 : 6 = 3 r 11',
    steps: 'To błąd — poprawnie: 6 × 4 = 24, a 29 − 24 = 5, więc 29 : 6 = 4 r 5',
    explain:
      'Reszta 11 jest większa niż dzielnik 6 — to znak, że dzielenie nie jest skończone: z reszty 11 dałoby się jeszcze wydzielić grupę po 6. Reszta zawsze musi być mniejsza niż dzielnik.',
    warning: true,
  },
];

interface RemainderExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: trzy poprawne dzielenia z resztą i jeden błąd pokazujący, dlaczego reszta < dzielnik. */
export function RemainderExamples({ color, onComplete }: RemainderExamplesProps) {
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

      <h3 className="mb-4 text-center font-mono text-xl font-black tabular-nums sm:text-2xl" style={{ color }}>
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
