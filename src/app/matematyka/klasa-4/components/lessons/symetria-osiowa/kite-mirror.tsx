'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GeoPoint } from '../../../lib/lines';
import { reflectPoint } from './symmetry-geometry';

const VIEW_WIDTH = 240;
const VIEW_HEIGHT = 220;
const AXIS_X = 120;
const AXIS_TOP: GeoPoint = { x: AXIS_X, y: 25 };
const AXIS_BOTTOM: GeoPoint = { x: AXIS_X, y: 195 };
const TOLERANCE = 8;

const SOURCE_POINTS: GeoPoint[] = [
  { x: 65, y: 60 },
  { x: 45, y: 110 },
  { x: 70, y: 165 },
];

/** Pozycja startowa uchwytu dla rundy — celowo zbyt blisko osi, żeby dziecko naprawdę musiało przeciągnąć. */
function startX(source: GeoPoint): number {
  const trueX = 2 * AXIS_X - source.x;
  return AXIS_X + (trueX - AXIS_X) * 0.35;
}

function polyPoints(points: GeoPoint[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(' ');
}

interface KiteMirrorProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Dokończ latawiec: lewa połówka jest dana, dziecko przeciąga punkt prawej
 * połówki tak, żeby wylądował dokładnie w lustrzanym odbiciu względem osi —
 * przeciąganie ograniczone do poziomu (wysokość punktu nie może się zmienić,
 * bo odbicie względem pionowej osi tego nie zmienia), co samo w sobie uczy
 * najważniejszej właściwości: ta sama odległość od osi, po drugiej stronie.
 * Nowa technika w kursie: `reflectPoint` (rzut na prostą + odbicie), pierwsze
 * przeciąganie ograniczone do jednej współrzędnej zamiast kąta/dwóch wymiarów
 * (`AngleBuilder`/`RectangleBuilder`).
 */
export function KiteMirror({ color, onComplete }: KiteMirrorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [round, setRound] = useState(0);
  const [handleX, setHandleX] = useState(() => startX(SOURCE_POINTS[0]));
  const [confirmed, setConfirmed] = useState<GeoPoint[]>([]);
  const [dragging, setDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const source = SOURCE_POINTS[round] ?? SOURCE_POINTS[SOURCE_POINTS.length - 1];
  const trueMirror = reflectPoint(source, AXIS_TOP, AXIS_BOTTOM);
  const matched = Math.abs(handleX - trueMirror.x) <= TOLERANCE;

  const leftOutline: GeoPoint[] = [AXIS_TOP, ...SOURCE_POINTS, AXIS_BOTTOM];
  const rightOutline: GeoPoint[] = [AXIS_TOP, ...confirmed, AXIS_BOTTOM];

  const pointerToX = (clientX: number): number => {
    const svg = svgRef.current;
    if (!svg) return handleX;
    const rect = svg.getBoundingClientRect();
    const raw = (clientX - rect.left) * (VIEW_WIDTH / rect.width);
    return Math.min(VIEW_WIDTH - 15, Math.max(AXIS_X + 12, raw));
  };

  const handlePointerDown = (event: React.PointerEvent<SVGCircleElement>) => {
    if (allDone) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    setHasInteracted(true);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    setHandleX(pointerToX(event.clientX));
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (matched) {
      const nextConfirmed = [...confirmed, trueMirror];
      setConfirmed(nextConfirmed);
      if (round + 1 < SOURCE_POINTS.length) {
        const nextRound = round + 1;
        setRound(nextRound);
        setHandleX(startX(SOURCE_POINTS[nextRound]));
        setHasInteracted(false);
      } else {
        setAllDone(true);
      }
    }
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {!allDone && (
        <div className="mb-4 flex items-center gap-2">
          {SOURCE_POINTS.map((_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 transition-colors"
              style={{ backgroundColor: i <= round ? color : `${color}26` }}
            />
          ))}
          <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
            {round + 1}/{SOURCE_POINTS.length}
          </span>
        </div>
      )}

      <p className="mb-4 text-center text-sm font-semibold sm:text-base">
        {allDone
          ? 'Latawiec gotowy — obie połówki są lustrzanym odbiciem.'
          : 'Przeciągnij punkt tak, żeby wylądował dokładnie naprzeciwko, po drugiej stronie osi.'}
      </p>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto h-auto w-full max-w-[300px] touch-none select-none"
        role="img"
        aria-label="Latawiec: lewa połowa gotowa, prawa budowana przez przeciąganie punktów do lustrzanych pozycji"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Oś symetrii */}
        <line
          x1={AXIS_TOP.x}
          y1={AXIS_TOP.y}
          x2={AXIS_BOTTOM.x}
          y2={AXIS_BOTTOM.y}
          stroke={`${color}88`}
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />

        {/* Lewa (dana) połowa */}
        <polyline points={polyPoints(leftOutline)} fill={`${color}22`} stroke={color} strokeWidth={2.5} strokeLinejoin="round" />

        {/* Prawa (budowana) połowa */}
        {rightOutline.length > 2 && (
          <polyline
            points={polyPoints(rightOutline)}
            fill={allDone ? `${color}22` : 'none'}
            stroke={color}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        )}

        {/* Poprzednio potwierdzone punkty */}
        {confirmed.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="#10b981" />
        ))}

        {/* Bieżąca runda: prowadnica pozioma + źródłowy punkt + uchwyt */}
        {!allDone && (
          <>
            <line
              x1={source.x}
              y1={source.y}
              x2={handleX}
              y2={source.y}
              stroke={matched ? '#10b981' : `${color}66`}
              strokeWidth={1.5}
              strokeDasharray={matched ? undefined : '4 3'}
            />
            <circle cx={source.x} cy={source.y} r={5} fill={color} />

            {!hasInteracted && (
              <motion.circle
                cx={handleX}
                cy={source.y}
                fill="none"
                stroke={color}
                strokeWidth={2}
                initial={{ r: 10, opacity: 0.7 }}
                animate={{ r: [10, 20, 10], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
              />
            )}

            <circle
              cx={handleX}
              cy={source.y}
              r={11}
              fill={matched ? '#10b98133' : `${color}22`}
              stroke={matched ? '#10b981' : color}
              strokeWidth={3}
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
            />
          </>
        )}
      </svg>

      {allDone && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Każdy punkt prawej połowy leży w tej samej odległości od osi co jego bliźniak po lewej.
          </p>
          <Button size="sm" onClick={() => onComplete?.()} style={{ backgroundColor: color }} className="shrink-0 gap-1.5 text-white hover:opacity-90">
            Dalej
            <Check className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
