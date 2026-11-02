'use client';

import Link from 'next/link';
import { ArrowRight, Flag, Flame, PlayCircle, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WeekStrip } from '@/components/streak/week-strip';
import { DAY_FORMS } from '@/components/streak/streak-count';
import { plural } from '@/lib/plural';
import type { StreakSnapshot } from '@/lib/streak/types';
import type { NextStepModel } from '../lib/atlas-shape';

export interface TodayStep {
  course: string;
  step: NextStepModel;
  fresh: boolean;
}

interface TodayStripProps {
  snapshot: StreakSnapshot;
  ready: boolean;
  /** Jedna lekcja na dziś, wybrana spośród wszystkich kursów; brak = wszystko zrobione. */
  today?: TodayStep;
  coursesReady: boolean;
  onActive: (active: boolean) => void;
}

/**
 * Arkusz „dziś”: seria, tydzień, zamrażarki i jedna lekcja do zrobienia —
 * wszystko, co ma znaczenie przed otwarciem jakiejkolwiek mapy roku. To jedyne
 * miejsce na pulpicie z pełnym przyciskiem akcji.
 */
export function TodayStrip({ snapshot, ready, today, coursesReady, onActive }: TodayStripProps) {
  return (
    <div
      className="grid grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center"
      onMouseEnter={() => onActive(true)}
      onMouseLeave={() => onActive(false)}
    >
      <h2 className="sr-only">Dziś</h2>

      <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
        <div className="flex items-center gap-3.5">
          <Flame
            className="h-9 w-9 shrink-0 text-[var(--streak)]"
            fill={snapshot.todayDone ? 'var(--streak)' : 'none'}
            strokeWidth={1.7}
            aria-hidden
          />
          <div>
            <p className="profil-num text-[2.5rem] leading-none text-[var(--ink)]">
              {ready ? snapshot.streak : '—'}
            </p>
            <p className="profil-micro mt-1.5">
              {plural(snapshot.streak, DAY_FORMS)} z rzędu
            </p>
          </div>
        </div>

        <div>
          <p className="profil-micro mb-2">Ten tydzień</p>
          <WeekStrip days={snapshot.week} today={snapshot.today} cell={20} labels />
        </div>

        <div>
          <p className="profil-micro mb-2">Zamrażarki</p>
          <p className="flex h-5 items-center gap-1.5">
            {Array.from({ length: snapshot.freezesTotal }, (_, i) => (
              <Snowflake
                key={i}
                className="h-[18px] w-[18px] text-[var(--streak-cold)]"
                strokeWidth={2.2}
                opacity={i < snapshot.freezesLeft ? 1 : 0.22}
                aria-hidden
              />
            ))}
            <span className="profil-num ml-1 text-sm text-[var(--ink)]">
              {ready ? snapshot.freezesLeft : '—'} z {snapshot.freezesTotal}
            </span>
          </p>
        </div>
      </div>

      <TodayLesson today={today} ready={coursesReady} />
    </div>
  );
}

/** Rezerwuje wysokość od pierwszej klatki, żeby wybór lekcji nie przesuwał arkuszy niżej. */
function TodayLesson({ today, ready }: { today?: TodayStep; ready: boolean }) {
  const frame = 'min-h-[5.5rem] border-t-2 px-4 py-4 sm:px-5';

  if (!ready) return <div className={`${frame} border-[var(--rule-faint)]`} aria-hidden />;

  if (!today) {
    return (
      <div className={`${frame} flex items-center gap-3 border-[var(--ink)]`}>
        <Flag className="h-5 w-5 shrink-0" aria-hidden />
        <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
          <span className="font-bold text-[var(--ink)]">Cały opublikowany materiał zrobiony.</span>{' '}
          Każdą lekcję można powtórzyć bez utraty postępu.
        </p>
      </div>
    );
  }

  const { step, course, fresh } = today;
  const verb = step.inProgress ? 'Wróć do' : fresh ? 'Zacznij tutaj' : 'Następna lekcja';

  return (
    <div
      className={`${frame} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6`}
      style={{
        borderTopColor: step.color,
        backgroundColor: `color-mix(in oklch, ${step.color} 6%, transparent)`,
      }}
    >
      <div className="flex min-w-0 items-center gap-4">
        <span
          className="profil-num shrink-0 text-4xl leading-none"
          style={{ color: step.color }}
          aria-hidden
        >
          {step.moduleNumber}
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold leading-tight tracking-[-0.02em] sm:text-lg">
            {verb}: {step.short}
          </p>
          <p className="profil-micro mt-1.5 truncate">
            {course} · {step.moduleTitle} · {step.duration}
          </p>
        </div>
      </div>

      <Button asChild className="profil-btn-solid h-11 shrink-0 px-5 text-[15px] font-bold">
        <Link href={step.href}>
          {step.inProgress ? <ArrowRight className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
          {step.inProgress ? 'Kontynuuj' : 'Zacznij'}
        </Link>
      </Button>
    </div>
  );
}
