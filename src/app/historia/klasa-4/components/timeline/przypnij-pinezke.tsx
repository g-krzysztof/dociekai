'use client';

import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { GripHorizontal, MapPin } from 'lucide-react';
import { useOptionalLessonProgress } from '../lesson-shell';
import { buildAxisPins, toAxisPin, toPlaced } from '../../lib/timeline/axis-model';
import type { Dating } from '../../lib/timeline/dating';
import { judgeDrop, verdictMessage, type DropVerdict } from '../../lib/timeline/judge';
import { PAD_PX, pxToU, type TimelineMode } from '../../lib/timeline/scale';
import { timelineNow, useTimelinePins } from '../../lib/timeline/use-timeline-pins';
import { labelWidth, TimelineAxis, type TimelineAxisLayout } from './timeline-axis';

const TRAY_H = 44;

interface PrzypnijPinezkeProps {
  /** Pinezka do przypięcia — zwykle z `CORE_PINS` (`getCorePin(id)`). */
  pin: { id: string; label: string; dating: Dating; uncertain?: boolean };
  /** Kolor modułu. */
  color: string;
  /** `<moduł>/<lekcja>` — pinezki przypięte wcześniej w tej lekcji widać od razu. */
  lesson?: string;
  mode?: TimelineMode;
  /** Blok już zaliczony — pinezka od razu wisi na swoim miejscu. */
  done: boolean;
  onPinned: () => void;
  /** Bez daty na pinezce — dziecko ma ją znać (test końcowy, powtórka). */
  hideDating?: boolean;
  tolerance?: number;
}

/**
 * Gest „przypnij pinezkę” — dziecko **samo** umieszcza wydarzenie na swojej
 * osi (`[4.3]` wbudowane w lekcję). Przeciąga pinezkę z tacy nad osią
 * i puszcza; sędzia (`judgeDrop`) przyjmuje ją, gdy leży blisko i **w dobrej
 * kolejności** względem pinezek, które już wiszą. Odrzucenie nazywa sąsiada
 * („To było później niż «piramidy w Gizie»”) i podświetla go na osi.
 *
 * Klawiatura: strzałki przesuwają (z Shiftem — szybciej), Enter puszcza.
 */
