/**
 * Magazyn postępu kursu w przeglądarce — jedna implementacja dla wszystkich
 * kursów przedmiotowych (`/matematyka`, `/informatyka`, kolejne).
 *
 * Kurs wnosi tylko **prefiks klucza**; cała reszta (format wpisu, wybór
 * magazynu, scalanie, czyszczenie) jest wspólna, bo obie strony trzymają
 * dokładnie to samo: listę id-ków ukończonych kroków/bloków lekcji i liczbę
 * kroków całej lekcji. Nic tu nie zna Reacta ani sieci — patrz `sync.ts`.
 *
 * UWAGA na przyszłość: prefiks rozróżnia PRZEDMIOT, nie rocznik — gdy powstanie
 * ten sam przedmiot dla klasy 5, lekcja o tym samym slugu nadpisze wpis z
 * klasy 4. Wtedy do prefiksu trzeba dołożyć segment kursu.
 */

export interface StoredLessonProgress {
  /** Identyfikatory ukończonych kroków/bloków lekcji. */
  completed: string[];
  /** Ile kroków/bloków ma cała lekcja — 0, gdy lekcja jeszcze tego nie zgłosiła. */
  total: number;
}

/** Gość (bez konta) trzyma postęp tylko na czas karty — konto dostaje trwały cache w localStorage. */
export function getProgressStore(isAuthenticated: boolean): Storage {
  return isAuthenticated ? window.localStorage : window.sessionStorage;
}

/** Suma dwóch zapisów tej samej lekcji — kroki się tylko dodają, nigdy nie znikają. */
export function unionLessonProgress(
  a: StoredLessonProgress | null | undefined,
  b: StoredLessonProgress | null | undefined
): StoredLessonProgress {
  return {
    completed: Array.from(new Set([...(a?.completed ?? []), ...(b?.completed ?? [])])),
    total: Math.max(a?.total ?? 0, b?.total ?? 0),
  };
}

function parseStoredProgress(raw: string): StoredLessonProgress {
  const parsed: unknown = JSON.parse(raw);
  // Starszy zapis matematyki (przed dodaniem `total`) to goła tablica id-ków.
  const rawCompleted = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as { completed?: unknown })?.completed)
      ? (parsed as { completed: unknown[] }).completed
      : [];
  const total = Array.isArray(parsed) ? 0 : Number((parsed as { total?: unknown })?.total) || 0;
  return { completed: rawCompleted.filter((id): id is string => typeof id === 'string'), total };
}

export interface CourseProgressStorage {
  /** Prefiks kluczy tego kursu, np. `dociekai:math-lesson:`. */
  readonly prefix: string;
  readEntry(store: Storage, moduleSlug: string, lessonSlug: string): StoredLessonProgress | null;
  writeEntry(store: Storage, moduleSlug: string, lessonSlug: string, data: StoredLessonProgress): void;
  /** Wszystkie wpisy w danym magazynie, kluczowane `<moduł>/<lekcja>` (jak `lessonProgressKey`). */
  readAll(store: Storage): Record<string, StoredLessonProgress>;
  writeAll(store: Storage, entries: Record<string, StoredLessonProgress>): void;
  /** Czyści cały postęp tego kursu w danym magazynie — używane przy wylogowaniu. */
  clear(store: Storage): void;
  /** Kopiuje (scalając) cały postęp z jednego magazynu do drugiego, bez czyszczenia źródła. */
  copy(from: Storage, to: Storage): void;
  /**
   * Jednorazowe przejęcie postępu sprzed wprowadzenia sesyjnego trybu gościa:
   * dawniej localStorage był jedynym magazynem, więc u obecnych anonimowych
   * userów mogą tam leżeć prawdziwe dane. Jeśli tak, przenosimy je (scalając)
   * do sessionStorage bieżącej karty, żeby wdrożenie nie wyglądało jak nagłe
   * wyzerowanie postępu, i czyścimy stare klucze z localStorage. Bezpieczne do
   * wywołania wielokrotnie — po pierwszym przejęciu jest no-opem.
   */
  adoptLegacyAnonymous(): void;
}

export function createCourseProgressStorage(prefix: string): CourseProgressStorage {
  const keyFor = (moduleSlug: string, lessonSlug: string) => `${prefix}${moduleSlug}/${lessonSlug}`;

  const allKeys = (store: Storage): string[] => {
    const keys: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (key?.startsWith(prefix)) keys.push(key);
    }
    return keys;
  };

  const readAll = (store: Storage): Record<string, StoredLessonProgress> => {
    const result: Record<string, StoredLessonProgress> = {};
    allKeys(store).forEach((key) => {
      try {
        const raw = store.getItem(key);
        if (raw) result[key.slice(prefix.length)] = parseStoredProgress(raw);
      } catch {
        /* pomijamy uszkodzony wpis */
      }
    });
    return result;
  };

  const writeAll = (store: Storage, entries: Record<string, StoredLessonProgress>): void => {
    Object.entries(entries).forEach(([lessonKey, data]) => {
      try {
        store.setItem(`${prefix}${lessonKey}`, JSON.stringify(data));
      } catch {
        /* zapis postępu jest opcjonalny */
      }
    });
  };

  const clear = (store: Storage): void => {
    allKeys(store).forEach((key) => store.removeItem(key));
  };

  const mergeInto = (source: Record<string, StoredLessonProgress>, to: Storage): void => {
    const merged: Record<string, StoredLessonProgress> = { ...readAll(to) };
    Object.entries(source).forEach(([lessonKey, data]) => {
      merged[lessonKey] = unionLessonProgress(merged[lessonKey], data);
    });
    writeAll(to, merged);
  };

  return {
    prefix,

    readEntry(store, moduleSlug, lessonSlug) {
      try {
        const raw = store.getItem(keyFor(moduleSlug, lessonSlug));
        return raw ? parseStoredProgress(raw) : null;
      } catch {
        return null;
      }
    },

    writeEntry(store, moduleSlug, lessonSlug, data) {
      try {
        store.setItem(keyFor(moduleSlug, lessonSlug), JSON.stringify(data));
      } catch {
        /* zapis postępu jest opcjonalny */
      }
    },

    readAll,
    writeAll,
    clear,

    copy(from, to) {
      const source = readAll(from);
      if (Object.keys(source).length === 0) return;
      mergeInto(source, to);
    },

    adoptLegacyAnonymous() {
      const legacy = readAll(window.localStorage);
      if (Object.keys(legacy).length === 0) return;
      mergeInto(legacy, window.sessionStorage);
      clear(window.localStorage);
    },
  };
}
