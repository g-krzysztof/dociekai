/**
 * Półka czytelnika (E5a) — stan między lekcjami dla czytania, odpowiednik Osi
 * dziejów z historii. Zakładana w L2, rośnie przez cały rok.
 *
 * **Tylko wartości zamknięte** (D3): które teksty, plan, przeczytane odcinki,
 * zakładka, wskazówka „wciągacza” i uczucie z palety. Dlatego Półka może się
 * synchronizować z kontem. Każdy wolny tekst dziecka (np. zdanie pierwszego
 * wrażenia) żyje w **Teczce** — tylko na urządzeniu.
 *
 * Scalanie dwóch urządzeń jest przemienne: przeczytane odcinki to suma
 * zbiorów, pola z `updatedAt` rozstrzyga „nowszy wygrywa”.
 */

export type ShelfStatus = 'czytam' | 'odlozona' | 'przeczytana';

export interface Stamped<T> {
  value: T;
  updatedAt: number;
}

export interface ShelfEntry {
  /** Id książki z Czytelni (`brzydkie-kaczatko`) albo `lekcja:<moduł>/<lekcja>` dla krótkiego tekstu z lekcji. */
  bookId: string;
  kind: 'czytelnia' | 'lekcja';
  /** Kiedy stanęła na półce (ms) — przy scalaniu wygrywa wcześniejsza. */
  addedAt: number;
  /** Przeczytane odcinki (numery `n`) — tylko przybywają. */
  done: number[];
  status?: Stamped<ShelfStatus>;
  /** Plan czytania: lokalna data `YYYY-MM-DD` → ile odcinków tego dnia. */
  plan?: Stamped<Record<string, number>>;
  /** Gdzie skończyło się czytanie: odcinek i zdanie (`unitId`). */
  bookmark?: Stamped<{ n: number; unit: string }>;
  /** Pierwsze wrażenie: wskazówka 0–100 („nudno” → „nie mogę się oderwać”) i uczucie z palety (id). */
  impression?: Stamped<{ gauge: number; feeling?: string }>;
}

export interface ShelfRecord {
  v: 1;
  entries: Record<string, ShelfEntry>;
}

/** Pusta półka do stanu początkowego Reacta — tylko do czytania (`Object.freeze`). */
export const EMPTY_SHELF: ShelfRecord = Object.freeze({ v: 1, entries: Object.freeze({}) }) as ShelfRecord;
