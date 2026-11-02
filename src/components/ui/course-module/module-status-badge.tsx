'use client';

import { CheckCircle2, Lock, PlayCircle } from 'lucide-react';
import type { ShelfModuleProgress } from '../course-shelf/types';

interface ModuleStatusBadgeProps {
  /** Postęp modułu z hooka postępu kursu; brak = jeszcze nieodczytany albo nie zaczęty. */
  progress?: ShelfModuleProgress;
  /** `true` dopiero po odczycie magazynu — SSR i pierwsza klatka widzą `false`. */
  ready: boolean;
  /** Numer pierwszej dostępnej lekcji modułu; brak = moduł bez opublikowanych lekcji. */
  firstLessonNumber?: number;
}

/**
 * Odznaka w nagłówku modułu, wspólna dla obu kursów — każdy podaje jej postęp
 * z własnego hooka (`useMathProgress`, `useInfoProgress`) przez cienką
 * otoczkę w swoim `components/`. Domyślny render (SSR i pierwsza klatka po
 * stronie klienta, zanim hook odczyta magazyn) jest statyczny — dopiero po
 * zamontowaniu może się podmienić na stan z postępem.
 */
export function ModuleStatusBadge({ progress, ready, firstLessonNumber }: ModuleStatusBadgeProps) {
  // Celowo porównanie z undefined, nie test falsy: numer 0 jest legalny
  // (dostają go przewodniki), a `!0` cicho przełączyłoby moduł w „w przygotowaniu”.
  if (firstLessonNumber === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Lekcje w przygotowaniu
      </span>
    );
  }

  if (ready && progress?.status === 'done') {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Moduł ukończony
      </span>
    );
  }

  if (ready && progress?.status === 'in-progress') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <PlayCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {progress.doneLessons}/{progress.totalLessons} lekcji ukończonych
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <PlayCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
      Lekcja {firstLessonNumber} już dostępna
    </span>
  );
}
