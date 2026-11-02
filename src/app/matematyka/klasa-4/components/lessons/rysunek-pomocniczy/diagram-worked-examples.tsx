'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarModel } from '../../bar-model';
import type { BarModelSpec } from '../../../lib/word-problem-model';

interface WorkedExample {
  id: string;
  problem: string;
  spec: BarModelSpec;
  equation: string;
  answer: string;
}

const EXAMPLES: WorkedExample[] = [
  {
    id: 'piornik',
    problem: 'W piórniku jest 7 kredek i 5 długopisów. Ile przyborów jest w piórniku razem?',
    spec: { type: 'part-whole', wholeLabel: 'przyborów razem', wholeValue: null, parts: [{ label: 'kredki', value: 7 }, { label: 'długopisy', value: 5 }] },
    equation: '7 + 5',
    answer: '= 12',
  },
  {
    id: 'ciastka',
    problem: 'Piekarz upiekł 9 tac ciastek, po 6 sztuk na każdej. Ile ciastek upiekł w sumie?',
    spec: { type: 'equal-groups', groupLabel: 'taca', unitLabel: 'ciastek', groups: 9, perGroup: 6, total: null },
    equation: '9 × 6',
    answer: '= 54',
  },
];

interface DiagramWorkedExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: dwa nowe zadania, dwie różne struktury schematu — ten sam rytm „ukryte → pokaż" co `CircleFormulaShowcase`. */
export function DiagramWorkedExamples({ color, onComplete }: DiagramWorkedExamplesProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

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
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {EXAMPLES.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{EXAMPLES.length}
        </span>
      </div>

      <p className="mb-4 text-center text-sm leading-relaxed sm:text-base">{example.problem}</p>

      {!revealed ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Zap className="h-4 w-4" aria-hidden />
            Narysuj schemat
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <BarModel spec={example.spec} color={color} />
          <p className="mt-4 text-center font-mono text-lg font-bold tabular-nums" style={{ color }}>
            {example.equation} {example.answer}
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
