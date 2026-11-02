'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CircleFigure } from '../../circle-figure';
import { buildCircleDiagram } from '../../../lib/circle';

interface FormulaCard {
  id: string;
  title: string;
  radiusCm: number;
}

const PX_PER_CM = 11;
const CENTER = { x: 100, y: 100 };

const CARDS: FormulaCard[] = [
  { id: 'male', title: 'Koło o promieniu 4 cm' },
  { id: 'duze', title: 'Koło o promieniu 7 cm' },
].map((card, i) => ({ ...card, radiusCm: i === 0 ? 4 : 7 }));

interface CircleFormulaShowcaseProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: promień znany od razu, średnica dochodzi po kliknięciu — ten sam rytm co `PerimeterFormulaShowcase` (suma → skrót), tu zastosowany do 2 × promień. */
export function CircleFormulaShowcase({ color, onComplete }: CircleFormulaShowcaseProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const card = CARDS[index];
  const isLast = index === CARDS.length - 1;
  const diagram = buildCircleDiagram(CENTER, card.radiusCm * PX_PER_CM);
  const diameterCm = card.radiusCm * 2;

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

      <CircleFigure
        color={color}
        diagram={diagram}
        parts={{
          srodek: { shown: true, active: true },
          promien: { shown: true, active: true, label: `${card.radiusCm} cm` },
          srednica: revealed ? { shown: true, active: true, label: `${diameterCm} cm` } : { shown: false, active: false },
        }}
        size={240}
        ariaLabel={`${card.title}, średnica ${revealed ? 'pokazana' : 'ukryta'}`}
      />

      <p className="mt-4 text-center font-mono text-base font-bold tabular-nums sm:text-lg">
        {card.radiusCm} cm + {card.radiusCm} cm
      </p>

      {!revealed ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Zap className="h-4 w-4" aria-hidden />
            Pokaż średnicę
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 text-center dark:bg-emerald-950/40"
        >
          <p className="font-mono text-base font-bold tabular-nums text-emerald-900 dark:text-emerald-100 sm:text-lg">
            2 × {card.radiusCm} cm = {diameterCm} cm
          </p>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
            Dwa promienie ułożone w linii prostej przez środek dają średnicę — zawsze dwa razy
            dłuższą niż jeden promień.
          </p>
        </motion.div>
      )}

      {revealed && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
            {isLast ? 'Do ćwiczeń' : 'Kolejny przykład'}
          </Button>
        </div>
      )}
    </div>
  );
}
