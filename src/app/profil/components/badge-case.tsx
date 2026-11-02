'use client';

import { cn } from '@/lib/utils';
import { BadgeMark } from '@/components/streak/badge-mark';
import { BADGE_FAMILIES, type BadgeState } from '@/lib/streak/badges';
import { humanDate } from '@/lib/streak/school-calendar';

/**
 * Gablota odznak. Zamknięta odznaka pokazuje **próg, nie zagadkę** — dziecko ma
 * widzieć, po co sięga, bo ukryty warunek nie motywuje, tylko myli. Zdobyta
 * pokazuje datę, jeśli da się ją odtworzyć z historii dni; tam, gdzie się nie
 * da, nie ma jej wcale, zamiast daty zmyślonej.
 */
export function BadgeCase({ badges, ready }: { badges: BadgeState[]; ready: boolean }) {
  return (
    <div className="mt-9 space-y-7">
      {BADGE_FAMILIES.map((family) => {
        const items = badges.filter((badge) => badge.family === family.id);
        if (items.length === 0) return null;
        const earned = items.filter((badge) => badge.earned).length;

        return (
          <section key={family.id}>
            <div className="flex items-baseline justify-between gap-4 border-t border-[var(--rule-faint)] pt-3">
              <h3 className="profil-micro text-[var(--ink-soft)]">
                {family.label} <span className="text-[var(--ink-faint)]">· {family.lead}</span>
              </h3>
              <p className="profil-num shrink-0 text-[11px] text-[var(--ink-soft)]">
                {ready ? earned : 0}/{items.length}
              </p>
            </div>

            <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((badge) => (
                <li key={badge.id} className="flex items-start gap-3">
                  <BadgeMark badge={badge} size={46} className="mt-0.5 text-[var(--ink)]" />
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'text-sm font-bold leading-tight',
                        badge.earned ? 'text-[var(--ink)]' : 'text-[var(--ink-faint)]'
                      )}
                    >
                      {badge.name}
                    </p>
                    <p className="mt-1 text-[11px] leading-snug text-[var(--ink-faint)]">
                      {badge.earned && badge.on
                        ? `zdobyta ${humanDate(badge.on)}`
                        : badge.earned
                          ? 'zdobyta'
                          : badge.requirement}
                    </p>
                    {!badge.earned && badge.progress > 0 && (
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
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
