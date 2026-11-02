'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface Example {
  id: string;
  prompt: string;
  answer: string;
  explain: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'zl-na-grosze',
    prompt: '4 zł 35 gr = ? gr',
    answer: '435 gr',
    explain: '4 zł to 4 × 100 = 400 gr. Dodajesz 35 gr: 400 + 35 = 435 gr.',
  },
  {
    id: 'grosze-na-zl',
    prompt: '650 gr = ? zł ? gr',
    answer: '6 zł 50 gr',
    explain:
      '650 : 100 = 6 reszty 50 — dokładnie jak w dzieleniu z resztą: 6 to złote, 50 to grosze, które zostały.',
  },
  {
    id: 'dodawanie',
    prompt: '12 zł 80 gr + 5 zł 45 gr = ?',
    answer: '18 zł 25 gr',
    explain:
      'Dodaj grosze osobno: 80 + 45 = 125 gr, czyli 1 zł 25 gr. Dodaj złote osobno: 12 + 5 = 17 zł. Razem: 17 zł + 1 zł 25 gr = 18 zł 25 gr.',
  },
  {
    id: 'odejmowanie',
    prompt: '20 zł − 7 zł 60 gr = ?',
    answer: '12 zł 40 gr',
    explain:
      '20 zł to 19 zł i 100 gr. Odejmij grosze: 100 − 60 = 40 gr. Odejmij złote: 19 − 7 = 12 zł. Razem: 12 zł 40 gr.',
  },
];

interface MoneyExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: cztery zamiany i obliczenia pieniężne, z odsłanianym wynikiem i wyjaśnieniem. */
export function MoneyExamples({ color, onComplete }: MoneyExamplesProps) {
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

      <h3
        className="mb-5 text-center font-mono text-2xl font-black tracking-wide sm:text-3xl"
        style={{ color }}
      >
        {example.prompt}
      </h3>

      {revealed && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <p
            className="mb-2 text-center font-mono text-lg font-bold tracking-wide sm:text-xl"
            style={{ color }}
          >
            {example.answer}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
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
