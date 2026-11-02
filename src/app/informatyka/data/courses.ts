import { MonitorSmartphone } from 'lucide-react';
import type { CourseConfig } from '@/lib/course-catalog';
import { CURRICULUM_STATS } from '../klasa-4/data/curriculum';

/**
 * Katalog kursów informatyki — na razie jeden rocznik (klasa 4), docelowo
 * jeden wpis na każdą klasę szkoły podstawowej. Każdy kurs ma własne dane
 * programu w swoim folderze (`klasa-4/data/curriculum.ts`) — ten plik
 * zawiera tylko treść marketingową karty katalogowej, nie program nauczania.
 *
 * Kurs jest `status: 'available'` od 2026-09-07 (moduły 0 i 1 domknięte, moduł 2
 * otwarty) — razem ze zdjęciem `noindex`/`exclude` z sitemapy. Karta ma własną
 * ilustrację (`informatyka4/kurs-klasa-4`, seedream4); `INFO_MODULES` dostają
 * swój odrębny język wizualny osobno, gdy zostanie ustalony.
 */
export const COURSES: CourseConfig[] = [
  {
    slug: 'klasa-4',
    title: 'Informatyka — klasa 4',
    tagline: 'Pierwszy rok informatyki w szkole podstawowej.',
    description:
      'Kurs zgodny z podstawą programową MEiN dla klasy 4. Cały program (10 działów) jest rozpisany, moduły „Start kursu” oraz „Komputer, pliki i chmura” są gotowe do przerobienia — kolejne udostępniamy stopniowo.',
    // Dopóki `INFO_MODULES` jest puste, liczby byłyby zerami — mówimy wprost, na jakim etapie jest kurs.
    stats:
      CURRICULUM_STATS.modules > 0
        ? [
            `${CURRICULUM_STATS.modules} modułów`,
            `${CURRICULUM_STATS.onlineLessons} lekcji online`,
            `${CURRICULUM_STATS.hours} h nauki`,
          ]
        : ['program w przygotowaniu'],
    color: '#7c3aed',
    icon: MonitorSmartphone,
    image: '/images/informatyka/kurs-klasa-4.jpg',
    imageAlt:
      'Kurs informatyki dla klasy 4 — mały robot, zamknięty laptop i nośniki danych (dyskietki, płyta, pendrive) na biurku',
    href: '/informatyka/klasa-4',
    ctaLabel: 'Zobacz kurs klasy 4',
    status: 'available',
  },
];
