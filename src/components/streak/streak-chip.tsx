'use client';

import Link from 'next/link';
import { useStreak } from '@/lib/streak/use-streak';
import { StreakCount, streakLabel } from './streak-count';
import { cn } from '@/lib/utils';

/**
 * Licznik serii w nagłówku. Widoczny dopiero wtedy, gdy jest co pokazać —
 * seria zerowa nie wita dziecka zerem, tylko po prostu znika, a pierwszy
 * płomień pojawia się razem z pierwszym zaliczonym dniem.
 *
 * Gość nie ma serii, więc też nie ma chipa: jego postęp żyje tylko do zamknięcia
 * karty. Zaproszenie do założenia konta pada w jednym, mocniejszym miejscu —
 * na karcie końcowej lekcji, którą właśnie skończył.
 */
export function StreakChip({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { ready, isGuest, snapshot } = useStreak();

  if (!ready || isGuest || snapshot.streak === 0) return null;

  return (
    <Link
      href="/profil#rytm"
      onClick={onNavigate}
      aria-label={streakLabel(snapshot.streak, snapshot.todayDone)}
      title={streakLabel(snapshot.streak, snapshot.todayDone)}
      className={cn(
        'inline-flex h-8 items-center border px-2.5 transition-colors',
        'border-[color-mix(in_oklch,var(--streak)_35%,transparent)]',
        'hover:border-[var(--streak)] hover:bg-[color-mix(in_oklch,var(--streak)_8%,transparent)]',
        className
      )}
    >
      <StreakCount days={snapshot.streak} lit={snapshot.todayDone} size="sm" />
    </Link>
  );
}
