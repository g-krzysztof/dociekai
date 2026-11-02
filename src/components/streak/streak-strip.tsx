'use client';

import Link from 'next/link';
import { useStreak } from '@/lib/streak/use-streak';
import { plural } from '@/lib/plural';
import { cn } from '@/lib/utils';
import { StreakCount, DAY_FORMS, streakLabel } from './streak-count';
import { WeekStrip } from './week-strip';

/**
 * Pasek serii nad mapą działów, tuż przy „kontynuuj”. Mówi dwie rzeczy i ani
 * słowa więcej: ile dni trwa rytm i czy dziś już był ruch.
 *
 * Dla gościa nie renderuje się nic — na hubie stoi już `GuestProgressNotice`
 * z prośbą o konto, a drugi baner obok pierwszego zamienia zaproszenie
 * w marudzenie.
 */
export function StreakStrip({ className }: { className?: string }) {
  const { ready, isGuest, snapshot, next } = useStreak();

  if (!ready || isGuest) return null;

  const fresh = snapshot.totalDays === 0;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t-2 border-[var(--streak)] bg-[color-mix(in_oklch,var(--streak)_6%,transparent)] px-4 py-3',
        'sm:flex-row sm:items-center sm:justify-between sm:gap-6',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {fresh ? (
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Ukończ dziś jedną lekcję</span>, żeby
            zacząć serię. Weekendy się nie liczą — liczą się dni nauki.
          </p>
        ) : (
          <>
            <StreakCount days={snapshot.streak} lit={snapshot.todayDone} size="md" />
            <span className="sr-only">{streakLabel(snapshot.streak, snapshot.todayDone)}</span>
            <span className="text-sm leading-tight text-muted-foreground" aria-hidden>
              {plural(snapshot.streak, DAY_FORMS)} nauki
              <br />
              <span className="font-semibold text-foreground">
                {snapshot.todayDone ? 'dziś zaliczone' : 'dziś jeszcze nie'}
              </span>
            </span>
          </>
        )}
      </div>

      {!fresh && (
        <div className="flex items-center gap-4">
          <WeekStrip days={snapshot.week} today={snapshot.today} cell={18} labels />
          {next && (
            <Link
              href="/profil#rytm"
              className="hidden text-xs leading-tight text-muted-foreground underline-offset-4 hover:text-foreground hover:underline lg:block"
            >
              do odznaki
              <br />
              <span className="font-semibold tabular-nums text-[var(--streak-ink)]">
                {next.left} {plural(next.left, DAY_FORMS)}
              </span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
