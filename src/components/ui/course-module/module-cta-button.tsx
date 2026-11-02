'use client';

import Link from 'next/link';
import { PlayCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { shelfLessonKey, type ShelfLesson, type ShelfLessonProgress } from '../course-shelf/types';

interface ModuleCtaButtonProps {
  /** Dostępne lekcje modułu, posortowane rosnąco po numerze (jak z `getModuleLessons`). */
  lessons: Pick<ShelfLesson, 'moduleSlug' | 'slug' | 'short'>[];
  /** Mapa postępu lekcji z hooka postępu kursu, klucz `shelfLessonKey`. */
  lessonProgress: Record<string, ShelfLessonProgress>;
  /** `true` dopiero po odczycie magazynu — SSR i pierwsza klatka widzą `false`. */
  ready: boolean;
  /** Korzeń tras kursu, np. `/matematyka/klasa-4`. */
  basePath: string;
  className?: string;
}

/**
 * CTA modułu: „Rozpocznij” dla kogoś, kto jeszcze nie zaczął, „Kontynuuj”
 * gdy jest w trakcie (linkuje do pierwszej nieukończonej lekcji), „Powtórz”
 * gdy wszystkie dostępne lekcje są już zrobione. Domyślny render (przed
 * odczytem magazynu) to zawsze „Rozpocznij: pierwsza lekcja”.
 */
export function ModuleCtaButton({
  lessons,
  lessonProgress,
  ready,
  basePath,
  className,
}: ModuleCtaButtonProps) {
  const first = lessons[0];
  if (!first) return null;

  let target = first;
  let label = `Rozpocznij: ${first.short}`;
  let Icon = PlayCircle;

  if (ready) {
    const withStatus = lessons.map((lesson) => ({
      lesson,
      status: lessonProgress[shelfLessonKey(lesson.moduleSlug, lesson.slug)]?.status ?? 'not-started',
    }));
    const allDone = withStatus.every((item) => item.status === 'done');
    const next = withStatus.find((item) => item.status !== 'done');

    if (allDone) {
      label = `Powtórz: ${first.short}`;
      Icon = RotateCcw;
    } else if (next) {
      target = next.lesson;
      label =
        next.status === 'in-progress' ? `Kontynuuj: ${next.lesson.short}` : `Rozpocznij: ${next.lesson.short}`;
    }
  }

  return (
    <Button asChild size="lg" className={cn('gap-2', className)}>
      <Link href={`${basePath}/${target.moduleSlug}/${target.slug}`}>
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
}
