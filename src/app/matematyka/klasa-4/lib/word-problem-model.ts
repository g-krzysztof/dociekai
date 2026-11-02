/**
 * Czysta logika schematu belkowego (diagramu część-całość / równych grup) —
 * wizualnej metody na strukturę zadania tekstowego. `<BarModel>` w
 * `components/bar-model.tsx` tylko to rysuje; wartość jest tu policzona raz,
 * żeby schemat, zapisane działanie i klucz odpowiedzi nie mogły się rozjechać
 * (ten sam nawyk co `roman.ts`/`place-value.ts`). Promowany z
 * `components/lessons/zadania-tekstowe/` do współdzielonego `lib/`
 * 2026-08-19, gdy lekcja `zadania-tekstowe-pisemne` stała się drugim
 * konsumentem.
 */

export interface BarPart {
  label: string;
  value: number | null;
}

export type BarModelSpec =
  | {
      type: 'part-whole';
      wholeLabel: string;
      wholeValue: number | null;
      parts: BarPart[];
    }
  | {
      type: 'equal-groups';
      /** np. „autokar”, „miseczka” — rzeczownik jednej grupy. */
      groupLabel: string;
      /** np. „uczniów”, „cukierków” — jednostka sumy. */
      unitLabel: string;
      groups: number | null;
      perGroup: number | null;
      total: number | null;
    };

/** Dokładnie jedno pole w `spec` jest `null` — ta funkcja je dolicza. */
export function solveBarModel(spec: BarModelSpec): number {
  if (spec.type === 'part-whole') {
    const knownSum = spec.parts.reduce((sum, part) => sum + (part.value ?? 0), 0);
    return spec.wholeValue === null ? knownSum : spec.wholeValue - knownSum;
  }
  if (spec.total === null) return (spec.groups ?? 0) * (spec.perGroup ?? 0);
  if (spec.perGroup === null) return spec.total / (spec.groups ?? 1);
  return spec.total / (spec.perGroup ?? 1);
}
