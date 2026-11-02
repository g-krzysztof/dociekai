'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { GeoPoint } from '../../../lib/lines';
import {
  REGION_NUMBER,
  adjacentPartners,
  buildCrossingAngles,
  pointOnCircle,
  sectorLabelPoint,
  sectorPath,
  verticalPartner,
  type CrossingRegion,
} from './line-crossing-geometry';

const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 240;
const VERTEX: GeoPoint = { x: 150, y: 130 };
const LINE_REACH = 100;
const FILL_RADIUS = 78;
const LABEL_RADIUS = 52;

type RegionId = CrossingRegion['id'];
type Mode = 'wierzcholkowy' | 'przylegly';

interface Task {
  theta: number;
  highlight: RegionId;
  mode: Mode;
}

const TASKS: Task[] = [
  { theta: 40, highlight: 'a', mode: 'wierzcholkowy' },
  { theta: 70, highlight: 'b', mode: 'przylegly' },
  { theta: 125, highlight: 'd', mode: 'wierzcholkowy' },
];

const MODE_LABEL: Record<Mode, string> = { wierzcholkowy: 'wierzchołkowy', przylegly: 'przyległy' };

interface IntersectingLinesAuditProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Ćwiczenia: audyt kliknięciem wprost w narysowany kąt (nie w przycisk z
 * opisem) — dziecko wskazuje w diagramie kąt wierzchołkowy lub przyległy do
 * zaznaczonego. Ten sam duch co „audyt błędu” (MistakeHunt), tu
 * zastosowany do regionów kątów zamiast kolumn/wierszy.
 */
export function IntersectingLinesAudit({ color, onComplete }: IntersectingLinesAuditProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<RegionId | null>(null);
  const [shakeId, setShakeId] = useState<RegionId | null>(null);

  const task = TASKS[index];
  const isLast = index === TASKS.length - 1;
  const regions = buildCrossingAngles(task.theta);
  const byId = Object.fromEntries(regions.map((r) => [r.id, r])) as Record<RegionId, CrossingRegion>;
  const correctIds: RegionId[] =
    task.mode === 'wierzcholkowy' ? [verticalPartner(task.highlight)] : adjacentPartners(task.highlight);
  const solved = picked !== null;

  const lineOneA = pointOnCircle(VERTEX, 0, LINE_REACH);
  const lineOneB = pointOnCircle(VERTEX, 180, LINE_REACH);
  const lineTwoA = pointOnCircle(VERTEX, task.theta, LINE_REACH);
  const lineTwoB = pointOnCircle(VERTEX, task.theta + 180, LINE_REACH);

  const handlePick = (id: RegionId) => {
    if (solved || id === task.highlight) return;
    if (correctIds.includes(id)) {
      setPicked(id);
      return;
    }
    setShakeId(id);
    setTimeout(() => setShakeId(null), 400);
  };

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setPicked(null);
      return;
    }
    onComplete?.();
  };

  const pickedRegion = picked ? byId[picked] : null;
  const highlightRegion = byId[task.highlight];

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {TASKS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{TASKS.length}
        </span>
      </div>

      <p className="mb-4 text-center text-sm leading-relaxed sm:text-base">
        Zaznaczony kąt <strong>{REGION_NUMBER[task.highlight]}</strong> ma{' '}
        <strong className="font-mono">{highlightRegion.degrees}°</strong>. Kliknij w diagramie kąt,
        który jest z nim <strong>{MODE_LABEL[task.mode]}</strong>.
      </p>

      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto h-auto w-full max-w-[320px] touch-none select-none"
        role="img"
        aria-label="Dwie przecinające się proste tworzące cztery klikalne kąty"
      >
        {regions.map((region) => {
          const isHighlight = region.id === task.highlight;
          const isPicked = region.id === picked;
          const isCorrectReveal = solved && correctIds.includes(region.id) && !isPicked;
          const fill = isHighlight
            ? color
            : isPicked
              ? '#10b981'
              : isCorrectReveal
                ? '#10b98155'
                : `${color}18`;
          return (
            <motion.path
              key={region.id}
              d={sectorPath(VERTEX, region.from, region.to, FILL_RADIUS)}
              fill={fill}
              opacity={isHighlight ? 0.4 : isPicked ? 0.5 : 1}
              stroke={isHighlight || isPicked ? fill : `${color}55`}
              strokeWidth={1.5}
              style={{ cursor: isHighlight ? 'default' : solved ? 'default' : 'pointer' }}
              animate={shakeId === region.id ? { x: [0, -4, 4, -4, 4, 0] } : undefined}
              transition={{ duration: 0.35 }}
              onClick={() => handlePick(region.id)}
            />
          );
        })}

        <line x1={lineOneA.x} y1={lineOneA.y} x2={lineOneB.x} y2={lineOneB.y} stroke={color} strokeWidth={2.5} />
        <line x1={lineTwoA.x} y1={lineTwoA.y} x2={lineTwoB.x} y2={lineTwoB.y} stroke={color} strokeWidth={2.5} />
        <circle cx={VERTEX.x} cy={VERTEX.y} r={4} fill={color} pointerEvents="none" />

        {regions.map((region) => {
          const labelPoint = sectorLabelPoint(VERTEX, region, LABEL_RADIUS);
          const isHighlight = region.id === task.highlight;
          return (
            <text
              key={region.id}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              pointerEvents="none"
              style={{ fontSize: 13, fontWeight: 800 }}
              fill={isHighlight || region.id === picked ? '#fff' : `color-mix(in oklch, ${color} 88%, black)`}
            >
              {REGION_NUMBER[region.id]}
            </text>
          );
        })}
      </svg>

      {solved && pickedRegion && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          {task.mode === 'wierzcholkowy' ? (
            <p>
              Kąt {REGION_NUMBER[task.highlight]} i kąt {REGION_NUMBER[picked]} leżą naprzeciw
              siebie przez wierzchołek — kąty wierzchołkowe zawsze są równe:{' '}
              <strong className="font-mono">
                {highlightRegion.degrees}° = {pickedRegion.degrees}°
              </strong>
              .
            </p>
          ) : (
            <p>
              Kąt {REGION_NUMBER[task.highlight]} i kąt {REGION_NUMBER[picked]} dzielą jedno ramię i
              razem tworzą linię prostą — kąty przyległe zawsze sumują się do 180°:{' '}
              <strong className="font-mono">
                {highlightRegion.degrees}° + {pickedRegion.degrees}° = 180°
              </strong>
              .
            </p>
          )}
        </motion.div>
      )}

      {solved && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>{isLast ? 'Do zadania problemowego' : 'Następna para'}</Button>
        </div>
      )}
    </div>
  );
}
