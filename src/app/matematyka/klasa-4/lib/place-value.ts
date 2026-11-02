/**
 * Rozbicie liczby naturalnej na klasy (jedności, tysiące, miliony, ...) —
 * po trzy rzędy naraz, dokładnie tak, jak zapisuje się duże liczby z odstępami.
 * Tabele budowane programowo, żeby wizualizacja i wynik nie mogły się rozjechać
 * (ten sam pomysł co `roman.ts`'owy `romanChunksOf`).
 */

const CLASS_NAMES = ['jedności', 'tysiące', 'miliony', 'miliardy'] as const;

export interface PlaceValueClass {
  /** Nazwa klasy: jedności / tysiące / miliony / ... */
  name: string;
  /** Cyfry tej klasy — bez wiodących zer na klasie najbardziej znaczącej, w pozostałych zawsze 3 cyfry. */
  digits: string;
  /** Wartość liczbowa samej klasy, np. dla miliony w 31 536 000 to 31. */
  value: number;
  /** Mnożnik klasy: 1, 1000, 1 000 000, ... */
  multiplier: number;
}

/** Liczbę ≥ 0 rozkłada na klasy, od najbardziej znaczącej. */
export function classesOf(n: number): PlaceValueClass[] {
  const safe = Math.max(0, Math.floor(n));
  if (safe === 0) return [{ name: 'jedności', digits: '0', value: 0, multiplier: 1 }];

  const chunks: number[] = [];
  let remaining = safe;
  while (remaining > 0) {
    chunks.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }

  return chunks
    .map((chunk, power) => ({
      name: CLASS_NAMES[power] ?? `klasa ×10^${power * 3}`,
      value: chunk,
      multiplier: 1000 ** power,
      digits: power === chunks.length - 1 ? String(chunk) : String(chunk).padStart(3, '0'),
    }))
    .reverse();
}

/** Zapis z odstępami między klasami, np. formatWithClassSpaces(31536000) === '31 536 000'. */
export function formatWithClassSpaces(n: number): string {
  return classesOf(n)
    .map((c) => c.digits)
    .join(' ');
}

/** Wartość pojedynczej cyfry na danym rzędzie (0 = jedności, 1 = dziesiątki, ...). */
export function placeValueOf(digit: number, place: number): number {
  return digit * 10 ** place;
}

/**
 * Ściąga z zasad — wspólna baza dla przewodnika i przyszłych lekcji o zapisie
 * dużych liczb, żeby tekst nie rozjechał się przy kolejnej redakcji.
 */
export const PLACE_VALUE_RULES: string[] = [
  'Cyfr jest dziesięć: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 — nimi zapiszesz każdą liczbę.',
  'Ta sama cyfra ma różną wartość zależnie od miejsca (rzędu), na którym stoi: 5 to pięć, ale 50 to pięćdziesiąt.',
  'Rzędy grupuje się po trzy w klasy: jedności, tysiące, miliony — każda klasa to osobna „paczka" cyfr.',
  'Zapisując dużą liczbę, zostawiasz odstęp między klasami: 31 536 000, nie 31536000.',
  'Czytasz klasę po klasie, od największej: „31 milionów, 536 tysięcy".',
];
