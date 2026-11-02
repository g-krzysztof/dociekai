'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

/**
 * Wyniki testu: `taskId → trafione?`. Jedna próba — wpis powstaje przy
 * pierwszej odpowiedzi i już się nie zmienia (reset całej lekcji w powłoce
 * nie czyści tej kopii; „Napisz test od nowa” w bloku wyniku — tak).
 * Kopia w localStorage, nigdy serwer.
 */
const KEY = 'dociekai:hist-test-koncowy';

const Ctx = createContext<{
  results: Record<string, boolean>;
  answer: (id: string, ok: boolean) => void;
  reset: () => void;
} | null>(null);

export function TestProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setResults(JSON.parse(raw));
    } catch {
      // bez pamięci przeglądarki też działa
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(results));
    } catch {
      // jw.
    }
  }, [results, loaded]);

  const answer = (id: string, ok: boolean) => setResults((r) => (id in r ? r : { ...r, [id]: ok }));
  const reset = () => setResults({});

  return <Ctx.Provider value={{ results, answer, reset }}>{children}</Ctx.Provider>;
}

export function useTest() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTest poza TestProvider');
  return v;
}
