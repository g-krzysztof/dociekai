'use client';

import { useMemo, useState } from 'react';
import { plural } from '@/lib/plural';
import { useOptionalLessonProgress } from '../lesson-shell';
import { buildAxisPins } from '../../lib/timeline/axis-model';
import { TIMELINE_MODES, type TimelineMode } from '../../lib/timeline/scale';
import { timelineNow, useTimelinePins } from '../../lib/timeline/use-timeline-pins';
import { TimelineAxis } from './timeline-axis';

/** Przełącznik „cała ludzkość” / „od piramid do dziś” — ten sam w podglądzie i w geście przypinania. */
export function TimelineModeSwitch({
  mode,
  onChange,
}: {
  mode: TimelineMode;
  onChange: (mode: TimelineMode) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Skala osi" className="inline-flex rounded-full border border-border p-0.5 text-xs">
      {(Object.keys(TIMELINE_MODES) as TimelineMode[]).map((key) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={mode === key}
          onClick={() => onChange(key)}
          className={`rounded-full px-3 py-1 transition-colors ${
            mode === key ? 'bg-foreground font-semibold text-background' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {TIMELINE_MODES[key].label}
        </button>
      ))}
    </div>
  );
}

interface OsDziejowProps {
  /** Kolor pinezek rdzenia — zwykle kolor modułu. */
  color: string;
  /**
   * `<moduł>/<lekcja>` bieżącej lekcji — wtedy pinezki przypięte przed chwilą
   * widać od razu (postęp z powłoki, nie z magazynu).
   */
  lesson?: string;
  defaultMode?: TimelineMode;
  /** Bez przełącznika — lekcja ustala skalę (np. L15 tylko „cała ludzkość”). */
  lockMode?: boolean;
  showEras?: boolean;
  /** Pinezki do wyróżnienia, np. te przypięte w tej lekcji. */
  highlightIds?: string[];
}

/**
 * Oś dziejów dziecka — podgląd całego roku: pinezki rdzenia z ukończonych
 * bloków „przypnij” i pinezki osobiste z urządzenia. Stuknięcie w pinezkę
 * pokazuje jej datę pod osią.
 */
export function OsDziejow({
  color,
  lesson,
  defaultMode = 'piramidy',
  lockMode = false,
  showEras = true,
  highlightIds,
}: OsDziejowProps) {
  const ctx = useOptionalLessonProgress();
  const live = lesson && ctx ? { lesson, completed: ctx.completed } : undefined;
  const { pins, personal, ready, centuries } = useTimelinePins(live);
  const [mode, setMode] = useState<TimelineMode>(defaultMode);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const now = timelineNow();

  const axisPins = useMemo(() => buildAxisPins(pins, personal, mode, now), [pins, personal, mode, now]);
  const selected = axisPins.find((pin) => pin.id === selectedId);

  return (
    <figure className="space-y-3" aria-label="Twoja oś dziejów">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <figcaption className="text-sm font-semibold">
          Twoja oś dziejów
          {ready && (
            <span className="ml-2 font-normal text-muted-foreground">
              {axisPins.length} {plural(axisPins.length, { one: 'pinezka', few: 'pinezki', many: 'pinezek' })}
            </span>
          )}
        </figcaption>
        {!lockMode && <TimelineModeSwitch mode={mode} onChange={setMode} />}
      </div>

      <TimelineAxis
        mode={mode}
        now={now}
        pins={axisPins}
        color={color}
        showEras={showEras}
        showCenturies={centuries}
        highlightIds={highlightIds}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      <p className="min-h-[1.25rem] text-xs text-muted-foreground" aria-live="polite">
        {selected ? (
          <>
            <span className="font-semibold text-foreground">{selected.label}</span> — {selected.when}
          </>
        ) : ready && axisPins.length === 0 ? (
          'Oś jest jeszcze pusta — pinezki przypinasz w lekcjach.'
        ) : (
          <>
            {TIMELINE_MODES[mode].hint}
            {mode === 'ludzkosc' && ' Liczby pod osią to lata temu.'}
            {mode === 'piramidy' && centuries && ' Najniżej wieki: kursywą przed naszą erą, pogrubione — naszej ery.'}
          </>
        )}
      </p>
    </figure>
  );
}
