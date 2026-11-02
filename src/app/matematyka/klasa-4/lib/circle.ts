/**
 * Wspólna geometria koła: jedna funkcja buduje wszystkie punkty (środek,
 * koniec promienia, dwa końce średnicy, dwa końce cięciwy) ze środka i
 * promienia w pikselach — ten sam rysunek wraca w każdym akcie (jedna czysta
 * funkcja karmi wizual, wzorzec POINT_A/POINT_B z `jezyk-geometrii`). Pierwotnie w `guides/slownik-kola/circle-geometry.ts`,
 * po drugim konsumencie (`lekcje/kola-i-okregi`) wypromowane tutaj — przewodnik
 * importuje stąd, patrz `guides/slownik-kola/guide-content.ts`.
 *
 * Współrzędne z funkcji trygonometrycznych zaokrąglone do 3 miejsc po
 * przecinku — SSR i klient nie gwarantują bit-identycznych float64.
 */

import { round, type GeoPoint } from './lines';

export interface CircleDiagram {
  center: GeoPoint;
  radius: number;
  /** Koniec odcinka promienia (środek → ten punkt) — kąt osobny od średnicy, żeby nigdy się z nią nie pokrywał. */
  radiusEnd: GeoPoint;
  /** Dwa końce średnicy, naprzeciwko siebie przez środek. */
  diameterA: GeoPoint;
  diameterB: GeoPoint;
  /** Dwa końce cięciwy, która celowo NIE przechodzi przez środek. */
  chordA: GeoPoint;
  chordB: GeoPoint;
}

/** Punkt na okręgu pod danym kątem (0° = w prawo, rosnący kąt idzie zgodnie z ruchem wskazówek zegara, bo `y` rośnie w dół). */
export function pointOnCircle(center: GeoPoint, radius: number, angleDeg: number): GeoPoint {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: round(center.x + Math.cos(rad) * radius), y: round(center.y + Math.sin(rad) * radius) };
}

/**
 * Jeden układ na cały przewodnik — pięć punktów na okręgu pod pięcioma różnymi
 * kątami (0°, 100°, 280°, 160°, 230°), żeby promień, średnica i cięciwa nigdy
 * się na sobie nie nakładały, nawet gdy wszystkie trzy są narysowane naraz
 * (patrz `Otwarcie`/`Outro`) — promień na tym samym kącie co jeden koniec
 * średnicy byłby wizualnie niewidoczny (ta sama linia).
 */
export function buildCircleDiagram(center: GeoPoint, radius: number): CircleDiagram {
  return {
    center,
    radius,
    radiusEnd: pointOnCircle(center, radius, 0),
    diameterA: pointOnCircle(center, radius, 100),
    diameterB: pointOnCircle(center, radius, 280),
    chordA: pointOnCircle(center, radius, 160),
    chordB: pointOnCircle(center, radius, 230),
  };
}

/** `count` promieni rozstawionych równo dookoła — pokazuje, że promień ma tę samą długość w każdym kierunku. */
export function radiusFan(center: GeoPoint, radius: number, count: number): GeoPoint[] {
  const points: GeoPoint[] = [];
  for (let i = 0; i < count; i++) {
    points.push(pointOnCircle(center, radius, (i * 360) / count));
  }
  return points;
}
