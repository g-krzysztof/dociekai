'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { PeelBoard } from './zero-peel-lab';
import { buildZeroShortcut } from '../../../lib/trailing-zeros';

interface Example {
  id: string;
  a: number;
  b: number;
  note: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'jeden-zera',
    a: 30,
    b: 7,
    note: 'Tylko jedno zero do obcięcia — najprostszy możliwy przypadek. Rdzeń 3 × 7 = 21, dopisujemy jedno zero.',
  },
  {
    id: 'dwa-z-jednej-strony',
    a: 600,
    b: 8,
    note: 'Oba zera siedzą w jednej liczbie. Obcinasz je razem, liczysz rdzeń 6 × 8 = 48, dopisujesz oba z powrotem.',
  },
  {
    id: 'zera-z-obu-stron',
    a: 70,
    b: 300,
    note: 'Tym razem zera są po obu stronach: jedno z 70, dwa z 300 — razem trzy. Liczy się je łącznie, niezależnie skąd pochodzą.',
  },
  {
    id: 'rdzen-tez-konczy-sie-zerem',
    a: 15,
    b: 200,
    note: 'Uważaj: obcięliśmy tylko dwa zera (oba z 200), ale w wyniku są trzy! To dlatego, że sam rdzeń 15 × 2 = 30 też kończy się zerem — dopisujemy zera do CAŁEGO iloczynu rdzeni, nie zamiast jego własnych.',
  },
];

interface ZakonczoneZeramiPrzykladyProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: 4 w pełni rozwiązane mnożenia liczb zakończonych zerami, od jednego zera po pułapkę rdzenia kończącego się zerem. */
export function ZakonczoneZeramiPrzyklady({ color, onComplete }: ZakonczoneZeramiPrzykladyProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${revealed}`);

  const example = EXAMPLES[index];
  const shortcut = buildZeroShortcut(example.a, example.b);
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

      <div className="text-center">
        <h3 className="mb-5 font-mono text-2xl font-black tracking-wide sm:text-3xl" style={{ color }}>
          {example.a} × {example.b}
        </h3>

        {!revealed ? (
          <Button onClick={() => setRevealed(true)}>Policz skrótem</Button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 flex justify-center">
              <div className="w-full max-w-xs">
                <PeelBoard
                  color={color}
                  idPrefix={`ex-${example.id}`}
                  shortcut={shortcut}
                  peeledA={Array.from({ length: shortcut.aZeros }, (_, i) => i)}
                  peeledB={Array.from({ length: shortcut.bZeros }, (_, i) => i)}
                  coreRevealed
                  attached
                />
              </div>
            </div>
            <p className="mx-auto max-w-md text-sm leading-relaxed sm:text-base">{example.note}</p>
          </motion.div>
        )}
      </div>

      {revealed && (
        <div className="mt-5 flex justify-end">
          <Button onClick={next} className="gap-1.5">
            {isLast ? 'Zakończ' : 'Następny przykład'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
