/**
 * L12 „Słowa w parze” — dane i sędziowie trzech bloków (teksty T-L12-1 i
 * T-L12-2, napisane dla kursu). Czysta logika (selftest
 * `scripts/polski-l12-selftest.mjs`).
 *
 * Zwroty dobrane tak, żeby wynik próby nie zależał od nas: zwykłe połączenia
 * po wymianie słowa na bliskoznaczne naprawdę zostają zdaniem o tym samym,
 * a związki frazeologiczne naprawdę pękają (nikt nie mówi „owady w nosie”).
 * W szufladkach stoją tylko wyrazy bliskoznaczne — pęknięcie nie bierze się
 * z głupiego słowa. Bez zwrotów z wariantami (*bujać w obłokach / w chmurach*).
 */

import { HASLA_KURSU, type ZwrotKursu } from '../../../data/slownik/hasla';

export type RysunekL12 =
  | 'pies-buda'
  | 'muchy-sens'
  | 'muchy-dosl'
  | 'prezent'
  | 'nogi-sens'
  | 'nogi-dosl'
  | 'garsc-sens'
  | 'garsc-dosl'
  | 'kot-kanapa'
  | 'arbuz'
  | 'kark-sens'
  | 'kark-dosl'
  | 'drzwi-cicho'
  | 'wiatr-sens'
  | 'wiatr-dosl'
  | 'zlote-sens'
  | 'zlote-dosl'
  | 'kamien-sens'
  | 'kamien-dosl';

// ── Blok 1: pęknie czy wytrzyma? ──

export interface Pasek {
  id: string;
  przed: string;
  /** Słowo do wycięcia (forma w zdaniu). */
  slowo: string;
  po: string;
  /** Szufladka: wyrazy bliskoznaczne w tej samej formie. */
  szufladka: string[];
  /** Krótka nazwa do dziennika. */
  zwrot: string;
  /** Id związku frazeologicznego w słowniku kursu; brak = zwykłe połączenie. */
  frazeologizm?: string;
  sens: RysunekL12;
  /** Dosłowny obraz po pęknięciu (tylko związki). */
  doslownie?: RysunekL12;
}

export const PASKI: Pasek[] = [
  {
    id: 'szybko',
    przed: 'Pies',
    slowo: 'szybko',
    po: 'uciekł do budy.',
    szufladka: ['prędko', 'migiem'],
    zwrot: 'szybko uciekł',
    sens: 'pies-buda',
  },
  {
    id: 'muchy',
    przed: 'Tymek ma dziś',
    slowo: 'muchy',
    po: 'w nosie.',
    szufladka: ['muszki', 'owady'],
    zwrot: 'mieć muchy w nosie',
    frazeologizm: 'muchy-w-nosie',
    sens: 'muchy-sens',
    doslownie: 'muchy-dosl',
  },
  {
    id: 'prezent',
    przed: 'Ola dostała od babci',
    slowo: 'prezent',
    po: '.',
    szufladka: ['upominek', 'podarunek'],
    zwrot: 'dostała prezent',
    sens: 'prezent',
  },
  {
    id: 'nogi',
    przed: 'Na widok psa listonosz wziął',
    slowo: 'nogi',
    po: 'za pas.',
    szufladka: ['stopy', 'kończyny'],
    zwrot: 'wziąć nogi za pas',
    frazeologizm: 'nogi-za-pas',
    sens: 'nogi-sens',
    doslownie: 'nogi-dosl',
  },
  {
    id: 'garsc',
    przed: 'Tymek spadł z roweru, ale wziął się w',
    slowo: 'garść',
    po: 'i jechał dalej.',
    szufladka: ['dłoń', 'rękę'],
    zwrot: 'wziąć się w garść',
    frazeologizm: 'wziac-sie-w-garsc',
    sens: 'garsc-sens',
    doslownie: 'garsc-dosl',
  },
  {
    id: 'kanapa',
    przed: 'Kot śpi na',
    slowo: 'kanapie',
    po: '.',
    szufladka: ['sofie', 'wersalce'],
    zwrot: 'śpi na kanapie',
    sens: 'kot-kanapa',
  },
  {
    id: 'arbuz',
    przed: 'Mama kupiła',
    slowo: 'duży',
    po: 'arbuz.',
    szufladka: ['wielki', 'ogromny'],
    zwrot: 'duży arbuz',
    sens: 'arbuz',
  },
  {
    id: 'kark',
    przed: 'Ola ma głowę na',
    slowo: 'karku',
    po: '— zawsze wie, co zabrać na wycieczkę.',
    szufladka: ['szyi'],
    zwrot: 'mieć głowę na karku',
    frazeologizm: 'glowa-na-karku',
    sens: 'kark-sens',
    doslownie: 'kark-dosl',
  },
  {
    id: 'cicho',
    przed: 'Zuzia',
    slowo: 'cicho',
    po: 'zamknęła drzwi.',
    szufladka: ['bezgłośnie', 'po cichu'],
    zwrot: 'cicho zamknęła',
    sens: 'drzwi-cicho',
  },
  {
    id: 'wiatr',
    przed: 'Tymek nigdy nie rzuca słów na',
    slowo: 'wiatr',
    po: '.',
    szufladka: ['wietrzyk', 'wicher'],
    zwrot: 'rzucać słowa na wiatr',
    frazeologizm: 'slowa-na-wiatr',
    sens: 'wiatr-sens',
    doslownie: 'wiatr-dosl',
  },
];

