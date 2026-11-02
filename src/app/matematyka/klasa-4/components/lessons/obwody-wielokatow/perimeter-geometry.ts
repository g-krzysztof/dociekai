/**
 * Wspólna geometria obwodu dla tej lekcji: jedna funkcja rozkłada dowolny
 * wielokąt (wierzchołki + długości boków) na krawędzie z gotowym punktem
 * etykiety na zewnątrz figury — karmi nią i animowany `PerimeterWalk`,
 * i statyczny `PerimeterCompare` („jedna czysta funkcja
 * karmi wizual + przykłady + klucz odpowiedzi”).
 *
 * Konwencja nawijania: wierzchołki zawsze w kolejności zgodnej z ruchem
 * wskazówek zegara na ekranie (tak jak `buildRectangleFigure`: lewy-górny,
 * prawy-górny, prawy-dolny, lewy-dolny). Dzięki temu wektor prostopadły
 * `{ x: dir.y, y: -dir.x }` do kierunku boku zawsze wskazuje na zewnątrz
 * figury — bez tego etykiety długości boków lądowałyby czasem w środku
 * figury zamiast na zewnątrz.
 */

import { directionVector, round, type GeoPoint } from '../../../lib/lines';

export interface PerimeterEdge {
  a: GeoPoint;
  b: GeoPoint;
  mid: GeoPoint;
  /** Punkt na zewnątrz figury, w sam raz na etykietę długości boku. */
  labelPoint: GeoPoint;
  length: number;
}

/** Cztery rogi prostokąta (lub kwadratu) w kolejności zgodnej z ruchem wskazówek zegara. */
export function rectangleCorners(origin: GeoPoint, widthPx: number, heightPx: number): GeoPoint[] {
  return [
    { x: round(origin.x), y: round(origin.y) },
    { x: round(origin.x + widthPx), y: round(origin.y) },
    { x: round(origin.x + widthPx), y: round(origin.y + heightPx) },
    { x: round(origin.x), y: round(origin.y + heightPx) },
  ];
}

/** Rozkłada zamknięty wielokąt na krawędzie z długością i punktem etykiety na zewnątrz. */
export function buildPerimeterEdges(
  points: GeoPoint[],
  sideLengths: number[],
  labelOffset = 18
): PerimeterEdge[] {
  return points.map((a, i) => {
    const b = points[(i + 1) % points.length];
    const dir = directionVector(a, b);
    const perp: GeoPoint = { x: dir.y, y: -dir.x };
    const mid: GeoPoint = { x: round((a.x + b.x) / 2), y: round((a.y + b.y) / 2) };
    return {
      a,
      b,
      mid,
      labelPoint: { x: round(mid.x + perp.x * labelOffset), y: round(mid.y + perp.y * labelOffset) },
      length: sideLengths[i],
    };
  });
}

export function totalPerimeter(sideLengths: number[]): number {
  return Math.round(sideLengths.reduce((sum, len) => sum + len, 0) * 100) / 100;
}

/** Zamienia 4.5 na „4,5” (polski zapis dziesiętny) — pełne liczby zostają bez przecinka. */
export function formatLength(value: number, unit: string): string {
  const text = Number.isInteger(value) ? `${value}` : value.toFixed(1).replace('.', ',');
  return `${text} ${unit}`;
}
