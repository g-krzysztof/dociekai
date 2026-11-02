'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { ArrayGrid } from './array-grid';

interface Example {
  id: string;
  label: string;
  steps: string;
  explain: string;
  grid?: { rows: number; cols: number; split: number };
}

const EXAMPLES: Example[] = [
  {
    id: 'rozdzielnosc-w-praktyce',
    label: '7 × 12 w pamięci',
    steps: '7 × 12 = 7 × 10 + 7 × 2 = 70 + 14 = 84',
    explain:
      'Rozdzielność zamienia jedno trudne mnożenie na dwa łatwe. Rozkładasz 12 na 10 i 2 — dokładnie tak, jak przy dodawaniu w pamięci.',
    grid: { rows: 7, cols: 12, split: 10 },
  },
  {
    id: 'przemiennosc-w-praktyce',
    label: '4 × 25 czy 25 × 4?',
    steps: '4 × 25 = 25 × 4 = 100',
    explain:
      'Wynik jest ten sam, ale 25 × 4 łatwiej policzyć w głowie (25 to ćwiartka setki). Przemienność pozwala wybrać wygodniejszą kolejność.',
  },
  {
    id: 'lacznosc-w-praktyce',
    label: '6 + 18 + 4 w pamięci',
    steps: '6 + 18 + 4 = 6 + 4 + 18 = 10 + 18 = 28',
    explain:
      'Przemienność i łączność razem: zamieniasz kolejność, żeby najpierw dodać dwie liczby, które dają pełną dziesiątkę (6 + 4 = 10), a dopiero potem resztę.',
  },
];

interface PropertyExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: trzy sytuacje, w których własności działań realnie ułatwiają liczenie w pamięci. */
export function PropertyExamples({ color, onComplete }: PropertyExamplesProps) {
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

      {example.grid && (
        <div className="mb-4 flex justify-center">
          <ArrayGrid
            rows={example.grid.rows}
            cols={example.grid.cols}
            color={color}
            split={revealed ? example.grid.split : 0}
            ariaLabel={`Siatka ${example.grid.rows} na ${example.grid.cols}`}
            className="h-auto w-full max-w-xs"
          />
        </div>
      )}

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
