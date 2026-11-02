'use client';

import { ModuleStatusBadge as CourseModuleStatusBadge } from '@/components/ui/course-module/module-status-badge';
import { useMathProgress } from '../lib/progress';

interface ModuleStatusBadgeProps {
  moduleSlug: string;
  /** Numer pierwszej dostępnej lekcji modułu; brak = moduł bez opublikowanych lekcji. */
  firstLessonNumber?: number;
}

/** Odznaka w nagłówku modułu — postęp matematyki podany wspólnej odznace kursów. */
export function ModuleStatusBadge({ moduleSlug, firstLessonNumber }: ModuleStatusBadgeProps) {
  const { moduleProgress, ready } = useMathProgress();
  return (
    <CourseModuleStatusBadge
      progress={moduleProgress[moduleSlug]}
      ready={ready}
      firstLessonNumber={firstLessonNumber}
    />
  );
}
