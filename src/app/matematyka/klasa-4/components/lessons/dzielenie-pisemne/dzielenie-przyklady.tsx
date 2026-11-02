'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { DivisionLedger } from './division-ledger';
import { buildLongDivisionSteps } from '../../../lib/long-division';

interface Example {
  id: string;
  dividend: number;
  divisor: number;
  note: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'podstawowy',
    dividend: 484,
    divisor: 4,
    note: 'Każda cyfra dzielnej jest sama większa lub równa dzielnikowi — żaden krok nie musi łączyć dwóch cyfr naraz.',
  },
  {
    id: 'zlaczenie-cyfr',
    dividend: 155,
    divisor: 5,
    note: 'Sama pierwsza cyfra (1) jest mniejsza od dzielnika (5), więc pierwszy krok łączy od razu dwie cyfry: „15”.',
  },
  {
    id: 'z-reszta',
    dividend: 947,
    divisor: 6,
    note: 'Nie w każdym kroku dzieli się do zera — ostatnia, nieskonsumowana reszta (5) to dokładnie to samo „r 5”, co znasz z dzielenia z resztą.',
  },
  {
    id: 'zero-w-ilorazie',
    dividend: 618,
    divisor: 6,
    note: 'Zniesiona cyfra 1 jest mniejsza od dzielnika 6 — w ilorazie MUSI pojawić się 0, a kolejna cyfra znosi się od razu do niego.',
  },
];

interface DzielenniePrzykladyProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: 4 w pełni rozwiązane dzielenia pisemne, od najprostszego po zero w środku ilorazu. */
export function DzielenniePrzyklady({ color, onComplete }: DzielenniePrzykladyProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${revealed}`);

  const example = EXAMPLES[index];
  const result = buildLongDivisionSteps(example.dividend, example.divisor);
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

      <div className="text-center">
        <h3 className="mb-5 font-mono text-2xl font-black tracking-wide sm:text-3xl" style={{ color }}>
          {example.dividend} : {example.divisor}
        </h3>

        {!revealed ? (
          <Button onClick={() => setRevealed(true)}>Policz pod kreską</Button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 flex justify-center overflow-x-auto">
              <DivisionLedger
                color={color}
                dividendDigits={result.dividendDigits}
                divisor={example.divisor}
                steps={result.steps}
                revealedCount={result.steps.length}
                ariaLabel={`Dzielenie pisemne ${example.dividend} przez ${example.divisor}, wynik ${result.quotient} reszta ${result.remainder}`}
              />
            </div>
            <p className="mx-auto max-w-md text-sm leading-relaxed sm:text-base">{example.note}</p>
          </motion.div>
        )}
      </div>

      {revealed && (
        <div className="mt-5 flex justify-end">
          <Button onClick={next} className="gap-1.5">
            {isLast ? 'Zakończ' : 'Następny przykład'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
