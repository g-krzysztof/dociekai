/**
 * Wspólna geometria prostych i odcinków dla modułu `geometria`.
 *
 * Jedno źródło prawdy dla rysunków, które wracają w kilku miejscach:
 * - prymitywy odcinka/prostej (`extendFar`, `arrowheadPoints`, `clampToCanvas`)
 *   — pierwotnie z `lessons/punkt-prosta-polprosta-odcinek/geo-shape.ts`, po
 *   drugim konsumencie wypromowane tutaj (geo-shape re-exportuje, patrz tam);
 * - znaczniki kątów (`angleMarker`, `rightAngleMarker`) — pierwotnie z
 *   `guides/jezyk-geometrii/act-kat-i-symbole.tsx`, po drugim konsumencie
 *   wypromowane tutaj (przewodnik importuje, patrz tam);
 * - relacje prostopadłości/równoległości (`arePerpendicular`, `areParallel`)
 *   — dla widżetów tej lekcji.
 *
 * Zasady: każda współrzędna liczona z dzielenia/pierwiastka
 * MUSI być zaokrąglona do 3 miejsc po przecinku (`round`), żeby SSR i klient
 * nie wylosowały różnych float64 na tym samym atrybucie SVG; łuk kąta idzie
 * krótszą drogą po wewnętrznej stronie (sweepFlag z iloczynu wektorowego).
 */

export interface GeoPoint {
  x: number;
  y: number;
}

export function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Punkt na prostej `from → through`, przesunięty daleko poza `through`.
 * Domyślny `<svg>` obcina treść do `viewBox`, więc wystarczająco duży
 * `distance` wygląda jak linia biegnąca w nieskończoność, ucięta krawędzią
 * rysunku, a nie faktycznym końcem odcinka.
 */
export function extendFar(from: GeoPoint, through: GeoPoint, distance = 900): GeoPoint {
  const dx = through.x - from.x;
  const dy = through.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return {
    x: round(through.x + (dx / len) * distance),
    y: round(through.y + (dy / len) * distance),
  };
}

/** Gotowy atrybut `points` dla `<polygon>` — trójkątny grot strzałki w kierunku `from → tip`. */
export function arrowheadPoints(from: GeoPoint, tip: GeoPoint, size = 9): string {
  const dx = tip.x - from.x;
  const dy = tip.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const baseX = tip.x - ux * size * 1.6;
  const baseY = tip.y - uy * size * 1.6;
  const left: GeoPoint = { x: round(baseX + px * size * 0.6), y: round(baseY + py * size * 0.6) };
  const right: GeoPoint = { x: round(baseX - px * size * 0.6), y: round(baseY - py * size * 0.6) };
  const roundedTip: GeoPoint = { x: round(tip.x), y: round(tip.y) };
  return `${roundedTip.x},${roundedTip.y} ${left.x},${left.y} ${right.x},${right.y}`;
}

/** Trzyma punkt w bezpiecznym obszarze rysunku, z dala od krawędzi `viewBox`. */
export function clampToCanvas(point: GeoPoint, width: number, height: number, margin = 26): GeoPoint {
  return {
    x: Math.min(width - margin, Math.max(margin, point.x)),
    y: Math.min(height - margin, Math.max(margin, point.y)),
  };
}

/**
 * Łuk kąta w polskiej konwencji: dochodzi do obu ramion w tej samej
 * odległości od wierzchołka (czyli jest łukiem okręgu wyśrodkowanego w
 * wierzchołku), plus kropka na dwusiecznej, między wierzchołkiem a łukiem.
 * `sweepFlag` wyliczony z iloczynu wektorowego kierunków ramion, żeby łuk
 * zawsze szedł krótszą drogą po wewnętrznej stronie kąta.
 */
