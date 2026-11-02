'use client';

import Link from 'next/link';
import { useStreak } from '@/lib/streak/use-streak';
import { todayKey } from '@/lib/streak/school-calendar';
import { StreakCount, streakLabel } from './streak-count';
import { cn } from '@/lib/utils';

/**
 * Seria przy pasku postępu lekcji — widoczna przez całą lekcję, nie tylko na
 * karcie końcowej (tę rolę pełni `StreakRibbon`). Liczba dni stoi tam zawsze;
 * w dniu, w którym dziecko akurat przekroczyło próg odznaki rytmu, DOCHODZI do
 * niej (nie zastępuje jej) świeżo zdobyta odznaka — seria zostaje głównym,
 * stałym punktem odniesienia, odznaka jest dopiskiem na ten jeden dzień.
 */
export function LessonProgressAside({ className }: { className?: string }) {
  const { ready, isGuest, snapshot, badges } = useStreak({ withBadges: true });

  if (isGuest || !ready || snapshot.streak === 0) return null;

  const today = todayKey();
  const freshBadge = badges.find(
    (badge) => badge.family === 'rytm' && badge.earned && badge.on === today
  );

  return (
    <Link
      href="/profil#rytm"
      title={
        freshBadge
          ? `${streakLabel(snapshot.streak, snapshot.todayDone)} Nowa odznaka: ${freshBadge.name}.`
          : streakLabel(snapshot.streak, snapshot.todayDone)
      }
      className={cn('flex min-w-0 items-center gap-1.5', className)}
    >
      <span className="hidden shrink-0 text-xs font-semibold text-muted-foreground sm:inline">
        Seria
      </span>
      <StreakCount days={snapshot.streak} lit={snapshot.todayDone} size="sm" />
      {freshBadge && (
        <>
          <span className="shrink-0 text-muted-foreground" aria-hidden>
            ·
          </span>
          <freshBadge.icon size={16} strokeWidth={2} className="shrink-0 text-[var(--streak)]" aria-hidden />
          <span className="truncate text-xs font-bold text-[var(--streak-ink)]">
            {freshBadge.name}
          </span>
        </>
      )}
    </Link>
  );
}
