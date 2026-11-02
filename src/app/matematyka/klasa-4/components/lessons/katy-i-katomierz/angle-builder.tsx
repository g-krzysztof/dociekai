'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { angleMarker, arrowheadPoints, round, type GeoPoint } from '../../../lib/lines';
import { useTweenedNumber } from '../../../lib/use-tweened-number';
import { angleFromPointer, protractorPoint } from './angle-geometry';

const VIEW_WIDTH = 290;
const VIEW_HEIGHT = 190;
// Wierzchołek musi mieć na lewo od siebie miejsce co najmniej na RAY_REACH —
// ramię potrafi wychylić się aż do 180° (prosto w lewo), więc zbyt bliska
// lewa krawędź obcina grot strzałki poza kątami > ~115°.
const VERTEX: GeoPoint = { x: 150, y: 160 };
const RAY_REACH = 105;
const HANDLE_RADIUS = 94;
const HIT_RADIUS = 26;
const ARC_RADIUS = 34;
const TOLERANCE = 4;
// Promień etykiet „ramię” — wyraźnie bliżej wierzchołka niż uchwyt (94, plus
// pulsujący pierścień zaproszenia sięga jeszcze 24 dalej), żeby napis nigdy
// nie kolidował z tym, co dziecko łapie palcem/kursorem.
const ARM_LABEL_RADIUS = 52;

const BASE_END = protractorPoint(VERTEX, 0, RAY_REACH);

export interface AngleTarget {
  degrees: number;
  /** Polecenie pokazywane nad tarczą, np. „Ustaw kąt bliski 90°”. */
  prompt: string;
}

interface AngleBuilderProps {
  color: string;
  targets: AngleTarget[];
  /** Etykiety słownictwa (ramię/wierzchołek) — tylko w kroku wprowadzającym pojęcia. */
  showLabels?: boolean;
  onComplete?: () => void;
}

/**
 * Wspólny mechanizm: dziecko obraca ramię wokół wierzchołka i na żywo widzi
 * miarę kąta w stopniach, aż trafi w zadaną wartość (z tolerancją). Reużyty w
 * dwóch scenariuszach lekcji — wprowadzenie pojęć (kilka rund, etykiety
 * słownictwa) i zadanie problemowe (jedna runda, bez etykiet) — ten sam
 * mechanizm, dwie narracje.
 */
