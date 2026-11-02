'use client';

import { cn } from '@/lib/utils';
import type { BadgeState } from '@/lib/streak/badges';

/**
 * Znak odznaki: ikona w ramce-wielokącie, którego liczba boków rośnie z rangą
 * (romb → pięciokąt → sześciokąt → ośmiokąt). Dzięki temu ranga jest widoczna
 * z odległości, bez czytania podpisu i bez osobnych ilustracji na każdą z 22
 * odznak — a rodzina zostaje spójna, gdy dojdą kolejne.
 *
 * Trójkąta w tej rodzinie nie ma celowo: mieści ikonę tylko w dolnej połowie,
 * a wypełniony pomarańczowym trójkąt z drobnym znakiem w środku czyta się jak
 * ostrzeżenie, nie jak nagroda.
 *
 * Zdobyta odznaka jest wypełniona i ma zewnętrzny pierścień stempla; zamknięta
 * to sama włosowa kreska. Kolor nie jest jedynym nośnikiem różnicy.
 */

/**
 * Promień okręgu opisanego dobrany tak, żeby **okrąg wpisany był stały** —
 * inaczej romb i ośmiokąt o tym samym promieniu mieszczą zupełnie różną ikonę.
 */
function circumradius(sides: number, inner: number): number {
  return inner / Math.cos(Math.PI / sides);
}

function polygon(sides: number, radius: number, center: number): string {
  return Array.from({ length: sides }, (_, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
    return `${(center + radius * Math.cos(angle)).toFixed(2)},${(center + radius * Math.sin(angle)).toFixed(2)}`;
  }).join(' ');
}

interface BadgeMarkProps {
  badge: BadgeState;
  size?: number;
  /** Zapalenie stempla — tylko w chwili zdobycia. */
  stamp?: boolean;
  className?: string;
}

export function BadgeMark({ badge, size = 56, stamp = false, className }: BadgeMarkProps) {
  const Icon = badge.icon;
  const center = 50;
  const inner = circumradius(badge.tier, 31);
  const ring = circumradius(badge.tier, 38);
  const iconSize = size * 0.42;

  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center', stamp && 'streak-stamp', className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className="absolute inset-0">
        {badge.earned && (
          <polygon
            points={polygon(badge.tier, ring, center)}
            fill="none"
            stroke="var(--streak)"
            strokeWidth={1.5}
            opacity={0.35}
          />
        )}
        <polygon
          points={polygon(badge.tier, inner, center)}
          fill={badge.earned ? 'var(--streak)' : 'none'}
          stroke={badge.earned ? 'none' : 'currentColor'}
          strokeWidth={2}
          strokeLinejoin="round"
          opacity={badge.earned ? 1 : 0.28}
        />
      </svg>
      <Icon
        width={iconSize}
        height={iconSize}
        strokeWidth={2.2}
        className={cn('relative', badge.earned ? 'text-[var(--badge-surface,var(--background))]' : 'opacity-35')}
        aria-hidden
      />
    </span>
  );
}
