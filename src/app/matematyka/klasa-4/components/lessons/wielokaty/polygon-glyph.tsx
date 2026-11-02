import { pointsToString } from './polygon-geometry';
import type { GeoPoint } from '../../../lib/lines';

interface PolygonGlyphProps {
  points: GeoPoint[];
  color: string;
  label?: string;
}

/** Mały, samodzielny rysunek jednego wielokąta — używany jako `visual` zadania w DiagnosticQuiz. */
export function PolygonGlyph({ points, color, label }: PolygonGlyphProps) {
  return (
    <svg
      viewBox="0 0 160 140"
      className="mx-auto h-auto w-full max-w-[160px]"
      role="img"
      aria-label={label ?? 'Figura do rozpoznania'}
    >
      <polygon points={pointsToString(points)} fill={`${color}22`} stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
    </svg>
  );
}
