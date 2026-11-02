'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const NOTCHES = [-3, -2, -1, 0, 1, 2, 3] as const;
type Notch = (typeof NOTCHES)[number];

function labelOf(n: Notch): string {
  return n === 0 ? '×1' : n > 0 ? `×${10 ** n}` : `÷${10 ** -n}`;
}

export interface PowerDialProps {
  value: number;
  onChange: (value: number) => void;
  color: string;
  /** Wykładniki chwilowo niedostępne (np. dzielenie, które nie wyszłoby w całości). */
  disabled?: number[];
  className?: string;
}

function nearestEnabled(raw: number, disabled: number[]): number {
  const enabled = NOTCHES.filter((n) => !disabled.includes(n));
  return enabled.reduce(
    (closest, n) => (Math.abs(n - raw) < Math.abs(closest - raw) ? n : closest),
    enabled[0] ?? 0
  );
}

/**
 * Przeciągalny suwak zatrzaskujący się do siedmiu gotowych pozycji
 * (÷1000…×1000) — pokrętło wyboru operacji, nie ciągła wartość. Inny
 * mechanizm przeciągania niż w `ArrayGrid` (tam przeciąganie dzieli
 * powierzchnię na dwie części); tu wybiera jedną z kilku dyskretnych opcji,
 * jak suwak w mikserze. Każde nacięcie to też osobny, klikalny przycisk —
 * przeciąganie jest wygodą, nie jedynym sposobem sterowania.
 */
export function PowerDial({ value, onChange, color, disabled = [], className }: PowerDialProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const updateFromEvent = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const raw = -3 + ratio * 6;
    onChange(nearestEnabled(raw, disabled));
  };

  const index = NOTCHES.indexOf(value as Notch);
  const percent = (Math.max(0, index) / (NOTCHES.length - 1)) * 100;

  return (
    <div className={cn('select-none', className)}>
      <div
        ref={trackRef}
        className="relative h-9 cursor-pointer"
        style={{ touchAction: 'none' }}
        onPointerDown={(event) => {
          setDragging(true);
          (event.target as Element).setPointerCapture?.(event.pointerId);
          updateFromEvent(event);
        }}
        onPointerMove={dragging ? updateFromEvent : undefined}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-muted" aria-hidden />

        {NOTCHES.map((n, i) => {
          const isDisabled = disabled.includes(n);
          const left = (i / (NOTCHES.length - 1)) * 100;
          return (
            <button
              key={n}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onChange(n)}
              aria-label={labelOf(n)}
              aria-pressed={value === n}
              className={cn(
                'absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-background transition-opacity disabled:cursor-not-allowed',
                isDisabled && 'opacity-30'
              )}
              style={{ left: `${left}%`, borderColor: isDisabled ? undefined : color }}
            />
          );
        })}

        <motion.div
          className="absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-background shadow-md"
          style={{ borderColor: color }}
          animate={{ left: `${percent}%` }}
          transition={dragging ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 26 }}
          aria-hidden
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        </motion.div>
      </div>

      <div className="mt-2 flex justify-between font-mono text-[10px] font-bold tabular-nums text-muted-foreground sm:text-xs">
        {NOTCHES.map((n) => (
          <span
            key={n}
            className={cn(disabled.includes(n) && 'opacity-30 line-through')}
            style={n === value ? { color } : undefined}
          >
            {labelOf(n)}
          </span>
        ))}
      </div>
    </div>
  );
}
