'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Star {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
}

function makeStars(count: number, seed: number): Star[] {
  let s = seed;
  const rand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s % 10000) / 10000;
  };
  return Array.from({ length: count }, () => ({
    left: rand() * 100,
    top: rand() * 100,
    size: 1 + rand() * 1.8,
    delay: rand() * 3,
    duration: 2 + rand() * 3,
  }));
}

/** Statyczne "niebo" gwiazd w tle — pozycje losowane raz (seedowany PRNG), bez re-renderów. */
export function Starfield({ count = 70, className }: { count?: number; className?: string }) {
  const stars = useMemo(() => makeStars(count, 42), [count]);
  const reducedMotion = useReducedMotion();

  return (
    <div aria-hidden className={className ?? 'absolute inset-0 overflow-hidden'}>
      {stars.map((star, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
          }}
          animate={reducedMotion ? undefined : { opacity: [0.25, 0.9, 0.25] }}
          transition={reducedMotion ? undefined : { duration: star.duration, delay: star.delay, repeat: Infinity, ease: 'easeInOut' }}
          initial={{ opacity: 0.5 }}
        />
      ))}
    </div>
  );
}
