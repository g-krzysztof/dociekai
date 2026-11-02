'use client';

import { Footprints } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Szerokość jednego roku na drodze. */
export const TILE = 46;
/** Szczelina roku zero — wąska, ciemna, „pusta”. */
const GAP = 14;

/**
 * Droga piechura — pas lat przesuwany pod nieruchomym piechurem (zawsze na
 * środku). Lata przed naszą erą i po niej rozdziela szczelina roku zero;
 * piechur nad nią przeskakuje — `years` nie zawiera zera, więc krok z 1 p.n.e.
 * prowadzi prosto na 1 n.e. Bez pomiarów: środek kadru to `left: 50%`.
 */
export function DrogaPiechura({
  years,
  index,
  color,
  jumped,
  className,
}: {
  years: number[];
  /** Na którym roku (indeks w `years`) stoi piechur. */
  index: number;
  color: string;
  /** Piechur właśnie przeskoczył szczelinę — podświetl ją. */
  jumped?: boolean;
  className?: string;
}) {
  const gapAt = years.findIndex((y) => y > 0);
  const hasGap = gapAt > 0;
  const offset = index * TILE + (hasGap && index >= gapAt ? GAP : 0) + TILE / 2;

  return (
    <div className={cn('relative h-28 select-none overflow-hidden border bg-muted/20', className)}>
      {/* Piechur — stoi, a droga płynie pod nim. */}
      <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2" aria-hidden>
        <Footprints className="h-7 w-7" style={{ color }} />
      </div>
      <div
        className="absolute bottom-3 left-1/2 flex transition-transform duration-150 ease-out"
        style={{ transform: `translateX(${-offset}px)` }}
      >
        {years.map((y, i) => (
          <div key={y} className="flex">
            {hasGap && i === gapAt && (
              <div
                className={cn('flex h-14 flex-col items-center justify-end bg-foreground/80 transition-colors', jumped && 'bg-destructive')}
                style={{ width: GAP }}
                title="roku zero nie było"
              />
            )}
            <div
              className={cn(
                'flex h-14 flex-col items-center justify-center border-r text-center leading-none tabular-nums',
                i === index ? 'font-bold' : 'text-muted-foreground'
              )}
              style={{
                width: TILE,
                background: i === index ? `color-mix(in oklch, ${color} 22%, transparent)` : y < 0 ? 'var(--muted)' : undefined,
              }}
            >
              <span className="text-sm">{Math.abs(y)}</span>
              <span className="mt-1 text-[9px] italic">{y < 0 ? 'p.n.e.' : 'n.e.'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
