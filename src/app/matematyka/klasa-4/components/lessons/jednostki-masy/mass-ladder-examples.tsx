'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { UnitLadder } from '../jednostki-dlugosci/unit-ladder';
import { MASS_UNITS, massStepRatio, massUnitIndex } from '../../../lib/mass';

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
    id: 'kg-na-dag',
    prompt: '5 kg = ? dag',
    startCode: 'kg',
    startValue: 5,
    targetCode: 'dag',
    explain: 'Z kilogramów na dekagramy jest tylko jeden krok w dół — ale od razu ×100: 5 kg = 500 dag.',
  },
  {
    id: 'g-na-kg',
    prompt: '3000 g = ? kg',
    startCode: 'g',
    startValue: 3000,
    targetCode: 'kg',
    explain:
      'Z gramów na kilogramy to dwa kroki w górę: najpierw ÷10 do dekagramów (300 dag), potem ÷100 do kilogramów: 3000 g = 3 kg.',
  },
  {
    id: 't-na-kg',
    prompt: '2 t = ? kg',
    startCode: 't',
    startValue: 2,
    targetCode: 'kg',
    explain: 'Z ton na kilogramy to od razu ×1000 — 1 tona to tysiąc kilogramów: 2 t = 2000 kg.',
  },
  {
    id: 'dag-na-g',
    prompt: '450 dag = ? g',
    startCode: 'dag',
    startValue: 450,
    targetCode: 'g',
    explain: 'Z dekagramów na gramy to zwykłe ×10, tak jak wszędzie indziej: 450 dag = 4500 g.',
  },
];

interface MassLadderExamplesProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Przykłady: 4 zamiany rozwiązywane klikaniem po drabince jednostek masy —
 * ten sam `<UnitLadder>` co w lekcji o długości, teraz sparametryzowany
 * `MASS_UNITS`/`massStepRatio`. W przeciwieństwie do długości (jeden
 * wyjątek: m→km to ×1000) tu są dwa: dag→kg to ×100, kg→t to ×1000 — widać
 * to na własne oczy przy każdym kliknięciu strzałki.
 */
export function MassLadderExamples({ color, onComplete }: MassLadderExamplesProps) {
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
        units={MASS_UNITS}
        stepRatio={massStepRatio}
        color={color}
        startIndex={massUnitIndex(example.startCode)}
        startValue={example.startValue}
        targetIndex={massUnitIndex(example.targetCode)}
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
