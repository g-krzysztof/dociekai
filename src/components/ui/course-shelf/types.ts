/**
 * Wspólny kontrakt „półki roku" — kształt danych, których potrzebują
 * `YearShelf` i `YearProgressRail`, niezależnie od przedmiotu.
 *
 * Komponenty półki nie importują już danych żadnego kursu: matematyka podaje
 * swoje `MathModule`/`MathLesson`, informatyka swoje `InfoModule`/`InfoLesson`,
 * a typy poniżej opisują tylko to, czego półka faktycznie używa. Struktura
 * obu kursów jest zgodna, więc nie trzeba niczego mapować.
 */

export type ShelfStatus = 'available' | 'soon';
export type ShelfProgressStatus = 'not-started' | 'in-progress' | 'done';

export interface ShelfModule {
  number: number;
  slug: string;
  title: string;
  goal: string;
  /** Odcinek roku — dopasowywany do `ShelfGroup.track`. */
  track: string;
  hours: string;
  weeks: string;
  color: string;
  /** Nazwa ikony z lucide-react (patrz `@/components/ui/module-icon`). */
  icon: string;
  /** Opcjonalna: kurs bez ustalonego języka wizualnego renderuje panel bez obrazka. */
  image?: string;
  /** Jednostki tematyczne — półka używa tylko ich liczby. */
  lessons: string[];
  status: ShelfStatus;
}

export interface ShelfLesson {
  moduleSlug: string;
  slug: string;
  number: number;
  short: string;
  duration: string;
  status: ShelfStatus;
  /** Typ treści kursu — półka używa go tylko przez prop `isAuxiliary`. */
  kind?: string;
}

/** Odcinek roku z podpisem — kolejność tablicy wyznacza kolejność na półce. */
export interface ShelfGroup {
  track: string;
  label: string;
  weeks: string;
}

export interface ShelfLessonProgress {
  status: ShelfProgressStatus;
  done: number;
  total: number;
}

export interface ShelfModuleProgress {
  status: ShelfProgressStatus;
  doneLessons: number;
  totalLessons: number;
}

export interface ShelfCourseProgress {
  doneLessons: number;
  totalLessons: number;
  doneModules: number;
  totalModulesWithLessons: number;
}

/** Klucz mapy postępu lekcji — ten sam format w obu kursach. */
export function shelfLessonKey(moduleSlug: string, lessonSlug: string): string {
  return `${moduleSlug}/${lessonSlug}`;
}

/** Polska odmiana rzeczownika „temat”: 1 temat, 2–4 tematy, 5+ tematów. */
export function topicsWord(count: number): string {
  if (count === 1) return 'temat';
  const last = count % 10;
  const lastTwo = count % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'tematy';
  return 'tematów';
}
