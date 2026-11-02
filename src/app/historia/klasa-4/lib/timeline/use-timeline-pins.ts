'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth-context';
import { getProgressStore, readAllHistProgress } from '../progress-storage';
import { HIST_PROGRESS_SYNCED_EVENT } from '../progress-sync';
import { earnedPins, type ProgressByLesson, type TimelinePin } from './pins';
import {
  readPersonalPins,
  TIMELINE_CHANGED_EVENT,
  type PersonalPins,
} from './personal-storage';

/** Blok, po którym Oś dziejów zaczyna podpisywać wieki rzymskie (L7, „Lustro p.n.e.”). */
export const ROMAN_CENTURIES_FROM = { lesson: 'czas-i-miejsce/wieki-i-tysiaclecia', block: 'lustro' };

/** Bieżący rok — koniec osi i punkt odniesienia „lat temu”. */
export function timelineNow(): number {
  return new Date().getFullYear();
}

/**
 * Pinezki Osi dziejów dziecka: rdzeń wyprowadzony z postępu lekcji + pinezki
 * osobiste z urządzenia. Czyta dopiero po zamontowaniu i ustaleniu logowania
 * (SSR nie widzi magazynów), stąd `ready`.
 *
 * `live` — postęp **bieżącej** lekcji prosto z powłoki (`useLessonProgress()`):
 * powłoka zapisuje do magazynu w efekcie, więc bez tego pinezka przypięta przed
 * chwilą pojawiłaby się na osi dopiero po przeładowaniu.
 */
export function useTimelinePins(live?: { lesson: string; completed: string[] }) {
  const { isAuthenticated, initialLoading } = useAuth();
  const [stored, setStored] = useState<ProgressByLesson>({});
  const [personal, setPersonal] = useState<PersonalPins>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (initialLoading) return;
    const read = () => {
      const store = getProgressStore(isAuthenticated);
      setStored(readAllHistProgress(store));
      setPersonal(readPersonalPins(store, timelineNow()));
      setReady(true);
    };
    read();
    window.addEventListener(HIST_PROGRESS_SYNCED_EVENT, read);
    window.addEventListener(TIMELINE_CHANGED_EVENT, read);
    return () => {
      window.removeEventListener(HIST_PROGRESS_SYNCED_EVENT, read);
      window.removeEventListener(TIMELINE_CHANGED_EVENT, read);
    };
  }, [isAuthenticated, initialLoading]);

  const liveLesson = live?.lesson;
  const liveCompleted = live?.completed;
  const pins: TimelinePin[] = useMemo(() => {
    if (!liveLesson || !liveCompleted) return earnedPins(stored);
    // Dla bieżącej lekcji rozstrzyga powłoka, nie magazyn — także przy resecie bloku.
    return earnedPins({
      ...stored,
      [liveLesson]: { completed: liveCompleted, total: stored[liveLesson]?.total ?? 0 },
    });
  }, [stored, liveLesson, liveCompleted]);

  /**
   * Od L7 oś podpisuje wieki cyframi rzymskimi — gdy dziecko zrobiło blok
   * „lustro” (wieki p.n.e. i n.e.). Wyprowadzone z postępu, jak pinezki.
   */
  const centuries = useMemo(() => {
    const done =
      liveLesson === ROMAN_CENTURIES_FROM.lesson && liveCompleted
        ? liveCompleted
        : (stored[ROMAN_CENTURIES_FROM.lesson]?.completed ?? []);
    return done.includes(ROMAN_CENTURIES_FROM.block);
  }, [stored, liveLesson, liveCompleted]);

  /** Magazyn, do którego lekcja zapisuje pinezkę osobistą (gość: ta karta, konto: urządzenie). */
  const getStore = () => getProgressStore(isAuthenticated);

  return { pins, personal, ready, getStore, centuries };
}
