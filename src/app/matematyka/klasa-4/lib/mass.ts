/**
 * Gramy jako jedyna wewnętrzna jednostka — ten sam pomysł co milimetry w
 * `length.ts` czy grosze w `money.ts`: widget, przykład i klucz odpowiedzi
 * liczą z tego samego źródła, więc nie mogą się rozjechać.
 */

export interface MassUnit {
  code: 'g' | 'dag' | 'kg' | 't';
  label: string;
  /** Ile gramów mieści jedna taka jednostka. */
  factorG: number;
}

/** Od najmniejszej do największej — dokładnie w tej kolejności czyta się drabinkę jednostek. */
export const MASS_UNITS: readonly MassUnit[] = [
  { code: 'g', label: 'gram', factorG: 1 },
  { code: 'dag', label: 'dekagram', factorG: 10 },
  { code: 'kg', label: 'kilogram', factorG: 1000 },
  { code: 't', label: 'tona', factorG: 1_000_000 },
] as const;

export function massUnitIndex(code: string): number {
  return MASS_UNITS.findIndex((unit) => unit.code === code);
}

export function toGrams(value: number, code: string): number {
  const unit = MASS_UNITS[massUnitIndex(code)];
  return value * (unit?.factorG ?? 1);
}

export function fromGrams(gramsValue: number, code: string): number {
  const unit = MASS_UNITS[massUnitIndex(code)];
  return gramsValue / (unit?.factorG ?? 1);
}

export function convertMass(value: number, fromCode: string, toCode: string): number {
  return fromGrams(toGrams(value, fromCode), toCode);
}

/**
 * Krotność między sąsiednimi jednostkami drabinki (indeks `lowerIndex` to
 * mniejsza jednostka, `lowerIndex + 1` większa). W przeciwieństwie do
 * drabinki długości (jeden wyjątek: m→km to ×1000) tutaj są AŻ DWA miejsca,
 * gdzie skok nie jest ×10: dag→kg to ×100 (100 dag = 1 kg), a kg→t to ×1000.
 * Tylko g→dag jest zwykłym ×10 — dokładnie ten kontrast z długością widać
 * w kroku Przykłady.
 */
export function massStepRatio(lowerIndex: number): number {
  const lower = MASS_UNITS[lowerIndex];
  const upper = MASS_UNITS[lowerIndex + 1];
  if (!lower || !upper) return 1;
  return upper.factorG / lower.factorG;
}

export const MASS_RULES: string[] = [
  'Jednostki masy od najmniejszej do największej: g, dag, kg, t (tona).',
  '1 dag to 10 g — jedyne miejsce na tej drabince, gdzie skok jest zwykłym ×10.',
  '1 kg to już 100 dag, czyli 1000 g — drugi, większy skok.',
  '1 t to 1000 kg — trzeci, jeszcze większy skok: tona waży tyle, co mały samochód osobowy.',
  'Zamieniając na mniejszą jednostkę — mnożysz. Zamieniając na większą — dzielisz.',
  'Dobierz jednostkę do tego, co ważysz: spinkę w g, jabłko w dag, dziecko w kg, ciężarówkę w t.',
];

/** Odważnik do szalki — wartość w gramach + etykieta w jednostce, w jakiej naturalnie się go czyta. */
export interface WeightToken {
  grams: number;
  label: string;
}

/**
 * Zestaw odważników na wagę szalkową: 1 g, 1 dag, 10 dag, 1 kg — czyli
 * dokładnie "jedności/dziesiątki/setki/tysiące gramów", ten sam podział na
 * rzędy co przy dużych liczbach w Module 1. Celowo etykietowane w
 * jednostkach (nie samych gramach), żeby klikanie odważnika od razu
 * ćwiczyło rozpoznawanie dag/kg, a nie tylko liczenie gramów.
 */
export const WEIGHT_TOKENS: readonly WeightToken[] = [
  { grams: 1, label: '1 g' },
  { grams: 10, label: '1 dag' },
  { grams: 100, label: '10 dag' },
  { grams: 1000, label: '1 kg' },
] as const;

/** np. formatGrams(1500) === '1500 g', używane w podpisach szalki. */
export function formatGrams(grams: number): string {
  return `${Math.round(grams).toLocaleString('pl-PL')} g`;
}
