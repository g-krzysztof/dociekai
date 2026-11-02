'use client';

import { cn } from '@/lib/utils';

interface TermSlotProps {
  value: number;
  term: string;
  color: string;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Klocek z liczbą z działania — kliknięcie odsłania jej nazwę (składnik,
 * suma, czynnik...) w miejscu placeholdera „?". Ten sam wzorzec co
 * `ClassTile`/`SymbolMonolith`: nazwa jest zawsze w DOM (`sr-only`, dopóki
 * nieodsłonięta), więc kliknięcie jest ozdobą interakcji, nie jedynym
 * nośnikiem treści.
 */
export function TermSlot({ value, term, color, selected, onSelect }: TermSlotProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex min-w-[84px] cursor-pointer flex-col items-center gap-1 border px-4 py-3 transition-all sm:px-5 sm:py-4',
        !selected && 'hover:-translate-y-0.5 hover:shadow-md'
      )}
      style={{
        borderColor: selected ? color : `${color}40`,
        backgroundColor: selected ? `${color}14` : `${color}0c`,
      }}
    >
      <span
        className="font-mono text-3xl font-black leading-none tabular-nums sm:text-4xl"
        style={{ color }}
      >
        {value}
      </span>
      <span
        className={cn('text-xs font-bold uppercase tracking-wide sm:text-sm', !selected && 'text-muted-foreground')}
        style={selected ? { color: textColor } : undefined}
      >
        {selected ? term : '?'}
      </span>
      {!selected && <span className="sr-only">{term}</span>}
    </button>
  );
}
