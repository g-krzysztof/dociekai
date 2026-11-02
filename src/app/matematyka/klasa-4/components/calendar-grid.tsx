'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  MONTH_NAMES,
  WEEKDAY_SHORT,
  daysInMonth,
  firstWeekdayOfMonth,
  type CalendarDayState,
} from '../lib/calendar';

interface CalendarGridProps {
  color: string;
  monthIndex: number;
  year: number;
  /** Puste = zwykła, nieoznaczona siatka. Wypełnione przez rodzica po kliknięciu „Policz" — samo pojawienie się elementów animuje `<AnimatePresence>`. */
  days?: CalendarDayState[];
}

/**
 * Prawdziwa siatka kalendarza jednego miesiąca, z poprawnym przesunięciem
 * pierwszego dnia względem dni tygodnia (`firstWeekdayOfMonth` — czysta
 * arytmetyka całkowitoliczbowa na dacie, bez ryzyka niezgodności
 * SSR/hydracja, jakie miało trygonometryczne `polarPoint` w `<ClockFace>`).
 * Dumny komponent prezentacyjny — to rodzic decyduje, kiedy przekazać `days`,
 * więc „odsłonięcie" liczenia to zwykłe domontowanie elementów przez
 * `AnimatePresence`, ten sam mechanizm co w `<DealerBoard>`. Promowany tu ze
 * `components/guides/kalendarz/` w chwili, gdy lekcja
 * `obliczenia-kalendarzowe` (`<CalendarTrail>`) stała się jego drugim
 * konsumentem — ten sam precedens „promocji przy drugim użyciu" co przy
 * `<NumberLine>`/`<FactTriangle>`/`<ClockFace>`.
 */
export function CalendarGrid({ color, monthIndex, year, days = [] }: CalendarGridProps) {
  const total = daysInMonth(monthIndex, year);
  const leading = firstWeekdayOfMonth(monthIndex, year);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const stateFor = (day: number) => days.find((d) => d.day === day);

  return (
    <div className="border p-3 sm:p-4" style={{ borderColor: `${color}40` }}>
      <p className="mb-3 text-center text-sm font-bold capitalize" style={{ color: textColor }}>
        {MONTH_NAMES[monthIndex]} {year}
      </p>
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_SHORT.map((day) => (
          <span
            key={day}
            className="text-center text-[10px] font-semibold uppercase text-muted-foreground sm:text-xs"
          >
            {day}
          </span>
        ))}
        {Array.from({ length: leading }, (_, i) => (
          <span key={`empty-${i}`} aria-hidden />
        ))}
        {Array.from({ length: total }, (_, i) => {
          const day = i + 1;
          const state = stateFor(day);
          return (
            <div key={day} className="flex aspect-square items-center justify-center">
              <AnimatePresence>
                {state ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: state.kind === 'range' ? day * 0.015 : 0,
                      type: 'spring',
                      stiffness: 320,
                      damping: 22,
                    }}
                    className={cn(
                      'flex h-full w-full items-center justify-center rounded-full font-mono text-xs font-bold tabular-nums sm:text-sm',
                      state.kind === 'target' && 'text-white'
                    )}
                    style={{
                      backgroundColor:
                        state.kind === 'target'
                          ? color
                          : state.kind === 'range'
                            ? `${color}26`
                            : 'transparent',
                      border: state.kind === 'start' ? `2px solid ${color}` : undefined,
                      color: state.kind === 'start' ? textColor : undefined,
                    }}
                  >
                    {day}
                  </motion.span>
                ) : (
                  <span className="font-mono text-xs tabular-nums text-muted-foreground/50 sm:text-sm">
                    {day}
                  </span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
