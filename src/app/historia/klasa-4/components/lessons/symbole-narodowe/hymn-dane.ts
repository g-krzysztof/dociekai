/**
 * L10 blok 3 — tekst hymnu i paszport pieśni. Dane, bez Reacta.
 *
 * Tekst: zwrotka 1, refren i zwrotka 2 hymnu w brzmieniu z załącznika nr 4
 * do ustawy o godle, barwach i hymnie RP (domena publiczna — tekst urzędowy).
 * Fakty paszportu: F-II.1-15 (1797, by zagrzewać do walki o utraconą
 * ojczyznę), F-II.1-16 (hymn od 1927), F-II.1-17 (Wybicki). Miejsce: Reggio
 * nell'Emilia, obóz Legionów Polskich we Włoszech (lipiec 1797) — Muzeum Hymnu
 * Narodowego w Będominie.
 */
import type { PassportCard, PassportFieldDef } from '../../source-desk/passport';
import type { RouteEvent } from './trasa';

export interface HymnLine {
  text: string;
  /** Wers, który zapala się, gdy legiony zrobią to, o czym śpiewa. */
  lights?: RouteEvent;
  refrain?: boolean;
  /** Wers zapalany kawałkami (Wisła i Warta osobno). */
  parts?: { text: string; lights: RouteEvent }[];
}

export const HYMN: HymnLine[][] = [
  [
    { text: 'Jeszcze Polska nie zginęła,' },
    { text: 'kiedy my żyjemy.' },
    { text: 'Co nam obca przemoc wzięła,' },
    { text: 'szablą odbierzemy.' },
  ],
  [
    { text: 'Marsz, marsz, Dąbrowski,', refrain: true },
    { text: 'z ziemi włoskiej do Polski.', refrain: true, lights: 'wlochy' },
    { text: 'Za twoim przewodem', refrain: true },
    { text: 'złączym się z narodem.', refrain: true },
  ],
  [
    {
      text: 'Przejdziem Wisłę, przejdziem Wartę,',
      parts: [
        { text: 'Przejdziem Wisłę, ', lights: 'wisla' },
        { text: 'przejdziem Wartę,', lights: 'warta' },
      ],
    },
    { text: 'będziem Polakami.', lights: 'warta' },
    { text: 'Dał nam przykład Bonaparte,' },
    { text: 'jak zwyciężać mamy.' },
  ],
];

export type HymnField = 'kto' | 'kiedy' | 'gdzie' | 'po co';

export const HYMN_FIELDS: PassportFieldDef<HymnField>[] = [
  { id: 'kto', question: 'Kto napisał słowa?' },
  { id: 'kiedy', question: 'Kiedy?' },
  { id: 'gdzie', question: 'Gdzie?' },
  { id: 'po co', question: 'Po co?' },
];

export const HYMN_BANK: PassportCard<HymnField>[] = [
  { id: 'wybicki', text: 'Józef Wybicki, poeta i żołnierz legionów', field: 'kto' },
  {
    id: 'dabrowski',
    text: 'generał Jan Henryk Dąbrowski',
    field: null,
    whyNot:
      '„Marsz, marsz, Dąbrowski” — pieśń mówi DO Dąbrowskiego. Dowodził legionami, a słowa napisał ktoś z jego żołnierzy.',
  },
  { id: '1797', text: '1797 rok', field: 'kiedy' },
  {
    id: '1927',
    text: '1927 rok',
    field: null,
    whyNot:
      'W 1927 r. pieśń została hymnem państwa. Ale napisano ją dużo wcześniej — w tekście Polska jest jeszcze „obcą przemocą wzięta”.',
  },
  { id: 'wlochy', text: 'w obozie polskich legionów we Włoszech', field: 'gdzie' },
  {
    id: 'warszawa',
    text: 'w Warszawie',
    field: null,
    whyNot: 'Śpiewający idą „z ziemi włoskiej do Polski” — są daleko od kraju, nie w Warszawie.',
  },
  {
    id: 'otucha',
    text: 'żeby dodać otuchy żołnierzom, gdy Polski nie było na mapie',
    field: 'po co',
  },
  {
    id: 'zwyciestwo',
    text: 'żeby uczcić wielkie zwycięstwo Polski',
    field: null,
    whyNot:
      '„Co nam obca przemoc wzięła” — pieśń mówi o stracie, nie o zwycięstwie. Polski wtedy nie było, dopiero chcieli ją odzyskać.',
  },
];
