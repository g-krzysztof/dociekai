import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { GuideProgressBadge } from './guide-progress-badge';
import type { MathLesson } from '../data/lessons';

interface GuideRowProps {
  guide: MathLesson;
  color: string;
}

/**
 * Wpis przewodnika na liście „Czego się nauczysz" — ten sam język co
 * GuideBanner (kicker PRZEWODNIK, podbarwione tło, ikona książki,
 * `GuideProgressBadge`), ale bez numeru „00": przewodnik nie jest
 * ponumerowanym tematem programu, więc nie dostaje numeracji, tylko
 * mniejszy wariant dopasowany do rytmu wiersza listy.
 */
export function GuideRow({ guide, color }: GuideRowProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <Link
      href={`/matematyka/klasa-4/${guide.moduleSlug}/${guide.slug}`}
      className="group flex flex-col gap-2 px-5 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      style={{ backgroundColor: `${color}0c` }}
    >
      <div className="min-w-0">
        <span className="block text-[11px] font-bold tracking-[0.2em]" style={{ color: textColor }}>
          PRZEWODNIK
        </span>
        <h3 className="mt-0.5 flex items-center gap-2 text-sm font-bold leading-snug sm:text-base">
          <BookOpen className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          {guide.title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{guide.goal}</p>
      </div>

      <div className="shrink-0">
        <GuideProgressBadge guide={guide} color={color} />
      </div>
    </Link>
  );
}
