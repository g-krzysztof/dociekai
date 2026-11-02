'use client';

import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { OrbitConnector } from '@/components/ui/orbit-connector';

/** Ostatni, "widmowy" węzeł ścieżki — sygnalizuje, że dojdą kolejne gry, bez udawania że już istnieją. */
export function SoonOrbitNode({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="flex gap-4 sm:gap-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      <OrbitConnector hasTop hasBottom={false} color="#64748b">
        <div
          aria-hidden
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-white/20 sm:h-20 sm:w-20 lg:h-28 lg:w-28"
        >
          <Sparkles className="h-6 w-6 text-white/25 sm:h-7 sm:w-7" />
        </div>
      </OrbitConnector>

      <div className="flex min-w-0 flex-1 items-center">
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-6 sm:px-7">
          <h3 className="text-lg font-bold text-white/50 sm:text-xl">Kolejna misja w budowie</h3>
          <p className="mt-1 max-w-md text-sm text-white/35">
            Dorzucamy nowe gry edukacyjne do galaktyki. Wróć tu niebawem.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
