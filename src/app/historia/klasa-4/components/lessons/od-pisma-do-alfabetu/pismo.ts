/**
 * L18 — czyste funkcje i dane lekcji „Po co ludziom pismo”. Bez Reacta,
 * żeby selftest mógł je sprawdzić w Node.
 */
import { plural } from '@/lib/plural';

// ─── Blok 1: magazyn bez pisma ─────────────────────────────────────────────

export type GoodId = 'owca' | 'jeczmien' | 'olej' | 'ryba';

export const GOODS: { id: GoodId; icon: string; one: string; few: string; many: string }[] = [
  { id: 'owca', icon: '🐑', one: 'owca', few: 'owce', many: 'owiec' },
  { id: 'jeczmien', icon: '🌾', one: 'worek jęczmienia', few: 'worki jęczmienia', many: 'worków jęczmienia' },
  { id: 'olej', icon: '🏺', one: 'dzban oliwy', few: 'dzbany oliwy', many: 'dzbanów oliwy' },
  { id: 'ryba', icon: '🐟', one: 'ryba', few: 'ryby', many: 'ryb' },
];

/** O co pyta urzędnik po dostawie — dwa rodzaje z czterech. */
export const ASKED: GoodId[] = ['owca', 'olej'];

export const DELIVERY_SIZE = 12;

export function goodLabel(id: GoodId, n: number): string {
  const g = GOODS.find((x) => x.id === id)!;
  return `${n} ${plural(n, { one: g.one, few: g.few, many: g.many })}`;
}

/**
 * Losuje dostawę: 12 pozycji, owiec 3–5, dzbanów 2–4, reszta jęczmień i ryby,
 * pomieszane. `rand` podawany z zewnątrz (selftest daje własny).
 */
export function makeDelivery(rand: () => number = Math.random): GoodId[] {
  const owce = 3 + Math.floor(rand() * 3);
  const olej = 2 + Math.floor(rand() * 3);
  const rest = DELIVERY_SIZE - owce - olej;
  const jeczmien = Math.ceil(rest / 2);
  const items: GoodId[] = [
    ...Array<GoodId>(owce).fill('owca'),
    ...Array<GoodId>(olej).fill('olej'),
    ...Array<GoodId>(jeczmien).fill('jeczmien'),
    ...Array<GoodId>(rest - jeczmien).fill('ryba'),
  ];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  // dwie takie same pozycje pod rząd są w porządku, ale nie więcej niż dwie
  return items;
}

export function countGoods(items: GoodId[]): Record<GoodId, number> {
  const c: Record<GoodId, number> = { owca: 0, jeczmien: 0, olej: 0, ryba: 0 };
  for (const it of items) c[it]++;
  return c;
}

export interface WarehouseVerdict {
  ok: boolean;
  /** Zdania werdyktu — każde nazywa konkretny rodzaj towaru. */
  lines: string[];
}

/**
 * Sędzia odpowiedzi urzędnikowi. `tally` — znaki odciśnięte na tabliczce
 * (runda 2) albo `null` (runda 1, bez pisma). Gdy odpowiedź jest zła, a
 * tabliczka była, werdykt mówi, czy zawiodła tabliczka (za mało/za dużo
 * znaków), czy odczyt (znaki dobre, odpowiedź inna).
 */
