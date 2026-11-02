/**
 * L15 „Czasownik niesie czas” — dziennik wyspy (T-L15-1, napisany dla kursu;
 * formy sprawdzone w SGJP selftestem `scripts/polski-l15-selftest.mjs`),
 * figurki osób i sędziowie bloków 1–2. Czysta logika.
 */

export type Czas = 'wczoraj' | 'dzis' | 'jutro';
export const CZASY_OSI: Czas[] = ['wczoraj', 'dzis', 'jutro'];
export const NAZWA_CZASU: Record<Czas, string> = { wczoraj: 'wczoraj', dzis: 'dziś', jutro: 'jutro' };

// ── Blok 1: wczoraj, dziś, jutro ──

export interface ZdanieDziennika {
  id: string;
  przed: string;
  po: string;
  formy: Record<Czas, string>;
}

export const DZIENNIK: ZdanieDziennika[] = [
  { id: 'koza', przed: 'Koza', po: 'trawę na łące.', formy: { dzis: 'skubie', wczoraj: 'skubała', jutro: 'będzie skubać' } },
  { id: 'rybak', przed: 'Rybak', po: 'łódkę.', formy: { dzis: 'naprawia', wczoraj: 'naprawił', jutro: 'naprawi' } },
  { id: 'mewy', przed: 'Mewy', po: 'nad pomostem.', formy: { dzis: 'krzyczą', wczoraj: 'krzyczały', jutro: 'będą krzyczeć' } },
  { id: 'pies', przed: 'Pies', po: 'na pomoście.', formy: { dzis: 'śpi', wczoraj: 'spał', jutro: 'będzie spać' } },
  { id: 'dzieci', przed: 'Dzieci', po: 'zamek z piasku.', formy: { dzis: 'budują', wczoraj: 'zbudowały', jutro: 'zbudują' } },
  { id: 'latarnik', przed: 'Wieczorem latarnik', po: 'latarnię.', formy: { dzis: 'zapala', wczoraj: 'zapalił', jutro: 'zapali' } },
];

/** Czasowniki, które zostają w tyle przy przejeździe do danego dnia (inne przy każdym kierunku). */
export const BAGAZ: Record<Czas, string[]> = {
  wczoraj: ['koza', 'mewy', 'latarnik'],
  jutro: ['rybak', 'pies', 'dzieci'],
  dzis: [],
};

export type CzasyZdan = Record<string, Czas>;
export const START_ZDAN: CzasyZdan = Object.fromEntries(DZIENNIK.map((z) => [z.id, 'dzis' as Czas]));

/** Żeton dnia przesunięty na `cel`: czasowniki jadą z nim, poza bagażem tego kierunku. */
export function przejazd(zdania: CzasyZdan, cel: Czas): CzasyZdan {
  const zostaja = new Set(BAGAZ[cel]);
  return Object.fromEntries(DZIENNIK.map((z) => [z.id, zostaja.has(z.id) ? zdania[z.id] : cel]));
}

/** Czasowniki „na peronie”: ich czas nie zgadza się z dniem na osi. */
export const naPeronie = (zdania: CzasyZdan, dzien: Czas) => DZIENNIK.filter((z) => zdania[z.id] !== dzien).map((z) => z.id);

export type OcenaDorzucenia = { ok: true; forma: string; byla: string } | { ok: false; powod: 'inne-zdanie' | 'juz-jest' };

/** Dziecko dorzuca czasownik `id` do zdania `doZdania` przy dniu `dzien`. */
export function dorzuc(zdania: CzasyZdan, dzien: Czas, id: string, doZdania: string): OcenaDorzucenia {
  if (zdania[id] === dzien) return { ok: false, powod: 'juz-jest' };
  if (id !== doZdania) return { ok: false, powod: 'inne-zdanie' };
  const z = DZIENNIK.find((x) => x.id === id)!;
  return { ok: true, forma: z.formy[dzien], byla: z.formy[zdania[id]] };
}

/** Dzień zaliczony, gdy przy nim wszystkie czasowniki dojechały. */
export const dzienGotowy = (zdania: CzasyZdan, dzien: Czas) => DZIENNIK.every((z) => zdania[z.id] === dzien);

/** Najbliższa zapadka osi dla położenia 0…1. */
export function zapadkaOsi(t: number): Czas {
  const i = Math.round(Math.max(0, Math.min(1, t)) * 2);
  return CZASY_OSI[Number.isFinite(i) ? i : 1];
}
export const polozenieCzasu = (c: Czas) => CZASY_OSI.indexOf(c) / 2;

// ── Blok 2: kto to robi? ──

export type Osoba = 'ja' | 'ty' | 'on' | 'my' | 'wy' | 'oni';
export const OSOBY: { id: Osoba; label: string; ile: number }[] = [
  { id: 'ja', label: 'ja', ile: 1 },
  { id: 'ty', label: 'ty', ile: 1 },
  { id: 'on', label: 'on / ona', ile: 1 },
  { id: 'my', label: 'my', ile: 2 },
  { id: 'wy', label: 'wy', ile: 2 },
  { id: 'oni', label: 'oni', ile: 3 },
];

export const PLYNAC: Record<Osoba, string> = { ja: 'płynę', ty: 'płyniesz', on: 'płynie', my: 'płyniemy', wy: 'płyniecie', oni: 'płyną' };
export const PROG_OSOB = 4;

export interface Zagadka {
  id: string;
  forma: string;
  po: string;
  osoba: Osoba;
}
export const ZAGADKI: Zagadka[] = [
  { id: 'lowic', forma: 'łowicie', po: 'ryby.', osoba: 'wy' },
  { id: 'naprawiac', forma: 'naprawiam', po: 'sieć.', osoba: 'ja' },
  { id: 'spac', forma: 'śpią', po: 'na pomoście.', osoba: 'oni' },
  { id: 'karmic', forma: 'karmisz', po: 'kozę.', osoba: 'ty' },
];

export const pasujeOsoba = (z: Zagadka, o: Osoba) => z.osoba === o;
