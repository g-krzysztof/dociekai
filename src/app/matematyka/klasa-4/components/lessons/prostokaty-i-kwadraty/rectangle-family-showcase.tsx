'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RectangleGlyph } from './rectangle-glyph';

interface Card {
  id: string;
  title: string;
  widthCells: number;
  heightCells: number;
  explanation: string;
}

const CARDS: Card[] = [
  {
    id: 'kartka',
    title: 'Kartka z zeszytu',
    widthCells: 7,
    heightCells: 5,
    explanation:
      'Boki naprzeciwległe są równe i równoległe, a w każdym rogu jest kąt prosty — to prostokąt.',
  },
  {
    id: 'okno',
    title: 'Kwadratowe okienko',
    widthCells: 5,
    heightCells: 5,
    explanation: 'Tu wszystkie boki są równe — to szczególny prostokąt: kwadrat.',
  },
  {
    id: 'ekran',
    title: 'Ekran telefonu, ustawiony pionowo',
    widthCells: 3,
    heightCells: 7,
    explanation:
      'Inne proporcje niż kartka, ale wciąż 4 kąty proste i boki naprzeciwległe równe — nadal prostokąt.',
  },
];

interface RectangleFamilyShowcaseProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Przykłady: trzy realne przedmioty o zupełnie różnych proporcjach, ale tej
 * samej figurze — pokazuje, że nazwa nie zależy od tego, „jak bardzo
 * kwadratowo” coś wygląda, tylko od kątów prostych i równości boków.
 */
export function RectangleFamilyShowcase({ color, onComplete }: RectangleFamilyShowcaseProps) {
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

      <RectangleGlyph
        widthCells={card.widthCells}
        heightCells={card.heightCells}
        color={color}
        label={card.title}
      />

      {!revealed ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Eye className="h-4 w-4" aria-hidden />
            Sprawdź właściwości
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          {card.explanation}
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
