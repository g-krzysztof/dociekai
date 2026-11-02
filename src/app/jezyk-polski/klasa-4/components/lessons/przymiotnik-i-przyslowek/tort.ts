/**
 * L16 „Wyścig i tort” — blok 2: części tortu, zamówienia mieszkańców wyspy
 * zapisane przymiotnikami (T-L16-1, napisane dla kursu) i sędzia „cecha po
 * cesze”. Klient czyta cechy części, nie obrazek. Czysta logika.
 */

import { plural } from '@/lib/plural';
import type { WyspaTort } from '../../../lib/wyspa/types';

export type Ksztalt = WyspaTort['ksztalt'];
export type Smak = WyspaTort['pietra'][number];
export type Kolor = WyspaTort['kolor'];

export const MAX_PIETER = 3;

/** Tort w budowie — kształt i lukier mogą jeszcze nie być wybrane. */
export interface Budowa {
  ksztalt: Ksztalt | null;
  pietra: Smak[];
  kolor: Kolor | null;
}

export const PUSTA: Budowa = { ksztalt: null, pietra: [], kolor: null };

export const KSZTALTY: { id: Ksztalt; nazwa: string }[] = [
  { id: 'okragly', nazwa: 'forma okrągła' },
  { id: 'kwadratowy', nazwa: 'forma kwadratowa' },
];

export const SMAKI: { id: Smak; nazwa: string; kolor: string }[] = [
  { id: 'waniliowy', nazwa: 'biszkopt waniliowy', kolor: '#f6e3a8' },
  { id: 'czekoladowy', nazwa: 'biszkopt czekoladowy', kolor: '#8a5a3c' },
  { id: 'cytrynowy', nazwa: 'biszkopt cytrynowy', kolor: '#f3e15b' },
  { id: 'malinowy', nazwa: 'biszkopt malinowy', kolor: '#e58aa0' },
];

export const KOLORY: { id: Kolor; nazwa: string; kolor: string }[] = [
  { id: 'rozowy', nazwa: 'lukier różowy', kolor: '#f7c6d4' },
  { id: 'zielony', nazwa: 'lukier zielony', kolor: '#b9dfa4' },
  { id: 'bialy', nazwa: 'lukier biały', kolor: '#fbfaf5' },
];

/** Formy przymiotników do zdań klienta: piętro (r. nijaki), lukier (r. męski). */
const SMAK_PIETRA: Record<Smak, string> = { czekoladowy: 'czekoladowe', waniliowy: 'waniliowe', malinowy: 'malinowe', cytrynowy: 'cytrynowe' };
const KOLOR_LUKRU: Record<Kolor, string> = { bialy: 'biały', rozowy: 'różowy', zielony: 'zielony' };
const KSZTALT_TORTU: Record<Ksztalt, string> = { okragly: 'okrągły', kwadratowy: 'kwadratowy' };
const PIETRA_SLOWNIE = ['', 'jedno', 'dwa', 'trzy'];
const KTORE = ['Dolne', 'Środkowe', 'Górne'];

export type Cecha =
  | { cecha: 'ksztalt'; wartosc: Ksztalt }
  | { cecha: 'pietra'; wartosc: number }
  | { cecha: 'smak'; wartosc: Smak }
  | { cecha: 'kolor'; wartosc: Kolor };

export interface SlowoZamowienia {
  tekst: string;
  cecha: Cecha;
}

export interface Zamowienie {
  id: string;
  kto: string;
  /** Zdanie zamówienia rozbite na kawałki: zwykły tekst albo przymiotnik (indeks w `slowa`). */
  zdanie: (string | number)[];
  slowa: SlowoZamowienia[];
}

const K = (wartosc: Ksztalt): Cecha => ({ cecha: 'ksztalt', wartosc });
const P = (wartosc: number): Cecha => ({ cecha: 'pietra', wartosc });
const S = (wartosc: Smak): Cecha => ({ cecha: 'smak', wartosc });
const L = (wartosc: Kolor): Cecha => ({ cecha: 'kolor', wartosc });

export const ZAMOWIENIA: Zamowienie[] = [
  {
    id: 'rybak',
    kto: 'Rybak',
    slowa: [
      { tekst: 'okrągły', cecha: K('okragly') },
      { tekst: 'trzypiętrowy', cecha: P(3) },
      { tekst: 'czekoladowy', cecha: S('czekoladowy') },
      { tekst: 'biały', cecha: L('bialy') },
    ],
    zdanie: ['Poproszę ', 0, ', ', 1, ', ', 2, ' tort. Lukier ', 3, '.'],
  },
  {
    id: 'latarnik',
    kto: 'Latarnik',
    slowa: [
      { tekst: 'kwadratowy', cecha: K('kwadratowy') },
      { tekst: 'dwupiętrowy', cecha: P(2) },
      { tekst: 'waniliowy', cecha: S('waniliowy') },
      { tekst: 'różowy', cecha: L('rozowy') },
    ],
    zdanie: ['Poproszę ', 0, ', ', 1, ', ', 2, ' tort, cały ', 3, '.'],
  },
  {
    id: 'dzieci',
    kto: 'Dzieci z wyspy',
    slowa: [
      { tekst: 'malinowy', cecha: S('malinowy') },
      { tekst: 'jednopiętrowy', cecha: P(1) },
      { tekst: 'okrągły', cecha: K('okragly') },
      { tekst: 'zielony', cecha: L('zielony') },
    ],
    zdanie: ['Prosimy o tort ', 0, ', ', 1, ', ', 2, ' i ', 3, '!'],
  },
];

