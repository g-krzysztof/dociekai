/**
 * Rozkład dodawania pisemnego dwóch ułamków dziesiętnych na kolumny miejsc
 * pozycyjnych oraz krok-po-kroku przebieg z przeniesieniem. Ta sama dyscyplina
 * co `column-algorithm.ts` / `decimal.ts`: z jednej funkcji karmi się i widżet
 * „Nowe pojęcie", i rozpisane przykłady, i klucz odpowiedzi do ćwiczeń —
 * nie mogą się rozjechać.
 *
 * Liczby trzymamy jako `DecimalValue` (część całkowita + tablica cyfr po
 * przecinku), nigdy jako `number` — 0,1 + 0,2 w float64 to
 * 0,30000000000000004, a lekcja ma pokazywać dokładnie te cyfry, które
 * dziecko zsumowało.
 *
 * Zakres klasy 4: obie liczby nieujemne, maks. 3 miejsca po przecinku,
 * suma części całkowitych mieści się w tysiącach (bez przepełnienia poza
 * zasięg kolumn — dobieraj przykłady tak, żeby się mieściły).
 */

import {
  DECIMAL_PLACES,
  formatDecimal,
  padDecimalPlaces,
  parseDecimal,
  type DecimalValue,
} from './decimal';

/** Etykiety kolumn części całkowitej, indeks 0 = jedności. */
export const WHOLE_LABELS = ['jedności', 'dziesiątki', 'setki', 'tysiące'] as const;

export interface DecimalAddColumn {
  /** `'whole'` + `wholeIndex`, albo `'fraction'` + `placeIndex` (0 = dziesiąte). */
  section: 'whole' | 'fraction';
  /** Dla `fraction` — indeks rzędu po przecinku (0 = dziesiąte). Dla `whole` — 0 = jedności. */
  placeIndex: number;
  /** Nagłówek kolumny: „jedności", „dziesiąte", „setne"… */
  label: string;
  topDigit: number;
  bottomDigit: number;
  /** Czy górna cyfra to zero dopisane przy wyrównywaniu liczby miejsc (a nie własna cyfra zapisu). */
  topIsPadded: boolean;
  bottomIsPadded: boolean;
  /** Przeniesienie wchodzące z kolumny po prawej (0 albo 1). */
  incomingCarry: number;
  sum: number;
  /** Cyfra zapisywana w wyniku tej kolumny. */
  resultDigit: number;
  /** Przeniesienie wychodzące do kolumny po lewej (0 albo 1). */
  outgoingCarry: number;
  /** true, gdy przeniesienie z tej kolumny wchodzi do części całkowitej — „przeskok przez przecinek". */
  carryCrossesComma: boolean;
}

