import { BookOpen } from 'lucide-react';
import type { CourseConfig } from '@/lib/course-catalog';
import { CURRICULUM_STATS } from '../klasa-4/data/curriculum';

/**
 * Katalog kursów języka polskiego — na razie jeden rocznik (klasa 4). Tylko treść
 * marketingowa karty; program nauczania żyje w `klasa-4/data/curriculum.ts`.
 *
 * Kurs otwarty dla wyszukiwarek i w menu (E7a/E7b, 2026-10-16, na polecenie
 * autora kursu), choć lekcje dopiero powstają; ilustracja karty i okładki modułów
 * — sunburst, lokalnie w `public/images/jezyk-polski/` do publikacji na Cloudinary (`polski4/`).
 */
export const COURSES: CourseConfig[] = [
  {
    slug: 'klasa-4',
    title: 'Język polski — klasa 4',
    tagline: 'Pierwszy rok w klasach 4–8: słowa, zdania, opowieści i własne teksty.',
    description:
      'Kurs zgodny z nową podstawą programową 2026 dla klasy 4: porozumiewanie się, słownictwo i części mowy, baśnie, mity i legendy, zdanie i interpunkcja, ortografia, poezja, pisanie i media. Ćwiczy na stronie to, co da się uczciwie sprawdzić — nie zastępuje lekcji polskiego w szkole.',
    stats: [
      `${CURRICULUM_STATS.modules} modułów`,
      `${CURRICULUM_STATS.onlineLessons} lekcji online`,
      `${CURRICULUM_STATS.hours} h nauki`,
    ],
    color: '#0e7490',
    icon: BookOpen,
    image: '/images/jezyk-polski/kurs-klasa-4.jpg',
    imageAlt: 'Kurs języka polskiego dla klasy 4 — otwarta książka na parapecie i papierowa łódka',
    href: '/jezyk-polski/klasa-4',
    ctaLabel: 'Zobacz kurs klasy 4',
    status: 'available',
  },
];
