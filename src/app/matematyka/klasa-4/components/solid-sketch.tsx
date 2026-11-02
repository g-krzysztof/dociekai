'use client';

import {
  boxEdgeGroups,
  boxPolyhedron,
  projectPolyhedron,
  round3,
  type BoxSpec,
  type Polyhedron,
} from '../lib/solids';

/** Jedno ustawienie kamery na wszystkie szkice lekcji — mają czytać się jak seria. */
const VIEW = { yaw: 0.62, pitch: 0.36, scale: 1 } as const;
/** Zapas na podpisy wymiarów. Osobny, szeroki margines po bokach: podpis
 *  „12 cm" rozciąga się od swojego punktu i bez tego wychodzi poza `viewBox`
 *  (ta sama pułapka co `PAD_L` w `RectSketch`). */
const PAD_X = 52;
const PAD_Y = 28;

/** Bryła do narysowania: prostopadłościan opisany wymiarami (wtedy można podpisać
 *  wymiary) albo dowolny wielościan z `lib/solids.ts`. Dokładnie jedno. */
type SketchSource =
  | { spec: BoxSpec; polyhedron?: never }
  | { polyhedron: Polyhedron; spec?: never };

type SolidSketchProps = SketchSource & {
  color: string;
  /** Etykiety wymiarów w kolejności długość / szerokość / wysokość; tylko dla `spec`. */
  labels?: [string | null, string | null, string | null];
  ariaLabel: string;
  className?: string;
};

/**
 * Nieruchomy portret bryły, opcjonalnie z podpisami wymiarów — do przykładów
 * i zadań, gdzie obracanie tylko by rozpraszało. Rysuje ta sama funkcja
 * (`projectPolyhedron`) co `SolidSpinner`, więc konwencja „krawędź zasłonięta =
 * linia przerywana" jest identyczna w całym module.
 *
 * Podpis każdego wymiaru siada przy **najbardziej zewnętrznej widocznej
 * krawędzi** swojej grupy, odsunięty na zewnątrz bryły — dzięki temu nie trzeba
 * ręcznie dobierać współrzędnych dla każdych wymiarów z osobna.
 */
export function SolidSketch({
  spec,
  polyhedron,
  color,
  labels,
  ariaLabel,
  className,
}: SolidSketchProps) {
  const scale = 22;
  const solid = projectPolyhedron(polyhedron ?? boxPolyhedron(spec as BoxSpec), { ...VIEW, scale });
  const groups = spec ? boxEdgeGroups(spec) : [];
  const axisOrder = ['x', 'z', 'y'] as const;

  const marks = labels && spec
    ? axisOrder.flatMap((axis, i) => {
        const text = labels[i];
        const group = groups.find((item) => item.axis === axis);
        if (!text || !group) return [];

        const candidates = solid.edges.filter(
          (edge) => !edge.hidden && group.edgeIds.includes(edge.id)
        );
        if (candidates.length === 0) return [];

        // Najbardziej „na zewnątrz" leżąca krawędź grupy — jej podpis nie wejdzie
        // w rysunek ani nie usiądzie na innej krawędzi.
        const best = candidates.reduce((far, edge) => {
          const mid = (e: typeof edge) => Math.hypot((e.a.x + e.b.x) / 2, (e.a.y + e.b.y) / 2);
          return mid(edge) > mid(far) ? edge : far;
        }, candidates[0]);

        const mx = (best.a.x + best.b.x) / 2;
        const my = (best.a.y + best.b.y) / 2;
        const len = Math.hypot(mx, my) || 1;
        return [
          {
            key: axis,
            text,
            x: round3(mx + (mx / len) * 20),
            y: round3(my + (my / len) * 20),
          },
        ];
      })
    : [];

  const reachX = round3(solid.reach + PAD_X);
  const reachY = round3(solid.reach + PAD_Y);

  return (
    <svg
      viewBox={`${-reachX} ${-reachY} ${2 * reachX} ${2 * reachY}`}
      className={className ?? 'mx-auto h-auto w-full max-w-[240px]'}
      role="img"
      aria-label={ariaLabel}
    >
      {solid.faces
        .filter((face) => face.visible)
        .map((face) => (
          <polygon
            key={face.id}
            points={face.points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill={`${color}26`}
          />
        ))}
      {solid.edges.map((edge) => (
        <line
          key={edge.id}
          x1={edge.a.x}
          y1={edge.a.y}
          x2={edge.b.x}
          y2={edge.b.y}
          stroke={color}
          strokeOpacity={edge.hidden ? 0.5 : 1}
          strokeWidth={edge.hidden ? 1.8 : 2.6}
          strokeDasharray={edge.hidden ? '6 5' : undefined}
          strokeLinecap="round"
        />
      ))}
      {marks.map((mark) => (
        <text
          key={mark.key}
          x={mark.x}
          y={mark.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-mono"
          fontSize={15}
          fontWeight={700}
          fill={color}
        >
          {mark.text}
        </text>
      ))}
    </svg>
  );
}