export function PrzypnijPinezke({
  pin,
  color,
  lesson,
  mode = 'piramidy',
  done,
  onPinned,
  hideDating = false,
  tolerance,
}: PrzypnijPinezkeProps) {
  const ctx = useOptionalLessonProgress();
  const live = lesson && ctx ? { lesson, completed: ctx.completed } : undefined;
  const { pins, personal } = useTimelinePins(live);
  const now = timelineNow();
  const trackRef = useRef<HTMLDivElement>(null);
  const trackWidth = () => trackRef.current?.getBoundingClientRect().width ?? 0;

  const target = useMemo(() => toAxisPin(pin, mode, now), [pin, mode, now]);
  const placed = useMemo(
    () => buildAxisPins(pins, personal, mode, now).filter((p) => p.id !== pin.id),
    [pins, personal, mode, now, pin.id]
  );

  const [dragPx, setDragPx] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [verdict, setVerdict] = useState<DropVerdict | null>(null);
  const [tries, setTries] = useState(0);
  const startX = useRef(0);
  const moved = useRef(false);

  const pinned = done || verdict?.ok === true;
  const shownPins = pinned ? [...placed, target] : placed;
  const neighbourId = verdict && !verdict.ok ? verdict.neighbour?.id : undefined;

  const clampPx = (px: number) => Math.min(Math.max(px, PAD_PX), trackWidth() - PAD_PX);

  const drop = (px: number) => {
    const droppedU = pxToU(px, trackWidth(), mode, now);
    const result = judgeDrop({
      targetU: target.u,
      targetAstro: target.astro,
      droppedU,
      placed: placed.map(toPlaced),
      tolerance,
    });
    setVerdict(result);
    setTries((n) => n + 1);
    if (result.ok) onPinned();
  };

  const pxFromEvent = (event: PointerEvent) => {
    const rect = trackRef.current?.getBoundingClientRect();
    return rect ? clampPx(event.clientX - rect.left) : 0;
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (pinned) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    startX.current = event.clientX;
    moved.current = false;
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    if (Math.abs(event.clientX - startX.current) > 4) moved.current = true;
    if (moved.current) {
      setDragPx(pxFromEvent(event));
      setVerdict(null);
    }
  };

  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    setDragging(false);
    if (moved.current) drop(pxFromEvent(event));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (pinned) return;
    const step = trackWidth() * (event.shiftKey ? 0.05 : 0.01);
    const current = dragPx ?? trackWidth() / 2;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      setDragPx(clampPx(current + (event.key === 'ArrowLeft' ? -step : step)));
      setVerdict(null);
    } else if ((event.key === 'Enter' || event.key === ' ') && dragPx !== null) {
      event.preventDefault();
      drop(dragPx);
    }
  };

  const chipText = hideDating ? pin.label : `${pin.label} · ${target.when}`;

  const overlay = ({ width, axisY }: TimelineAxisLayout) => {
    if (pinned) return null;
    const x = dragPx ?? width / 2;
    const onAxis = dragPx !== null;
    const rejected = verdict && !verdict.ok;
    const chipHalf = Math.min((labelWidth(chipText) + 48) / 2, width / 2);
    return (
      <>
        {onAxis && (
          <>
            <span
              className="pointer-events-none absolute w-0.5 -translate-x-1/2"
              style={{ left: x, top: TRAY_H - 6, height: axisY - TRAY_H + 6, background: rejected ? 'var(--destructive)' : color }}
              aria-hidden
            />
            <span
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background"
              style={{ left: x, top: axisY, background: rejected ? 'var(--destructive)' : color }}
              aria-hidden
            />
          </>
        )}
        <button
          type="button"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => setDragging(false)}
          onKeyDown={onKeyDown}
          aria-label={`Pinezka: ${chipText}. Przeciągnij na oś albo przesuwaj strzałkami i puść Enterem.`}
          className={`absolute top-0 flex h-9 max-w-full -translate-x-1/2 touch-none items-center gap-1.5 whitespace-nowrap rounded-full border-2 bg-background px-3 text-xs font-semibold shadow-sm ${
            dragging ? 'cursor-grabbing shadow-md' : 'cursor-grab'
          }`}
          style={{
            // Pinezka w tacy nie wyjeżdża za krawędź — igła pod nią dalej wskazuje prawdziwe miejsce.
            left: Math.min(Math.max(x, chipHalf), width - chipHalf),
            borderColor: rejected ? 'var(--destructive)' : color,
          }}
        >
          <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />
          <span className="truncate">{chipText}</span>
          <GripHorizontal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </>
    );
  };

  const message = pinned
    ? verdictMessage({ ok: true }, pin.label)
    : verdict && !verdict.ok
      ? verdictMessage(verdict, pin.label)
      : tries === 0
        ? 'Chwyć pinezkę i przeciągnij ją nad właściwe miejsce na osi. Puść, gdy będzie na miejscu.'
        : '';

  return (
    <div className="space-y-2">
      <TimelineAxis
        mode={mode}
        now={now}
        pins={shownPins}
        color={color}
        trayHeight={TRAY_H}
        highlightIds={neighbourId ? [neighbourId] : []}
        selectedId={pinned ? pin.id : null}
        overlay={overlay}
        trackRef={trackRef}
      />
      <p
        aria-live="polite"
        className={`min-h-[2.5rem] text-sm ${
          pinned ? 'font-semibold text-success' : verdict && !verdict.ok ? 'text-destructive' : 'text-muted-foreground'
        }`}
      >
        {message}
      </p>
    </div>
  );
}
