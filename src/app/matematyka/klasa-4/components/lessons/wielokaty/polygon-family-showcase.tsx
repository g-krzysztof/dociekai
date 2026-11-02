'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { polygonPoints, pointsToString, POLYGON_NAMES } from './polygon-geometry';
import type { GeoPoint } from '../../../lib/lines';

const LEFT_CENTER: GeoPoint = { x: 80, y: 80 };
const REGULAR_RADIUS = 55;

interface Card {
  sides: number;
  irregular: GeoPoint[];
}

const CARDS: Card[] = [
  {
    sides: 3,
    irregular: [
      { x: 215, y: 20 },
      { x: 275, y: 60 },
      { x: 180, y: 120 },
    ],
  },
  {
    sides: 4,
    irregular: [
      { x: 190, y: 30 },
      { x: 270, y: 55 },
      { x: 255, y: 130 },
      { x: 175, y: 115 },
    ],
  },
  {
    sides: 5,
    irregular: [
      { x: 215, y: 15 },
      { x: 280, y: 58 },
      { x: 258, y: 132 },
      { x: 180, y: 128 },
      { x: 160, y: 55 },
    ],
  },
  {
    sides: 6,
    irregular: [
      { x: 210, y: 15 },
      { x: 275, y: 50 },
      { x: 260, y: 115 },
      { x: 215, y: 140 },
      { x: 165, y: 110 },
      { x: 178, y: 48 },
    ],
  },
];

interface PolygonFamilyShowcaseProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Przykłady: dla każdej liczby boków pokazuje figurę foremną i nieregularną
 * obok siebie — obie noszą tę samą nazwę, bo nazwa zależy wyłącznie od liczby
 * boków, nie od kształtu czy regularności.
 */
export function PolygonFamilyShowcase({ color, onComplete }: PolygonFamilyShowcaseProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const card = CARDS[index];
  const isLast = index === CARDS.length - 1;
  const name = POLYGON_NAMES[card.sides];
  const regularPoints = polygonPoints(LEFT_CENTER, REGULAR_RADIUS, card.sides, -90);

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

      <p className="mb-4 text-center text-sm font-semibold sm:text-base">
        Dwie różne figury — {card.sides} boki każda
      </p>

      <svg
        viewBox="0 0 300 160"
        className="mx-auto h-auto w-full max-w-[340px]"
        role="img"
        aria-label={`Foremny i nieregularny ${name} obok siebie`}
      >
        <polygon
          points={pointsToString(regularPoints)}
          fill={`${color}22`}
          stroke={color}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <polygon
          points={pointsToString(card.irregular)}
          fill={`${color}22`}
          stroke={color}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      </svg>

      {!revealed ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Eye className="h-4 w-4" aria-hidden />
            Jak się nazywają?
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          Obie figury to <strong>{name}</strong> — obie mają {card.sides}{' '}
          {card.sides <= 4 ? 'boki' : 'boków'}. Nie ma znaczenia, że wyglądają inaczej — liczy się
          tylko liczba boków.
        </motion.div>
      )}

      {revealed && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next}>{isLast ? 'Do ćwiczeń' : 'Kolejna para'}</Button>
        </div>
      )}
    </div>
  );
}
