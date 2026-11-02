/**
 * Półka w magazynie przeglądarki — jak postęp kursu: gość `sessionStorage`,
 * konto `localStorage`. Synchronizacja z kontem: `polka/sync.ts`.
 */

import { EMPTY_SHELF, type ShelfRecord } from './types';
import { mergeShelves, parseShelf } from './model';

export const SHELF_KEY = 'dociekai:pol-shelf';
/** Zdarzenie DOM po każdej zmianie Półki — `useShelf` je nasłuchuje. */
export const SHELF_CHANGED_EVENT = 'dociekai:pol-shelf-changed';

export function readShelf(store: Storage): ShelfRecord {
  try {
    const raw = store.getItem(SHELF_KEY);
    return raw ? parseShelf(JSON.parse(raw)) : { v: 1, entries: {} };
  } catch {
    return { v: 1, entries: {} };
  }
}

export function writeShelf(store: Storage, rec: ShelfRecord): void {
  try {
    if (Object.keys(rec.entries).length === 0) store.removeItem(SHELF_KEY);
    else store.setItem(SHELF_KEY, JSON.stringify(rec));
  } catch {
    // Pełny albo zablokowany magazyn: zmiana zostaje tylko na ekranie.
  }
  window.dispatchEvent(new Event(SHELF_CHANGED_EVENT));
}

/** Logowanie: półka gościa (ta karta) dołącza do półki konta na tym urządzeniu. */
export function adoptSessionShelf(): ShelfRecord {
  try {
    const session = readShelf(window.sessionStorage);
    const merged = mergeShelves(readShelf(window.localStorage), session);
    if (Object.keys(session.entries).length) {
      writeShelf(window.localStorage, merged);
      window.sessionStorage.removeItem(SHELF_KEY);
    }
    return merged;
  } catch {
    return EMPTY_SHELF;
  }
}

/** Wylogowanie: półka znika z przeglądarki (na koncie zostaje kopia z serwera, gdy backend istnieje). */
export function clearShelf(): void {
  try {
    window.localStorage.removeItem(SHELF_KEY);
    window.sessionStorage.removeItem(SHELF_KEY);
  } catch {
    // jw.
  }
  window.dispatchEvent(new Event(SHELF_CHANGED_EVENT));
}
