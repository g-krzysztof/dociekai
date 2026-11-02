'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CornerLeftUp, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Miejsce zaokrąglenia: 1 = dziesiątki, 2 = setki, 3 = tysiące. */
export type RoundingPlace = 1 | 2 | 3;

export const PLACE_GENITIVE: Record<RoundingPlace, string> = {
  1: 'dziesiątek',
  2: 'setek',
  3: 'tysięcy',
};

const COLUMN_LABEL: Record<number, string> = {
  0: 'jedn.',
  1: 'dzies.',
  2: 'set.',
  3: 'tys.',
  4: 'dz. tys.',
  5: 'set. tys.',
};

export function roundToPlace(value: number, place: RoundingPlace): number {
  const unit = 10 ** place;
  return Math.round(value / unit) * unit;
}

interface DigitFrame {
  /** Cyfry liczby w danym kroku animacji, indeksowane rzędem wielkości (0 = jedności). */
  digits: Record<number, number>;
  highlightExponent: number | null;
  /** Rząd, który właśnie „przeniósł" 1 dalej (9 → 0) — tu pokazujemy strzałkę przeniesienia. */
  carryExponent: number | null;
  caption: string;
}

function digitsFromValue(value: number): Record<number, number> {
  const str = String(value);
  const digits: Record<number, number> = {};
  for (let i = 0; i < str.length; i++) {
    digits[str.length - 1 - i] = Number(str[i]);
  }
  return digits;
}

/**
 * Rozgrywa zaokrąglenie krok po kroku: podświetla cyfrę decydującą, a przy
 * zaokrąglaniu w górę pokazuje kaskadę przeniesień (9 → 0, przenosimy 1 dalej)
 * dokładnie tak długo, jak jest potrzebna — łącznie z sytuacją, gdy liczba
 * „urasta" o nową cyfrę z przodu (950 → 1000). Klatki liczone są z reguły
 * matematycznej, nie wpisane ręcznie dla każdej liczby.
 */
function buildFrames(value: number, place: RoundingPlace): DigitFrame[] {
  const digits = digitsFromValue(value);
  const decisionExp = place - 1;
  const decisionDigit = digits[decisionExp] ?? 0;
  const roundUp = decisionDigit >= 5;

  const frames: DigitFrame[] = [
    { digits: { ...digits }, highlightExponent: null, carryExponent: null, caption: `Liczba do zaokrąglenia: ${value}` },
    {
      digits: { ...digits },
      highlightExponent: decisionExp,
      carryExponent: null,
      caption: roundUp
        ? `Cyfra ${decisionDigit} ≥ 5 → zaokrąglamy w górę`
        : `Cyfra ${decisionDigit} < 5 → zaokrąglamy w dół`,
    },
  ];

  if (roundUp) {
    let exp = place;
    let carrying = true;
    while (carrying) {
      const current = digits[exp] ?? 0;
      const next = current + 1;
      if (next === 10) {
        digits[exp] = 0;
        frames.push({
          digits: { ...digits },
          highlightExponent: exp,
          carryExponent: exp,
          caption: `${current} + 1 = 10 → zapisujemy 0, przenosimy 1 na kolejne miejsce`,
        });
        exp += 1;
        carrying = true;
      } else {
        digits[exp] = next;
        frames.push({
          digits: { ...digits },
          highlightExponent: exp,
          carryExponent: null,
          caption: `${current} + 1 = ${next}`,
        });
        carrying = false;
      }
    }
  }

  for (let e = 0; e < place; e++) digits[e] = 0;
  const finalValue = roundToPlace(value, place);
  frames.push({ digits: { ...digits }, highlightExponent: null, carryExponent: null, caption: `Wynik: ${value} → ${finalValue}` });

  return frames;
}

const STEP_DELAY_MS = 950;

