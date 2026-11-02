'use client';

/**
 * Jedyne miejsce, które zna **listę kursów z postępem**. `AuthProvider` woła
 * stąd dwie funkcje przy logowaniu i wylogowaniu, zamiast importować po jednej
 * z każdego kursu — nowy kurs dopisuje się tutaj, a nie w kontekście autoryzacji.
 */

import { MATH_PROGRESS_PREFIX } from '@/app/matematyka/klasa-4/lib/progress-storage';
import { INFO_PROGRESS_PREFIX } from '@/app/informatyka/klasa-4/lib/progress-storage';
import { HIST_PROGRESS_PREFIX } from '@/app/historia/klasa-4/lib/progress-storage';
import {
  clearAllMathCourseProgress,
  flushAndClearAllMathCourseProgress,
  mergeSessionIntoAccount as mergeMathSessionIntoAccount,
} from '@/app/matematyka/klasa-4/lib/progress-sync';
import {
  clearAllInfoCourseProgress,
  flushAndClearAllInfoCourseProgress,
  mergeSessionIntoAccount as mergeInfoSessionIntoAccount,
} from '@/app/informatyka/klasa-4/lib/progress-sync';
import {
  clearAllHistCourseProgress,
  flushAndClearAllHistCourseProgress,
  mergeSessionIntoAccount as mergeHistSessionIntoAccount,
} from '@/app/historia/klasa-4/lib/progress-sync';
import {
  clearAllPolCourseProgress,
  flushAndClearAllPolCourseProgress,
  mergeSessionIntoAccount as mergePolSessionIntoAccount,
} from '@/app/jezyk-polski/klasa-4/lib/progress-sync';

const GUEST_PREFIXES = [MATH_PROGRESS_PREFIX, INFO_PROGRESS_PREFIX, HIST_PROGRESS_PREFIX];

/**
 * Czy w TEJ karcie leży postęp gościa któregokolwiek kursu. sessionStorage jest
 * osobny dla każdej karty, więc logowanie w innej karcie go nie przejmuje —
 * `AuthProvider` sprawdza to przy każdym starcie z tokenem.
 */
export function hasGuestSessionProgress(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i);
      if (key && GUEST_PREFIXES.some((prefix) => key.startsWith(prefix))) return true;
    }
  } catch {
    /* zablokowany magazyn — nie ma czego przejmować */
  }
  return false;
}

/**
 * Tuż po zalogowaniu/rejestracji: postęp zrobiony jako gość (sessionStorage,
 * jedna karta przeglądarki) trafia na konto — w każdym kursie osobno, ale
 * synchroniczna część każdego (kopia sessionStorage → localStorage) wykonuje się
 * od razu, więc UI nie migocze do zera.
 */
export async function mergeGuestSessionIntoAccount(): Promise<void> {
  await Promise.all([
    mergeMathSessionIntoAccount(),
    mergeInfoSessionIntoAccount(),
    mergeHistSessionIntoAccount(),
    mergePolSessionIntoAccount(),
  ]);
}

/**
 * Świadome wylogowanie: postęp najpierw jedzie na konto, dopiero potem znika z
 * przeglądarki — bo dopiero wtedy „serwer zostaje trwałą kopią” jest prawdą, a
 * nie założeniem. Obejmuje też zmiany z ostatnich 1,5 s, które nie zdążyły
 * wyjść z debounce'u.
 */
export function flushAndClearAllCourseProgress(): void {
  flushAndClearAllMathCourseProgress();
  flushAndClearAllInfoCourseProgress();
  flushAndClearAllHistCourseProgress();
  flushAndClearAllPolCourseProgress();
}

/** Wygaśnięcie tokena (401): lokalny stan znika bez wysyłki — nie ma czym się uwierzytelnić. */
export function clearAllCourseProgress(): void {
  clearAllMathCourseProgress();
  clearAllInfoCourseProgress();
  clearAllHistCourseProgress();
  clearAllPolCourseProgress();
}
