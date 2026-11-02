/**
 * Magazyn postępu kursu informatyki — cienka warstwa nad wspólną implementacją
 * z `@/lib/course-progress/storage`, dokładnie tak jak w matematyce. Tutaj stoi
 * tylko to, co odróżnia ten kurs: prefiks klucza
 * (`dociekai:info-lesson:<moduł>/<lekcja>`), inny niż matematyczny
 * (`dociekai:math-lesson:`), więc kursy różnych przedmiotów nie mieszają sobie
 * postępu.
 *
 * Nie ma tu odpowiednika `migrateLegacyAnonymousProgress` z matematyki: ten
 * kurs od pierwszej lekcji trzymał postęp gościa w `sessionStorage`, więc nie
 * istnieją anonimowe dane do przejęcia z `localStorage`.
 *
 * Sieć i orkiestracja logowania są w `progress-sync.ts`.
 */

import {
  createCourseProgressStorage,
  getProgressStore,
  unionLessonProgress,
  type StoredLessonProgress,
} from '@/lib/course-progress/storage';

export const INFO_PROGRESS_PREFIX = 'dociekai:info-lesson:';

/** Magazyn tego kursu — używa go też `progress-sync.ts`. */
export const infoProgressStorage = createCourseProgressStorage(INFO_PROGRESS_PREFIX);

export const readInfoProgressEntry = infoProgressStorage.readEntry;
export const writeInfoProgressEntry = infoProgressStorage.writeEntry;
export const readAllInfoProgress = infoProgressStorage.readAll;
export const writeAllInfoProgress = infoProgressStorage.writeAll;
export const clearInfoProgress = infoProgressStorage.clear;
export const copyInfoProgress = infoProgressStorage.copy;

export { getProgressStore, unionLessonProgress };
export type { StoredLessonProgress };
