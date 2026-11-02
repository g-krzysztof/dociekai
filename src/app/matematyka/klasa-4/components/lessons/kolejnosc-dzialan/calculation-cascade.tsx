'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cog, PartyPopper, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface CascadeSegment {
  text: string;
  /** Ta część wyrażenia właśnie została policzona w tym kroku. */
  highlight?: boolean;
}

export interface CascadeStepData {
  segments: CascadeSegment[];
  note: string;
}

interface CalculationCascadeProps {
  steps: CascadeStepData[];
  color: string;
  ariaLabel: string;
  onComplete?: () => void;
  className?: string;
}

const STEP_DELAY_MS = 1150;

/**
 * "Maszyna licząca": jedno kliknięcie „Uruchom!" odsłania całą sekwencję
 * kroków samodzielnie, w rytmie, jeden wiersz na raz — dziecko nie klika
 * przez kolejne kroki (jak w `ExpressionSolver` z przewodnika), tylko
 * ogląda. Każdy krok ZOSTAJE na ekranie (nie wymienia poprzedniego), łączony
 * pionową kreską — buduje się widoczna historia całego obliczenia od góry do
 * dołu. Nowo odsłonięty wiersz dostaje pierścień światła (`ring burst`,
 * rozszerzające się i gasnące kółko w tle), a w trakcie odtwarzania obraca
 * się małe kółko zębate — czysto dekoracyjne, ale to właśnie ten "wow"
 * moment lekcji: pierwsza w kursie w pełni wyreżyserowana, samogrająca
 * sekwencja zamiast scrolla, kliknięcia czy przeciągania.
 */
export function CalculationCascade({ steps, color, ariaLabel, onComplete, className }: CalculationCascadeProps) {
  const [revealed, setRevealed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const scheduleNext = (next: number) => {
    timeoutRef.current = setTimeout(() => {
      setRevealed(next);
      if (next < steps.length) {
        scheduleNext(next + 1);
      } else {
        setPlaying(false);
        onComplete?.();
      }
    }, STEP_DELAY_MS);
  };

  const start = () => {
    setPlaying(true);
    setRevealed(1);
    scheduleNext(2);
  };

  const reset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPlaying(false);
    setRevealed(0);
  };

  const done = revealed >= steps.length && steps.length > 0;

  return (
    <div className={cn('flex flex-col items-center gap-3', className)} role="img" aria-label={ariaLabel}>
      {revealed === 0 && (
        <Button onClick={start} size="lg" className="gap-2">
          <Play className="h-4 w-4" fill="currentColor" aria-hidden />
          Uruchom obliczenie
        </Button>
      )}

      <div className="flex w-full max-w-lg flex-col items-center">
        <AnimatePresence>
          {steps.slice(0, revealed).map((step, i) => {
            const isLatest = i === revealed - 1;
            const isFinal = done && i === steps.length - 1;

            return (
              <div key={i} className="flex flex-col items-center">
                {i > 0 && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.3 }}
                    className="h-6 w-px origin-top"
                    style={{ backgroundColor: `${color}55` }}
                    aria-hidden
                  />
                )}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className={cn(
                    'relative mb-1 w-full border bg-white px-5 py-3 text-center dark:bg-zinc-900/80 sm:px-6 sm:py-4',
                    isFinal && 'border-2'
                  )}
                  style={{ borderColor: isFinal ? color : `${color}40` }}
                >
                  {isLatest && (
                    <motion.span
                      aria-hidden
                      initial={{ opacity: 0.6, scale: 0.6 }}
                      animate={{ opacity: 0, scale: isFinal ? 2.6 : 2.1 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="pointer-events-none absolute inset-0"
                      style={{ backgroundColor: `${color}33` }}
                    />
                  )}
                  <p className="relative font-mono text-xl font-black tabular-nums sm:text-2xl">
                    {step.segments.map((segment, si) => (
                      <span
                        key={si}
                        className={!segment.highlight ? 'text-muted-foreground' : undefined}
                        style={segment.highlight ? { color } : undefined}
                      >
                        {segment.text}
                      </span>
                    ))}
                  </p>
                  <p className="relative mt-1 text-xs text-muted-foreground sm:text-sm">{step.note}</p>
                </motion.div>
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {playing && !done && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
          aria-hidden
        >
          <Cog className="h-6 w-6" style={{ color: `${color}99` }} />
        </motion.div>
      )}

      {done && (
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color }}>
            <PartyPopper className="h-4 w-4" aria-hidden />
            Gotowe!
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            Od nowa
          </button>
        </div>
      )}
    </div>
  );
}
