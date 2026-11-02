/**
 * Rozkład dzielenia pisemnego `dzielna : dzielnik` (dzielnik jednocyfrowy,
 * 2–9) na kroki: znoszenie kolejnej cyfry dzielnej, cyfra ilorazu, iloczyn
 * i reszta — dokładnie w kolejności, w jakiej dziecko zapisuje je w zeszycie
 * pod kreską. Ta sama dyscyplina co `column-algorithm.ts`: jedna czysta
 * funkcja karmi widżet, przykłady i klucz odpowiedzi naraz, więc nie mogą
 * się rozjechać.
 *
 * W przeciwieństwie do dodawania/odejmowania/mnożenia liczba kroków NIE
 * równa się liczbie cyfr dzielnej, a algorytm liczy od lewej, nie od
 * jedności: pierwszy krok może „połknąć" więcej niż jedną cyfrę naraz, gdy
 * sama pierwsza cyfra dzielnej jest mniejsza od dzielnika (np. 128 : 4
 * zaczyna się od grupy „12", nie od samego „1"), a każdy kolejny krok może
 * dać cyfrę ilorazu równą 0, gdy zniesiona cyfra sama w sobie jest
 * mniejsza od dzielnika (np. 824 : 8 ma w środku ilorazu zero) — to
 * najczęstsza pułapka całego algorytmu.
 */

export interface DivisionStep {
  index: number;
  /** Indeks (0-based, licząc od lewej) ostatniej cyfry dzielnej zniesionej w tym kroku. */
  digitIndex: number;
  /** Cyfry dzielnej zniesione w tym kroku (więcej niż jedna tylko w pierwszym kroku, gdy trzeba je złączyć). */
  broughtDownDigits: number[];
  /** Wartość aktualnie dzielona w tym kroku — reszta z poprzedniego kroku ze doklejoną nową cyfrą. */
  currentValue: number;
  /** Cyfra zapisywana w ilorazie w tym kroku — może wynosić 0 (pułapka). */
  quotientDigit: number;
  /** `quotientDigit × dzielnik`, czyli liczba odejmowana od `currentValue`. */
  product: number;
  /** `currentValue − product` — w kolejnym kroku staje się częścią następnego `currentValue`; w ostatnim kroku to końcowa reszta. */
  remainder: number;
}

export interface LongDivisionResult {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
  /** Cyfry dzielnej, licząc od lewej — ten sam porządek, w jakim renderuje się nagłówek widżetu. */
  dividendDigits: number[];
  steps: DivisionStep[];
}

/** Krok po kroku dzielenia pisemnego `dividend : divisor` (dzielnik jednocyfrowy). */
export function buildLongDivisionSteps(dividend: number, divisor: number): LongDivisionResult {
  const dividendDigits = String(dividend)
    .split('')
    .map((d) => Number(d));
  const steps: DivisionStep[] = [];
  let remainder = 0;
  let started = false;
  let groupStart = 0;

  dividendDigits.forEach((digit, i) => {
    const currentValue = remainder * 10 + digit;
    const isLastDigit = i === dividendDigits.length - 1;
    if (!started && currentValue < divisor && !isLastDigit) {
      remainder = currentValue;
      return;
    }
    started = true;
    const quotientDigit = Math.floor(currentValue / divisor);
    const product = quotientDigit * divisor;
    const stepRemainder = currentValue - product;
    steps.push({
      index: steps.length,
      digitIndex: i,
      broughtDownDigits: dividendDigits.slice(groupStart, i + 1),
      currentValue,
      quotientDigit,
      product,
      remainder: stepRemainder,
    });
    remainder = stepRemainder;
    groupStart = i + 1;
  });

  return {
    dividend,
    divisor,
    quotient: Number(steps.map((step) => step.quotientDigit).join('')),
    remainder,
    dividendDigits,
    steps,
  };
}
