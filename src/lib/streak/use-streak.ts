'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-context';
import { deriveStreak, nextMilestone, EMPTY_RECORD } from './derive';
import { evaluateBadges, EMPTY_JOURNEY, type BadgeState, type JourneyInput } from './badges';
import { readStreakRecord, writeStreakRecord } from './storage';
import { readJourney } from './sources';
import { withLegacy } from './record';
import { todayKey } from './school-calendar';
import { notifyStreakChanged, pullServerStreakOnce, STREAK_CHANGED_EVENT } from './sync';
import type { StreakSnapshot } from './types';

export interface StreakView {
  /** Dane odczytane — dopóki `false`, komponenty pokazują miejsce, nie zera. */
  ready: boolean;
  /** Gość nie ma serii: jego postęp ginie razem z kartą. */
  isGuest: boolean;
  snapshot: StreakSnapshot;
  badges: BadgeState[];
  journey: JourneyInput;
  next: ReturnType<typeof nextMilestone>;
  refresh: () => void;
}

const EMPTY_SNAPSHOT = deriveStreak(EMPTY_RECORD, '1970-01-01');

/**
 * Seria w wersji do renderowania. Dostępna dopiero po zamontowaniu i ustaleniu
 * stanu logowania (SSR nie widzi magazynu), stąd `ready` — dokładnie ten sam
 * kontrakt co `useMathProgress`/`useInfoProgress`.
 *
 * `withBadges` jest opcjonalne, bo ocena odznak „Droga” i „Mapa” przechodzi po
 * wszystkich lekcjach obu kursów. Nagłówek i paski hubów potrzebują samej
 * liczby, więc ich nie liczą.
 */
export function useStreak({ withBadges = false }: { withBadges?: boolean } = {}): StreakView {
  const { isAuthenticated, initialLoading } = useAuth();
  const [snapshot, setSnapshot] = useState<StreakSnapshot>(EMPTY_SNAPSHOT);
  const [badges, setBadges] = useState<BadgeState[]>([]);
  const [journey, setJourney] = useState<JourneyInput>(EMPTY_JOURNEY);
  const [ready, setReady] = useState(false);

  const read = useCallback(() => {
    if (!isAuthenticated) {
      setSnapshot(deriveStreak(EMPTY_RECORD, todayKey()));
      setBadges([]);
      setJourney(EMPTY_JOURNEY);
      setReady(true);
      return;
    }

    const stored = readStreakRecord();
    // Uzupełnienie `legacy` przechodzi po wszystkich lekcjach obu kursów, więc
    // robi to tylko ekran, który faktycznie ocenia odznaki. Nagłówkowi i paskom
    // hubów wystarczy sama liczba dni.
    const record = withBadges ? withLegacy(stored, window.localStorage) : stored;
    if (record !== stored) writeStreakRecord(record);

    const derived = deriveStreak(record, todayKey());
    const currentJourney = withBadges ? readJourney(window.localStorage) : EMPTY_JOURNEY;

    setSnapshot(derived);
    setJourney(currentJourney);
    setBadges(withBadges ? evaluateBadges(derived, currentJourney) : []);
    setReady(true);
  }, [isAuthenticated, withBadges]);

  useEffect(() => {
    if (initialLoading) return;
    if (isAuthenticated) void pullServerStreakOnce();
    read();

    window.addEventListener(STREAK_CHANGED_EVENT, read);
    return () => window.removeEventListener(STREAK_CHANGED_EVENT, read);
  }, [initialLoading, isAuthenticated, read]);

  return {
    ready: ready && !initialLoading,
    isGuest: !isAuthenticated,
    snapshot,
    badges,
    journey,
    next: nextMilestone(snapshot.streak),
    refresh: notifyStreakChanged,
  };
}
