/**
 * Odbicie punktu względem dowolnej prostej (osi symetrii) — nowa technika w
 * kursie: rzut punktu na prostą przez iloczyn skalarny (parametr `t`), potem
 * odbicie o tę samą odległość na drugą stronę. Działa dla osi w dowolnym
 * kierunku (nie tylko pionowej/poziomej), więc ten sam wzór posłuży też
 * przyszłej treści z ukośną osią symetrii.
 *
 * Współrzędne zaokrąglone do 3 miejsc po przecinku (patrz `lib/lines.ts` —
 * SSR i klient nie gwarantują bit-identycznych float64 przy tej samej
 * arytmetyce).
 */

import { round, type GeoPoint } from '../../../lib/lines';

/** Rzut punktu `p` na prostą `a→b` (najbliższy punkt leżący na tej prostej). */
export function perpendicularFoot(p: GeoPoint, a: GeoPoint, b: GeoPoint): GeoPoint {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy || 1;
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  return { x: round(a.x + t * dx), y: round(a.y + t * dy) };
}

/** Odbicie punktu `p` względem osi `a→b` — dwa razy dalej niż rzut, po przeciwnej stronie. */
export function reflectPoint(p: GeoPoint, a: GeoPoint, b: GeoPoint): GeoPoint {
  const foot = perpendicularFoot(p, a, b);
  return { x: round(2 * foot.x - p.x), y: round(2 * foot.y - p.y) };
}
