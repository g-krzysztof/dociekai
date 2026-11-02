/**
 * Rozkład odejmowania pisemnego dwóch ułamków dziesiętnych na kolumny miejsc
 * pozycyjnych oraz krok-po-kroku przebieg z pożyczaniem. Bliźniak
 * `decimal-addition.ts` — ta sama dyscyplina „jedna czysta funkcja karmi
 * i widżet, i rozpisane przykłady, i klucz odpowiedzi do ćwiczeń".
 *
 * Liczby trzymamy jako `DecimalValue` (część całkowita + tablica cyfr po
 * przecinku), nigdy jako `number` — 0,3 − 0,1 w float64 to
 * 0,19999999999999998, a lekcja ma pokazywać dokładnie te cyfry, które
 * dziecko odjęło.
 *
 * Zakres klasy 4: `a ≥ b`, obie liczby nieujemne, maks. 3 miejsca po
 * przecinku, część całkowita mieści się w tysiącach — dobieraj przykłady
 * tak, żeby wynik nie schodził poniżej zera.
 */

import {
  DECIMAL_PLACES,
  formatDecimal,
  padDecimalPlaces,
  parseDecimal,
  type DecimalValue,
} from './decimal';
import { WHOLE_LABELS } from './decimal-addition';

export interface DecimalSubColumn {
  section: 'whole' | 'fraction';
  /** Dla `fraction` — indeks rzędu po przecinku (0 = dziesiąte). Dla `whole` — 0 = jedności. */
  placeIndex: number;
  /** Nagłówek kolumny: „jedności", „dziesiąte", „setne"… */
  label: string;
  topDigit: number;
  bottomDigit: number;
  /** Czy górna/dolna cyfra to zero dopisane przy wyrównywaniu liczby miejsc. */
  topIsPadded: boolean;
  bottomIsPadded: boolean;
  /** Czy ta kolumna oddała 1 do kolumny po prawej (jej cyfra „zmalała o 1"). */
  borrowIn: boolean;
  /** Czy ta kolumna musiała pożyczyć 10 od kolumny po lewej. */
  borrowOut: boolean;
  /** Górna cyfra po uwzględnieniu pożyczek — to, co realnie odejmujemy w tej kolumnie
   *  (`topDigit - 1` przy oddaniu, `topDigit + 10` przy pożyczce, `topDigit + 9` przy obu). */
  effectiveTop: number;
  /** Cyfra zapisywana w wyniku tej kolumny. */
  resultDigit: number;
  /** true, gdy pożyczka tej kolumny idzie z części całkowitej — „przez przecinek"
   *  (kolumna dziesiątych pożycza od jedności). */
  borrowCrossesComma: boolean;
}

export interface DecimalSubtraction {
  rawA: DecimalValue;
  rawB: DecimalValue;
  /** Odjemna i odjemnik wyrównane do wspólnej liczby miejsc po przecinku. */
  a: DecimalValue;
  b: DecimalValue;
  places: number;
  padCountA: number;
  padCountB: number;
  /** Kolumny od prawej (najmniejszy rząd) do lewej — kolejność liczenia w słupku. */
  columns: DecimalSubColumn[];
  difference: DecimalValue;
  differenceText: string;
  aText: string;
  bText: string;
}

/** Cyfry części całkowitej, indeks 0 = jedności, dopełnione zerami do `length`. */
function wholeDigits(whole: number, length: number): number[] {
  const reversed = String(Math.max(0, Math.trunc(whole)))
    .split('')
    .reverse()
    .map(Number);
  return Array.from({ length }, (_, i) => reversed[i] ?? 0);
}

/**
 * Buduje pełny rozkład `a - b` w słupku. `aText`/`bText` w zapisie polskim
 * („3,5", „0,25") lub z kropką — `parseDecimal` przyjmuje oba.
 */
