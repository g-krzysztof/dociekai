'use client';

import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';

/**
 * Płomień z liczbą dni — twarz serii. Dwa stany, rozpoznawalne bez koloru:
 * **zapalony** (dziś jest już lekcja) ma wypełniony płomień, **czekający**
 * ma sam kontur. Liczba stoi na cyfrach tabelarycznych, więc przeskok
 * z 9 na 10 nie przesuwa niczego obok.
 */

const SIZES = {
  sm: { icon: 16, text: 'text-sm', gap: 'gap-1' },
  md: { icon: 22, text: 'text-xl', gap: 'gap-1.5' },
  lg: { icon: 34, text: 'text-[2.5rem] leading-none', gap: 'gap-2.5' },
} as const;

export const DAY_FORMS = { one: 'dzień', few: 'dni', many: 'dni' };

interface StreakCountProps {
  days: number;
  /** Czy dziś była już lekcja — płomień pali się tylko wtedy. */
  lit: boolean;
  size?: keyof typeof SIZES;
  className?: string;
}

export function StreakCount({ days, lit, size = 'md', className }: StreakCountProps) {
  const { icon, text, gap } = SIZES[size];

  return (
    <span className={cn('inline-flex items-center tabular-nums', gap, className)}>
      <Flame
        width={icon}
        height={icon}
        strokeWidth={2}
        fill={lit ? 'var(--streak)' : 'none'}
        className={cn('shrink-0', lit ? 'text-[var(--streak)]' : 'text-[var(--streak-ink)] opacity-45')}
        aria-hidden
      />
      <span className={cn('font-extrabold tracking-tight text-[var(--streak-ink)]', text)}>
        {days}
      </span>
    </span>
  );
}

/** Zdanie o serii dla czytnika ekranu — nigdy sam płomień i liczba. */
export function streakLabel(days: number, lit: boolean): string {
  if (days === 0) return 'Serii jeszcze nie ma. Ukończ dziś lekcję, żeby ją zacząć.';
  return `Seria: ${days} ${plural(days, DAY_FORMS)} nauki. ${
    lit ? 'Dziś już zaliczone.' : 'Dziś jeszcze bez lekcji.'
  }`;
}
