'use client';

import { useMemo } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { scaleDecimal, type ScalingOp } from '../../../lib/decimal-scaling';

interface ScaleShiftMiniProps {
  input: string;
  op: ScalingOp;
  color: string;
}

const STRIDE = 34;
const GAP = 3;

/**
 * Mały, nieinteraktywny obraz przeskoku przecinka — podpowiedź „gdzie stanie
 * przecinek i które zera dochodzą" nad zadaniem w ćwiczeniach.
 */
export function ScaleShiftMini({ input, op, color }: ScaleShiftMiniProps) {
  const scaling = useMemo(() => scaleDecimal(input, op), [input, op]);
  const rowWidth = scaling.cells.length * STRIDE + (scaling.cells.length - 1) * GAP;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex justify-center overflow-x-auto">
        <div className="relative" style={{ width: rowWidth }}>
          {/* Przecinek przed przeskokiem — wyszarzony, na linii cyfr */}
          {scaling.commaFrom < scaling.cells.length && (
            <span
              className="pointer-events-none absolute left-0 top-0 flex h-10 w-3 items-center justify-center text-lg font-black leading-none text-muted-foreground/50"
              style={{ transform: `translateX(${scaling.commaFrom * (STRIDE + GAP) - 6}px)` }}
              aria-hidden
            >
              ,
            </span>
          )}
          {/* Przecinek po przeskoku — znika, gdy wynik jest całkowity */}
          {scaling.commaTo < scaling.cells.length && (
            <span
              className="pointer-events-none absolute left-0 top-0 z-10 flex h-10 w-3 items-center justify-center text-lg font-black leading-none"
              style={{ color, transform: `translateX(${scaling.commaTo * (STRIDE + GAP) - 6}px)` }}
              aria-hidden
            >
              ,
            </span>
          )}
          <div className="flex gap-[3px]">
            {scaling.cells.map((cell, i) => (
              <span
                key={i}
                className={cn(
                  'flex h-10 w-[34px] items-center justify-center border font-mono text-lg font-bold tabular-nums',
                  cell.added && 'border-2'
                )}
                style={{
                  borderColor: cell.added ? color : `${color}33`,
                  backgroundColor: cell.added ? `${color}14` : undefined,
                  color: cell.added ? color : `color-mix(in oklch, ${color} 92%, black)`,
                }}
              >
                {cell.char}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color }}>
        {scaling.direction === 'right' ? (
          <ArrowRight className="h-3 w-3" aria-hidden />
        ) : (
          <ArrowLeft className="h-3 w-3" aria-hidden />
        )}
        przecinek o {scaling.hops} {scaling.direction === 'right' ? 'w prawo' : 'w lewo'}
      </p>
    </div>
  );
}
