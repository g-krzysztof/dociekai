/**
 * Rozkład dwóch liczb na kolumny miejsc dziesiętnych oraz krok-po-kroku
 * przebieg dodawania (z przeniesieniem) i odejmowania (z pożyczaniem) w
 * słupku. Ta sama dyscyplina co `roman.ts`/`place-value.ts`: widżet, kroki
 * demonstracji i klucz odpowiedzi liczone z jednego miejsca, więc nie mogą
 * się rozjechać.
 *
 * Celowo bez pożyczania „przez zero" (kaskadowy łańcuch pożyczeń) — to osobny
 * temat własnej lekcji („Odejmowanie pisemne — (...) pożyczaniem od zer"),
 * przewodnik uczy tylko zapisu.
 */

export type ColumnPlace = 'jedności' | 'dziesiątki' | 'setki' | 'tysiące';

/** Etykiety miejsc, indeks 0 = jedności (najbardziej wysunięte w prawo). */
export const PLACE_LABELS: ColumnPlace[] = ['jedności', 'dziesiątki', 'setki', 'tysiące'];

/** Cyfry liczby dopełnione do `length` kolumn, indeks 0 = jedności. `null` = pusta kolumna (liczba jest krótsza). */
export function digitsOf(value: number, length: number): (number | null)[] {
  const str = String(Math.max(0, Math.round(value)));
  const digits = str
    .split('')
    .reverse()
    .map((d) => Number(d));
  return Array.from({ length }, (_, i) => digits[i] ?? (i < digits.length ? 0 : null));
}

export interface AdditionColumnStep {
  index: number;
  place: ColumnPlace;
  topDigit: number;
  bottomDigit: number;
  /** Przeniesienie wchodzące z kolumny o jeden mniejszej (z prawej). */
  incomingCarry: number;
  sum: number;
  /** Cyfra zapisywana w wyniku tej kolumny. */
  resultDigit: number;
  /** Przeniesienie wychodzące do kolumny o jeden większej (w lewo) — 0 albo 1. */
  outgoingCarry: number;
}

/** Krok po kroku dodawania pisemnego `a + b`, od jedności w lewo. */
export function buildAdditionSteps(a: number, b: number): AdditionColumnStep[] {
  const length = Math.max(String(a).length, String(b).length) + 1;
  const topDigits = digitsOf(a, length);
  const bottomDigits = digitsOf(b, length);
  const steps: AdditionColumnStep[] = [];
  let carry = 0;

  for (let i = 0; i < length; i++) {
    const topDigit = topDigits[i] ?? 0;
    const bottomDigit = bottomDigits[i] ?? 0;
    if (topDigit === 0 && bottomDigit === 0 && carry === 0 && i >= String(Math.max(a, b)).length) {
      break;
    }
    const sum = topDigit + bottomDigit + carry;
    const resultDigit = sum % 10;
    const outgoingCarry = sum >= 10 ? 1 : 0;
    steps.push({
      index: i,
      place: PLACE_LABELS[i],
      topDigit,
      bottomDigit,
      incomingCarry: carry,
      sum,
      resultDigit,
      outgoingCarry,
    });
    carry = outgoingCarry;
  }
  return steps;
}

export interface SubtractionColumnStep {
  index: number;
  place: ColumnPlace;
  /** Cyfra górnej liczby tak, jak zapisana w zadaniu — do przekreślenia, gdy `reducedByBorrow`. */
  originalTopDigit: number;
  /** Czy sąsiednia kolumna po prawej pożyczyła z tej — jeśli tak, `originalTopDigit` trzeba przekreślić. */
  reducedByBorrow: boolean;
  /** Cyfra po odjęciu ewentualnej pożyczki, ale przed dopisaniem własnych +10. */
  digitAfterReduction: number;
  bottomDigit: number;
  /** Czy ta kolumna musiała pożyczyć 10 z kolumny po lewej. */
  borrowed: boolean;
  /** Wartość górnej cyfry użyta do odejmowania (digitAfterReduction, +10 gdy borrowed). */
  effectiveTopDigit: number;
  resultDigit: number;
}

/**
 * Krok po kroku odejmowania pisemnego `a - b` (wymaga `a >= b`, bez
 * pożyczania przez zero — patrz komentarz u góry pliku).
 */
