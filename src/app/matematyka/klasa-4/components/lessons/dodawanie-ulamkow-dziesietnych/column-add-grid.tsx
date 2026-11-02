'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DecimalAddColumn, DecimalAddition } from '../../../lib/decimal-addition';

interface ColumnAddGridProps {
  addition: DecimalAddition;
  color: string;
  /** Ile kolumn (z `addition.columns`, licząc od prawej) ma odsłonięty wynik. */
  revealed: number;
  /** Dopisane zera wyrównujące pokazane od razu jako wyszarzone „0" (tryb pokazowy). */
  showAllZeros?: boolean;
  /** Tryb „dopisz zera": puste komórki krótszej liczby są klikalnymi „+". */
  zeroFill?: {
    filled: Set<string>;
    onFill: (cell: string) => void;
  };
  /** Tryb „dodaj kolumnami": następna nieodsłonięta kolumna jest klikalna. */
  onRevealNext?: () => void;
}

const CELL = 'flex h-12 w-9 items-center justify-center font-mono text-xl font-bold tabular-nums sm:h-14 sm:w-11 sm:text-2xl';

/**
 * Wspólny obraz dodawania pisemnego ułamków dziesiętnych — składniki jeden pod
 * drugim, przecinek pod przecinkiem, kreska i wiersz wyniku odsłaniany kolumna
 * po kolumnie. Reużywany przez „Nowe pojęcie", rozpisane przykłady i zadanie
 * problemowe, więc wszystkie trzy mówią tym samym językiem wizualnym.
 */
