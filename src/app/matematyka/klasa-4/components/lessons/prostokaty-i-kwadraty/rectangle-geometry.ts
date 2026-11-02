/**
 * Wspólna geometria prostokątów/kwadratów dla tej lekcji: jedna funkcja
 * buduje figurę (wierzchołki, znaczniki kątów prostych, kreski równości
 * boków) z pary wymiarów w pikselach — karmi nią i interaktywny
 * `RectangleBuilder`, i statyczny `RectangleFamilyShowcase`/`RectangleGlyph`
 * w zadaniach `DiagnosticQuiz` („jedna czysta funkcja karmi
 * wizual + przykłady + klucz odpowiedzi”).
 *
 * Znaczniki kąta prostego reużywają `rightAngleMarker()` z `lib/lines`
 * (ta sama konwencja co proste prostopadłe/równoległe: rysują się tylko dwie
 * „dalsze” krawędzie kwadracika). Kreski równości boków (1 kreska = jedna
 * para długości, 2 kreski = druga para; kwadrat dostaje 1 kreskę na
 * wszystkich czterech bokach, bo wtedy wszystkie boki są sobie równe) to
 * standardowa notacja podręcznikowa, wprowadzona po raz pierwszy w tym
 * module przy okazji tej lekcji.
 */

import { directionVector, rightAngleMarker, round, type GeoPoint } from '../../../lib/lines';

/** Rozmiar jednej kratki siatki w pikselach — wspólny dla budowniczego i przykładów. */
export const CELL_PX = 24;

export interface RectangleFigure {
  /** Wierzchołki w kolejności: lewy-górny, prawy-górny, prawy-dolny, lewy-dolny. */
  corners: GeoPoint[];
  cornerMarkers: { onLine1: GeoPoint; onLine2: GeoPoint; outer: GeoPoint }[];
  ticks: {
    top: [GeoPoint, GeoPoint][];
    right: [GeoPoint, GeoPoint][];
    bottom: [GeoPoint, GeoPoint][];
    left: [GeoPoint, GeoPoint][];
  };
  isSquare: boolean;
}

const TICK_HALF = 5;
const TICK_GAP = 5;

/** Jedna lub dwie kreski prostopadłe do boku `a→b`, wyśrodkowane na jego środku. */
function tickSegments(a: GeoPoint, b: GeoPoint, count: number): [GeoPoint, GeoPoint][] {
  const dir = directionVector(a, b);
  const perp: GeoPoint = { x: -dir.y, y: dir.x };
  const mid: GeoPoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const span = (count - 1) * TICK_GAP;
  const segments: [GeoPoint, GeoPoint][] = [];
  for (let i = 0; i < count; i++) {
    const offset = -span / 2 + i * TICK_GAP;
    const cx = mid.x + dir.x * offset;
    const cy = mid.y + dir.y * offset;
    segments.push([
      { x: round(cx - perp.x * TICK_HALF), y: round(cy - perp.y * TICK_HALF) },
      { x: round(cx + perp.x * TICK_HALF), y: round(cy + perp.y * TICK_HALF) },
    ]);
  }
  return segments;
}

/** Figura prostokąta (lub kwadratu) o lewym-górnym rogu w `origin` i wymiarach w pikselach. */
export function buildRectangleFigure(origin: GeoPoint, widthPx: number, heightPx: number): RectangleFigure {
  const topLeft: GeoPoint = { x: round(origin.x), y: round(origin.y) };
  const topRight: GeoPoint = { x: round(origin.x + widthPx), y: round(origin.y) };
  const bottomRight: GeoPoint = { x: round(origin.x + widthPx), y: round(origin.y + heightPx) };
  const bottomLeft: GeoPoint = { x: round(origin.x), y: round(origin.y + heightPx) };
  const corners = [topLeft, topRight, bottomRight, bottomLeft];

  const cornerMarkers = corners.map((corner, i) =>
    rightAngleMarker(corner, corners[(i + 3) % 4], corners[(i + 1) % 4], 11)
  );

  const isSquare = Math.abs(widthPx - heightPx) < 0.5;

  return {
    corners,
    cornerMarkers,
    ticks: {
      top: tickSegments(topLeft, topRight, 1),
      bottom: tickSegments(bottomLeft, bottomRight, 1),
      left: tickSegments(topLeft, bottomLeft, isSquare ? 1 : 2),
      right: tickSegments(topRight, bottomRight, isSquare ? 1 : 2),
    },
    isSquare,
  };
}

/** Polska odmiana „kratki”: 1 kratka, 2–4 kratki, 5+ kratek. */
export function cellsWord(count: number): string {
  if (count === 1) return 'kratka';
  const last = count % 10;
  const lastTwo = count % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'kratki';
  return 'kratek';
}
