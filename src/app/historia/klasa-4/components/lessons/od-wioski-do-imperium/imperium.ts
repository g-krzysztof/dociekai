/**
 * Blok 3 — imperium rośnie. Czysta logika nad danymi z `geo-imperium.ts`
 * (generowane skryptem scripts/historia-rzym-geo.py).
 */

import { IMPERIUM_STAGES, SHARE_117 } from './geo-imperium';

export type Stage = (typeof IMPERIUM_STAGES)[number];

export const FIRST_YEAR = IMPERIUM_STAGES[0].year;
export const LAST_YEAR = IMPERIUM_STAGES[IMPERIUM_STAGES.length - 1].year;

/** Etap widoczny w roku `year` — ostatni, który już się zaczął. */
export function stageAt(year: number): Stage {
  let s: Stage = IMPERIUM_STAGES[0];
  for (const st of IMPERIUM_STAGES) if (st.year <= year) s = st;
  return s;
}

export const MAX_KM2 = Math.max(...IMPERIUM_STAGES.map((s) => s.km2));

export type LargestVerdict = { ok: true } | { ok: false; message: string };

/** Czy dziecko zatrzymało suwak przy największym zasięgu — sędzią jest powierzchnia etapów. */
export function judgeLargest(year: number): LargestVerdict {
  const s = stageAt(year);
  if (s.km2 === MAX_KM2) return { ok: true };
  const i = IMPERIUM_STAGES.indexOf(s);
  const later = IMPERIUM_STAGES.slice(i + 1).some((x) => x.km2 > s.km2);
  return {
    ok: false,
    message: later
      ? 'Przesuń suwak dalej — później imperium było jeszcze większe.'
      : 'Cofnij suwak — wcześniej imperium było większe, potem zaczęło tracić ziemie.',
  };
}

export type CountryClass = 'cale' | 'czesc' | 'poza';

/** Klasa dzisiejszego państwa według udziału jego powierzchni w imperium z 117 r. */
export function countryClass(id: string): CountryClass | null {
  const share = SHARE_117[id];
  if (share === undefined) return null;
  if (share >= 0.7) return 'cale';
  if (share >= 0.1) return 'czesc';
  return 'poza';
}

export const CLASS_TEXT: Record<CountryClass, string> = {
  cale: 'leżało w imperium całe albo prawie całe',
  czesc: 'leżało w imperium tylko częściowo — granica biegła przez jego dzisiejsze ziemie',
  poza: 'leżało poza imperium',
};

/** Ile państw (całych albo w części) trzeba znaleźć. */
export const COUNTRIES_GOAL = 10;
