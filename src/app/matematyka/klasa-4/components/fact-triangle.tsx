'use client';

import { motion } from 'framer-motion';

const WIDTH = 220;
const HEIGHT = 200;
const R = 28;
/** Wierzchołki trzymają co najmniej 6px odstępu od krawędzi `viewBox` po obu stronach, żeby okrągłe znaczniki (promień `R`) się nie ucinały. */
const TOP = { x: 110, y: R + 6 };
const LEFT = { x: 34, y: HEIGHT - R - 6 };
const RIGHT = { x: 186, y: HEIGHT - R - 6 };

export interface FactTriangleProps {
  /** Lewy dolny róg (czynnik). `null` = ukryty, pokazywany jako „?”. */
  a: number | null;
  /** Prawy dolny róg (czynnik). */
  b: number | null;
  /** Wierzchołek (iloczyn). */
  c: number | null;
  color: string;
  /** Który wierzchołek podświetlić (np. właśnie odsłonięty). */
  highlight?: 'a' | 'b' | 'c' | null;
  ariaLabel: string;
  className?: string;
}

function Vertex({
  x,
  y,
  value,
  color,
  highlighted,
}: {
  x: number;
  y: number;
  value: number | null;
  color: string;
  highlighted: boolean;
}) {
  const known = value !== null;
  return (
    <motion.g
      animate={highlighted ? { scale: [1, 1.18, 1] } : { scale: 1 }}
      transition={{ duration: 0.45 }}
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      <circle
        cx={x}
        cy={y}
        r={R}
        fill={known ? color : 'white'}
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray={known ? undefined : '4 4'}
      />
      <text
        x={x}
        y={y + 8}
        textAnchor="middle"
        className="font-mono text-xl font-black tabular-nums"
        fill={known ? 'white' : color}
      >
        {known ? value : '?'}
      </text>
    </motion.g>
  );
}

/**
 * Trójkąt faktów (fact family triangle): trzy powiązane liczby — dwa czynniki
 * i ich iloczyn — z których każde dwie znane dają czwarte za darmo (mnożenie
 * w obie strony, dzielenie w obie strony). Inny mechanizm niż `ArrayGrid`
 * (tam liczy się powierzchnia) — tu liczy się relacja między trzema liczbami.
 * Nie hardkoduje żadnych podpisów poza samymi wartościami, więc działa
 * identycznie dla rodziny dodawanie/odejmowanie — promowany tutaj, do
 * `components/`, gdy przewodnik `slownik-dzialan` stał się drugim
 * konsumentem — ten sam precedens co `RomanOdometer`/`NumberLine`.
 */
export function FactTriangle({ a, b, c, color, highlight, ariaLabel, className }: FactTriangleProps) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={className ?? 'mx-auto h-auto w-full max-w-[220px]'}
      role="img"
      aria-label={ariaLabel}
    >
      <line x1={TOP.x} y1={TOP.y} x2={LEFT.x} y2={LEFT.y} stroke={color} strokeOpacity={0.35} strokeWidth={2.5} />
      <line x1={TOP.x} y1={TOP.y} x2={RIGHT.x} y2={RIGHT.y} stroke={color} strokeOpacity={0.35} strokeWidth={2.5} />
      <line x1={LEFT.x} y1={LEFT.y} x2={RIGHT.x} y2={RIGHT.y} stroke={color} strokeOpacity={0.35} strokeWidth={2.5} />

      <Vertex x={TOP.x} y={TOP.y} value={c} color={color} highlighted={highlight === 'c'} />
      <Vertex x={LEFT.x} y={LEFT.y} value={a} color={color} highlighted={highlight === 'a'} />
      <Vertex x={RIGHT.x} y={RIGHT.y} value={b} color={color} highlighted={highlight === 'b'} />
    </svg>
  );
}