export function buildSubtractionSteps(a: number, b: number): SubtractionColumnStep[] {
  const length = String(a).length;
  const topDigits = digitsOf(a, length).map((d) => d ?? 0);
  const bottomDigits = digitsOf(b, length).map((d) => d ?? 0);
  const steps: SubtractionColumnStep[] = [];
  const borrowedFrom = new Array(length).fill(false);

  for (let i = 0; i < length; i++) {
    const rawDigit = topDigits[i];
    const reducedByBorrow = borrowedFrom[i];
    const digitAfterReduction = reducedByBorrow ? rawDigit - 1 : rawDigit;
    const bottom = bottomDigits[i];
    const borrowed = digitAfterReduction < bottom;
    const effectiveTopDigit = borrowed ? digitAfterReduction + 10 : digitAfterReduction;
    if (borrowed && i + 1 < length) borrowedFrom[i + 1] = true;

    steps.push({
      index: i,
      place: PLACE_LABELS[i],
      originalTopDigit: rawDigit,
      reducedByBorrow,
      digitAfterReduction,
      bottomDigit: bottom,
      borrowed,
      effectiveTopDigit,
      resultDigit: effectiveTopDigit - bottom,
    });
  }
  return steps;
}

/**
 * Cyfra faktycznie pokazywana w komórce kolumny po pożyczeniu. Zwykle to po
 * prostu `digitAfterReduction` (oryginalna cyfra minus ewentualna pożyczka
 * oddana sąsiadowi), z osobnym `borrowedTen` dopisującym małą „1” przed nią.
 * Ale kolumna, w której zapisane jest zero i która *sama* musi pożyczyć
 * (`digitAfterReduction` schodzi poniżej zera), nie ma czego pokazać jako
 * „zredukowaną" cyfrę — w zapisie pisemnym taka kolumna od razu przeskakuje
 * do `effectiveTopDigit` (np. 0 → 9), bez oddzielnego dopisywania „+10" nad
 * już przekreśloną cyfrą. Używane przez każdy widok pożyczania „przez zero".
 */
export function reducedTopDigit(step: SubtractionColumnStep): number {
  return step.digitAfterReduction < 0 ? step.effectiveTopDigit : step.digitAfterReduction;
}

export interface MultiplicationColumnStep {
  index: number;
  place: ColumnPlace;
  topDigit: number;
  /** Iloczyn cyfry i mnożnika, bez przeniesienia. */
  digitProduct: number;
  /** Przeniesienie wchodzące z kolumny o jeden mniejszej (z prawej). */
  incomingCarry: number;
  /** `digitProduct + incomingCarry`. */
  total: number;
  /** Cyfra zapisywana w wyniku tej kolumny. */
  resultDigit: number;
  /**
   * Przeniesienie wychodzące do kolumny o jeden większej (w lewo) — w
   * przeciwieństwie do dodawania (zawsze 0 albo 1) może tu wynosić 0–8,
   * bo `9 × 9 = 81` to największy możliwy iloczyn dwóch cyfr.
   */
  outgoingCarry: number;
}

/**
 * Krok po kroku mnożenia pisemnego `a × multiplier` (mnożnik jednocyfrowy,
 * 1–9), od jedności w lewo. Mnożnik jest zapisywany tylko raz, pod kolumną
 * jedności — inaczej niż `bottomDigit` w dodawaniu/odejmowaniu, gdzie druga
 * liczba ma swoją cyfrę w każdej kolumnie (patrz wywołujące komponenty:
 * `bottom` w `ColumnCellData` ustawiają tylko dla kolumny jedności).
 */
export function buildMultiplicationSteps(a: number, multiplier: number): MultiplicationColumnStep[] {
  const originalLength = String(a).length;
  const length = originalLength + 1;
  const topDigits = digitsOf(a, length);
  const steps: MultiplicationColumnStep[] = [];
  let carry = 0;

  for (let i = 0; i < length; i++) {
    const topDigit = topDigits[i] ?? 0;
    if (topDigit === 0 && carry === 0 && i >= originalLength) break;
    const digitProduct = topDigit * multiplier;
    const total = digitProduct + carry;
    const resultDigit = total % 10;
    const outgoingCarry = Math.floor(total / 10);
    steps.push({
      index: i,
      place: PLACE_LABELS[i],
      topDigit,
      digitProduct,
      incomingCarry: carry,
      total,
      resultDigit,
      outgoingCarry,
    });
    carry = outgoingCarry;
  }
  return steps;
}