export interface Ocena {
  ok: boolean;
  /** Co klient widzi przy tej części tortu (pusty przy zgodności). */
  uwaga: string;
}

/** Klient porównuje jedną cechę zamówienia z tortem. */
export function ocenCeche(b: Budowa, c: Cecha): Ocena {
  switch (c.cecha) {
    case 'ksztalt':
      if (!b.ksztalt) return { ok: false, uwaga: 'Tort nie ma jeszcze formy.' };
      return b.ksztalt === c.wartosc ? { ok: true, uwaga: '' } : { ok: false, uwaga: `Tort jest ${KSZTALT_TORTU[b.ksztalt]}.` };
    case 'pietra': {
      const n = b.pietra.length;
      if (n === c.wartosc) return { ok: true, uwaga: '' };
      if (n === 0) return { ok: false, uwaga: 'Na paterze nie ma jeszcze ani jednego piętra.' };
      return { ok: false, uwaga: `Tort ma ${PIETRA_SLOWNIE[n]} ${plural(n, { one: 'piętro', few: 'piętra', many: 'pięter' })}.` };
    }
    case 'smak': {
      if (b.pietra.length === 0) return { ok: false, uwaga: 'Nie ma jeszcze żadnego biszkoptu.' };
      const zle = b.pietra.findIndex((s) => s !== c.wartosc);
      if (zle < 0) return { ok: true, uwaga: '' };
      const ktore = b.pietra.length === 1 ? 'Jedyne' : b.pietra.length === 2 ? (zle === 0 ? 'Dolne' : 'Górne') : KTORE[zle];
      return { ok: false, uwaga: `${ktore} piętro jest ${SMAK_PIETRA[b.pietra[zle]]}.` };
    }
    case 'kolor':
      if (!b.kolor) return { ok: false, uwaga: 'Tort nie ma jeszcze lukru.' };
      return b.kolor === c.wartosc ? { ok: true, uwaga: '' } : { ok: false, uwaga: `Lukier jest ${KOLOR_LUKRU[b.kolor]}.` };
  }
}

export function ocenTort(b: Budowa, z: Zamowienie): Ocena[] {
  return z.slowa.map((s) => ocenCeche(b, s.cecha));
}

export const tortPrzyjety = (b: Budowa, z: Zamowienie) => ocenTort(b, z).every((o) => o.ok);

/** Zmiany budowy — zawsze nowe obiekty. */
export function nalozForme(b: Budowa, k: Ksztalt): Budowa {
  return { ...b, pietra: [...b.pietra], ksztalt: k };
}

export function dolozPietro(b: Budowa, s: Smak): { budowa: Budowa; ok: boolean; powod?: 'brak-formy' | 'za-wysoko' } {
  if (!b.ksztalt) return { budowa: b, ok: false, powod: 'brak-formy' };
  if (b.pietra.length >= MAX_PIETER) return { budowa: b, ok: false, powod: 'za-wysoko' };
  // Nowe piętro ląduje pod lukrem: lukier zostaje na wierzchu.
  return { budowa: { ...b, pietra: [...b.pietra, s] }, ok: true };
}

export function zdejmijPietro(b: Budowa, i: number): Budowa {
  return { ...b, pietra: b.pietra.filter((_, j) => j !== i) };
}

export function polejLukrem(b: Budowa, k: Kolor): { budowa: Budowa; ok: boolean } {
  if (b.pietra.length === 0) return { budowa: b, ok: false };
  return { budowa: { ...b, pietra: [...b.pietra], kolor: k }, ok: true };
}

export function doWyspy(b: Budowa): WyspaTort | null {
  if (!b.ksztalt || !b.kolor || b.pietra.length === 0) return null;
  return { ksztalt: b.ksztalt, pietra: [...b.pietra], kolor: b.kolor };
}

// ── Słowa z kosza: jak? czy jaki? ──

export type Rama = 'jak' | 'jaki';

/** Dwie ramy do sprawdzenia własnym uchem; słowa z kosza L14. */
export const RAMY: Record<Rama, { przed: string; po: string; pytanie: string }> = {
  jak: { przed: 'Ślimak pełznie', po: '.', pytanie: 'jak?' },
  jaki: { przed: 'Tort jest', po: '.', pytanie: 'jaki?' },
};

export const KOSZ: { id: string; tekst: string; rama: Rama }[] = [
  { id: 'zielony', tekst: 'zielony', rama: 'jaki' },
  { id: 'szybko', tekst: 'szybko', rama: 'jak' },
  { id: 'wysoki', tekst: 'wysoki', rama: 'jaki' },
];

export function wRamie(slowo: string, rama: Rama): string {
  return `${RAMY[rama].przed} ${slowo}${RAMY[rama].po}`;
}
