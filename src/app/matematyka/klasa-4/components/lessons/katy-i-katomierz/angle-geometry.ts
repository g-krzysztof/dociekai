/**
 * Geometria kątomierza dla tej lekcji: wspólna konwencja „protraktora" —
 * wierzchołek u dołu, ramię podstawy w prawo (0°), pomiar rośnie w lewo do
 * 180° (jak na prawdziwym półkolistym kątomierzu). Jedna funkcja
 * (`protractorPoint`) karmi zarówno widżet z przeciąganiem (AngleBuilder),
 * jak i statyczne przykłady/audyt podziałki (jedna czysta
 * funkcja karmi wizual + przykłady + klucz odpowiedzi).
 *
 * Współrzędne zaokrąglone do 3 miejsc po przecinku (`round` z `lib/lines`)
 * — SSR i klient nie gwarantują bit-identycznych float64 przy tej samej
 * arytmetyce trygonometrycznej.
 */

import { round, type GeoPoint } from '../../../lib/lines';

/** Punkt na łuku kątomierza: `degrees` 0 = ramię podstawy (w prawo), 180 = w lewo. */
export function protractorPoint(vertex: GeoPoint, degrees: number, radius: number): GeoPoint {
  const rad = (degrees * Math.PI) / 180;
  return {
    x: round(vertex.x + Math.cos(rad) * radius),
    y: round(vertex.y - Math.sin(rad) * radius),
  };
}

/**
 * Kąt (0–180°) wyznaczony przez pozycję kursora/palca względem wierzchołka,
 * przycięty do półkola. Gdy palec/kursor zjedzie POD linię ramienia podstawy
 * (ujemne `dy`), `atan2` przechodzi na drugą stronę zera (wartości bliskie
 * −180°) — samo `Math.max(0, …)` zgarnęłoby to błędnie do 0° niezależnie od
 * tego, po której stronie wierzchołka jest kursor. Dlatego dolną półpłaszczyznę
 * przypinamy jawnie do najbliższej krawędzi (0° po prawej, 180° po lewej),
 * zanim w ogóle policzymy `atan2`.
 */
export function angleFromPointer(vertex: GeoPoint, pointer: GeoPoint): number {
  const dx = pointer.x - vertex.x;
  const dy = vertex.y - pointer.y;
  if (dy < 0) return dx >= 0 ? 0 : 180;
  const raw = (Math.atan2(dy, dx) * 180) / Math.PI;
  return Math.min(180, Math.max(0, raw));
}

/**
 * Para odczytów jednej kreski podziałki kątomierza: `inner` liczy od 0° przy
 * ramieniu podstawy (tak jak realnie mierzymy), `outer` to podziałka licząca
 * w przeciwną stronę (180° przy ramieniu podstawy) — dokładnie tak, jak na
 * prawdziwym kątomierzu, gdzie przy każdej kresce widnieją dwie liczby.
 */
export interface ScaleReading {
  inner: number;
  outer: number;
}

export function scaleReadingAt(degrees: number): ScaleReading {
  return { inner: degrees, outer: 180 - degrees };
}
