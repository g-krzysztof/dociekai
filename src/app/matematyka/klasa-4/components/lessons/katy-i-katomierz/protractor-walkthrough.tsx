'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { angleMarker, arrowheadPoints, type GeoPoint } from '../../../lib/lines';
import { protractorPoint } from './angle-geometry';

const VIEW_WIDTH = 290;
const VIEW_HEIGHT = 190;
// Wierzchołek musi mieć na lewo od siebie miejsce co najmniej na SCALE_RADIUS
// + etykiety — ramię i podziałka sięgają aż do 180° (prosto w lewo).
const VERTEX: GeoPoint = { x: 150, y: 160 };
const RAY_REACH = 105;
const SCALE_RADIUS = 96;
const ARC_RADIUS = 34;

const BASE_END = protractorPoint(VERTEX, 0, RAY_REACH);

const MAJOR_TICKS = [0, 30, 60, 90, 120, 150, 180];
const MINOR_TICKS = [10, 20, 40, 50, 70, 80, 100, 110, 130, 140, 160, 170];

interface Example {
  id: string;
  /** Litera na końcu ramienia podstawy. */
  labelA: string;
  /** Litera wierzchołka — środkowa w nazwie kąta, patrz przewodnik „Język geometrii". */
  labelVertex: string;
  /** Litera na końcu ramienia ruchomego. */
  labelB: string;
  degrees: number;
  note: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'kat-abc',
    labelA: 'A',
    labelVertex: 'B',
    labelB: 'C',
    degrees: 20,
    note: 'Ramię podstawy stoi dokładnie na kresce 0°. Drugie ramię przecina podziałkę tuż za pierwszą dużą kreską — to 20°.',
  },
  {
    id: 'kat-def',
    labelA: 'D',
    labelVertex: 'E',
    labelB: 'F',
    degrees: 70,
    note: 'Licząc od 0° przy ramieniu podstawy, drugie ramię trafia między kreski 60° i 90°, bliżej 60° — dokładnie na 70°.',
  },
  {
    id: 'kat-ghi',
    labelA: 'G',
    labelVertex: 'H',
    labelB: 'I',
    degrees: 160,
    note: 'Ten kąt jest szeroko rozwarty — drugie ramię przecina podziałkę tuż przed samym końcem, na 160°.',
  },
];

interface ProtractorWalkthroughProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: trzy gotowe odczyty z kątomierza przyłożonego do wierzchołka — uczą liczenia od 0°. */
export function ProtractorWalkthrough({ color, onComplete }: ProtractorWalkthroughProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;
  const movingEnd = protractorPoint(VERTEX, example.degrees, RAY_REACH);
  const arrow = arrowheadPoints(VERTEX, movingEnd, 8);
  const baseArrow = arrowheadPoints(VERTEX, BASE_END, 8);
  const mark = angleMarker(VERTEX, BASE_END, movingEnd, ARC_RADIUS, 20);

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setRevealed(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {EXAMPLES.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{EXAMPLES.length}
        </span>
      </div>

      <p className="mb-4 text-center text-sm font-semibold sm:text-base">
        Ile ma kąt ∠{example.labelA}
        {example.labelVertex}
        {example.labelB}?
      </p>

      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto h-auto w-full max-w-[320px]"
        role="img"
        aria-label={`Kąt ${example.labelA}${example.labelB} z kątomierzem przyłożonym do wierzchołka`}
      >
        {/* Podziałka kątomierza */}
        {MINOR_TICKS.map((deg) => {
          const inner = protractorPoint(VERTEX, deg, SCALE_RADIUS - 5);
          const outer = protractorPoint(VERTEX, deg, SCALE_RADIUS + 5);
          return (
            <line
              key={deg}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={`${color}55`}
              strokeWidth={1}
            />
          );
        })}
        {MAJOR_TICKS.map((deg) => {
          const inner = protractorPoint(VERTEX, deg, SCALE_RADIUS - 8);
          const outer = protractorPoint(VERTEX, deg, SCALE_RADIUS + 8);
          const labelPos = protractorPoint(VERTEX, deg, SCALE_RADIUS + 18);
          return (
            <g key={deg}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={color} strokeWidth={1.75} />
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 9, fontWeight: 700 }}
                fill={`color-mix(in oklch, ${color} 88%, black)`}
              >
                {deg}°
              </text>
            </g>
          );
        })}
        <path
          d={`M ${protractorPoint(VERTEX, 0, SCALE_RADIUS).x} ${protractorPoint(VERTEX, 0, SCALE_RADIUS).y} A ${SCALE_RADIUS} ${SCALE_RADIUS} 0 0 0 ${protractorPoint(VERTEX, 180, SCALE_RADIUS).x} ${protractorPoint(VERTEX, 180, SCALE_RADIUS).y}`}
          fill="none"
          stroke={`${color}55`}
          strokeWidth={1}
        />

        {/* Ramiona kąta */}
        <line x1={VERTEX.x} y1={VERTEX.y} x2={BASE_END.x} y2={BASE_END.y} stroke={color} strokeWidth={2.5} />
        <polygon points={baseArrow} fill={color} />
        <line x1={VERTEX.x} y1={VERTEX.y} x2={movingEnd.x} y2={movingEnd.y} stroke={color} strokeWidth={2.5} />
        <polygon points={arrow} fill={color} />

        <path
          d={`M ${mark.arcStart.x} ${mark.arcStart.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 ${mark.sweepFlag} ${mark.arcEnd.x} ${mark.arcEnd.y}`}
          fill="none"
          stroke={revealed ? '#10b981' : `${color}aa`}
          strokeWidth={2}
        />

        <circle cx={VERTEX.x} cy={VERTEX.y} r={4} fill={color} />
        <text x={VERTEX.x - 16} y={VERTEX.y + 4} style={{ fontSize: 13, fontWeight: 800 }} fill={color}>
          {example.labelVertex}
        </text>
        <text x={BASE_END.x - 14} y={BASE_END.y + 16} style={{ fontSize: 13, fontWeight: 800 }} fill={color}>
          {example.labelA}
        </text>
        <text
          x={movingEnd.x + (movingEnd.x > VERTEX.x + 50 ? 6 : -14)}
          y={movingEnd.y - 4}
          style={{ fontSize: 13, fontWeight: 800 }}
          fill={color}
        >
          {example.labelB}
        </text>
      </svg>

      {!revealed ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Eye className="h-4 w-4" aria-hidden />
            Pokaż odczyt
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-2 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          <p className="font-mono text-base font-bold">
            ∠{example.labelA}
            {example.labelVertex}
            {example.labelB} = {example.degrees}°
          </p>
          <p>{example.note}</p>
        </motion.div>
      )}

      {revealed && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>{isLast ? 'Do ćwiczeń' : 'Następny kąt'}</Button>
        </div>
      )}
    </div>
  );
}
