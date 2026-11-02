'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildPerimeterEdges, formatLength, rectangleCorners, totalPerimeter } from './perimeter-geometry';

interface FormulaCard {
  id: string;
  title: string;
  widthCm: number;
  heightCm: number;
  unit: string;
  sumExpression: string;
  shortcutExpression: string;
  note: string;
}

const PX_PER_CM = 16;

const CARDS: FormulaCard[] = [
  {
    id: 'prostokat',
    title: 'Prostokąt 7 cm na 4 cm',
    widthCm: 7,
    heightCm: 4,
    unit: 'cm',
    sumExpression: '7 + 4 + 7 + 4',
    shortcutExpression: '2 × 7  +  2 × 4  =  2 × (7 + 4)',
    note: 'W prostokącie boki naprzeciwległe są równe, więc zamiast dodawać cztery liczby, wystarczy policzyć dwa razy sumę dwóch sąsiednich boków.',
  },
  {
    id: 'kwadrat',
    title: 'Kwadrat o boku 5 cm',
    widthCm: 5,
    heightCm: 5,
    unit: 'cm',
    sumExpression: '5 + 5 + 5 + 5',
    shortcutExpression: '4 × 5',
    note: 'W kwadracie wszystkie cztery boki są takie same, więc obwód to po prostu długość boku pomnożona przez 4.',
  },
];

interface PerimeterFormulaShowcaseProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: ta sama suma boków co w kroku „Nowe pojęcie”, tylko dla prostokąta i kwadratu skraca się do mnożenia. */
export function PerimeterFormulaShowcase({ color, onComplete }: PerimeterFormulaShowcaseProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const card = CARDS[index];
  const isLast = index === CARDS.length - 1;
  const widthPx = card.widthCm * PX_PER_CM;
  const heightPx = card.heightCm * PX_PER_CM;
  const viewWidth = 220;
  const viewHeight = 140;
  const origin = { x: (viewWidth - widthPx) / 2, y: (viewHeight - heightPx) / 2 };
  const points = rectangleCorners(origin, widthPx, heightPx);
  const sideLengths = [card.widthCm, card.heightCm, card.widthCm, card.heightCm];
  const edges = buildPerimeterEdges(points, sideLengths, 16);
  const total = totalPerimeter(sideLengths);

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setRevealed(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {CARDS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{CARDS.length}
        </span>
      </div>

      <p className="mb-4 text-center text-sm font-semibold sm:text-base">{card.title}</p>

      <svg
        viewBox={`0 0 ${viewWidth} ${viewHeight}`}
        className="mx-auto h-auto w-full max-w-[240px]"
        role="img"
        aria-label={card.title}
      >
        <polygon
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill={`${color}22`}
          stroke={color}
          strokeWidth={2.5}
        />
        {edges.map((edge, i) => (
          <text
            key={i}
            x={edge.labelPoint.x}
            y={edge.labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 12, fontWeight: 700 }}
            fill={`color-mix(in oklch, ${color} 88%, black)`}
          >
            {formatLength(edge.length, card.unit)}
          </text>
        ))}
      </svg>

      <p className="mt-4 text-center font-mono text-base font-bold tabular-nums sm:text-lg">
        {card.sumExpression} {card.unit}
      </p>

      {!revealed ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Zap className="h-4 w-4" aria-hidden />
            Pokaż skrót
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 text-center dark:bg-emerald-950/40"
        >
          <p className="font-mono text-base font-bold tabular-nums text-emerald-900 dark:text-emerald-100 sm:text-lg">
            {card.shortcutExpression} = {formatLength(total, card.unit)}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">{card.note}</p>
        </motion.div>
      )}

      {revealed && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>{isLast ? 'Do ćwiczeń' : 'Kolejny przykład'}</Button>
        </div>
      )}
    </div>
  );
}
