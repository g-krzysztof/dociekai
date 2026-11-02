'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AxisLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface AxisCard {
  id: string;
  title: string;
  points: string;
  axes: AxisLine[];
}

const CARDS: AxisCard[] = [
  {
    id: 'trojkat',
    title: 'Trójkąt równoramienny',
    points: '50,25 20,80 80,80',
    axes: [{ x1: 50, y1: 15, x2: 50, y2: 90 }],
  },
  {
    id: 'prostokat',
    title: 'Prostokąt',
    points: '20,35 80,35 80,70 20,70',
    axes: [
      { x1: 10, y1: 52.5, x2: 90, y2: 52.5 },
      { x1: 50, y1: 20, x2: 50, y2: 85 },
    ],
  },
  {
    id: 'kwadrat',
    title: 'Kwadrat',
    points: '25,25 75,25 75,75 25,75',
    axes: [
      { x1: 10, y1: 50, x2: 90, y2: 50 },
      { x1: 50, y1: 10, x2: 50, y2: 90 },
      { x1: 25, y1: 25, x2: 75, y2: 75 },
      { x1: 75, y1: 25, x2: 25, y2: 75 },
    ],
  },
];

interface AxisCountShowcaseProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: liczba osi symetrii rośnie z trójkąta do kwadratu — ten sam rytm „ukryte → pokaż" co `CircleFormulaShowcase`/`PerimeterFormulaShowcase`. */
export function AxisCountShowcase({ color, onComplete }: AxisCountShowcaseProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const card = CARDS[index];
  const isLast = index === CARDS.length - 1;

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
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{CARDS.length}
        </span>
      </div>

      <p className="mb-4 text-center text-sm font-semibold sm:text-base">{card.title}</p>

      <svg viewBox="0 0 100 100" className="mx-auto h-auto w-full max-w-[200px]" role="img" aria-label={`${card.title}${revealed ? `, ${card.axes.length} osi symetrii` : ''}`}>
        <polygon points={card.points} fill={`${color}22`} stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
        {revealed &&
          card.axes.map((axis, i) => (
            <line key={i} x1={axis.x1} y1={axis.y1} x2={axis.x2} y2={axis.y2} stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 3" />
          ))}
      </svg>

      {!revealed ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Zap className="h-4 w-4" aria-hidden />
            Pokaż osie symetrii
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-emerald-50 p-4 text-center dark:bg-emerald-950/40">
          <p className="font-mono text-base font-bold tabular-nums text-emerald-900 dark:text-emerald-100 sm:text-lg">
            {card.axes.length} {card.axes.length === 1 ? 'oś symetrii' : 'osie symetrii'}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
            {card.axes.length === 1
              ? 'Tylko jedna linia dzieli tę figurę na lustrzane połówki.'
              : `Aż ${card.axes.length} różne linie dzielą tę figurę na lustrzane połówki naraz.`}
          </p>
        </motion.div>
      )}

      {revealed && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
            {isLast ? 'Do ćwiczeń' : 'Kolejna figura'}
          </Button>
        </div>
      )}
    </div>
  );
}
