'use client';

/**
 * Synchronizacja postępu kursu historii z kontem — cienka warstwa nad
 * `@/lib/course-progress/sync`, bliźniacza do informatyki: tylko magazyn,
 * adres API i nazwa zdarzenia DOM. Backendu (Strapi) jeszcze nie ma — trasy
 * `/api/hist-progress` zwracają wtedy `{ data: [] }`, a kurs działa na
 * `localStorage` (konto) i `sessionStorage` (gość). Kontrakt ten sam co
 * w `docs/info-progress-backend.md`, z nazwą kolekcji `hist-progress`.
 */

import { createCourseProgressSync } from '@/lib/course-progress/sync';
import { histProgressStorage } from './progress-storage';
import { adoptSessionPersonalPins, clearPersonalPins } from './timeline/personal-storage';

/** Zdarzenie DOM wysyłane po każdej zmianie postępu w tle (merge/pull) — `useHistProgress` je nasłuchuje. */
export const HIST_PROGRESS_SYNCED_EVENT = 'dociekai:hist-progress-synced';

const sync = createCourseProgressSync({
  storage: histProgressStorage,
  apiBase: '/api/hist-progress',
  syncedEvent: HIST_PROGRESS_SYNCED_EVENT,
});

export const scheduleLessonSync = sync.scheduleLessonSync;
export const pullServerProgressOnce = sync.pullServerProgressOnce;

// Pinezki osobiste Osi dziejów (rok urodzenia, lata rodzinne) jadą razem z
// postępem przy logowaniu i znikają razem z nim przy wylogowaniu — ale nigdy
// nie idą na serwer (`timeline/personal-storage.ts`).

export async function mergeSessionIntoAccount(): Promise<void> {
  adoptSessionPersonalPins(new Date().getFullYear());
  await sync.mergeSessionIntoAccount();
}

export function clearAllHistCourseProgress(): void {
  clearPersonalPins();
  sync.clearAll();
}

export function flushAndClearAllHistCourseProgress(): void {
  clearPersonalPins();
  sync.flushAndClearAll();
}
