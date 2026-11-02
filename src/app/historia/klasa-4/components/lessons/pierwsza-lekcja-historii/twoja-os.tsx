'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MapPin, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { OsDziejow } from '../../timeline/os-dziejow';
import { personalPinId } from '../../../lib/timeline/axis-model';
import { setPersonalPin } from '../../../lib/timeline/personal-storage';
import { timelineNow, useTimelinePins } from '../../../lib/timeline/use-timeline-pins';
import { useHistProgress } from '../../../lib/progress';
import { HIST_MODULES } from '../../../data/curriculum';

/**
 * Blok 4 — **„Twoja oś”** (refleksja). Pierwsza pinezka Osi dziejów:
 * rok urodzenia dziecka, **sam rok**, tylko na tym urządzeniu.
 *
 * Gest wyboru roku (zaprojektowany w L1): pinezka startuje na „dziś” i dziecko
 * **ciągnie ją wstecz po powiększonym kawałku osi** — rok po roku — aż do roku
 * swoich urodzin; pod pinezką widać rok i „ile lat temu”. Dopiero po przypięciu
 * oś oddala się do „od piramid do dziś”: całe życie dziecka to cieniutka kreska
 * na samym końcu. Pod spodem pięć przygaszonych sylwetek — zapowiedź roku; każda
 * zapala się, gdy dziecko zacznie odpowiadający jej moduł.
 */

const SPAN = 20;

export function TwojaOs({
  color,
  lesson,
  done,
  onComplete,
}: {
  color: string;
  lesson: string;
  done: boolean;
  onComplete: () => void;
}) {
  const now = timelineNow();
  const { personal, ready, getStore } = useTimelinePins();
  const pinned = personal.ja;
  const [editing, setEditing] = useState(false);
  const showPicker = ready && (!pinned || editing || !done);

  const pin = (year: number) => {
    setPersonalPin(getStore(), 'ja', year, now);
    setEditing(false);
    if (!done) onComplete();
  };

  if (!ready) return <div className="h-40" aria-hidden />;

  return (
    <div className="space-y-5">
      {showPicker ? (
        <YearPicker color={color} now={now} initial={pinned} onPin={pin} restored={done && !pinned} />
      ) : (
        <>
          <p className="text-base leading-relaxed">
            Twoja pinezka wisi na osi: <strong>{pinned}</strong>. Teraz oddal się — tak wygląda twoje życie na tle
            pięciu tysięcy lat, o których będziemy się uczyć przez cały rok.
          </p>
          <motion.div initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
            <OsDziejow color={color} lesson={lesson} defaultMode="piramidy" highlightIds={[personalPinId('ja')]} />
          </motion.div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Widzisz tę cieniutką kreskę na samym końcu? To całe twoje życie. Wszystko, co jest na lewo od niej, zdarzyło się,
            zanim się urodziłeś/urodziłaś — i wiemy o tym tylko dzięki śladom, które zostały.{' '}
            <button type="button" onClick={() => setEditing(true)} className="underline underline-offset-2 hover:text-foreground">
              Zmień rok
            </button>
          </p>
          <YearPreview />
        </>
      )}
    </div>
  );
}

