/**
 * Zapis serii — jedyne miejsce, w którym dzień zostaje zaliczony.
 *
 * Dzień liczy się po **doprowadzeniu lekcji do 100%**, nie po zrobieniu kroku.
 * Próg jest wysoki świadomie, dlatego mechanika ma bezpieczniki: weekendy i
 * przerwy nic nie kosztują, a dwie zamrażarki tygodniowo ratują wpadkę po cichu,
 * bez komunikatu w stylu „uważaj, bo stracisz”.
 */

import { deriveStreak } from './derive';
import { evaluateBadges, earnedIds, EMPTY_JOURNEY, type BadgeState } from './badges';
import { readStreakRecord, withLesson, writeStreakRecord, clearStreak } from './storage';
import { backfillLessonKeys, readJourney, lessonKey, type CourseId } from './sources';
import { todayKey } from './school-calendar';
import { flushStreakSync, notifyStreakChanged, resetStreakSync, scheduleStreakSync } from './sync';
import type { StreakRecord, StreakSnapshot } from './types';

export interface StreakEvent {
  /** Czy to była pierwsza lekcja tego dnia — czyli czy dzień właśnie został zaliczony. */
  dayCounted: boolean;
  streakBefore: number;
  streakAfter: number;
  /** Odznaki, które padły dokładnie teraz. */
  newBadges: BadgeState[];
  snapshot: StreakSnapshot;
}

/**
 * Uzupełnia `legacy` o lekcje ukończone bez znanej daty — czyli te sprzed
 * wdrożenia serii. Bez tego uczeń z czterdziestoma lekcjami na koncie zobaczyłby
 * zablokowaną odznakę „Pierwszy krok”, co wyglądałoby po prostu na błąd.
 *
 * Liczone za każdym razem od zera zamiast jednorazowej flagi: `legacy` to
 * dokładnie „ukończone lekcje, których nie ma w żadnym dniu”, więc samo się
 * naprawia, gdy dane dojdą z innego urządzenia.
 */
export function withLegacy(record: StreakRecord, store: Storage): StreakRecord {
  const known = new Set(Object.values(record.days).flat());
  const legacy = backfillLessonKeys(store).filter((key) => !known.has(key));
  const unchanged =
    legacy.length === record.legacy.length && legacy.every((key) => record.legacy.includes(key));
  return unchanged ? record : { ...record, legacy };
}

function persist(record: StreakRecord): void {
  writeStreakRecord(record);
  scheduleStreakSync(record);
  notifyStreakChanged();
}

/**
 * Wołane raz, w chwili gdy lekcja przekracza 100%. Zwraca `null` dla gościa i
 * dla lekcji, która już wcześniej była zaliczona tego dnia — dzięki temu karta
 * końcowa wie, czy ma świętować, czy tylko cicho potwierdzić.
 */
export function recordLessonCompleted(params: {
  course: CourseId;
  moduleSlug: string;
  lessonSlug: string;
  isAuthenticated: boolean;
}): StreakEvent | null {
  const { course, moduleSlug, lessonSlug, isAuthenticated } = params;
  if (!isAuthenticated || typeof window === 'undefined') return null;

  const store = window.localStorage;
  const today = todayKey();
  const before = withLegacy(readStreakRecord(), store);
  const beforeSnapshot = deriveStreak(before, today);
  const beforeBadges = earnedIds(evaluateBadges(beforeSnapshot, readJourney(store)));

  const updated = withLesson(before, today, lessonKey(course, moduleSlug, lessonSlug));
  if (!updated) {
    // Lekcja już dziś zaliczona — nic nie zapisujemy i nic nie świętujemy.
    return {
      dayCounted: false,
      streakBefore: beforeSnapshot.streak,
      streakAfter: beforeSnapshot.streak,
      newBadges: [],
      snapshot: beforeSnapshot,
    };
  }

  persist(updated);

  const snapshot = deriveStreak(updated, today);
  const badges = evaluateBadges(snapshot, readJourney(store));
  const newBadges = badges.filter((badge) => badge.earned && !beforeBadges.includes(badge.id));

  return {
    dayCounted: !beforeSnapshot.todayDone,
    streakBefore: beforeSnapshot.streak,
    streakAfter: snapshot.streak,
    newBadges,
    snapshot,
  };
}

/**
 * Tuż po zalogowaniu/rejestracji: lekcje, które gość skończył w tej karcie,
 * zaliczają się na **dziś**. `sessionStorage` żyje tylko przez jedną kartę, więc
 * „w tej sesji” i „dzisiaj” to ten sam dzień — a dziecko, które właśnie
 * skończyło lekcję i założyło konto, od razu ma dzień 1 zamiast zera.
 *
 * Czytamy `sessionStorage` przed `mergeSessionIntoAccount()`, które ją czyści.
 */
export function creditGuestSessionOnLogin(): void {
  if (typeof window === 'undefined') return;

  const guestLessons = backfillLessonKeys(window.sessionStorage);
  const today = todayKey();
  let record = readStreakRecord();

  guestLessons.forEach((key) => {
    record = withLesson(record, today, key) ?? record;
  });

  persist(withLegacy(record, window.localStorage));
}

/**
 * Wylogowanie kasuje lokalny cache serii — ale dopiero po wypchnięciu go na
 * konto, bo dopiero wtedy zdanie „prawdziwy rekord zostaje na koncie” jest
 * prawdziwe. Przy wygaśnięciu tokena (401) wysyłka nie ma czym się
 * uwierzytelnić, więc `flush` jest tam pomijany.
 */
export function clearStreakOnLogout(options?: { flush?: boolean }): void {
  if (typeof window === 'undefined') return;
  if (options?.flush !== false) flushStreakSync();
  clearStreak();
  resetStreakSync();
  notifyStreakChanged();
}

export { EMPTY_JOURNEY };
