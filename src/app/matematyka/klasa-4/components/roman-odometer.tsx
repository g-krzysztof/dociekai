'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RomanOdometerProps {
  value: number;
  /** Liczba kolumn cyfr — dopełniane zerami z przodu, jak w prawdziwym liczniku. */
  digits?: number;
  color: string;
  label?: string;
  className?: string;
}

/**
 * Mechaniczny licznik cyfrowy (jak stary licznik kilometrów w samochodzie) —
 * każda cyfra to osobny „bębenek", który się przekręca w górę lub w dół przy
 * zmianie wartości. Pierwsza w kursie animacja, w której porusza się sama
 * liczba, a nie kształt na SVG — użyj jej wszędzie tam, gdzie warto pokazać
 * narastającą/malejącą wartość na żywo (nie tylko przy liczbach rzymskich).
 */
export function RomanOdometer({ value, digits = 4, color, label, className }: RomanOdometerProps) {
  const max = 10 ** digits - 1;
  const safeValue = Math.max(0, Math.min(max, Math.round(value)));
  const text = String(safeValue).padStart(digits, '0');
  const prevValueRef = useRef(safeValue);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (safeValue !== prevValueRef.current) {
      setDirection(safeValue > prevValueRef.current ? 1 : -1);
      prevValueRef.current = safeValue;
    }
  }, [safeValue]);

  return (
    <div className={cn('inline-flex flex-col items-center gap-1.5', className)}>
      <div
        className="flex items-stretch gap-[1px] border-2 bg-zinc-950 px-3 py-2"
        style={{ borderColor: color, boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)' }}
        role="status"
        aria-live="polite"
        aria-label={`${label ? `${label}: ` : ''}${safeValue}`}
      >
        {text.split('').map((char, i) => (
          <span
            key={i}
            className="relative inline-block h-[1.15em] w-[0.68em] overflow-hidden text-center font-mono text-3xl font-black leading-[1.15em] text-white tabular-nums sm:text-4xl"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={char}
                initial={{ y: direction > 0 ? '100%' : '-100%' }}
                animate={{ y: '0%' }}
                exit={{ y: direction > 0 ? '-100%' : '100%' }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="absolute inset-0"
                aria-hidden
              >
                {char}
              </motion.span>
            </AnimatePresence>
          </span>
        ))}
      </div>
      {label && (
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