export function judgeWarehouse(
  items: GoodId[],
  answer: Partial<Record<GoodId, number>>,
  tally: Record<GoodId, number> | null
): WarehouseVerdict {
  const truth = countGoods(items);
  const lines: string[] = [];
  let ok = true;
  for (const id of ASKED) {
    const a = answer[id] ?? 0;
    const t = truth[id];
    if (a === t) {
      lines.push(`${cap(goodLabel(id, t))} — zgadza się.`);
      continue;
    }
    ok = false;
    if (!tally) {
      lines.push(`Mówisz ${a}, a przyszło ${goodLabel(id, t)}.`);
    } else if (tally[id] !== t) {
      const diff = t - tally[id];
      lines.push(
        diff > 0
          ? `Przyszło ${goodLabel(id, t)}, a na tabliczce przy tym znaku masz ${tally[id]} ${plural(tally[id], { one: 'kreskę', few: 'kreski', many: 'kresek' })} — ${diff === 1 ? 'jedna dostawa przeszła' : `${diff} dostawy przeszły`} bez znaku.`
          : `Przyszło ${goodLabel(id, t)}, a na tabliczce masz ${tally[id]} ${plural(tally[id], { one: 'kreskę', few: 'kreski', many: 'kresek' })} — odcisnąłeś/łaś za dużo.`
      );
    } else {
      lines.push(`Na tabliczce masz dobrze: ${tally[id]}. Policz kreski jeszcze raz — odpowiedziałeś/łaś ${a}.`);
    }
  }
  return { ok, lines };
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Blok 2: gliniana tabliczka ────────────────────────────────────────────

/** Klin pionowy = 1, klin kątowy = 10 (liczebniki pisma klinowego). */
export type WedgeKind = 'pionowy' | 'katowy';

export interface Wedge {
  kind: WedgeKind;
  /** współrzędne w układzie tabliczki (viewBox 320 × 200) */
  x: number;
  y: number;
}

export const CLAY_W = 320;
export const CLAY_H = 200;
/** Lewy pas tabliczki zajmuje znak towaru — tam się nie pisze. */
export const SIGN_ZONE = 92;

/** Minimalna długość pociągnięcia rylcem (w jednostkach tabliczki). */
export const MIN_STROKE = 10;

/**
 * Pociągnięcie rylcem → rodzaj klina. W dół — pionowy (1); w bok — kątowy
 * (10). Za krótkie albo w górę — `null` (glina tylko się wgniata).
 */
export function strokeToWedge(dx: number, dy: number): WedgeKind | null {
  if (Math.hypot(dx, dy) < MIN_STROKE) return null;
  if (dy > 0 && dy >= Math.abs(dx)) return 'pionowy';
  if (Math.abs(dx) > Math.abs(dy)) return 'katowy';
  return null;
}

export function wedgeValue(wedges: Wedge[]): number {
  return wedges.reduce((s, w) => s + (w.kind === 'katowy' ? 10 : 1), 0);
}

export interface TabletOrder {
  id: string;
  n: number;
  good: 'owca' | 'jeczmien';
}

export const ORDERS: TabletOrder[] = [
  { id: 't1', n: 4, good: 'owca' },
  { id: 't2', n: 23, good: 'owca' },
  { id: 't3', n: 31, good: 'jeczmien' },
];

export interface TabletVerdict {
  ok: boolean;
  text: string;
}

export function judgeTablet(wedges: Wedge[], n: number): TabletVerdict {
  const tens = wedges.filter((w) => w.kind === 'katowy');
  const ones = wedges.filter((w) => w.kind === 'pionowy');
  const value = wedgeValue(wedges);
  const wantT = Math.floor(n / 10);
  const wantO = n % 10;
  if (wedges.length === 0) return { ok: false, text: 'Tabliczka jest jeszcze gładka. Pociągnij rylcem po glinie.' };
  if (value !== n) {
    const parts: string[] = [];
    if (tens.length !== wantT)
      parts.push(
        `${plural(wantT, { one: 'potrzebny jest', few: 'potrzebne są', many: 'potrzeba' })} ${wantT} ${plural(wantT, { one: 'klin kątowy', few: 'kliny kątowe', many: 'klinów kątowych' })} (dziesiątki), a ${tens.length === 1 ? 'jest' : 'masz'} ${tens.length}`
      );
    if (ones.length !== wantO)
      parts.push(
        `${wantO} ${plural(wantO, { one: 'klin pionowy', few: 'kliny pionowe', many: 'klinów pionowych' })} (jedności), a masz ${ones.length}`
      );
    return {
      ok: false,
      text: `Na tabliczce stoi ${value}, a zamówienie mówi ${n}: ${parts.join('; ')}.`,
    };
  }
  if (tens.length && ones.length) {
    const maxTen = Math.max(...tens.map((w) => w.x));
    const minOne = Math.min(...ones.map((w) => w.x));
    if (maxTen > minOne + 4)
      return {
        ok: false,
        text: `Kliny dają ${n}, ale są pomieszane. Pisarz stawiał dziesiątki po lewej, a jedności po prawej — tak jak my piszemy ${n}. Wygładź glinę i odciśnij jeszcze raz.`,
      };
  }
  return { ok: true, text: `Tak! ${n} — ${wantT ? `${wantT} × 10` : ''}${wantT && wantO ? ' i ' : ''}${wantO ? `${wantO} × 1` : ''}. Każdy pisarz w Sumerze odczyta to tak samo.` };
}

// ─── Blok 3: samymi spółgłoskami ───────────────────────────────────────────

const VOWELS = new Set('aąeęioóuy'.split(''));

/** Usuwa samogłoski i odstępy, zostawia wielkie spółgłoski. */
export function toConsonants(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .filter((ch) => /\p{L}/u.test(ch) && !VOWELS.has(ch))
    .join('')
    .toUpperCase();
}

/**
 * Przybliżona zamiana polskich spółgłosek na litery fenickie (22 znaki, tylko
 * spółgłoski). Dwuznaki najpierw. Zapis od prawej do lewej robi widok
 * (`dir="rtl"`), tu zostaje kolejność czytania.
 */
const PHOENICIAN_DI: [string, string][] = [
  ['ch', '\u{10907}'], // ḥet
  ['sz', '\u{10914}'], // šin
  ['cz', '\u{10911}'], // ṣade
  ['rz', '\u{10913}'], // reš
  ['dz', '\u{10906}'], // zajin
];
const PHOENICIAN: Record<string, string> = {
  b: '\u{10901}',
  g: '\u{10902}',
  d: '\u{10903}',
  h: '\u{10904}',
  w: '\u{10905}',
  z: '\u{10906}',
  ź: '\u{10906}',
  ż: '\u{10906}',
  j: '\u{10909}',
  k: '\u{1090A}',
  l: '\u{1090B}',
  ł: '\u{1090B}',
  m: '\u{1090C}',
  n: '\u{1090D}',
  ń: '\u{1090D}',
  s: '\u{1090E}',
  ś: '\u{10914}',
  p: '\u{10910}',
  f: '\u{10910}',
  c: '\u{10911}',
  ć: '\u{10911}',
  q: '\u{10912}',
  r: '\u{10913}',
  t: '\u{10915}',
  x: '\u{1090A}\u{1090E}',
  v: '\u{10905}',
};

export function toPhoenician(text: string): string {
  const s = text.toLowerCase();
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const di = PHOENICIAN_DI.find(([k]) => s.startsWith(k, i));
    if (di) {
      out += di[1];
      i++;
      continue;
    }
    const ch = s[i];
    if (VOWELS.has(ch)) continue;
    if (PHOENICIAN[ch]) out += PHOENICIAN[ch];
  }
  return out;
}

