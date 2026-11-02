/**
 * Wyrażenie dwumianowane → ułamek dziesiętny.
 *
 * Jedna czysta funkcja karmi widżet, przykłady i klucz odpowiedzi (ten sam
 * wzorzec co `decimal.ts`, `money.ts`, `mixed-number.ts`). Buduje na
 * `DecimalValue` z `decimal.ts`: liczba mniejszej jednostki ląduje w prawych
 * rzędach po przecinku, dopełniona zerami z przodu — tak, żeby „3 m 5 cm"
 * dało 3,05 m, nigdy 3,5 m.
 */

import { DECIMAL_PLACES, formatDecimal, readDecimal, type DecimalValue } from './decimal';

/** Ile mniejszych jednostek mieści się w jednej większej — zawsze potęga 10. */
export type UnitFactor = 100 | 1000;

/** Para jednostek: większa (przed przecinkiem) + mniejsza (po przecinku). */
export interface UnitPair {
  id: string;
  /** Wielkość, np. „długość", „masa", „kwota". */
  quantity: string;
  /** Symbol większej jednostki: „m", „zł", „kg". */
  big: string;
  /** Symbol mniejszej jednostki: „cm", „gr", „g". */
  small: string;
  /** Ile mniejszych jednostek to jedna większa: 100 albo 1000. */
  per: UnitFactor;
  /** Dopełniacz większej jednostki do odczytu na głos: „…setnych metra". */
  readBig: string;
}

export const UNIT_PAIRS: UnitPair[] = [
  { id: 'm-cm', quantity: 'długość', big: 'm', small: 'cm', per: 100, readBig: 'metra' },
  { id: 'zl-gr', quantity: 'kwota', big: 'zł', small: 'gr', per: 100, readBig: 'złotego' },
  { id: 'kg-g', quantity: 'masa', big: 'kg', small: 'g', per: 1000, readBig: 'kilograma' },
  { id: 'm-mm', quantity: 'długość', big: 'm', small: 'mm', per: 1000, readBig: 'metra' },
];

export const getUnitPair = (id: string): UnitPair =>
  UNIT_PAIRS.find((pair) => pair.id === id) ?? UNIT_PAIRS[0];

/** Liczba miejsc po przecinku = liczba zer w przeliczniku: 100 → 2, 1000 → 3. */
export const placesFor = (per: UnitFactor): number => String(per).length - 1;

export interface CompoundExpr {
  pair: UnitPair;
  /** Część wyrażona w większej jednostce (część całkowita liczby), ≥ 0. */
  big: number;
  /** Część wyrażona w mniejszej jednostce, 0 … per − 1. */
  small: number;
}

/**
 * Cyfry po przecinku — liczba mniejszej jednostki dopełniona zerami z PRZODU
 * do liczby miejsc (5 cm przy przeliczniku 100 → „05", nie „50").
 */
export function decimalDigits({ pair, small }: CompoundExpr): number[] {
  const places = placesFor(pair.per);
  return String(small).padStart(places, '0').split('').map(Number);
}

/** Ile cyfr z przodu części dziesiętnej to zera dopełniające (3 m 5 cm → 1). */
export function leadingZeroCount(expr: CompoundExpr): number {
  return placesFor(expr.pair.per) - String(expr.small).length;
}

export function toDecimalValue(expr: CompoundExpr): DecimalValue {
  return { whole: expr.big, digits: decimalDigits(expr) };
}

/** „3 m 25 cm" */
export function formatCompound({ pair, big, small }: CompoundExpr): string {
  return `${big} ${pair.big} ${small} ${pair.small}`;
}

/** „3,25 m" */
export function formatDecimalWithUnit(expr: CompoundExpr): string {
  return `${formatDecimal(toDecimalValue(expr))} ${expr.pair.big}`;
}

/** Nazwa ostatniego zajętego rzędu po przecinku: „setnych" / „tysięcznych". */
export function lastPlaceName(per: UnitFactor): string {
  return DECIMAL_PLACES[placesFor(per) - 1].name;
}

/** „trzy całe i dwadzieścia pięć setnych metra" */
export function readCompound(expr: CompoundExpr): string {
  return `${readDecimal(toDecimalValue(expr))} ${expr.pair.readBig}`;
}
