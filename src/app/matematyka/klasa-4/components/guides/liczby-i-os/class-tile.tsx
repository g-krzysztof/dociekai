'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PlaceValueClass } from '../../../lib/place-value';

interface ClassTileProps {
  klass: PlaceValueClass;
  color: string;
  selected: boolean;
  onSelect: () => void;
  explanation: string;
}

/**
 * Jedna „paczka" cyfr klasy (miliony/tysiące/jedności) do kliknięcia — ten sam
 * wzorzec co `SymbolMonolith` w przewodniku o cyfrach rzymskich: zaznaczenie
 * przesuwa się `layoutId`-em, a wyjaśnienie jest zawsze w DOM (`sr-only`, gdy
 * płytka nie jest wybrana), więc panel obok jest ozdobą, nie jedynym nośnikiem.
 */
export function ClassTile({ klass, color, selected, onSelect, explanation }: ClassTileProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'relative flex cursor-pointer flex-col items-center gap-1 border px-4 py-3 transition-all sm:px-6 sm:py-4',
        !selected && 'hover:-translate-y-1 hover:shadow-md'
      )}
      style={{
        borderColor: selected ? 'transparent' : `${color}40`,
        backgroundColor: `${color}0c`,
      }}
    >
      {selected && (
        <motion.span
          layoutId="class-selection"
          className="pointer-events-none absolute inset-0 border-2"
          style={{ borderColor: color }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          aria-hidden
        />
      )}

      <span className="font-mono text-3xl font-black leading-none tabular-nums sm:text-4xl" style={{ color }}>
        {klass.digits}
      </span>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:text-sm">
        {klass.name}
      </span>

      {!selected && <span className="sr-only">{explanation}</span>}
    </button>
  );
}
