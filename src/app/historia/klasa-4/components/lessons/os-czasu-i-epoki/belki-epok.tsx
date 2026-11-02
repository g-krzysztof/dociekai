'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import { timelineNow } from '../../../lib/timeline/use-timeline-pins';
import {
  BEAM_MAX_YEARS,
  biggestMiss,
  compareBeams,
  ERA_LENGTHS,
  eraLengthLabel,
  guessesShrink,
  type BeamComparison,
} from './epoki';

type Why = 'swiat' | 'historycy';

const WHY_OPTIONS: { id: Why; text: string }[] = [
  { id: 'historycy', text: 'Bo historycy się spieszą i nie chce im się opisywać długich epok.' },
  { id: 'swiat', text: 'Bo świat zmienia się coraz szybciej — wielkie zmiany przychodzą coraz częściej.' },
];

const SCALE_MARKS = [0, 1000, 2000, 3000, 4000];

/**
 * Blok 3 — **„Ile trwała epoka?”** (`cwiczenie`).
 *
 * Gest nowy w kursie: **szacuje długości belkami** — przeciąga koniec każdej
 * z czterech belek (jak słupek wykresu) i dopiero potem widzi prawdziwe
 * długości nałożone na swoje. Nie ma złego szacunku; werdykt nazywa największą
 * pomyłkę. Na koniec jedno pytanie „dlaczego coraz krótsze?” — jedyne w lekcji
 * „kliknij i przeczytaj”, z żartem i kontrprzykładem przy złej odpowiedzi.
 */
