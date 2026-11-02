/**
 * Magazyn serii. Jeden klucz, jeden kształt, bez niczego zagregowanego —
 * wszystkie liczby, które widać na ekranie, powstają z tego zapisu w `derive.ts`.
 *
 * Seria żyje wyłącznie na koncie (`localStorage` jako cache serwera). Gość ma
 * postęp w `sessionStorage`, który ginie razem z kartą, więc seria dla gościa
 * byłaby obietnicą nie do dotrzymania — zamiast niej dostaje zaproszenie na
 * karcie końcowej lekcji.
 */

import type { LessonKey, StreakRecord } from './types';
import { EMPTY_RECORD } from './derive';

export const STREAK_KEY = 'dociekai:streak';

function isDateKey(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseRecord(raw: string): StreakRecord {
  const parsed: unknown = JSON.parse(raw);
  const source = (parsed ?? {}) as Partial<StreakRecord>;

  const days: Record<string, LessonKey[]> = {};
  Object.entries(source.days ?? {}).forEach(([date, lessons]) => {
    if (!isDateKey(date) || !Array.isArray(lessons)) return;
    const clean = lessons.filter((key): key is string => typeof key === 'string');
    if (clean.length > 0) days[date] = Array.from(new Set(clean));
  });

  return {
    days,
    legacy: Array.isArray(source.legacy)
      ? Array.from(new Set(source.legacy.filter((key): key is string => typeof key === 'string')))
      : [],
    breaks: Array.isArray(source.breaks)
      ? source.breaks.filter(
          (range): range is [string, string] =>
            Array.isArray(range) && range.length === 2 && range.every(isDateKey)
        )
      : [],
  };
}

export function readStreakRecord(): StreakRecord {
  try {
    const raw = window.localStorage.getItem(STREAK_KEY);
    return raw ? parseRecord(raw) : { ...EMPTY_RECORD };
  } catch {
    return { ...EMPTY_RECORD };
  }
}

export function writeStreakRecord(record: StreakRecord): void {
  try {
    window.localStorage.setItem(STREAK_KEY, JSON.stringify(record));
  } catch {
    /* zapis serii jest opcjonalny — nauka nigdy nie może się o niego wywrócić */
  }
}

/**
 * Suma dwóch zapisów. Dni i lekcje tylko przybywają, nigdy nie znikają — ta sama
 * reguła co `unionLessonProgress()` w kursach. Dzięki niej dwa urządzenia nie
 * mają czego rozstrzygać: scalenie jest przemienne i nie gubi niczyjej pracy.
 */
export function mergeRecords(a: StreakRecord, b: StreakRecord): StreakRecord {
  const days: Record<string, LessonKey[]> = { ...a.days };
  Object.entries(b.days).forEach(([date, lessons]) => {
    days[date] = Array.from(new Set([...(days[date] ?? []), ...lessons]));
  });

  const breakKey = (range: [string, string]) => range.join('/');
  const breaks = new Map(a.breaks.map((range) => [breakKey(range), range]));
  b.breaks.forEach((range) => breaks.set(breakKey(range), range));

  return {
    days,
    legacy: Array.from(new Set([...a.legacy, ...b.legacy])),
    breaks: [...breaks.values()],
  };
}

/** Dopisuje lekcję do danego dnia. Zwraca `null`, gdy nic się nie zmieniło. */
export function withLesson(
  record: StreakRecord,
  date: string,
  lessonKey: LessonKey
): StreakRecord | null {
  const existing = record.days[date] ?? [];
  if (existing.includes(lessonKey)) return null;
  return { ...record, days: { ...record.days, [date]: [...existing, lessonKey] } };
}

export function clearStreak(): void {
  try {
    window.localStorage.removeItem(STREAK_KEY);
  } catch {
    /* nic do posprzątania */
  }
}