export function buildDecimalSubtraction(aText: string, bText: string): DecimalSubtraction {
  const rawA = parseDecimal(aText);
  const rawB = parseDecimal(bText);
  const places = Math.max(rawA.digits.length, rawB.digits.length);
  const a = padDecimalPlaces(rawA, places);
  const b = padDecimalPlaces(rawB, places);

  const wholeLen = Math.max(String(rawA.whole).length, String(rawB.whole).length);
  const aWhole = wholeDigits(rawA.whole, wholeLen);
  const bWhole = wholeDigits(rawB.whole, wholeLen);

  const columns: DecimalSubColumn[] = [];
  let borrow = 0;

  const pushColumn = (
    section: 'whole' | 'fraction',
    placeIndex: number,
    label: string,
    topDigit: number,
    bottomDigit: number,
    topIsPadded: boolean,
    bottomIsPadded: boolean
  ) => {
    const avail = topDigit - borrow;
    const needsBorrow = avail < bottomDigit;
    const effectiveTop = needsBorrow ? avail + 10 : avail;
    const resultDigit = effectiveTop - bottomDigit;
    columns.push({
      section,
      placeIndex,
      label,
      topDigit,
      bottomDigit,
      topIsPadded,
      bottomIsPadded,
      borrowIn: borrow === 1,
      borrowOut: needsBorrow,
      effectiveTop,
      resultDigit,
      borrowCrossesComma: section === 'fraction' && placeIndex === 0 && needsBorrow,
    });
    borrow = needsBorrow ? 1 : 0;
  };

  // Kolumny po przecinku: od najdalszego rzędu w prawo (places-1) do dziesiątych (0).
  for (let i = places - 1; i >= 0; i -= 1) {
    pushColumn(
      'fraction',
      i,
      DECIMAL_PLACES[i]?.name ?? '',
      a.digits[i] ?? 0,
      b.digits[i] ?? 0,
      i >= rawA.digits.length,
      i >= rawB.digits.length
    );
  }

  // Część całkowita — od jedności w górę.
  for (let i = 0; i < wholeLen; i += 1) {
    pushColumn('whole', i, WHOLE_LABELS[i] ?? '', aWhole[i], bWhole[i], false, false);
  }

  const fractionDigits = columns
    .filter((c) => c.section === 'fraction')
    .sort((x, y) => x.placeIndex - y.placeIndex)
    .map((c) => c.resultDigit);
  const wholeResult = columns
    .filter((c) => c.section === 'whole')
    .sort((x, y) => x.placeIndex - y.placeIndex)
    .reduce((acc, c, i) => acc + c.resultDigit * 10 ** i, 0);

  const difference: DecimalValue = { whole: wholeResult, digits: fractionDigits };

  return {
    rawA,
    rawB,
    a,
    b,
    places,
    padCountA: places - rawA.digits.length,
    padCountB: places - rawB.digits.length,
    columns,
    difference,
    differenceText: formatDecimal(difference),
    aText: formatDecimal(rawA),
    bText: formatDecimal(rawB),
  };
}

/** Czy w tym odejmowaniu jest jakiekolwiek pożyczanie. */
export function hasBorrow(subtraction: DecimalSubtraction): boolean {
  return subtraction.columns.some((column) => column.borrowOut);
}

/** Czy któraś pożyczka przeskakuje przez przecinek (dziesiąte pożyczają od jedności). */
export function hasCommaCrossingBorrow(subtraction: DecimalSubtraction): boolean {
  return subtraction.columns.some((column) => column.borrowCrossesComma);
}

export const DECIMAL_SUBTRACTION_RULES: string[] = [
  'Zapisz liczby jedna pod drugą tak, żeby przecinek stał pod przecinkiem — nie wyrównuj do prawej strony.',
  'Dopisz zera na końcu krótszej liczby, żeby obie miały tyle samo miejsc po przecinku (5,2 zapisz jako 5,20).',
  'Odejmuj kolumnami od prawej do lewej, tak samo jak liczby naturalne.',
  'Gdy w kolumnie górna cyfra jest za mała, pożycz 1 od kolumny po lewej — tam cyfra maleje o 1, a tutaj rośnie o 10. Pożyczka może przeskoczyć przez przecinek (1,2 − 0,5 = 0,7).',
  'Przecinek w wyniku spada prosto w dół, dokładnie pod przecinki odjemnej i odjemnika.',
  'Pamięciowo: dolicz od odjemnika do odjemnej krótkimi skokami (do pełnej setnej, dziesiątej, całości) — suma skoków to różnica.',
];
