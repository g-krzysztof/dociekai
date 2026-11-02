/**
 * Magazyn postępu kursu języka polskiego — cienka warstwa nad wspólną implementacją
 * z `@/lib/course-progress/storage`, bliźniacza do historii. Tu stoi tylko
 * prefiks klucza (`dociekai:pol-lesson:<moduł>/<lekcja>`), inny niż
 * `dociekai:math-lesson:`, `dociekai:info-lesson:` i `dociekai:hist-lesson:`,
 * więc przedmioty nie mieszają sobie postępu. Sieć i orkiestracja logowania:
 * `progress-sync.ts`.
 */

import {
  createCourseProgressStorage,
  getProgressStore,
  unionLessonProgress,
  type StoredLessonProgress,
} from '@/lib/course-progress/storage';

export const POL_PROGRESS_PREFIX = 'dociekai:pol-lesson:';

/** Magazyn tego kursu — używa go też `progress-sync.ts`. */
export const polProgressStorage = createCourseProgressStorage(POL_PROGRESS_PREFIX);

export const readPolProgressEntry = polProgressStorage.readEntry;
export const writePolProgressEntry = polProgressStorage.writeEntry;
export const readAllPolProgress = polProgressStorage.readAll;
export const writeAllPolProgress = polProgressStorage.writeAll;
export const clearPolProgress = polProgressStorage.clear;
export const copyPolProgress = polProgressStorage.copy;

export { getProgressStore, unionLessonProgress };
export type { StoredLessonProgress };
