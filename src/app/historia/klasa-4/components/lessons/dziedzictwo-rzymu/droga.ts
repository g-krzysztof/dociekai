/**
 * Blok 2 — droga na tysiąc lat (F-V.3-04). Czysta logika, bez Reacta.
 *
 * Warstwy rzymskiej drogi (od dołu, wg Witruwiusza i wykopalisk — uproszczone):
 * duże kamienie (statumen) → gruz z wapnem (rudus) → żwir i piasek z wapnem
 * (nucleus) → płyty kamienne (pavimentum). Sędzia nie porównuje z listą,
 * tylko sprawdza trzy zasady budowy, które dziecko widzi w opisach warstw:
 * na wierzchu twarde, na dnie to, co przepuszcza wodę, grube pod drobnym.
 */

export type LayerId = 'kamienie' | 'gruz' | 'zwir' | 'plyty';

export interface Layer {
  id: LayerId;
  name: string;
  hint: string;
  /** Twardość nawierzchni (koła) i wielkość ziaren (grube pod drobnym). */
  hard: boolean;
  grain: number;
  drains: boolean;
}

export const LAYERS: Layer[] = [
  { id: 'zwir', name: 'Żwir i piasek z wapnem', hint: 'drobny, ubija się na gładko', hard: false, grain: 1, drains: false },
  { id: 'plyty', name: 'Płyty kamienne', hint: 'twarde, koła ich nie rozjadą', hard: true, grain: 3, drains: false },
  { id: 'kamienie', name: 'Duże kamienie', hint: 'między nimi spływa woda', hard: false, grain: 3, drains: true },
  { id: 'gruz', name: 'Gruz z wapnem', hint: 'średnie kawałki, wiąże się w twardą masę', hard: false, grain: 2, drains: false },
];

export interface RoadTest {
  /** Rok, w którym droga się psuje, albo null — wytrzymała 100 lat. */
  failYear: number | null;
  problem: string | null;
}

/** `stack` od dołu do góry (4 warstwy). */
export function testRoad(stack: LayerId[]): RoadTest {
  const L = stack.map((id) => LAYERS.find((l) => l.id === id)!);
  const top = L[L.length - 1];
  if (!top.hard) {
    return { failYear: 3, problem: `Na wierzchu leży „${top.name.toLowerCase()}” — koła wozów wyżłobiły w nim koleiny już po kilku latach. Na wierzch trzeba czegoś twardego.` };
  }
  if (!L[0].drains) {
    return { failYear: 20, problem: `Na dnie leży „${L[0].name.toLowerCase()}” — po deszczach woda nie ma którędy spłynąć, ziemia pod drogą mięknie i droga się zapada.` };
  }
  for (let i = 1; i < L.length - 1; i++) {
    if (L[i].grain > L[i - 1].grain) {
      return { failYear: 55, problem: `„${L[i].name}” leży na drobniejszej warstwie „${L[i - 1].name.toLowerCase()}” — grube kawałki wciskają się w drobne, warstwy się mieszają i płyty pękają.` };
    }
  }
  return { failYear: null, problem: null };
}

/** Kamień milowy: odległość do Rzymu w milach rzymskich, zapisana cyframi rzymskimi. */
export const MILESTONE_MILES = 24;
export const MILESTONE_TEXT = 'M · P · XXIV';
/** Mila rzymska = 1000 podwójnych kroków ≈ 1,48 km. */
export const MILE_KM = 1.48;
