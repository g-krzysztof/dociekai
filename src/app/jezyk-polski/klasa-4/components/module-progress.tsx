'use client';

import { Headphones } from 'lucide-react';
import { LessonProgressBadge as CourseLessonProgressBadge } from '@/components/ui/course-module/lesson-progress-badge';
import { ModuleCtaButton as CourseModuleCtaButton } from '@/components/ui/course-module/module-cta-button';
import { ModuleStatusBadge as CourseModuleStatusBadge } from '@/components/ui/course-module/module-status-badge';
import { lessonProgressKey, usePolProgress } from '../lib/progress';
import type { PolLesson } from '../data/lessons';

/**
 * Postęp na stronie modułu — te same odznaki i CTA co w innych kursach
 * (`@/components/ui/course-module`), zasilone `usePolProgress()`.
 * Serwerowa `[modul]/page.tsx` renderuje je jak zwykłe komponenty; do odczytu
 * magazynu wszystkie trzy pokazują stan statyczny, więc SSR i pierwsza klatka
 * się zgadzają. Kalka kursu historii.
 */

export function ModuleStatusBadge({
  moduleSlug,
  firstLessonNumber,
}: {
  moduleSlug: string;
  /** Numer pierwszej dostępnej lekcji modułu; brak = moduł bez opublikowanych lekcji. */
  firstLessonNumber?: number;
}) {
  const { moduleProgress, ready } = usePolProgress();
  return (
    <CourseModuleStatusBadge
      progress={moduleProgress[moduleSlug]}
      ready={ready}
      firstLessonNumber={firstLessonNumber}
    />
  );
}

export function LessonProgressBadge({ lesson, color }: { lesson: PolLesson; color: string }) {
  const { lessonProgress, ready } = usePolProgress();
  return (
    <CourseLessonProgressBadge
      progress={lessonProgress[lessonProgressKey(lesson.moduleSlug, lesson.slug)]}
      ready={ready}
      duration={lesson.duration}
      color={color}
    />
  );
}

export function ModuleCtaButton({ lessons, className }: { lessons: PolLesson[]; className?: string }) {
  const { lessonProgress, ready } = usePolProgress();
  return (
    <CourseModuleCtaButton
      lessons={lessons}
      lessonProgress={lessonProgress}
      ready={ready}
      basePath="/jezyk-polski/klasa-4"
      className={className}
    />
  );
}

/**
 * Znacznik lekcji, w której dźwięk jest treścią (`lesson.sound`, § 3a programu):
 * tor dorosły — żeby było wiadomo, kiedy przydadzą się słuchawki.
 */
export function SoundNote({ lesson }: { lesson: Pick<PolLesson, 'sound'> }) {
  if (!lesson.sound) return null;
  return (
    <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
      <Headphones className="h-3.5 w-3.5 shrink-0" aria-hidden /> W tej lekcji przyda się dźwięk.
    </span>
  );
}
