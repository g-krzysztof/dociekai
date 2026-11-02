/**
 * Blok 3 L20 — warstwy osłaniające ciało Tutanchamona, od zewnątrz.
 *
 * Źródła dat: dzienniki wykopalisk H. Cartera (Griffith Institute, Oxford,
 * „Tutankhamun: Anatomy of an Excavation”): komora grobowa otwarta 16 II 1923,
 * drzwi trzeciej i czwartej kaplicy 3 I 1924, wieko sarkofagu 12 II 1924,
 * wieko pierwszej trumny 13 X 1925, druga trumna 17 X 1925, złota trumna
 * otwarta 28 X 1925. Złota trumna ok. 110 kg, maska ponad 10 kg (baza
 * F-III.T1-08/09). Grób odkryty w listopadzie 1922 (F-III.T1-06).
 */

export type LayerKind = 'kaplica' | 'sarkofag' | 'trumna';

export interface TombLayer {
  id: string;
  kind: LayerKind;
  name: string;
  material: string;
  opened: string;
  /** Rok otwarcia — do licznika lat od odkrycia. */
  year: number;
  fact: string;
}

export const TOMB_FOUND = 1922;

export const TOMB_LAYERS: TombLayer[] = [
  {
    id: 'k1',
    kind: 'kaplica',
    name: 'Kaplica pierwsza',
    material: 'drewno pokryte złotem',
    opened: 'luty 1923',
    year: 1923,
    fact: 'Wielka skrzynia ze złoconego drewna prawie wypełniała komorę — między nią a ścianą ledwo mieścił się człowiek. Trzeba ją było rozebrać na części.',
  },
  {
    id: 'k2',
    kind: 'kaplica',
    name: 'Kaplica druga',
    material: 'drewno pokryte złotem',
    opened: 'zima 1923/1924',
    year: 1923,
    fact: 'Pod pierwszą kaplicą — druga, mniejsza. Między nimi przykryto wszystko lnianym całunem ze złotymi rozetkami.',
  },
  {
    id: 'k3',
    kind: 'kaplica',
    name: 'Kaplica trzecia',
    material: 'drewno pokryte złotem',
    opened: 'styczeń 1924',
    year: 1924,
    fact: 'Drzwi trzeciej kaplicy wciąż miały nienaruszoną pieczęć sprzed ponad 3000 lat. Nikt tu nie wszedł przed Carterem.',
  },
  {
    id: 'k4',
    kind: 'kaplica',
    name: 'Kaplica czwarta',
    material: 'drewno pokryte złotem',
    opened: '3 stycznia 1924',
    year: 1924,
    fact: 'Ostatnia, najmniejsza kaplica. Na jej ścianach wyrzeźbiono boginie, które rozpościerają skrzydła, by chronić faraona.',
  },
  {
    id: 'sarkofag',
    kind: 'sarkofag',
    name: 'Sarkofag',
    material: 'kamień, wieko z granitu',
    opened: '12 lutego 1924',
    year: 1924,
    fact: 'Kamienną skrzynię zamykało wieko ważące ponad tonę. Podnoszono je bloczkami i linami — przy świadkach z całego świata.',
  },
  {
    id: 't1',
    kind: 'trumna',
    name: 'Trumna pierwsza',
    material: 'drewno pokryte złotem',
    opened: '13 października 1925',
    year: 1925,
    fact: 'Trumna ma kształt faraona. Na wieku leżał mały wianek z kwiatów — może położony przez jego żonę.',
  },
  {
    id: 't2',
    kind: 'trumna',
    name: 'Trumna druga',
    material: 'drewno, złoto, kolorowe szkło',
    opened: '17 października 1925',
    year: 1925,
    fact: 'Druga trumna, wysadzana kolorowym szkłem, była owinięta lnianym płótnem i ledwo mieściła się w pierwszej.',
  },
  {
    id: 't3',
    kind: 'trumna',
    name: 'Trumna trzecia',
    material: 'szczere złoto',
    opened: '28 października 1925',
    year: 1925,
    fact: 'Dlaczego tak ciężko było ją podnieść? Bo jest ze szczerego złota — waży około 110 kilogramów, mniej więcej tyle, co trzech czwartoklasistów.',
  },
];

export const LAYER_COUNT = TOMB_LAYERS.length;

export type PredictionVerdict = { exact: true } | { exact: false; diff: number };

export function judgePrediction(guess: number): PredictionVerdict {
  return guess === LAYER_COUNT ? { exact: true } : { exact: false, diff: LAYER_COUNT - guess };
}

/** Ile lat minęło od odkrycia grobu do otwarcia danej warstwy. */
export function yearsSinceFound(layerIndex: number): number {
  return TOMB_LAYERS[layerIndex].year - TOMB_FOUND;
}
