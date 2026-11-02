'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Krótki wystrzał konfetti po ukończeniu lekcji — jednorazowa animacja.
 *
 * Wspólny dla kursów matematyki i informatyki (przeniesiony z
 * `matematyka/klasa-4/components/lesson-shell.tsx`, gdy powłoka lekcji
 * informatyki stała się drugim konsumentem). Renderuje się absolutnie
 * wewnątrz kontenera z `position: relative` i nie łapie kliknięć.
 */
export function Confetti({ color }: { color: string }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        x: (i % 13) * 8 - 48,
        delay: (i % 7) * 0.06,
        color: [color, '#facc15', '#22c55e', '#ec4899', '#38bdf8'][i % 5],
        rotate: i * 37,
      })),
    [color]
  );

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden"
      aria-hidden
    >
      {pieces.map((piece) => (
        <motion.span
          key={piece.id}
          className="absolute left-1/2 top-4 block h-2.5 w-2 rounded-[2px]"
          style={{ backgroundColor: piece.color }}
          initial={{ opacity: 0, y: -10, x: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [0, 140, 260],
            x: [0, piece.x * 2, piece.x * 3.2],
            rotate: [0, piece.rotate, piece.rotate * 2],
          }}
          transition={{ duration: 2.2, delay: piece.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
