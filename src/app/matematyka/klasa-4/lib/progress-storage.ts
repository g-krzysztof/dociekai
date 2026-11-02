/**
 * Magazyn postępu kursu matematyki — cienka warstwa nad wspólną implementacją
 * z `@/lib/course-progress/storage`. Tutaj stoi tylko to, co odróżnia ten kurs
 * od innych: prefiks klucza (`dociekai:math-lesson:<moduł>/<lekcja>`).
 *
 * Sieć i orkiestracja logowania są w `progress-sync.ts`.
 */

import {
  createCourseProgressStorage,
  getProgressStore,
  unionLessonProgress,
  type StoredLessonProgress,
} from '@/lib/course-progress/storage';

export const MATH_PROGRESS_PREFIX = 'dociekai:math-lesson:';

/** Magazyn tego kursu — używa go też `progress-sync.ts`. */
export const mathProgressStorage = createCourseProgressStorage(MATH_PROGRESS_PREFIX);

export const readMathProgressEntry = mathProgressStorage.readEntry;
export const writeMathProgressEntry = mathProgressStorage.writeEntry;
export const readAllMathProgress = mathProgressStorage.readAll;
export const writeAllMathProgress = mathProgressStorage.writeAll;
export const clearMathProgress = mathProgressStorage.clear;
export const copyMathProgress = mathProgressStorage.copy;
/** Przejęcie postępu anonimowego sprzed wprowadzenia trybu sesyjnego — patrz `adoptLegacyAnonymous()`. */
export const migrateLegacyAnonymousProgress = mathProgressStorage.adoptLegacyAnonymous;

export { getProgressStore, unionLessonProgress };
export type { StoredLessonProgress };
