'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { ColumnGrid, type ColumnCellData } from '../../column-grid';
import { digitsOf, PLACE_LABELS } from '../../../lib/column-algorithm';

interface AlignmentRound {
  id: string;
  long: number;
  short: number;
  /** Poprawny wariant po prawej (`true`) czy po lewej (`false`) — na przemian, żeby nie klastrować. */
  correctOnRight: boolean;
}

const ROUNDS: AlignmentRound[] = [
  { id: 'r1', long: 46, short: 7, correctOnRight: false },
  { id: 'r2', long: 128, short: 34, correctOnRight: true },
  { id: 'r3', long: 305, short: 9, correctOnRight: false },
];

/** Zestawia `long` i `short` w kolumnach; `shift` = o ile kolumn w lewo (0 = poprawnie, pod jednościami). */
function buildCells(long: number, short: number, shift: number): ColumnCellData[] {
  const length = Math.max(String(long).length, String(short).length) + 1;
  const longDigits = digitsOf(long, length);
  const shortDigits = digitsOf(short, length);
  const cells = Array.from({ length }, (_, pos) => {
    const i = length - 1 - pos;
    const shortSrc = i - shift;
    const bottom = shortSrc >= 0 && shortSrc < length ? shortDigits[shortSrc] : null;
    return { place: PLACE_LABELS[i], top: longDigits[i], bottom };
  });
  const firstNonEmpty = cells.findIndex((cell) => cell.top != null || cell.bottom != null);
  return firstNonEmpty <= 0 ? cells : cells.slice(firstNonEmpty);
}

interface UstawianieWarmupProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: szybkie przypomnienie zasady z przewodnika „Zapis pisemny” —
 * dziecko wskazuje, który z dwóch wariantów ma liczby ustawione pod
 * właściwymi kolumnami, zanim zacznie realnie liczyć.
 */
export function UstawianieWarmup({ color, onComplete }: UstawianieWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<'left' | 'right' | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];
  const correctSide: 'left' | 'right' = round.correctOnRight ? 'right' : 'left';
  const leftCells = buildCells(round.long, round.short, round.correctOnRight ? 1 : 0);
  const rightCells = buildCells(round.long, round.short, round.correctOnRight ? 0 : 1);

  const pick = (side: 'left' | 'right') => {
    if (picked) return;
    setPicked(side);
    if (side === correctSide) setScore((prev) => prev + 1);
  };

  const next = () => {
    if (index + 1 < ROUNDS.length) {
      setIndex((prev) => prev + 1);
      setPicked(null);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-extrabold"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          {score}/{ROUNDS.length}
        </motion.div>
        <h3 className="mb-2 text-xl font-bold">Ustawianie liczb</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Jedności pod jednościami, dziesiątki pod dziesiątkami — ta sama zasada będzie działać w
          każdej kolumnie, którą dziś policzysz.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((item, i) => (
          <span
            key={item.id}
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
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
            {round.long} + {round.short} — który zapis ma liczby ustawione pod właściwymi kolumnami?
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {(['left', 'right'] as const).map((side) => {
              const cells = side === 'left' ? leftCells : rightCells;
              const isAnswer = side === correctSide;
              const isPicked = picked === side;
              const reveal = picked !== null;

              return (
                <button
                  key={side}
                  type="button"
                  onClick={() => pick(side)}
                  disabled={reveal}
                  className={cn(
                    'flex flex-col items-center gap-2 border px-4 py-5 transition-all disabled:cursor-not-allowed',
                    !reveal && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    reveal && isAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !isAnswer && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isAnswer && 'opacity-55'
                  )}
                >
                  {reveal && isAnswer && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                  {reveal && isPicked && !isAnswer && <X className="h-4 w-4 shrink-0 text-rose-600" />}
                  <ColumnGrid
                    color={color}
                    operator="+"
                    cells={cells}
                    ariaLabel={`Wariant ${side === 'left' ? 'A' : 'B'}: ${round.long} plus ${round.short}`}
                  />
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-4 p-4 text-center text-sm leading-relaxed',
                picked === correctSide
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <strong>{picked === correctSide ? 'Dobrze! ' : 'Prawie. '}</strong>
              Cyfra jedności liczby {round.short} musi stanąć pod cyfrą jedności liczby {round.long}
              — dopiero wtedy reszta kolumn się zgadza.
            </motion.div>
          )}

          {picked !== null && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>{index + 1 < ROUNDS.length ? 'Następna runda' : 'Zakończ'}</Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
