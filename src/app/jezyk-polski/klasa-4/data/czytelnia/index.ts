import type { CzytelniaBook } from '../../lib/czytelnia/types';
import { BRZYDKIE_KACZATKO } from './brzydkie-kaczatko';
import { DWOCH_TAKICH } from './dwoch-takich';
import { KRASNOLUDKI } from './krasnoludki';
import { KROL_MACIUS } from './krol-macius';
import { KSIEGA_DZUNGLI } from './ksiega-dzungli';
import { ZLOTA_KACZKA } from './zlota-kaczka';

/**
 * Książki Czytelni w kolejności półki. Sześć z listy (C1, C2, C6, C7, C8, C10)
 * weszło z L2 (2026-10-17) — stół ślepej degustacji; reszta listy (13 tekstów)
 * czeka na decyzję D6.
 */
export const CZYTELNIA: CzytelniaBook[] = [BRZYDKIE_KACZATKO, KRASNOLUDKI, KSIEGA_DZUNGLI, DWOCH_TAKICH, ZLOTA_KACZKA, KROL_MACIUS];

export function bookById(id: string): CzytelniaBook | undefined {
  return CZYTELNIA.find((b) => b.id === id);
}