export interface DecimalAddition {
  rawA: DecimalValue;
  rawB: DecimalValue;
  /** Składniki wyrównane do wspólnej liczby miejsc po przecinku (z dopisanymi zerami). */
  a: DecimalValue;
  b: DecimalValue;
  /** Wspólna liczba miejsc po przecinku. */
  places: number;
  /** Ile zer trzeba dopisać, żeby wyrównać zapis (0, gdy oba mają tyle samo miejsc). */
  padCountA: number;
  padCountB: number;
  /** Kolumny od prawej (najmniejszy rząd) do lewej — kolejność liczenia w słupku. */
  columns: DecimalAddColumn[];
  sum: DecimalValue;
  /** Zapis wyniku po polsku, np. „5,55". */
  sumText: string;
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
 * Buduje pełny rozkład `a + b` w słupku. `aText`/`bText` w zapisie polskim
 * („3,5", „0,25") lub z kropką — `parseDecimal` przyjmuje oba.
 */
export function buildDecimalAddition(aText: string, bText: string): DecimalAddition {
  const rawA = parseDecimal(aText);
  const rawB = parseDecimal(bText);
  const places = Math.max(rawA.digits.length, rawB.digits.length);
  const a = padDecimalPlaces(rawA, places);
  const b = padDecimalPlaces(rawB, places);

  const columns: DecimalAddColumn[] = [];
  let carry = 0;

  // Kolumny po przecinku: od najdalszego rzędu w prawo (places-1) do dziesiątych (0).
  for (let i = places - 1; i >= 0; i -= 1) {
    const topDigit = a.digits[i] ?? 0;
    const bottomDigit = b.digits[i] ?? 0;
    const sum = topDigit + bottomDigit + carry;
    const outgoingCarry = sum >= 10 ? 1 : 0;
    columns.push({
      section: 'fraction',
      placeIndex: i,
      label: DECIMAL_PLACES[i]?.name ?? '',
      topDigit,
      bottomDigit,
      topIsPadded: i >= rawA.digits.length,
      bottomIsPadded: i >= rawB.digits.length,
      incomingCarry: carry,
      sum,
      resultDigit: sum % 10,
      outgoingCarry,
      carryCrossesComma: i === 0 && outgoingCarry > 0,
    });
    carry = outgoingCarry;
  }

  // Suma części całkowitych — liczby całkowite, jedyne wchodzące przeniesienie to
  // 0/1 z rzędu dziesiątych, więc arytmetyka jest tu dokładna (bez float64).
  const wholeSum = rawA.whole + rawB.whole + carry;
  const wholeLen = Math.max(
    String(wholeSum).length,
    String(rawA.whole).length,
    String(rawB.whole).length
  );
  const aWhole = wholeDigits(rawA.whole, wholeLen);
  const bWhole = wholeDigits(rawB.whole, wholeLen);

  for (let i = 0; i < wholeLen; i += 1) {
    const topDigit = aWhole[i];
    const bottomDigit = bWhole[i];
    const sum = topDigit + bottomDigit + carry;
    columns.push({
      section: 'whole',
      placeIndex: i,
      label: WHOLE_LABELS[i] ?? '',
      topDigit,
      bottomDigit,
      topIsPadded: false,
      bottomIsPadded: false,
      incomingCarry: carry,
      sum,
      resultDigit: sum % 10,
      outgoingCarry: sum >= 10 ? 1 : 0,
      carryCrossesComma: false,
    });
    carry = sum >= 10 ? 1 : 0;
  }

  const sum: DecimalValue = { whole: wholeSum, digits: columns
    .filter((c) => c.section === 'fraction')
    .sort((x, y) => x.placeIndex - y.placeIndex)
    .map((c) => c.resultDigit) };

  return {
    rawA,
    rawB,
    a,
    b,
    places,
    padCountA: places - rawA.digits.length,
    padCountB: places - rawB.digits.length,
    columns,
    sum,
    sumText: formatDecimal(sum),
    aText: formatDecimal(rawA),
    bText: formatDecimal(rawB),
  };
}

/** Czy w tym dodawaniu jakiekolwiek przeniesienie przeskakuje przez przecinek. */
export function hasCommaCrossingCarry(addition: DecimalAddition): boolean {
  return addition.columns.some((column) => column.carryCrossesComma);
}

export const DECIMAL_ADDITION_RULES: string[] = [
  'Zapisz liczby jedna pod drugą tak, żeby przecinek stał pod przecinkiem — nie wyrównuj do prawej strony.',
  'Dopisz zera na końcu krótszej liczby, żeby obie miały tyle samo miejsc po przecinku (2,4 zapisz jako 2,40).',
  'Dodawaj kolumnami od prawej do lewej, tak samo jak liczby naturalne.',
  'Gdy suma w kolumnie wynosi 10 lub więcej, zapisujesz cyfrę jedności, a 1 przenosisz do kolumny po lewej — nawet jeśli to oznacza przeskok przez przecinek (0,8 + 0,7 = 1,5).',
  'Przecinek w wyniku spada prosto w dół, dokładnie pod przecinki składników.',
  'Pamięciowo: osobno dodaj części całkowite, osobno części po przecinku, a potem złóż wynik i wykonaj ewentualne przeniesienie.',
];
