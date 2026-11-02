/**
 * L1, blok 2 „Co zrobiły słowa” — pięć poleceń do „Poranka przy Lipowej”.
 * `kind` to rodzaj kotwicy w `poranek.ts`; sędzia (`judgeEvidence`) czyta tylko
 * kotwice, więc odpowiedź stoi w tekście, a nie w głowie autora.
 */

export interface Skutek {
  kind: 'przeprosiny' | 'rozsmieszenie' | 'zranienie' | 'obietnica' | 'podziekowanie';
  /** Czasownik do polecenia: „Znajdź słowa, które kogoś …”. */
  verb: string;
  /** Krótka nazwa na karcie. */
  label: string;
}

export const SKUTKI: Skutek[] = [
  { kind: 'przeprosiny', verb: 'przeprosiły', label: 'przeprosiły' },
  { kind: 'rozsmieszenie', verb: 'rozśmieszyły', label: 'rozśmieszyły' },
  { kind: 'zranienie', verb: 'zraniły', label: 'zraniły' },
  { kind: 'obietnica', verb: 'coś obiecały', label: 'obiecały' },
  { kind: 'podziekowanie', verb: 'komuś podziękowały', label: 'podziękowały' },
];

export const SKUTEK_LABEL: Record<string, string> = Object.fromEntries(SKUTKI.map((s) => [s.kind, s.label]));

/** To samo w liczbie pojedynczej — „to słowo przeprosiło”, gdy starte jest jedno słowo. */
export const SKUTEK_LABEL_JEDNO: Record<Skutek['kind'], string> = {
  przeprosiny: 'przeprosiło',
  rozsmieszenie: 'rozśmieszyło',
  zranienie: 'zraniło',
  obietnica: 'obiecało',
  podziekowanie: 'podziękowało',
};

/** Wypowiedzi, które dziecko może stuknąć jako „słowa”. */
export const WYPOWIEDZI = ['u1', 'u2', 'u3', 'u4', 'u5'];

