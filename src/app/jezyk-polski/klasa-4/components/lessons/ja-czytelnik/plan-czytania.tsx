'use client';

import { useEffect, useState } from 'react';
import { plural } from '@/lib/plural';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { PolkaView } from '../../polka/polka-view';
import { episodeMinutes, type CzytelniaBook } from '../../../lib/czytelnia/types';
import { addBook, setPlan } from '../../../lib/polka/model';
import { useShelf } from '../../../lib/polka/use-shelf';
import {
  addToDay,
  dayParts,
  endMessage,
  episodesByDay,
  heavyDayNote,
  localDate,
  nextDays,
  placedCount,
  planEnd,
  removeFromDay,
} from './degustacja';

/**
 * L2, blok 3 „Plan czytania” `[7.2]` — **gest nowy dla kursu: rozkłada
 * odcinki-żetony na dni kalendarza.** Siedem dni od dziś; żeton na dzień
 * przeciągnięciem albo stuk-stuk, stuknięcie żetonu w dniu zdejmuje go z
 * powrotem. Data końca liczy się na żywo; dzień z trzema odcinkami dostaje
 * podpowiedź z minutami (bez blokady), pusty dzień też jest planem. Na końcu
 * książka staje na Półce czytelnika z planem — i Półka pokazuje się pod spodem.
 */

const POOL = 'pula';

interface Props {
  color: string;
  book: CzytelniaBook;
  onComplete: () => void;
}

export function PlanCzytania({ color, book, onComplete }: Props) {
  const total = book.episodes.length;
  const minutes = Math.round(book.episodes.reduce((s, e) => s + episodeMinutes(e.words), 0) / total);
  const [today, setToday] = useState<string | null>(null);
  const [plan, setPlanState] = useState<Record<string, number>>({});
  const [held, setHeld] = useState(false);
  const [saved, setSaved] = useState(false);
  const { update } = useShelf();

  // Data z przeglądarki (lokalna), dopiero po zamontowaniu — bez rozjazdu z serwerem.
  useEffect(() => setToday(localDate(new Date())), []);

  const left = total - placedCount(plan);
  const end = planEnd(plan, total);
  const byDay = episodesByDay(plan);
  const days = today ? nextDays(today, total > 7 ? 14 : 7) : [];

  const drop = (day: string) => {
    setPlanState((p) => addToDay(p, day, total));
    setHeld(false);
  };

  const drag = useDragToken({
    disabled: saved || left === 0,
    onDrop: (_id, target) => {
      if (target?.startsWith('day:')) drop(target.slice(4));
    },
    onTap: () => setHeld((h) => !h),
  });

  const save = () => {
    if (!end || saved) return;
    update((rec, now) => setPlan(addBook(rec, book.id, 'czytelnia', now), book.id, plan, now));
    setSaved(true);
    onComplete();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        „{book.title}” ma {total} {plural(total, { one: 'odcinek', few: 'odcinki', many: 'odcinków' })}, każdy na ok. {minutes} min. Rozłóż je na dni — tak,
        jak naprawdę masz czas. Pusty dzień to też plan.
      </p>

      <div className="mt-4 flex min-h-[3rem] flex-wrap items-center gap-2" data-drop={POOL}>
        {left > 0 && !saved ? (
          <>
            <button
              type="button"
              {...drag.bind('odcinek')}
              aria-pressed={held}
              aria-label={`Odcinek ${total - left + 1} — przeciągnij na dzień albo stuknij, a potem dzień`}
              className="flex h-11 min-w-11 cursor-grab touch-none items-center justify-center border-2 px-2 font-mono text-sm font-bold text-white"
              style={{ backgroundColor: color, borderColor: held ? '#111' : color }}
            >
              {total - left + 1}
            </button>
            <span className="text-sm text-muted-foreground">
              {held ? 'Teraz stuknij dzień.' : `Do rozłożenia: ${left}. Przeciągnij żeton na dzień.`}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Wszystkie odcinki leżą w kalendarzu.</span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const p = dayParts(day);
          const eps = byDay[day] ?? [];
          const hot = drag.hover === `day:${day}`;
          return (
            <div
              key={day}
              data-drop={`day:${day}`}
              role={held ? 'button' : undefined}
              tabIndex={held ? 0 : undefined}
              onClick={held ? () => drop(day) : undefined}
              className="flex min-h-[8.5rem] flex-col border p-1 text-center transition-colors"
              style={{
                borderColor: hot || held ? color : undefined,
                borderStyle: held && !hot ? 'dashed' : 'solid',
                backgroundColor: hot ? `color-mix(in srgb, ${color} 10%, transparent)` : p.weekend ? 'color-mix(in srgb, currentColor 4%, transparent)' : undefined,
                cursor: held ? 'pointer' : undefined,
              }}
            >
              <span className="text-[11px] font-semibold uppercase">{day === today ? 'dziś' : p.short}</span>
              <span className="text-[11px] text-muted-foreground">{p.day}</span>
              <div className="mt-1 flex flex-col items-center gap-1">
                {eps.map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={saved}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Z żetonem w ręce stuknięcie w dzień kładzie, nawet gdy trafi w leżący żeton.
                      if (held) drop(day);
                      else setPlanState((pl) => removeFromDay(pl, day));
                    }}
                    aria-label={held ? `Połóż odcinek na dniu ${p.weekday}` : `Zdejmij odcinek z dnia ${p.weekday}`}
                    className="flex h-7 w-full max-w-[2.5rem] items-center justify-center font-mono text-xs font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 min-h-[4.5rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        <p className="font-medium">{endMessage(plan, total)}</p>
        {Object.entries(plan).map(([day, n]) => {
          const note = heavyDayNote(n, minutes);
          return note ? (
            <p key={day} className="mt-1 text-amber-700 dark:text-amber-400">
              {dayParts(day).weekday}: {note}
            </p>
          ) : null;
        })}
      </div>

      {!saved ? (
        <button
          type="button"
          onClick={save}
          disabled={!end}
          className="border-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          style={{ backgroundColor: color, borderColor: color }}
        >
          Postaw książkę na półce
        </button>
      ) : (
        <div className="mt-2">
          <p className="mb-3 text-sm font-medium">Twoja Półka czytelnika:</p>
          <PolkaView color={color} />
        </div>
      )}

      <DragGhost drag={drag.drag}>
        <span className="flex h-10 w-10 items-center justify-center font-mono text-sm font-bold text-white" style={{ backgroundColor: color }}>
          {total - left + 1}
        </span>
      </DragGhost>
    </div>
  );
}
