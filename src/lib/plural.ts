/**
 * Polska odmiana rzeczownika po liczebniku. Trzy formy, bo polski ma trzy:
 * 1 → „dzień”, 2–4 → „dni”, 0 i 5+ → „dni” (z wyjątkiem nastek 12–14, które
 * zawsze biorą formę mnogą).
 *
 * Mieszka w `lib/`, bo używa jej i kurs matematyki, i seria nauki — a ta druga
 * jest ponad kursami, więc nie mogła sięgać do środka żadnego z nich.
 * `informatyka/klasa-4/lib/plural.ts` ma własną wersję z inną sygnaturą
 * (argumenty pozycyjne) i kilkadziesiąt konsumentów — zostaje, gdzie jest.
 */
export interface PluralForms {
  /** Forma po 1, np. „kredka”, „porcja”. */
  one: string;
  /** Forma po 2–4, np. „kredki”, „porcje”. */
  few: string;
  /** Forma po 0 i 5+, np. „kredek”, „porcji”. */
  many: string;
}

export function plural(count: number, forms: PluralForms): string {
  if (count === 1) return forms.one;
  const last = count % 10;
  const teen = count % 100 >= 12 && count % 100 <= 14;
  return last >= 2 && last <= 4 && !teen ? forms.few : forms.many;
}