const GREEK: Record<string, string> = {
  a: 'α', ą: 'α', b: 'β', g: 'γ', d: 'δ', e: 'ε', ę: 'ε', z: 'ζ', ź: 'ζ', ż: 'ζ',
  i: 'ι', j: 'ι', k: 'κ', l: 'λ', ł: 'λ', m: 'μ', n: 'ν', ń: 'ν', x: 'ξ',
  o: 'ο', ó: 'ο', p: 'π', r: 'ρ', s: 'σ', ś: 'σ', t: 'τ', u: 'υ', y: 'υ',
  f: 'φ', w: 'β', v: 'β', h: 'χ', c: 'τσ', ć: 'τσ',
};
const GREEK_DI: [string, string][] = [['ch', 'χ'], ['sz', 'σ'], ['cz', 'τσ'], ['rz', 'ρ'], ['ps', 'ψ'], ['th', 'θ']];

/** Przybliżony zapis greckimi literami — z samogłoskami. */
export function toGreek(text: string): string {
  const s = text.toLowerCase();
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === ' ') {
      out += ' ';
      continue;
    }
    const di = GREEK_DI.find(([k]) => s.startsWith(k, i));
    if (di) {
      out += di[1];
      i++;
      continue;
    }
    out += GREEK[s[i]] ?? '';
  }
  // końcowa sigma jak u Greków
  return out.replace(/σ(?=\s|$)/g, 'ς');
}