export function BelkiEpok({ color, onComplete }: { color: string; onComplete: () => void }) {
  const now = timelineNow();
  const [guesses, setGuesses] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [why, setWhy] = useState<Why | null>(null);
  const reported = useRef(false);

  const allSet = ERA_LENGTHS.every((era) => (guesses[era.id] ?? 0) > 0);
  const comparisons = revealed ? compareBeams(guesses, now) : [];
  const miss = revealed ? biggestMiss(comparisons) : null;
  const solved = why === 'swiat';

  useEffect(() => {
    if (solved && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [solved, onComplete]);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Ile lat trwała każda epoka? Nie licz — <strong>oszacuj</strong>. Przeciągnij koniec każdej belki tak daleko, jak
        długa była twoim zdaniem epoka. Linijka u góry pokazuje lata.
      </p>

      <div className="space-y-2">
        <Ruler />
        {ERA_LENGTHS.map((era) => (
          <Beam
            key={era.id}
            label={era.label}
            color={color}
            value={guesses[era.id] ?? 0}
            locked={revealed}
            actual={revealed ? era.years(now) : null}
            actualLabel={eraLengthLabel(era, now)}
            ongoing={era.ongoing}
            onChange={(v) => setGuesses((g) => ({ ...g, [era.id]: v }))}
          />
        ))}
      </div>

      {!revealed && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          disabled={!allSet}
          className="border-2 px-4 py-2 text-sm font-semibold disabled:opacity-40"
          style={{ borderColor: color, color }}
        >
          {allSet ? 'Pokaż prawdziwe długości' : 'Ustaw wszystkie cztery belki'}
        </button>
      )}

      {revealed && miss && (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed" aria-live="polite">
            {missMessage(miss)}{' '}
            {guessesShrink(guesses)
              ? 'A kolejność długości odgadłeś/łaś bez pudła: każda następna epoka krótsza od poprzedniej.'
              : 'Popatrz na prawdziwe belki z góry na dół: każda następna epoka jest krótsza od poprzedniej.'}
          </p>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-semibold">Dlaczego epoki są coraz krótsze?</legend>
            {WHY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setWhy(option.id)}
                disabled={solved}
                className={cn(
                  'block w-full border px-3 py-2 text-left text-sm',
                  why === option.id && (option.id === 'swiat' ? 'border-success bg-success/10' : 'border-destructive bg-destructive/5')
                )}
              >
                {option.text}
              </button>
            ))}
          </fieldset>
          {why === 'historycy' && (
            <p className="text-sm leading-relaxed text-destructive" aria-live="polite">
              Gdyby tak było, historycy z pośpiechu skróciliby właśnie starożytność — a ta ma prawie cztery tysiące lat.
              Epok nie mierzy się zegarkiem, tylko wielkimi zmianami. Spróbuj jeszcze raz.
            </p>
          )}
          {solved && (
            <p className="text-sm leading-relaxed" aria-live="polite">
              <strong className="text-success">Tak.</strong> Przez tysiące lat starożytności ludzie siali, budowali i
              pisali prawie tak samo. A jedna babcia, która urodziła się w połowie XX wieku, widziała w swoim życiu
              telewizor, lot człowieka w kosmos, komputer, internet i telefon w kieszeni. Gdy zmian jest więcej,
              wcześniej przychodzi taka, którą historycy uznają za koniec epoki.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function missMessage(miss: BeamComparison): string {
  const era = ERA_LENGTHS.find((e) => e.id === miss.id)!;
  const times = miss.ratio >= 1 ? miss.ratio : 1 / miss.ratio;
  if (times < 1.3) return 'Twoje szacunki są bardzo blisko prawdziwych długości.';
  const howMuch = times >= 2 ? `ok. ${Math.round(times)} razy` : 'wyraźnie';
  return `Najdalej od prawdy: ${era.label}. Twoja belka jest ${howMuch} ${miss.ratio >= 1 ? 'za długa' : 'za krótka'} — ${miss.guess} lat zamiast ${miss.actual}.`;
}

function Ruler() {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-end gap-2 sm:grid-cols-[8rem_1fr]" aria-hidden>
      <span />
      <div className="relative h-5 border-b">
        {SCALE_MARKS.map((m) => (
          <span
            key={m}
            className="absolute bottom-0 -translate-x-1/2 text-[10px] tabular-nums text-muted-foreground"
            style={{ left: `${(m / BEAM_MAX_YEARS) * 100}%` }}
          >
            <span className="block text-center">{m}</span>
            <span className="mx-auto block h-1 w-px bg-muted-foreground/60" />
          </span>
        ))}
      </div>
    </div>
  );
}

function Beam({
  label,
  color,
  value,
  locked,
  actual,
  actualLabel,
  ongoing,
  onChange,
}: {
  label: string;
  color: string;
  value: number;
  locked: boolean;
  actual: number | null;
  actualLabel: string;
  ongoing?: boolean;
  onChange: (years: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const yearsAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return value;
    const t = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    // Do 10 lat — dokładniej palec i tak nie umie.
    return Math.round((t * BEAM_MAX_YEARS) / 10) * 10;
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (locked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    onChange(yearsAt(event.clientX));
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging) onChange(yearsAt(event.clientX));
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (locked) return;
    const step = event.shiftKey ? 500 : 50;
    if (event.key === 'ArrowRight') onChange(Math.min(BEAM_MAX_YEARS, value + step));
    else if (event.key === 'ArrowLeft') onChange(Math.max(0, value - step));
    else return;
    event.preventDefault();
  };

  const pct = (years: number) => `${Math.min(100, (years / BEAM_MAX_YEARS) * 100)}%`;

  return (
    <div className="grid grid-cols-[6.5rem_1fr] items-center gap-2 sm:grid-cols-[8rem_1fr]">
      <span className="text-sm font-medium">{label}</span>
      <div className="space-y-1">
        <div
          ref={trackRef}
          role="slider"
          tabIndex={locked ? -1 : 0}
          aria-label={`Twój szacunek: ${label}`}
          aria-valuemin={0}
          aria-valuemax={BEAM_MAX_YEARS}
          aria-valuenow={value}
          aria-valuetext={`${value} lat`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          onKeyDown={onKeyDown}
          className={cn('relative h-8 touch-none bg-muted/50 outline-none focus-visible:ring-2', locked ? 'cursor-default' : 'cursor-ew-resize')}
        >
          <div className="absolute inset-y-1 left-0 transition-[width] duration-75" style={{ width: pct(value), background: color, opacity: locked ? 0.45 : 0.85 }} />
          {!locked && (
            <span
              className="absolute top-0 h-8 w-2 -translate-x-1/2 border-2 bg-background"
              style={{ left: pct(value), borderColor: color }}
              aria-hidden
            />
          )}
          <span className="pointer-events-none absolute inset-y-0 right-1 flex items-center text-xs tabular-nums text-muted-foreground">
            {value > 0 ? `${value} lat` : 'przeciągnij →'}
          </span>
        </div>
        {actual !== null && (
          <div className="relative h-3" aria-label={`Naprawdę: ${actualLabel}`}>
            <div className="absolute inset-y-0 left-0 border-2 border-foreground transition-[width] duration-700" style={{ width: pct(actual) }} />
            {ongoing && <span className="absolute -top-1 text-xs" style={{ left: `calc(${pct(actual)} + 2px)` }} aria-hidden>→</span>}
          </div>
        )}
        {actual !== null && <p className="text-xs font-semibold">Naprawdę: {actualLabel}</p>}
      </div>
    </div>
  );
}
