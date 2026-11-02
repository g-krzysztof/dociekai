/**
 * L13 „Odmieniarka” — wyrazy, ich formy i sędziowie trzech bloków (T-L13-1,
 * napisane dla kursu; formy sprawdzone w SGJP selftestem
 * `scripts/polski-l13-selftest.mjs`). Czysta logika.
 *
 * Maszyna ma trzy dźwignie z ikonami, bez nazw kategorii: **ile?** (jeden ↔
 * wiele), **kto?** (ja ↔ on; z „wiele” daje my ↔ oni) i **kiedy?** (wczoraj ↔
 * dziś ↔ jutro). Forma wyrazu to funkcja położenia dźwigni. Dźwignia, która
 * wyrazu nie dotyczy, go nie zmienia — dlatego wynik liczy się dopiero po
 * wszystkich trzech. Rzeczownik i przymiotnik zmieniają się tylko pod „ile?”
 * (rodzaj przymiotnika idzie za rzeczownikiem, nie za osobą), przysłówek,
 * przyimek i spójnik — nigdzie (w klasie 4 przysłówek jest nieodmienny, jak
 * w programach wydawców).
 */

export type Ile = 'jeden' | 'wiele';
export type Kto = 'ja' | 'on';
export type Kiedy = 'wczoraj' | 'dzis' | 'jutro';
export interface Dzwignie {
  ile: Ile;
  kto: Kto;
  kiedy: Kiedy;
}
export type Dzwignia = keyof Dzwignie;

export const START: Dzwignie = { ile: 'jeden', kto: 'on', kiedy: 'dzis' };
export const DZWIGNIE: Dzwignia[] = ['ile', 'kto', 'kiedy'];
const KOLEJ: { [K in Dzwignia]: Dzwignie[K][] } = {
  ile: ['jeden', 'wiele'],
  kto: ['on', 'ja'],
  kiedy: ['dzis', 'wczoraj', 'jutro'],
};

/** Następne położenie dźwigni (pociągnięcie przestawia ją o jedno, w kółko). */
export function pociagnij(d: Dzwignie, k: Dzwignia): Dzwignie {
  const lista = KOLEJ[k] as string[];
  const i = lista.indexOf(d[k]);
  return { ...d, [k]: lista[(i + 1) % lista.length] } as Dzwignie;
}

/** Podpis położenia dla dziecka (osoba zależy też od „ile?”). */
export function podpis(d: Dzwignie, k: Dzwignia): string {
  if (k === 'ile') return d.ile === 'jeden' ? 'jeden' : 'wiele';
  if (k === 'kto') return d.ile === 'jeden' ? d.kto : d.kto === 'ja' ? 'my' : 'oni';
  return d.kiedy === 'dzis' ? 'dziś' : d.kiedy;
}

/** Formy czasownika: [czas][osoba] w kolejności ja, on, my, oni. */
type Czasownik = Record<Kiedy, [string, string, string, string]>;

export type Rodzaj = 'rzeczownik' | 'przymiotnik' | 'czasownik' | 'nieodmienny';

export interface Wyraz {
  id: string;
  /** Forma, w której wyraz leży w skrzyni (przy dźwigniach START). */
  tekst: string;
  /** Forma słownikowa (tablica w bloku 3). */
  lemat: string;
  rodzaj: Rodzaj;
  /** Rzeczownik / przymiotnik: [jeden, wiele]. */
  liczba?: [string, string];
  czasownik?: Czasownik;
}

const osoba = (d: Dzwignie) => (d.ile === 'jeden' ? (d.kto === 'ja' ? 0 : 1) : d.kto === 'ja' ? 2 : 3);

/** Forma wyrazu przy danym położeniu dźwigni. */
export function forma(w: Wyraz, d: Dzwignie): string {
  if (w.czasownik) return w.czasownik[d.kiedy][osoba(d)];
  if (w.liczba) return w.liczba[d.ile === 'jeden' ? 0 : 1];
  return w.tekst;
}

export const odmienny = (w: Wyraz) => w.rodzaj !== 'nieodmienny';

const czas = (dzis: string[], wczoraj: string[], jutroBezok: string): Czasownik => ({
  dzis: dzis as Czasownik['dzis'],
  wczoraj: wczoraj as Czasownik['wczoraj'],
  jutro: [`będę ${jutroBezok}`, `będzie ${jutroBezok}`, `będziemy ${jutroBezok}`, `będą ${jutroBezok}`],
});

