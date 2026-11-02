// Silnik hist-map: rzut lon/lat na kadr Polski (geo-polska.ts) i geometria
// wielokątów. Konsumenci: L9 mapa-i-plan, L10 symbole-narodowe (geo-legiony),
// L12 regiony-i-mala-ojczyzna.
import { GEO_PROJ } from './geo-polska';

export type LonLat = readonly [number, number];
export type XY = [number, number];

/** Rzut punktu geograficznego na płaszczyznę mapy (ten sam co kontury). */
export function project([lon, lat]: LonLat): XY {
  return [
    Math.round((lon - GEO_PROJ.lon0) * GEO_PROJ.kx * 10) / 10,
    Math.round((GEO_PROJ.lat1 - lat) * GEO_PROJ.ky * 10) / 10,
  ];
}

export function polyPath(points: readonly LonLat[]): string {
  return 'M' + points.map((p) => project(p).join(',')).join(' ') + 'Z';
}

/** Czy punkt leży w wielokącie (promień w prawo). */
export function pointInPolygon([x, y]: LonLat, poly: readonly LonLat[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
