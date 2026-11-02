/**
 * L11 „Słowa mają kolor” — dane i sędziowie trzech bloków (teksty T-L11-1,
 * napisane dla kursu). Czysta logika (selftest `scripts/polski-l11-selftest.mjs`).
 *
 * Zabarwienie to obszar, gdzie najłatwiej o klucz autora, więc w danych stoją
 * tylko wyrazy, o które dorosły by się nie spierał: zdrobnienie albo
 * zgrubienie widać w budowie słowa (`znak`), a wyrazy bez znacznika
 * (*buda*, *klitka*, *skwar*) każdy słownik opatruje kwalifikatorem. Każde
 * miejsce stoi w przypadku, który nie wymaga uzgadniania z resztą zdania —
 * po przeskoku zdanie zostaje poprawne bez zmiany innych słów.
 */

/** −1 narzekanie, 0 zwyczajnie, 1 zachwyt. */
export type Biegun = -1 | 0 | 1;

export interface Wyraz {
  /** Forma w zdaniu. */
  tekst: string;
  /** Kawałek formy, który niesie opinię (pogrubiany w szufladce). */
  znak?: string;
  /** Jedno zdanie dla dziecka: skąd widać opinię. */
  cecha?: string;
}

/** Miejsce w tekście: trzy wyrazy bliskoznaczne — [narzekanie, zwyczajnie, zachwyt]. */
export interface Miejsce {
  id: string;
  przed: string;
  po: string;
  wyrazy: [Wyraz, Wyraz, Wyraz];
}

export const wyraz = (m: Miejsce, b: Biegun): Wyraz => m.wyrazy[b + 1];

// ── Blok 1: pokrętło nastroju ──

/** Zapadki pokrętła od lewej do prawej. */
export const ZAPADKI = [
  { d: -2, label: 'narzekanie' },
  { d: -1, label: 'marudnie' },
  { d: 0, label: 'zwyczajnie' },
  { d: 1, label: 'miło' },
  { d: 2, label: 'zachwyt' },
] as const;

export type Zapadka = (typeof ZAPADKI)[number]['d'];

export interface MiejsceOpisu extends Miejsce {
  /** Od której zapadki (|d|) miejsce przeskakuje z „zwyczajnie”. */
  prog: 1 | 2;
}

export const OPIS: MiejsceOpisu[] = [
  {
    id: 'spacer',
    przed: 'Po godzinnym',
    po: 'przez las doszliśmy nad jezioro.',
    prog: 1,
    wyrazy: [{ tekst: 'łażeniu' }, { tekst: 'spacerze' }, { tekst: 'spacerku', znak: 'k' }],
  },
  {
    id: 'pies',
    przed: 'Na pomoście bawiliśmy się z',
    po: 'rybaka.',
    prog: 2,
    wyrazy: [{ tekst: 'psiskiem', znak: 'isk' }, { tekst: 'psem' }, { tekst: 'pieskiem', znak: 'k' }],
  },
  {
    id: 'dom',
    przed: 'Rybak mieszka w',
    po: 'tuż nad wodą.',
    prog: 1,
    wyrazy: [{ tekst: 'budzie' }, { tekst: 'domu' }, { tekst: 'domku', znak: 'k' }],
  },
  {
    id: 'lodka',
    przed: 'Popłynęliśmy',
    po: 'na środek jeziora.',
    prog: 2,
    wyrazy: [{ tekst: 'łajbą' }, { tekst: 'łódką' }, { tekst: 'łódeczką', znak: 'eczk' }],
  },
  {
    id: 'slonce',
    przed: 'Potem leżeliśmy na trawie w',
    po: '.',
    prog: 1,
    wyrazy: [{ tekst: 'skwarze' }, { tekst: 'słońcu' }, { tekst: 'słoneczku', znak: 'eczk' }],
  },
  {
    id: 'zupa',
    przed: 'Na koniec zjedliśmy',
    po: 'zupę z termosu.',
    prog: 2,
    wyrazy: [{ tekst: 'byle jaką' }, { tekst: 'dobrą' }, { tekst: 'pyszną' }],
  },
];

/** Który wyraz stoi w miejscu przy danej zapadce. */
export function biegunPrzy(m: MiejsceOpisu, d: Zapadka): Biegun {
  if (d >= m.prog) return 1;
  if (d <= -m.prog) return -1;
  return 0;
}

/** Zapadka najbliższa kątowi (stopnie; −100 lewa skrajna … 100 prawa skrajna). */
export const KAT_SKRAJNY = 100;
export function zapadkaZKata(kat: number): Zapadka {
  const krok = KAT_SKRAJNY / 2;
  const i = Math.round(Math.max(-KAT_SKRAJNY, Math.min(KAT_SKRAJNY, kat)) / krok);
  return (Number.isFinite(i) ? i : 0) as Zapadka;
}
export const katZapadki = (d: Zapadka) => d * (KAT_SKRAJNY / 2);

