'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-context';
import { getProgressStore } from '../progress-storage';
import {
  readTeczka,
  removeTeczkaItem,
  saveTeczkaItem,
  setInBooklet,
  TECZKA_CHANGED_EVENT,
} from './storage';
import { EMPTY_TECZKA, type TeczkaItem, type TeczkaRecord } from './types';

/** Teczka autora w komponencie — tylko magazyn urządzenia, żadnej sieci. */
export function useTeczka() {
  const { isAuthenticated, initialLoading } = useAuth();
  const [teczka, setTeczka] = useState<TeczkaRecord>(EMPTY_TECZKA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (initialLoading) return;
    const read = () => {
      setTeczka(readTeczka(getProgressStore(isAuthenticated)));
      setReady(true);
    };
    read();
    window.addEventListener(TECZKA_CHANGED_EVENT, read);
    return () => window.removeEventListener(TECZKA_CHANGED_EVENT, read);
  }, [isAuthenticated, initialLoading]);

  const save = useCallback(
    (item: Omit<TeczkaItem, 'createdAt' | 'updatedAt' | 'inBooklet'>) =>
      saveTeczkaItem(getProgressStore(isAuthenticated), item, Date.now()),
    [isAuthenticated],
  );
  const remove = useCallback((id: string) => removeTeczkaItem(getProgressStore(isAuthenticated), id), [isAuthenticated]);
  const toggleBooklet = useCallback(
    (id: string, on: boolean) => setInBooklet(getProgressStore(isAuthenticated), id, on),
    [isAuthenticated],
  );

  /** Kartki od najstarszej (kolejność roku). */
  const items = Object.values(teczka.items).sort((a, b) => a.createdAt - b.createdAt);
  return { teczka, items, ready, save, remove, toggleBooklet };
}
