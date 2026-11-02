import type { PaletteEntry } from '@/app/jezyk-polski/klasa-4/lib/pisarnia/types';

/**
 * Paleta do harnessu Pisarni: uczucia (wzór karty L4 „Bez twarzy”) i
 * słowa-oskarżenia (wzór karty L7 „Powiedz inaczej”). Formy odmiany:
 * `python3 scripts/polski-paradygmaty.py src/app/dev/pisarnia/demo-palette.ts`.
 */
export const FEELINGS: PaletteEntry[] = [
  { id: 'cieszyc', label: 'cieszę się', lemmas: ['cieszyć'], group: 'radosc' },
  { id: 'radosc', label: 'radość', lemmas: ['radość', 'radosny'], group: 'radosc' },
  { id: 'szczesliwy', label: 'szczęśliwy', lemmas: ['szczęśliwy'], group: 'radosc' },
  { id: 'zazdroscic', label: 'zazdroszczę', lemmas: ['zazdrościć', 'zazdrosny'], group: 'zazdrosc' },
  { id: 'martwic', label: 'martwię się', lemmas: ['martwić'], group: 'niepokoj' },
  { id: 'bac', label: 'boję się', lemmas: ['bać'], group: 'niepokoj' },
  { id: 'ciekawy', label: 'jestem ciekawy / ciekawa', lemmas: ['ciekawy'], group: 'ciekawosc' },
  { id: 'smutny', label: 'smutno mi', lemmas: ['smutny', 'smutno', 'smucić'], group: 'smutek' },
];

export const ACCUSATIONS: PaletteEntry[] = [
  { id: 'zawsze', label: 'zawsze', forms: ['zawsze'], group: 'oskarzenie' },
  { id: 'nigdy', label: 'nigdy', forms: ['nigdy'], group: 'oskarzenie' },
  { id: 'ty-jestes', label: 'ty jesteś', forms: ['ty jesteś', 'jesteś taki', 'jesteś taka'], group: 'oskarzenie' },
];
