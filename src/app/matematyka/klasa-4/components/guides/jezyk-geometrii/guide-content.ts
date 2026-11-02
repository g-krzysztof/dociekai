import type { GuideActMeta } from '../guide-act';

/**
 * Wszystkie akty na `flow` — ten sam wybór co w każdym przewodniku zbudowanym
 * po 2026-08-12 (`stage` jest wyjątkiem, nie domyślnym
 * trybem).
 */
export const ACTS: GuideActMeta[] = [
  { id: 'otwarcie', label: 'Jak nazwać to, co widzisz', mode: 'flow' },
  { id: 'punkty-proste', label: 'Punkty i proste', mode: 'flow' },
  { id: 'polprosta-odcinek', label: 'Półprosta i odcinek', mode: 'flow' },
  { id: 'kat-i-symbole', label: 'Kąt i symbole', mode: 'flow' },
  { id: 'wokol-ciebie', label: 'Wokół Ciebie', mode: 'flow' },
];

export interface GeoPoint {
  x: number;
  y: number;
}

/**
 * Współrzędne w układzie `viewBox="0 0 400 220"`, współdzielone przez akt
 * „Punkty i proste" (prosta przechodząca przez oba punkty) i widget aktu
 * „Półprosta i odcinek" (te same dwa punkty, klikane w wybranej kolejności)
 * — ten sam rysunek wraca w obu miejscach zamiast dwóch niezależnych.
 */
export const POINT_A: GeoPoint = { x: 80, y: 160 };
export const POINT_B: GeoPoint = { x: 300, y: 70 };

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Punkt leżący na prostej `from → through`, przesunięty o `extra` px poza
 * `through`. Zaokrąglone do 3 miejsc po przecinku (każda
 * współrzędna SVG liczona z dzielenia/pierwiastka musi być zaokrąglona, żeby
 * SSR i klient nie wylosowały różnych float64 na tym samym atrybucie).
 */
export function extendPoint(from: GeoPoint, through: GeoPoint, extra: number): GeoPoint {
  const dx = through.x - from.x;
  const dy = through.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  return {
    x: round(through.x + (dx / len) * extra),
    y: round(through.y + (dy / len) * extra),
  };
}

/** Gotowy atrybut `points` dla `<polygon>` — trójkątny grot strzałki w kierunku `from → tip`. */
export function arrowheadPoints(from: GeoPoint, tip: GeoPoint, size = 9): string {
  const dx = tip.x - from.x;
  const dy = tip.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
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

export const REAL_LIFE_EXAMPLES: string[] = [
  'Notacja szachowa — każde pole szachownicy ma własną nazwę z litery i cyfry (np. e4), dokładnie jak nazwany punkt w geometrii.',
  'Pineska na mapie albo w nawigacji GPS — nazwane miejsce, do którego można wrócić i o którym można komuś powiedzieć bez pokazywania palcem.',
  'Plan mieszkania czy rama okna — prostopadłe i równoległe krawędzie, oznaczane tymi samymi symbolami ⊥ i ∥.',
  'Kątomierz na lekcji techniki albo w aplikacji do majsterkowania — kąty zawsze podane w stopniach (°).',
];

export const GEOMETRY_LANGUAGE_RULES: string[] = [
  'Punkt oznaczamy jedną wielką literą, np. A.',
  'Prostą oznaczamy dwiema literami leżących na niej punktów (prosta AB) albo jedną małą literą (prosta k) — biegnie w nieskończoność w obie strony.',
  'Odcinek ma dwa równorzędne końce — odcinek AB to to samo co odcinek BA.',
  'Półprosta ma jeden początek — kolejność liter ma znaczenie, bo pierwsza litera to zawsze punkt startowy (półprosta AB to nie to samo co półprosta BA).',
  'Kąt oznaczamy trzema literami z wierzchołkiem pośrodku (∠ABC) i mierzymy w stopniach (°); symbole ⊥ i ∥ mówią o prostopadłości i równoległości bez rysowania kątomierza.',
];
