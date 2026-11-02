/**
 * Most między ułamkiem zwykłym a dziesiętnym — „proste przypadki" klasy 4.
 *
 * Jedna czysta funkcja karmi widżet, przykłady i klucz odpowiedzi (ten sam
 * wzorzec co `decimal.ts`, `compound-unit.ts`, `mixed-number.ts`). W jedną
 * stronę: rozszerz mianownik do 10/100/1000 i odczytaj. W drugą: zapisz cyfry
 * po przecinku nad potęgą 10 i skróć.
 */

import { formatDecimal, type DecimalValue } from './decimal';

/** Największy wspólny dzielnik (algorytm Euklidesa); 1 dla pary zer. */
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

/**
 * Czy mianownik da się rozszerzyć do 10/100/1000… — czyli czy po wyrzuceniu
 * wszystkich dwójek i piątek zostaje 1. Mianownik z czynnikiem 3, 7, 9… odpada
 * (dałby ułamek nieskończony, poza zakresem klasy 4).
 */
export function reachesPowerOfTen(mianownik: number): boolean {
  let m = mianownik;
  while (m % 2 === 0) m /= 2;
  while (m % 5 === 0) m /= 5;
  return m === 1;
}

const POWERS = [10, 100, 1000, 10000];

/** Najmniejsza potęga 10 będąca wielokrotnością mianownika + potrzebny mnożnik. `null`, gdy się nie da. */
export function expansionToPowerOfTen(mianownik: number): { power: number; factor: number } | null {
  if (!reachesPowerOfTen(mianownik)) return null;
  for (const power of POWERS) {
    if (power % mianownik === 0) return { power, factor: power / mianownik };
  }
  return null;
}

export interface FractionToDecimal {
  /** Mnożnik, którym rozszerzamy licznik i mianownik. */
  factor: number;
  /** Potęga 10, do której rozszerzamy mianownik. */
  power: number;
  /** Licznik po rozszerzeniu (nad `power`). */
  expandedNum: number;
  /** Wynik jako `{ whole, digits }`. */
  value: DecimalValue;
  /** Wynik jako tekst z przecinkiem. */
  text: string;
}

/** Ułamek zwykły → dziesiętny. `null`, gdy to nie „prosty przypadek". */
export function fractionToDecimal(licznik: number, mianownik: number): FractionToDecimal | null {
  const exp = expansionToPowerOfTen(mianownik);
  if (!exp) return null;
  const expandedNum = licznik * exp.factor;
  const places = String(exp.power).length - 1;
  const whole = Math.floor(expandedNum / exp.power);
  const fracDigits = String(expandedNum % exp.power)
    .padStart(places, '0')
    .split('')
    .map(Number);
  const value: DecimalValue = { whole, digits: fracDigits };
  return { factor: exp.factor, power: exp.power, expandedNum, value, text: formatDecimal(value) };
}

export interface DecimalToFraction {
  /** Licznik nad potęgą 10, przed skracaniem. */
  rawNum: number;
  /** Potęga 10 z liczby miejsc po przecinku. */
  rawDen: number;
  /** Licznik po skróceniu do postaci nieskracalnej. */
  num: number;
  /** Mianownik po skróceniu. */
  den: number;
  /** Kolejne dzielniki pierwsze (rosnąco) sprowadzające ułamek do postaci nieskracalnej, np. `[5, 5]`. */
  reduceBy: number[];
}

/** Rozkłada `n` na czynniki pierwsze (rosnąco): 12 → [2, 2, 3]. */
function primeFactors(n: number): number[] {
  const out: number[] = [];
  let m = n;
  for (let d = 2; d * d <= m; d++) {
    while (m % d === 0) {
      out.push(d);
      m /= d;
    }
  }
  if (m > 1) out.push(m);
  return out;
}

/** Ułamek dziesiętny (np. „0,75" albo „0.75") → ułamek zwykły w postaci nieskracalnej. */
export function decimalToFraction(text: string): DecimalToFraction {
  const [wholePart, fracPart = ''] = text.trim().replace('.', ',').split(',');
  const places = fracPart.length;
  const rawDen = 10 ** Math.max(places, 1);
  const rawNum = Number(wholePart || '0') * rawDen + Number(fracPart || '0');
  const g = gcd(rawNum, rawDen);
  return {
    rawNum,
    rawDen,
    num: rawNum / g,
    den: rawDen / g,
    reduceBy: primeFactors(g),
  };
}

/** Ułamek jest już nieskracalny? */
export const isReduced = (num: number, den: number): boolean => gcd(num, den) === 1;
