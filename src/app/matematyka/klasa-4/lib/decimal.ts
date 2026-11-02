/**
 * Rozkład ułamka dziesiętnego na części — jedna czysta funkcja karmi tablicę
 * pozycyjną, rozwinięcie na ułamki zwykłe i odczyt na głos (ten sam wzorzec co
 * `place-value.ts`, `roman.ts`, `mixed-number.ts`).
 *
 * Liczba jest trzymana jako część całkowita + tablica cyfr po przecinku, nigdy
 * jako `number` — 0,1 + 0,2 w float64 to 0,30000000000000004, a przewodnik ma
 * wypisywać dokładnie te cyfry, które dziecko ustawiło.
 */

import { plural, type PluralForms } from './plural';

/** Ile miejsc po przecinku obsługuje kurs klasy 4: dziesiąte, setne, tysięczne. */
export const MAX_PLACES = 3;

export interface DecimalPlace {
  /** 0 = dziesiąte, 1 = setne, 2 = tysięczne. */
  index: number;
  /** Nazwa rzędu w liczbie mnogiej — nagłówek kolumny („dziesiąte”). */
  name: string;
  /** Mianownik ułamka zwykłego tego rzędu: 10, 100, 1000. */
  mianownik: number;
  /** Zapis dziesiętny jednej takiej części: „0,1”, „0,01”, „0,001”. */
  unit: string;
  /** Formy do odmiany po liczebniku — „jedna dziesiąta”, „dwie dziesiąte”, „pięć dziesiątych”. */
  forms: PluralForms;
}

export const DECIMAL_PLACES: DecimalPlace[] = [
  {
    index: 0,
    name: 'dziesiąte',
    mianownik: 10,
    unit: '0,1',
    forms: { one: 'dziesiąta', few: 'dziesiąte', many: 'dziesiątych' },
  },
  {
    index: 1,
    name: 'setne',
    mianownik: 100,
    unit: '0,01',
    forms: { one: 'setna', few: 'setne', many: 'setnych' },
  },
  {
    index: 2,
    name: 'tysięczne',
    mianownik: 1000,
    unit: '0,001',
    forms: { one: 'tysięczna', few: 'tysięczne', many: 'tysięcznych' },
  },
];

export interface DecimalValue {
  /** Część całkowita (przed przecinkiem), ≥ 0. */
  whole: number;
  /** Cyfry po przecinku, od dziesiątych. Długość = liczba widocznych miejsc. */
  digits: number[];
}

/** Zapis liczby po polsku — z przecinkiem, nie kropką. */
export function formatDecimal({ whole, digits }: DecimalValue): string {
  return digits.length === 0 ? String(whole) : `${whole},${digits.join('')}`;
}

/** Część po przecinku jako ułamek zwykły: 3,25 → 25/100 (bez skracania — to zapis, nie wynik). */
export function fractionPartOf({ digits }: DecimalValue): { licznik: number; mianownik: number } {
  return {
    licznik: digits.length === 0 ? 0 : Number(digits.join('')),
    mianownik: 10 ** Math.max(1, digits.length),
  };
}

/** Wkład jednej cyfry: cyfra 7 na rzędzie setnych to 7/100. */
export function digitContribution(digit: number, placeIndex: number): { licznik: number; mianownik: number } {
  return { licznik: digit, mianownik: 10 ** (placeIndex + 1) };
}

/** Wartość wyrażona w setnych — do rysowania taśmy w akcie o zerach (0,5 → 50). */
export function toHundredths({ whole, digits }: DecimalValue): number {
  const tenths = digits[0] ?? 0;
  const hundredths = digits[1] ?? 0;
  return whole * 100 + tenths * 10 + hundredths;
}

