import type { GuideActMeta } from '../guide-act';

/** Wszystkie akty na `flow`: żaden akt tego przewodnika nie scrubuje scrollem. */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Co znaczy ten zapis?', mode: 'flow' },
  { id: 'co-to-skala', label: 'Skala to stosunek', mode: 'flow' },
  { id: 'przeliczanie', label: 'Przeliczanie w obie strony', mode: 'flow' },
  { id: 'plan-i-mapa', label: 'Skala wokół ciebie', mode: 'flow' },
];
