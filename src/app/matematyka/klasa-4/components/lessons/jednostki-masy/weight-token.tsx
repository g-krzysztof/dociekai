'use client';

import { cn } from '@/lib/utils';

interface WeightTokenProps {
  /** Wartość odważnika w gramach — patrz `WEIGHT_TOKENS` w `lib/mass.ts`. */
  grams: number;
  label: string;
  color: string;
  size?: 'sm' | 'md';
  /** Podane = token jest klikalnym przyciskiem (zestaw odważników); pominięte = statyczny wyświetlacz (szalka). */
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Pojedynczy odważnik. Fizyczne odważniki rosną wraz z wagą — ta sama
 * intuicja odwzorowana tu rozmiarem znaczka: im więcej gramów, tym większy
 * kwadrat, niezależnie od tego, czy to statyczny cel na lewej szalce, czy
 * klikalny odważnik z zestawu po prawej (ten sam podział ról co
 * `<MoneyToken>` między portfelem a tacą).
 */
export function WeightToken({
  grams,
  label,
  color,
  size = 'md',
  onClick,
  disabled,
  className,
}: WeightTokenProps) {
  const tier = grams >= 1000 ? 3 : grams >= 100 ? 2 : grams >= 10 ? 1 : 0;
  const tierSize =
    size === 'sm'
      ? 'h-8 min-w-8 px-1 text-[10px]'
      : [
          'h-9 min-w-9 px-1 text-[10px]',
          'h-11 min-w-11 px-1 text-xs',
          'h-14 min-w-14 px-1.5 text-xs sm:h-16 sm:min-w-16 sm:text-sm',
          'h-16 min-w-16 px-1.5 text-sm sm:h-20 sm:min-w-20 sm:text-base',
        ][tier];
  const style = { borderColor: color, backgroundColor: `${color}14`, color };
  const shared = cn(
    'flex shrink-0 items-center justify-center rounded-md border-2 text-center font-mono font-bold tabular-nums leading-none',
    tierSize,
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
      aria-label={`Dodaj odważnik ${label}`}
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
