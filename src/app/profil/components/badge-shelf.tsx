'use client';

import { BadgeMark } from '@/components/streak/badge-mark';
import type { BadgeState } from '@/lib/streak/badges';
import { humanDate } from '@/lib/streak/school-calendar';
import { cn } from '@/lib/utils';

/** Ile zdobytych znaków mieści się w jednym rzędzie, zanim reszta zwinie się w „+N”. */
const SHELF_MAX = 8;
const SHELF_MAX_MOBILE = 5;

/**
 * Półka odznak: zdobyte jako drobne znaki, najnowsze pierwsze, i trzy
 * najbliższe do zdobycia z progiem i paskiem. To jest ta część gabloty, która
 * motywuje — reszta rodzin leży w rozwinięciu.
 */
export function BadgeShelf({ badges, ready }: { badges: BadgeState[]; ready: boolean }) {
  const earned = ready
    ? badges
        .filter((badge) => badge.earned)
        .sort((a, b) => (b.on ?? '').localeCompare(a.on ?? ''))
    : [];
  // Stabilne sortowanie: przy równym postępie wygrywa kolejność gabloty, czyli niższy próg.
  const nearest = ready
    ? badges
        .filter((badge) => !badge.earned)
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 3)
    : [];
  const shown = earned.slice(0, SHELF_MAX);
  const rest = earned.length - shown.length;
  const restMobile = earned.length - Math.min(earned.length, SHELF_MAX_MOBILE);

  return (
    <div className="grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="min-w-0">
        <p className="profil-micro mb-3">Zdobyte</p>
        {earned.length === 0 ? (
          <p className="max-w-[44ch] text-sm leading-relaxed text-[var(--ink-soft)]">
            {ready
              ? 'Jeszcze żadnej. Pierwsza czeka na pierwszą lekcję ukończoną w stu procentach.'
              : '—'}
          </p>
        ) : (
          <ul className="flex items-center gap-2">
            {shown.map((badge, index) => (
              <li
                key={badge.id}
                className={cn(index >= SHELF_MAX_MOBILE && 'hidden sm:block')}
                title={badge.on ? `${badge.name} · zdobyta ${humanDate(badge.on)}` : badge.name}
              >
                <BadgeMark badge={badge} size={38} className="text-[var(--ink)]" />
                <span className="sr-only">{badge.name}</span>
              </li>
            ))}
            {restMobile > 0 && (
              <li className="profil-num pl-1 text-sm text-[var(--ink-soft)] sm:hidden">+{restMobile}</li>
            )}
            {rest > 0 && (
              <li className="profil-num hidden pl-1 text-sm text-[var(--ink-soft)] sm:block">+{rest}</li>
            )}
          </ul>
        )}
      </div>

      <div className="min-w-0">
        <p className="profil-micro mb-3">{nearest.length > 0 || !ready ? 'Najbliżej' : 'Komplet'}</p>
        {ready && nearest.length === 0 ? (
          <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
            Wszystkie odznaki zdobyte. Rekord serii wciąż można poprawiać.
          </p>
        ) : (
          <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
            {nearest.map((badge) => (
              <li key={badge.id} className="flex min-w-0 items-start gap-3" title={badge.requirement}>
                <BadgeMark badge={badge} size={34} className="text-[var(--ink)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold leading-tight text-[var(--ink)]">
                    {badge.name}
                  </p>
                  {/* Ile brakuje mówi więcej niż próg — próg zostaje w podpowiedzi
                      i w pełnej gablocie. */}
                  <p className="mt-1 truncate text-[11px] leading-snug text-[var(--ink-faint)]">
                    {badge.left ?? badge.requirement}
                  </p>
                  <span
                    className="mt-2 block h-[3px] bg-[color-mix(in_oklch,var(--ink)_12%,transparent)]"
                    role="img"
                    aria-label={`Postęp: ${Math.round(badge.progress * 100)} procent`}
                  >
                    <span
                      className="block h-full bg-[var(--streak)]"
                      style={{ width: `${Math.max(4, badge.progress * 100)}%` }}
                    />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
