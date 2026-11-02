import { angleMarker, extendFar, rightAngleMarker, round, type GeoPoint } from '../../../lib/lines';

export type LineRelation = 'prostopadle' | 'rownolegle' | 'skosne';

export const PAIR_VIEW_WIDTH = 320;
export const PAIR_VIEW_HEIGHT = 200;

const CENTER: GeoPoint = { x: 160, y: 100 };
const ARM = 50;

/**
 * Czysty widok pary prostych w jednej z trzech relacji — używany jako
 * wizualizacja w zadaniach ćwiczeń i w quizie. Jedno miejsce definiuje,
 * jak wygląda para prostopadła/równoległa/ukośna, żeby widżety nie mogły
 * się rozjechać. Rysunek opiera się na prymitywach z `lib/lines.ts`
 * (`rightAngleMarker`, `angleMarker`), więc kąt prosty i kąt ostry są
 * zawsze liczone z rzeczywistych kierunków, nigdy wpisane na oko.
 */
export function LinePairFigure({
  color,
  relation,
  labelA = '',
  labelB = '',
}: {
  color: string;
  relation: LineRelation;
  labelA?: string;
  labelB?: string;
}) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const lineWidth = 3;
  const dotR = 5;

  if (relation === 'rownolegle') {
    const topY = 70;
    const bottomY = 130;
    return (
      <svg
        viewBox={`0 0 ${PAIR_VIEW_WIDTH} ${PAIR_VIEW_HEIGHT}`}
        className="h-auto w-full max-w-md"
        role="img"
        aria-label="Dwie proste równoległe"
      >
        <line x1={30} y1={topY} x2={PAIR_VIEW_WIDTH - 30} y2={topY} stroke={color} strokeWidth={lineWidth} />
        <line x1={30} y1={bottomY} x2={PAIR_VIEW_WIDTH - 30} y2={bottomY} stroke={color} strokeWidth={lineWidth} />
        {/* Symbol ∥ między prostymi: dwie ukośne kreski, ta sama konwencja co w przewodniku */}
        <line x1={PAIR_VIEW_WIDTH / 2 - 8} y1={topY + 10} x2={PAIR_VIEW_WIDTH / 2 - 14} y2={bottomY - 10} stroke={textColor} strokeWidth={2} />
        <line x1={PAIR_VIEW_WIDTH / 2 + 8} y1={topY + 10} x2={PAIR_VIEW_WIDTH / 2 + 2} y2={bottomY - 10} stroke={textColor} strokeWidth={2} />
        {labelA && (
          <text x={38} y={topY - 12} style={{ fontSize: 18, fontWeight: 800 }} fill={textColor}>
            {labelA}
          </text>
        )}
        {labelB && (
          <text x={38} y={bottomY + 28} style={{ fontSize: 18, fontWeight: 800 }} fill={textColor}>
            {labelB}
          </text>
        )}
      </svg>
    );
  }

  // Prostopadłe: pozioma + pionowa przez środek, z kwadracikiem kąta prostego.
  if (relation === 'prostopadle') {
    const top: GeoPoint = { x: CENTER.x, y: CENTER.y - ARM };
    const bottom: GeoPoint = { x: CENTER.x, y: CENTER.y + ARM };
    const left: GeoPoint = { x: CENTER.x - ARM, y: CENTER.y };
    const right: GeoPoint = { x: CENTER.x + ARM, y: CENTER.y };
    const mark = rightAngleMarker(CENTER, top, right, 14);
    return (
      <svg
        viewBox={`0 0 ${PAIR_VIEW_WIDTH} ${PAIR_VIEW_HEIGHT}`}
        className="h-auto w-full max-w-md"
        role="img"
        aria-label="Dwie proste prostopadłe"
      >
        <line x1={left.x} y1={left.y} x2={right.x} y2={right.y} stroke={color} strokeWidth={lineWidth} />
        <line x1={top.x} y1={top.y} x2={bottom.x} y2={bottom.y} stroke={color} strokeWidth={lineWidth} />
        <path
          d={`M ${mark.onLine1.x} ${mark.onLine1.y} L ${mark.outer.x} ${mark.outer.y} L ${mark.onLine2.x} ${mark.onLine2.y}`}
          fill="none"
          stroke={textColor}
          strokeWidth={1.5}
        />
        {labelA && (
          <text x={CENTER.x + 14} y={CENTER.y + 8} style={{ fontSize: 18, fontWeight: 800 }} fill={textColor}>
            {labelA}
          </text>
        )}
        {labelB && (
          <text x={CENTER.x - 46} y={CENTER.y - 16} style={{ fontSize: 18, fontWeight: 800 }} fill={textColor}>
            {labelB}
          </text>
        )}
      </svg>
    );
  }

  // Ukośne (przecinające się pod kątem nieprostym): pozioma + prosta pod ~55°.
  const slopeDir: GeoPoint = { x: round(Math.cos((55 * Math.PI) / 180)), y: round(-Math.sin((55 * Math.PI) / 180)) };
  const slopeAnchor: GeoPoint = { x: round(CENTER.x + slopeDir.x * 60), y: round(CENTER.y + slopeDir.y * 60) };
  const slopeTip = extendFar(CENTER, slopeAnchor);
  const slopeBack = extendFar(slopeAnchor, CENTER);
  const horizLeft: GeoPoint = { x: CENTER.x - ARM - 60, y: CENTER.y };
  const horizRight: GeoPoint = { x: CENTER.x + ARM + 60, y: CENTER.y };
  const mark = angleMarker(CENTER, horizRight, slopeAnchor, 22, 13);

  return (
    <svg
      viewBox={`0 0 ${PAIR_VIEW_WIDTH} ${PAIR_VIEW_HEIGHT}`}
      className="h-auto w-full max-w-md"
      role="img"
      aria-label="Dwie proste przecinające się pod kątem ostrym"
    >
      <line x1={horizLeft.x} y1={horizLeft.y} x2={horizRight.x} y2={horizRight.y} stroke={color} strokeWidth={lineWidth} />
      <line x1={slopeBack.x} y1={slopeBack.y} x2={slopeTip.x} y2={slopeTip.y} stroke={color} strokeWidth={lineWidth} />
      <path
        d={`M ${mark.arcStart.x} ${mark.arcStart.y} A 22 22 0 0 ${mark.sweepFlag} ${mark.arcEnd.x} ${mark.arcEnd.y}`}
        fill="none"
        stroke={textColor}
        strokeWidth={2}
      />
      <circle cx={mark.dot.x} cy={mark.dot.y} r={2.5} fill={textColor} />
      <circle cx={CENTER.x} cy={CENTER.y} r={dotR} fill={color} />
      {labelA && (
        <text x={CENTER.x + 16} y={CENTER.y + 22} style={{ fontSize: 18, fontWeight: 800 }} fill={textColor}>
          {labelA}
        </text>
      )}
    </svg>
  );
}