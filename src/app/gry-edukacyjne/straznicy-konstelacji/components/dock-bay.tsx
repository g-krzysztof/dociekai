'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type BayState = 'idle' | 'correct-hit' | 'correct-reveal' | 'wrong-hit';

interface DockBayProps {
  label: string;
  state: BayState;
  color: string;
  disabled?: boolean;
  onClick: () => void;
  testId: string;
}

const STATE_STYLES: Record<BayState, string> = {
  idle: 'border-white/15 bg-white/[0.03] text-white/80 hover:bg-white/[0.08]',
  'correct-hit': 'border-emerald-300 bg-emerald-400/25 text-white shadow-[0_0_22px_rgba(52,211,153,0.55)]',
  'correct-reveal': 'border-emerald-300 bg-emerald-400/15 text-white shadow-[0_0_16px_rgba(52,211,153,0.35)]',
  'wrong-hit': 'border-red-400 bg-red-500/25 text-white shadow-[0_0_22px_rgba(248,113,113,0.5)]',
};

/**
 * `ref` wystawiony na zewnątrz (przez `forwardRef`, nie tylko `motion.button`'s
 * własne przekazywanie) — Scanner mierzy nim pozycję doku, żeby wycelować
 * animację "wciągnięcia" kryształu po trafieniu.
 */
export const DockBay = forwardRef<HTMLButtonElement, DockBayProps>(function DockBay(
  { label, state, color, disabled, onClick, testId },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      aria-label={`Wyślij kryształ do doku: ${label}`}
      className={cn(
        'flex min-h-16 w-full cursor-pointer items-center justify-center rounded-lg border-2 px-2 py-3 text-center text-sm font-semibold leading-tight transition-[background-color,border-color,box-shadow] duration-200 disabled:cursor-not-allowed sm:min-h-20 sm:text-base',
        STATE_STYLES[state],
      )}
      style={state === 'idle' ? { borderColor: `${color}40` } : undefined}
      // Odbicie "złapania" — odpalone z opóźnieniem mniej więcej pokrywającym się
      // z momentem, w którym animacja lotu kryształu (CrystalShape) do niego dolatuje.
      animate={state === 'correct-hit' ? { scale: [1, 1.16, 1] } : { scale: 1 }}
      transition={state === 'correct-hit' ? { duration: 0.4, delay: 0.42, ease: 'easeOut' } : { duration: 0.2 }}
    >
      {label}
    </motion.button>
  );
});
