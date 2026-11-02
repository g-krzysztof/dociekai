/**
 * Czysta matematyka serii: z surowej listy dni powstaje wszystko, co widać na
 * ekranie. Bez Reacta, bez `window`, bez sieci — dzięki temu daje się przejść
 * skryptem (`scripts/streak-selftest.mjs`) po wszystkich krawędziach, których
 * nie da się wyklikać: przełom roku, zmiana czasu, zamrażarka na granicy
 * tygodnia, ferie, powrót po miesiącu.
 *
 * Algorytm to jedno przejście w przód, od pierwszego aktywnego dnia do dziś.
 * Odtwarzanie od początku zamiast trzymania licznika kosztuje ~300 iteracji na
 * rok i w zamian gwarantuje, że seria zawsze zgadza się z dniami — nawet gdy
 * dane dojdą z innego urządzenia w środku tygodnia.
 */

import {
  addDays,
  daysBetween,
  isRestDay,
  isWeekend,
  schoolYearStart,
  todayKey,
  weekdayIndex,
  weekKey,
  weekStart,
} from './school-calendar';
import type { DayCell, DayState, StreakRecord, StreakSnapshot, WeekColumn } from './types';

/** Zamrażarki odnawiają się co poniedziałek. Dwie wystarczą na wpadkę, nie na nawyk. */
export const FREEZES_PER_WEEK = 2;

/** Progi odznak rytmu. 180 to tyle dni nauki, ile ma polski rok szkolny. */
export const RHYTHM_MILESTONES = [3, 5, 10, 20, 40, 60, 100, 180] as const;

export const EMPTY_RECORD: StreakRecord = { days: {}, legacy: [], breaks: [] };

function courseOf(lessonKey: string): string {
  return lessonKey.split('/')[0] ?? '';
}

/** Ostatni dzień taśmy roku — 30 czerwca, czyli koniec zajęć. */
function schoolYearEnd(start: string): string {
  return `${Number(start.slice(0, 4)) + 1}-06-30`;
}

export function deriveStreak(record: StreakRecord, today: string = todayKey()): StreakSnapshot {
  const { days, breaks } = record;
  const activeDates = Object.keys(days)
    .filter((date) => (days[date]?.length ?? 0) > 0)
    .sort();

  const states = new Map<string, DayState>();
  const milestones = new Map<number, string>();
  const freezeUse = new Map<string, number>();

  let streak = 0;
  let longest = 0;
  let longestEndedOn: string | null = null;
  let weekendDays = 0;
  let mondayDays = 0;
  let twoSubjectDays = 0;
  let returns = 0;
  let previousActive: string | null = null;
  /** Dni zamrożone od ostatniego dnia nauki — jeśli passa i tak pęknie, nie uratowały niczego. */
  let frozenRun: string[] = [];

  const first = activeDates[0];
  // Replay kończy się na dziś, ale gdy ostatnia aktywność jest w przyszłości
  // (przestawiony zegar, dane z innego urządzenia), i tak ją domykamy.
  const last = activeDates[activeDates.length - 1];
  const end = first ? (last > today ? last : today) : today;

  for (let cursor = first; cursor && cursor <= end; cursor = addDays(cursor, 1)) {
    const lessons = days[cursor] ?? [];

    if (lessons.length > 0) {
      streak += 1;
      states.set(cursor, 'done');
      if (!milestones.has(streak)) milestones.set(streak, cursor);
      if (streak > longest) {
        longest = streak;
        longestEndedOn = cursor;
      }

      if (isWeekend(cursor)) weekendDays += 1;
      if (weekdayIndex(cursor) === 0) mondayDays += 1;
      if (new Set(lessons.map(courseOf)).size > 1) twoSubjectDays += 1;
      if (previousActive && daysBetween(previousActive, cursor) >= 7) returns += 1;
      previousActive = cursor;
      frozenRun = [];
      continue;
    }

    if (isRestDay(cursor, breaks)) {
      states.set(cursor, 'rest');
      continue;
    }

    if (cursor === today) {
      // Dzień jeszcze trwa — brak lekcji o 9 rano nie jest przegraną.
      states.set(cursor, 'pending');
      continue;
    }

    if (streak > 0) {
      const week = weekKey(cursor);
      const used = freezeUse.get(week) ?? 0;
      if (used < FREEZES_PER_WEEK) {
        freezeUse.set(week, used + 1);
        states.set(cursor, 'frozen');
        frozenRun.push(cursor);
        continue;
      }
      // Passa pękła mimo zamrażarek: tamte dni też przepadły, a zamrażarki
      // wracają do budżetu tygodnia — inaczej pasek mówiłby „uratowane” obok
      // serii, która właśnie spadła do zera.
      for (const date of frozenRun) {
        states.set(date, 'missed');
        const w = weekKey(date);
        freezeUse.set(w, (freezeUse.get(w) ?? 1) - 1);
      }
      frozenRun = [];
      streak = 0;
    }
    states.set(cursor, 'missed');
  }

  // Konto bez ani jednego dnia nie wchodzi w pętlę powyżej (nie ma od czego
  // zacząć), więc dzisiejszy dzień zostałby „poza zakresem”. A dziś jest dziś:
  // dzień nauki bez lekcji to dzień otwarty, nie dzień pusty.
  if (!states.has(today) && !isRestDay(today, breaks)) {
    states.set(today, 'pending');
  }

  const cellAt = (date: string): DayCell => ({
    date,
    state: states.get(date) ?? 'blank',
    lessons: days[date] ?? [],
  });

  const currentWeekStart = weekStart(today);
  const week = Array.from({ length: 7 }, (_, i) => cellAt(addDays(currentWeekStart, i)));

  const yearStart = schoolYearStart(today);
  const yearEnd = schoolYearEnd(yearStart);
  const tape: WeekColumn[] = [];
  for (let column = weekStart(yearStart); column <= yearEnd; column = addDays(column, 7)) {
    const columnDays = Array.from({ length: 5 }, (_, i) => cellAt(addDays(column, i)));
    tape.push({
      start: column,
      days: columnDays,
      weekendDone: [5, 6].some((i) => states.get(addDays(column, i)) === 'done'),
      doneCount: columnDays.filter((cell) => cell.state === 'done').length,
    });
  }

  const totalLessons = new Set([...record.legacy, ...Object.values(days).flat()]).size;
  const frozenThisWeek = week.filter((cell) => cell.state === 'frozen').map((cell) => cell.date);

  return {
    today,
    streak,
    longest,
    longestEndedOn,
    totalDays: activeDates.length,
    totalLessons,
    todayDone: (days[today]?.length ?? 0) > 0,
    todayLessons: days[today] ?? [],
    freezesLeft: Math.max(0, FREEZES_PER_WEEK - (freezeUse.get(weekKey(today)) ?? 0)),
    freezesTotal: FREEZES_PER_WEEK,
    frozenThisWeek,
    week,
    tape,
    milestones,
    weekendDays,
    mondayDays,
    twoSubjectDays,
    returns,
  };
}

/** Najbliższy próg rytmu przed uczniem — cel pokazywany zawsze, nigdy jako zagadka. */
export function nextMilestone(streak: number): { target: number; left: number } | null {
  const target = RHYTHM_MILESTONES.find((value) => value > streak);
  return target ? { target, left: target - streak } : null;
}
