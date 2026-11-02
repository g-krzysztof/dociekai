'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Play } from 'lucide-react';
import { pick, type GameProps } from '../types';
import { r2 } from '../../year';

/**
 * Dział 6 — **SKRĘĆ I IDŹ!** Kot idzie tam, gdzie patrzy nos (lekcja o ruchu
 * i stylu obrotu). Dziecko ustawia kierunek, wskazując flagę palcem — tak jak
 * tarcza kierunku z `DirectionDial` — i dopiero potem naciska „Idź”. Kot
 * przechodzi ustaloną drogę wzdłuż tego kierunku; jeśli trasa mija flagę
 * w zasięgu, jest wygrana.
 */

const CAT = { x: 58, y: 100 };
const FLAGS = [
  { x: 255, y: 45 },
  { x: 150, y: 24 },
  { x: 122, y: 178 },
  { x: 250, y: 158 },
];
const WALK = 260;
const REACH = 20;
const DURATION = 900;

export function DirectionGame({ finish, seed }: GameProps) {
  const flag = pick(FLAGS, seed);
  const svgRef = useRef<SVGSVGElement>(null);
  const [angle, setAngle] = useState(-90);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    },
    []
  );

  const aim = (event: PointerEvent<SVGSVGElement>) => {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    setAngle(Math.round((Math.atan2(point.y - CAT.y, point.x - CAT.x) * 180) / Math.PI));
  };

  const go = () => {
    if (progress !== null) return;
    const rad = (angle * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);
    // Najmniejsza odległość flagi od odcinka trasy.
    const fx = flag.x - CAT.x;
    const fy = flag.y - CAT.y;
    const along = Math.max(0, Math.min(WALK, fx * dx + fy * dy));
    const miss = Math.hypot(fx - dx * along, fy - dy * along);
    const won = miss <= REACH;
    const started = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / DURATION);
      setProgress(t);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else finish(won);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const rad = (angle * Math.PI) / 180;
  const walked = (progress ?? 0) * WALK;
  const x = r2(CAT.x + Math.cos(rad) * walked);
  const y = r2(CAT.y + Math.sin(rad) * walked);
  const nose = { x: r2(Math.cos(rad) * 34), y: r2(Math.sin(rad) * 34) };

  return (
    <div className="flex h-full flex-col">
      <svg
        ref={svgRef}
        viewBox="0 0 320 200"
        className="w-full flex-1 touch-none select-none bg-emerald-50 dark:bg-emerald-950/40"
        onPointerDown={(event) => {
          if (progress !== null) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
          aim(event);
        }}
        onPointerMove={(event) => dragging && aim(event)}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          setDragging(false);
        }}
        onPointerCancel={() => setDragging(false)}
        role="img"
        aria-label={`Kot patrzy w kierunku ${angle} stopni. Flaga stoi w innym miejscu sceny.`}
      >
        {/* flaga */}
        <g transform={`translate(${flag.x} ${flag.y})`}>
          <line x1="0" y1="0" x2="0" y2="-22" stroke="#475569" strokeWidth="2.5" />
          <path d="M0 -22 L18 -16 L0 -10 Z" fill="#ef4444" />
          <circle r="3" fill="#475569" />
        </g>
        {/* tarcza kierunku */}
        <circle cx={CAT.x} cy={CAT.y} r="34" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 4" />
        <line x1={CAT.x} y1={CAT.y} x2={r2(CAT.x + nose.x)} y2={r2(CAT.y + nose.y)} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
        {/* kot jako strzałka */}
        <g transform={`translate(${x} ${y}) rotate(${angle})`}>
          <path d="M-13 -11 L15 0 L-13 11 L-6 0 Z" fill="#f59e0b" stroke="#92400e" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="4" cy="-3" r="1.8" fill="#1f2937" />
        </g>
      </svg>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-sm tabular-nums text-muted-foreground">Kierunek: {angle}° — wskaż palcem, gdzie ma patrzeć nos</span>
        <button
          type="button"
          onClick={go}
          disabled={progress !== null}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          <Play className="h-4 w-4" aria-hidden /> IDŹ
        </button>
      </div>
    </div>
  );
}
