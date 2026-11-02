'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { SymbolDetail } from './guide-content';

interface SymbolMonolithProps {
  detail: SymbolDetail;
  color: string;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Jedna „płyta” z symbolem. Wysokości wszystkich siedmiu są **celowo równe** —
 * proporcja 1:1000 byłaby nieczytelna, a udawana proporcja byłaby kłamstwem
 * wizualnym. Rytm ×5/×2 niosą łuki nad płytami, nie ich rozmiar.
 *
 * Notatka i miejsce występowania są zawsze w DOM (`sr-only`, gdy płyta nie jest
 * wybrana) — panel obok jest ozdobą interakcji, a nie jedynym nośnikiem treści.
 */
export function SymbolMonolith({ detail, color, selected, onSelect }: SymbolMonolithProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      data-symbol={detail.symbol}
      className={cn(
        'relative flex cursor-pointer flex-col items-center gap-1 border px-1 py-3 transition-all sm:py-5',
        !selected && 'hover:-translate-y-1 hover:shadow-md'
      )}
      style={{
        borderColor: selected ? 'transparent' : `${color}40`,
        backgroundColor: `${color}0c`,
      }}
    >
      {selected && (
        <motion.span
          layoutId="symbol-selection"
          className="pointer-events-none absolute inset-0 border-2"
          style={{ borderColor: color }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          aria-hidden
        />
      )}

      <span className="font-mono text-2xl font-black leading-none sm:text-4xl" style={{ color }}>
        {detail.symbol}
      </span>
      <span className="font-mono text-[11px] font-bold tabular-nums text-muted-foreground sm:text-sm">
        {detail.value}
      </span>

      {!selected && (
        <span className="sr-only">
          {detail.note} Spotkasz go tam, gdzie są {detail.where}.
        </span>
      )}
    </button>
  );
}
