'use client';

import Link from 'next/link';
import { ArrowRight, PartyPopper, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  ShelfCourseProgress,
  ShelfLesson,
  ShelfModule,
  ShelfModuleProgress,
  ShelfProgressStatus,
} from './types';

interface YearProgressRailProps {
  /** Moduły kursu — segmenty paska są proporcjonalne do liczby ich tematów. */
  modules: ShelfModule[];
  /** Korzeń tras kursu, np. `/matematyka/klasa-4`. */
  basePath: string;
  courseProgress: ShelfCourseProgress | null;
  moduleProgress: Record<string, ShelfModuleProgress>;
  nextLesson?: ShelfLesson;
  nextLessonStatus?: ShelfProgressStatus;
  ready: boolean;
}

/**
 * Odczyt „gdzie jestem w roku" na jedną linię — pasek dziesięciu segmentów
 * w kolorach modułów, szerokich proporcjonalnie do liczby tematów, każdy
 * wypełniony w tylu procentach, ile lekcji tego działu jest zrobionych.
 *
 * Celowo nie jest klikalny: nawigację niesie półka niżej, a to jest wskaźnik.
 * Zastępuje dawną kartę „Twój postęp" wciśniętą w środek listy modułów — tam
 * była nie do znalezienia, dopóki się do niej nie doscrollowało.
 */
export function YearProgressRail({
  modules,
  basePath,
  courseProgress,
  moduleProgress,
  nextLesson,
  nextLessonStatus,
  ready,
}: YearProgressRailProps) {
  const percent =
    courseProgress && courseProgress.totalLessons > 0
      ? Math.round((courseProgress.doneLessons / courseProgress.totalLessons) * 100)
      : 0;
  const totalWeight = modules.reduce((sum, module) => sum + module.lessons.length, 0);
  // Kurs bez ani jednej opublikowanej lekcji (historia na starcie) nie jest „zrobiony”.
  const allDone =
    ready && Boolean(courseProgress) && (courseProgress?.totalLessons ?? 0) > 0 && !nextLesson;

  return (
    <div className="lg:w-80 lg:shrink-0 lg:border-l lg:pl-7">
      <p className="text-sm font-bold">Twój postęp w roku</p>

      <div
        className="mt-3 flex h-2.5 gap-px overflow-hidden"
        role="img"
        aria-label={
          courseProgress
            ? `Ukończone ${courseProgress.doneLessons} z ${courseProgress.totalLessons} lekcji`
            : 'Postęp w kursie'
        }
      >
        {modules.map((module) => {
          const progress = moduleProgress[module.slug];
          const fill =
            progress && progress.totalLessons > 0
              ? (progress.doneLessons / progress.totalLessons) * 100
              : 0;

          return (
            <span
              key={module.slug}
              className="relative block"
              style={{
                flexGrow: module.lessons.length / totalWeight,
                backgroundColor: `color-mix(in oklch, ${module.color} 18%, transparent)`,
              }}
            >
              <span
                className="absolute inset-y-0 left-0 transition-[width] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                style={{ width: `${ready ? fill : 0}%`, backgroundColor: module.color }}
              />
            </span>
          );
        })}
      </div>

      <p className="mt-2.5 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
        <span className="font-bold text-foreground">{ready ? percent : 0}%</span>
        {courseProgress && (
          <>
            {' · '}
            {courseProgress.doneLessons}/{courseProgress.totalLessons} lekcji {' · '}
            {courseProgress.doneModules}/{courseProgress.totalModulesWithLessons} działów
          </>
        )}
      </p>

      {allDone ? (
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
          <PartyPopper className="h-4 w-4" aria-hidden />
          Cały opublikowany materiał zrobiony!
        </p>
      ) : (
        nextLesson && (
          <Button asChild size="lg" className="mt-4 w-full justify-start gap-2">
            <Link href={`${basePath}/${nextLesson.moduleSlug}/${nextLesson.slug}`}>
              {nextLessonStatus === 'in-progress' ? (
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <PlayCircle className="h-4 w-4 shrink-0" aria-hidden />
              )}
              <span className="truncate">
                {nextLessonStatus === 'in-progress' ? 'Kontynuuj' : 'Dalej'}: {nextLesson.short}
              </span>
            </Link>
          </Button>
        )
      )}
    </div>
  );
}
