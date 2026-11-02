'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Move } from 'lucide-react';
import { ArrayGrid } from './array-grid';

const ROWS = 4;
const COLS = 9;
const INITIAL_SPLIT = 5;

interface DistributivityDemoProps {
  color: string;
  onComplete?: () => void;
}

/** Rozdzielność mnożenia względem dodawania: przeciągnij podział siatki i patrz,
 * jak 4 × 9 rozpada się na dwa mniejsze, łatwiejsze mnożenia, które wciąż dają 36. */
export function DistributivityDemo({ color, onComplete }: DistributivityDemoProps) {
  const [split, setSplit] = useState(INITIAL_SPLIT);
  const [moved, setMoved] = useState(false);

  const left = split;
  const right = COLS - split;

  const handleChange = (col: number) => {
    setSplit(col);
    if (!moved) {
      setMoved(true);
      onComplete?.();
    }
  };

  return (
    <div>
      <p className="mb-1 flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground">
        <Move className="h-3.5 w-3.5" aria-hidden />
        Przeciągnij okrągły uchwyt, żeby podzielić kolumny inaczej
      </p>
      <p className="mb-4 text-center font-mono text-lg font-black tabular-nums sm:text-xl" style={{ color }}>
        {ROWS} × {COLS} = {ROWS} × {left} + {ROWS} × {right} = {ROWS * left} + {ROWS * right} ={' '}
        {ROWS * COLS}
      </p>

      <div className="flex justify-center py-2">
        <ArrayGrid
          rows={ROWS}
          cols={COLS}
          color={color}
          split={split}
          onSplitChange={handleChange}
          ariaLabel={`Siatka ${ROWS} na ${COLS}, podzielona na ${left} i ${right} kolumn`}
          className="h-auto w-full max-w-sm"
        />
      </div>

      {moved && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 bg-emerald-50 p-3 text-center text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          Gdziekolwiek podzielisz kolumny, oba mniejsze mnożenia razem zawsze dają {ROWS * COLS}.
        </motion.p>
      )}
    </div>
  );
}
