import { buildRectangleFigure, cellsWord } from './rectangle-geometry';
import type { GeoPoint } from '../../../lib/lines';

const VIEW_WIDTH = 200;
const VIEW_HEIGHT = 150;
const GLYPH_CELL_PX = 20;

interface RectangleGlyphProps {
  widthCells: number;
  heightCells: number;
  color: string;
  /** Kreski równości boków — wyłącz, gdy pytanie ma się skupić wyłącznie na kątach. */
  showTicks?: boolean;
  /** Nadpisuje domyślną etykietę „N kratek” nad górnym bokiem, np. „8 cm”. */
  topLabel?: string;
  /** Etykieta pod dolnym bokiem (domyślnie brak) — np. „?” w zadaniu o boku naprzeciwległym. */
  bottomLabel?: string;
  label?: string;
}

/** Mały, samodzielny rysunek jednego prostokąta — używany jako `visual` zadania w DiagnosticQuiz. */
export function RectangleGlyph({
  widthCells,
  heightCells,
  color,
  showTicks = true,
  topLabel,
  bottomLabel,
  label,
}: RectangleGlyphProps) {
  const widthPx = widthCells * GLYPH_CELL_PX;
  const heightPx = heightCells * GLYPH_CELL_PX;
  const origin: GeoPoint = { x: (VIEW_WIDTH - widthPx) / 2, y: (VIEW_HEIGHT - heightPx) / 2 };
  const figure = buildRectangleFigure(origin, widthPx, heightPx);
  const [topLeft, topRight, , bottomLeft] = figure.corners;

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="mx-auto h-auto w-full max-w-[200px]"
      role="img"
      aria-label={label ?? 'Prostokąt do analizy'}
    >
      <rect
        x={topLeft.x}
        y={topLeft.y}
        width={widthPx}
        height={heightPx}
        fill={`${color}22`}
        stroke={color}
        strokeWidth={2.5}
      />

      {figure.cornerMarkers.map((mark, i) => (
        <path
          key={i}
          d={`M ${mark.onLine1.x} ${mark.onLine1.y} L ${mark.outer.x} ${mark.outer.y} L ${mark.onLine2.x} ${mark.onLine2.y}`}
          fill="none"
          stroke={color}
          strokeWidth={2}
        />
      ))}

      {showTicks &&
        [...figure.ticks.top, ...figure.ticks.bottom, ...figure.ticks.left, ...figure.ticks.right].map(
          ([a, b], i) => (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          )
        )}

      <text
        x={(topLeft.x + topRight.x) / 2}
        y={topLeft.y - 10}
        textAnchor="middle"
        style={{ fontSize: 12, fontWeight: 700 }}
        fill={`color-mix(in oklch, ${color} 88%, black)`}
      >
        {topLabel ?? `${widthCells} ${cellsWord(widthCells)}`}
      </text>
      {bottomLabel && (
        <text
          x={(topLeft.x + topRight.x) / 2}
          y={bottomLeft.y + 20}
          textAnchor="middle"
          style={{ fontSize: 12, fontWeight: 700 }}
          fill={`color-mix(in oklch, ${color} 88%, black)`}
        >
          {bottomLabel}
        </text>
      )}
    </svg>
  );
}
