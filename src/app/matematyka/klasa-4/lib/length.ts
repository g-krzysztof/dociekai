/**
 * Milimetry jako jedyna wewnętrzna jednostka — ten sam pomysł co grosze w
 * `money.ts` czy klasy w `place-value.ts`: widget, przykład i klucz
 * odpowiedzi liczą z tego samego źródła, więc nie mogą się rozjechać.
 */

export interface LengthUnit {
  code: 'mm' | 'cm' | 'dm' | 'm' | 'km';
  label: string;
  /** Ile milimetrów mieści jedna taka jednostka. */
  factorMm: number;
}

/** Od najmniejszej do największej — dokładnie w tej kolejności czyta się drabinkę jednostek. */
export const LENGTH_UNITS: readonly LengthUnit[] = [
  { code: 'mm', label: 'milimetr', factorMm: 1 },
  { code: 'cm', label: 'centymetr', factorMm: 10 },
  { code: 'dm', label: 'decymetr', factorMm: 100 },
  { code: 'm', label: 'metr', factorMm: 1000 },
  { code: 'km', label: 'kilometr', factorMm: 1_000_000 },
] as const;

export function lengthUnitIndex(code: string): number {
  return LENGTH_UNITS.findIndex((unit) => unit.code === code);
}

export function toMm(value: number, code: string): number {
  const unit = LENGTH_UNITS[lengthUnitIndex(code)];
  return value * (unit?.factorMm ?? 1);
}

export function fromMm(mmValue: number, code: string): number {
  const unit = LENGTH_UNITS[lengthUnitIndex(code)];
  return mmValue / (unit?.factorMm ?? 1);
}

export function convertLength(value: number, fromCode: string, toCode: string): number {
  return fromMm(toMm(value, fromCode), toCode);
}

/**
 * Krotność między sąsiednimi jednostkami drabinki (indeks `lowerIndex` to
 * mniejsza jednostka, `lowerIndex + 1` większa). Wszędzie ×10, poza m→km,
 * gdzie to ×1000 naraz — dokładnie ten wyjątek uczy `<UnitLadder>`.
 */
export function stepRatio(lowerIndex: number): number {
  const lower = LENGTH_UNITS[lowerIndex];
  const upper = LENGTH_UNITS[lowerIndex + 1];
  if (!lower || !upper) return 1;
  return upper.factorMm / lower.factorMm;
}

export const LENGTH_RULES: string[] = [
  'Jednostki długości od najmniejszej do największej: mm, cm, dm, m, km.',
  'Między sąsiednimi jednostkami jest zwykle ×10: 1 cm = 10 mm, 1 dm = 10 cm, 1 m = 10 dm.',
  'Wyjątek: 1 km to od razu 1000 m — trzy ukryte kroki ×10 naraz.',
  'Zamieniając na mniejszą jednostkę — mnożysz. Zamieniając na większą — dzielisz.',
  'Dobierz jednostkę do tego, co mierzysz: mrówkę w mm, ołówek w cm, drzwi w m, trasę w km.',
];
