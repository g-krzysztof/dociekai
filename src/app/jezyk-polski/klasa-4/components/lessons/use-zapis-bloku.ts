'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/auth-context';
import { getProgressStore } from '../../lib/progress-storage';

/**
 * Zapis stanu ukończonego bloku (L1, wypromowany przy L8 — `scope` to prefiks
 * klucza lekcji, `pol-l1` dla L1 zostaje bez zmian). Pierwotnie L1 (raport testera 2026-10-19: po odświeżeniu
 * bloki miały ✓, ale widżety wracały do początku). Magazyn jak postęp kursu:
 * gość `sessionStorage`, konto `localStorage`.
 *
 * `restored` oddaje zapis **tylko gdy blok jest odhaczony** — inaczej widżet
 * zaczyna od zera. Gdy blok przestaje być odhaczony (reset bloku w powłoce),
 * zapis znika, więc przemontowany widżet nie wróci do starego stanu.
 */
export function useZapisBloku<T>(blockId: string, done: boolean, scope = 'pol-l1') {
  const key = `dociekai:${scope}:${blockId}`;
  const { isAuthenticated, initialLoading } = useAuth();
  const [saved, setSaved] = useState<T | null>(null);
  const wasDone = useRef(false);

  useEffect(() => {
    if (initialLoading) return;
    try {
      const raw = getProgressStore(isAuthenticated).getItem(key);
      setSaved(raw ? (JSON.parse(raw) as T) : null);
    } catch {
      /* prywatne okno, uszkodzony zapis */
    }
  }, [initialLoading, isAuthenticated, key]);

  useEffect(() => {
    if (done) {
      wasDone.current = true;
      return;
    }
    if (!wasDone.current) return;
    wasDone.current = false;
    setSaved(null);
    try {
      getProgressStore(isAuthenticated).removeItem(key);
    } catch {
      /* jw. */
    }
  }, [done, isAuthenticated, key]);

  const save = useCallback(
    (value: T) => {
      try {
        getProgressStore(isAuthenticated).setItem(key, JSON.stringify(value));
      } catch {
        /* jw. */
      }
    },
    [isAuthenticated, key]
  );

  return { restored: done ? saved : null, save };
}
