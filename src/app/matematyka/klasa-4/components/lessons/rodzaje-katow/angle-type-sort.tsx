'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { angleMarker, arrowheadPoints, rightAngleMarker, type GeoPoint } from '../../../lib/lines';
import { classifyAngle, pointOnCircle, type AngleType } from './line-crossing-geometry';

const VIEW_WIDTH = 290;
const VIEW_HEIGHT = 190;
const VERTEX: GeoPoint = { x: 150, y: 160 };
const RAY_REACH = 105;
const ARC_RADIUS = 34;
const RIGHT_ANGLE_SIZE = 16;

const ROUNDS: number[] = [35, 90, 150, 60, 115];

const OPTIONS: { key: AngleType; label: string }[] = [
  { key: 'ostry', label: 'Ostry' },
  { key: 'prosty', label: 'Prosty' },
  { key: 'rozwarty', label: 'Rozwarty' },
];

function explanationFor(type: AngleType, degrees: number): string {
  if (type === 'prosty') return `Dokładnie 90° — to kąt prosty. Jego ramiona są prostopadłe.`;
  if (type === 'ostry') return `${degrees}° to mniej niż 90° — taki kąt nazywamy ostrym.`;
  return `${degrees}° to więcej niż 90° (i mniej niż 180°) — taki kąt nazywamy rozwartym.`;
}

interface AngleTypeSortProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: klasyfikacja pięciu narysowanych kątów jako ostry/prosty/rozwarty. */
export function AngleTypeSort({ color, onComplete }: AngleTypeSortProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<AngleType | null>(null);
  const [shakeKey, setShakeKey] = useState<AngleType | null>(null);

  const degrees = ROUNDS[index];
  const correct = classifyAngle(degrees);
  const isLast = index === ROUNDS.length - 1;
  const solved = picked === correct;

  const movingEnd = pointOnCircle(VERTEX, degrees, RAY_REACH);
  const baseEnd = pointOnCircle(VERTEX, 0, RAY_REACH);
  const arrow = arrowheadPoints(VERTEX, movingEnd, 8);
  const baseArrow = arrowheadPoints(VERTEX, baseEnd, 8);
  const mark = angleMarker(VERTEX, baseEnd, movingEnd, ARC_RADIUS, 20);
  const rightMark =
    correct === 'prosty' ? rightAngleMarker(VERTEX, baseEnd, movingEnd, RIGHT_ANGLE_SIZE) : null;

  const pick = (key: AngleType) => {
    if (solved) return;
    if (key === correct) {
      setPicked(key);
      return;
    }
    setShakeKey(key);
    setTimeout(() => setShakeKey(null), 400);
  };

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setPicked(null);
      return;
    }
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{ROUNDS.length}
        </span>
      </div>

      <p className="mb-4 text-center text-sm font-semibold sm:text-base">Jaki to rodzaj kąta?</p>

      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto h-auto w-full max-w-[280px]"
        role="img"
        aria-label={`Kąt o wierzchołku i dwóch ramionach do sklasyfikowania`}
      >
        <line x1={VERTEX.x} y1={VERTEX.y} x2={baseEnd.x} y2={baseEnd.y} stroke={color} strokeWidth={2.5} />
        <polygon points={baseArrow} fill={color} />
        <line x1={VERTEX.x} y1={VERTEX.y} x2={movingEnd.x} y2={movingEnd.y} stroke={color} strokeWidth={2.5} />
        <polygon points={arrow} fill={color} />

        {rightMark && solved ? (
          <path
            d={`M ${rightMark.onLine1.x} ${rightMark.onLine1.y} L ${rightMark.outer.x} ${rightMark.outer.y} L ${rightMark.onLine2.x} ${rightMark.onLine2.y}`}
            fill="none"
            stroke="#10b981"
            strokeWidth={2}
          />
        ) : (
          <path
            d={`M ${mark.arcStart.x} ${mark.arcStart.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 ${mark.sweepFlag} ${mark.arcEnd.x} ${mark.arcEnd.y}`}
            fill="none"
            stroke={solved ? '#10b981' : `${color}aa`}
            strokeWidth={2}
          />
        )}

        <circle cx={VERTEX.x} cy={VERTEX.y} r={4} fill={color} />
      </svg>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {OPTIONS.map((option) => {
          const isCorrectPick = solved && option.key === correct;
          return (
            <motion.button
              key={option.key}
              type="button"
              onClick={() => pick(option.key)}
              disabled={solved}
              animate={shakeKey === option.key ? { x: [0, -6, 6, -6, 6, 0] } : undefined}
              transition={{ duration: 0.4 }}
              className={cn(
                'cursor-pointer border px-3 py-3 text-center text-sm font-semibold transition-all disabled:cursor-not-allowed',
                !solved && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                solved && !isCorrectPick && 'opacity-55'
              )}
              style={isCorrectPick ? { borderColor: color, backgroundColor: `${color}14`, color } : undefined}
            >
              {option.label}
            </motion.button>
          );
        })}
      </div>

      {solved && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          {explanationFor(correct, degrees)}
        </motion.div>
      )}

      {solved && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>{isLast ? 'Do definicji' : 'Następny kąt'}</Button>
        </div>
      )}
    </div>
  );
}