const UNITS_ALONE = ['zero', 'jedna', 'dwie', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć'];
/** W liczbie złożonej jedynka wraca do formy męskiej („dwadzieścia jeden setnych”). */
const UNITS_IN_COMPOUND = ['', 'jeden', 'dwie', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć'];
const TEENS = [
  'dziesięć',
  'jedenaście',
  'dwanaście',
  'trzynaście',
  'czternaście',
  'piętnaście',
  'szesnaście',
  'siedemnaście',
  'osiemnaście',
  'dziewiętnaście',
];
const TENS = [
  '',
  '',
  'dwadzieścia',
  'trzydzieści',
  'czterdzieści',
  'pięćdziesiąt',
  'sześćdziesiąt',
  'siedemdziesiąt',
  'osiemdziesiąt',
  'dziewięćdziesiąt',
];
const HUNDREDS = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset'];

/**
 * Liczebnik 0–999 w rodzaju żeńskim — bo wszystkie rzeczowniki, które po nim
 * stoją w odczycie ułamka, są żeńskie („cała”, „dziesiąta”, „setna”).
 * Stąd „jedna”/„dwie”, a nie „jeden”/„dwa”.
 */
export function spellFeminine(n: number): string {
  const safe = Math.max(0, Math.min(999, Math.floor(n)));
  if (safe === 0) return UNITS_ALONE[0];

  const parts: string[] = [];
  const hundreds = Math.floor(safe / 100);
  const rest = safe % 100;

  if (hundreds > 0) parts.push(HUNDREDS[hundreds]);

  if (rest >= 10 && rest <= 19) {
    parts.push(TEENS[rest - 10]);
  } else {
    const tens = Math.floor(rest / 10);
    const units = rest % 10;
    if (tens > 0) parts.push(TENS[tens]);
    if (units > 0) parts.push(parts.length > 0 ? UNITS_IN_COMPOUND[units] : UNITS_ALONE[units]);
  }

  return parts.join(' ');
}

const WHOLE_FORMS: PluralForms = { one: 'cała', few: 'całe', many: 'całych' };

/**
 * Odczyt liczby na głos — dokładnie tak, jak czyta się ją w szkole:
 * 3,25 → „trzy całe i dwadzieścia pięć setnych”, 1,008 → „jedna cała i osiem tysięcznych”.
 * Nazwa rzędu bierze się z liczby miejsc po przecinku, nie z wartości — dlatego
 * 0,50 to „pięćdziesiąt setnych”, a 0,5 to „pięć dziesiątych”, mimo że to ta sama liczba.
 */
export function readDecimal(value: DecimalValue): string {
  const wholeText = `${spellFeminine(value.whole)} ${plural(value.whole, WHOLE_FORMS)}`;
  if (value.digits.length === 0) return wholeText;

  const place = DECIMAL_PLACES[Math.min(value.digits.length, MAX_PLACES) - 1];
  const { licznik } = fractionPartOf(value);
  const fractionText = `${spellFeminine(licznik)} ${plural(licznik, place.forms)}`;

  return `${wholeText} i ${fractionText}`;
}

/** Zamiana „0,45” / „3,4” / „12” na `DecimalValue` — przecinek albo kropka jako separator. */
export function parseDecimal(text: string): DecimalValue {
  const [whole = '0', fraction = ''] = text.trim().replace('.', ',').split(',');
  return {
    whole: Number(whole) || 0,
    digits: fraction.split('').filter((char) => char >= '0' && char <= '9').map(Number),
  };
}

/**
 * Dopisuje zera na końcu części po przecinku, aż będzie ich `places` — 0,5 → 0,50.
 * Nigdy nie obcina: jeśli liczba ma już więcej miejsc, zwraca ją bez zmian.
 * To ten sam ruch, który wyrównuje dwie liczby przed porównaniem kolumnami.
 */
export function padDecimalPlaces(value: DecimalValue, places: number): DecimalValue {
  const digits = value.digits.slice();
  while (digits.length < places) digits.push(0);
  return { whole: value.whole, digits };
}

/**
 * Porównanie dwóch liczb dziesiętnych: `-1` gdy `a < b`, `0` gdy równe, `1` gdy `a > b`.
 * Najpierw część całkowita, potem rząd po rzędzie po przecinku z dopisanymi zerami —
 * dokładnie ta metoda, której uczy lekcja. Liczy na cyfrach, nie na `number`,
 * więc 0,5 i 0,50 wychodzą równe, a 0,45 i 0,5 nie dają się pomylić.
 */
export function compareDecimals(a: DecimalValue, b: DecimalValue): -1 | 0 | 1 {
  if (a.whole !== b.whole) return a.whole < b.whole ? -1 : 1;
  const places = Math.max(a.digits.length, b.digits.length);
  for (let i = 0; i < places; i += 1) {
    const da = a.digits[i] ?? 0;
    const db = b.digits[i] ?? 0;
    if (da !== db) return da < db ? -1 : 1;
  }
  return 0;
}

/** Znak `<`, `=` lub `>` między dwiema liczbami — pochodna `compareDecimals`. */
export function comparisonSign(a: DecimalValue, b: DecimalValue): '<' | '=' | '>' {
  const order = compareDecimals(a, b);
  return order < 0 ? '<' : order > 0 ? '>' : '=';
}

/**
 * Pierwszy rząd, w którym dwie liczby (wyrównane przecinkiem, z dopisanymi zerami)
 * się różnią — to ten rząd rozstrzyga porównanie. `null`, gdy liczby są równe.
 */
export function firstDifferingPlace(
  a: DecimalValue,
  b: DecimalValue
): { section: 'whole' } | { section: 'fraction'; place: number } | null {
  if (a.whole !== b.whole) return { section: 'whole' };
  const places = Math.max(a.digits.length, b.digits.length);
  for (let i = 0; i < places; i += 1) {
    if ((a.digits[i] ?? 0) !== (b.digits[i] ?? 0)) return { section: 'fraction', place: i };
  }
  return null;
}

/**
 * Przybliżona wartość liczbowa — WYŁĄCZNIE do rysowania proporcjonalnego paska.
 * Do porównań używaj `compareDecimals` (to liczy na cyfrach, bez błędu float64).
 */
export function decimalToNumber(value: DecimalValue): number {
  return value.digits.reduce((acc, digit, i) => acc + digit / 10 ** (i + 1), value.whole);
}
