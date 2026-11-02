'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GeoPoint } from '../../../lib/lines';
import {
  REGION_NUMBER,
  buildCrossingAngles,
  pointOnCircle,
  sectorLabelPoint,
  sectorPath,
} from './line-crossing-geometry';

const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 220;
const VERTEX: GeoPoint = { x: 150, y: 110 };
const LINE_REACH = 95;
const FILL_RADIUS = 34;
const LABEL_RADIUS = 55;

const VERTICAL_FILL = '#3b82f6';
const ADJACENT_FILL = '#f59e0b';

interface Example {
  id: string;
  theta: number;
}

const EXAMPLES: Example[] = [
  { id: 'przyklad-50', theta: 50 },
  { id: 'przyklad-115', theta: 115 },
];

interface IntersectingLinesShowcaseProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: dwie przecinające się proste — kąty wierzchołkowe (równe) i przyległe (suma 180°). */
export function IntersectingLinesShowcase({ color, onComplete }: IntersectingLinesShowcaseProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;
  const regions = buildCrossingAngles(example.theta);
  const [a, b] = regions;

  const lineOneA = pointOnCircle(VERTEX, 0, LINE_REACH);
  const lineOneB = pointOnCircle(VERTEX, 180, LINE_REACH);
  const lineTwoA = pointOnCircle(VERTEX, example.theta, LINE_REACH);
  const lineTwoB = pointOnCircle(VERTEX, example.theta + 180, LINE_REACH);

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
        Dwie proste przecinają się w jednym punkcie — powstają cztery kąty.
      </p>

      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto h-auto w-full max-w-[320px]"
        role="img"
        aria-label="Dwie przecinające się proste tworzące cztery kąty oznaczone numerami 1–4"
      >
        {regions.map((region) => (
          <path
            key={region.id}
            d={sectorPath(VERTEX, region.from, region.to, FILL_RADIUS)}
            fill={region.id === 'a' || region.id === 'c' ? VERTICAL_FILL : ADJACENT_FILL}
            opacity={0.16}
          />
        ))}

        <line x1={lineOneA.x} y1={lineOneA.y} x2={lineOneB.x} y2={lineOneB.y} stroke={color} strokeWidth={2.5} />
        <line x1={lineTwoA.x} y1={lineTwoA.y} x2={lineTwoB.x} y2={lineTwoB.y} stroke={color} strokeWidth={2.5} />
        <circle cx={VERTEX.x} cy={VERTEX.y} r={4} fill={color} />

        {regions.map((region) => {
          const labelPoint = sectorLabelPoint(VERTEX, region, LABEL_RADIUS);
          return (
            <g key={region.id}>
              <text
                x={labelPoint.x}
                y={revealed ? labelPoint.y - 7 : labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 13, fontWeight: 800 }}
                fill={region.id === 'a' || region.id === 'c' ? VERTICAL_FILL : ADJACENT_FILL}
              >
                {REGION_NUMBER[region.id]}
              </text>
              {revealed && (
                <text
                  x={labelPoint.x}
                  y={labelPoint.y + 11}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: 11, fontWeight: 700 }}
                  fill={`color-mix(in oklch, ${color} 88%, black)`}
                >
                  {region.degrees}°
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {!revealed ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Eye className="h-4 w-4" aria-hidden />
            Pokaż miary
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-3 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          <p>
            <strong style={{ color: VERTICAL_FILL }}>Kąt 1 i kąt 3</strong> leżą naprzeciw siebie, po
            przeciwnych stronach wierzchołka — to <strong>kąty wierzchołkowe</strong>. Zawsze są
            równe: {a.degrees}° = {regions[2].degrees}°.
          </p>
          <p>
            <strong style={{ color: ADJACENT_FILL }}>Kąt 1 i kąt 2</strong> dzielą jedno wspólne
            ramię i razem tworzą linię prostą — to <strong>kąty przyległe</strong>. Ich suma zawsze
            wynosi 180°: {a.degrees}° + {b.degrees}° = 180°.
          </p>
        </motion.div>
      )}

      {revealed && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>{isLast ? 'Do ćwiczeń' : 'Następna para prostych'}</Button>
        </div>
      )}
    </div>
  );
}
