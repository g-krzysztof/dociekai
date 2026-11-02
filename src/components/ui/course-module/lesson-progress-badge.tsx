'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { ShelfLessonProgress } from '../course-shelf/types';

interface LessonProgressBadgeProps {
  /** Postęp lekcji z hooka postępu kursu; brak = jeszcze nieodczytany albo nie zaczęty. */
  progress?: ShelfLessonProgress;
  /** `true` dopiero po odczycie magazynu — SSR i pierwsza klatka widzą `false`. */
  ready: boolean;
  /** Orientacyjny czas lekcji, pokazywany, dopóki dziecko jej nie zaczęło. */
  duration: string;
  color: string;
}

/**
 * Zastępuje „czas trwania + strzałka” przy temacie odznaką postępu, gdy
 * dziecko już zaczęło albo skończyło tę lekcję. Wspólna dla obu kursów —
 * postęp podaje otoczka kursu. Domyślny render (przed odczytem magazynu)
 * to sam czas trwania.
 */
export function LessonProgressBadge({ progress, ready, duration, color }: LessonProgressBadgeProps) {
  if (ready && progress?.status === 'done') {
    return (
      <span className="mt-1 inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-600">
        <CheckCircle2 className="h-4 w-4" />
        Ukończono
      </span>
    );
  }

  if (ready && progress?.status === 'in-progress') {
    return (
      <span
        className="mt-1 inline-flex shrink-0 items-center gap-1 text-sm font-semibold"
        style={{ color }}
      >
        W trakcie · {progress.done}/{progress.total}
      </span>
    );
  }

  return (
    <span
      className="mt-1 inline-flex shrink-0 items-center gap-1 text-sm font-semibold transition-transform group-hover:translate-x-0.5"
      style={{ color }}
    >
      {duration}
      <ArrowRight className="h-4 w-4" />
    </span>
  );
}
