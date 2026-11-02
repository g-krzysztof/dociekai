/**
 * L7 — logika i sędziowie lekcji „W którym to wieku?”. Czyste funkcje, bez Reacta.
 *
 * Wszystko stoi na jednym obrazie z haczyka: **lata to koraliki, sto koralików
 * to jeden sznur — jeden wiek**. Pierwszy koralik to rok 1, więc setny koralik
 * (rok 100, 1900, 2000) zamyka sznur, a nie otwiera następny. Sędziowie nie mają
 * klucza autora: wiek wynika z reguły (`centuryOf` z silnika osi), a odrzucenie
 * nazywa koralik i sznur, na których dziecko się pomyliło.
 *
 * Fakty: baza `F-I.4-05…07`, `F-I.4-21…23`, `F-I.5-06…11`.
 */

import { centuryOf, toRoman } from '../../../lib/timeline/dating';

export const BEADS_PER_STRING = 100;

/* ─────────────── blok 1 — koraliki i Sylwester 1999 ─────────────── */

/** Na którym sznurze (którym wieku n.e.) leży koralik-rok. */
export const stringOf = (year: number) => Math.ceil(year / BEADS_PER_STRING);
/** Który to koralik w swoim sznurze: 1…100. */
export const beadInString = (year: number) => ((year - 1) % BEADS_PER_STRING) + 1;
/** Czy ten koralik zamyka sznur (setny). */
export const closesString = (year: number) => year % BEADS_PER_STRING === 0;

export interface Verdict {
  ok: boolean;
  /** Konkret dla dziecka — co jest na którym sznurze. */
  message: string;
}

/**
 * Gdzie naprawdę kończy się drugie tysiąclecie? Dziecko stawia fajerwerk za
 * koralikiem — dobrze, gdy za ostatnim koralikiem 20. sznura (rok 2000).
 */
export function judgeFirework(year: number): Verdict {
  if (year === 2000) {
    return {
      ok: true,
      message:
        'Tak. Rok 2000 to setny koralik dwudziestego sznura — dopiero on zamyka sznur, a dwadzieścia pełnych sznurów to dwa tysiące lat. Drugie tysiąclecie skończyło się 31 grudnia 2000 roku.',
    };
  }
  if (year < 2000) {
    const left = 2000 - year;
    return {
      ok: false,
      message: `Po koraliku ${year} na dwudziestym sznurze ${left === 1 ? 'zostaje jeszcze jedno puste miejsce' : `zostaje jeszcze ${left} pustych miejsc`}. Tysiąclecie kończy się dopiero wtedy, gdy sznur jest pełny.`,
    };
  }
  return {
    ok: false,
    message: `Koralik ${year} leży już na dwudziestym pierwszym sznurze — dwudziesty był wtedy pełny od ${year - 2000 === 1 ? 'roku' : `${year - 2000} lat`}. Cofnij fajerwerk.`,
  };
}

/* ─────────────── bloki 2 i 3 — półki wieków (n.e. i p.n.e.) ─────────────── */

export interface YearCard {
  id: string;
  /** Rok historyczny bez zera: `-480` = 480 p.n.e. */
  year: number;
  /** Co się wtedy stało — krótko, jedna linijka na telefonie. */
  event: string;
}

/** Co zostaje „pod palcem”, gdy zasłoni się dwie ostatnie cyfry: 1492 → 14, 100 → 1, 44 → 0. */
export function coveredPrefix(year: number): number {
  return Math.floor(Math.abs(year) / 100);
}

/** Dwie ostatnie cyfry, które palec zasłania: 1492 → „92”, 1900 → „00”, 44 → „44”. */
export function hiddenDigits(year: number): string {
  return String(Math.abs(year) % 100).padStart(2, '0');
}

/** Wiek jako liczba dodatnia (bez znaku p.n.e.) — po regule z pudełek. */
export const centuryNumber = (year: number) => Math.abs(centuryOf(year));

export const formatYear = (year: number) => (year < 0 ? `${-year} p.n.e.` : String(year));
export const formatCentury = (century: number, bc: boolean) => `${toRoman(century)} w.${bc ? ' p.n.e.' : ''}`;

/** Lata, które leżą na półce `century` — n.e. od …01 do …00, p.n.e. od …00 w dół do …01. */
export function shelfRange(century: number, bc: boolean): { first: number; last: number } {
  return bc
    ? { first: century * 100, last: (century - 1) * 100 + 1 }
    : { first: (century - 1) * 100 + 1, last: century * 100 };
}

