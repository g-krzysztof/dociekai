/**
 * Datowanie na Osi dziejów — czyste funkcje, bez Reacta.
 *
 * **Roku zero nie ma.** Rok historyczny to liczba całkowita różna od zera:
 * `-44` = 44 r. p.n.e., `1918` = 1918 r. (n.e.). Po 1 r. p.n.e. od razu
 * następuje 1 r. n.e. — to jest ta sama szczelina, którą dziecko odkrywa w L8
 * („Ile lat żył Oktawian August?”), więc oś ją rysuje, zamiast ją ukrywać.
 *
 * Do rachunków służy rok astronomiczny (ciągły, z zerem): 1 r. p.n.e. = 0,
 * 2 r. p.n.e. = −1. Nigdy nie pokazujemy go dziecku.
 */

/** Jak wydarzenie jest datowane — tak, jak mówi o nim lekcja, a nie „na siłę co do roku”. */
export type Dating =
  /** Konkretny rok; `approx` → „ok. 3400 p.n.e.”. */
  | { kind: 'year'; year: number; approx?: boolean }
  /** Wiek: `century: 5` = V w. n.e., `century: -11` = XI w. p.n.e.; na osi — środek wieku. */
  | { kind: 'century'; century: number; part?: 'poczatek' | 'polowa' | 'koniec' }
  /** Przedział lat, np. panowanie; na osi — pasek od–do. */
  | { kind: 'range'; from: number; to: number; approx?: boolean }
  /** „Ok. 300 000 lat temu” — dla pradziejów, gdzie rok nic dziecku nie mówi. */
  | { kind: 'ago'; years: number };

/** Rok historyczny (bez zera) → astronomiczny (ciągły). */
export function toAstro(year: number): number {
  if (!Number.isInteger(year) || year === 0) {
    throw new Error(`Rok historyczny musi być liczbą całkowitą różną od zera, jest: ${year}`);
  }
  return year < 0 ? year + 1 : year;
}

/** Rok astronomiczny → historyczny (0 → −1, czyli 1 r. p.n.e.). */
export function fromAstro(astro: number): number {
  return astro <= 0 ? astro - 1 : astro;
}

/** Ile lat minęło od roku `a` do roku `b` (historycznych) — bez roku zero: od −1 do 1 mija 1 rok. */
export function yearsBetween(a: number, b: number): number {
  return toAstro(b) - toAstro(a);
}

const ROMAN: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
];

export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) throw new Error(`Poza zakresem cyfr rzymskich: ${n}`);
  let rest = n;
  let out = '';
  for (const [value, glyph] of ROMAN) {
    while (rest >= value) {
      out += glyph;
      rest -= value;
    }
  }
  return out;
}

/** Wiek, do którego należy rok: 1 = I w. (lata 1–100), 2000 = XX w., 2001 = XXI w.; −1…−100 = I w. p.n.e. */
export function centuryOf(year: number): number {
  toAstro(year);
  const sign = year < 0 ? -1 : 1;
  return sign * Math.ceil(Math.abs(year) / 100);
}

/**
 * Rok, w którym wydarzenie stoi na osi (astronomiczny, może być ułamkowy dla
 * wieków). `now` — bieżący rok, potrzebny tylko dla „lat temu”.
 */
export function anchorAstro(dating: Dating, now: number): number {
  switch (dating.kind) {
    case 'year':
      return toAstro(dating.year);
    case 'range':
      return (toAstro(dating.from) + toAstro(dating.to)) / 2;
    case 'ago':
      return toAstro(now) - dating.years;
    case 'century': {
      // I w. n.e. = lata 1–100 (astro 1–100); I w. p.n.e. = lata −100…−1 (astro −99…0).
      const c = dating.century;
      const start = c > 0 ? (c - 1) * 100 + 1 : c * 100 + 1;
      const offset = dating.part === 'poczatek' ? 15 : dating.part === 'koniec' ? 85 : 50;
      return start + offset - 0.5;
    }
  }
}

/** Po której stronie szczeliny roku zero leży wydarzenie. */
export function isBeforeCommonEra(dating: Dating, now: number): boolean {
  return anchorAstro(dating, now) < 0.5;
}

const era = (year: number) => (year < 0 ? `${-year} p.n.e.` : `${year}`);

/** Spacja twarda co trzy cyfry w liczbach od 10 000 — tak piszą polskie podręczniki. */
export function formatThousands(n: number): string {
  const s = String(Math.abs(n));
  if (s.length < 5) return (n < 0 ? '−' : '') + s;
  return (n < 0 ? '−' : '') + s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Datowanie po polsku, jak w podręczniku: „ok. 3400 p.n.e.”, „XI w. p.n.e.”, „1333–1370”. */
export function formatDating(dating: Dating): string {
  switch (dating.kind) {
    case 'year':
      return `${dating.approx ? 'ok. ' : ''}${dating.year < 0 ? `${formatThousands(-dating.year)} p.n.e.` : dating.year}`;
    case 'range': {
      const prefix = dating.approx ? 'ok. ' : '';
      if (dating.from < 0 && dating.to < 0) return `${prefix}${-dating.from}–${-dating.to} p.n.e.`;
      return `${prefix}${era(dating.from)}–${era(dating.to)}`;
    }
    case 'ago':
      return `ok. ${formatThousands(dating.years)} lat temu`;
    case 'century': {
      const part =
        dating.part === 'poczatek' ? 'pocz. ' : dating.part === 'polowa' ? 'poł. ' : dating.part === 'koniec' ? 'koniec ' : '';
      return `${part}${toRoman(Math.abs(dating.century))} w.${dating.century < 0 ? ' p.n.e.' : ''}`;
    }
  }
}
