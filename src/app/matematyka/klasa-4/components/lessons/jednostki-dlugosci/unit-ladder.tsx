'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UnitLadderRung {
  code: string;
}

export interface UnitLadderProps {
  /** Szczeble drabinki, od najmniejszej do największej jednostki. */
  units: readonly UnitLadderRung[];
  /** Krotność między sąsiednimi szczeblami — patrz `stepRatio` w `lib/length.ts`/`lib/mass.ts`. */
  stepRatio: (lowerIndex: number) => number;
  color: string;
  startIndex: number;
  startValue: number;
  targetIndex: number;
  onReachTarget?: () => void;
}

function formatValue(value: number): string {
  const rounded = Math.round(value * 1000) / 1000;
  return rounded.toLocaleString('pl-PL');
}

/**
 * Szczebel ma stałą szerokość (`w-16` / `sm:w-20`), a wartość na nim potrafi
 * urosnąć o kilka rzędów wielkości — drabinka objętości dochodzi do
 * „1 000 000". Bez zjeżdżania w dół z rozmiarem czcionki taka liczba wylewa się
 * poza swój box i wchodzi na etykietę sąsiedniej strzałki (widoczne najpierw na
 * drabince pola, złapane dopiero na zrzucie z drabinki objętości).
 */
function valueSizeClass(text: string): string {
  if (text.length >= 10) return 'text-[9px] sm:text-[11px]';
  if (text.length >= 7) return 'text-[11px] sm:text-sm';
  return 'text-sm sm:text-base';
}

/**
 * Drabinka jednostek: wartość „wspina się" po słupkach krok po kroku,
 * klikając strzałkę między sąsiednimi słupkami. Aktywna jest zawsze tylko ta
 * jedna strzałka, która prowadzi w stronę celu — nie da się kliknąć źle,
 * tylko iść dalej albo czekać (ta sama filozofia co `<ExpressionSolver>` w
 * przewodniku o kolejności działań). Krotność między słupkami czyta z
 * `stepRatio` — dostarczonego z zewnątrz, nie zaszytego w komponencie, więc
 * ten sam widget obsługuje i drabinkę długości (jeden wyjątek ×1000 przy
 * m→km), i drabinkę masy (dwa wyjątki: dag→kg to ×100, kg→t to ×1000) —
 * druga lekcja korzystająca z tego komponentu po jego uogólnieniu.
 */
export function UnitLadder({
  units,
  stepRatio,
  color,
  startIndex,
  startValue,
  targetIndex,
  onReachTarget,
}: UnitLadderProps) {
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [value, setValue] = useState(startValue);
  const [lastGap, setLastGap] = useState<number | null>(null);
  const reachedRef = useRef(false);

  const direction: 1 | -1 = targetIndex >= startIndex ? 1 : -1;
  const reached = activeIndex === targetIndex;

  useEffect(() => {
    if (reached && !reachedRef.current) {
      reachedRef.current = true;
      onReachTarget?.();
    }
  }, [reached, onReachTarget]);

  const step = (gap: number) => {
    if (direction === 1) {
      setValue((v) => v / stepRatio(gap));
      setActiveIndex(gap + 1);
    } else {
      setValue((v) => v * stepRatio(gap));
      setActiveIndex(gap);
    }
    setLastGap(gap);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-stretch justify-center overflow-x-auto pb-1">
        {units.map((unit, i) => (
          <div key={unit.code} className="flex shrink-0 items-center">
            <div
              className={cn(
                'flex w-16 flex-col items-center gap-1 border-2 p-2 text-center sm:w-20',
                i === activeIndex ? '' : 'border-dashed'
              )}
              style={{
                borderColor: i === activeIndex ? color : `${color}40`,
                backgroundColor: i === activeIndex ? `${color}14` : undefined,
              }}
            >
              <span className="font-mono text-sm font-bold sm:text-base" style={{ color }}>
                {unit.code}
              </span>
              <div className="flex h-6 items-center justify-center">
                <AnimatePresence mode="wait">
                  {i === activeIndex && (
                    <motion.span
                      key={`${activeIndex}-${value}`}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'whitespace-nowrap font-mono font-black tabular-nums',
                        valueSizeClass(formatValue(value))
                      )}
                    >
                      {formatValue(value)}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {i < units.length - 1 && (
              <GapArrow
                gap={i}
                stepRatio={stepRatio}
                color={color}
                enabled={
                  direction === 1
                    ? activeIndex === i && i < targetIndex
                    : activeIndex === i + 1 && i + 1 > targetIndex
                }
                direction={direction}
                onClick={() => step(i)}
                justMoved={lastGap === i}
              />
            )}
          </div>
        ))}
      </div>

      {reached && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-1.5 text-center text-sm font-semibold"
          style={{ color }}
        >
          <Check className="h-4 w-4 shrink-0" aria-hidden />
          Dotarłeś/aś do celu: {formatValue(value)} {units[targetIndex].code}
        </motion.p>
      )}
    </div>
  );
}

function GapArrow({
  gap,
  stepRatio,
  color,
  enabled,
  direction,
  onClick,
  justMoved,
}: {
  gap: number;
  stepRatio: (lowerIndex: number) => number;
  color: string;
  enabled: boolean;
  direction: 1 | -1;
  onClick: () => void;
  justMoved: boolean;
}) {
  const ratio = stepRatio(gap);
  const label = `${direction === 1 ? '÷' : '×'} ${ratio.toLocaleString('pl-PL')}`;
  const Icon = direction === 1 ? ArrowRight : ArrowLeft;

  return (
    <div className="relative flex w-10 shrink-0 flex-col items-center justify-center gap-0.5 sm:w-12">
      <button
        type="button"
        onClick={onClick}
        disabled={!enabled}
        aria-label={`Przelicz na sąsiednią jednostkę: ${label}`}
        className={cn(
          'flex h-8 w-8 items-center justify-center border-2 transition-transform disabled:cursor-not-allowed',
          enabled && 'cursor-pointer hover:scale-110'
        )}
        style={{ borderColor: enabled ? color : `${color}30`, color: enabled ? color : `${color}70` }}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </button>
      <span
        className="text-[10px] font-bold tabular-nums sm:text-xs"
        style={{ color: enabled ? color : `${color}70` }}
      >
        {label}
      </span>
      <AnimatePresence>
        {justMoved && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.85 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none absolute -top-5 whitespace-nowrap text-[10px] font-bold"
            style={{ color }}
          >
            {label}!
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
