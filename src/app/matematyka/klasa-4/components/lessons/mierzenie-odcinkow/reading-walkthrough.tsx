'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RulerVisual } from './ruler-visual';
import { formatCmMm } from './ruler-geometry';

interface Example {
  id: string;
  labelA: string;
  labelB: string;
  maxMm: number;
  endMm: number;
  note: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'ef',
    labelA: 'E',
    labelB: 'F',
    maxMm: 150,
    endMm: 47,
    note: 'Zero linijki stoi dokładnie w E — dlatego odczyt przy F jest prawdziwą długością odcinka.',
  },
  {
    id: 'gh',
    labelA: 'G',
    labelB: 'H',
    maxMm: 150,
    endMm: 80,
    note: 'Gdy odczyt trafia dokładnie na kreskę centymetrową, zamiana na cm wychodzi bez reszty.',
  },
  {
    id: 'ij',
    labelA: 'I',
    labelB: 'J',
    maxMm: 150,
    endMm: 123,
    note: 'Policz w mm od zera, a potem zamień: pełne dziesiątki to centymetry, reszta zostaje w milimetrach.',
  },
];

interface ReadingWalkthroughProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: trzy gotowe odczyty z linijki wyrównanej do zera — uczą zapisu mieszanego cm+mm. */
export function ReadingWalkthrough({ color, onComplete }: ReadingWalkthroughProps) {
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
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{EXAMPLES.length}
        </span>
      </div>

      <p className="mb-4 text-center text-sm font-semibold sm:text-base">
        Ile ma odcinek {example.labelA}
        {example.labelB}?
      </p>

      <RulerVisual
        color={color}
        maxMm={example.maxMm}
        segmentStartMm={0}
        segmentEndMm={example.endMm}
        labelA={example.labelA}
        labelB={example.labelB}
        highlightZero
      />

      {!revealed ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Eye className="h-4 w-4" aria-hidden />
            Pokaż odczyt
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          <p className="font-mono text-base font-bold">
            {example.labelA}
            {example.labelB} = {example.endMm} mm = {formatCmMm(example.endMm)}
          </p>
          <p>{example.note}</p>
        </motion.div>
      )}

      {revealed && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>{isLast ? 'Do ćwiczeń' : 'Następny odcinek'}</Button>
        </div>
      )}
    </div>
  );
}
