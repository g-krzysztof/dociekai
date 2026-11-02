'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { COIN_VALUES } from '../../../lib/money';
import { MoneyPurse } from './money-purse';

interface Round {
  id: string;
  target: number;
  denominations: readonly number[];
  caption: string;
}

const GROSZ_COINS = COIN_VALUES.filter((value) => value < 100);

const ROUNDS: Round[] = [
  {
    id: 'r1',
    target: 47,
    denominations: GROSZ_COINS,
    caption: 'Ułóż dokładnie 47 groszy z monet groszowych.',
  },
  {
    id: 'r2',
    target: 130,
    denominations: GROSZ_COINS,
    caption:
      'Ułóż 130 groszy — wciąż samymi monetami groszowymi. Patrz uważnie na sumę, gdy przekroczysz 100.',
  },
  {
    id: 'r3',
    target: 305,
    denominations: COIN_VALUES,
    caption: 'Ułóż dokładnie 3 zł 5 gr. Uwaga — to nie to samo co 3 zł 50 gr!',
  },
];

interface MoneyBuilderProps {
  color: string;
  onComplete?: () => void;
}

/** Nowe pojęcie: trzy rundy budowania kwoty flagowym `<MoneyPurse>`, z narastającą trudnością. */
export function MoneyBuilder({ color, onComplete }: MoneyBuilderProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];
  const total = picked.reduce((sum, value) => sum + value, 0);
  const reached = total === round.target;

  const add = (value: number) => setPicked((prev) => [...prev, value]);
  const undo = () => setPicked((prev) => prev.slice(0, -1));

  const next = () => {
    if (index + 1 < ROUNDS.length) {
      setIndex((prev) => prev + 1);
      setPicked([]);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Sparkles className="mx-auto mb-3 h-8 w-8" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Grosze i złote to jeden system</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          100 groszy zawsze zamienia się w 1 złotego — dokładnie tak, jak przed chwilą
          widziałeś/aś na tacy.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
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

      <AnimatePresence mode="wait">
        <motion.div
          key={round.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-4 text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
            {round.caption}
          </p>

          <MoneyPurse
            denominations={round.denominations}
            picked={picked}
            onAdd={add}
            onUndo={undo}
            color={color}
            target={round.target}
          />

          {reached && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next} className="gap-1.5">
                {index + 1 < ROUNDS.length ? 'Następna runda' : 'Zakończ'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
