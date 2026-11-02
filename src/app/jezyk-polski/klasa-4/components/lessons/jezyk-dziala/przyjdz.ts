import type { ClipSpec } from '../../../lib/lektor/types';

/**
 * Cztery odczyty „Przyjdź” (L1, blok 1; rejestr: T-L1-1). Znak na końcu kartki
 * wybiera nagranie: spokojne zaproszenie, rozkaz, pytanie, prośba. Nagrania są
 * stałe — **sprawdzone uchem**, bo `?` i `…` muszą brzmieć wyraźnie inaczej.
 */
export const PRZYJDZ: Record<'kropka' | 'wykrzyknik' | 'pytajnik' | 'wielokropek', ClipSpec> = {
  kropka: 'Przyjdź.',
  wykrzyknik: { text: 'Przyjdź!', style: 0.5, stability: 0.35 },
  pytajnik: { text: 'Przyjdź?', style: 0.3 },
  wielokropek: { text: 'Przyjdź…', style: 0.6, stability: 0.3 },
};