function rangeText(century: number, bc: boolean): string {
  const { first, last } = shelfRange(century, bc);
  return bc ? `od ${first} do ${last} p.n.e.` : `od ${first} do ${last}`;
}

/**
 * Sędzia półki: karta `year` odłożona na półkę `shelf` (wiek dodatni; strona
 * osi wynika ze znaku roku — półki p.n.e. i n.e. są osobnymi celami, więc
 * `shelfBc` mówi, na którą stronę lustra dziecko ją położyło).
 *
 * Najczęstsze pomyłki dostają własne zdania: „wziąłem cyfry spod palca bez +1”
 * i „dodałem 1, choć pod palcem były zera”.
 */
export function judgeShelf(year: number, shelf: number, shelfBc = false): Verdict {
  const bc = year < 0;
  const right = centuryNumber(year);
  const n = Math.abs(year);
  const prefix = coveredPrefix(year);
  const end = hiddenDigits(year);
  const label = formatYear(year);

  if (bc !== shelfBc) {
    return {
      ok: false,
      message: bc
        ? `Rok ${label} jest przed naszą erą — jego półka stoi po lewej stronie szczeliny roku zero.`
        : `Rok ${label} jest naszej ery — jego półka stoi po prawej stronie szczeliny roku zero.`,
    };
  }

  if (shelf === right) {
    const why = bc
      ? end === '00'
        ? `pod palcem dwa zera, więc wiek to liczba, która została — ${label} otwiera półkę i od niego liczy się w dół`
        : `pod palcem ${end}, więc to, co zostało, plus jeden — tak samo jak w naszej erze`
      : end === '00'
        ? `pod palcem dwa zera, więc ${label} to setny koralik i zamyka sznur ${toRoman(right)}`
        : `pod palcem ${end}, więc to ${Number(end)}. koralik sznura ${toRoman(right)}`;
    return { ok: true, message: `${formatCentury(right, bc)} — ${why}.` };
  }

  if (end !== '00' && shelf === prefix && prefix > 0) {
    return {
      ok: false,
      message: bc
        ? `Pod palcem zostało ${prefix}. Ale półka ${toRoman(prefix)} p.n.e. zaczyna się dopiero w roku ${prefix}00 p.n.e., a ${n} p.n.e. jest jeszcze dawniej — leży na następnej półce w lewo.`
        : `Pod palcem zostało ${prefix}. Ale ${prefix} ${prefix === 1 ? 'pełny sznur kończy' : 'pełnych sznurów kończy'} się na roku ${prefix}00 — rok ${n} to już ${Number(end)}. koralik następnego sznura.`,
    };
  }

  if (end === '00' && shelf === prefix + 1) {
    return {
      ok: false,
      message: bc
        ? `Pod palcem dwa zera: ${n} p.n.e. to pierwszy rok półki ${toRoman(prefix)} p.n.e. — od niego wiek liczy się w dół. Zera nie przesuwają go na następną półkę.`
        : `Pod palcem dwa zera: rok ${n} to setny, ostatni koralik sznura ${toRoman(prefix)}. Pełny sznur nie otwiera następnego.`,
    };
  }

  return {
    ok: false,
    message: `Na półce ${formatCentury(shelf, bc)} leżą lata ${rangeText(shelf, bc)}. Rok ${label} tam nie pasuje.`,
  };
}

/** Blok 2 — karty naszej ery. Pułapki z karty: 1900, 1901, 2000, 100. */
export function shelfCardsCE(now: number): YearCard[] {
  return [
    { id: 'grunwald', year: 1410, event: 'bitwa pod Grunwaldem' },
    { id: 'kopernik', year: 1543, event: 'książka Kopernika o ruchu Ziemi' },
    { id: 'r1900', year: 1900, event: 'ostatni dzień roku 1900' },
    { id: 'r1901', year: 1901, event: 'pierwszy dzień roku 1901' },
    { id: 'niepodleglosc', year: 1918, event: 'Polska odzyskuje niepodległość' },
    { id: 'r2000', year: 2000, event: 'Sylwester roku 2000' },
    { id: 'r100', year: 100, event: 'setny rok naszej ery' },
    { id: 'dzis', year: now, event: 'ten rok — dzisiaj' },
  ];
}

/** Półki bloku 2 — tyle, żeby pomyłka „bez +1” i „+1 przy zerach” zawsze miała dokąd trafić. */
export function shelvesCE(now: number): number[] {
  const cards = shelfCardsCE(now);
  const set = new Set<number>();
  cards.forEach((c) => {
    set.add(centuryNumber(c.year));
    set.add(Math.max(1, coveredPrefix(c.year)));
  });
  return [...set].sort((a, b) => a - b);
}

