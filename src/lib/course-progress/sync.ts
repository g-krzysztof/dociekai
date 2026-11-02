'use client';

/**
 * Synchronizacja postępu kursu z kontem — sieć + orkiestracja nad
 * `storage.ts`. Jedna implementacja dla wszystkich kursów; kurs wnosi tylko
 * swój magazyn i bazowy adres API.
 *
 * Zawsze najlepszy wysiłek: błąd sieci/backendu nigdy nie blokuje nauki, tylko
 * po cichu zostaje spróbowany przy kolejnej zmianie.
 */

import type { CourseProgressStorage, StoredLessonProgress } from './storage';
import { unionLessonProgress } from './storage';
import { getAuthToken } from '@/lib/auth-token';

export interface RemoteProgressEntry {
  moduleSlug: string;
  lessonSlug: string;
  completed: string[];
  total: number;
}

export interface CourseProgressSyncOptions {
  /** Magazyn tego kursu z `createCourseProgressStorage()`. */
  storage: CourseProgressStorage;
  /** Baza route'ów Next.js, np. `/api/math-progress` (sync leci na `<base>/sync`). */
  apiBase: string;
  /** Nazwa zdarzenia DOM po zmianie w tle — hook postępu kursu je nasłuchuje. */
  syncedEvent: string;
}

export interface CourseProgressSync {
  readonly SYNCED_EVENT: string;
  scheduleLessonSync(moduleSlug: string, lessonSlug: string, data: StoredLessonProgress): void;
  pullServerProgressOnce(): Promise<void>;
  mergeSessionIntoAccount(): Promise<void>;
  /**
   * Wylogowanie: najpierw wypchnięcie całego lokalnego postępu na konto, potem
   * czyszczenie. Kolejność jest istotna — `clearAll()` samo w sobie kasuje też
   * zmiany z ostatnich 1,5 s (debounce), które nigdy nie doleciały na serwer.
   */
  flushAndClearAll(): void;
  clearAll(): void;
}

/**
 * Token czytamy w chwili wywołania, bo przy wylogowaniu znika z localStorage
 * zanim ostatnia wysyłka zdąży dolecieć — `flushAndClearAll()` przechwytuje go
 * synchronicznie i podaje tutaj wprost.
 */
function authHeaders(token?: string | null): HeadersInit {
  const jwt = token !== undefined ? token : getAuthToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  return headers;
}

