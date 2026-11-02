'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { UnitLadder } from './unit-ladder';
import { LENGTH_UNITS, lengthUnitIndex, stepRatio } from '../../../lib/length';

interface Example {
  id: string;
  prompt: string;
  startCode: string;
  startValue: number;
  targetCode: string;
  explain: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'm-na-cm',
    prompt: '3 m = ? cm',
    startCode: 'm',
    startValue: 3,
    targetCode: 'cm',
    explain: 'Z metrów na centymetry idziesz w dół drabinki dwoma krokami ×10: 3 m = 30 dm = 300 cm.',
  },
  {
    id: 'm-na-km',
    prompt: '4500 m = ? km',
    startCode: 'm',
    startValue: 4500,
    targetCode: 'km',
    explain: 'Z metrów na kilometry jest tylko jeden krok w górę — ale od razu ÷1000: 4500 m = 4,5 km.',
  },
  {
    id: 'cm-na-mm',
    prompt: '12 cm = ? mm',
    startCode: 'cm',
    startValue: 12,
    targetCode: 'mm',
    explain: 'Z centymetrów na milimetry to zawsze jeden krok ×10: 12 cm = 120 mm.',
  },
  {
    id: 'km-na-m',
    prompt: '2 km = ? m',
    startCode: 'km',
    startValue: 2,
    targetCode: 'm',
    explain: 'Z kilometrów na metry to od razu ×1000 — 1 km to tysiąc metrów: 2 km = 2000 m.',
  },
];

interface UnitLadderExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: 4 zamiany rozwiązywane klikaniem po drabince jednostek, nie samym czytaniem gotowego wyniku. */
export function UnitLadderExamples({ color, onComplete }: UnitLadderExamplesProps) {
  const [index, setIndex] = useState(0);
  const [reached, setReached] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${reached}`);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setReached(false);
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

      <UnitLadder
        key={example.id}
        units={LENGTH_UNITS}
        stepRatio={stepRatio}
        color={color}
        startIndex={lengthUnitIndex(example.startCode)}
        startValue={example.startValue}
        targetIndex={lengthUnitIndex(example.targetCode)}
        onReachTarget={() => setReached(true)}
      />

      {reached && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base"
        >
          {example.explain}
        </motion.p>
      )}

      {reached && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next} className="gap-1.5">
            {isLast ? 'Zakończ' : 'Następny przykład'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
