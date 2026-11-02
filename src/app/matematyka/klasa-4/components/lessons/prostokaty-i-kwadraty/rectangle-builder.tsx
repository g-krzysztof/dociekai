'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { round, type GeoPoint } from '../../../lib/lines';
import { plural } from '../../../lib/plural';
import { buildRectangleFigure, cellsWord, CELL_PX } from './rectangle-geometry';

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 230;
const ORIGIN: GeoPoint = { x: 78, y: 42 };
const MIN_CELLS = 2;
const MAX_W_CELLS = 8;
const MAX_H_CELLS = 6;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Punkt startowy widocznie inny od celu, żeby dziecko naprawdę przeciągnęło róg. */
function startFor(target: number, min: number, max: number, shift: number): number {
  const shifted = target - min <= max - target ? target + shift : target - shift;
  return clamp(shifted, min, max);
}

export interface RectangleTarget {
  width: number;
  height: number;
  /** Polecenie pokazywane nad siatką, np. „Zbuduj dowolny prostokąt (boki różnej długości)”. */
  prompt: string;
}

interface RectangleBuilderProps {
  color: string;
  targets: RectangleTarget[];
  onComplete?: () => void;
  /**
   * Dopisuje pod planszą działanie na pole (`a · b = P`) liczone na żywo z
   * przeciąganego rogu. Domyślnie wyłączone — lekcja `prostokaty-i-kwadraty`
   * mówi wyłącznie o bokach i kątach, o polu dopiero moduł 7.
   */
  areaReadout?: boolean;
}

/**
 * Dziecko przeciąga wolny róg prostokąta (lewy-górny jest przypięty) po
 * siatce kratek i na żywo widzi kąty proste w każdym rogu oraz kreski
 * równości boków — aż trafi w zadane wymiary. Reużyty w dwóch scenariuszach
 * lekcji (wprowadzenie pojęć: dowolny prostokąt → kwadrat; zadanie
 * problemowe: konkretne wymiary z życia) — ten sam mechanizm, dwie
 * narracje (por. `AngleBuilder`).
 */
