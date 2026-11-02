'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-context';
import { getProgressStore } from '../progress-storage';
import { pullServerShelfOnce, scheduleShelfSync } from './sync';
import { readShelf, SHELF_CHANGED_EVENT, writeShelf } from './storage';
import { EMPTY_SHELF, type ShelfRecord } from './types';

/**
 * Półka czytelnika w komponencie. Czyta dopiero po ustaleniu logowania (SSR
 * nie widzi magazynów) — stąd `ready`. `update(fn)` stosuje czystą zmianę
 * z `model.ts` do aktualnego zapisu, zapisuje i (na koncie) planuje wysyłkę:
 *
 *   update((rec, now) => markEpisodeDone(rec, book.id, 1, book.episodes.length, now))
 */
export function useShelf() {
  const { isAuthenticated, initialLoading } = useAuth();
  const [shelf, setShelf] = useState<ShelfRecord>(EMPTY_SHELF);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (initialLoading) return;
    const read = () => {
      setShelf(readShelf(getProgressStore(isAuthenticated)));
      setReady(true);
    };
    read();
    if (isAuthenticated) void pullServerShelfOnce();
    window.addEventListener(SHELF_CHANGED_EVENT, read);
    return () => window.removeEventListener(SHELF_CHANGED_EVENT, read);
  }, [isAuthenticated, initialLoading]);

  const update = useCallback(
    (fn: (rec: ShelfRecord, now: number) => ShelfRecord) => {
      const store = getProgressStore(isAuthenticated);
      const prev = readShelf(store);
      const next = fn(prev, Date.now());
      if (next === prev) return;
      writeShelf(store, next);
      if (isAuthenticated) scheduleShelfSync(next);
    },
    [isAuthenticated],
  );

  return { shelf, ready, update };
}
