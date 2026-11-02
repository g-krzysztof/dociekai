/**
 * L14 „Słowo stawia rzecz” — paleta wyrazów wyspy (T-L14-1, napisana dla
 * kursu; rodzaj i formy liczby sprawdzone w SGJP selftestem
 * `scripts/polski-l14-selftest.mjs`) i sędziowie trzech bloków. Czysta logika.
 *
 * Tylko rzeczowniki stawiają to, co nazywają. Rzeczy, których nie da się
 * dotknąć, rysujemy jako zjawisko (mgła, wiatr) — bez abstrakcji typu
 * „radość”, bo jej obraz byłby kluczem autora. Rodzaj sprawdza dziecko
 * własnym głosem („ta dom?”), a werdykt czyta z danych.
 */

export type RodzajRz = 'm' | 'f' | 'n';
export type Tabliczka = 'ten' | 'ta' | 'to';

export interface SlowoWyspy {
  id: string;
  tekst: string;
  /** Rzeczownik: rodzaj i formy [1, 2–4, 5+]; `policzalne: false` — nie dokłada się kopii. */
  rodzaj?: RodzajRz;
  formy?: [string, string, string];
  policzalne?: boolean;
}

export const SLOWA: SlowoWyspy[] = [
  { id: 'dom', tekst: 'dom', rodzaj: 'm', formy: ['dom', 'domy', 'domów'] },
  { id: 'biegac', tekst: 'biegać' },
  { id: 'latarnia', tekst: 'latarnia', rodzaj: 'f', formy: ['latarnia', 'latarnie', 'latarni'] },
  { id: 'koza', tekst: 'koza', rodzaj: 'f', formy: ['koza', 'kozy', 'kóz'] },
  { id: 'zielony', tekst: 'zielony' },
  { id: 'drzewo', tekst: 'drzewo', rodzaj: 'n', formy: ['drzewo', 'drzewa', 'drzew'] },
  { id: 'studnia', tekst: 'studnia', rodzaj: 'f', formy: ['studnia', 'studnie', 'studni'] },
  { id: 'szybko', tekst: 'szybko' },
  { id: 'lodka', tekst: 'łódka', rodzaj: 'f', formy: ['łódka', 'łódki', 'łódek'] },
  { id: 'pies', tekst: 'pies', rodzaj: 'm', formy: ['pies', 'psy', 'psów'] },
  { id: 'pod', tekst: 'pod' },
  { id: 'ognisko', tekst: 'ognisko', rodzaj: 'n', formy: ['ognisko', 'ogniska', 'ognisk'] },
  { id: 'mgla', tekst: 'mgła', rodzaj: 'f', formy: ['mgła', 'mgły', 'mgieł'], policzalne: false },
  { id: 'wysoki', tekst: 'wysoki' },
  { id: 'kot', tekst: 'kot', rodzaj: 'm', formy: ['kot', 'koty', 'kotów'] },
  { id: 'wiatr', tekst: 'wiatr', rodzaj: 'm', formy: ['wiatr', 'wiatry', 'wiatrów'], policzalne: false },
  { id: 'jablko', tekst: 'jabłko', rodzaj: 'n', formy: ['jabłko', 'jabłka', 'jabłek'] },
];

export const slowo = (id: string): SlowoWyspy => {
  const s = SLOWA.find((x) => x.id === id);
  if (!s) throw new Error(`L14: nieznane słowo ${id}`);
  return s;
};

export const stawia = (s: SlowoWyspy) => !!s.rodzaj;

// ── Blok 1 ──

export const DO_ZALICZENIA = 6;
export const MAX_RZECZY = 12;

export interface Postawiona {
  id: string;
  slowo: string;
  x: number;
  y: number;
}

/** Upuszczenie słowa na wyspę: rzeczownik staje się rzeczą, reszta spada na piasek. */
export function upusc(s: SlowoWyspy): 'stoi' | 'piasek' {
  return stawia(s) ? 'stoi' : 'piasek';
}

/** Punkt upuszczenia → procent planszy, przycięty tak, żeby rzecz nie wystawała poza brzeg (zaokrąglony do 0,1). */
export function wPlanszy(px: number, py: number, w: number, h: number): { x: number; y: number } {
  const c = (v: number) => Math.round(Math.max(6, Math.min(94, v)) * 10) / 10;
  return { x: c((px / w) * 100), y: c((py / h) * 100) };
}

// ── Blok 2: ten / ta / to i ile ──

export const TABLICZKA: Record<RodzajRz, Tabliczka> = { m: 'ten', f: 'ta', n: 'to' };

