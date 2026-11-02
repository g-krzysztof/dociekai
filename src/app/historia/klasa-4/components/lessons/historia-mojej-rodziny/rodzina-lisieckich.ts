/**
 * Blok 2 — rodzina Lisieckich (wymyślona na potrzeby lekcji; dane dla
 * silnika `family-tree`). Cztery pokolenia, dziesięć osób. Lata są spójne
 * z kufrem pamiątek (blok 3): Wincenty ur. 1924, jego syn Józek ur. 1950
 * (list z 1952 r. mówi „Józek ma dwa lata”).
 *
 * Tropy to to, co zostaje w domu po ludziach: kartka z datą, podpis na
 * zdjęciu, metryka, życzenia. Każdy trop mówi o jednej relacji (dziecko albo
 * małżonek) — z tych relacji i lat dziecko wnioskuje piętro.
 */

import type { TreeToken } from '../../family-tree/family-tree';

/** Kolejność wymieszana celowo — nie podpowiada pokoleń. */
export const LISIECCY: TreeToken[] = [
  {
    id: 'marek',
    name: 'Marek',
    born: 1978,
    parents: ['jozef', 'halina'],
    trail: 'Syn Józefa i Haliny.',
    source: 'kartka z życzeniami',
  },
  {
    id: 'wincenty',
    name: 'Wincenty',
    born: 1924,
    partner: 'stanislawa',
    trail: 'Mąż Stanisławy, zegarmistrz.',
    source: 'metryka urodzenia',
  },
  {
    id: 'franek',
    name: 'Franek',
    born: 2016,
    parents: ['marek', 'dorota'],
    trail: 'Syn Marka i Doroty, brat Zosi.',
    source: 'podpis na zdjęciu',
  },
  {
    id: 'ewa',
    name: 'Ewa',
    born: 1981,
    parents: ['jozef', 'halina'],
    trail: 'Córka Józefa i Haliny, siostra Marka.',
    source: 'list',
  },
  {
    id: 'halina',
    name: 'Halina',
    born: 1953,
    partner: 'jozef',
    trail: 'Żona Józefa.',
    source: 'dowód osobisty',
  },
  {
    id: 'zosia',
    name: 'Zosia',
    born: 2013,
    parents: ['marek', 'dorota'],
    trail: 'Córka Marka i Doroty.',
    source: 'podpis na zdjęciu',
  },
  {
    id: 'jozef',
    name: 'Józef',
    born: 1950,
    parents: ['wincenty', 'stanislawa'],
    trail: 'Syn Wincentego i Stanisławy.',
    source: 'podpis na zdjęciu',
  },
  {
    id: 'tomek',
    name: 'Tomek',
    born: 1983,
    parents: ['jozef', 'halina'],
    trail: 'Syn Józefa i Haliny, brat Marka.',
    source: 'kartka urodzinowa',
  },
  {
    id: 'stanislawa',
    name: 'Stanisława',
    born: 1927,
    partner: 'wincenty',
    trail: 'Żona Wincentego.',
    source: 'kartka urodzinowa',
  },
  {
    id: 'dorota',
    name: 'Dorota',
    born: 1979,
    partner: 'marek',
    trail: 'Żona Marka.',
    source: 'zdjęcie ślubne',
  },
];

export const LISIECCY_TIER_LABELS = ['pień', 'konar', 'konar', 'korona'];
