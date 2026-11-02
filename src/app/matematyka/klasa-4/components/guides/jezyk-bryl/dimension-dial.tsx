'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DimensionDialProps {
  label: string;
  value: number;
  min: number;
  max: number;
  color: string;
  onChange: (value: number) => void;
  className?: string;
}

/**
 * Suwak jednego wymiaru bryły, zatrzaskujący się na liczbach całkowitych.
 * Ten sam podział ról co w `PowerDial`: przeciąganie jest wygodą, a każde
 * nacięcie jest osobnym, klikalnym przyciskiem — i cały uchwyt mieści się
 * w prostokącie elementu łapiącego `onPointerDown`.
 */
export function DimensionDial({
  label,
  value,
  min,
  max,
  color,
  onChange,
  className,
}: DimensionDialProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const notches = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const updateFromEvent = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onChange(min + Math.round(ratio * (max - min)));
  };

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('select-none', className)}>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-lg font-black tabular-nums" style={{ color }}>
          {value}
        </span>
      </div>

      <div
        ref={trackRef}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
        className="relative h-10 cursor-pointer py-1.5 outline-none focus-visible:ring-2"
        style={{ touchAction: 'none', ['--tw-ring-color' as string]: color }}
        onPointerDown={(event) => {
          setDragging(true);
          (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
          updateFromEvent(event);
        }}
        onPointerMove={dragging ? updateFromEvent : undefined}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault();
            onChange(Math.min(max, value + 1));
          } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault();
            onChange(Math.max(min, value - 1));
          }
        }}
      >
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-muted" aria-hidden />

        {notches.map((notch, i) => (
          <button
            key={notch}
            type="button"
            tabIndex={-1}
            onClick={() => onChange(notch)}
            aria-label={`${label}: ${notch}`}
            aria-pressed={value === notch}
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-background"
            style={{ left: `${(i / (max - min)) * 100}%`, borderColor: color }}
          />
        ))}

        <motion.div
          className="pointer-events-none absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-background shadow-md"
          style={{ borderColor: color }}
          animate={{ left: `${percent}%` }}
          transition={dragging ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 26 }}
          aria-hidden
        >
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        </motion.div>
      </div>
    </div>
  );
}
