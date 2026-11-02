import type { PaletteEntry } from '../lib/pisarnia/types';

/**
 * Paleta uczuć kursu (rejestr T-L4-3) — **jeden plik dla L4 i L7** (karta L4,
 * pułapki). Słowa, które dziecko może wpisać, rozpoznawane we wszystkich
 * formach odmiany (paradygmaty: `python3 scripts/polski-paradygmaty.py
 * src/app/jezyk-polski/klasa-4/data/uczucia.ts` → `uczucia.forms.ts`).
 *
 * Paleta nie podsuwa „dobrej” odpowiedzi: zazdrość, smutek i złość są tu na
 * równi z radością — postać na nie reaguje, nie ocenia ich. „Zły” celowo
 * pominięty (znaczy też „niedobry”).
 */
export const UCZUCIA: PaletteEntry[] = [
  { id: 'cieszyc', label: 'cieszę się', lemmas: ['cieszyć'], group: 'radosc' },
  { id: 'radosc', label: 'czuję radość', lemmas: ['radość', 'radosny'], group: 'radosc' },
  { id: 'szczesliwy', label: 'jestem szczęśliwy / szczęśliwa', lemmas: ['szczęśliwy'], group: 'radosc' },
  { id: 'zazdroscic', label: 'zazdroszczę', lemmas: ['zazdrościć', 'zazdrosny', 'zazdrość'], group: 'zazdrosc' },
  { id: 'martwic', label: 'martwię się', lemmas: ['martwić'], group: 'niepokoj' },
  { id: 'bac', label: 'boję się', lemmas: ['bać'], group: 'niepokoj' },
  { id: 'ciekawy', label: 'jestem ciekawy / ciekawa', lemmas: ['ciekawy', 'ciekawić'], group: 'ciekawosc' },
  { id: 'smutny', label: 'smutno mi', lemmas: ['smutny', 'smutno', 'smucić', 'smutek'], group: 'smutek' },
  { id: 'przykro', label: 'jest mi przykro', lemmas: ['przykro'], group: 'smutek' },
  { id: 'zaskoczony', label: 'jestem zaskoczony / zaskoczona', lemmas: ['zaskoczyć', 'dziwić'], group: 'zaskoczenie' },
  { id: 'zloscic', label: 'złoszczę się', lemmas: ['złościć', 'wściekły'], group: 'zlosc' },
];

export type GrupaUczuc = 'radosc' | 'zazdrosc' | 'niepokoj' | 'ciekawosc' | 'smutek' | 'zaskoczenie' | 'zlosc';

/** Znak uczucia: do wykrycia sprzecznych (radość + smutek) — nie do oceny. */
export const ZNAK: Record<GrupaUczuc, 1 | 0 | -1> = {
  radosc: 1,
  ciekawosc: 1,
  zaskoczenie: 0,
  zazdrosc: -1,
  niepokoj: -1,
  smutek: -1,
  zlosc: -1,
};
