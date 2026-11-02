'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrayGrid } from './array-grid';

const ROWS = 3;
const COLS = 8;

interface CommutativityDemoProps {
  color: string;
  onComplete?: () => void;
}

/** Przemienność mnożenia: ta sama siatka 24 kwadracików, obrócona o ćwierć obrotu —
 * 3 × 8 i 8 × 3 to fizycznie te same pola, tylko czytane w drugą stronę. */
export function CommutativityDemo({ color, onComplete }: CommutativityDemoProps) {
  const [rotated, setRotated] = useState(false);

  const toggle = () => {
    const next = !rotated;
    setRotated(next);
    if (next) onComplete?.();
  };

  return (
    <div>
      <p className="mb-1 text-center text-sm text-muted-foreground">
        Ta sama siatka — 3 rzędy po 8, czy 8 rzędów po 3?
      </p>
      <p className="mb-4 text-center font-mono text-2xl font-black tabular-nums sm:text-3xl" style={{ color }}>
        {rotated ? `${COLS} × ${ROWS}` : `${ROWS} × ${COLS}`} = {ROWS * COLS}
      </p>

      <div className="flex min-h-[220px] items-center justify-center py-2">
        <motion.div
          animate={{ rotate: rotated ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 14 }}
        >
          <ArrayGrid
            rows={ROWS}
            cols={COLS}
            color={color}
            ariaLabel={`Siatka ${ROWS} na ${COLS} kwadracików`}
            className="h-auto w-[260px]"
          />
        </motion.div>
      </div>

      <div className="flex justify-center">
        <Button onClick={toggle} className="gap-2">
          <RotateCw className="h-4 w-4" />
          Obróć siatkę
        </Button>
      </div>

      {rotated && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-3 text-center text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          Ani jeden kwadracik się nie zmienił — tylko kierunek liczenia. Dlatego 3 × 8 = 8 × 3.
          Dokładnie tak samo działa 3 + 8 = 8 + 3.
        </motion.p>
      )}
    </div>
  );
}
