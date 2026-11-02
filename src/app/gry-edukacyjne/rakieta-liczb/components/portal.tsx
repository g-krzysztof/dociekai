'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type PortalState = 'falling' | 'neutral' | 'correct-hit' | 'correct-reveal' | 'wrong-hit';

interface PortalProps {
  value: number;
  travelDurationMs: number;
  state: PortalState;
  laneIndex: number;
}

const STATE_STYLES: Record<PortalState, string> = {
  falling: 'border-white/25 bg-white/10 text-white',
  neutral: 'border-white/10 bg-white/5 text-white/40',
  'correct-hit': 'border-emerald-300 bg-emerald-400/25 text-white shadow-[0_0_26px_rgba(52,211,153,0.6)] scale-110',
  'correct-reveal': 'border-emerald-300 bg-emerald-400/15 text-white shadow-[0_0_18px_rgba(52,211,153,0.4)]',
  'wrong-hit': 'border-red-400 bg-red-500/25 text-white shadow-[0_0_26px_rgba(248,113,113,0.55)]',
};

/**
 * Spadek portalu trwa dokładnie `travelDurationMs` — tyle samo co timeout
 * rozstrzygający rundę w orchestratorze, więc portal wizualnie "dociera"
 * do linii rozstrzygnięcia w tej samej chwili, w której runda się rozstrzyga.
 * Po starcie animacja nie jest przerywana ani restartowana przez zmianę stanu
 * (tylko kolor/glow się zmienia) — portal zatrzymuje się naturalnie na miejscu.
 */
export function Portal({ value, travelDurationMs, state, laneIndex }: PortalProps) {
  return (
    <motion.div
      initial={{ top: '-18%' }}
      animate={{ top: '72%' }}
      transition={{ duration: travelDurationMs / 1000, ease: 'linear' }}
      className={cn(
        'absolute left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-2 font-mono text-lg font-bold tabular-nums transition-[background-color,border-color,box-shadow,transform] duration-200 sm:h-16 sm:w-16 sm:text-xl',
        STATE_STYLES[state],
      )}
      data-testid={`lane-${laneIndex}-value`}
    >
      {value}
    </motion.div>
  );
}
