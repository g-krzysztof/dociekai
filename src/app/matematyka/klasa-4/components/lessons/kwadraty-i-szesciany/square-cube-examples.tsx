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
    id: 'kwadrat',
    label: '6²',
    steps: '6² = 6 × 6 = 36',
    explain: 'Kwadrat liczby to ta liczba pomnożona przez samą siebie — dokładnie tyle pól zmieściłoby się w kwadratowej siatce o boku 6.',
  },
  {
    id: 'szescian',
    label: '3³',
    steps: '3³ = 3 × 3 × 3 = 27',
    explain: 'Sześcian liczby to ta liczba pomnożona przez samą siebie trzy razy — dokładnie tyle małych kostek zmieściłoby się w sześcianie o boku 3, jak w kostce Rubika.',
  },
  {
    id: 'odwrotnie',
    label: 'Czy 49 to liczba kwadratowa?',
    steps: 'Tak: 7 × 7 = 49, więc 49 to kwadrat liczby 7',
    explain: 'Czasem pytanie idzie w drugą stronę — zamiast liczyć kwadrat, szukasz liczby, której kwadratem jest podana wartość.',
  },
  {
    id: 'pulapka',
    label: 'Ola policzyła: 4² = 4 × 2 = 8',
    steps: 'To błąd — poprawnie: 4² = 4 × 4 = 16',
    explain:
      'Łatwo pomylić „do kwadratu” z „razy dwa”, bo obie nazwy kojarzą się z liczbą 2 — ale kwadrat liczby to mnożenie jej przez samą siebie, a nie przez 2. To zupełnie inne działanie.',
    warning: true,
  },
];

interface SquareCubeExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: kwadrat, sześcian, odwrotne pytanie o pierwiastek i pułapka — mylenie kwadratu z razy dwa. */
export function SquareCubeExamples({ color, onComplete }: SquareCubeExamplesProps) {
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
