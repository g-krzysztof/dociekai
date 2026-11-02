'use client';

import {
  boxPolyhedron,
  prismPolyhedron,
  projectPolyhedron,
  pyramidPolyhedron,
  rotatePolyhedron,
  type Polyhedron,
  type SolidKind,
} from '../lib/solids';

/** Jedno ustawienie kamery dla całej rodziny — bryły mają wyglądać jak zestaw, nie jak sześć osobnych rysunków. */
const VIEW = { yaw: 0.6, pitch: 0.34, scale: 1 } as const;
const BOX = 120;
const C = BOX / 2;

/** Bryły ścienne opisane raz, w tych samych proporcjach co rysunki „okrągłe" niżej. */
const POLYHEDRA: Partial<Record<SolidKind, Polyhedron>> = {
  prostopadloscian: boxPolyhedron({ width: 58, height: 40, depth: 34 }),
  // Położony na boku jak namiot — stojący graniastosłup trójkątny czyta się
  // z tej kamery jak zagięta kartka, a nie jak bryła.
  graniastoslup: rotatePolyhedron(prismPolyhedron(3, 30, 62), { x: Math.PI / 2 }),
  ostroslup: pyramidPolyhedron(4, 36, 62),
};

interface SolidGlyphProps {
  kind: SolidKind;
  color: string;
  /** Podmiana domyślnego modelu bryły ścianowej — np. sześcian zamiast
   *  ogólnego prostopadłościanu, gdy podpis mówi o kostce do gry. */
  polyhedron?: Polyhedron;
  /** Rysunek jest dekoracją obok nazwy — opis idzie tekstem w karcie, nie w SVG. */
  className?: string;
}

/**
 * Mały portret bryły — do karty w przewodniku `jezyk-bryl` i do opcji wyboru
 * w lekcji `rozpoznawanie-bryl` (wypromowany do `components/` po drugim
 * konsumencie). Bryły ścienne rysuje ta
 * sama funkcja co `SolidSpinner` (`projectPolyhedron`), więc konwencja „linia
 * przerywana = krawędź zasłonięta" jest wszędzie identyczna i nie może się
 * rozjechać. Walec, stożek i kula nie są wielościanami — ich zaokrąglone
 * powierzchnie rysują łuki elipsy: przednia połowa ciągła, tylna przerywana.
 */
export function SolidGlyph({ kind, color, polyhedron, className }: SolidGlyphProps) {
  const model = polyhedron ?? POLYHEDRA[kind];

  return (
    <svg
      viewBox={`0 0 ${BOX} ${BOX}`}
      className={className ?? 'h-auto w-full max-w-[112px]'}
      aria-hidden
    >
      <g transform={`translate(${C} ${C})`}>
        {model ? <PolyhedronGlyph solid={model} color={color} /> : null}
      </g>
      {kind === 'walec' && <Cylinder color={color} />}
      {kind === 'stozek' && <Cone color={color} />}
      {kind === 'kula' && <Sphere color={color} />}
    </svg>
  );
}

function PolyhedronGlyph({ solid, color }: { solid: Polyhedron; color: string }) {
  const projected = projectPolyhedron(solid, VIEW);

  return (
    <>
      {projected.faces
        .filter((face) => face.visible)
        .map((face) => (
          <polygon
            key={face.id}
            points={face.points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill={`${color}26`}
          />
        ))}
      {projected.edges.map((edge) => (
        <line
          key={edge.id}
          x1={edge.a.x}
          y1={edge.a.y}
          x2={edge.b.x}
          y2={edge.b.y}
          stroke={color}
          strokeOpacity={edge.hidden ? 0.5 : 1}
          strokeWidth={edge.hidden ? 1.6 : 2.2}
          strokeDasharray={edge.hidden ? '5 4' : undefined}
          strokeLinecap="round"
        />
      ))}
    </>
  );
}

const RX = 30;
const RY = 11;

/** Łuk elipsy od lewego do prawego krańca: `front` = dolna połowa (bliżej patrzącego). */
function arc(cy: number, front: boolean): string {
  return `M ${C - RX} ${cy} A ${RX} ${RY} 0 0 ${front ? 0 : 1} ${C + RX} ${cy}`;
}

function Cylinder({ color }: { color: string }) {
  const top = 30;
  const bottom = 92;

  return (
    <g stroke={color} fill="none" strokeLinecap="round">
      <rect x={C - RX} y={top} width={2 * RX} height={bottom - top} fill={`${color}26`} stroke="none" />
      <ellipse cx={C} cy={top} rx={RX} ry={RY} fill={`${color}26`} strokeWidth={2.2} />
      <line x1={C - RX} y1={top} x2={C - RX} y2={bottom} strokeWidth={2.2} />
      <line x1={C + RX} y1={top} x2={C + RX} y2={bottom} strokeWidth={2.2} />
      <path d={arc(bottom, true)} strokeWidth={2.2} />
      <path d={arc(bottom, false)} strokeWidth={1.6} strokeOpacity={0.5} strokeDasharray="5 4" />
    </g>
  );
}

function Cone({ color }: { color: string }) {
  const apex = 24;
  const base = 92;

  return (
    <g stroke={color} fill="none" strokeLinecap="round">
      <path
        d={`M ${C - RX} ${base} L ${C} ${apex} L ${C + RX} ${base} Z`}
        fill={`${color}26`}
        stroke="none"
      />
      <line x1={C} y1={apex} x2={C - RX} y2={base} strokeWidth={2.2} />
      <line x1={C} y1={apex} x2={C + RX} y2={base} strokeWidth={2.2} />
      <path d={arc(base, true)} strokeWidth={2.2} />
      <path d={arc(base, false)} strokeWidth={1.6} strokeOpacity={0.5} strokeDasharray="5 4" />
    </g>
  );
}

function Sphere({ color }: { color: string }) {
  const r = 34;
  const equator = `M ${C - r} ${C} A ${r} 12 0 0 `;

  return (
    <g stroke={color} fill="none" strokeLinecap="round">
      <circle cx={C} cy={C} r={r} fill={`${color}26`} strokeWidth={2.2} />
      <path d={`${equator}0 ${C + r} ${C}`} strokeWidth={2.2} />
      <path d={`${equator}1 ${C + r} ${C}`} strokeWidth={1.6} strokeOpacity={0.5} strokeDasharray="5 4" />
    </g>
  );
}
