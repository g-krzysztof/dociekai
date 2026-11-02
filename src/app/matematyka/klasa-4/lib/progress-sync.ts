'use client';

/**
 * Synchronizacja postępu kursu matematyki z kontem — cienka warstwa nad wspólną
 * implementacją z `@/lib/course-progress/sync`. Tutaj stoi tylko to, co
 * odróżnia ten kurs: magazyn, adres API i nazwa zdarzenia DOM.
 */

import { createCourseProgressSync } from '@/lib/course-progress/sync';
import { mathProgressStorage } from './progress-storage';

/** Zdarzenie DOM wysyłane po każdej zmianie postępu w tle (merge/pull) — `useMathProgress` je nasłuchuje. */
export const MATH_PROGRESS_SYNCED_EVENT = 'dociekai:math-progress-synced';

const sync = createCourseProgressSync({
  storage: mathProgressStorage,
  apiBase: '/api/math-progress',
  syncedEvent: MATH_PROGRESS_SYNCED_EVENT,
});

export const scheduleLessonSync = sync.scheduleLessonSync;
export const pullServerProgressOnce = sync.pullServerProgressOnce;
export const mergeSessionIntoAccount = sync.mergeSessionIntoAccount;
export const clearAllMathCourseProgress = sync.clearAll;
export const flushAndClearAllMathCourseProgress = sync.flushAndClearAll;