function YearPicker({
  color,
  now,
  initial,
  onPin,
  restored,
}: {
  color: string;
  now: number;
  initial?: number;
  onPin: (year: number) => void;
  restored: boolean;
}) {
  const [year, setYear] = useState(initial ?? now);
  const [windowEnd, setWindowEnd] = useState(() => (initial && initial < now - SPAN ? initial + 5 : now));
  const [dragging, setDragging] = useState(false);
  const [moved, setMoved] = useState(initial !== undefined);
  const trackRef = useRef<HTMLDivElement>(null);
  const windowStart = windowEnd - SPAN;

  const u = (y: number) => (y - windowStart) / SPAN;
  const setClamped = (y: number) => {
    const next = Math.round(Math.min(now, Math.max(1900, y)));
    setYear(next);
    if (next !== now) setMoved(true);
    // Okno jedzie za pinezką, gdy dziecko (albo rodzic) sięga dalej wstecz.
    if (next < windowStart) setWindowEnd(Math.max(1900 + SPAN, next + SPAN));
    if (next > windowEnd) setWindowEnd(Math.min(now, next));
  };

  const yearFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return year;
    const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return windowStart + t * SPAN;
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (dragging) setClamped(yearFromPointer(e.clientX));
  };
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setClamped(year - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setClamped(year + 1);
    } else if (e.key === 'Enter' && moved) {
      e.preventDefault();
      onPin(year);
    }
  };

  const ago = now - year;
  const ticks = Array.from({ length: SPAN + 1 }, (_, i) => windowStart + i);

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed">
        {restored
          ? 'Twoja pinezka zniknęła po wylogowaniu — tak jest bezpieczniej na wspólnym urządzeniu. Przypnij ją jeszcze raz.'
          : 'Każda oś dziejów zaczyna się od kogoś, kto na nią patrzy. Pinezka stoi na „dziś”. Ciągnij ją wstecz — rok po roku — aż do roku, w którym się urodziłeś/urodziłaś.'}
      </p>

      <div className="rounded-lg border bg-white px-4 pb-4 pt-3 dark:bg-zinc-900/80">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="text-3xl font-bold tabular-nums" style={{ color }}>
            {year}
          </span>
          <span className="text-sm text-muted-foreground">
            {ago === 0 ? 'to jest dziś' : `${ago} ${plural(ago, { one: 'rok', few: 'lata', many: 'lat' })} temu`}
          </span>
        </div>

        <div className="relative mx-2 h-[76px]">
          <div ref={trackRef} className="absolute inset-x-0 top-[44px] h-1.5 rounded-full bg-muted" />
          {ticks.map((t) => (
            <div key={t} className="absolute top-[40px] -translate-x-1/2" style={{ left: `${u(t) * 100}%` }}>
              <div className={cn('mx-auto w-px bg-zinc-400', t % 5 === 0 ? 'h-3.5' : 'h-2')} />
              {t % 5 === 0 && (
                <span className="absolute left-1/2 top-4 -translate-x-1/2 text-[10px] tabular-nums text-muted-foreground">
                  {t}
                </span>
              )}
            </div>
          ))}
          <button
            type="button"
            role="slider"
            aria-label="Rok urodzenia"
            aria-valuemin={1900}
            aria-valuemax={now}
            aria-valuenow={year}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
            onKeyDown={onKeyDown}
            className="absolute top-0 flex h-11 w-11 -translate-x-1/2 touch-none select-none items-start justify-center cursor-grab active:cursor-grabbing"
            style={{ left: `${u(year) * 100}%` }}
          >
            <MapPin className="h-9 w-9 drop-shadow" style={{ color }} fill="white" aria-hidden />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setClamped(year - 1)}
              className="rounded-md border p-2 hover:bg-muted"
              aria-label="Rok wcześniej"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setClamped(year + 1)}
              className="rounded-md border p-2 hover:bg-muted"
              aria-label="Rok później"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onPin(year)}
            disabled={!moved}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: color }}
          >
            <Pin className="h-4 w-4" aria-hidden /> Przypnij {year}
          </button>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Zapisujemy <strong>tylko rok</strong> — bez imienia i daty dnia — i tylko na tym urządzeniu. Nie wysyłamy go nigdzie.
      </p>
    </div>
  );
}

/** Pięć sylwetek roku — zapalają się, gdy dziecko zacznie odpowiedni moduł. */
const PREVIEW: { module: string; label: string; path: string }[] = [
  {
    module: 'poczatki-cywilizacji',
    label: 'pierwsi ludzie',
    path: 'M1 22 L4 13 L7 9 L10 10 L13 5 L17 8 L20 12 L23 22 Z M9 22 Q9 16 12 15 Q15 16 15 22 Z',
  },
  { module: 'starozytny-egipt', label: 'Egipt', path: 'M12 3 L22.5 21.5 H1.5 Z' },
  {
    module: 'starozytna-grecja',
    label: 'Grecja',
    path: 'M5 3 H19 V6 H17 V19 H19 V22 H5 V19 H7 V6 H5 Z M10 7 V18 M12 7 V18 M14 7 V18',
  },
  {
    module: 'starozytny-rzym',
    label: 'Rzym',
    path: 'M2 22 V10 A10 10 0 0 1 22 10 V22 H16 V12 A4 4 0 0 0 8 12 V22 Z',
  },
  {
    module: 'narodziny-chrzescijanstwa',
    label: 'pierwsi chrześcijanie',
    path: 'M2 12 Q9 4 16 12 Q9 20 2 12 Z M16 12 L22 7 V17 Z',
  },
];

function YearPreview() {
  const { moduleProgress, ready } = useHistProgress();
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Co zapali się na twojej osi w tym roku</p>
      <ul className="grid grid-cols-5 gap-2">
        {PREVIEW.map((item) => {
          const mod = HIST_MODULES.find((m) => m.slug === item.module);
          const lit = ready && moduleProgress[item.module] && moduleProgress[item.module].status !== 'not-started';
          const tint = lit ? (mod?.color ?? '#555') : '#a1a1aa';
          return (
            <li key={item.module} className="flex flex-col items-center gap-1 text-center">
              <svg viewBox="0 0 24 24" className={cn('h-10 w-10 transition-opacity', lit ? 'opacity-100' : 'opacity-35')} aria-hidden>
                <path d={item.path} fill={tint} fillOpacity={0.35} stroke={tint} strokeWidth={1.2} strokeLinejoin="round" fillRule="evenodd" />
              </svg>
              <span className={cn('text-[11px] leading-tight', lit ? 'font-semibold' : 'text-muted-foreground')}>{item.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
