'use client';

import { ModuleCtaButton as CourseModuleCtaButton } from '@/components/ui/course-module/module-cta-button';
import { useMathProgress } from '../lib/progress';
import type { MathLesson } from '../data/lessons';

interface ModuleCtaButtonProps {
  /** Dostępne lekcje modułu, posortowane rosnąco po numerze (jak z `getModuleLessons`). */
  lessons: MathLesson[];
  className?: string;
}

/** „Rozpocznij / Kontynuuj / Powtórz” modułu — postęp matematyki podany wspólnemu CTA kursów. */
export function ModuleCtaButton({ lessons, className }: ModuleCtaButtonProps) {
  const { lessonProgress, ready } = useMathProgress();
  return (
    <CourseModuleCtaButton
      lessons={lessons}
      lessonProgress={lessonProgress}
      ready={ready}
      basePath="/matematyka/klasa-4"
      className={className}
    />
  );
}