export type Wynik = 'wytrzymalo' | 'peklo';

/** Wpis w dzienniku śledztwa: co dziecko wkleiło i co się stało. */
export interface Proba {
  wklejone: string;
  wynik: Wynik;
}
export type Dziennik = Record<string, Proba>;

export const pasek = (id: string): Pasek | undefined => PASKI.find((p) => p.id === id);

/** Wynik próby wynika z samego zwrotu: związek frazeologiczny pęka po każdej wymianie. */
export function probuj(p: Pasek, wklejone: string): Proba {
  if (!p.szufladka.includes(wklejone)) throw new Error(`L12: „${wklejone}” nie ma w szufladce paska ${p.id}`);
  return { wklejone, wynik: p.frazeologizm ? 'peklo' : 'wytrzymalo' };
}

/** Zdanie po wymianie słowa. */
export function poWymianie(p: Pasek, slowo: string): string {
  return `${p.przed} ${slowo}${/^[.,!?]/.test(p.po) ? '' : ' '}${p.po}`;
}

export function zwrotKursu(id: string): ZwrotKursu | undefined {
  for (const h of Object.values(HASLA_KURSU)) {
    const z = h.zwroty?.find((x) => x.id === id);
    if (z) return z;
  }
  return undefined;
}

// ── Cięcie nożyczkami: linia wokół słowa ──

export const TOLERANCJA_PX = 12;
export const PROG_CIECIA = 0.8;

/** Punkty kontrolne na obwodzie prostokąta wokół słowa (co ok. `krok` px). */
export function punktyObwodu(w: number, h: number, krok = 8): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const obw = 2 * (w + h);
  const n = Math.max(12, Math.round(obw / krok));
  for (let i = 0; i < n; i++) {
    let d = (i / n) * obw;
    if (d < w) pts.push({ x: d, y: 0 });
    else if ((d -= w) < h) pts.push({ x: w, y: d });
    else if ((d -= h) < w) pts.push({ x: w - d, y: h });
    else pts.push({ x: 0, y: h - (d - w) });
  }
  return pts.map((p) => ({ x: Math.round(p.x), y: Math.round(p.y) }));
}

/** Odległość punktu od obwodu prostokąta [0,w]×[0,h]. */
export function odObwodu(x: number, y: number, w: number, h: number): number {
  const wewnatrz = x >= 0 && x <= w && y >= 0 && y <= h;
  if (wewnatrz) return Math.min(x, w - x, y, h - y);
  const dx = Math.max(0, -x, x - w);
  const dy = Math.max(0, -y, y - h);
  return Math.hypot(dx, dy);
}

/**
 * Odcinek ruchu nożyczek (a → b) zalicza punkty obwodu, przy których przeszedł
 * w tolerancji — tylko gdy oba końce leżą przy linii (ruch na skróty przez
 * środek słowa nic nie tnie). Zwraca nowy zbiór zaliczonych indeksów.
 */
export function tnij(
  zaliczone: ReadonlySet<number>,
  pts: readonly { x: number; y: number }[],
  a: { x: number; y: number },
  b: { x: number; y: number },
  w: number,
  h: number,
  tol = TOLERANCJA_PX
): Set<number> {
  const out = new Set(zaliczone);
  if (odObwodu(a.x, a.y, w, h) > tol || odObwodu(b.x, b.y, w, h) > tol) return out;
  const kroki = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 4));
  for (let k = 0; k <= kroki; k++) {
    const x = a.x + ((b.x - a.x) * k) / kroki;
    const y = a.y + ((b.y - a.y) * k) / kroki;
    if (odObwodu(x, y, w, h) > tol) return out;
    pts.forEach((p, i) => {
      if (Math.hypot(p.x - x, p.y - y) <= tol) out.add(i);
    });
  }
  return out;
}

export const wycietoDosc = (zaliczone: ReadonlySet<number>, n: number) => zaliczone.size / n >= PROG_CIECIA;

// ── Blok 2: dwie półki ──

export type Polka = Wynik;

export type OcenaOdlozenia = { ok: true } | { ok: false; powod: 'brak-proby' } | { ok: false; powod: 'inna-polka'; proba: Proba };

