import { buildPerimeterEdges, formatLength, rectangleCorners } from './perimeter-geometry';
import type { GeoPoint } from '../../../lib/lines';

const VIEW_WIDTH = 160;
const VIEW_HEIGHT = 110;
const MAX_SCALE = 20;

interface RectPerimeterGlyphProps {
  widthValue: number;
  heightValue: number;
  unit: string;
  color: string;
  label?: string;
}

/** Mały rysunek prostokąta (lub kwadratu) z podpisanymi wszystkimi bokami — `visual` zadania w DiagnosticQuiz. Skaluje się samo do dowolnej wielkości boków. */
export function RectPerimeterGlyph({ widthValue, heightValue, unit, color, label }: RectPerimeterGlyphProps) {
  const scale = Math.min((VIEW_WIDTH - 40) / widthValue, (VIEW_HEIGHT - 30) / heightValue, MAX_SCALE);
  const widthPx = widthValue * scale;
  const heightPx = heightValue * scale;
  const origin: GeoPoint = { x: (VIEW_WIDTH - widthPx) / 2, y: (VIEW_HEIGHT - heightPx) / 2 };
  const points = rectangleCorners(origin, widthPx, heightPx);
  const sideLengths = [widthValue, heightValue, widthValue, heightValue];
  const edges = buildPerimeterEdges(points, sideLengths, 16);

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="mx-auto h-auto w-full max-w-[220px]"
      role="img"
      aria-label={label ?? 'Prostokąt z podpisanymi bokami'}
    >
      <polygon
        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill={`${color}22`}
        stroke={color}
        strokeWidth={2.5}
      />
      {edges.map((edge, i) => (
        <text
          key={i}
          x={edge.labelPoint.x}
          y={edge.labelPoint.y}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: 12, fontWeight: 700 }}
          fill={`color-mix(in oklch, ${color} 88%, black)`}
        >
          {formatLength(edge.length, unit)}
        </text>
      ))}
    </svg>
  );
}

interface PolygonPerimeterGlyphProps {
  points: GeoPoint[];
  sideLengths: number[];
  unit: string;
  color: string;
  label?: string;
}

/** Mały rysunek dowolnego wielokąta (nieregularnego) z podpisanymi bokami — punkty podaje wywołujący, już w skali `viewBox`. */
export function PolygonPerimeterGlyph({ points, sideLengths, unit, color, label }: PolygonPerimeterGlyphProps) {
  const edges = buildPerimeterEdges(points, sideLengths, 14);

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="mx-auto h-auto w-full max-w-[220px]"
      role="img"
      aria-label={label ?? 'Wielokąt z podpisanymi bokami'}
    >
      <polygon
        points={points.map((p) => `${p.x},${p.y}`).join(' ')}
        fill={`${color}22`}
        stroke={color}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {edges.map((edge, i) => (
        <text
          key={i}
          x={edge.labelPoint.x}
          y={edge.labelPoint.y}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: 11, fontWeight: 700 }}
          fill={`color-mix(in oklch, ${color} 88%, black)`}
        >
          {formatLength(edge.length, unit)}
        </text>
      ))}
    </svg>
  );
}