export const WYRAZY: Record<string, Wyraz> = {
  kot: { id: 'kot', tekst: 'kot', lemat: 'kot', rodzaj: 'rzeczownik', liczba: ['kot', 'koty'] },
  lodka: { id: 'lodka', tekst: 'łódka', lemat: 'łódka', rodzaj: 'rzeczownik', liczba: ['łódka', 'łódki'] },
  plynie: {
    id: 'plynie',
    tekst: 'płynie',
    lemat: 'płynąć',
    rodzaj: 'czasownik',
    czasownik: czas(['płynę', 'płynie', 'płyniemy', 'płyną'], ['płynąłem', 'płynął', 'płynęliśmy', 'płynęli'], 'płynąć'),
  },
  zielony: { id: 'zielony', tekst: 'zielony', lemat: 'zielony', rodzaj: 'przymiotnik', liczba: ['zielony', 'zielone'] },
  wczoraj: { id: 'wczoraj', tekst: 'wczoraj', lemat: 'wczoraj', rodzaj: 'nieodmienny' },
  bardzo: { id: 'bardzo', tekst: 'bardzo', lemat: 'bardzo', rodzaj: 'nieodmienny' },
  i: { id: 'i', tekst: 'i', lemat: 'i', rodzaj: 'nieodmienny' },
  pod: { id: 'pod', tekst: 'pod', lemat: 'pod', rodzaj: 'nieodmienny' },
  // blok 2
  pies: { id: 'pies', tekst: 'pies', lemat: 'pies', rodzaj: 'rzeczownik', liczba: ['pies', 'psy'] },
  czyta: {
    id: 'czyta',
    tekst: 'czyta',
    lemat: 'czytać',
    rodzaj: 'czasownik',
    czasownik: czas(['czytam', 'czyta', 'czytamy', 'czytają'], ['czytałem', 'czytał', 'czytaliśmy', 'czytali'], 'czytać'),
  },
  jutro: { id: 'jutro', tekst: 'jutro', lemat: 'jutro', rodzaj: 'nieodmienny' },
  drzewo: { id: 'drzewo', tekst: 'drzewo', lemat: 'drzewo', rodzaj: 'rzeczownik', liczba: ['drzewo', 'drzewa'] },
  szybko: { id: 'szybko', tekst: 'szybko', lemat: 'szybko', rodzaj: 'nieodmienny' },
  wysoki: { id: 'wysoki', tekst: 'wysoki', lemat: 'wysoki', rodzaj: 'przymiotnik', liczba: ['wysoki', 'wysokie'] },
  na: { id: 'na', tekst: 'na', lemat: 'na', rodzaj: 'nieodmienny' },
  biegnie: {
    id: 'biegnie',
    tekst: 'biegnie',
    lemat: 'biec',
    rodzaj: 'czasownik',
    czasownik: czas(['biegnę', 'biegnie', 'biegniemy', 'biegną'], ['biegłem', 'biegł', 'biegliśmy', 'biegli'], 'biec'),
  },
  ale: { id: 'ale', tekst: 'ale', lemat: 'ale', rodzaj: 'nieodmienny' },
  ryba: { id: 'ryba', tekst: 'ryba', lemat: 'ryba', rodzaj: 'rzeczownik', liczba: ['ryba', 'ryby'] },
  czesto: { id: 'czesto', tekst: 'często', lemat: 'często', rodzaj: 'nieodmienny' },
  przy: { id: 'przy', tekst: 'przy', lemat: 'przy', rodzaj: 'nieodmienny' },
  // blok 3
  maly: { id: 'maly', tekst: 'mały', lemat: 'mały', rodzaj: 'przymiotnik', liczba: ['mały', 'małe'] },
  pic: {
    id: 'pic',
    tekst: 'pije',
    lemat: 'pić',
    rodzaj: 'czasownik',
    czasownik: czas(['piję', 'pije', 'pijemy', 'piją'], ['piłem', 'pił', 'piliśmy', 'pili'], 'pić'),
  },
  mleko: { id: 'mleko', tekst: 'mleko', lemat: 'mleko', rodzaj: 'rzeczownik', liczba: ['mleko', 'mleka'] },
  dzis: { id: 'dzis', tekst: 'dziś', lemat: 'dziś', rodzaj: 'nieodmienny' },
  spiewac: {
    id: 'spiewac',
    tekst: 'śpiewa',
    lemat: 'śpiewać',
    rodzaj: 'czasownik',
    czasownik: czas(['śpiewam', 'śpiewa', 'śpiewamy', 'śpiewają'], ['śpiewałem', 'śpiewał', 'śpiewaliśmy', 'śpiewali'], 'śpiewać'),
  },
  glosno: { id: 'glosno', tekst: 'głośno', lemat: 'głośno', rodzaj: 'nieodmienny' },
};

export const wyraz = (id: string): Wyraz => {
  const w = WYRAZY[id];
  if (!w) throw new Error(`L13: nieznany wyraz ${id}`);
  return w;
};

// ── Blok 1: odmieniarka ──

/** Skrzynia z łodzi — kolejność rozrzucona. */
export const SKRZYNIA = ['kot', 'wczoraj', 'plynie', 'bardzo', 'zielony', 'i', 'lodka', 'pod'];

/** Wszystkie formy, jakie maszyna może wydać dla wyrazu (bez powtórzeń). */
export function wszystkieFormy(w: Wyraz): string[] {
  const out = new Set<string>();
  for (const ile of KOLEJ.ile) for (const kto of KOLEJ.kto) for (const kiedy of KOLEJ.kiedy) out.add(forma(w, { ile, kto, kiedy }));
  return [...out];
}