export interface PartialProduct {
  /** Cyfra mnożnika na tym miejscu dziesiętnym. */
  digit: number;
  place: ColumnPlace;
  /** Indeks miejsca = liczba kolumn, o którą ten iloczyn cząstkowy jest przesunięty w lewo. */
  shift: number;
  /** `a × digit`, bez przesunięcia — to samo, co liczy `buildMultiplicationSteps`. */
  value: number;
  /** Cyfry `value`, już przesunięte o `shift` kolumn w lewo (index 0 = jedności), dopełnione do `width`. */
  digits: (number | null)[];
}

export interface LongMultiplicationLayout {
  topDigits: (number | null)[];
  multiplierDigits: (number | null)[];
  /** Jeden wpis na każdą niezerową cyfrę mnożnika — cyfra 0 nie tworzy wiersza (mnożenie przez 0 daje same zera). */
  partials: PartialProduct[];
  sumDigits: (number | null)[];
  total: number;
}

/** Przesuwa gotową tablicę cyfr (index 0 = jedności) o `shift` kolumn w lewo, dopełniając zwolnione miejsca `null`-ami. */
export function shiftDigits(digits: (number | null)[], shift: number): (number | null)[] {
  const padding: (number | null)[] = Array.from({ length: shift }, () => null);
  return padding.concat(digits).slice(0, digits.length);
}

/**
 * Rozkłada mnożenie pisemne `a × multiplier` (mnożnik wielocyfrowy) na
 * iloczyny cząstkowe — jeden na każdą cyfrę mnożnika — plus sumę końcową.
 * Każdy iloczyn cząstkowy to dokładnie to samo mnożenie przez liczbę
 * jednocyfrową, którego dziecko nauczyło się w poprzedniej lekcji (patrz
 * `buildMultiplicationSteps`), tylko zapisane `shift` kolumn dalej w lewo,
 * bo mnożenie przez cyfrę dziesiątek to w istocie mnożenie przez 10 razy
 * więcej. Cyfry o wartości 0 są pomijane — mnożenie przez 0 daje sam wiersz
 * zer, którego w zapisie pisemnym się nie pisze.
 *
 * `width` (domyślnie 4 — jedności…tysiące, tak jak reszta modułu) musi
 * pomieścić i mnożną, i wynik końcowy; dobieraj przykłady tak, żeby się
 * mieściły, tak jak `buildAdditionSteps`/`buildSubtractionSteps` zakładają
 * brak przepełnienia poza swój zasięg.
 */
export function buildLongMultiplicationLayout(a: number, multiplier: number, width = 4): LongMultiplicationLayout {
  const multiplierDigitsRaw = digitsOf(multiplier, width).map((d) => d ?? 0);
  const total = a * multiplier;

  const partials: PartialProduct[] = multiplierDigitsRaw
    .map((digit, shift) => {
      const value = a * digit;
      return {
        digit,
        place: PLACE_LABELS[shift],
        shift,
        value,
        digits: shiftDigits(digitsOf(value, width), shift),
      };
    })
    .filter((partial) => partial.digit !== 0);

  return {
    topDigits: digitsOf(a, width),
    multiplierDigits: digitsOf(multiplier, width),
    partials,
    sumDigits: digitsOf(total, width),
    total,
  };
}

export const COLUMN_ALGORITHM_RULES: string[] = [
  'Liczby ustawiamy jedna pod drugą tak, żeby te same miejsca dziesiętne stały w jednej kolumnie: jedności pod jednościami, dziesiątki pod dziesiątkami, setki pod setkami.',
  'Krótszą liczbę zostawiamy „wysuniętą w prawo" — nie dopisujemy jej cyfr z lewej strony, brakujące kolumny po prostu zostają puste.',
  'Liczymy zawsze od kolumny jedności, czyli od prawej strony do lewej.',
  'Gdy suma w kolumnie wynosi 10 lub więcej, zapisujemy tylko cyfrę jedności tej sumy, a „1" przenosimy małą cyfrą nad kolumnę po lewej.',
  'Gdy górna cyfra jest mniejsza od dolnej, „pożyczamy" 10 z sąsiedniej kolumny po lewej: tamtą cyfrę zmniejszamy o 1, a do bieżącej kolumny dopisujemy 10.',
];
