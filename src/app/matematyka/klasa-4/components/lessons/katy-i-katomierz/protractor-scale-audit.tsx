'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { angleMarker, arrowheadPoints, type GeoPoint } from '../../../lib/lines';
import { protractorPoint, scaleReadingAt } from './angle-geometry';

const VIEW_WIDTH = 290;
const VIEW_HEIGHT = 190;
// Wierzchołek musi mieć na lewo od siebie miejsce co najmniej na SCALE_RADIUS
// + etykiety — ramię i podziałka sięgają aż do 180° (prosto w lewo).
const VERTEX: GeoPoint = { x: 150, y: 160 };
const RAY_REACH = 105;
const SCALE_RADIUS = 96;
const ARC_RADIUS = 34;

const BASE_END = protractorPoint(VERTEX, 0, RAY_REACH);
const MAJOR_TICKS = [0, 30, 60, 90, 120, 150, 180];

interface Round {
  id: string;
  /** Kreska, na której ramię przecina podziałkę — to jest jedyny prawdziwy odczyt. */
  degrees: number;
  /** Kolejność przycisków: czy odczyt wewnętrzny (prawdziwy) pokazać jako pierwszy. */
  innerFirst: boolean;
}

const ROUNDS: Round[] = [
  { id: 'r1', degrees: 30, innerFirst: false },
  { id: 'r2', degrees: 60, innerFirst: true },
  { id: 'r3', degrees: 120, innerFirst: false },
  { id: 'r4', degrees: 150, innerFirst: true },
];

interface ProtractorScaleAuditProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Ćwiczenia — flagowy widżet lekcji. Kątomierz ma dwie podziałki liczone w
 * przeciwne strony (dokładnie jak prawdziwy), więc przy każdej kresce
 * widnieją dwie liczby. Dziecko widzi już narysowany kąt i musi wybrać, który
 * z dwóch odczytów jest prawdziwy — pierwsze w kursie kliknięcie wybierające
 * właściwą wartość spośród dwóch liczb wydrukowanych na tej samej kresce
 * skali, zamiast klikania punktu/przycisku ze sceny czy odpowiedzi quizu.
 */
export function ProtractorScaleAudit({ color, onComplete }: ProtractorScaleAuditProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [shakeValue, setShakeValue] = useState<number | null>(null);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const reading = scaleReadingAt(round.degrees);
  const options = round.innerFirst ? [reading.inner, reading.outer] : [reading.outer, reading.inner];
  const solved = picked === reading.inner;

  const movingEnd = protractorPoint(VERTEX, round.degrees, RAY_REACH);
  const arrow = arrowheadPoints(VERTEX, movingEnd, 8);
  const baseArrow = arrowheadPoints(VERTEX, BASE_END, 8);
  const mark = angleMarker(VERTEX, BASE_END, movingEnd, ARC_RADIUS, 20);

  const pick = (value: number) => {
    if (solved) return;
    if (value === reading.inner) {
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

      <p className="mb-4 text-sm leading-relaxed">
        Ramię przecina podziałkę w miejscu, gdzie widnieją{' '}
        <strong style={{ color }}>dwie liczby</strong> — kątomierz liczy w dwie strony naraz. Który
        odczyt jest prawdziwy?
      </p>

      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className="mx-auto h-auto w-full max-w-[320px]"
        role="img"
        aria-label={`Kąt narysowany na kątomierzu, przecinający podziałkę na kresce ${round.degrees} stopni licząc od ramienia podstawy`}
      >
        {MAJOR_TICKS.map((deg) => {
          const isCrossing = deg === round.degrees;
          const tickInner = protractorPoint(VERTEX, deg, SCALE_RADIUS - 8);
          const tickOuter = protractorPoint(VERTEX, deg, SCALE_RADIUS + 8);
          const r = scaleReadingAt(deg);
          const innerLabelPos = protractorPoint(VERTEX, deg, SCALE_RADIUS + 16);
          const outerLabelPos = protractorPoint(VERTEX, deg, SCALE_RADIUS + 27);
          return (
            <g key={deg}>
              <line
                x1={tickInner.x}
                y1={tickInner.y}
                x2={tickOuter.x}
                y2={tickOuter.y}
                stroke={isCrossing ? color : `${color}55`}
                strokeWidth={isCrossing ? 2.5 : 1.25}
              />
              <text
                x={innerLabelPos.x}
                y={innerLabelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: isCrossing ? 10 : 7.5, fontWeight: isCrossing ? 800 : 600 }}
                fill={isCrossing ? color : `${color}80`}
              >
                {r.inner}
              </text>
              <text
                x={outerLabelPos.x}
                y={outerLabelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: isCrossing ? 10 : 7.5, fontWeight: isCrossing ? 800 : 600 }}
                fill={isCrossing ? 'var(--muted-foreground)' : `${color}55`}
              >
                {r.outer}
              </text>
            </g>
          );
        })}

        <path
          d={`M ${protractorPoint(VERTEX, 0, SCALE_RADIUS).x} ${protractorPoint(VERTEX, 0, SCALE_RADIUS).y} A ${SCALE_RADIUS} ${SCALE_RADIUS} 0 0 0 ${protractorPoint(VERTEX, 180, SCALE_RADIUS).x} ${protractorPoint(VERTEX, 180, SCALE_RADIUS).y}`}
          fill="none"
          stroke={`${color}40`}
          strokeWidth={1}
        />

        <line x1={VERTEX.x} y1={VERTEX.y} x2={BASE_END.x} y2={BASE_END.y} stroke={color} strokeWidth={2.5} />
        <polygon points={baseArrow} fill={color} />
        <line x1={VERTEX.x} y1={VERTEX.y} x2={movingEnd.x} y2={movingEnd.y} stroke={color} strokeWidth={2.5} />
        <polygon points={arrow} fill={color} />

        <path
          d={`M ${mark.arcStart.x} ${mark.arcStart.y} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 ${mark.sweepFlag} ${mark.arcEnd.x} ${mark.arcEnd.y}`}
          fill="none"
          stroke={solved ? '#10b981' : `${color}aa`}
          strokeWidth={2}
        />

        <circle cx={VERTEX.x} cy={VERTEX.y} r={4} fill={color} />
      </svg>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {options.map((value) => {
          const isAnswer = solved && value === reading.inner;
          return (
            <motion.button
              key={value}
              type="button"
              onClick={() => pick(value)}
              disabled={solved}
              animate={shakeValue === value ? { x: [0, -6, 6, -6, 6, 0] } : undefined}
              transition={{ duration: 0.4 }}
              className={cn(
                'cursor-pointer border px-4 py-4 text-center font-mono text-xl font-bold transition-all disabled:cursor-not-allowed',
                !solved && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                solved && !isAnswer && 'opacity-40'
              )}
              style={isAnswer ? { borderColor: color, backgroundColor: `${color}14`, color } : undefined}
            >
              {value}°
            </motion.button>
          );
        })}
      </div>

      {solved && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-start gap-3 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            Dobrze! Ramię podstawy stoi na kresce 0° — to od niej liczymy, więc prawdziwy odczyt to{' '}
            <strong>{reading.inner}°</strong>. Liczba <strong>{reading.outer}°</strong> to odczyt z
            podziałki liczonej w drugą stronę, od przeciwnego ramienia — łatwo się pomylić, jeśli nie
            sprawdzisz, przy którym ramieniu stoi 0°.
          </p>
        </motion.div>
      )}

      {solved && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>{isLast ? 'Do zadania problemowego' : 'Następny kąt'}</Button>
        </div>
      )}
    </div>
  );
}
