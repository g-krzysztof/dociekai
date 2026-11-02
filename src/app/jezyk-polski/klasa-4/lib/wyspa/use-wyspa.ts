'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-context';
import { getProgressStore } from '../progress-storage';
import { readWyspa, WYSPA_CHANGED_EVENT, WYSPA_KEY, writeWyspa } from './storage';
import { EMPTY_WYSPA, type WyspaRecord } from './types';

/** Wyspa w komponencie — tylko magazyn urządzenia, żadnej sieci. */
export function useWyspa() {
  const { isAuthenticated, initialLoading } = useAuth();
  const [wyspa, setWyspa] = useState<WyspaRecord>(EMPTY_WYSPA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (initialLoading) return;
    const read = () => {
      setWyspa(readWyspa(getProgressStore(isAuthenticated)));
      setReady(true);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === WYSPA_KEY) read();
    };
    read();
    window.addEventListener(WYSPA_CHANGED_EVENT, read);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(WYSPA_CHANGED_EVENT, read);
      window.removeEventListener('storage', onStorage);
    };
  }, [isAuthenticated, initialLoading]);

  const update = useCallback(
    (fn: (rec: WyspaRecord, now: number) => WyspaRecord) => {
      const store = getProgressStore(isAuthenticated);
      writeWyspa(store, fn(readWyspa(store), Date.now()));
    },
    [isAuthenticated],
  );

  return { wyspa, ready, update };
}
