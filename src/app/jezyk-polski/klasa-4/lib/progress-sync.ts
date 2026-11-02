'use client';

/**
 * Synchronizacja postępu kursu języka polskiego z kontem — cienka warstwa nad
 * `@/lib/course-progress/sync`, bliźniacza do historii: tylko magazyn,
 * adres API i nazwa zdarzenia DOM. Backendu (Strapi) jeszcze nie ma — trasy
 * `/api/pol-progress` zwracają wtedy `{ data: [] }`, a kurs działa na
 * `localStorage` (konto) i `sessionStorage` (gość). Kontrakt ten sam co
 * w `docs/info-progress-backend.md`, z nazwą kolekcji `pol-progress`.
 *
 * Kurs nie wysyła na serwer niczego poza postępem bloków i Półką —
 * teksty dziecka i Teczka autora zostają na urządzeniu. Półka (tylko
 * wartości zamknięte) synchronizuje się przez `/api/pol-shelf`
 * (`lib/polka/sync.ts`); Teczka i Wyspa nie wychodzą z urządzenia
 * i znikają przy wylogowaniu.
 */

import { createCourseProgressSync } from '@/lib/course-progress/sync';
import { adoptSessionShelf, clearShelf, readShelf } from './polka/storage';
import { flushShelfSync, pullServerShelfOnce, resetShelfSync, scheduleShelfSync } from './polka/sync';
import { adoptSessionTeczka, clearTeczka } from './teczka/storage';
import { adoptSessionWyspa, clearWyspa } from './wyspa/storage';
import { polProgressStorage } from './progress-storage';

/** Zdarzenie DOM wysyłane po każdej zmianie postępu w tle (merge/pull) — `usePolProgress` je nasłuchuje. */
export const POL_PROGRESS_SYNCED_EVENT = 'dociekai:pol-progress-synced';

const sync = createCourseProgressSync({
  storage: polProgressStorage,
  apiBase: '/api/pol-progress',
  syncedEvent: POL_PROGRESS_SYNCED_EVENT,
});

export const scheduleLessonSync = sync.scheduleLessonSync;
export const pullServerProgressOnce = sync.pullServerProgressOnce;

export async function mergeSessionIntoAccount(): Promise<void> {
  adoptSessionTeczka();
  // Wyspa (imiona i nazwa wpisane przez dziecko) też zostaje na urządzeniu, jak Teczka.
  adoptSessionWyspa();
  adoptSessionShelf();
  await sync.mergeSessionIntoAccount();
  void pullServerShelfOnce();
  if (Object.keys(readShelf(window.localStorage).entries).length > 0) {
    scheduleShelfSync(readShelf(window.localStorage));
  }
}

export function clearAllPolCourseProgress(): void {
  resetShelfSync();
  clearShelf();
  clearTeczka();
  clearWyspa(); // jak Teczka: nigdy na serwer, znika przy wylogowaniu
  sync.clearAll();
}

export function flushAndClearAllPolCourseProgress(): void {
  flushShelfSync();
  sync.flushAndClearAll();
  resetShelfSync();
  clearShelf();
  clearTeczka();
  clearWyspa(); // jak Teczka: nigdy na serwer, znika przy wylogowaniu
}
