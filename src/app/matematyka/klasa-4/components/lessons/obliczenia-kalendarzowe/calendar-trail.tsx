'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { CalendarGrid } from '../../calendar-grid';
import {
  MONTH_NAMES,
  daysInMonth,
  formatWeeksAndDays,
  fromMonthHighlight,
  toMonthHighlight,
  withinMonthHighlight,
  type DateJump,
} from '../../../lib/calendar';

interface CalendarTrailProps {
  color: string;
  fromDay: number;
  fromMonthIndex: number;
  toDay: number;
  year: number;
  jumps: DateJump[];
  revealedCount: number;
  ariaLabel?: string;
}

/**
 * Trzeci widget „doliczania” w kursie, po `<JumpLine>` (otwarta oś liczbowa,
 * Moduł 1) i `<ClockJumps>` (okrągła tarcza zegara) — teraz po prawdziwym
 * kalendarzu. Nowość względem obu poprzedników: tam każda jednostka miała
 * stałą długość (skok godzinowy zawsze = 60 minut), więc serię skoków dało
 * się w razie potrzeby zastąpić jednym mnożeniem. Miesiąc nie ma jednej
 * stałej liczby dni (28–31), więc `buildDateJumps` (lib/calendar.ts) nie
 * może tego zrobić — środkowe skoki to zawsze osobna pozycja na każdy cały
 * miesiąc. Brzegowe, częściowo pokryte miesiące renderują się jako
 * prawdziwa, klikalna siatka (`<CalendarGrid>`, promowana tu z przewodnika
 * `przewodnik-kalendarz`), a każdy cały miesiąc pomiędzy — jako zwarty kafel
 * z liczbą dni, bez rysowania 28–31 pojedynczych komórek, które i tak nie
 * niosłyby żadnej nowej informacji. Po odsłonięciu wszystkich skoków suma
 * dni zamienia się na żywo w zapis „W tygodni i D dni”
 * (`formatWeeksAndDays`) — spinając tę lekcję z dzieleniem z resztą
 * z Modułu 1.
 */
export function CalendarTrail({
  color,
  fromDay,
  fromMonthIndex,
  toDay,
  year,
  jumps,
  revealedCount,
  ariaLabel,
}: CalendarTrailProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const total = jumps.slice(0, revealedCount).reduce((sum, j) => sum + j.deltaDays, 0);
  const finished = revealedCount === jumps.length && jumps.length > 0;

  const stopFor = (jump: DateJump, revealed: boolean) => {
    if (jump.kind === 'within-month') {
      return (
        <CalendarGrid
          color={color}
          monthIndex={jump.monthIndex}
          year={year}
          days={revealed ? withinMonthHighlight(fromDay, toDay) : [{ day: fromDay, kind: 'start' }]}
        />
      );
    }
    if (jump.kind === 'to-month-end') {
      return (
        <CalendarGrid
          color={color}
          monthIndex={jump.monthIndex}
          year={year}
          days={revealed ? fromMonthHighlight(fromDay, fromMonthIndex, year) : [{ day: fromDay, kind: 'start' }]}
        />
      );
    }
    if (jump.kind === 'into-month') {
      return (
        <CalendarGrid
          color={color}
          monthIndex={jump.monthIndex}
          year={year}
          days={revealed ? toMonthHighlight(toDay) : []}
        />
      );
    }
    return (
      <div
        className="flex aspect-[4/5] w-[9.5rem] flex-col items-center justify-center gap-1 border-2 p-3 text-center transition-colors sm:w-44"
        style={{
          borderColor: revealed ? color : `${color}40`,
          backgroundColor: revealed ? `${color}1f` : 'transparent',
        }}
      >
        <span className="text-xs font-semibold text-muted-foreground">cały miesiąc</span>
        <span
          className="text-lg font-bold capitalize sm:text-xl"
          style={{ color: revealed ? textColor : undefined }}
        >
          {MONTH_NAMES[jump.monthIndex]}
        </span>
        <span
          className="font-mono text-2xl font-black tabular-nums sm:text-3xl"
          style={{ color: revealed ? color : `${color}80` }}
        >
          {daysInMonth(jump.monthIndex, year)}
        </span>
        <span className="text-xs text-muted-foreground">dni</span>
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-2" aria-label={ariaLabel} role="img">
        {jumps.map((jump, i) => {
          const revealed = i < revealedCount;
          const isLast = i === jumps.length - 1;
          return (
            <div key={jump.id} className="flex items-center gap-2">
              {stopFor(jump, revealed)}
              <div className="flex min-w-[2.5rem] flex-col items-center px-0.5">
                <AnimatePresence>
                  {revealed && (
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-0.5 whitespace-nowrap font-mono text-xs font-bold tabular-nums sm:text-sm"
                      style={{ color: textColor }}
                    >
                      {jump.shortLabel}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!isLast && (
                  <ArrowRight
                    className="h-4 w-4 shrink-0"
                    style={{ color: revealed ? color : `${color}40` }}
                    aria-hidden
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 min-h-[2.5rem] text-center">
        <AnimatePresence mode="wait">
          {revealedCount > 0 && (
            <motion.p
              key={revealedCount}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-base font-bold tabular-nums sm:text-lg"
              style={{ color: finished ? color : textColor }}
            >
              {finished ? (
                <>
                  Razem {total} {total === 1 ? 'dzień' : 'dni'} = {formatWeeksAndDays(total)}
                </>
              ) : (
                <>Razem {total} {total === 1 ? 'dzień' : 'dni'}…</>
              )}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