/**
 * Kąt wskazówki z punktu względem środka pokrętła (y w dół, jak na ekranie).
 * 0° = góra, dodatnie w prawo; zaokrąglone do stopnia, przycięte do skrajów.
 * Punkt pod środkiem (dolna połowa) przykleja się do bliższego skraju.
 */
export function katZPunktu(dx: number, dy: number): number {
  if (dx === 0 && dy === 0) return 0;
  const kat = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return Math.round(Math.max(-KAT_SKRAJNY, Math.min(KAT_SKRAJNY, kat)));
}

/** Blok 1 zalicza dojście do obu skrajów. */
export const pokretloGotowe = (odwiedzone: readonly number[]) => odwiedzone.includes(-2) && odwiedzone.includes(2);

// ── Blok 2: zacięte pokrętło (pocztówka) ──

export const POCZTOWKA_NAGLOWEK = 'Kochana Babciu!';
export const POCZTOWKA_PODPIS = 'Ściskam — Antek';

export const POCZTOWKA: Miejsce[] = [
  {
    id: 'pokoj',
    przed: 'Pozdrawiam znad morza. Mieszkamy w',
    po: 'z oknem na plażę.',
    wyrazy: [
      { tekst: 'klitce', cecha: 'Klitka to ciasny, ponury pokój — samo słowo narzeka.' },
      { tekst: 'pokoju' },
      { tekst: 'pokoiku', znak: 'ik', cecha: 'Zdrobnienie: -ik robi z pokoju coś miłego.' },
    ],
  },
  {
    id: 'ptaki',
    przed: 'Rano budzą nas',
    po: 'za oknem.',
    wyrazy: [
      { tekst: 'ptaszyska', znak: 'ysk', cecha: 'Zgrubienie: -ysko robi z ptaków coś wielkiego i natrętnego.' },
      { tekst: 'ptaki' },
      { tekst: 'ptaszki', znak: 'szk', cecha: 'Zdrobnienie: -szek robi z ptaków coś małego i miłego.' },
    ],
  },
  {
    id: 'kot',
    przed: 'Do kuchni zagląda',
    po: 'gospodyni.',
    wyrazy: [
      { tekst: 'kocisko', znak: 'isk', cecha: 'Zgrubienie: -isko — tak się mówi o kocie, którego się nie lubi.' },
      { tekst: 'kot' },
      { tekst: 'kotek', znak: 'ek', cecha: 'Zdrobnienie: -ek — tak się mówi o kocie, którego się lubi.' },
    ],
  },
  {
    id: 'zamek',
    przed: 'Wczoraj zbudowaliśmy z piasku',
    po: '.',
    wyrazy: [
      { tekst: 'zamczysko', znak: 'ysk', cecha: 'Zgrubienie: -ysko robi z zamku coś ponurego.' },
      { tekst: 'zamek' },
      { tekst: 'zameczek', znak: 'eczek', cecha: 'Zdrobnienie: -eczek robi z zamku coś uroczego.' },
    ],
  },
  {
    id: 'rece',
    przed: 'Mamy',
    po: 'całe w piasku.',
    wyrazy: [
      { tekst: 'łapska', znak: 'sk', cecha: 'Zgrubienie: łapa z -sko to już nie ręka, tylko coś niezgrabnego.' },
      { tekst: 'ręce' },
      { tekst: 'rączki', znak: 'czk', cecha: 'Zdrobnienie: -czki robi z rąk coś małego i miłego.' },
    ],
  },
  {
    id: 'nos',
    przed: 'A Kuba ma',
    po: 'czerwony od słońca.',
    wyrazy: [
      { tekst: 'nochal', znak: 'chal', cecha: 'Nochal to wielki nos — tak mówi ktoś, kto się z kogoś śmieje.' },
      { tekst: 'nos' },
      { tekst: 'nosek', znak: 'ek', cecha: 'Zdrobnienie: -ek robi z nosa coś małego i miłego.' },
    ],
  },
];

/** Stan pocztówki na starcie: trzy słowa narzekania i trzy zachwytu. */
export const POCZTOWKA_START: Record<string, Biegun> = { pokoj: -1, ptaki: -1, kot: 1, zamek: 1, rece: 1, nos: -1 };

export type WerdyktPocztowki =
  | { ok: true; zgodne: string[] }
  | { ok: false; powod: 'brak-wyboru' }
  | { ok: false; powod: 'odstaja'; odstaja: string[] }
  | { ok: false; powod: 'zwyczajnie'; zgodne: string[] };

