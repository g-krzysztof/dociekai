'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { polygonPoints, POLYGON_NAMES } from './polygon-geometry';

const VIEW_WIDTH = 280;
const VIEW_HEIGHT = 220;
const CENTER = { x: 140, y: 110 };
const RADIUS = 82;
const DOT_R = 12;

interface Round {
  sides: number;
  rotation: number;
}

const ROUNDS: Round[] = [
  { sides: 3, rotation: -90 },
  { sides: 4, rotation: -45 },
  { sides: 5, rotation: -90 },
  { sides: 6, rotation: -60 },
];

interface DotToDotPolygonProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: dziecko łączy ponumerowane kropki 1→2→3→… w kolejności.
 * Po dotknięciu ostatniej kropki figura zamyka się automatycznie (ostatni
 * bok dorysowuje się sam) — to demonstruje regułę "wielokąt musi być
 * zamknięty" wizualnie, zamiast tylko ją opisywać.
 */
export function DotToDotPolygon({ color, onComplete }: DotToDotPolygonProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [tapped, setTapped] = useState<number[]>([]);
  const [shakeLabel, setShakeLabel] = useState<number | null>(null);

  const round = ROUNDS[roundIndex];
  const isLastRound = roundIndex === ROUNDS.length - 1;
  const vertices = polygonPoints(CENTER, RADIUS, round.sides, round.rotation);
  const name = POLYGON_NAMES[round.sides];

  const nextExpected = tapped.length + 1;
  const closed = tapped.length === round.sides;

  const tapDot = (label: number) => {
    if (closed) return;
    if (label === nextExpected) {
      setTapped((prev) => [...prev, label]);
      return;
    }
    setShakeLabel(label);
    setTimeout(() => setShakeLabel(null), 400);
  };

  const nextRound = () => {
    if (!isLastRound) {
      setRoundIndex((prev) => prev + 1);
      setTapped([]);
      return;
    }
    onComplete?.();
  };

  const openSegments: [number, number][] = [];
  for (let i = 1; i < tapped.length; i++) {
    openSegments.push([tapped[i - 1] - 1, tapped[i] - 1]);
  }

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {roundIndex + 1}/{ROUNDS.length}
        </span>
      </div>

      <p className="mb-4 text-center text-sm font-semibold sm:text-base">
        {closed ? `Gotowe — to ${name}!` : `Połącz kropki po kolei: znajdź ${nextExpected}`}
      </p>

      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto h-auto w-full max-w-[300px]"
        role="img"
        aria-label={`Ponumerowane kropki do połączenia w ${name}`}
      >
        {closed && (
          <motion.polygon
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            points={vertices.map((p) => `${p.x},${p.y}`).join(' ')}
            fill={color}
            fillOpacity={0.14}
          />
        )}

        {openSegments.map(([a, b], i) => (
          <motion.line
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            x1={vertices[a].x}
            y1={vertices[a].y}
            x2={vertices[b].x}
            y2={vertices[b].y}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}

        {closed && (
          <motion.line
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            x1={vertices[round.sides - 1].x}
            y1={vertices[round.sides - 1].y}
            x2={vertices[0].x}
            y2={vertices[0].y}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
          />
        )}

        {vertices.map((p, i) => {
          const label = i + 1;
          const isTapped = tapped.includes(label);
          const isNext = label === nextExpected && !closed;
          return (
            <g key={i}>
              {isNext && (
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={DOT_R + 5}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  animate={{ opacity: [0.7, 0.15, 0.7], scale: [1, 1.25, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
              )}
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={DOT_R}
                fill={isTapped ? color : `${color}22`}
                stroke={color}
                strokeWidth={2.5}
                style={{ cursor: closed ? 'default' : 'pointer' }}
                onClick={() => tapDot(label)}
                animate={shakeLabel === label ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
              />
              <text
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontSize: 12, fontWeight: 800, pointerEvents: 'none' }}
                fill={isTapped ? 'white' : color}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      {closed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('mt-4 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100')}
        >
          To jest <strong>{name}</strong> — ma {round.sides} boków i {round.sides} wierzchołków. Ostatni
          bok domknął się sam, bo wielokąt zawsze musi być figurą zamkniętą.
        </motion.div>
      )}

      {closed && (
        <div className="mt-4 flex justify-end">
          <Button onClick={nextRound}>{isLastRound ? 'Do przykładów' : 'Kolejna figura'}</Button>
        </div>
      )}
    </div>
  );
}
