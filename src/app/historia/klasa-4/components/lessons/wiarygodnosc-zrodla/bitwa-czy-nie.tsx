'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ArrowRight, Pin, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCorePin } from '../../../lib/timeline/pins';
import { PrzypnijPinezke } from '../../timeline/przypnij-pinezke';
import {
  EVIDENCE,
  STANCE_LABEL,
  evidenceById,
  judgeDilemma,
  type DilemmaVerdict,
  type Stance,
} from './bylo-czy-nie';

const STANCES: Stance[] = [-2, -1, 0, 1, 2];

/**
 * Blok 3 — **„Było czy nie było?”** (dylemat).
 *
 * Gest nowy w kursie: **ustawia suwak pewności i przypina pod nim dowody**,
 * które go przekonały. Dowody leżą rewersem do góry — dziecko je odwraca
 * (każdy ma swoje „ale…”). Sędzia (`judgeDilemma`) przyjmuje **każde**
 * stanowisko poparte zgodnym dowodem, pod warunkiem że dziecko obejrzało
 * choć jeden dowód drugiej strony. Po przyjęciu: stanowisko dziecka z jego
 * dowodami, spór historyków i pinezka ze znakiem zapytania na Osi dziejów.
 */
export function BitwaCzyNie({
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
  const [stance, setStance] = useState<Stance | null>(null);
  const [opened, setOpened] = useState<string[]>([]);
  const [pinned, setPinned] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<DilemmaVerdict | null>(null);
  const accepted = verdict?.ok === true;
  const highlight = verdict && !verdict.ok ? verdict.highlight ?? [] : [];

  const open = (id: string) => {
    setOpened((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };
  const togglePin = (id: string) => {
    if (accepted) return;
    setPinned((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setVerdict(null);
  };

  return (
    <div className="space-y-5">
      <p className="text-base leading-relaxed">
        Twoja kolej, historyku. <strong>Ustaw suwak</strong> — jak bardzo jesteś pewien/pewna, że wielka bitwa na
        Psim Polu się odbyła? Potem <strong>odwróć karty dowodów</strong> i przypnij pod suwakiem te, które cię
        przekonały. Nie ma jednej dobrej odpowiedzi — liczy się, czy umiesz ją uzasadnić.
      </p>

      <div className="space-y-3 border bg-white p-4 dark:bg-zinc-900">
        <CertaintySlider color={color} stance={stance} locked={accepted} onChange={(s) => { setStance(s); setVerdict(null); }} />
        <div className="min-h-[3.25rem] border-2 border-dashed p-2" aria-label="Przypięte dowody">
          {pinned.length === 0 ? (
            <p className="p-1 text-sm text-muted-foreground">Tu przypniesz dowody, które cię przekonały.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {pinned.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => togglePin(id)}
                    disabled={accepted}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-white disabled:cursor-default',
                      highlight.includes(id) && 'ring-2 ring-destructive ring-offset-2'
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`${evidenceById(id).title} — stuknij, żeby odpiąć`}
                  >
                    <Pin className="h-3.5 w-3.5" aria-hidden /> {evidenceById(id).title}
                    {!accepted && <X className="h-3.5 w-3.5 opacity-80" aria-hidden />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EVIDENCE.map((e) => {
          const isOpen = opened.includes(e.id);
          const isPinned = pinned.includes(e.id);
          return (
            <div
              key={e.id}
              className={cn(
                'flex min-h-[9rem] flex-col border-2 p-3 text-sm transition-colors',
                isOpen ? 'bg-white dark:bg-zinc-900' : 'bg-muted/70',
                highlight.includes(e.id) ? 'border-destructive' : 'border-border'
              )}
            >
              <p className="font-semibold">{e.title}</p>
              {isOpen ? (
                <>
                  <p className="mt-1 leading-relaxed">{e.text}</p>
                  <p className="mt-1 leading-relaxed text-muted-foreground">
                    <em>Ale…</em> {e.but}
                  </p>
                  <button
                    type="button"
                    disabled={accepted}
                    onClick={() => togglePin(e.id)}
                    aria-pressed={isPinned}
                    className={cn(
                      'mt-auto inline-flex w-fit items-center gap-1.5 border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50',
                      isPinned && 'text-white'
                    )}
                    style={isPinned ? { backgroundColor: color, borderColor: color } : { borderColor: color, color }}
                  >
                    <Pin className="h-3.5 w-3.5" aria-hidden /> {isPinned ? 'Przypięte' : 'Przypnij pod suwakiem'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => open(e.id)}
                  className="mt-auto inline-flex w-fit items-center gap-1.5 border bg-white px-2.5 py-1.5 text-xs font-semibold dark:bg-zinc-900"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Odwróć kartę
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!accepted && (
        <button
          type="button"
          onClick={() => setVerdict(judgeDilemma({ stance, pinned, opened }))}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          Tak uważam — sprawdź uzasadnienie <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      )}

      {verdict && !verdict.ok && (
        <p className="text-sm font-medium leading-relaxed text-destructive" aria-live="polite">
          {verdict.why}
        </p>
      )}

      {accepted && stance !== null && (
        <Verdict
          color={color}
          stance={stance}
          pinned={pinned}
          note={verdict.ok ? verdict.note : undefined}
          lesson={lesson}
          done={done}
          onComplete={onComplete}
        />
      )}
    </div>
  );
}

function CertaintySlider({
  color,
  stance,
  locked,
  onChange,
}: {
  color: string;
  stance: Stance | null;
  locked: boolean;
  onChange: (s: Stance) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const stanceAt = (clientX: number): Stance => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    const u = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return STANCES[Math.round(u * 4)];
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (locked) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Stuknięcie i tak ustawia suwak.
    }
    dragging.current = true;
    onChange(stanceAt(e.clientX));
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const next = stanceAt(e.clientX);
    if (next !== stance) onChange(next);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (locked) return;
    const i = stance === null ? 2 : STANCES.indexOf(stance);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(STANCES[Math.max(0, stance === null ? 2 : i - 1)]);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(STANCES[Math.min(4, stance === null ? 2 : i + 1)]);
    }
  };

  const u = stance === null ? null : (STANCES.indexOf(stance) / 4) * 100;

  return (
    <div className="space-y-2">
      <p className="text-center text-base font-semibold" style={{ color: stance === null ? undefined : color }} aria-live="polite">
        {stance === null ? 'Przesuń suwak' : STANCE_LABEL[stance]}
      </p>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={locked ? -1 : 0}
        aria-label="Suwak pewności: czy bitwa na Psim Polu się odbyła"
        aria-valuemin={-2}
        aria-valuemax={2}
        aria-valuenow={stance ?? 0}
        aria-valuetext={stance === null ? 'nieustawiony' : STANCE_LABEL[stance]}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        onKeyDown={onKeyDown}
        className={cn('relative mx-4 h-10 touch-none select-none focus-visible:outline-2', !locked && 'cursor-pointer')}
      >
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 bg-gradient-to-r from-slate-300 via-muted to-amber-300 dark:from-slate-600 dark:to-amber-700" />
        {STANCES.map((s, i) => (
          <span
            key={s}
            className="absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-foreground/50"
            style={{ left: `${(i / 4) * 100}%` }}
            aria-hidden
          />
        ))}
        {u !== null && (
          <span
            className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 bg-background shadow-md transition-[left] duration-150"
            style={{ left: `${u}%`, borderColor: color }}
            aria-hidden
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>na pewno nie było</span>
        <span>na pewno było</span>
      </div>
    </div>
  );
}

function Verdict({
  color,
  stance,
  pinned,
  note,
  lesson,
  done,
  onComplete,
}: {
  color: string;
  stance: Stance;
  pinned: string[];
  note?: string;
  lesson: string;
  done: boolean;
  onComplete: () => void;
}) {
  return (
    <div className="space-y-5" aria-live="polite">
      <div className="space-y-2 border-2 p-4" style={{ borderColor: color }}>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Twoje stanowisko</p>
        <p className="text-lg font-semibold" style={{ color }}>
          {STANCE_LABEL[stance]}
        </p>
        <p className="text-sm leading-relaxed">
          <strong>Przekonało cię:</strong> {pinned.map((id) => evidenceById(id).title).join(' · ')}.
        </p>
        {note && <p className="text-sm leading-relaxed text-muted-foreground">{note}</p>}
      </div>

      <div className="space-y-2 text-base leading-relaxed">
        <p>
          <strong>Historycy też się o to spierają.</strong> Dziś wielu z nich uważa, że wielkiej bitwy nie było — albo
          była tylko mała potyczka, którą Kadłubek po latach opisał jak wielkie zwycięstwo. Inni sądzą, że walki pod
          Wrocławiem naprawdę się toczyły, a Kadłubek je tylko upiększył.
        </p>
        <p>
          To nie usterka historii — to jej praca: <strong>ważyć dowody, zanim się w coś uwierzy</strong>. Dlatego ta
          pinezka jako jedyna na twojej osi będzie miała znak zapytania.
        </p>
      </div>

      <PrzypnijPinezke pin={getCorePin('psie-pole')} color={color} lesson={lesson} done={done} onPinned={onComplete} />
    </div>
  );
}
