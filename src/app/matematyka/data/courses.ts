import { Calculator } from 'lucide-react';
import type { CourseConfig } from '@/lib/course-catalog';
import { CURRICULUM_STATS } from '../klasa-4/data/curriculum';

/**
 * Katalog kursów matematyki — na razie jeden rocznik (klasa 4), docelowo
 * jeden wpis na każdą klasę szkoły podstawowej. Każdy kurs ma własne dane
 * programu w swoim folderze (`klasa-4/data/curriculum.ts`) — ten plik
 * zawiera tylko treść marketingową karty katalogowej, nie program nauczania.
 */
export const COURSES: CourseConfig[] = [
  {
    slug: 'klasa-4',
    title: 'Matematyka — klasa 4',
    tagline: 'Cały rok matematyki, krok po kroku.',
    description:
      'Kurs zgodny z podstawą programową MEiN: liczby naturalne, działania pisemne, geometria, ułamki zwykłe i dziesiętne, pola figur i bryły. Interaktywne lekcje, przewodniki i podsumowania modułowe w jednym miejscu.',
    stats: [
      `${CURRICULUM_STATS.modules} modułów`,
      `${CURRICULUM_STATS.onlineLessons} lekcji online`,
      `${CURRICULUM_STATS.hours} h nauki`,
    ],
    color: '#2563eb',
    icon: Calculator,
    image: '/images/matematyka/modul-00-start.jpg',
    imageAlt: 'Kurs matematyki dla klasy 4 — kompas, rakieta i notatnik symbolizujące start nauki',
    href: '/matematyka/klasa-4',
    ctaLabel: 'Rozpocznij kurs klasy 4',
    status: 'available',
  },
];