/** Co zrobiła dźwignia: forma przed i po pociągnięciu. */
export function skutek(w: Wyraz, d: Dzwignie, k: Dzwignia): { przed: string; po: string; zmiana: boolean; d: Dzwignie } {
  const nd = pociagnij(d, k);
  const przed = forma(w, d);
  const po = forma(w, nd);
  return { przed, po, zmiana: przed !== po, d: nd };
}

/** Wynik wyrazu po próbach: ustalony dopiero, gdy pociągnięto wszystkie trzy dźwignie. */
export function wynikProb(w: Wyraz, pociagniete: readonly Dzwignia[], widziane: readonly string[]): 'zmienia' | 'stoi' | null {
  if (!DZWIGNIE.every((k) => pociagniete.includes(k))) return null;
  return new Set([w.tekst, ...widziane]).size > 1 ? 'zmienia' : 'stoi';
}

// ── Blok 2: zwrotnica ──

export type Tor = 'guma' | 'kamien';

/** Taśma: 12 wyrazów, odmienne i nieodmienne rozrzucone. */
export const TASMA = ['pies', 'jutro', 'czyta', 'na', 'drzewo', 'szybko', 'wysoki', 'ale', 'biegnie', 'czesto', 'ryba', 'przy'];

export const torWyrazu = (w: Wyraz): Tor => (odmienny(w) ? 'guma' : 'kamien');

/** Pokaz zmiany dla wyrazu na złym torze: dwie-trzy formy albo „taki sam”. */
export function pokazZmiany(w: Wyraz): string[] {
  return wszystkieFormy(w).slice(0, 3);
}

/** Kolejka po przejeździe wyrazu: dobry tor — wyraz znika, zły — wraca na koniec. */
export function poPrzejezdzie(kolejka: readonly string[], tor: Tor): { kolejka: string[]; trafiony: boolean } {
  const [id, ...reszta] = kolejka;
  const trafiony = torWyrazu(wyraz(id)) === tor;
  return { kolejka: trafiony ? reszta : [...reszta, id], trafiony };
}

// ── Blok 3: zdanie się nie klei ──

export interface Tablica {
  id: string;
  /** Wyrazy zdania; `cel` — forma w poprawnym zdaniu; `stale` — nie do ruszania (już pasuje). */
  wyrazy: { id: string; cel: string; stale?: boolean }[];
  koniec: string;
}

export const TABLICE: Tablica[] = [
  {
    id: 'koty',
    wyrazy: [
      { id: 'dzis', cel: 'Dziś' },
      { id: 'dwa', cel: 'dwa', stale: true },
      { id: 'maly', cel: 'małe' },
      { id: 'kot', cel: 'koty' },
      { id: 'pic', cel: 'piją' },
      { id: 'mleko', cel: 'mleko' },
    ],
    koniec: '.',
  },
  {
    id: 'spiew',
    wyrazy: [
      { id: 'jutro', cel: 'Jutro' },
      { id: 'my', cel: 'my', stale: true },
      { id: 'spiewac', cel: 'będziemy śpiewać' },
      { id: 'glosno', cel: 'głośno' },
    ],
    koniec: '.',
  },
];

/** Forma wyrazu na tablicy przed naprawą: forma słownikowa (pierwszy wyraz wielką literą). */
export function naTablicy(t: Tablica, i: number, wstawione: Record<string, string>): string {
  const x = t.wyrazy[i];
  const tekst = wstawione[x.id] ?? (x.stale ? x.cel : wyraz(x.id).lemat);
  return i === 0 ? tekst[0].toUpperCase() + tekst.slice(1) : tekst;
}

const bezWielkiej = (s: string) => s.toLowerCase();

/**
 * Czy wyraz na tablicy pasuje (porównanie bez wielkiej litery na początku
 * zdania). Każdy wyraz poza stałymi musi przejść przez maszynę — także ten,
 * którego forma słownikowa przypadkiem pasuje (nieodmienne maszyna oddaje od razu).
 */
export function pasuje(t: Tablica, i: number, wstawione: Record<string, string>): boolean {
  const x = t.wyrazy[i];
  if (x.stale) return true;
  const teraz = wstawione[x.id];
  return teraz !== undefined && bezWielkiej(teraz) === bezWielkiej(x.cel);
}

export const tablicaGotowa = (t: Tablica, wstawione: Record<string, string>) => t.wyrazy.every((_, i) => pasuje(t, i, wstawione));

/** Nieodmienny wyraz maszyna oddaje od razu — pasuje w każdym zdaniu. */
export function oddajOdRazu(id: string): boolean {
  return !odmienny(wyraz(id));
}

/** Wyrazy z bloków 1–2, które zostają w magazynie wyspy. */
export const DO_MAGAZYNU = [...SKRZYNIA, ...TASMA];
