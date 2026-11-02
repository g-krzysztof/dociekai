'use client';

/**
 * Synchronizacja postępu kursu informatyki z kontem — cienka warstwa nad
 * wspólną implementacją z `@/lib/course-progress/sync`, bliźniacza do
 * `matematyka/klasa-4/lib/progress-sync.ts`. Tutaj stoi tylko to, co odróżnia
 * ten kurs: magazyn, adres API i nazwa zdarzenia DOM.
 *
 * Backend (Strapi) opisuje `docs/info-progress-backend.md`. Dopóki go nie ma,
 * route'y Next.js zwracają `{ data: [] }` i kurs działa jak dotąd — postęp
 * konta żyje w `localStorage`, postęp gościa w `sessionStorage`.
 */

import { createCourseProgressSync } from '@/lib/course-progress/sync';
import { infoProgressStorage } from './progress-storage';

/** Zdarzenie DOM wysyłane po każdej zmianie postępu w tle (merge/pull) — `useInfoProgress` je nasłuchuje. */
export const INFO_PROGRESS_SYNCED_EVENT = 'dociekai:info-progress-synced';

const sync = createCourseProgressSync({
  storage: infoProgressStorage,
  apiBase: '/api/info-progress',
  syncedEvent: INFO_PROGRESS_SYNCED_EVENT,
});

export const scheduleLessonSync = sync.scheduleLessonSync;
export const pullServerProgressOnce = sync.pullServerProgressOnce;
export const mergeSessionIntoAccount = sync.mergeSessionIntoAccount;
export const clearAllInfoCourseProgress = sync.clearAll;
export const flushAndClearAllInfoCourseProgress = sync.flushAndClearAll;
