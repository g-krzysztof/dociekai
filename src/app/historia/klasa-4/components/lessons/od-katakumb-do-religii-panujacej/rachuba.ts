/**
 * Blok 5 — **Od kiedy liczymy lata?** Linijka z wydarzeniami i ruchomym
 * zerem: dziecko przesuwa początek rachuby na inne wydarzenie i patrzy, jak
 * zmieniają się numery lat. Rzymianie liczyli lata m.in. od założenia
 * miasta (ab urbe condita, 753 p.n.e.); rachubę od narodzin Jezusa ułożył
 * mnich Dionizy Mały w 525 r. (Encyclopaedia Britannica, „Dionysius
 * Exiguus”). Rok historyczny bez zera, jak w `lib/timeline/dating.ts`.
 */

import { plural } from '@/lib/plural';

export interface RulerEvent {
  id: 'rzym' | 'jezus' | 'edykt' | 'polska' | 'dzis';
  label: string;
  year: number;
  /** Czy na to wydarzenie można przesunąć zero. */
  zero: boolean;
}

export function rulerEvents(today: number): RulerEvent[] {
  return [
    { id: 'rzym', label: 'założenie Rzymu', year: -753, zero: true },
    { id: 'jezus', label: 'narodziny Jezusa', year: 1, zero: true },
    { id: 'edykt', label: 'wolność dla chrześcijan', year: 313, zero: true },
    { id: 'polska', label: 'chrzest Polski', year: 966, zero: true },
    { id: 'dzis', label: 'dziś', year: today, zero: false },
  ];
}

/** Rok historyczny (bez zera) → oś liczb z zerem: 1 p.n.e. = 0. */
const astro = (y: number) => (y > 0 ? y : y + 1);

/**
 * Który to rok, jeśli rok wydarzenia `zeroYear` jest rokiem 1?
 * Wynik ≤ 0 znaczy: tyle lat przed początkiem rachuby (0 = rok tuż przed).
 */
export function yearCountedFrom(zeroYear: number, year: number): number {
  return astro(year) - astro(zeroYear) + 1;
}

/** Opis numeru roku w rachubie od `zeroYear` — jak na linijce. */
export function describe(zeroYear: number, year: number): string {
  const n = yearCountedFrom(zeroYear, year);
  if (n >= 1) return `rok ${n}`;
  return `${1 - n} ${plural(1 - n, { one: 'rok', few: 'lata', many: 'lat' })} przed początkiem`;
}

/** Zakres linijki i położenie roku na niej (0–1). */
export const RULER_FROM = -900;
export const RULER_TO = 2150;
export function rulerU(year: number): number {
  return (astro(year) - RULER_FROM) / (RULER_TO - RULER_FROM);
}

/** Najbliższe wydarzenie, na które można postawić zero, od położenia u. */
export function snapZero(u: number, events: readonly RulerEvent[]): RulerEvent {
  let best = events.find((e) => e.zero)!;
  for (const e of events) {
    if (!e.zero) continue;
    if (Math.abs(rulerU(e.year) - u) < Math.abs(rulerU(best.year) - u)) best = e;
  }
  return best;
}
