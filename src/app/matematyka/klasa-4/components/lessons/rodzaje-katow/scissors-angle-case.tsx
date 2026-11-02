'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GeoPoint } from '../../../lib/lines';
import {
  REGION_NUMBER,
  buildCrossingAngles,
  pointOnCircle,
  sectorLabelPoint,
  sectorPath,
} from './line-crossing-geometry';

const VIEW_WIDTH = 260;
const VIEW_HEIGHT = 200;
const VERTEX: GeoPoint = { x: 130, y: 100 };
const LINE_REACH = 82;
const FILL_RADIUS = 30;
const LABEL_RADIUS = 48;

const THETA = 55;

interface Round {
  id: string;
  question: string;
  targetId: 'a' | 'b' | 'c' | 'd';
  options: number[];
  explanation: string;
}

const REGIONS = buildCrossingAngles(THETA);
const BY_ID = Object.fromEntries(REGIONS.map((r) => [r.id, r]));

const ROUNDS: Round[] = [
  {
    id: 'wierzcholkowy',
    question: `Nożyczki są otwarte tak, że kąt 1 ma ${THETA}°. Ile ma kąt 3, po przeciwnej stronie ostrzy?`,
    targetId: 'c',
    options: [35, 55, 90, 125],
    explanation: `Kąt 3 leży naprzeciw kąta 1, przez wierzchołek — to kąty wierzchołkowe, zawsze równe: ${THETA}° = ${BY_ID.c.degrees}°.`,
  },
  {
    id: 'przylegly',
    question: `A ile ma kąt 2, tuż obok kąta 1 (kąta ${THETA}°)?`,
    targetId: 'b',
    options: [55, 90, 125, 145],
    explanation: `Kąt 1 i kąt 2 dzielą jedno ostrze i razem tworzą linię prostą — to kąty przyległe, ich suma to zawsze 180°: ${THETA}° + ${BY_ID.b.degrees}° = 180°.`,
  },
];

interface ScissorsAngleCaseProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: nożyczki jako fizyczny przykład dwóch przecinających
 * się ostrzy. Dziecko oblicza (nie mierzy) brakujące kąty z reguł
 * wierzchołkowości/przyległości poznanych w krokach wyżej.
 */
export function ScissorsAngleCase({ color, onComplete }: ScissorsAngleCaseProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [shakeValue, setShakeValue] = useState<number | null>(null);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const target = BY_ID[round.targetId];
  const solved = picked === target.degrees;

  const lineOneA = pointOnCircle(VERTEX, 0, LINE_REACH);
  const lineOneB = pointOnCircle(VERTEX, 180, LINE_REACH);
  const lineTwoA = pointOnCircle(VERTEX, THETA, LINE_REACH);
  const lineTwoB = pointOnCircle(VERTEX, THETA + 180, LINE_REACH);

  const pick = (value: number) => {
    if (solved) return;
    if (value === target.degrees) {
      setPicked(value);
      return;
    }
    setShakeValue(value);
    setTimeout(() => setShakeValue(null), 400);
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

      <div className="grid items-center gap-5 sm:grid-cols-[180px_1fr]">
        <svg
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="mx-auto h-auto w-full max-w-[200px]"
          role="img"
          aria-label="Otwarte nożyczki narysowane jako dwie przecinające się linie z czterema oznaczonymi kątami"
        >
          {REGIONS.map((region) => (
            <path
              key={region.id}
              d={sectorPath(VERTEX, region.from, region.to, FILL_RADIUS)}
              fill={region.id === round.targetId && solved ? '#10b981' : `${color}18`}
              opacity={region.id === 'a' ? 0.4 : 1}
            />
          ))}

          <line x1={lineOneA.x} y1={lineOneA.y} x2={lineOneB.x} y2={lineOneB.y} stroke={color} strokeWidth={3} />
          <line x1={lineTwoA.x} y1={lineTwoA.y} x2={lineTwoB.x} y2={lineTwoB.y} stroke={color} strokeWidth={3} />
          <circle cx={VERTEX.x} cy={VERTEX.y} r={4} fill={color} />

          {REGIONS.map((region) => {
            const labelPoint = sectorLabelPoint(VERTEX, region, LABEL_RADIUS);
            const showDegrees = region.id === 'a' || (solved && region.id === round.targetId);
            return (
              <text
                key={region.id}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 12, fontWeight: 800 }}
                fill={`color-mix(in oklch, ${color} 88%, black)`}
              >
                {showDegrees ? `${region.degrees}°` : REGION_NUMBER[region.id]}
              </text>
            );
          })}
        </svg>

        <div>
          <p className="mb-4 text-sm leading-relaxed sm:text-base">{round.question}</p>
          <div className="grid grid-cols-4 gap-2">
            {round.options.map((value) => {
              const isCorrectPick = solved && value === target.degrees;
              return (
                <motion.button
                  key={value}
                  type="button"
                  onClick={() => pick(value)}
                  disabled={solved}
                  animate={shakeValue === value ? { x: [0, -6, 6, -6, 6, 0] } : undefined}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    'cursor-pointer border px-2 py-3 text-center font-mono text-base font-bold transition-all disabled:cursor-not-allowed',
                    !solved && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    solved && !isCorrectPick && 'opacity-40'
                  )}
                  style={isCorrectPick ? { borderColor: color, backgroundColor: `${color}14`, color } : undefined}
                >
                  {value}°
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {solved && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          {round.explanation}
        </motion.div>
      )}

      {solved && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>{isLast ? 'Do quizu' : 'Kolejne pytanie'}</Button>
        </div>
      )}
    </div>
  );
}
