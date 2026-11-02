'use client';

import { cn } from '@/lib/utils';
import { MONTH_SHORT, humanDate, parseKey } from '@/lib/streak/school-calendar';
import type { WeekColumn } from '@/lib/streak/types';

/**
 * Taśma roku szkolnego: jedna kolumna na tydzień, pięć kratek na dni nauki.
 * Podmiot całego arkusza — rok widziany naraz, tak jak sąsiednie arkusze
 * pokazują naraz cały program.
 *
 * Kolumny są elastyczne, ale mają dolny próg (`minmax`): na monitorze rok
 * rozkłada się na całą szerokość arkusza, a na telefonie zamiast zgnieść kratki
 * do pięciu pikseli (i podpisy miesięcy w nieczytelną kaszę) taśma przewija się
 * w bok. Jedna wartość w `minmax` zamiast progów responsywnych.
 */

/** Dolny próg szerokości kolumny tygodnia — poniżej rok przestaje być czytelny. */
const MIN_WEEK_PX = 11;

interface YearTapeProps {
  weeks: WeekColumn[];
  label: string;
  activeWeek: string | null;
  onActive: (start: string | null) => void;
  ready: boolean;
}

/**
 * Podpis miesiąca stawiamy przy pierwszym tygodniu, który się w nim zaczyna.
 *
 * Miesiąc, na który wypada jeden tydzień, podpisu nie dostaje: rok szkolny
 * startuje 1 września, więc pierwsza kolumna bywa jeszcze sierpniowa i dwa
 * trzyliterowe skróty zlewały się w „siewrz”. Zakres brakującego miesiąca
 * przejmuje sąsiad z lewej, a skrajny przypadek — sąsiad z prawej.
 */
function monthMarks(weeks: WeekColumn[]): Array<{ index: number; end: number; label: string }> {
  const starts: Array<{ index: number; label: string }> = [];
  let last = -1;
  weeks.forEach((week, index) => {
    const month = parseKey(week.start).getMonth();
    if (month !== last) {
      starts.push({ index, label: MONTH_SHORT[month] });
      last = month;
    }
  });

  const MIN_COLUMNS = 2;
  const kept = starts.filter((mark, i) => {
    const span = (starts[i + 1]?.index ?? weeks.length) - mark.index;
    return span >= MIN_COLUMNS;
  });

  return kept.map((mark, i) => ({
    ...mark,
    // Pierwszy zachowany podpis cofa się na początek taśmy, żeby nie zostawić
    // nad nią dziury po pominiętym miesiącu.
    index: i === 0 ? 0 : mark.index,
    end: kept[i + 1]?.index ?? weeks.length,
  }));
}

export function YearTape({ weeks, label, activeWeek, onActive, ready }: YearTapeProps) {
  const columns = weeks.length;
  const marks = monthMarks(weeks);

  const grid = {
    gridTemplateColumns: `repeat(${columns}, minmax(${MIN_WEEK_PX}px, 1fr))`,
  } as const;

  return (
    // Obie siatki dzielą jeden kontener przewijania, żeby podpisy miesięcy
    // nigdy nie rozjechały się z kolumnami, które opisują.
    <div className="mt-5 overflow-x-auto pb-1">
      <div className="grid gap-[2px]" style={grid} aria-hidden>
        {marks.map((mark) => (
          <span
            key={mark.label + mark.index}
            className="profil-micro overflow-hidden whitespace-nowrap pb-1.5 text-[9px] tracking-[0.1em]"
            style={{ gridColumnStart: mark.index + 1, gridColumnEnd: mark.end + 1 }}
          >
            {mark.label}
          </span>
        ))}
      </div>

      <div
        className="grid gap-[2px]"
        style={grid}
        role="img"
        aria-label={label}
        onMouseLeave={() => onActive(null)}
      >
        {weeks.map((week) => (
          <div
            key={week.start}
            className={cn(
              'grid gap-[2px] text-[var(--ink)] transition-opacity duration-200',
              // Wskazany tydzień zostaje w pełni widoczny, reszta przygasa —
              // ten sam gest, co na wykresie roku obok.
              activeWeek && activeWeek !== week.start ? 'opacity-45' : 'opacity-100'
            )}
            onMouseEnter={() => onActive(week.start)}
            title={`Tydzień od ${humanDate(week.start)} — ${week.doneCount} z 5 dni nauki`}
          >
            {/* Lekcja w weekend nie zajmuje kratki w kolumnie dni nauki, ale
                nie może zniknąć — dostaje własny znacznik nad tygodniem. */}
            <span
              className="block h-[3px]"
              style={{ background: week.weekendDone ? 'var(--streak-cold)' : 'transparent' }}
            />
            {week.days.map((day, i) => (
              <span
                key={day.date}
                className={cn(
                  'streak-cell streak-cell--fluid',
                  `streak-cell--${day.state}`,
                  !ready && 'opacity-0'
                )}
                style={{ transitionDelay: `${i * 20}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
