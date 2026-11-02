'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { shapeGeometry, type CrystalVisual } from '../lib/shapes';

export interface CollectTarget {
  dx: number;
  dy: number;
}

interface CrystalShapeProps {
  visual: CrystalVisual;
  color: string;
  /** Ustawione po trafieniu — środek właściwego doku względem środka kryształu. Uruchamia animację "wciągnięcia". */
  collectTo?: CollectTarget | null;
}

const VERTEX = { x: 50, y: 82 };
const RAY_LENGTH = 58;
const ARC_RADIUS = 16;
/** Kąt (konwencja matematyczna: 0=prawo, 90=góra) pierwszego promienia przed ewentualnym odbiciem. */
const BASE_RAY_ANGLE = 165;

function rayPoint(angleDeg: number, length: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: VERTEX.x + length * Math.cos(rad), y: VERTEX.y - length * Math.sin(rad) };
}

/** Łamana wzdłuż łuku zamiast komendy SVG `A` — eliminuje dwuznaczność flag large-arc/sweep. */
function arcPolyline(angle1: number, angle2: number, radius: number, steps = 14): string {
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = angle1 + ((angle2 - angle1) * i) / steps;
    const p = rayPoint(t, radius);
    points.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`);
  }
  return points.join(' ');
}

function AngleGlyph({ degrees, mirrored, color }: { degrees: number; mirrored: boolean; color: string }) {
  const angle1 = mirrored ? 180 - BASE_RAY_ANGLE : BASE_RAY_ANGLE;
  const angle2 = mirrored ? 180 - (BASE_RAY_ANGLE - degrees) : BASE_RAY_ANGLE - degrees;
  const p1 = rayPoint(angle1, RAY_LENGTH);
  const p2 = rayPoint(angle2, RAY_LENGTH);

  return (
    <g filter="url(#crystal-glow)">
      <line x1={VERTEX.x} y1={VERTEX.y} x2={p1.x} y2={p1.y} stroke={color} strokeWidth={3.5} strokeLinecap="round" />
      <line x1={VERTEX.x} y1={VERTEX.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth={3.5} strokeLinecap="round" />
      <polyline
        points={arcPolyline(angle1, angle2, ARC_RADIUS)}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.85}
      />
      {degrees === 90 &&
        (() => {
          const s = 7;
          const d1 = rayPoint(angle1, s);
          const d2 = rayPoint(angle2, s);
          const corner = { x: d1.x + d2.x - VERTEX.x, y: d1.y + d2.y - VERTEX.y };
          return (
            <polyline
              points={`${d1.x.toFixed(2)},${d1.y.toFixed(2)} ${corner.x.toFixed(2)},${corner.y.toFixed(2)} ${d2.x.toFixed(2)},${d2.y.toFixed(2)}`}
              fill="none"
              stroke={color}
              strokeWidth={2}
            />
          );
        })()}
    </g>
  );
}

export function CrystalShape({ visual, color, collectTo }: CrystalShapeProps) {
  const reducedMotion = useReducedMotion();

  const idleAnimate = reducedMotion
    ? undefined
    : visual.kind === 'shape'
      ? { y: [0, -6, 0], rotate: [0, 4, 0, -4, 0] }
      : { scale: [1, 1.03, 1] };
  const idleTransition = reducedMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' as const };

  // Po trafieniu kryształ kurczy się i leci do środka właściwego doku, zamiast po
  // prostu zniknąć — `collectTo` to delta (px) między środkiem kryształu a środkiem
  // doku, zmierzona przez Scanner. Reduced motion: bez lotu, tylko krótkie zblaknięcie.
  const collectAnimate = collectTo
    ? reducedMotion
      ? { opacity: 0 }
      : { x: collectTo.dx, y: collectTo.dy, scale: 0.15, opacity: 0 }
    : null;
  const collectTransition = reducedMotion ? { duration: 0.25 } : { duration: 0.5, ease: [0.5, 0, 1, 1] as const };

  return (
    <motion.div
      className="relative mx-auto h-40 w-40 sm:h-48 sm:w-48"
      data-testid="crystal"
      animate={collectAnimate ?? idleAnimate}
      transition={collectAnimate ? collectTransition : idleTransition}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
        <defs>
          <filter id="crystal-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {visual.kind === 'angle' ? (
          <AngleGlyph degrees={visual.degrees} mirrored={visual.mirrored} color={color} />
        ) : (() => {
            const geometry = shapeGeometry(visual.shapeId);
            return geometry.type === 'circle' ? (
              <circle cx={50} cy={50} r={34} fill={`${color}33`} stroke={color} strokeWidth={3} filter="url(#crystal-glow)" />
            ) : (
              <polygon
                points={geometry.points}
                fill={`${color}33`}
                stroke={color}
                strokeWidth={3}
                strokeLinejoin="round"
                filter="url(#crystal-glow)"
              />
            );
          })()}
      </svg>
    </motion.div>
  );
}