/** Werdykt porównuje z dziennikiem dziecka, nie z naszą listą. */
export function odloz(id: string, polka: Polka, dziennik: Dziennik): OcenaOdlozenia {
  const proba = dziennik[id];
  if (!proba) return { ok: false, powod: 'brak-proby' };
  if (proba.wynik !== polka) return { ok: false, powod: 'inna-polka', proba };
  return { ok: true };
}

/** Pierwszy związek z półki „pękło” w kolejności odkładania — przykład do wyjaśnienia. */
export function przykladZPolki(kolejnosc: readonly string[], dziennik: Dziennik): Pasek | undefined {
  return kolejnosc.map(pasek).find((p) => p && p.frazeologizm && dziennik[p.id]?.wynik === 'peklo');
}

// ── Blok 3: Zuzia słucha babci ──

export interface ZdanieOpowiesci {
  tekst: string;
  /** Związek frazeologiczny w zdaniu, który Zuzia rozumie dosłownie. */
  zwrot?: string;
  /** Pytanie Zuzi do dosłownego obrazu i jej „aha” po objaśnieniu. */
  zuziaPyta?: string;
  zuziaRozumie?: string;
  doslownie?: RysunekL12;
  sens?: RysunekL12;
}

export const OPOWIESC: ZdanieOpowiesci[] = [
  { tekst: 'Wczoraj dziadek poszedł do parku z karmnikiem dla ptaków.' },
  {
    tekst: 'Dziadek ma złote ręce, bo ten karmnik zrobił sam.',
    zwrot: 'zlote-rece',
    zuziaPyta: 'Dziadek ma ręce ze złota? Błyszczą?',
    zuziaRozumie: 'Aha! Dziadek umie wszystko zrobić sam.',
    doslownie: 'zlote-dosl',
    sens: 'zlote-sens',
  },
  {
    tekst: 'Nagle zza krzaka wyskoczył wielki pies sąsiadów i dziadek wziął nogi za pas.',
    zwrot: 'nogi-za-pas',
    zuziaPyta: 'Dziadek przywiązał sobie nogi do paska? To jak on chodził?',
    zuziaRozumie: 'Aha! Dziadek szybko uciekł.',
    doslownie: 'nogi-dosl',
    sens: 'nogi-sens',
  },
  { tekst: 'Okazało się, że pies chciał się tylko bawić.' },
  {
    tekst: 'Kiedy dziadek to zobaczył, kamień spadł mu z serca.',
    zwrot: 'kamien-z-serca',
    zuziaPyta: 'Dziadek miał kamień w sercu? Nie bolało?',
    zuziaRozumie: 'Aha! Dziadkowi ulżyło, już się nie bał.',
    doslownie: 'kamien-dosl',
    sens: 'kamien-sens',
  },
];

/** Hasła, pod którymi stoi zwrot (zwykle jedno). */
export function haslaZwrotu(id: string): string[] {
  return Object.values(HASLA_KURSU)
    .filter((h) => h.zwroty?.some((z) => z.id === id))
    .map((h) => h.haslo);
}

export type OcenaObjasnienia = { ok: true } | { ok: false; powod: 'inny-zwrot'; podany: ZwrotKursu };

/** Rozstrzyga słownik: objaśnienie pasuje, gdy pochodzi z wpisu tego samego zwrotu. */
export function ocenObjasnienie(oczekiwany: string, podany: string): OcenaObjasnienia {
  if (oczekiwany === podany) return { ok: true };
  const z = zwrotKursu(podany);
  if (!z) throw new Error(`L12: nieznany zwrot ${podany}`);
  return { ok: false, powod: 'inny-zwrot', podany: z };
}

/**
 * Co mówi otwarte hasło, kiedy Zuzia czeka na zwrot `szukany`: „jest”, „nie ma
 * tu tego zwrotu, ale słowo z niego” (szukaj pod innym wyrazem) albo „to hasło
 * nie ma nic wspólnego ze zwrotem”.
 */
export function coWHasle(haslo: string, szukany: string | undefined): 'jest' | 'pod-innym' | 'obok' | 'brak-hasla' {
  const h = HASLA_KURSU[haslo];
  if (!h) return 'brak-hasla';
  if (!szukany) return 'obok';
  if (h.zwroty?.some((z) => z.id === szukany)) return 'jest';
  if (slowaZwrotu(szukany).includes(haslo)) return 'pod-innym';
  return 'obok';
}

/** Wyrazy zwrotów z opowieści, które są hasłami słownika kursu (podane wprost, bez zgadywania odmiany). */
export const WYRAZY_ZWROTU: Record<string, string[]> = {
  'zlote-rece': ['złoty', 'ręka'],
  'nogi-za-pas': ['noga', 'pas'],
  'kamien-z-serca': ['kamień', 'serce'],
};

export const slowaZwrotu = (id: string): string[] => WYRAZY_ZWROTU[id] ?? [];
