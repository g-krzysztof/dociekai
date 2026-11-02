'use client';

import { cn } from '@/lib/utils';
import { denominationLabel, isCoin } from '../../../lib/money';

interface MoneyTokenProps {
  /** Wartość nominału w groszach, np. 500 to 5 zł. */
  value: number;
  color: string;
  size?: 'sm' | 'md';
  /** Podane = token jest klikalnym przyciskiem (portfel); pominięte = statyczny wyświetlacz (taca). */
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Pojedyncza moneta lub banknot. Monety (≤ 5 zł) — okrągłe, jasne wypełnienie
 * koloru modułu, jak prawdziwy metal. Banknoty (10 zł+) — prostokątne, pełne
 * wypełnienie koloru modułu z białym tekstem, jak kolorowy papier. Granicę
 * moneta/banknot ustala `isCoin` z `lib/money.ts`, więc widget i lekcja nie
 * mogą się co do niej rozjechać.
 */
export function MoneyToken({ value, color, size = 'md', onClick, disabled, className }: MoneyTokenProps) {
  const coin = isCoin(value);
  const dimension =
    size === 'sm'
      ? 'h-9 min-w-9 px-1 text-[10px]'
      : 'h-14 min-w-14 px-1.5 text-xs sm:h-16 sm:min-w-16 sm:text-sm';
  const shape = coin ? 'rounded-full' : 'rounded-md';
  const label = denominationLabel(value);
  const style = coin
    ? { borderColor: color, backgroundColor: `${color}14`, color }
    : { borderColor: color, backgroundColor: color, color: '#fff' };
  const shared = cn(
    'flex shrink-0 items-center justify-center border-2 font-mono font-bold tabular-nums leading-none',
    dimension,
    shape,
    className
  );

  if (!onClick) {
    return (
      <div className={shared} style={style}>
        {label}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Dodaj ${label}`}
      className={cn(
        shared,
        'cursor-pointer transition-transform disabled:cursor-not-allowed disabled:opacity-40',
        !disabled && 'hover:-translate-y-0.5 hover:shadow-md'
      )}
      style={style}
    >
      {label}
    </button>
  );
}
