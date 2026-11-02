'use client';

import { LessonProgressBadge as CourseLessonProgressBadge } from '@/components/ui/course-module/lesson-progress-badge';
import { lessonProgressKey, useMathProgress } from '../lib/progress';
import type { MathLesson } from '../data/lessons';

interface LessonProgressBadgeProps {
  lesson: MathLesson;
  color: string;
}

/** Czas trwania albo postęp przy temacie — postęp matematyki podany wspólnej odznace kursów. */
export function LessonProgressBadge({ lesson, color }: LessonProgressBadgeProps) {
  const { lessonProgress, ready } = useMathProgress();
  return (
    <CourseLessonProgressBadge
      progress={lessonProgress[lessonProgressKey(lesson.moduleSlug, lesson.slug)]}
      ready={ready}
      duration={lesson.duration}
      color={color}
    />
  );
}
