'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { round } from '../../../lib/lines';

const VIEW_W = 240;
const VIEW_H = 280;
const JUG_LEFT = 78;
const JUG_RIGHT = 188;
const JUG_TOP = 34;
const JUG_BOTTOM = 246;
const JUG_H = JUG_BOTTOM - JUG_TOP;

export interface JugRound {
  id: string;
  label: string;
  /** Ilość, którą trzeba odmierzyć — zapisana tak, jak podaje ją przepis. */
  target: { licznik: number; mianownik: number };
  /** Na ile równych kresek podzielona jest miarka, którą dziecko ma pod ręką. */
  scale: number;
  note: string;
}

interface MeasureJugLabProps {
  color: string;
  rounds: JugRound[];
  onComplete?: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Zadanie problemowe lekcji i jej drugi nowy mechanizm — celowo NIE w „Nowym
 * pojęciu".
 *
 * Przepis podaje ilość w jednym mianowniku (3/4 szklanki), a miarka w domu ma
 * kreski w zupełnie innym (co 1/8). Dziecko przeciąga poziom płynu w naczyniu,
 * a poziom zatrzaskuje się na kreskach TEJ miarki — więc żeby trafić w 3/4,
 * musi samo dojść do 6/8. Pierwszy w kursie drag po osi pionowej i pierwszy,
 * w którym celem jest wielkość zapisana w INNEJ jednostce niż podziałka
 * przyrządu (`ProtractorScaleAudit` miał dwie skale na jednym narzędziu, ale
 * obie mierzyły w stopniach).
 */
export function MeasureJugLab({ color, rounds, onComplete }: MeasureJugLabProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [index, setIndex] = useState(0);
  const [ticks, setTicks] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const containerRef = useSectionScrollAnchor(index);

  const roundData = rounds[index] ?? rounds[rounds.length - 1];
  const isLast = index === rounds.length - 1;
  const scale = roundData.scale;
  const matched = ticks * roundData.target.mianownik === roundData.target.licznik * scale;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const yOf = (level: number) => round(JUG_BOTTOM - (level / scale) * JUG_H);
  const levelY = yOf(ticks);

  const setFromClientY = (clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.height === 0) return;
    const localY = ((clientY - rect.top) * VIEW_H) / rect.height;
    const ratio = clamp((JUG_BOTTOM - localY) / JUG_H, 0, 1);
    setTicks(Math.round(ratio * scale));
  };

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      setTicks(0);
      setTouched(false);
      return;
    }
    onComplete?.();
  };

  if (index >= rounds.length) return null;

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {rounds.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{rounds.length}
        </span>
      </div>

      <p className="mb-5 text-sm font-semibold leading-relaxed sm:text-base">{roundData.label}</p>

      <div className="grid gap-6 sm:grid-cols-[240px_1fr] sm:items-center">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="mx-auto h-auto w-full max-w-[240px] touch-none select-none"
          role="group"
          aria-label={`Miarka podzielona na ${scale} równych kresek, poziom ustawiony na ${ticks}`}
        >
          {/* Płyn */}
          <rect
            x={JUG_LEFT}
            y={levelY}
            width={JUG_RIGHT - JUG_LEFT}
            height={JUG_BOTTOM - levelY}
            fill={matched ? '#10b981' : color}
            fillOpacity={0.45}
          />

          {/* Ścianki naczynia */}
          <path
            d={`M ${JUG_LEFT} ${JUG_TOP} L ${JUG_LEFT} ${JUG_BOTTOM} L ${JUG_RIGHT} ${JUG_BOTTOM} L ${JUG_RIGHT} ${JUG_TOP}`}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
          />
          {/* Uchwyt */}
          <path
            d={`M ${JUG_RIGHT} ${JUG_TOP + 42} q 34 24 0 62`}
            fill="none"
            stroke={color}
            strokeOpacity={0.55}
            strokeWidth={3}
          />

          {/* Kreski podziałki */}
          {Array.from({ length: scale + 1 }, (_, i) => {
            const y = yOf(i);
            const isEnd = i === 0 || i === scale;
            return (
              <line
                key={i}
                x1={JUG_LEFT}
                y1={y}
                x2={JUG_LEFT + (isEnd ? 34 : 22)}
                y2={y}
                stroke={color}
                strokeOpacity={isEnd ? 0.75 : 0.4}
                strokeWidth={isEnd ? 2.5 : 1.5}
              />
            );
          })}

          {/* Powierzchnia płynu — uchwyt do przeciągania */}
          <line
            x1={JUG_LEFT}
            y1={levelY}
            x2={JUG_RIGHT}
            y2={levelY}
            stroke={matched ? '#059669' : color}
            strokeWidth={4}
            strokeLinecap="round"
            pointerEvents="none"
          />
          <motion.circle
            cx={JUG_RIGHT}
            r={8}
            fill={matched ? '#059669' : color}
            stroke="white"
            strokeWidth={2}
            animate={{ cy: levelY }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            pointerEvents="none"
          />
          {!touched && (
            <motion.circle
              cx={JUG_RIGHT}
              cy={levelY}
              fill="none"
              stroke={color}
              strokeWidth={2}
              initial={{ r: 9, opacity: 0.7 }}
              animate={{ r: [9, 19, 9], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
          )}

          {/* Pas trafienia w zdarzenia wskaźnika — cała wysokość naczynia */}
          <rect
            x={JUG_LEFT - 12}
            y={JUG_TOP - 12}
            width={JUG_RIGHT - JUG_LEFT + 36}
            height={JUG_H + 24}
            fill="transparent"
            role="slider"
            aria-label="Poziom płynu w miarce"
            aria-valuemin={0}
            aria-valuemax={scale}
            aria-valuenow={ticks}
            tabIndex={0}
            style={{ cursor: dragging ? 'grabbing' : 'grab' }}
            onPointerDown={(event) => {
              event.preventDefault();
              (event.currentTarget as SVGRectElement).setPointerCapture(event.pointerId);
              setDragging(true);
              setTouched(true);
              setFromClientY(event.clientY);
            }}
            onPointerMove={(event) => {
              if (dragging) setFromClientY(event.clientY);
            }}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowUp') {
                setTouched(true);
                setTicks((prev) => Math.min(scale, prev + 1));
              }
              if (event.key === 'ArrowDown') {
                setTouched(true);
                setTicks((prev) => Math.max(0, prev - 1));
              }
            }}
          />
        </svg>

        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
            Twoja miarka
          </p>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            Kreski co jedną {scale === 8 ? 'ósmą' : scale === 12 ? 'dwunastą' : 'dziesiątą'} szklanki — poziom zatrzaskuje się
            tylko na nich.
          </p>
          <p className="font-mono text-3xl font-black tabular-nums" style={{ color }}>
            {ticks}/{scale}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Przepis wymaga {roundData.target.licznik}/{roundData.target.mianownik} szklanki.
          </p>
        </div>
      </div>

      {matched && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex flex-wrap items-center justify-between gap-4 bg-emerald-50 p-4 dark:bg-emerald-950/40"
        >
          <p className="flex max-w-2xl items-start gap-2 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            <span>
              <strong className="font-mono">
                {roundData.target.licznik}/{roundData.target.mianownik} = {ticks}/{scale}
              </strong>{' '}
              — {roundData.note}
            </span>
          </p>
          <Button onClick={next} style={{ backgroundColor: color }} className="gap-1.5 text-white hover:opacity-90">
            {isLast ? 'Dalej' : 'Kolejny przepis'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