export function createCourseProgressSync({
  storage,
  apiBase,
  syncedEvent,
}: CourseProgressSyncOptions): CourseProgressSync {
  const pendingLessonSync = new Map<string, ReturnType<typeof setTimeout>>();
  let pulledThisLoad = false;

  const notifySynced = (): void => {
    window.dispatchEvent(new Event(syncedEvent));
  };

  const fetchServerProgress = async (): Promise<RemoteProgressEntry[]> => {
    try {
      const res = await fetch(apiBase, { headers: authHeaders() });
      if (!res.ok) return [];
      const json: unknown = await res.json();
      const data = (json as { data?: unknown })?.data;
      return Array.isArray(data) ? (data as RemoteProgressEntry[]) : [];
    } catch {
      return [];
    }
  };

  const pushServerProgress = async (
    entries: RemoteProgressEntry[],
    token?: string | null
  ): Promise<void> => {
    if (entries.length === 0) return;
    try {
      await fetch(`${apiBase}/sync`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ entries }),
      });
    } catch {
      /* najlepszy wysiłek — lokalny zapis już się udał, spróbujemy przy kolejnej zmianie */
    }
  };

  const toRemoteEntries = (local: Record<string, StoredLessonProgress>): RemoteProgressEntry[] =>
    Object.entries(local).map(([lessonKey, data]) => {
      const [moduleSlug, lessonSlug] = lessonKey.split('/');
      return { moduleSlug, lessonSlug, completed: data.completed, total: data.total };
    });

  const mergeRemoteIntoLocal = (
    local: Record<string, StoredLessonProgress>,
    remote: RemoteProgressEntry[]
  ): Record<string, StoredLessonProgress> => {
    const merged = { ...local };
    remote.forEach((entry) => {
      const lessonKey = `${entry.moduleSlug}/${entry.lessonSlug}`;
      merged[lessonKey] = unionLessonProgress(merged[lessonKey], {
        completed: entry.completed,
        total: entry.total,
      });
    });
    return merged;
  };

  // Zdefiniowane poza literałem obiektu, bo moduły kursów re-eksportują te
  // metody jako oderwane referencje (`export const clear = sync.clearAll`) —
  // `this` byłoby wtedy `undefined`.
  const clearAll = (): void => {
    storage.clear(window.localStorage);
    storage.clear(window.sessionStorage);
    pendingLessonSync.forEach((timeout) => clearTimeout(timeout));
    pendingLessonSync.clear();
    pulledThisLoad = false;
  };

  const flushAndClearAll = (): void => {
    // Token musi zostać przechwycony TERAZ: `logout()` usuwa go z
    // localStorage, a wysyłka poniżej jest asynchroniczna.
    const token = getAuthToken();
    const entries = toRemoteEntries(storage.readAll(window.localStorage));

    // Czyścimy synchronicznie, żeby UI od razu pokazał stan wylogowany;
    // wysyłka leci w tle z już odczytanych danych.
    clearAll();

    if (token) void pushServerProgress(entries, token);
  };

  return {
    SYNCED_EVENT: syncedEvent,

    /** Debounced wysyłka jednej lekcji do serwera — wywoływane po każdej zmianie kroku/bloku. */
    scheduleLessonSync(moduleSlug, lessonSlug, data) {
      const lessonKey = `${moduleSlug}/${lessonSlug}`;
      const existing = pendingLessonSync.get(lessonKey);
      if (existing) clearTimeout(existing);
      pendingLessonSync.set(
        lessonKey,
        setTimeout(() => {
          pendingLessonSync.delete(lessonKey);
          void pushServerProgress([{ moduleSlug, lessonSlug, ...data }]);
        }, 1500)
      );
    },

    /**
     * Doczytanie postępu z serwera dla już zalogowanego usera (np. dorobionego
     * na innym urządzeniu) — raz na czas życia karty, nie przy każdej nawigacji
     * między stronami kursu.
     */
    async pullServerProgressOnce() {
      if (pulledThisLoad) return;
      pulledThisLoad = true;

      const remote = await fetchServerProgress();
      if (remote.length === 0) return;

      const merged = mergeRemoteIntoLocal(storage.readAll(window.localStorage), remote);
      storage.writeAll(window.localStorage, merged);
      notifySynced();
    },

    /**
     * Wywoływane raz, tuż po zalogowaniu/rejestracji: postęp z bieżącej sesji
     * gościa trafia na konto. Kopiowanie sessionStorage → localStorage jest
     * synchroniczne (zanim serwer odpowie, UI już widzi właściwy stan — kod
     * przed pierwszym `await` w funkcji async wykonuje się od razu), scalenie z
     * tym, co już jest na koncie, i wysyłka na serwer — asynchroniczne. Na
     * końcu sessionStorage jest czyszczony: od teraz jedynym magazynem jest
     * localStorage.
     */
    async mergeSessionIntoAccount() {
      storage.copy(window.sessionStorage, window.localStorage);

      const remote = await fetchServerProgress();
      const merged = mergeRemoteIntoLocal(storage.readAll(window.localStorage), remote);
      storage.writeAll(window.localStorage, merged);
      storage.clear(window.sessionStorage);
      pulledThisLoad = true;

      await pushServerProgress(toRemoteEntries(merged));
      notifySynced();
    },

    flushAndClearAll,

    /** Pełne czyszczenie bez wysyłki — po odrzuceniu tokena (401) nie ma czym się uwierzytelnić. */
    clearAll,
  };
}
