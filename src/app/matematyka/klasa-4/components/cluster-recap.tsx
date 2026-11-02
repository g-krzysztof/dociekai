import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { MathLesson } from '../data/lessons';

export interface RecapItem {
  lesson: MathLesson;
  /** Jedno zdanie: co dziecko powinno pamiętać z tej lekcji. */
  reminder: string;
}

interface ClusterRecapProps {
  items: RecapItem[];
  color: string;
}

/**
 * Krótka powtórka przed sprawdzianem klastra — lista 2–3 lekcji z jednym
 * zdaniem przypomnienia i linkiem powrotnym do samej lekcji, gdyby dziecko
 * chciało odświeżyć temat przed odpowiedzią. Nie uczy od nowa, tylko
 * przypomina — pełna lekcja jest o kliknięcie dalej. Promowany tu z
 * `components/lessons/podsumowanie-liczby-naturalne/` w chwili, gdy
 * `podsumowanie-obliczenia-praktyczne` stało się jego drugim konsumentem —
 * sam komponent nie zmienił się, bo nigdy nie hardkodował treści modułu 1.
 */
export function ClusterRecap({ items, color }: ClusterRecapProps) {
  return (
    <ol className="mb-5 divide-y border">
      {items.map(({ lesson, reminder }) => (
        <li key={lesson.slug}>
          <Link
            href={`/matematyka/klasa-4/${lesson.moduleSlug}/${lesson.slug}`}
            className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <span
              className="w-6 shrink-0 font-mono text-sm font-bold leading-none tabular-nums"
              style={{ color }}
            >
              {String(lesson.number).padStart(2, '0')}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-snug">{lesson.short}</span>
              <span className="block text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {reminder}
              </span>
            </span>
            <ArrowUpRight
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ol>
  );
}
