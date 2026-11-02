'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Kind } from './postacie';
import type { Measure, Rating } from './teczka';

/**
 * Praca dziecka nad teczką przechodzi przez cztery bloki: wybór postaci,
 * zakreślenia, oś życia, ocena z dowodami — i wraca na planszy wystawy.
 * Trzymamy ją w jednym miejscu; na urządzeniu zostaje kopia w localStorage
 * (tylko wygoda przy powrocie — bez danych osobowych, nigdy na serwer).
 */
export interface TeczkaWork {
  figure: string | null;
  first: number | null;
  kinds: Record<string, Kind>;
  order: string[] | null;
  rating: Rating;
  evidence: string[];
  counter: string | null;
  measure: Measure;
}

const EMPTY: TeczkaWork = {
  figure: null,
  first: null,
  kinds: {},
  order: null,
  rating: { own: 0, others: 0 },
  evidence: [],
  counter: null,
  measure: null,
};

const KEY = 'dociekai:hist-teczka-postaci';

const Ctx = createContext<{ work: TeczkaWork; update: (patch: Partial<TeczkaWork>) => void; choose: (figure: string) => void } | null>(null);

export function TeczkaProvider({ children }: { children: ReactNode }) {
  const [work, setWork] = useState<TeczkaWork>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      // Wczytanie po zamontowaniu — serwer renderuje pustą teczkę.
      if (raw) setWork({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      // brak dostępu do pamięci przeglądarki — teczka działa bez niej
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

  const update = (patch: Partial<TeczkaWork>) => setWork((w) => ({ ...w, ...patch }));
  const choose = (figure: string) => setWork((w) => (w.figure === figure ? w : { ...EMPTY, figure }));

  return <Ctx.Provider value={{ work, update, choose }}>{children}</Ctx.Provider>;
}

export function useTeczka() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTeczka poza TeczkaProvider');
  return v;
}

/** Suwak −2…+2 słowami. */
export function ratingWord(v: number, she: boolean): string {
  const harm = she ? 'zaszkodziła' : 'zaszkodził';
  const help = she ? 'pomogła' : 'pomógł';
  return [`bardzo ${harm}`, `raczej ${harm}`, 'ani tak, ani tak', `raczej ${help}`, `bardzo ${help}`][v + 2];
}