export function AngleBuilder({ color, targets, showLabels = false, onComplete }: AngleBuilderProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [index, setIndex] = useState(0);
  // Start zawsze po przeciwnej stronie celu, żeby dziecko naprawdę przeciągnęło ramię.
  // `setAngle` skacze (przeciąganie, reset rundy), `tweenAngle` płynnie przechodzi
  // (przyciski −5°/+5°), żeby klik nie był cięciem — też w nagraniach rolek.
  const {
    value: angle,
    set: setAngle,
    tweenTo: tweenAngle,
    stop: stopAngleTween,
  } = useTweenedNumber(() => (targets[0].degrees > 90 ? 25 : 155));
  const [dragging, setDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const target = targets[index];
  const isLast = index === targets.length - 1;
  const matched = Math.abs(angle - target.degrees) <= TOLERANCE;

  const handlePoint = protractorPoint(VERTEX, angle, HANDLE_RADIUS);
  const movingEnd = protractorPoint(VERTEX, angle, RAY_REACH);
  const arrow = arrowheadPoints(VERTEX, movingEnd, 8);
  const baseArrow = arrowheadPoints(VERTEX, BASE_END, 8);
  const mark = angleMarker(VERTEX, BASE_END, movingEnd, ARC_RADIUS, 20);

  const armLabelBase = protractorPoint(VERTEX, 0, ARM_LABEL_RADIUS);
  const armLabelMoving = protractorPoint(VERTEX, angle, ARM_LABEL_RADIUS);

  const pointerToAngle = (event: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = VIEW_WIDTH / rect.width;
    const scaleY = VIEW_HEIGHT / rect.height;
    const point: GeoPoint = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
    setAngle(round(angleFromPointer(VERTEX, point)));
  };

  const next = () => {
    if (!isLast) {
      const nextTarget = targets[index + 1];
      setIndex((prev) => prev + 1);
      setAngle(nextTarget.degrees > 90 ? 25 : 155);
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
              style={{ backgroundColor: i <= index ? color : `${color}26` }}
            />
          ))}
          <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
            {index + 1}/{targets.length}
          </span>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">{target.prompt}</p>
        <p className="text-sm" aria-live="polite">
          Miara kąta:{' '}
          <span className="font-mono text-base font-bold" style={{ color }}>
            {Math.round(angle)}°
          </span>
        </p>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="h-auto w-full touch-none select-none"
        role="img"
        aria-label="Kąt z wierzchołkiem O, ramieniem podstawy i ramieniem do przeciągania"
      >
        {/* Ramię podstawy — nieruchome */}
        <line x1={VERTEX.x} y1={VERTEX.y} x2={BASE_END.x} y2={BASE_END.y} stroke={color} strokeWidth={2.5} />
        <polygon points={baseArrow} fill={color} />

        {/* Łuk kąta */}
        <path
          d={`M ${mark.arcStart.x} ${mark.arcStart.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 ${mark.sweepFlag} ${mark.arcEnd.x} ${mark.arcEnd.y}`}
          fill="none"
          stroke={matched ? '#10b981' : `${color}aa`}
          strokeWidth={2}
        />

        {/* Ramię ruchome */}
        <line x1={VERTEX.x} y1={VERTEX.y} x2={movingEnd.x} y2={movingEnd.y} stroke={color} strokeWidth={2.5} />
        <polygon points={arrow} fill={color} />

        {/* Wierzchołek O */}
        <circle cx={VERTEX.x} cy={VERTEX.y} r={4} fill={color} />

        {showLabels && (
          <>
            <text
              x={VERTEX.x - 4}
              y={VERTEX.y + 18}
              style={{ fontSize: 11, fontWeight: 700 }}
              fill={`color-mix(in oklch, ${color} 88%, black)`}
            >
              wierzchołek
            </text>
            <text
              x={armLabelBase.x}
              y={armLabelBase.y - 8}
              textAnchor="middle"
              style={{ fontSize: 11, fontWeight: 700 }}
              fill={`color-mix(in oklch, ${color} 88%, black)`}
            >
              ramię
            </text>
            <text
              x={armLabelMoving.x}
              y={armLabelMoving.y - 8}
              textAnchor="middle"
              style={{ fontSize: 11, fontWeight: 700 }}
              fill={`color-mix(in oklch, ${color} 88%, black)`}
            >
              ramię
            </text>
          </>
        )}

        {!hasInteracted && (
          <motion.circle
            cx={handlePoint.x}
            cy={handlePoint.y}
            fill="none"
            stroke={color}
            strokeWidth={2}
            initial={{ r: 13, opacity: 0.7 }}
            animate={{ r: [13, 24, 13], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        <circle
          cx={handlePoint.x}
          cy={handlePoint.y}
          r={12}
          fill={matched ? '#10b98122' : `${color}22`}
          stroke={matched ? '#10b981' : color}
          strokeWidth={3}
          pointerEvents="none"
        />

        <circle
          cx={handlePoint.x}
          cy={handlePoint.y}
          r={HIT_RADIUS}
          fill="transparent"
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
          onPointerDown={(event) => {
            event.preventDefault();
            (event.currentTarget as SVGCircleElement).setPointerCapture(event.pointerId);
            stopAngleTween();
            setDragging(true);
            setHasInteracted(true);
          }}
          onPointerMove={(event) => {
            if (dragging) pointerToAngle(event);
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        />
      </svg>

      <div className="mt-3 flex items-center justify-center gap-4 border-t pt-3">
        <Button variant="outline" size="sm" onClick={() => tweenAngle((prev) => Math.max(0, prev - 5))}>
          −5°
        </Button>
        <span className="text-xs text-muted-foreground">obrót ręczny</span>
        <Button variant="outline" size="sm" onClick={() => tweenAngle((prev) => Math.min(180, prev + 5))}>
          +5°
        </Button>
      </div>

      {matched && !dragging && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          <Check className="h-4 w-4 shrink-0" aria-hidden />
          Dobrze — to około {target.degrees}°.
        </motion.div>
      )}

      {matched && !dragging && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>
            {isLast ? 'Idziemy dalej' : 'Następny kąt'}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
