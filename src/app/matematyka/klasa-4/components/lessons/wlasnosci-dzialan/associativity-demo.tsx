'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const A = 7;
const B = 8;
const C = 5;
const TOTAL = A + B + C;
const SCALE = 11;

interface AssociativityDemoProps {
  color: string;
  onComplete?: () => void;
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.div
        layout
        className="w-11 rounded-t-md"
        style={{ height: value * SCALE, backgroundColor: color }}
      />
      <span className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

/** Łączność dodawania: te same trzy liczby, dwa sposoby grupowania — zawsze ta sama suma. */
export function AssociativityDemo({ color, onComplete }: AssociativityDemoProps) {
  const [active, setActive] = useState<'left' | 'right' | null>(null);
  const [tried, setTried] = useState<Set<'left' | 'right'>>(new Set());

  const choose = (side: 'left' | 'right') => {
    setActive(side);
    const next = new Set(tried);
    next.add(side);
    setTried(next);
    if (next.size === 2) onComplete?.();
  };

  const equation =
    active === 'left'
      ? `(${A} + ${B}) + ${C} = ${A + B} + ${C} = ${TOTAL}`
      : active === 'right'
        ? `${A} + (${B} + ${C}) = ${A} + ${B + C} = ${TOTAL}`
        : `${A} + ${B} + ${C} = ?`;

  return (
    <div>
      <p className="mb-4 text-center font-mono text-xl font-black tabular-nums sm:text-2xl" style={{ color }}>
        {equation}
      </p>

      <div className="flex min-h-[160px] items-end justify-center gap-3 py-2">
        {active === 'left' ? (
          <>
            <div
              className="flex items-end gap-3 rounded-md border-2 p-2"
              style={{ borderColor: color, backgroundColor: `${color}0d` }}
            >
              <Bar value={A} color={color} />
              <Bar value={B} color={color} />
            </div>
            <Bar value={C} color={color} />
          </>
        ) : active === 'right' ? (
          <>
            <Bar value={A} color={color} />
            <div
              className="flex items-end gap-3 rounded-md border-2 p-2"
              style={{ borderColor: color, backgroundColor: `${color}0d` }}
            >
              <Bar value={B} color={color} />
              <Bar value={C} color={color} />
            </div>
          </>
        ) : (
          <>
            <Bar value={A} color={color} />
            <Bar value={B} color={color} />
            <Bar value={C} color={color} />
          </>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => choose('left')}
          className={cn(
            'border px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md',
            active === 'left' && 'font-bold'
          )}
          style={active === 'left' ? { borderColor: color, color } : undefined}
        >
          Grupuj pierwsze dwie: ({A} + {B}) + {C}
        </button>
        <button
          type="button"
          onClick={() => choose('right')}
          className={cn(
            'border px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md',
            active === 'right' && 'font-bold'
          )}
          style={active === 'right' ? { borderColor: color, color } : undefined}
        >
          Grupuj ostatnie dwie: {A} + ({B} + {C})
        </button>
      </div>

      {tried.size === 2 && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-3 text-center text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          Obie kolejności dają {TOTAL}. Nieważne, które dwie liczby zsumujesz najpierw.
        </motion.p>
      )}
    </div>
  );
}
