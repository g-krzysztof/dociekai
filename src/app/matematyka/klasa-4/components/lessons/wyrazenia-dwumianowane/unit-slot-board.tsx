'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, Sparkles, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { DECIMAL_PLACES } from '../../../lib/decimal';
import {
  decimalDigits,
  formatCompound,
  formatDecimalWithUnit,
  getUnitPair,
  leadingZeroCount,
  placesFor,
  readCompound,
  type CompoundExpr,
} from '../../../lib/compound-unit';

interface Example {
  pairId: string;
  big: number;
  small: number;
}

/** 25 cm (bez pułapki) → 5 cm (zero z przodu) → 7 g (dwa zera, przelicznik 1000). */
const EXAMPLES: Example[] = [
  { pairId: 'm-cm', big: 3, small: 25 },
  { pairId: 'm-cm', big: 3, small: 5 },
  { pairId: 'kg-g', big: 1, small: 7 },
];

function exprOf(example: Example): CompoundExpr {
  return { pair: getUnitPair(example.pairId), big: example.big, small: example.small };
}

interface UnitSlotBoardProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: dziecko wpisuje liczbę mniejszej jednostki do tablicy
 * pozycyjnej, klikając kolumnę, w której ma stanąć jej OSTATNIA cyfra. Trafienie
 * tylko w skrajnie prawą kolumnę dopełnia brakujące miejsca zerami i odsłania
 * dwa odczyty tej samej wielkości. Klik w złą kolumnę = drgnięcie i zdanie
 * dlaczego, bez blokady.
 */
export function UnitSlotBoard({ color, onComplete }: UnitSlotBoardProps) {
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [wrongCol, setWrongCol] = useState<number | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${placed}-${finished}`);

  const example = EXAMPLES[index];
  const expr = exprOf(example);
  const { pair } = expr;
  const places = placesFor(pair.per);
  const digits = decimalDigits(expr);
  const zeros = leadingZeroCount(expr);
  const targetCol = places - 1;
  const lastPlaceSingular = DECIMAL_PLACES[places - 1].forms.one;
  const moduleTextColor = `color-mix(in oklch, ${color} 88%, black)`;
  const isLast = index === EXAMPLES.length - 1;

  const clickColumn = (col: number) => {
    if (placed) return;
    if (col === targetCol) {
      setPlaced(true);
      setWrongCol(null);
      return;
    }
    setWrongCol(col);
    setWrongAttempts((a) => a + 1);
  };

  const advance = () => {
    if (isLast) {
      setFinished(true);
      onComplete?.();
      return;
    }
    setIndex((i) => i + 1);
    setPlaced(false);
    setWrongCol(null);
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Sparkles className="mx-auto mb-4 h-9 w-9" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Masz regułę!</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Liczbę mniejszej jednostki wpisujesz <strong>od prawej strony</strong>, a puste miejsca z
          przodu dopełniasz zerami. Przelicznik (100 albo 1000) mówi, ile jest tych miejsc.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {EXAMPLES.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{EXAMPLES.length}
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
          <p className="mb-1 text-center text-sm text-muted-foreground">
            Zapisz w jednostce „{pair.big}” tę {pair.quantity}:
          </p>
          <p
            className="mb-5 text-center font-mono text-2xl font-black tabular-nums sm:text-3xl"
            style={{ color }}
          >
            {formatCompound(expr)}
          </p>

          {!placed && (
            <p className="mb-4 text-center text-sm leading-relaxed">
              1 {pair.big} = <strong>{pair.per}</strong> {pair.small}. Kliknij kolumnę, w której ma
              stanąć <strong>ostatnia cyfra liczby {example.small}</strong>.
            </p>
          )}

          {/* Tablica pozycyjna: kolumna jedności (dana z góry) + kolumny po przecinku */}
          <motion.div
            key={`row-${index}-${wrongAttempts}`}
            initial={wrongCol !== null && !placed ? { x: -6 } : false}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 900, damping: 12 }}
            className="mx-auto flex w-fit items-end gap-1"
          >
            <SlotColumn label="jedności" unitLabel={pair.big}>
              <span
                className="flex h-12 w-10 items-center justify-center font-mono text-2xl font-black tabular-nums sm:h-14 sm:w-12 sm:text-3xl"
                style={{ color }}
              >
                {expr.big}
              </span>
            </SlotColumn>

            <span className="pb-9 text-3xl font-black leading-none" style={{ color }} aria-hidden>
              ,
            </span>

            {Array.from({ length: places }).map((_, col) => {
              const name = DECIMAL_PLACES[col].name;
              const isTarget = col === targetCol;
              const isZeroFill = placed && col < zeros;

              return (
                <button
                  key={col}
                  type="button"
                  onClick={() => clickColumn(col)}
                  disabled={placed}
                  className="disabled:cursor-default"
                  aria-label={`Kolumna: ${name}`}
                >
                  <SlotColumn label={name} unitLabel={isTarget ? pair.small : undefined}>
                    <span
                      className={cn(
                        'flex h-12 w-10 items-center justify-center border font-mono text-xl font-black tabular-nums transition-colors sm:h-14 sm:w-12 sm:text-2xl',
                        !placed && 'border-dashed hover:bg-muted/50',
                        placed &&
                          isTarget &&
                          'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                      )}
                      style={
                        placed && !isTarget
                          ? { borderColor: `${color}40` }
                          : !placed
                            ? { borderColor: `${color}59` }
                            : undefined
                      }
                    >
                      {placed ? (
                        <span style={{ color: isZeroFill ? `${color}55` : moduleTextColor }}>
                          {digits[col]}
                        </span>
                      ) : (
                        ''
                      )}
                    </span>
                  </SlotColumn>
                </button>
              );
            })}
          </motion.div>

          {wrongCol !== null && !placed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-sm leading-relaxed text-amber-700 dark:text-amber-300"
            >
              Na rzędzie {DECIMAL_PLACES[wrongCol].name} liczba {example.small} znaczyłaby zupełnie
              co innego. {pair.small} to {lastPlaceSingular} część jednostki „{pair.big}” — wpisz{' '}
              {example.small} od prawej strony.
            </motion.p>
          )}

          {placed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 space-y-3 border-t pt-4"
            >
              <p className="text-center font-mono text-xl font-black tabular-nums sm:text-2xl">
                {formatCompound(expr)} <span className="text-muted-foreground">=</span>{' '}
                <span style={{ color }}>{formatDecimalWithUnit(expr)}</span>
              </p>
              <p className="flex items-start justify-center gap-2 text-center text-sm text-muted-foreground">
                <Volume2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                <span>{readCompound(expr)}</span>
              </p>
              {zeros > 0 && (
                <p className="text-center text-sm leading-relaxed">
                  Zwróć uwagę na <strong>{zeros === 1 ? 'zero' : 'zera'}</strong> z przodu — bez{' '}
                  {zeros === 1 ? 'niego' : 'nich'} liczba {example.small} skoczyłaby na zły rząd.
                </p>
              )}
              <div className="flex justify-end">
                <Button onClick={advance}>
                  {isLast ? 'Zakończ' : 'Następny przykład'}
                  {!isLast && <ChevronRight className="ml-1 h-4 w-4" />}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SlotColumn({
  label,
  unitLabel,
  children,
}: {
  label: string;
  unitLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <span className="flex flex-col items-center gap-1.5">
      <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
      <span className="h-4 text-[0.7rem] font-bold text-muted-foreground">{unitLabel ?? ''}</span>
    </span>
  );
}
