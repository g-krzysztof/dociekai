import type { LucideIcon } from 'lucide-react';

/**
 * Wspólny kształt karty kursu w katalogu przedmiotu (`/matematyka`, `/informatyka`, `/historia`).
 *
 * Każdy przedmiot ma własny plik `data/courses.ts` z treścią marketingową swoich
 * roczników — tutaj mieszka tylko typ, wspólny dla katalogów i dla komponentów
 * `CourseOrbitNode` / `CourseSoonNode` z `@/components/ui`.
 */
export type CourseStatus = 'available' | 'soon';

export interface CourseConfig {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** Krótkie fakty o kursie pokazywane jako chipy na karcie (liczba modułów, lekcji, godzin). */
  stats: string[];
  color: string;
  icon: LucideIcon;
  /** Awatar karty; bez niego karta pokazuje dużą ikonę kursu (kurs przed ustaleniem ilustracji). */
  image?: string;
  imageAlt?: string;
  href: string;
  ctaLabel: string;
  status: CourseStatus;
}