export function angleMarker(
  vertex: GeoPoint,
  toward1: GeoPoint,
  toward2: GeoPoint,
  radius: number,
  dotDistance: number
) {
  const v1 = { x: toward1.x - vertex.x, y: toward1.y - vertex.y };
  const v2 = { x: toward2.x - vertex.x, y: toward2.y - vertex.y };
  const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  const u1 = { x: v1.x / len1, y: v1.y / len1 };
  const u2 = { x: v2.x / len2, y: v2.y / len2 };
  const arcStart: GeoPoint = { x: round(vertex.x + u1.x * radius), y: round(vertex.y + u1.y * radius) };
  const arcEnd: GeoPoint = { x: round(vertex.x + u2.x * radius), y: round(vertex.y + u2.y * radius) };
  const sweepFlag = u1.x * u2.y - u1.y * u2.x > 0 ? 1 : 0;
  const bisectRaw = { x: u1.x + u2.x, y: u1.y + u2.y };
  const bisectLen = Math.sqrt(bisectRaw.x * bisectRaw.x + bisectRaw.y * bisectRaw.y);
  const bisect = { x: bisectRaw.x / bisectLen, y: bisectRaw.y / bisectLen };
  const dot: GeoPoint = {
    x: round(vertex.x + bisect.x * dotDistance),
    y: round(vertex.y + bisect.y * dotDistance),
  };
  return { arcStart, arcEnd, sweepFlag, dot };
}

/**
 * Kwadracik kąta prostego — dwa odcinki dotykające obu ramion w tej samej
 * odległości od wierzchołka, wyliczone z rzeczywistych kierunków linii (nie
 * osobno wpisane współrzędne). Rysuje się tylko dwie „dalsze” krawędzie
 * kwadratu — dwie „bliższe” już istnieją jako same przecinające się proste,
 * więc dublowanie ich dawałoby podwójny obrys.
 */
export function rightAngleMarker(corner: GeoPoint, along1: GeoPoint, along2: GeoPoint, size: number) {
  const v1 = { x: along1.x - corner.x, y: along1.y - corner.y };
  const v2 = { x: along2.x - corner.x, y: along2.y - corner.y };
  const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  const u1 = { x: v1.x / len1, y: v1.y / len1 };
  const u2 = { x: v2.x / len2, y: v2.y / len2 };
  const onLine1: GeoPoint = { x: round(corner.x + u1.x * size), y: round(corner.y + u1.y * size) };
  const onLine2: GeoPoint = { x: round(corner.x + u2.x * size), y: round(corner.y + u2.y * size) };
  const outer: GeoPoint = { x: round(onLine1.x + u2.x * size), y: round(onLine1.y + u2.y * size) };
  return { onLine1, onLine2, outer };
}

/** Kierunek odcinka `a → b` jako znormalizowany wektor (długość 1). */
export function directionVector(a: GeoPoint, b: GeoPoint): GeoPoint {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: dx / len, y: dy / len };
}

/**
 * Czy dwa kierunki są prostopadłe? Iloczyn skalarny jednostkowych wektorów
 * jest 0 dla kąta 90° — `tolerance` dopuszcza drobne odchyłki (domyślnie ~3°).
 */
export function arePerpendicular(dirA: GeoPoint, dirB: GeoPoint, tolerance = 0.05): boolean {
  return Math.abs(dirA.x * dirB.x + dirA.y * dirB.y) < tolerance;
}

/**
 * Czy dwa kierunki są równoległe? Iloczyn wektorowy jednostkowych wektorów
 * jest 0 dla kątów 0° i 180° — `tolerance` dopuszcza drobne odchyłki.
 */
export function areParallel(dirA: GeoPoint, dirB: GeoPoint, tolerance = 0.05): boolean {
  return Math.abs(dirA.x * dirB.y - dirA.y * dirB.x) < tolerance;
}

/** Kąt (w stopniach, zaokrąglony do liczby całkowitej) między dwoma wektorami. */
export function angleDegrees(dirA: GeoPoint, dirB: GeoPoint): number {
  const dot = dirA.x * dirB.x + dirA.y * dirB.y;
  const cross = dirA.x * dirB.y - dirA.y * dirB.x;
  return Math.round((Math.atan2(cross, dot) * 180) / Math.PI);
}
