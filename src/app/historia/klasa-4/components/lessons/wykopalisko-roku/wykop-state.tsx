'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { LayerId } from './warstwy';

/**
 * Praca dziecka w L32: które warstwy odsłonięte i ile prób kosztowało
 * każde mikro-zadanie (blok 1 → mapa roku w bloku 4) oraz wybrane zdanie
 * roku. Kopia w localStorage — wygoda przy powrocie, nigdy serwer.
 */
export interface WykopWork {
  solved: LayerId[];
  tries: Partial<Record<LayerId, number>>;
  zdanie: number | null;
}

const EMPTY: WykopWork = { solved: [], tries: {}, zdanie: null };
const KEY = 'dociekai:hist-wykopalisko-roku';

const Ctx = createContext<{ work: WykopWork; update: (fn: (w: WykopWork) => WykopWork) => void } | null>(null);

export function WykopProvider({ children }: { children: ReactNode }) {
  const [work, setWork] = useState<WykopWork>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setWork({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      // bez pamięci przeglądarki też działa
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(work));
    } catch {
      // jw.
    }
  }, [work, loaded]);

  return <Ctx.Provider value={{ work, update: (fn) => setWork(fn) }}>{children}</Ctx.Provider>;
}

export function useWykop() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useWykop poza WykopProvider');
  return v;
}
