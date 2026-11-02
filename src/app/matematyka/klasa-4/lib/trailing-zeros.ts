/**
 * Rozkład mnożenia dwóch liczb zakończonych zerami na skrót: obetnij zera
 * końcowe obu czynników, pomnóż to, co zostało (rdzeń), doklej z powrotem
 * łączną liczbę obciętych zer. Ta sama dyscyplina co `column-algorithm.ts` —
 * jedna czysta funkcja karmi widżet, przykłady i klucz odpowiedzi, żeby się
 * nie mogły rozjechać.
 *
 * Uwaga: to zera na samym KOŃCU liczby, nie każde zero w zapisie — 2050 ma
 * tylko jedno zero końcowe (środkowe zero go nie liczy się), 205 nie ma
 * żadnego (kończy się na 5). Ten rozróżnienie jest głównym celem rozgrzewki.
 */

/** Liczba zer na końcu zapisu `n` (0 dla liczb niekończących się zerem, w tym samego 0). */
export function trailingZerosOf(n: number): number {
  const safe = Math.max(0, Math.round(n));
  if (safe === 0) return 0;
  let count = 0;
  let remaining = safe;
  while (remaining % 10 === 0) {
    count++;
    remaining = Math.floor(remaining / 10);
  }
  return count;
}

/** `n` po obcięciu wszystkich zer końcowych — „rdzeń” liczby, np. coreOf(4700) === 47. */
export function coreOf(n: number): number {
  return Math.max(0, Math.round(n)) / 10 ** trailingZerosOf(n);
}

export interface ZeroShortcut {
  a: number;
  aCore: number;
  aZeros: number;
  b: number;
  bCore: number;
  bZeros: number;
  /** Iloczyn samych rdzeni, bez dopisanych zer — może sam kończyć się zerem (np. 25 × 4 = 100). */
  coreProduct: number;
  /** Łączna liczba zer do dopisania = aZeros + bZeros. */
  totalZeros: number;
  /** coreProduct z dopisanymi totalZeros zerami — to samo, co a × b liczone wprost. */
  result: number;
}

/** Rozkłada mnożenie `a × b` na skrót przez zera — patrz komentarz u góry pliku. */
export function buildZeroShortcut(a: number, b: number): ZeroShortcut {
  const aZeros = trailingZerosOf(a);
  const bZeros = trailingZerosOf(b);
  const aCore = coreOf(a);
  const bCore = coreOf(b);
  const coreProduct = aCore * bCore;
  const totalZeros = aZeros + bZeros;
  return {
    a,
    aCore,
    aZeros,
    b,
    bCore,
    bZeros,
    coreProduct,
    totalZeros,
    result: coreProduct * 10 ** totalZeros,
  };
}

export const ZERO_SHORTCUT_RULES: string[] = [
  'Licz tylko zera na samym KOŃCU liczby — zero w środku (jak w 205 albo 2050) się nie obcina.',
  'Obetnij zera końcowe obu czynników i zapamiętaj, ile ich razem obciąłeś/aś.',
  'Pomnóż to, co zostało po obcięciu — rdzeń przez rdzeń — dokładnie tak, jak już umiesz.',
  'Do wyniku mnożenia rdzeni dopisz z powrotem tyle zer, ile łącznie obciąłeś/aś na początku.',
  'Uważaj: jeśli iloczyn samych rdzeni sam kończy się zerem (np. 25 × 4 = 100), w wyniku będzie więcej zer niż tych, które obciąłeś/aś — dopisujesz zera DO całego iloczynu rdzeni, nie zamiast jego własnych.',
];