export function ColumnAddGrid({
  addition,
  color,
  revealed,
  showAllZeros = false,
  zeroFill,
  onRevealNext,
}: ColumnAddGridProps) {
  const wholeCols = addition.columns
    .filter((column) => column.section === 'whole')
    .sort((a, b) => b.placeIndex - a.placeIndex);
  const fracCols = addition.columns
    .filter((column) => column.section === 'fraction')
    .sort((a, b) => a.placeIndex - b.placeIndex);

  const compIndexOf = (column: DecimalAddColumn) => addition.columns.indexOf(column);
  /** Kolumna do stuknięcia w trybie interaktywnym — pierwsza jeszcze nieodsłonięta, od prawej. */
  const nextComp = revealed < addition.columns.length ? revealed : -1;

  const renderDigitCell = (
    column: DecimalAddColumn,
    row: 'A' | 'B'
  ) => {
    const isPadded = row === 'A' ? column.topIsPadded : column.bottomIsPadded;
    const digit = row === 'A' ? column.topDigit : column.bottomDigit;
    const cellKey = `${row}-${column.placeIndex}`;
    const canFill = Boolean(zeroFill) && isPadded && !zeroFill!.filled.has(cellKey);
    const showZero = isPadded && (showAllZeros || zeroFill?.filled.has(cellKey));

    if (canFill) {
      return (
        <button
          key={cellKey}
          type="button"
          onClick={() => zeroFill!.onFill(cellKey)}
          aria-label={`Dopisz zero w rzędzie: ${column.label}`}
          className={cn(CELL, 'cursor-pointer border-2 border-dashed transition-colors hover:bg-black/5 dark:hover:bg-white/10')}
          style={{ borderColor: `${color}59`, color }}
        >
          +
        </button>
      );
    }

    return (
      <span
        key={cellKey}
        className={cn(CELL, 'border')}
        style={{
          borderColor: `${color}33`,
          color: isPadded && showZero ? 'var(--muted-foreground)' : color,
        }}
      >
        {isPadded ? (showZero ? 0 : '') : digit}
      </span>
    );
  };

  const renderResultCell = (column: DecimalAddColumn) => {
    const comp = compIndexOf(column);
    const isRevealed = comp < revealed;
    const isNext = comp === nextComp;

    if (isRevealed) {
      return (
        <motion.span
          key={`R-${column.section}-${column.placeIndex}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(CELL, 'border-2')}
          style={{ borderColor: color, backgroundColor: `${color}14`, color }}
        >
          {column.resultDigit}
        </motion.span>
      );
    }

    if (isNext && onRevealNext) {
      return (
        <button
          key={`R-${column.section}-${column.placeIndex}`}
          type="button"
          onClick={onRevealNext}
          aria-label={`Dodaj kolumnę: ${column.label}`}
          className={cn(CELL, 'animate-pulse cursor-pointer border-2 border-dashed transition-colors hover:bg-black/5 dark:hover:bg-white/10')}
          style={{ borderColor: color, color }}
        >
          +
        </button>
      );
    }

    return (
      <span
        key={`R-${column.section}-${column.placeIndex}`}
        className={cn(CELL, 'border border-dashed')}
        style={{ borderColor: `${color}26` }}
      />
    );
  };

  /** Mała „1" przeniesienia nad kolumną — pojawia się, gdy kolumna po prawej już oddała przeniesienie. */
  const renderCarryCell = (column: DecimalAddColumn) => {
    // Przeniesienie WCHODZĄCE do tej kolumny = wychodzące z sąsiada po prawej.
    const comp = compIndexOf(column);
    const rightComp = comp - 1;
    const rightColumn = rightComp >= 0 ? addition.columns[rightComp] : null;
    const show = rightColumn && rightColumn.outgoingCarry === 1 && rightComp < revealed;
    const crosses = rightColumn?.carryCrossesComma;

    return (
      <span key={`C-${column.section}-${column.placeIndex}`} className="flex h-5 w-9 items-center justify-center sm:w-11">
        <AnimatePresence>
          {show && (
            <motion.span
              initial={{ opacity: 0, x: 10, y: 4 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                'font-mono text-xs font-bold leading-none',
                crosses && 'rounded-full px-1 py-0.5'
              )}
              style={
                crosses
                  ? { color: '#fff', backgroundColor: color }
                  : { color: `color-mix(in oklch, ${color} 80%, black)` }
              }
            >
              1
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    );
  };

  const comma = (
    <span className="flex w-4 items-center justify-center text-2xl font-black sm:text-3xl" style={{ color }} aria-hidden>
      ,
    </span>
  );
  const commaSpacer = <span className="w-4" aria-hidden />;

  return (
    <div className="mx-auto w-fit overflow-x-auto">
      {/* Nagłówki rzędów */}
      <div className="mb-1 flex items-end gap-1">
        {wholeCols.map((column) => (
          <span key={`H-w-${column.placeIndex}`} className="flex w-9 justify-center pb-1 text-[9px] font-bold uppercase leading-tight tracking-wide text-muted-foreground sm:w-11">
            {column.label}
          </span>
        ))}
        {commaSpacer}
        {fracCols.map((column) => (
          <span key={`H-f-${column.placeIndex}`} className="flex w-9 justify-center pb-1 text-[9px] font-bold uppercase leading-tight tracking-wide text-muted-foreground sm:w-11">
            {column.label}
          </span>
        ))}
      </div>

      {/* Wiersz przeniesień */}
      <div className="flex items-center gap-1">
        {wholeCols.map(renderCarryCell)}
        {commaSpacer}
        {fracCols.map(renderCarryCell)}
      </div>

      {/* Składnik A */}
      <div className="flex items-center gap-1">
        {wholeCols.map((column) => renderDigitCell(column, 'A'))}
        {comma}
        {fracCols.map((column) => renderDigitCell(column, 'A'))}
      </div>

      {/* Składnik B (z „+" z lewej) */}
      <div className="flex items-center gap-1">
        <span className="-ml-6 flex w-6 items-center justify-center text-2xl font-black sm:text-3xl" style={{ color }} aria-hidden>
          +
        </span>
        {wholeCols.map((column) => renderDigitCell(column, 'B'))}
        {comma}
        {fracCols.map((column) => renderDigitCell(column, 'B'))}
      </div>

      {/* Kreska */}
      <div className="my-1 h-[3px] w-full" style={{ backgroundColor: color }} aria-hidden />

      {/* Wynik */}
      <div className="flex items-center gap-1">
        {wholeCols.map(renderResultCell)}
        {comma}
        {fracCols.map(renderResultCell)}
      </div>
    </div>
  );
}
