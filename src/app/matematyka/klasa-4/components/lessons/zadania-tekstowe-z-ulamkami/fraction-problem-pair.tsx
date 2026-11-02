'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ProblemUnpacker, type WordProblem } from '../../problem-unpacker';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface FractionProblemPairProps {
  color: string;
  problems: WordProblem[];
  onComplete?: () => void;
}

/**
 * Dwa zadania po kolei w jednym kroku. Przejście do drugiego idzie przez
 * osobny przycisk „Następne zadanie”, który pokazuje się dopiero po
 * `onComplete` pierwszego — nigdy prosto z `onComplete` (inaczej
 * potwierdzenie rozwiązania znika w tej samej klatce, w której się montuje;
 * por. `ProblemUnpacker`).
 */
export function FractionProblemPair({ color, problems, onComplete }: FractionProblemPairProps) {
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${solved}`);

  const problem = problems[index];
  const isLast = index === problems.length - 1;

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      setSolved(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div ref={containerRef}>
      <div className="mb-4 flex items-center gap-2">
        {problems.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{problems.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={problem.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
          <ProblemUnpacker problem={problem} color={color} mode="solve" onComplete={() => setSolved(true)} />
        </motion.div>
      </AnimatePresence>

      {solved && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
            {isLast ? 'Do przykładów' : 'Następne zadanie'}
          </Button>
        </div>
      )}
    </div>
  );
}