/**
 * Blok 3 — karty przed naszą erą (karta L7): Termopile 480, śmierć Cezara 44,
 * rok 100 p.n.e. (pułapka z zerami), założenie Rzymu 753 (legenda — data
 * tradycyjna).
 */
export const SHELF_CARDS_BC: YearCard[] = [
  { id: 'termopile', year: -480, event: 'bitwa pod Termopilami' },
  { id: 'cezar', year: -44, event: 'śmierć Juliusza Cezara' },
  { id: 'r100pne', year: -100, event: 'rok 100 p.n.e.' },
  { id: 'rzym', year: -753, event: 'założenie Rzymu (wg legendy)' },
];

/** Półki p.n.e. w lustrze: od VIII (najdalej w lewo) do I (tuż przy szczelinie). */
export const SHELVES_BC = [8, 7, 6, 5, 4, 3, 2, 1];
/** Półki n.e. po prawej stronie lustra — odbicie tych samych pierwszych ośmiu. */
export const SHELVES_CE_MIRROR = [1, 2, 3, 4, 5, 6, 7, 8];

/* ─────────────── blok 4 — tablice na murze ─────────────── */

const ROMAN_VALUE: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

export interface RomanStep {
  letter: string;
  value: number;
  /** Ujemna, gdy mniejsza cyfra stoi przed większą (XC, IX, CM). */
  signed: number;
  total: number;
}

/**
 * Odczyt cyfr rzymskich litera po literze — tak, jak dziecko stuka je na tablicy.
 * Litera dostaje minus, gdy zaraz po niej stoi większa. Suma po każdym kroku
 * to stan liczydła.
 */
export function romanSteps(numeral: string): RomanStep[] {
  const letters = numeral.toUpperCase().split('');
  let total = 0;
  return letters.map((letter, i) => {
    const value = ROMAN_VALUE[letter];
    if (!value) throw new Error(`To nie jest cyfra rzymska: ${letter}`);
    const next = ROMAN_VALUE[letters[i + 1] ?? ''] ?? 0;
    const signed = next > value ? -value : value;
    total += signed;
    return { letter, value, signed, total };
  });
}

export const romanToNumber = (numeral: string) => romanSteps(numeral).at(-1)?.total ?? 0;

export interface Plaque {
  id: string;
  /** Co wykuto na tablicy — wiersz nad liczbą, po łacinie, bez cyfr. */
  over: string;
  numeral: string;
  /** Co powiedzieć dziecku o tablicy, gdy już odczyta rok (wymyślone budynki, typowe napisy). */
  note: string;
}

/**
 * Tablice z bloku 4 — **wymyślone na potrzeby ćwiczenia** (tak podpisane
 * w lekcji), ale z napisami, jakie naprawdę wiszą nad wejściami kamienic:
 * „ANNO” = w roku, „AEDIFICATUM” = zbudowano, „RENOVATUM” = odnowiono.
 * Pułapka: MCM (1900) — zera pod palcem.
 */
export const PLAQUES: Plaque[] = [
  { id: 'kamienica', over: 'ANNO', numeral: 'MDCCXCI', note: '„Anno” po łacinie znaczy „w roku”. Tak datowano budynki przez setki lat.' },
  { id: 'szkola', over: 'AEDIFICATUM', numeral: 'MCM', note: '„Aedificatum” — „zbudowano”. Pod palcem dwa zera, więc to wciąż XIX wiek.' },
  { id: 'dworzec', over: 'RENOVATUM', numeral: 'MDCCCLXIII', note: '„Renovatum” — „odnowiono”. Tablica mówi, kiedy budynek odnowiono, a nie kiedy go postawiono.' },
  { id: 'brama', over: 'ANNO', numeral: 'MCMXVIII', note: 'W tym roku Polska odzyskała niepodległość — wiele bram i pomników ma tę datę.' },
];

/** Wieki, które dziecko może wybrać na tarczy w bloku 4. */
export const DIAL_CENTURIES = [15, 16, 17, 18, 19, 20, 21];

export function judgePlaqueCentury(year: number, chosen: number): Verdict {
  const right = centuryNumber(year);
  if (chosen === right) {
    return { ok: true, message: `Rok ${year} — ${formatCentury(right, false)}.` };
  }
  // To samo zdanie co na półkach — reguła jest jedna.
  return judgeShelf(year, chosen, false);
}