export interface RoundingMachineProps {
  value: number;
  place: RoundingPlace;
  color: string;
  ariaLabel: string;
  onSettle?: (result: number) => void;
  /** Blokuje start animacji, dopóki nie stanie się `false` (np. zanim dziecko zgadnie). */
  disabled?: boolean;
  className?: string;
}

export function RoundingMachine({
  value,
  place,
  color,
  ariaLabel,
  onSettle,
  disabled = false,
  className,
}: RoundingMachineProps) {
  const frames = useRef(buildFrames(value, place)).current;
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const scheduleNext = (next: number) => {
    timeoutRef.current = setTimeout(() => {
      setFrameIndex(next);
      if (next < frames.length - 1) {
        scheduleNext(next + 1);
      } else {
        setPlaying(false);
        onSettle?.(roundToPlace(value, place));
      }
    }, STEP_DELAY_MS);
  };

  const start = () => {
    if (playing || frameIndex > 0) return;
    setPlaying(true);
    scheduleNext(1);
  };

  const reset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPlaying(false);
    setFrameIndex(0);
  };

  const frame = frames[frameIndex];
  const settled = frameIndex === frames.length - 1;
  const maxExponent = Math.max(...frames.flatMap((f) => Object.keys(f.digits).map(Number)));
  const columns = Array.from({ length: maxExponent + 1 }, (_, i) => maxExponent - i);

  return (
    <div className={cn('flex flex-col items-center gap-4', className)} role="img" aria-label={ariaLabel}>
      <div className="flex items-end gap-1.5 sm:gap-2">
        {columns.map((exp) => {
          const digit = frame.digits[exp];
          const isDropped = exp < place && settled;
          const isHighlighted = frame.highlightExponent === exp;
          const showCarryBadge = frame.carryExponent === exp;
          const wasBornThisFrame = digit !== undefined && frames[Math.max(0, frameIndex - 1)]?.digits[exp] === undefined;

          return (
            <div key={exp} className="relative flex flex-col items-center">
              <AnimatePresence>
                {showCarryBadge && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.7 }}
                    animate={{ opacity: 1, y: -30, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute -top-1 flex items-center gap-0.5 whitespace-nowrap text-[10px] font-bold sm:text-xs"
                    style={{ color }}
                  >
                    <CornerLeftUp className="h-3 w-3" aria-hidden />
                    +1 dalej
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className={cn(
                  'relative flex h-12 w-10 items-center justify-center border-2 font-mono text-xl font-black tabular-nums transition-colors sm:h-14 sm:w-12 sm:text-2xl',
                  isDropped && 'opacity-40'
                )}
                style={{
                  borderColor: isHighlighted ? color : `${color}33`,
                  backgroundColor: isHighlighted ? `${color}14` : undefined,
                }}
              >
                <AnimatePresence mode="popLayout">
                  {digit !== undefined && (
                    <motion.span
                      key={`${exp}-${digit}`}
                      initial={wasBornThisFrame ? { opacity: 0, scale: 0.4 } : { opacity: 0, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.28 }}
                    >
                      {digit}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isHighlighted && !settled && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    initial={{ opacity: 0.5, scale: 0.7 }}
                    animate={{ opacity: 0, scale: 1.7 }}
                    transition={{ duration: 0.6 }}
                    style={{ backgroundColor: `${color}33` }}
                  />
                )}
              </div>
              <span className="mt-1 text-[9px] font-semibold text-muted-foreground sm:text-[10px]">
                {COLUMN_LABEL[exp] ?? ''}
              </span>
            </div>
          );
        })}
      </div>

      <p className="min-h-[2.5rem] max-w-xs text-center text-sm leading-snug text-muted-foreground sm:max-w-sm sm:text-base">
        {frame.caption}
      </p>

      {frameIndex === 0 && (
        <Button onClick={start} size="sm" disabled={disabled} className="gap-2">
          <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
          Zaokrąglij
        </Button>
      )}

      {settled && (
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <RotateCcw className="h-3 w-3" aria-hidden />
          Od nowa
        </button>
      )}
    </div>
  );
}
