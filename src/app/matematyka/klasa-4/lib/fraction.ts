/**
 * Wycinki koła feedujące `FractionPie` — dzieli okrąg na `count` równych
 * części, zaczynając od góry (kąt -90°), zgodnie z ruchem wskazówek zegara.
 * Ten sam prymityw trygonometryczny co `pointOnCircle` w `lib/circle.ts`,
 * ale zwraca gotowe ścieżki wypełnionych wycinków, nie pojedyncze punkty —
 * `FractionPie` potrzebuje kształtów do zamalowania, nie linii do narysowania.
 *
 * Współrzędne zaokrąglone do 3 miejsc po przecinku — SSR i
 * klient nie gwarantują bit-identycznych float64 przy tej samej trygonometrii.
 */

import { round, type GeoPoint } from './lines';

export interface PieSlice {
  path: string;
}

export function buildPieSlices(center: GeoPoint, radius: number, count: number): PieSlice[] {
  const step = 360 / count;
  const slices: PieSlice[] = [];
  for (let i = 0; i < count; i++) {
    const startAngle = -90 + i * step;
    const endAngle = startAngle + step;
    const start = pointAtAngle(center, radius, startAngle);
    const end = pointAtAngle(center, radius, endAngle);
    const largeArc = step > 180 ? 1 : 0;
    slices.push({
      path: `M ${center.x} ${center.y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`,
    });
  }
  return slices;
}

function pointAtAngle(center: GeoPoint, radius: number, angleDeg: number): GeoPoint {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: round(center.x + Math.cos(rad) * radius), y: round(center.y + Math.sin(rad) * radius) };
}

/**
 * Wspólna paleta kawałków dla obu prymitywów — paska (`FractionBarGlyph`) i
 * koła (`FractionPie`). Zamalowany kawałek jest pełną barwą, pusty — ledwie
 * widocznym tintem z przygaszonym obrysem. Wcześniej puste kawałki miały
 * obrys w pełnym kolorze, więc krzyczały dokładnie tak samo jak zamalowane:
 * rysunek czytał się jak krata, a nie jak „tyle a tyle z całości".
 */
export function pieceFill(color: string, filled: boolean): string {
  return filled ? color : `${color}12`;
}

export function pieceStroke(color: string, filled: boolean): string {
  return filled ? color : `${color}66`;
}
