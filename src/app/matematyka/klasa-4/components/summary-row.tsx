import Link from 'next/link';
import { Trophy } from 'lucide-react';
import { LessonProgressBadge } from './lesson-progress-badge';
import type { MathLesson } from '../data/lessons';

interface SummaryRowProps {
  lesson: MathLesson;
  color: string;
  index: number;
}

/**
 * Wpis podsumowania modułu na liście „Czego się nauczysz" — lustrzane
 * odbicie `GuideRow` (kicker, podbarwione tło, ikona zamiast samego numeru),
 * ale odwrotna semantyka: `GuideRow` mówi „to jest wstęp, zanim zaczniesz",
 * `SummaryRow` mówi „to jest meta, koniec ścieżki". W przeciwieństwie do
 * `GuideRow` zachowuje numerał (to wciąż policzony, ostatni temat modułu),
 * ale dostaje własną górną kreskę w kolorze modułu — sygnał "koniec listy",
 * którego żaden zwykły wiersz tematu nie ma.
 */
export function SummaryRow({ lesson, color, index }: SummaryRowProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <Link
      href={`/matematyka/klasa-4/${lesson.moduleSlug}/${lesson.slug}`}
      className="group flex items-start gap-4 border-t-2 px-5 py-5"
      style={{ borderColor: color, backgroundColor: `${color}0c` }}
    >
      <span
        className="w-10 shrink-0 text-2xl font-black leading-none sm:text-3xl"
        style={{ color }}
      >
        {String(index).padStart(2, '0')}
      </span>
      <span className="flex-1 py-1">
        <span
          className="mb-0.5 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em]"
          style={{ color: textColor }}
        >
          <Trophy className="h-3.5 w-3.5 shrink-0" aria-hidden />
          PODSUMOWANIE MODUŁU
        </span>
        <span className="block text-sm leading-relaxed sm:text-base">{lesson.title}</span>
      </span>
      <span className="mt-1 shrink-0">
        <LessonProgressBadge lesson={lesson} color={color} />
      </span>
    </Link>
  );
}
