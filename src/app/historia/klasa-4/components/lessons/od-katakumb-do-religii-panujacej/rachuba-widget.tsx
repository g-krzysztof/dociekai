'use client';

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import { describe, rulerEvents, rulerU, snapZero, yearCountedFrom, type RulerEvent } from './rachuba';

type Phase = 'rzym' | 'jezus' | 'gotowe';

/**
 * Blok 5 — **Od kiedy liczymy lata?** Gest: przeciąga znacznik „rok 1”
 * po linijce dziejów (albo strzałkami); puszczony przyskakuje do najbliższego
 * wydarzenia, a wszystkie numery lat przeliczają się od nowa. Najpierw zero
 * na założeniu Rzymu (jak liczyli Rzymianie), potem z powrotem na narodzinach
 * Jezusa. `onDone`, gdy zero wróci.
 */
export function RachubaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [today] = useState(() => new Date().getFullYear());
  const events = useMemo(() => rulerEvents(today), [today]);
  const [zero, setZero] = useState<RulerEvent['id']>('jezus');
  const [dragU, setDragU] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('rzym');
  const reported = useRef(false);
  const barRef = useRef<HTMLDivElement>(null);

  const zeroEvent = events.find((e) => e.id === zero)!;
  const zeroYear = zeroEvent.year;
  const zeroable = events.filter((e) => e.zero);

  const place = (ev: RulerEvent) => {
    setZero(ev.id);
    if (phase === 'rzym' && ev.id === 'rzym') setPhase('jezus');
    if (phase === 'jezus' && ev.id === 'jezus') {
      setPhase('gotowe');
      if (!reported.current) {
        reported.current = true;
        onDone();
      }
    }
  };

  const uAt = (clientX: number) => {
    const r = barRef.current?.getBoundingClientRect();
    if (!r) return 0;
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  };
  const down = (e: PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // bez przechwycenia też działa
    }
    setDragU(uAt(e.clientX));
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (dragU === null) return;
    setDragU(uAt(e.clientX));
  };
  const up = () => {
    if (dragU === null) return;
    place(snapZero(dragU, events));
    setDragU(null);
  };
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = zeroable.findIndex((x) => x.id === zero);
    if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault();
      place(zeroable[i - 1]);
    }
    if (e.key === 'ArrowRight' && i < zeroable.length - 1) {
      e.preventDefault();
      place(zeroable[i + 1]);
    }
  };

  const markerU = dragU ?? rulerU(zeroYear);
  const todayN = yearCountedFrom(zeroYear, today);

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        {phase === 'rzym' && (
          <>
            Numer roku zależy od tego, od czego zaczynamy liczyć. Rzymianie liczyli lata od założenia swojego miasta.{' '}
            <strong>Przeciągnij znacznik „rok 1” na założenie Rzymu</strong> i patrz na numery lat.
          </>
        )}
        {phase === 'jezus' && (
          <>
            Gdybyśmy liczyli jak Rzymianie, dziś byłby rok <strong>{todayN}</strong>. W 525 roku mnich Dionizy Mały zaproponował,
            by liczyć lata od narodzin Jezusa. <strong>Przesuń znacznik z powrotem na narodziny Jezusa.</strong>
          </>
        )}
        {phase === 'gotowe' && (
          <>
            Tak liczymy do dziś. Od początku kursu piszesz „p.n.e.” i „n.e.” — „przed naszą erą” i „naszej ery”. Ta rachuba pochodzi
            właśnie od chrześcijaństwa: rok 1 to rok, w którym według Dionizego urodził się Jezus. Możesz dalej przestawiać zero.
          </>
        )}
      </p>

      <div className="border bg-white px-7 pb-4 pt-10 dark:bg-zinc-900">
        <div ref={barRef} className="relative h-3 border-y border-[#8a6a3a] bg-[#efe8d6]">
          {events.map((ev) => (
            <span
              key={ev.id}
              className={cn('absolute top-1/2 h-5 w-0.5 -translate-x-1/2 -translate-y-1/2', ev.id === 'dzis' ? 'bg-foreground' : 'bg-[#8a6a3a]')}
              style={{ left: `${rulerU(ev.year) * 100}%` }}
              aria-hidden
            />
          ))}
          <div
            role="slider"
            tabIndex={0}
            aria-label="Początek rachuby lat"
            aria-valuetext={`rok 1 = ${zeroEvent.label}`}
            aria-valuemin={0}
            aria-valuemax={zeroable.length - 1}
            aria-valuenow={zeroable.findIndex((x) => x.id === zero)}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onKeyDown={key}
            className={cn(
              'absolute bottom-1/2 flex -translate-x-1/2 cursor-ew-resize touch-none flex-col items-center',
              dragU === null && 'transition-[left] duration-300'
            )}
            style={{ left: `${markerU * 100}%` }}
          >
            <span className="whitespace-nowrap border-2 bg-white px-1.5 py-0.5 text-xs font-bold dark:bg-zinc-900" style={{ borderColor: color, color }}>
              rok 1
            </span>
            <span className="h-4 w-0.5" style={{ background: color }} />
          </div>
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>dawniej</span>
          <span>dziś</span>
        </div>
      </div>

      <ul className="divide-y border bg-white text-sm dark:bg-zinc-900">
        {events.map((ev) => (
          <li key={ev.id} className={cn('flex items-baseline justify-between gap-3 px-3 py-1.5', ev.id === zero && 'font-semibold')}>
            <span>
              {ev.label}
              {ev.id === zero && (
                <span className="ml-1.5 text-xs" style={{ color }}>
                  ← początek
                </span>
              )}
            </span>
            <span className="whitespace-nowrap tabular-nums" style={ev.id === 'dzis' ? { color } : undefined}>
              {describe(zeroYear, ev.year)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