export function ocenTabliczke(s: SlowoWyspy, t: Tabliczka): { ok: boolean; brzmi: string } {
  if (!s.rodzaj) throw new Error(`L14: ${s.id} nie jest rzeczownikiem`);
  return { ok: TABLICZKA[s.rodzaj] === t, brzmi: `${t} ${s.tekst}` };
}

const LICZEBNIK: Record<number, string> = { 2: 'dwa', 3: 'trzy', 4: 'cztery', 5: 'pięć' };

/** Napis nad rzeczą przy `n` sztukach: „dom”, „dwa domy”, „dwie kozy”, „pięć kóz”. */
export function ileNapis(s: SlowoWyspy, n: number): string {
  if (!s.formy) throw new Error(`L14: ${s.id} nie jest rzeczownikiem`);
  if (n <= 1) return s.formy[0];
  const liczebnik = n === 2 && s.rodzaj === 'f' ? 'dwie' : LICZEBNIK[Math.min(5, n)];
  return `${liczebnik} ${n >= 5 ? s.formy[2] : s.formy[1]}`;
}

export const MAX_ILE = 5;
/** Stuknięcie dokłada kopię; po pięciu wraca do jednej. */
export const dolozKopie = (n: number) => (n >= MAX_ILE ? 1 : n + 1);

/** Ile rzeczy dostaje tabliczki w bloku 2 (pierwsze postawione rzeczowniki). */
export const TABLICZEK = 6;

export interface StanTabliczek {
  tabliczki: Record<string, Tabliczka>;
  ile: Record<string, number>;
}

/** Blok 2 zaliczony: każda rzecz z tabliczką i choć jedna policzona do pięciu. */
export function tabliczkiGotowe(rzeczy: readonly Postawiona[], st: StanTabliczek): boolean {
  const z = rzeczy.slice(0, TABLICZEK);
  if (z.length === 0) return false;
  const tabl = z.every((r) => st.tabliczki[r.id] === TABLICZKA[slowo(r.slowo).rodzaj!]);
  const liczone = z.some((r) => (st.ile[r.id] ?? 1) >= MAX_ILE);
  return tabl && liczone;
}

// ── Blok 3: nazwy własne ──

export type OcenaImienia = { ok: true } | { ok: false; powod: 'puste' | 'mala-litera' | 'cyfry' | 'za-dlugie' | 'znaki' };

export const MAX_IMIENIA = 24;

/** Sprawdzamy tylko budowę: wielka litera, same litery (z odstępem lub łącznikiem), bez cyfr. */
export function ocenImie(raw: string): OcenaImienia {
  const s = raw.trim();
  if (!s) return { ok: false, powod: 'puste' };
  if (s.length > MAX_IMIENIA) return { ok: false, powod: 'za-dlugie' };
  if (/\d/.test(s)) return { ok: false, powod: 'cyfry' };
  if (!/^[\p{L}][\p{L}\s'-]*$/u.test(s)) return { ok: false, powod: 'znaki' };
  const pierwsza = s[0];
  if (pierwsza === pierwsza.toLowerCase() && pierwsza !== pierwsza.toUpperCase()) return { ok: false, powod: 'mala-litera' };
  return { ok: true };
}

export const POWOD_IMIENIA: Record<Exclude<OcenaImienia, { ok: true }>['powod'], string> = {
  puste: 'Tabliczka jest pusta.',
  'mala-litera': 'Imię zaczyna się od małej litery — tabliczka nie zawiśnie.',
  cyfry: 'Imię z cyframi? Same litery.',
  'za-dlugie': 'Za długie na tabliczkę.',
  znaki: 'Same litery (może być odstęp albo łącznik).',
};

/** Rzeczy, którym dziecko nadaje imiona, i wyspa. */
export const DO_NAZWANIA = ['pies', 'latarnia', 'lodka'] as const;

/**
 * „Pies” upuszczony drugi raz stawia drugiego psa; „Burek” stawia jednego,
 * a drugi raz biegnie do tego samego. Zwraca nowy stan psów.
 */
export function upuscPsa(psy: { burek: boolean }[], co: 'pies' | 'Burek'): { psy: { burek: boolean }[]; nowy: boolean } {
  if (co === 'pies') return { psy: [...psy, { burek: false }].slice(0, 4), nowy: psy.length < 4 };
  if (psy.some((p) => p.burek)) return { psy, nowy: false };
  return { psy: [...psy, { burek: true }].slice(-4), nowy: true };
}
