'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GeoPoint } from '../../../lib/lines';
import { buildSweptArc, pointerAngle, shortestDelta } from './compass-geometry';

const VIEW_WIDTH = 280;
const VIEW_HEIGHT = 220;
const CENTER: GeoPoint = { x: 140, y: 115 };
const PX_PER_CM = 17;
const COMPLETE_AT = 358;

export interface CompassTarget {
  radiusCm: number;
  prompt: string;
}

interface CompassDrawProps {
  color: string;
  targets: CompassTarget[];
  onComplete?: () => void;
}

/**
 * Wirtualny cyrkiel: stały punkt (szpic wbity w papier) w środku, dziecko
 * chwyta grot ołówka i obchodzi nim dookoła w stałej odległości od środka —
 * dokładnie jak prawdziwym cyrklem. Odległość od środka jest sztywna (grot
 * zawsze „przyklejony" do promienia), więc jedyny stopień swobody to kąt —
 * inny rodzaj ograniczonego przeciągania niż `AngleBuilder` (tam kąt 0–180°
 * z pojedynczego odczytu) czy `RectangleBuilder` (tam dwa swobodne wymiary):
 * tu trzeba zliczać PEŁNY, możliwy do cofnięcia obrót (patrz
 * `compass-geometry.ts`). Cofnięcie ołówka naprawdę zmniejsza narysowany
 * łuk — żaden ruch nie jest złym ruchem.
 */
export function CompassDraw({ color, targets, onComplete }: CompassDrawProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lastAngleRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [sweptDeg, setSweptDeg] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const target = targets[index];
  const isLast = index === targets.length - 1;
  const radius = target.radiusCm * PX_PER_CM;
  const done = sweptDeg >= COMPLETE_AT;

  const pencilStart: GeoPoint = { x: CENTER.x + radius, y: CENTER.y };
  const arc = buildSweptArc(CENTER, radius, sweptDeg);

  const pointerToSvg = (clientX: number, clientY: number): GeoPoint => {
    const svg = svgRef.current;
    if (!svg) return CENTER;
    const rect = svg.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (VIEW_WIDTH / rect.width),
      y: (clientY - rect.top) * (VIEW_HEIGHT / rect.height),
    };
  };

  const handlePointerDown = (event: React.PointerEvent<SVGCircleElement>) => {
    if (done) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    setHasInteracted(true);
    const point = pointerToSvg(event.clientX, event.clientY);
    lastAngleRef.current = pointerAngle(CENTER, point);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || done) return;
    const point = pointerToSvg(event.clientX, event.clientY);
    const angle = pointerAngle(CENTER, point);
    const delta = shortestDelta(lastAngleRef.current, angle);
    lastAngleRef.current = angle;
    setSweptDeg((prev) => {
      const next = Math.max(0, Math.min(360, prev + delta));
      if (next >= COMPLETE_AT) setDragging(false);
      return next;
    });
  };

  const handlePointerUp = () => setDragging(false);

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setSweptDeg(0);
      setHasInteracted(false);
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
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Compass className="h-4 w-4" style={{ color }} aria-hidden />
          {target.prompt}
        </p>
        <p className="text-sm" aria-live="polite">
          Obieg cyrkla: <span className="font-mono text-base font-bold" style={{ color }}>{Math.round(sweptDeg)}°</span>
        </p>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="h-auto w-full touch-none select-none"
        role="img"
        aria-label={`Cyrkiel o promieniu ${target.radiusCm} cm, obiegnięty w ${Math.round(sweptDeg)} stopniach z 360`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Ślad łuku już narysowany */}
        {done ? (
          <circle cx={CENTER.x} cy={CENTER.y} r={radius} fill="none" stroke="#10b981" strokeWidth={3} />
        ) : (
          sweptDeg > 0 && <path d={arc.path} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
        )}

        {/* Nóżka ze szpicem — nieruchoma w środku */}
        <line x1={CENTER.x} y1={CENTER.y} x2={pencilStart.x} y2={pencilStart.y} stroke={`${color}55`} strokeWidth={1.5} strokeDasharray="3 3" />
        <circle cx={CENTER.x} cy={CENTER.y} r={4} fill={color} />

        {/* Nóżka z ołówkiem — podąża za palcem/kursorem */}
        {!done && (
          <line x1={CENTER.x} y1={CENTER.y} x2={arc.tip.x} y2={arc.tip.y} stroke={color} strokeWidth={1.5} />
        )}

        {!hasInteracted && !done && (
          <motion.circle
            cx={pencilStart.x}
            cy={pencilStart.y}
            fill="none"
            stroke={color}
            strokeWidth={2}
            initial={{ r: 10, opacity: 0.7 }}
            animate={{ r: [10, 20, 10], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        {!done && (
          <circle
            cx={arc.tip.x}
            cy={arc.tip.y}
            r={11}
            fill={`${color}22`}
            stroke={color}
            strokeWidth={3}
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
          />
        )}

        {done && (
          <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ transformOrigin: `${pencilStart.x}px ${pencilStart.y}px` }}>
            <circle cx={pencilStart.x} cy={pencilStart.y} r={12} fill="#10b981" />
            <path
              d={`M ${pencilStart.x - 5} ${pencilStart.y} l 3.5 4 l 6.5 -8`}
              fill="none"
              stroke="white"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        )}
      </svg>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {done
            ? 'Okrąg zamknięty — grot wrócił dokładnie tam, skąd wystartował.'
            : 'Chwyć grot ołówka i obejdź nim dookoła, cały czas w tej samej odległości od szpica.'}
        </p>
        {done && (
          <Button size="sm" onClick={next} style={{ backgroundColor: color }} className="shrink-0 text-white hover:opacity-90">
            {isLast ? 'Dalej' : 'Kolejny promień'}
            {isLast ? <Check className="ml-1.5 h-4 w-4" /> : <ArrowRight className="ml-1.5 h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
}
