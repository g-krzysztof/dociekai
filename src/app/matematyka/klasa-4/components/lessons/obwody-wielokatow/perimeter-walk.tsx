'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, Footprints, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildPerimeterEdges, formatLength, totalPerimeter } from './perimeter-geometry';
import type { GeoPoint } from '../../../lib/lines';

export interface PerimeterTarget {
  id: string;
  /** Pytanie/polecenie nad figurą, np. „Obejdź dookoła plac zabaw”. */
  prompt: string;
  /** Krótki podpis pod pytaniem — co figura przedstawia. */
  caption?: string;
  /** Wierzchołki zgodnie z ruchem wskazówek zegara (patrz perimeter-geometry.ts). */
  points: GeoPoint[];
  /** Długość każdego boku, w tej samej kolejności co `points` (bok i = points[i] → points[i+1]). */
  sideLengths: number[];
  unit: string;
}

interface PerimeterWalkProps {
  color: string;
  targets: PerimeterTarget[];
  onComplete?: () => void;
}

const VIEW_WIDTH = 260;
const VIEW_HEIGHT = 200;
const WALK_SECONDS = 0.65;

/**
 * Wędrowiec obchodzi dookoła dowolny wielokąt bok po boku — po każdym boku
 * dochodzi do sumy jego długość, aż zamknie pętlę w punkcie startu. Fizyczne
 * znaczenie słowa „obwód” (obejść dookoła) staje się animacją, nie tylko
 * definicją do zapamiętania. Reużywalne dla dowolnej figury (nieregularny
 * wielokąt, prostokąt, kwadrat) przez `targets` — ten sam mechanizm co
 * `RectangleBuilder`/`AngleBuilder` w sąsiednich lekcjach.
 */
export function PerimeterWalk({ color, targets, onComplete }: PerimeterWalkProps) {
  const [targetIndex, setTargetIndex] = useState(0);
  const [walked, setWalked] = useState(0);
  const [busy, setBusy] = useState(false);

  const target = targets[targetIndex];
  const sides = target.points.length;
  const edges = buildPerimeterEdges(target.points, target.sideLengths);
  const marker = target.points[walked % sides];
  const finished = walked === sides;
  const isLastTarget = targetIndex === targets.length - 1;
  const total = totalPerimeter(target.sideLengths);

  const walkNext = () => {
    if (busy || finished) return;
    setBusy(true);
    setWalked((prev) => prev + 1);
    setTimeout(() => setBusy(false), WALK_SECONDS * 1000);
  };

  const restart = () => {
    setWalked(0);
    setBusy(false);
  };

  const advance = () => {
    if (!isLastTarget) {
      setTargetIndex((prev) => prev + 1);
      setWalked(0);
      setBusy(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {targets.length > 1 && (
        <div className="mb-4 flex items-center gap-2">
          {targets.map((_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 transition-colors"
              style={{ backgroundColor: i <= targetIndex ? color : `${color}26` }}
            />
          ))}
          <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
            {targetIndex + 1}/{targets.length}
          </span>
        </div>
      )}

      <p className="mb-1 text-center text-sm font-semibold sm:text-base">{target.prompt}</p>
      {target.caption && (
        <p className="mb-4 text-center text-xs text-muted-foreground">{target.caption}</p>
      )}

      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto h-auto w-full max-w-[300px]"
        role="img"
        aria-label={`Figura do obejścia dookoła: ${target.caption ?? target.prompt}`}
      >
        {edges.map((edge, i) => {
          const isWalked = i < walked;
          return (
            <g key={edge.a.x + '-' + edge.a.y + '-' + i}>
              <line
                x1={edge.a.x}
                y1={edge.a.y}
                x2={edge.b.x}
                y2={edge.b.y}
                stroke={isWalked ? color : `${color}45`}
                strokeWidth={isWalked ? 4 : 2.5}
                strokeDasharray={isWalked ? undefined : '5 5'}
                strokeLinecap="round"
              />
              <text
                x={edge.labelPoint.x}
                y={edge.labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 12, fontWeight: 700 }}
                fill={isWalked ? `color-mix(in oklch, ${color} 88%, black)` : '#9ca3af'}
              >
                {formatLength(edge.length, target.unit)}
              </text>
            </g>
          );
        })}

        {target.points.map((point, i) => (
          <circle key={i} cx={point.x} cy={point.y} r={3} fill={color} />
        ))}

        {/* Meta startu/mety */}
        <circle
          cx={target.points[0].x}
          cy={target.points[0].y}
          r={7}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="2 2"
          opacity={0.6}
        />

        {/* Wędrowiec */}
        <motion.circle
          r={7}
          fill={finished ? '#10b981' : color}
          stroke="white"
          strokeWidth={2}
          animate={{ cx: marker.x, cy: marker.y }}
          transition={{ duration: WALK_SECONDS, ease: 'easeInOut' }}
        />
      </svg>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 text-sm sm:text-base">
        {edges.map((edge, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-muted-foreground">+</span>}
            {i < walked ? (
              <motion.span
                initial={{ opacity: 0, y: -6, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: WALK_SECONDS * 0.7, type: 'spring', stiffness: 300, damping: 20 }}
                className="font-mono font-bold tabular-nums"
                style={{ color }}
              >
                {formatLength(edge.length, target.unit)}
              </motion.span>
            ) : (
              <span className="font-mono text-muted-foreground/40 tabular-nums">?</span>
            )}
          </span>
        ))}

        {finished && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="ml-1 flex items-center gap-1.5 font-mono font-extrabold tabular-nums"
          >
            <span className="text-muted-foreground">=</span>
            <span style={{ color }}>{formatLength(total, target.unit)}</span>
          </motion.span>
        )}
      </div>

      {!finished ? (
        <div className="mt-5 flex justify-center">
          <Button onClick={walkNext} disabled={busy} className="gap-2">
            <Footprints className="h-4 w-4" aria-hidden />
            {walked === 0 ? 'Ruszaj pierwszym bokiem' : 'Idź kolejnym bokiem'}
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex flex-col items-center gap-3"
        >
          <p className="flex items-center gap-2 bg-emerald-50 px-4 py-2 text-center text-sm font-semibold text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
            <Flag className="h-4 w-4 shrink-0" aria-hidden />
            Obszedłeś/aś całą figurę — obwód to {formatLength(total, target.unit)}.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={restart} className="gap-2">
              <RotateCcw className="h-4 w-4" aria-hidden />
              Jeszcze raz
            </Button>
            <Button onClick={advance}>{isLastTarget ? 'Dalej' : 'Kolejna figura'}</Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
