'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Rocket as RocketIcon } from 'lucide-react';

interface RocketSpriteProps {
  color: string;
  comboTier: number;
  outcome: 'correct' | 'wrong' | null;
}

/**
 * Smuga rakiety rośnie z każdym progiem comba (0..3+) — wizualna eskalacja
 * zamiast tekstowego licznika, żeby "seria trafień" było widać na pierwszy
 * rzut oka, nie tylko czytać w HUD-zie.
 */
export function RocketSprite({ color, comboTier, outcome }: RocketSpriteProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="relative mx-auto flex h-14 w-14 items-center justify-center"
      data-testid="rocket"
    >
      <motion.div
        aria-hidden
        className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full blur-md"
        style={{
          background: color,
          width: 10 + comboTier * 6,
          height: 24 + comboTier * 12,
          opacity: 0.22 + comboTier * 0.12,
        }}
        animate={reducedMotion ? undefined : { opacity: [0.22 + comboTier * 0.12, 0.5 + comboTier * 0.08, 0.22 + comboTier * 0.12] }}
        transition={reducedMotion ? undefined : { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        animate={
          outcome === 'correct'
            ? { scale: [1, 1.22, 1], rotate: reducedMotion ? 0 : [0, -6, 6, 0] }
            : outcome === 'wrong'
              ? { x: reducedMotion ? 0 : [0, -6, 6, -4, 4, 0], scale: [1, 0.92, 1] }
              : { scale: 1, x: 0, rotate: 0 }
        }
        transition={{ duration: 0.45 }}
        className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 bg-black/50"
        style={{ borderColor: color, boxShadow: `0 0 16px ${color}80` }}
      >
        <RocketIcon className="h-6 w-6" style={{ color }} strokeWidth={2.2} />
      </motion.div>
    </motion.div>
  );
}
