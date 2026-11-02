'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Starfield } from '../../components/starfield';
import type { BayOption } from '../lib/crystal-generator';
import type { CrystalVisual } from '../lib/shapes';
import { CrystalShape, type CollectTarget } from './crystal-shape';
import { DockBay, type BayState } from './dock-bay';

interface ScannerProps {
  visual: CrystalVisual;
  bays: BayOption[];
  correctBayId: string;
  pickedBayId: string | null;
  travelDurationMs: number;
  phase: 'playing' | 'resolving';
  color: string;
  roundKey: number;
  onPick: (bayId: string) => void;
}

/**
 * Kryształ "skanuje się" pod pasek czasu na górze; dziecko klika właściwy dok
 * u dołu, zanim pasek się wyzeruje. Kliknięcie rozstrzyga rundę natychmiast
 * (jak przycisk zatwierdzenia w Kupcu Kosmicznym) — nie trzeba czekać, aż
 * kryształ "wyląduje", inaczej niż w Rakiecie Liczb.
 */
export function Scanner({
  visual,
  bays,
  correctBayId,
  pickedBayId,
  travelDurationMs,
  phase,
  color,
  roundKey,
  onPick,
}: ScannerProps) {
  const stateForBay = (bayId: string): BayState => {
    if (phase === 'playing') return 'idle';
    if (bayId === correctBayId) return bayId === pickedBayId ? 'correct-hit' : 'correct-reveal';
    if (bayId === pickedBayId) return 'wrong-hit';
    return 'idle';
  };

  const crystalWrapperRef = useRef<HTMLDivElement | null>(null);
  const bayRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [collectTo, setCollectTo] = useState<CollectTarget | null>(null);

  // Mierzy dopiero po trafieniu (nie na każdy render) — środek doku względem
  // środka kryształu, w pikselach. `useLayoutEffect` zamiast `useEffect`: liczy
  // się i commituje przed pierwszym malowaniem klatki rozstrzygnięcia, więc nowy
  // kryształ kolejnej rundy nigdy nie mignie w "wciągniętym" stanie poprzedniej.
  useLayoutEffect(() => {
    if (phase === 'resolving' && pickedBayId && pickedBayId === correctBayId) {
      const crystalEl = crystalWrapperRef.current;
      const bayEl = bayRefs.current[correctBayId];
      if (crystalEl && bayEl) {
        const crystalRect = crystalEl.getBoundingClientRect();
        const bayRect = bayEl.getBoundingClientRect();
        setCollectTo({
          dx: bayRect.left + bayRect.width / 2 - (crystalRect.left + crystalRect.width / 2),
          dy: bayRect.top + bayRect.height / 2 - (crystalRect.top + crystalRect.height / 2),
        });
        return;
      }
    }
    setCollectTo(null);
  }, [phase, pickedBayId, correctBayId, roundKey]);

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-[#0b1224] via-[#070b18] to-[#04060d] p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] sm:p-6"
      data-testid="scanner"
    >
      <Starfield count={40} className="opacity-60" />

      <div className="relative mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          key={roundKey}
          className="h-full origin-left rounded-full"
          style={{ backgroundColor: color }}
          initial={{ scaleX: 1 }}
          animate={phase === 'playing' ? { scaleX: 0 } : undefined}
          transition={{ duration: travelDurationMs / 1000, ease: 'linear' }}
        />
      </div>

      <div ref={crystalWrapperRef} className="relative flex justify-center py-3 sm:py-4">
        <CrystalShape key={roundKey} visual={visual} color={color} collectTo={collectTo} />
      </div>

      <div
        className={cn(
          'relative mt-2 grid gap-2 sm:gap-3',
          bays.length === 2 ? 'grid-cols-2' : bays.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4',
        )}
      >
        {bays.map((bay) => (
          <DockBay
            key={bay.id}
            ref={(el) => {
              bayRefs.current[bay.id] = el;
            }}
            testId={`bay-${bay.id}`}
            label={bay.label}
            state={stateForBay(bay.id)}
            color={color}
            disabled={phase !== 'playing'}
            onClick={() => onPick(bay.id)}
          />
        ))}
      </div>
    </div>
  );
}
