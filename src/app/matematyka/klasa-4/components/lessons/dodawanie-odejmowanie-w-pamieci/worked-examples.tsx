'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { JumpLine } from './jump-line';

interface Example {
  id: string;
  label: string;
  start: number;
  target: number;
  jumps: number[];
  explain: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'setki',
    label: '156 + 38',
    start: 156,
    target: 194,
    jumps: [30, 8],
    explain:
      '38 rozkładasz na 30 i 8. Najpierw dziesiątki: 156 + 30 = 186. Potem jedności: 186 + 8 = 194. Ta sama metoda działa też dla liczb trzycyfrowych.',
  },
  {
    id: 'przez-dziesiatke',
    label: '64 − 8',
    start: 64,
    target: 56,
    jumps: [-4, -4],
    explain:
      'Odejmowana liczba (8) jest większa niż jedności w 64 (4) — dzielisz ją na dwie części. Najpierw dojdź do pełnej dziesiątki: 64 − 4 = 60. Potem odejmij resztę: 60 − 4 = 56.',
  },
  {
    id: 'zaokraglenie',
    label: '63 − 29',
    start: 63,
    target: 34,
    jumps: [-30, 1],
    explain:
      '29 jest blisko pełnej trzydziestki. Łatwiej odjąć od razu 30: 63 − 30 = 33. To o 1 za dużo, więc dodajesz go z powrotem: 33 + 1 = 34. To sposób „zaokrąglij i skoryguj”.',
  },
];

interface WorkedExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: trzy gotowe rozwiązania na tym samym `<JumpLine>` — dodawanie przez próg
 * setki, odejmowanie przez próg dziesiątki i odejmowanie przez zaokrąglenie. */
export function WorkedExamples({ color, onComplete }: WorkedExamplesProps) {
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

      <JumpLine
        start={example.start}
        target={example.target}
        jumps={revealed ? example.jumps : []}
        color={color}
        ariaLabel={`Rozwiązanie: ${example.label}`}
        className="mb-4"
      />

      {revealed && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base"
        >
          {example.explain}
        </motion.p>
      )}

      <div className="flex justify-end">
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
