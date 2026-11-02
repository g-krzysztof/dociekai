/** Największy wspólny dzielnik (Euklides). */
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/** Najmniejsza wspólna wielokrotność. */
export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

/** Skraca ułamek do postaci nieskracalnej. */
export function simplify(num: number, den: number): { num: number; den: number } {
  if (den === 0) return { num: 0, den: 1 };
  const d = gcd(num, den);
  return { num: num / d, den: den / d };
}

/** Rozszerza ułamek do podanego mianownika (musi być wielokrotnością obecnego). */
export function extendToDenominator(num: number, den: number, targetDen: number): number {
  if (targetDen % den !== 0) {
    throw new Error(`Mianownik ${targetDen} nie jest wielokrotnością ${den}`);
  }
  return num * (targetDen / den);
}

/** Porównuje dwa ułamki. Zwraca: -1 jeśli a<b, 0 jeśli a==b, 1 jeśli a>b. */
export function compareFractions(
  aNum: number,
  aDen: number,
  bNum: number,
  bDen: number,
): -1 | 0 | 1 {
  const lhs = aNum * bDen;
  const rhs = bNum * aDen;
  if (lhs < rhs) return -1;
  if (lhs > rhs) return 1;
  return 0;
}

/** Dodaje dwa ułamki, zwraca wynik w postaci nieskracalnej. */
export function addFractions(
  aNum: number,
  aDen: number,
  bNum: number,
  bDen: number,
): { num: number; den: number } {
  const commonDen = lcm(aDen, bDen);
  const newNum = aNum * (commonDen / aDen) + bNum * (commonDen / bDen);
  return simplify(newNum, commonDen);
}

/** Odejmuje ułamek b od a, zwraca wynik w postaci nieskracalnej. */
export function subtractFractions(
  aNum: number,
  aDen: number,
  bNum: number,
  bDen: number,
): { num: number; den: number } {
  const commonDen = lcm(aDen, bDen);
  const newNum = aNum * (commonDen / aDen) - bNum * (commonDen / bDen);
  return simplify(newNum, commonDen);
}

/** Mnoży ułamek przez liczbę całkowitą. */
export function multiplyFractionByWhole(
  num: number,
  den: number,
  whole: number,
): { num: number; den: number; value: number } {
  const resultNum = num * whole;
  const simplified = simplify(resultNum, den);
  return {
    num: simplified.num,
    den: simplified.den,
    value: resultNum / den, // zawsze całkowite dla naszych zadań poziomu 1
  };
}

/** Sprawdza czy ułamek jest w postaci nieskracalnej. */
export function isSimplified(num: number, den: number): boolean {
  return gcd(num, den) === 1;
}

/** Generuje losowy ułamek właściwy (licznik < mianownik) w zadanym zakresie mianowników. */
export function randomFraction(options: {
  denMin: number;
  denMax: number;
  exclude?: { num: number; den: number }[];
  simplifiedOnly?: boolean;
}): { num: number; den: number } {
  const { denMin, denMax, exclude = [], simplifiedOnly = true } = options;

  const candidates: { num: number; den: number }[] = [];
  for (let den = denMin; den <= denMax; den++) {
    for (let num = 1; num < den; num++) {
      if (simplifiedOnly && !isSimplified(num, den)) continue;
      const excluded = exclude.some((e) => e.num === num && e.den === den);
      if (!excluded) candidates.push({ num, den });
    }
  }

  if (candidates.length === 0) {
    // fallback: pozwól nieskracalne
    for (let den = denMin; den <= denMax; den++) {
      for (let num = 1; num < den; num++) {
        const excluded = exclude.some((e) => e.num === num && e.den === den);
        if (!excluded) candidates.push({ num, den });
      }
    }
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

/** Losuje całość (pojemność zbiornika) z predefiniowanego zestawu. */
export function randomTankCapacity(): number {
  const capacities = [400, 500, 600, 800, 1000, 1200, 1500, 1600, 1800, 2000, 2400, 3000];
  return capacities[Math.floor(Math.random() * capacities.length)];
}

/** Zwraca true jeśli ułamek daje wynik całkowity przy mnożeniu przez całość. */
export function yieldsInteger(num: number, den: number, whole: number): boolean {
  return (whole * num) % den === 0;
}

/** Formatuje ułamek do wyświetlenia: "3/4" */
export function formatFraction(num: number, den: number): string {
  return `${num}/${den}`;
}

/** Formatuje liczbę z separatorem tysięcy (polski). */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('pl-PL').format(n);
}