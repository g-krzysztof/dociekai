import { directionVector, round, type GeoPoint } from '../lib/lines';
import type { CircleDiagram } from '../lib/circle';

/** Punkt w ułamku `t` odcinka `a→b` (0 = `a`, 1 = `b`). */
function pointAlong(a: GeoPoint, b: GeoPoint, t: number): GeoPoint {
  return { x: round(a.x + (b.x - a.x) * t), y: round(a.y + (b.y - a.y) * t) };
}

/** Przesuwa `point` prostopadle do kierunku `a→b` — etykieta zjeżdża z linii zamiast na niej siedzieć. */
function perpOffset(a: GeoPoint, b: GeoPoint, point: GeoPoint, distance: number): GeoPoint {
  const dir = directionVector(a, b);
  return { x: round(point.x - dir.y * distance), y: round(point.y + dir.x * distance) };
}

export type CirclePartId = 'srodek' | 'promien' | 'srednica' | 'cieciwa';

export interface CirclePartState {
  /** Czy ten element w ogóle jest narysowany. */
  shown: boolean;
  /** Pełny kolor + pogrubienie + etykieta z nazwą; inaczej wyszarzone tło rysunku. */
  active: boolean;
  label?: string;
}

interface CircleFigureProps {
  color: string;
  diagram: CircleDiagram;
  /** Zamalowane wnętrze (koło) zamiast samej linii (okrąg). */
  fill?: boolean;
  parts: Partial<Record<CirclePartId, CirclePartState>>;
  size?: number;
  ariaLabel: string;
}

const MUTED = '#9ca3af';

/**
 * Jeden rysunek koła karmiony różnymi `parts` — środek jest zawsze widoczny
 * jako punkt odniesienia (nawet nienazwany), promień/średnica/cięciwa
 * dochodzą i „aktywują się" (pełny kolor + etykieta) niezależnie od siebie.
 * Ten sam mechanizm co `RectangleGlyph`/`PerimeterWalk`: jedna funkcja
 * geometrii, wiele stanów wizualnych nad tymi samymi punktami. Pierwotnie
 * `guides/slownik-kola/circle-figure.tsx`, wypromowane tutaj po drugim
 * konsumencie (`lekcje/kola-i-okregi`).
 */
export function CircleFigure({ color, diagram, fill = false, parts, size = 260, ariaLabel }: CircleFigureProps) {
  const { center, radius, radiusEnd, diameterA, diameterB, chordA, chordB } = diagram;
  // Ramka rysunku liczona z promienia, NIE z surowej współrzędnej środka —
  // środek bywa daleko od (0,0) tylko dlatego, że w tym samym diagramie
  // mieszczą się jeszcze inne punkty (promien/średnica pod różnymi kątami),
  // więc liczenie ramki od (0,0) do 2×center.x zostawiało ogromny martwy
  // margines wokół małych okręgów — im mniejszy promień, tym bardziej okrąg
  // (i podpisy przy nim) kurczyły się do nieczytelnego punkciku.
  const margin = Math.max(28, radius * 0.35);
  const viewMinX = center.x - radius - margin;
  const viewMinY = center.y - radius - margin;
  const viewSize = (radius + margin) * 2;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const srodek = parts.srodek;
  const promien = parts.promien;
  const srednica = parts.srednica;
  const cieciwa = parts.cieciwa;

  // Etykiety siedzą przy 70% długości odcinka (bliżej okręgu, dalej od środka)
  // i są przesunięte prostopadle do linii — przy dowolnym kącie promienia/
  // średnicy nie kolidują ze sobą ani z etykietą środka tuż nad kropką.
  const promienLabelPoint = perpOffset(center, radiusEnd, pointAlong(center, radiusEnd, 0.7), 15);
  const srednicaLabelPoint = perpOffset(center, diameterA, pointAlong(center, diameterA, 0.7), 15);
  const cieciwaLabelPoint = perpOffset(chordA, chordB, pointAlong(chordA, chordB, 0.5), 16);

  return (
    <svg
      viewBox={`${viewMinX} ${viewMinY} ${viewSize} ${viewSize}`}
      width={size}
      height={size}
      className="mx-auto h-auto w-full"
      style={{ maxWidth: size }}
      role="img"
      aria-label={ariaLabel}
    >
      <circle
        cx={center.x}
        cy={center.y}
        r={radius}
        fill={fill ? `${color}22` : 'none'}
        stroke={color}
        strokeWidth={2.5}
      />

      {cieciwa?.shown && (
        <>
          <line
            x1={chordA.x}
            y1={chordA.y}
            x2={chordB.x}
            y2={chordB.y}
            stroke={cieciwa.active ? color : MUTED}
            strokeWidth={cieciwa.active ? 3.5 : 2}
            strokeLinecap="round"
          />
          {cieciwa.active && cieciwa.label && (
            <text
              x={cieciwaLabelPoint.x}
              y={cieciwaLabelPoint.y}
              textAnchor="middle"
              style={{ fontSize: 17, fontWeight: 700 }}
              fill={textColor}
            >
              {cieciwa.label}
            </text>
          )}
        </>
      )}

      {srednica?.shown && (
        <>
          <line
            x1={diameterA.x}
            y1={diameterA.y}
            x2={diameterB.x}
            y2={diameterB.y}
            stroke={srednica.active ? color : MUTED}
            strokeWidth={srednica.active ? 3.5 : 2}
            strokeLinecap="round"
          />
          {/* Kreska w środku dzieli średnicę na dwa promienie — widać to bez liczenia. */}
          {srednica.active && (
            <line
              x1={center.x - (diameterB.y - diameterA.y) * 0.04}
              y1={center.y + (diameterB.x - diameterA.x) * 0.04}
              x2={center.x + (diameterB.y - diameterA.y) * 0.04}
              y2={center.y - (diameterB.x - diameterA.x) * 0.04}
              stroke={color}
              strokeWidth={2}
            />
          )}
          {srednica.active && srednica.label && (
            <text
              x={srednicaLabelPoint.x}
              y={srednicaLabelPoint.y}
              textAnchor="middle"
              style={{ fontSize: 17, fontWeight: 700 }}
              fill={textColor}
            >
              {srednica.label}
            </text>
          )}
        </>
      )}

      {promien?.shown && (
        <>
          <line
            x1={center.x}
            y1={center.y}
            x2={radiusEnd.x}
            y2={radiusEnd.y}
            stroke={promien.active ? color : MUTED}
            strokeWidth={promien.active ? 3.5 : 2}
            strokeLinecap="round"
          />
          {promien.active && promien.label && (
            <text
              x={promienLabelPoint.x}
              y={promienLabelPoint.y}
              textAnchor="middle"
              style={{ fontSize: 17, fontWeight: 700 }}
              fill={textColor}
            >
              {promien.label}
            </text>
          )}
        </>
      )}

      {srodek?.shown && (
        <>
          <circle cx={center.x} cy={center.y} r={6} fill={srodek.active ? color : MUTED} />
          {srodek.active && srodek.label && (
            <text
              x={center.x}
              y={center.y - 12}
              textAnchor="middle"
              style={{ fontSize: 17, fontWeight: 700 }}
              fill={textColor}
            >
              {srodek.label}
            </text>
          )}
        </>
      )}
    </svg>
  );
}