/** Ile słów musi nieść wybrany nastrój, żeby babcia go wyczytała. */
export const MIN_ZGODNYCH = 3;

/**
 * Pocztówka jest spójna, gdy żadne słowo nie niesie przeciwnej opinii,
 * a co najmniej `MIN_ZGODNYCH` niesie wybraną. Wyrazy zwyczajne nie przeszkadzają.
 */
export function ocenPocztowke(cel: Biegun | null, stan: Record<string, Biegun>): WerdyktPocztowki {
  if (cel !== 1 && cel !== -1) return { ok: false, powod: 'brak-wyboru' };
  const b = (id: string) => stan[id] ?? 0;
  const odstaja = POCZTOWKA.filter((m) => b(m.id) === -cel).map((m) => m.id);
  if (odstaja.length) return { ok: false, powod: 'odstaja', odstaja };
  const zgodne = POCZTOWKA.filter((m) => b(m.id) === cel).map((m) => m.id);
  if (zgodne.length < MIN_ZGODNYCH) return { ok: false, powod: 'zwyczajnie', zgodne };
  return { ok: true, zgodne };
}

// ── Blok 3: lustro antonimów ──

export interface Rzecz {
  id: string;
  /** Podpis w scenie; `slowo` — wyraz, którego przeciwieństwa szukamy. */
  przed: string;
  slowo: string;
  po: string;
  /** Wyraz przeciwstawny (karta, która daje ostre odbicie). */
  przeciwne: string;
  /** Zmyłka: słowo tylko inne, z wyjaśnieniem lustra. */
  inne?: { slowo: string; lustro: string };
}

export const RZECZY: Rzecz[] = [
  { id: 'kubek', przed: '', slowo: 'pełny', po: ' kubek', przeciwne: 'pusty', inne: { slowo: 'zielony', lustro: 'Zielony kubek może być pełny. To słowo jest inne, ale nie przeciwne.' } },
  { id: 'okno', przed: '', slowo: 'otwarte', po: ' okno', przeciwne: 'zamknięte', inne: { slowo: 'drewniane', lustro: 'Drewniane okno może być otwarte. To słowo jest inne, ale nie przeciwne.' } },
  { id: 'wieza', przed: '', slowo: 'wysoka', po: ' wieża', przeciwne: 'niska' },
  { id: 'pora', przed: '', slowo: 'rano', po: '', przeciwne: 'wieczorem' },
  { id: 'herbata', przed: '', slowo: 'ciepła', po: ' herbata', przeciwne: 'zimna', inne: { slowo: 'słodka', lustro: 'Słodka herbata może być ciepła. To słowo jest inne, ale nie przeciwne.' } },
  { id: 'drzwi', przed: '', slowo: 'wejście', po: '', przeciwne: 'wyjście' },
];

/** Karty na tacy w stałej, wymieszanej kolejności (przeciwne rozrzucone między zmyłkami). */
export const KARTY: string[] = ['niska', 'zielony', 'wyjście', 'zimna', 'drewniane', 'pusty', 'wieczorem', 'słodka', 'zamknięte'];

export type Odbicie =
  | { rodzaj: 'puste' }
  | { rodzaj: 'ostre'; rzecz: string }
  | { rodzaj: 'krzywe'; rzecz: string; lustro: string }
  | { rodzaj: 'mgla'; rzecz: string };

/** Co pokazuje lustro nad rzeczą (indeks w `RZECZY`) z kartą przed sobą. */
export function odbicie(rzecz: number, karta: string | null): Odbicie {
  if (karta == null) return { rodzaj: 'puste' };
  const r = RZECZY[rzecz];
  if (!r) return { rodzaj: 'puste' };
  if (karta === r.przeciwne) return { rodzaj: 'ostre', rzecz: r.id };
  if (r.inne && karta === r.inne.slowo) return { rodzaj: 'krzywe', rzecz: r.id, lustro: r.inne.lustro };
  return { rodzaj: 'mgla', rzecz: r.id };
}

/** Rzecz pod lustrem z położenia lustra (0…1 szerokości sceny). */
export function rzeczPod(p: number): number {
  if (!Number.isFinite(p)) return 0;
  return Math.max(0, Math.min(RZECZY.length - 1, Math.floor(p * RZECZY.length)));
}
/** Środek rzeczy `i` (0…1) — tu lustro staje po puszczeniu. */
export const srodekRzeczy = (i: number) => Math.round(((i + 0.5) / RZECZY.length) * 1000) / 1000;

/** Po ilu znalezionych parach pada termin „wyrazy przeciwstawne”. */
export const TERMIN_PO = 3;
export const lustroGotowe = (znalezione: readonly string[]) => RZECZY.every((r) => znalezione.includes(r.id));
