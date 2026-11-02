import { Landmark } from 'lucide-react';
import type { CourseConfig } from '@/lib/course-catalog';
import { CURRICULUM_STATS } from '../klasa-4/data/curriculum';

/**
 * Katalog kursów historii — na razie jeden rocznik (klasa 4). Tylko treść
 * marketingowa karty; program nauczania żyje w `klasa-4/data/curriculum.ts`.
 *
 * Kurs otwarty dla wyszukiwarek (E4b, 2026-10-03); ilustracja karty sunburst
 * (`historia4/kurs-klasa-4`), okładki modułów w `klasa-4/data/curriculum.ts`.
 */
export const COURSES: CourseConfig[] = [
  {
    slug: 'klasa-4',
    title: 'Historia — klasa 4',
    tagline: 'Pierwszy rok historii: warsztat historyka i starożytność.',
    description:
      'Kurs zgodny z nową podstawą programową 2026 dla klasy 4: skąd wiemy, co było, jak liczyć czas i czytać mapę, mała i duża ojczyzna, a potem od pierwszych ludzi przez Egipt, Grecję i Rzym do narodzin chrześcijaństwa.',
    stats: [
      `${CURRICULUM_STATS.modules} modułów`,
      `${CURRICULUM_STATS.onlineLessons} lekcje online`,
      `${CURRICULUM_STATS.hours} h nauki`,
    ],
    color: '#9a3412',
    icon: Landmark,
    image: '/images/historia/kurs-klasa-4.jpg',
    imageAlt:
      'Kurs historii dla klasy 4 — wstęga pergaminu z piramidą, kolumną grecką i rzymskim łukiem',
    href: '/historia/klasa-4',
    ctaLabel: 'Zobacz kurs klasy 4',
    status: 'available',
  },
];
