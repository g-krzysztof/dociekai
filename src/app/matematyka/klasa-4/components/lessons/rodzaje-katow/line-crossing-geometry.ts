/**
 * Geometria tej lekcji: klasyfikacja kąta po mierze (ostry/prosty/rozwarty)
 * i dwie przecinające się proste, z których wynikają kąty wierzchołkowe
 * (równe, po przeciwnych stronach wierzchołka) i przyległe (sumują się do
 * 180°, dzielą jedno ramię). Jedna funkcja karmi wizual + przykłady + klucz
 * odpowiedzi.
 *
 * Współrzędne zaokrąglone do 3 miejsc po przecinku (`round` z `lib/lines`)
 * — SSR i klient nie gwarantują bit-identycznych float64 przy tej samej
 * arytmetyce trygonometrycznej.
 */

import { round, type GeoPoint } from '../../../lib/lines';

/** Punkt na okręgu wokół `vertex`: `degrees` 0 = w prawo, rośnie przeciwnie do wskazówek zegara. */
export function pointOnCircle(vertex: GeoPoint, degrees: number, radius: number): GeoPoint {
  const rad = (degrees * Math.PI) / 180;
  return {
    x: round(vertex.x + Math.cos(rad) * radius),
    y: round(vertex.y - Math.sin(rad) * radius),
  };
}

export type AngleType = 'ostry' | 'prosty' | 'rozwarty';

export const ANGLE_TYPE_LABEL: Record<AngleType, string> = {
  ostry: 'ostry',
  prosty: 'prosty',
  rozwarty: 'rozwarty',
};

/** Klasyfikacja kąta (0–180°) po mierze — jedyne miejsce z tą regułą w lekcji. */
export function classifyAngle(degrees: number): AngleType {
  if (degrees === 90) return 'prosty';
  return degrees < 90 ? 'ostry' : 'rozwarty';
}

/** Numer kąta pokazywany dziecku zamiast liter a/b/c/d (te są tylko wewnętrznym id). */
export const REGION_NUMBER: Record<'a' | 'b' | 'c' | 'd', string> = { a: '1', b: '2', c: '3', d: '4' };

export interface CrossingRegion {
  id: 'a' | 'b' | 'c' | 'd';
  /** Granice regionu w stopniach, 0–360°, rosnąco. */
  from: number;
  to: number;
  degrees: number;
}

/**
 * Dwie proste przez wspólny wierzchołek: pozioma (promienie 0°/180°) i
 * nachylona pod `theta` (0 < theta < 180, theta ≠ 90, żeby cztery regiony
 * były parami różnej wielkości). Zwraca cztery kąty w kolejności przeciwnie
 * do wskazówek zegara, zaczynając od promienia 0°.
 *
 * `a` i `c` leżą naprzeciw siebie przez wierzchołek → kąty wierzchołkowe,
 * zawsze równe. `a` i `b` (jak każda sąsiadująca para) dzielą jedno ramię i
 * razem tworzą kąt półpełny → kąty przyległe, suma zawsze 180°.
 */
export function buildCrossingAngles(theta: number): CrossingRegion[] {
  return [
    { id: 'a', from: 0, to: theta, degrees: theta },
    { id: 'b', from: theta, to: 180, degrees: 180 - theta },
    { id: 'c', from: 180, to: 180 + theta, degrees: theta },
    { id: 'd', from: 180 + theta, to: 360, degrees: 180 - theta },
  ];
}

/** Region wierzchołkowy (naprzeciw, przez wierzchołek) do danego regionu. */
export function verticalPartner(id: CrossingRegion['id']): CrossingRegion['id'] {
  const map: Record<CrossingRegion['id'], CrossingRegion['id']> = { a: 'c', b: 'd', c: 'a', d: 'b' };
  return map[id];
}

/** Oba regiony przyległe (sąsiadujące, dzielące jedno ramię) do danego regionu. */
export function adjacentPartners(id: CrossingRegion['id']): CrossingRegion['id'][] {
  const order: CrossingRegion['id'][] = ['a', 'b', 'c', 'd'];
  const i = order.indexOf(id);
  return [order[(i + 3) % 4], order[(i + 1) % 4]];
}

/** Gotowy atrybut `d` dla `<path>` — wycinek koła (region) od `from` do `to` stopni. */
export function sectorPath(vertex: GeoPoint, from: number, to: number, radius: number): string {
  const start = pointOnCircle(vertex, from, radius);
  const end = pointOnCircle(vertex, to, radius);
  const largeArc = to - from > 180 ? 1 : 0;
  return `M ${vertex.x} ${vertex.y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

/** Punkt etykiety/klik-celu na środku łuku regionu, w połowie promienia. */
export function sectorLabelPoint(vertex: GeoPoint, region: CrossingRegion, radius: number): GeoPoint {
  return pointOnCircle(vertex, (region.from + region.to) / 2, radius);
}
