'use client';

import { Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WEEKDAY_FULL, WEEKDAY_SHORT, humanDate } from '@/lib/streak/school-calendar';
import type { DayCell, DayState } from '@/lib/streak/types';

/**
 * Pasek tygodnia — obiekt, który powtarza się w całym serwisie: na hubie kursu,
 * na karcie końcowej lekcji i w arkuszu rytmu w profilu. Zmienia się tylko
 * rozmiar kratki, nigdy znaczenie, więc dziecko uczy się go raz.
 *
 * Żaden stan nie jest rozpoznawalny wyłącznie po kolorze: zaliczony jest pełny,
 * zamrożony ma płatek śniegu, opuszczony ma kreskę, dzisiejszy ma przerywany
 * obrys i znacznik pod spodem.
 */

const STATE_LABEL: Record<DayState, string> = {
  done: 'zaliczony',
  frozen: 'uratowany zamrażarką',
  missed: 'bez lekcji',
  rest: 'dzień wolny',
  pending: 'dziś, jeszcze bez lekcji',
  blank: 'przed Tobą',
};

interface WeekStripProps {
  days: DayCell[];
  /** Dzisiejsza data — kratka dostaje znacznik pozycji. */
  today?: string;
  /** Bok kratki w pikselach. */
  cell?: number;
  gap?: number;
  /** Podpisy Pn–Nd nad kratkami. */
  labels?: boolean;
  /** Kratka, która ma się zapalić — moment ukończenia lekcji. */
  ignite?: string;
  /** Własny opis dla czytnika ekranu; domyślnie powstaje z dni. */
  label?: string;
  className?: string;
}

function describe(days: DayCell[]): string {
  return days
    .map((day, index) => `${WEEKDAY_FULL[index] ?? humanDate(day.date)} ${STATE_LABEL[day.state]}`)
    .join(', ');
}

export function WeekStrip({
  days,
  today,
  cell = 16,
  gap = 4,
  labels = false,
  ignite,
  label,
  className,
}: WeekStripProps) {
  return (
    <div
      className={cn('flex items-end', className)}
      style={{ gap, '--cell': `${cell}px` } as React.CSSProperties}
      role="img"
      aria-label={label ?? `Ten tydzień: ${describe(days)}.`}
    >
      {days.map((day, index) => (
        <div
          key={day.date}
          className="flex flex-col items-center"
          // Weekend odsuwa się od dni nauki — to nie jest ta sama kategoria czasu.
          style={index === 5 ? { marginInlineStart: gap * 1.5 } : undefined}
        >
          {labels && (
            <span
              // Kolor z `currentColor`, nie z `--muted-foreground`: ten sam pasek
              // stoi w ciepłym świecie kursu i w chłodnym świecie Atlasu, więc
              // musi brać barwę od otoczenia, a nie wnosić własną.
              className={cn(
                'mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] tabular-nums',
                index >= 5 ? 'opacity-40' : 'opacity-65'
              )}
              aria-hidden
            >
              {WEEKDAY_SHORT[index]}
            </span>
          )}
          <span
            className={cn(
              'streak-cell',
              `streak-cell--${day.state}`,
              day.date === today && 'streak-cell--today',
              day.date === ignite && 'streak-cell--ignite'
            )}
            title={`${humanDate(day.date)} — ${STATE_LABEL[day.state]}`}
          >
            {day.state === 'frozen' && cell >= 14 && (
              <Snowflake
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ width: cell * 0.62, height: cell * 0.62, color: 'var(--streak-cold)' }}
                strokeWidth={2.4}
                aria-hidden
              />
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
