/**
 * Magazyn postępu kursu historii — cienka warstwa nad wspólną implementacją
 * z `@/lib/course-progress/storage`, bliźniacza do informatyki. Tu stoi tylko
 * prefiks klucza (`dociekai:hist-lesson:<moduł>/<lekcja>`), inny niż
 * `dociekai:math-lesson:` i `dociekai:info-lesson:`, więc przedmioty nie
 * mieszają sobie postępu. Sieć i orkiestracja logowania: `progress-sync.ts`.
 */

import {
  createCourseProgressStorage,
  getProgressStore,
  unionLessonProgress,
  type StoredLessonProgress,
} from '@/lib/course-progress/storage';

export const HIST_PROGRESS_PREFIX = 'dociekai:hist-lesson:';

/** Magazyn tego kursu — używa go też `progress-sync.ts`. */
export const histProgressStorage = createCourseProgressStorage(HIST_PROGRESS_PREFIX);

export const readHistProgressEntry = histProgressStorage.readEntry;
export const writeHistProgressEntry = histProgressStorage.writeEntry;
export const readAllHistProgress = histProgressStorage.readAll;
export const writeAllHistProgress = histProgressStorage.writeAll;
export const clearHistProgress = histProgressStorage.clear;
export const copyHistProgress = histProgressStorage.copy;

export { getProgressStore, unionLessonProgress };
export type { StoredLessonProgress };
