'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { lessonProgressKey, useMathProgress } from '../lib/progress';
import type { MathLesson } from '../data/lessons';

interface GuideProgressBadgeProps {
  guide: MathLesson;
  color: string;
}

/**
 * Status przewodnika: „Przeczytane” zamiast „Ukończono”, bo tu nie ma zadań.
 * Domyślny render (przed odczytem localStorage) jest identyczny jak wersja bez
 * postępu — sam czas czytania — żeby nie było przeskoku po hydratacji.
 */
export function GuideProgressBadge({ guide, color }: GuideProgressBadgeProps) {
  const { lessonProgress, ready } = useMathProgress();
  const progress = lessonProgress[lessonProgressKey(guide.moduleSlug, guide.slug)];

  if (ready && progress?.status === 'done') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-600">
        <CheckCircle2 className="h-4 w-4" />
        Przeczytane
      </span>
    );
  }

  if (ready && progress?.status === 'in-progress') {
    return (
      <span
        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold"
        style={{ color }}
      >
        W trakcie · {progress.done}/{progress.total}
      </span>
    );
  }

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold transition-transform group-hover:translate-x-0.5"
      style={{ color }}
    >
      {guide.duration}
      <ArrowRight className="h-4 w-4" />
    </span>
  );
}
