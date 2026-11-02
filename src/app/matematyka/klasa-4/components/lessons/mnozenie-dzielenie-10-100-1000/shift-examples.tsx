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
    id: 'razy-10',
    label: '45 × 10',
    steps: '45 × 10 = 450',
    explain: 'Każda cyfra przesuwa się o jedno miejsce w lewo, a z prawej dopisujesz jedno zero.',
  },
  {
    id: 'razy-100',
    label: '8 × 100',
    steps: '8 × 100 = 800',
    explain: 'Sto to 10 × 10 — dwa przesunięcia naraz, więc dopisujesz dwa zera.',
  },
  {
    id: 'dzielenie-100',
    label: '4500 : 100',
    steps: '4500 : 100 = 45',
    explain: 'Dzielenie robi dokładnie odwrotnie: skreślasz tyle zer z końca, przez ile zer dzielisz.',
  },
  {
    id: 'pulapka',
    label: '450 : 100',
    steps: '450 : 100 = 4,5 (nie liczba naturalna!)',
    explain:
      '450 ma na końcu tylko jedno zero, a do podzielenia przez 100 potrzeba dwóch. Ta lekcja liczy tylko takie dzielenia, które wychodzą bez reszty — 450 : 100 na to nie pozwala.',
    warning: true,
  },
];

interface ShiftExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: reguła "dopisz/skreśl zera" na czterech przypadkach, ostatni pokazuje jej granicę. */
export function ShiftExamples({ color, onComplete }: ShiftExamplesProps) {
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
