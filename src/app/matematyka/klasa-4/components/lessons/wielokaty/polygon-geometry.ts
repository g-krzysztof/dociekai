/**
 * Wspólna geometria wielokątów dla tej lekcji: budowa wierzchołków foremnego
 * n-kąta z jednej funkcji, żeby wizual (`DotToDotPolygon`, `PolygonFamilyShowcase`,
 * ćwiczenia) i klucz nazw karmiły się tym samym źródłem.
 *
 * Konwencja kąta: 0° = w prawo, rośnie zgodnie ze wskazówkami zegara (naturalne
 * dla współrzędnych ekranowych x/y). `rotationDeg: -90` stawia pierwszy
 * wierzchołek na górze.
 *
 * Współrzędne zaokrąglone do 3 miejsc po przecinku — SSR i klient nie
 * gwarantują bit-identycznych float64 przy tej samej arytmetyce trygonometrycznej.
 */

import { round, type GeoPoint } from '../../../lib/lines';

export const POLYGON_NAMES: Record<number, string> = {
  3: 'trójkąt',
  4: 'czworokąt',
  5: 'pięciokąt',
  6: 'sześciokąt',
};

/** Wierzchołki foremnego wielokąta o `sides` bokach, wpisanego w okrąg `radius`. */
export function polygonPoints(center: GeoPoint, radius: number, sides: number, rotationDeg = -90): GeoPoint[] {
  const points: GeoPoint[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = ((rotationDeg + (i * 360) / sides) * Math.PI) / 180;
    points.push({
      x: round(center.x + Math.cos(angle) * radius),
      y: round(center.y + Math.sin(angle) * radius),
    });
  }
  return points;
}

/** Gotowy atrybut `points` dla `<polygon>`/`<polyline>`. */
export function pointsToString(points: GeoPoint[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(' ');
}
