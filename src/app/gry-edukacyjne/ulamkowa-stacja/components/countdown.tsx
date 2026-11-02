'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface CountdownProps {
  color: string;
  onDone: () => void;
}

const STEPS = ['3', '2', '1', 'Start!'];
const STEP_MS = 650;

export function Countdown({ color, onDone }: CountdownProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= STEPS.length) {
      onDone();
      return;
    }
    const timeout = setTimeout(() => setIndex((i) => i + 1), STEP_MS);
    return () => clearTimeout(timeout);
  }, [index, onDone]);

  if (index >= STEPS.length) return null;

  return (
    <div className="flex h-64 items-center justify-center sm:h-80" data-testid="countdown">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.3 }}
          transition={{ duration: 0.3 }}
          className="font-mono text-7xl font-bold tabular-nums sm:text-8xl"
          style={{ color }}
        >
          {STEPS[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
