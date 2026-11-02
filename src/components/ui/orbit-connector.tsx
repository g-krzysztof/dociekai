'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface OrbitConnectorProps {
  hasTop: boolean;
  hasBottom: boolean;
  color: string;
  children: ReactNode;
}

/**
 * Lewa kolumna "ścieżki misji" — segment łączący nad węzłem, sam węzeł (children),
 * segment łączący pod węzłem. Każdy wiersz rysuje tylko swój odcinek linii;
 * złożone razem tworzą ciągłą, świecącą trasę niezależnie od różnej wysokości
 * kart (flex-1 na segmentach rozciąga się do wysokości sąsiada — karty treści).
 */
export function OrbitConnector({ hasTop, hasBottom, color, children }: OrbitConnectorProps) {
  return (
    <div className="flex w-16 shrink-0 flex-col items-center sm:w-20 lg:w-28">
      <ConnectorSegment visible={hasTop} color={color} />
      {children}
      <ConnectorSegment visible={hasBottom} color={color} />
    </div>
  );
}

function ConnectorSegment({ visible, color }: { visible: boolean; color: string }) {
  const reducedMotion = useReducedMotion();

  if (!visible) return <div className="w-1 flex-1" aria-hidden />;

  return (
    <div
      className="relative w-1 flex-1 overflow-hidden rounded-full"
      aria-hidden
      style={{ background: `linear-gradient(to bottom, ${color}00, ${color}70, ${color}00)` }}
    >
      {!reducedMotion && (
        <motion.span
          className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full blur-[2px]"
          style={{ background: color, boxShadow: `0 0 10px 2px ${color}` }}
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </div>
  );
}
