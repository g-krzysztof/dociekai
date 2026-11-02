/**
 * Zamiana liczba arabska ↔ rzymska (do 3000), po jednym miejscu dziesiętnym
 * naraz — dokładnie tak, jak dziecko już zna z zapisu liczb (klasy, miejsca
 * dziesiętne w Moduł 1): tysiące, setki, dziesiątki, jedności, tylko innymi
 * symbolami. Tabele budują numery programowo, żeby obraz i wynik były
 * spójne z konstrukcji, a nie ręcznego przepisywania.
 */

const THOUSANDS = ['', 'M', 'MM', 'MMM'];
const HUNDREDS = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'];
const TENS = ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'];
const ONES = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

/** Wzorce zawierające „mniejszy symbol przed większym" — subtraktywne, warte podświetlenia. */
const SUBTRACTIVE_INDEXES = new Set([4, 9]);

export type RomanPlace = 'tysiące' | 'setki' | 'dziesiątki' | 'jedności';

export interface RomanChunk {
  place: RomanPlace;
  /** Cyfra arabska na tym miejscu (0–9, albo 0–3 dla tysięcy). */
  digit: number;
  /** Zapis rzymski tej cyfry na tym miejscu, np. „CM". Pusty, gdy digit = 0. */
  symbols: string;
  /** Wartość dziesiętna tego fragmentu, np. 900. */
  value: number;
  /** Czy fragment to zapis „mniejszy przed większym" (odejmowanie), np. CM, XC, IV. */
  subtractive: boolean;
}

const PLACE_TABLES: { place: RomanPlace; table: string[]; multiplier: number }[] = [
  { place: 'tysiące', table: THOUSANDS, multiplier: 1000 },
  { place: 'setki', table: HUNDREDS, multiplier: 100 },
  { place: 'dziesiątki', table: TENS, multiplier: 10 },
  { place: 'jedności', table: ONES, multiplier: 1 },
];

/** Liczbę 0–3000 rozkłada na maks. 4 fragmenty miejsc dziesiętnych (pomijając zerowe). */
export function romanChunksOf(value: number): RomanChunk[] {
  const clamped = Math.max(0, Math.min(3999, Math.round(value)));
  const digits = String(clamped).padStart(4, '0').split('').map(Number);

  return PLACE_TABLES.map(({ place, table, multiplier }, i) => {
    const digit = digits[i];
    return {
      place,
      digit,
      symbols: table[digit] ?? '',
      value: digit * multiplier,
      subtractive: SUBTRACTIVE_INDEXES.has(digit),
    };
  }).filter((chunk) => chunk.digit > 0);
}

/** Pełny zapis rzymski liczby, np. toRoman(1994) === 'MCMXCIV'. */
export function toRoman(value: number): string {
  return romanChunksOf(value)
    .map((chunk) => chunk.symbols)
    .join('');
}

export interface RomanSymbol {
  symbol: string;
  value: number;
  /** Czy symbol wolno powtarzać. V, L i D nigdy — dwa takie same to już następny symbol. */
  repeatable: boolean;
}

/**
 * Siedem podstawowych symboli — jedyne miejsce w projekcie z tą tabelą.
 * Kolejność rosnąca, bo na niej opiera się rytm ×5, ×2, ×5, ×2, ×5, ×2
 * (patrz `ROMAN_RHYTHM`), który jest sednem wykładu w przewodniku.
 */
export const ROMAN_SYMBOLS: RomanSymbol[] = [
  { symbol: 'I', value: 1, repeatable: true },
  { symbol: 'V', value: 5, repeatable: false },
  { symbol: 'X', value: 10, repeatable: true },
  { symbol: 'L', value: 50, repeatable: false },
  { symbol: 'C', value: 100, repeatable: true },
  { symbol: 'D', value: 500, repeatable: false },
  { symbol: 'M', value: 1000, repeatable: true },
];

/** Mnożniki między kolejnymi symbolami — wyliczone, nie wpisane ręcznie. */
export const ROMAN_RHYTHM: number[] = ROMAN_SYMBOLS.slice(1).map(
  (item, i) => item.value / ROMAN_SYMBOLS[i].value
);

/** Wartość pojedynczego symbolu, np. symbolValue('L') === 50. Nieznany znak → 0. */
export function symbolValue(symbol: string): number {
  return ROMAN_SYMBOLS.find((item) => item.symbol === symbol)?.value ?? 0;
}

export interface SubtractivePair {
  symbols: string;
  value: number;
  /** Symbol odejmowany (I, X albo C). */
  minus: string;
  /** Symbol, od którego odejmujemy. */
  from: string;
}

/**
 * Sześć par, w których mniejszy symbol stoi przed większym. Wyprowadzone z
 * `toRoman`, nie przepisane — dzięki temu zapis i wartość są spójne z konstrukcji.
 */
export const SUBTRACTIVE_PAIRS: SubtractivePair[] = [4, 9, 40, 90, 400, 900].map((value) => {
  const symbols = toRoman(value);
  return { symbols, value, minus: symbols[0], from: symbols[1] };
});

/**
 * Ściąga z zasad — wspólna dla lekcji `system-rzymski` i przewodnika, żeby
 * obie strony nie rozjechały się przy kolejnej redakcji tekstu.
 */
export const ROMAN_RULES: string[] = [
  'Siedem symboli: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000.',
  'Symbole od większego do mniejszego dodajesz: VI = 5 + 1 = 6.',
  'Mniejszy symbol przed większym odejmujesz: IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900.',
  'Liczbę budujesz miejsce po miejscu — tysiące, setki, dziesiątki, jedności — dokładnie jak w zwykłym zapisie.',
  'Tego samego symbolu nie powtarza się więcej niż trzy razy pod rząd — 4 to zawsze IV, nigdy IIII.',
];