export function RectangleBuilder({
  color,
  targets,
  onComplete,
  areaReadout = false,
}: RectangleBuilderProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [index, setIndex] = useState(0);
  const target = targets[0];
  const [width, setWidth] = useState(() => startFor(target.width, MIN_CELLS, MAX_W_CELLS, 3));
  const [height, setHeight] = useState(() => startFor(target.height, MIN_CELLS, MAX_H_CELLS, 2));
  const [dragging, setDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const currentTarget = targets[index];
  const isLast = index === targets.length - 1;
  const matched = width === currentTarget.width && height === currentTarget.height;

  const figure = buildRectangleFigure(ORIGIN, width * CELL_PX, height * CELL_PX);
  const handlePoint: GeoPoint = { x: ORIGIN.x + width * CELL_PX, y: ORIGIN.y + height * CELL_PX };
  const [topLeft, topRight, , bottomLeft] = figure.corners;

  const pointerToCells = (event: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = VIEW_WIDTH / rect.width;
    const scaleY = VIEW_HEIGHT / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const rawW = round((x - ORIGIN.x) / CELL_PX);
    const rawH = round((y - ORIGIN.y) / CELL_PX);
    setWidth(clamp(Math.round(rawW), MIN_CELLS, MAX_W_CELLS));
    setHeight(clamp(Math.round(rawH), MIN_CELLS, MAX_H_CELLS));
  };

  const next = () => {
    if (!isLast) {
      const nextTarget = targets[index + 1];
      setIndex((prev) => prev + 1);
      setWidth(startFor(nextTarget.width, MIN_CELLS, MAX_W_CELLS, 3));
      setHeight(startFor(nextTarget.height, MIN_CELLS, MAX_H_CELLS, 2));
      return;
    }
    onComplete?.();
  };

  const gridDots: GeoPoint[] = [];
  for (let gx = 0; gx <= MAX_W_CELLS; gx++) {
    for (let gy = 0; gy <= MAX_H_CELLS; gy++) {
      gridDots.push({ x: ORIGIN.x + gx * CELL_PX, y: ORIGIN.y + gy * CELL_PX });
    }
  }

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
        <p className="text-sm font-semibold">{currentTarget.prompt}</p>
        <p className="text-sm" aria-live="polite">
          Szerokość:{' '}
          <span className="font-mono text-base font-bold" style={{ color }}>
            {width}
          </span>{' '}
          · Wysokość:{' '}
          <span className="font-mono text-base font-bold" style={{ color }}>
            {height}
          </span>
          {figure.isSquare && <span className="ml-1 font-semibold text-emerald-600">— to kwadrat!</span>}
        </p>
      </div>

      {areaReadout && (
        <p
          className="mb-4 border-l-2 px-3 py-2 font-mono text-lg font-bold tabular-nums"
          style={{ borderColor: color, color, backgroundColor: `${color}0f` }}
          aria-live="polite"
        >
          {figure.isSquare ? 'P = a · a = ' : 'P = a · b = '}
          {width} · {height} = {width * height}
          <span className="ml-2 font-sans text-sm font-normal text-muted-foreground">
            {cellsWord(width * height)}
          </span>
        </p>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="h-auto w-full touch-none select-none"
        role="img"
        aria-label="Prostokąt na siatce kratek, z przeciąganym prawym-dolnym rogiem"
      >
        {gridDots.map((dot, i) => (
          <circle key={i} cx={dot.x} cy={dot.y} r={1.4} fill={`${color}33`} />
        ))}

        <rect
          x={topLeft.x}
          y={topLeft.y}
          width={width * CELL_PX}
          height={height * CELL_PX}
          fill={figure.isSquare ? '#10b98118' : `${color}14`}
          stroke={figure.isSquare ? '#10b981' : color}
          strokeWidth={2.5}
        />

        {figure.cornerMarkers.map((mark, i) => (
          <path
            key={i}
            d={`M ${mark.onLine1.x} ${mark.onLine1.y} L ${mark.outer.x} ${mark.outer.y} L ${mark.onLine2.x} ${mark.onLine2.y}`}
            fill="none"
            stroke={figure.isSquare ? '#10b981' : color}
            strokeWidth={2}
          />
        ))}

        {[...figure.ticks.top, ...figure.ticks.bottom, ...figure.ticks.left, ...figure.ticks.right].map(
          ([a, b], i) => (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={figure.isSquare ? '#10b981' : color}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          )
        )}

        <text
          x={(topLeft.x + topRight.x) / 2}
          y={topLeft.y - 10}
          textAnchor="middle"
          style={{ fontSize: 11, fontWeight: 700 }}
          fill={`color-mix(in oklch, ${color} 88%, black)`}
        >
          {width} {cellsWord(width)}
        </text>
        <text
          x={topLeft.x - 8}
          y={(topLeft.y + bottomLeft.y) / 2}
          textAnchor="end"
          dominantBaseline="middle"
          style={{ fontSize: 11, fontWeight: 700 }}
          fill={`color-mix(in oklch, ${color} 88%, black)`}
        >
          {height} {cellsWord(height)}
        </text>

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
          r={9}
          fill={matched ? '#10b98122' : `${color}22`}
          stroke={matched ? '#10b981' : color}
          strokeWidth={3}
          pointerEvents="none"
        />

        <circle
          cx={handlePoint.x}
          cy={handlePoint.y}
          r={22}
          fill="transparent"
          style={{ cursor: dragging ? 'grabbing' : 'grab' }}
          onPointerDown={(event) => {
            event.preventDefault();
            (event.currentTarget as SVGCircleElement).setPointerCapture(event.pointerId);
            setDragging(true);
            setHasInteracted(true);
          }}
          onPointerMove={(event) => {
            if (dragging) pointerToCells(event);
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
        />
      </svg>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 border-t pt-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">szerokość</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setHasInteracted(true);
              setWidth((prev) => clamp(prev - 1, MIN_CELLS, MAX_W_CELLS));
            }}
          >
            −1
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setHasInteracted(true);
              setWidth((prev) => clamp(prev + 1, MIN_CELLS, MAX_W_CELLS));
            }}
          >
            +1
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">wysokość</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setHasInteracted(true);
              setHeight((prev) => clamp(prev - 1, MIN_CELLS, MAX_H_CELLS));
            }}
          >
            −1
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setHasInteracted(true);
              setHeight((prev) => clamp(prev + 1, MIN_CELLS, MAX_H_CELLS));
            }}
          >
            +1
          </Button>
        </div>
      </div>

      {matched && !dragging && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          <Check className="h-4 w-4 shrink-0" aria-hidden />
          {areaReadout
            ? figure.isSquare
              ? `Dobrze — oba boki mają po ${width} kratki, więc pole to ${width} · ${height} = ${width * height}. Kwadrat liczy się tym samym wzorem, tylko oba czynniki są takie same.`
              : `Dobrze — ${width} ${cellsWord(width)} w rzędzie i ${height} ${plural(height, { one: 'rząd', few: 'rzędy', many: 'rzędów' })}, więc pole to ${width} · ${height} = ${width * height}.`
            : figure.isSquare
              ? 'Dobrze — wszystkie 4 boki są teraz równe. To już nie tylko prostokąt, to kwadrat!'
              : 'Dobrze — boki naprzeciwległe są równe, a w każdym rogu jest kąt prosty.'}
        </motion.div>
      )}

      {matched && !dragging && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>
            {isLast ? 'Idziemy dalej' : 'Następne zadanie'}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