/** Szkielety z jedną luką na samogłoskę i słowa, które z nich wychodzą. */
export interface Skeleton {
  id: string;
  before: string;
  after: string;
  words: Record<string, string>;
}

export const SKELETONS: Skeleton[] = [
  {
    id: 'kt',
    before: 'K',
    after: 'T',
    words: {
      kot: 'zwierzę, które łapie myszy',
      kat: 'ten, kto dawniej wykonywał wyroki',
      kit: 'masa do uszczelniania okien',
    },
  },
  {
    id: 'ls',
    before: 'L',
    after: 'S',
    words: {
      las: 'dużo drzew w jednym miejscu',
      lis: 'rude zwierzę z puszystym ogonem',
      los: 'to, co się komu przydarzy',
    },
  },
];

export const VOWEL_TILES = ['a', 'e', 'i', 'o', 'u', 'y'];

/** Ile różnych słów trzeba znaleźć w jednym szkielecie, żeby zobaczyć kłopot. */
export const WORDS_NEEDED = 2;

// ─── Blok 4: z głowy wołu litera A ─────────────────────────────────────────

export interface AlefStage {
  id: string;
  glyph: string;
  /** krój: hieroglify, fenicki albo zwykły */
  font: 'egipski' | 'fenicki' | 'grecki' | 'lacinski';
  people: string;
  name: string;
  /** rok historyczny bez zera (−1050 = 1050 p.n.e.) */
  year: number;
  when: string;
  note: string;
}

// Daty przybliżone: hieroglif głowy wołu (F1) — Egipt Starego Państwa;
// alfabet fenicki XI w. p.n.e. (baza F-III.5-02); alfabet grecki ok. VIII w. p.n.e.;
// alfabet łaciński ok. VII w. p.n.e. — https://pl.wikipedia.org/wiki/Alfabet_łaciński
export const ALEF_STAGES: AlefStage[] = [
  {
    id: 'wol',
    glyph: '\u{130FE}',
    font: 'egipski',
    people: 'Egipcjanie',
    name: 'hieroglif „głowa wołu”',
    year: -2500,
    when: 'ok. 2500 p.n.e.',
    note: 'Rysunek oznacza wołu — jedną rzecz. Takich znaków było ponad pięć tysięcy.',
  },
  {
    id: 'alef',
    glyph: '\u{10900}',
    font: 'fenicki',
    people: 'Fenicjanie',
    name: 'alef',
    year: -1050,
    when: 'XI w. p.n.e.',
    note: '„Alef” znaczy po fenicku „wół”, ale znak nie oznacza już wołu, tylko pierwszą głoskę tego słowa. Rysunek stał się literą.',
  },
  {
    id: 'alfa',
    glyph: 'Α',
    font: 'grecki',
    people: 'Grecy',
    name: 'alfa',
    year: -750,
    when: 'VIII w. p.n.e.',
    note: 'Grekom nie była potrzebna fenicka głoska — zrobili z alefu samogłoskę A. Głowa wołu stoi teraz rogami w dół.',
  },
  {
    id: 'a',
    glyph: 'A',
    font: 'lacinski',
    people: 'Rzymianie',
    name: 'A',
    year: -600,
    when: 'VII–VI w. p.n.e.',
    note: 'Rzymianie przejęli litery od Greków (przez sąsiadów Etrusków). Tym alfabetem piszesz dziś po polsku.',
  },
];

/** Obrót potrzebny, żeby znak etapu `i` nałożył się na cień etapu `i + 1`. */
export const ALEF_TURN = [-90, -90, 0];
export const SNAP_DEG = 16;

/** Czy obrót (w stopniach) trafia w cel z tolerancją `SNAP_DEG`. */
export function snaps(rotation: number, target: number): boolean {
  return Math.abs(rotation - target) <= SNAP_DEG;
}
