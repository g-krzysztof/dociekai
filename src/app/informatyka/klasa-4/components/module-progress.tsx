'use client';

import { LessonProgressBadge as CourseLessonProgressBadge } from '@/components/ui/course-module/lesson-progress-badge';
import { ModuleCtaButton as CourseModuleCtaButton } from '@/components/ui/course-module/module-cta-button';
import { ModuleStatusBadge as CourseModuleStatusBadge } from '@/components/ui/course-module/module-status-badge';
import { lessonProgressKey, useInfoProgress } from '../lib/progress';
import type { InfoLesson } from '../data/lessons';

/**
 * Postęp na stronie modułu — te same odznaki i CTA co w matematyce
 * (`@/components/ui/course-module`), zasilone `useInfoProgress()`. Serwerowa
 * `[modul]/page.tsx` renderuje je jak zwykłe komponenty; do odczytu magazynu
 * wszystkie trzy pokazują stan statyczny, więc SSR i pierwsza klatka się zgadzają.
 */

export function ModuleStatusBadge({
  moduleSlug,
  firstLessonNumber,
}: {
  moduleSlug: string;
  /** Numer pierwszej dostępnej lekcji modułu; brak = moduł bez opublikowanych lekcji. */
  firstLessonNumber?: number;
}) {
  const { moduleProgress, ready } = useInfoProgress();
  return (
    <CourseModuleStatusBadge
      progress={moduleProgress[moduleSlug]}
      ready={ready}
      firstLessonNumber={firstLessonNumber}
    />
  );
}

export function LessonProgressBadge({ lesson, color }: { lesson: InfoLesson; color: string }) {
  const { lessonProgress, ready } = useInfoProgress();
  return (
    <CourseLessonProgressBadge
      progress={lessonProgress[lessonProgressKey(lesson.moduleSlug, lesson.slug)]}
      ready={ready}
      duration={lesson.duration}
      color={color}
    />
  );
}

export function ModuleCtaButton({ lessons, className }: { lessons: InfoLesson[]; className?: string }) {
  const { lessonProgress, ready } = useInfoProgress();
  return (
    <CourseModuleCtaButton
      lessons={lessons}
      lessonProgress={lessonProgress}
      ready={ready}
      basePath="/informatyka/klasa-4"
      className={className}
    />
  );
}
