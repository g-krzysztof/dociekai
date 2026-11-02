import { arrowheadPoints, extendFar, type GeoPoint } from './geo-shape';

export type GeoKind = 'punkt' | 'odcinek' | 'polprosta' | 'prosta';

export const VIEW_WIDTH = 320;
export const VIEW_HEIGHT = 200;

interface GeoFigureProps {
  color: string;
  kind: GeoKind;
  pointA: GeoPoint;
  pointB: GeoPoint;
  labelA: string;
  labelB: string;
  /** Grubość linii — domyślnie stała, `geo-builder` pogrubia lekko pod palcem/myszką. */
  strokeWidth?: number;
}

/**
 * Czysty widok: te same dwa punkty renderowane jako jeden z czterech
 * obiektów geometrii. Używany statycznie w przykładach i wizualizacjach
 * ćwiczeń (jako `<GeoFigure>`, z własnym `<svg>`), i jako warstwa rysunku
 * pod przeciąganymi uchwytami w `GeoBuilder` (jako `<GeoFigureMarks>`, bez
 * `<svg>` — `GeoBuilder` rysuje własny korzeń, żeby uniknąć zagnieżdżania
 * `<svg>` w `<svg>`) — jedno miejsce definiuje, jak wygląda
 * punkt/prosta/półprosta/odcinek, żeby te konteksty nie mogły się rozjechać.
 */
export function GeoFigureMarks({ color, kind, pointA, pointB, labelA, labelB, strokeWidth = 3 }: GeoFigureProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const dotR = 6;

  let lines: React.ReactNode = null;
  let showB = true;

  if (kind === 'punkt') {
    showB = false;
  } else if (kind === 'odcinek') {
    lines = (
      <line x1={pointA.x} y1={pointA.y} x2={pointB.x} y2={pointB.y} stroke={color} strokeWidth={strokeWidth} />
    );
  } else if (kind === 'polprosta') {
    const tip = extendFar(pointA, pointB);
    lines = (
      <>
        <line x1={pointA.x} y1={pointA.y} x2={tip.x} y2={tip.y} stroke={color} strokeWidth={strokeWidth} />
        <polygon points={arrowheadPoints(pointA, tip)} fill={color} />
      </>
    );
  } else {
    const tipForward = extendFar(pointA, pointB);
    const tipBackward = extendFar(pointB, pointA);
    lines = (
      <>
        <line
          x1={tipBackward.x}
          y1={tipBackward.y}
          x2={tipForward.x}
          y2={tipForward.y}
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <polygon points={arrowheadPoints(pointB, tipForward)} fill={color} />
        <polygon points={arrowheadPoints(pointA, tipBackward)} fill={color} />
      </>
    );
  }

  return (
    <>
      {lines}
      <circle cx={pointA.x} cy={pointA.y} r={dotR} fill={color} />
      <text
        x={pointA.x - 20}
        y={pointA.y + 6}
        style={{ fontSize: 20, fontWeight: 800 }}
        fill={textColor}
      >
        {labelA}
      </text>
      {showB && (
        <>
          <circle cx={pointB.x} cy={pointB.y} r={dotR} fill={color} />
          <text
            x={pointB.x + 12}
            y={pointB.y - 8}
            style={{ fontSize: 20, fontWeight: 800 }}
            fill={textColor}
          >
            {labelB}
          </text>
        </>
      )}
    </>
  );
}

/** `GeoFigureMarks` opakowane we własny `<svg viewBox>` — do użycia poza `GeoBuilder`. */
export function GeoFigure(props: GeoFigureProps) {
  const showB = props.kind !== 'punkt';
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="h-auto w-full max-w-md"
      role="img"
      aria-label={`${kindLabel(props.kind)} ${props.labelA}${showB ? props.labelB : ''}`}
    >
      <GeoFigureMarks {...props} />
    </svg>
  );
}

function kindLabel(kind: GeoKind): string {
  switch (kind) {
    case 'punkt':
      return 'Punkt';
    case 'odcinek':
      return 'Odcinek';
    case 'polprosta':
      return 'Półprosta';
    case 'prosta':
      return 'Prosta';
  }
}
