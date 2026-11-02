'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Droplet, Feather, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CASE_LETTERS,
  INK_CAPACITY,
  LINE,
  nextLetterIndex,
  PRINT_COPIES,
  quillStroke,
} from './drukarnia';

/** Sekundy z jedną cyfrą po przecinku, po polsku. */
export function fmtSec(sec: number): string {
  return `${sec.toFixed(1).replace('.', ',')} s`;
}

/** Żywy stoper: liczy od `start` do `end` (albo do teraz). */
function useStopwatch(start: number | null, end: number | null): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (start === null || end !== null) return;
    const id = window.setInterval(() => setNow(performance.now()), 100);
    return () => window.clearInterval(id);
  }, [start, end]);
  if (start === null) return 0;
  return Math.max(0, ((end ?? now) - start) / 1000);
}

function Stopwatch({ sec, color, done }: { sec: number; color: string; done: boolean }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-sm tabular-nums', done && 'font-bold')}
      style={done ? { borderColor: color, color } : undefined}
      aria-live="off"
    >
      <Timer className="h-4 w-4" aria-hidden /> {fmtSec(sec)}
    </span>
  );
}

/* ───────────────────────── 1. Pióro ───────────────────────── */

/**
 * **Przepisywanie piórem** — gest nowy w kursie: dziecko wodzi palcem po
 * wzorze liter, litera po literze. Gęsie pióro ma dwie granice, których
 * nie da się przeskoczyć: atrament kończy się co kilka liter (stuknij
 * kałamarz) i za szybki ruch drapie pergamin zamiast pisać. Stoper liczy od
 * pierwszej litery do ostatniej.
 */
export function PioroKopisty({ color, onDone }: { color: string; onDone: (sec: number) => void }) {
  const [written, setWritten] = useState(0);
  const [ink, setInk] = useState(INK_CAPACITY);
  const [msg, setMsg] = useState<string | null>(null);
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);
  const state = useRef({ written: 0, ink: INK_CAPACITY, last: 0 });
  const tracing = useRef(false);
  const lineRef = useRef<HTMLDivElement>(null);
  const sec = useStopwatch(start, end);
  const finished = end !== null;

  const tryLetter = (index: number) => {
    if (finished) return;
    const s = state.current;
    const next = nextLetterIndex(LINE, s.written);
    if (index < next) return;
    const now = performance.now();
    const res = quillStroke({ index, next, ink: s.ink, sinceLastMs: s.last ? now - s.last : Infinity });
    if (res === 'nie-ta') {
      // Palec, który przemknął za daleko, nie zagłusza ważniejszego „Wolniej!” ani „suche pióro”.
      setMsg((m) => m ?? `Pisz po kolei — teraz litera „${LINE[next]}”.`);
      return;
    }
    if (res === 'sucho') {
      setMsg('Pióro jest suche. Stuknij kałamarz i pisz dalej.');
      return;
    }
    if (res === 'za-szybko') {
      setMsg('Wolniej! Gęsie pióro drapie pergamin, zamiast pisać.');
      return;
    }
    const startAt = start ?? now;
    if (start === null) setStart(now);
    s.written = nextLetterIndex(LINE, index + 1);
    s.ink -= 1;
    s.last = now;
    setWritten(s.written);
    setInk(s.ink);
    setMsg(null);
    if (s.written >= LINE.length) {
      setEnd(now);
      onDone((now - startAt) / 1000);
    }
  };

  /**
   * Trafienie liczone geometrią liter, nie `elementFromPoint` — przy wodzeniu
   * palcem (pointermove) tamto podejście gubiło litery. Pionowy zapas pół
   * wysokości linii, żeby palec nie musiał trafiać idealnie w środek.
   */
  const letterAt = (x: number, y: number): number | null => {
    const spans = lineRef.current?.querySelectorAll<HTMLElement>('[data-ch]');
    if (!spans) return null;
    // Najpierw litera, która naprawdę zawiera punkt; zapas tylko jako drugi wybór —
    // inaczej na telefonie (linijka w dwóch wierszach) zapas łapał literę z wiersza wyżej.
    let best: { i: number; d: number } | null = null;
    for (const el of spans) {
      const r = el.getBoundingClientRect();
      if (x < r.left || x > r.right) continue;
      const d = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
      if (d === 0) return Number(el.dataset.ch);
      if (d <= r.height / 2 && (!best || d < best.d)) best = { i: Number(el.dataset.ch), d };
    }
    return best?.i ?? null;
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    tracing.current = true;
    const i = letterAt(e.clientX, e.clientY);
    if (i !== null) tryLetter(i);
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!tracing.current && !(e.buttons & 1)) return;
    const i = letterAt(e.clientX, e.clientY);
    if (i !== null) tryLetter(i);
  };
  const onUp = () => {
    tracing.current = false;
  };

  const dip = () => {
    state.current.ink = INK_CAPACITY;
    setInk(INK_CAPACITY);
    setMsg(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Feather className="h-4 w-4" style={{ color }} aria-hidden /> Przepisz linijkę gęsim piórem
        </p>
        <Stopwatch sec={sec} color={color} done={finished} />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div
          ref={lineRef}
          role="textbox"
          aria-label={`Linijka do przepisania: ${LINE}. Wodzić palcem po literach albo naciskać spację.`}
          aria-readonly
          tabIndex={0}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
          onPointerCancel={onUp}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              tryLetter(nextLetterIndex(LINE, state.current.written));
            }
          }}
          className="cursor-crosshair touch-none select-none border bg-[#fbf6ea] px-3 py-5 font-serif text-[26px] leading-[1.6] tracking-wide text-stone-800 outline-none focus-visible:ring-2 dark:bg-stone-900 dark:text-stone-100 sm:text-[30px]"
          style={{ ['--tw-ring-color' as string]: color }}
        >
          {LINE.split('').map((ch, i) => (
            <span
              key={i}
              data-ch={i}
              className={cn('inline-block min-w-[0.3em] transition-colors', i < written ? '' : 'text-stone-300 dark:text-stone-600')}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={dip}
          disabled={finished}
          className="flex items-center gap-3 border bg-white px-3 py-2 text-left text-sm disabled:opacity-50 dark:bg-zinc-900 sm:flex-col sm:justify-center sm:px-4"
          aria-label={`Kałamarz — zamocz pióro. Atramentu starczy na ${ink} liter.`}
        >
          <span className="relative block h-10 w-10 rounded-full border-2 border-stone-500 bg-stone-700" aria-hidden>
            <span className="absolute inset-x-2 top-1 h-1.5 rounded-full bg-stone-400/60" />
          </span>
          <span>
            <span className="block font-semibold">Kałamarz</span>
            <span className="flex gap-0.5" aria-hidden>
              {Array.from({ length: INK_CAPACITY }, (_, i) => (
                <Droplet key={i} className={cn('h-3 w-3', i < ink ? 'fill-current' : 'opacity-25')} style={{ color }} />
              ))}
            </span>
          </span>
        </button>
      </div>

      <p className={cn('min-h-[1.5rem] text-sm', msg?.startsWith('Wolniej') || msg?.startsWith('Pióro') ? 'font-medium text-destructive' : 'text-muted-foreground')} aria-live="polite">
        {finished ? `Linijka przepisana w ${fmtSec(sec)}.` : (msg ?? 'Prowadź palec po szarych literach — od lewej do prawej.')}
      </p>
    </div>
  );
}

/* ───────────────────────── 2. Kaszta ───────────────────────── */

/**
 * **Składanie z czcionek** — gest nowy w kursie: dziecko wyjmuje z kaszty
 * czcionkę po czcionce w kolejności tekstu. Na wierszowniku czcionki stoją
 * w lustrzanym odbiciu i od prawej do lewej — tak jak w prawdziwym składzie
 * (odbitka wychodzi potem prosto). Pomyłka: czcionka wraca do przegródki.
 */
export function KasztaZecera({ color, onDone }: { color: string; onDone: (sec: number) => void }) {
  const [composed, setComposed] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);
  const sec = useStopwatch(start, end);
  const finished = end !== null;
  const need = LINE[composed];

  const take = (key: string) => {
    if (finished) return;
    const now = performance.now();
    if (key !== need) {
      setWrong(key);
      return;
    }
    const startAt = start ?? now;
    if (start === null) setStart(now);
    setWrong(null);
    const n = composed + 1;
    setComposed(n);
    if (n >= LINE.length) {
      setEnd(now);
      onDone((now - startAt) / 1000);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">Złóż tę samą linijkę z czcionek</p>
        <Stopwatch sec={sec} color={color} done={finished} />
      </div>

      <p className="text-sm text-muted-foreground">
        Do złożenia: <span className="font-serif text-base text-foreground">{LINE}</span>
      </p>

      {/* Wierszownik — lustrzane odbicie. */}
      <div className="border bg-stone-200/70 p-2 dark:bg-stone-800" aria-label={`Wierszownik: złożono ${composed} z ${LINE.length} znaków`}>
        <div className="flex min-h-[2.75rem] flex-row-reverse flex-wrap-reverse items-center justify-start gap-[2px]">
          {LINE.slice(0, composed)
            .split('')
            .map((ch, i) => (
              <motion.span
                key={i}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={cn(
                  'inline-flex h-9 items-center justify-center bg-stone-500 font-serif text-lg text-stone-50 dark:bg-stone-600',
                  ch === ' ' ? 'w-3 opacity-60' : 'w-6'
                )}
                aria-hidden
              >
                <span className="inline-block -scale-x-100">{ch === ' ' ? '' : ch}</span>
              </motion.span>
            ))}
        </div>
      </div>

      {/* Kaszta. */}
      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10" aria-label="Kaszta z czcionkami">
        {CASE_LETTERS.map((ch) => (
          <motion.button
            key={ch}
            type="button"
            onClick={() => take(ch)}
            disabled={finished}
            animate={wrong === ch ? { x: [0, -5, 5, -3, 0] } : { x: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              'h-11 border bg-[#efe3c8] font-serif text-xl text-stone-800 disabled:opacity-50 dark:bg-stone-700 dark:text-stone-100',
              wrong === ch && 'border-destructive'
            )}
            aria-label={`Czcionka ${ch}`}
          >
            {ch}
          </motion.button>
        ))}
        <button
          type="button"
          onClick={() => take(' ')}
          disabled={finished}
          className={cn('col-span-5 h-11 border bg-[#efe3c8] text-sm text-stone-700 disabled:opacity-50 dark:bg-stone-700 dark:text-stone-100 sm:col-span-10', wrong === ' ' && 'border-destructive')}
        >
          odstęp (pusta czcionka między wyrazami)
        </button>
      </div>

      <p className={cn('min-h-[1.5rem] text-sm', wrong !== null ? 'font-medium text-destructive' : 'text-muted-foreground')} aria-live="polite">
        {finished
          ? `Linijka złożona w ${fmtSec(sec)}. Zobacz: na wierszowniku jest w lustrzanym odbiciu.`
          : wrong !== null
            ? need === ' '
              ? 'Teraz potrzebny odstęp między wyrazami.'
              : `To „${wrong === ' ' ? 'odstęp' : wrong}”, a potrzebna jest czcionka „${need}”. Odłóż i szukaj dalej.`
            : `Następna czcionka: „${need === ' ' ? 'odstęp' : need}”.`}
      </p>
    </div>
  );
}

/* ───────────────────────── 3. Prasa ───────────────────────── */

const LEVER_PX = 120;

/**
 * **Prasa** — gest nowy w kursie: nałóż farbę na skład (stuknięcie
 * tamponem), potem **ściągnij dźwignię w dół** — jedna odbitka. Bez farby
 * odbitka wychodzi pusta. Dziesięć odbitek, stoper od pierwszej farby.
 */
export function PrasaDrukarska({ color, onDone }: { color: string; onDone: (secPerCopy: number) => void }) {
  const [inked, setInked] = useState(false);
  const [copies, setCopies] = useState(0);
  const [pull, setPull] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);
  const drag = useRef<{ y: number; fired: boolean } | null>(null);
  const sec = useStopwatch(start, end);
  const finished = end !== null;

  const ink = () => {
    if (finished) return;
    if (start === null) setStart(performance.now());
    setInked(true);
    setMsg(null);
  };

  const press = () => {
    if (finished) return;
    if (!inked) {
      setMsg('Odbitka wyszła pusta — na składzie nie było farby. Najpierw tampon.');
      return;
    }
    const now = performance.now();
    const n = copies + 1;
    setCopies(n);
    setInked(false);
    setMsg(null);
    if (n >= PRINT_COPIES) {
      setEnd(now);
      onDone((now - (start ?? now)) / 1000 / PRINT_COPIES);
    }
  };

  const onDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (finished) return;
    drag.current = { y: e.clientY, fired: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // trudno — klawiatura i tak działa
    }
  };
  const onMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const p = Math.min(1, Math.max(0, (e.clientY - d.y) / LEVER_PX));
    setPull(p);
    if (p >= 0.92 && !d.fired) {
      d.fired = true;
      press();
    }
  };
  const onUp = () => {
    drag.current = null;
    setPull(0);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">Odbij linijkę {PRINT_COPIES} razy</p>
        <Stopwatch sec={sec} color={color} done={finished} />
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="space-y-2">
          <button
            type="button"
            onClick={ink}
            disabled={finished || inked}
            className="flex w-full items-center gap-3 border bg-white px-3 py-2 text-left text-sm disabled:opacity-60 dark:bg-zinc-900"
          >
            <span className="flex gap-1" aria-hidden>
              <span className="block h-7 w-7 rounded-full bg-stone-700" />
              <span className="block h-7 w-7 rounded-full bg-stone-700" />
            </span>
            <span>
              <span className="block font-semibold">Tampony z farbą</span>
              <span className="block text-xs text-muted-foreground">{inked ? 'skład pokryty farbą' : 'stuknij, żeby nałożyć farbę'}</span>
            </span>
          </button>

          {/* Forma ze składem. */}
          <div className={cn('border p-2 transition-colors', inked ? 'bg-stone-700 text-stone-100' : 'bg-stone-300 text-stone-600 dark:bg-stone-700')}>
            <p className="-scale-x-100 truncate text-center font-serif text-base">{LINE}</p>
          </div>

          {/* Stos odbitek. */}
          <div className="relative h-24" aria-label={`Odbitki: ${copies} z ${PRINT_COPIES}`}>
            {Array.from({ length: copies }, (_, i) => (
              <motion.div
                key={i}
                initial={{ y: -16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute inset-x-0 border bg-[#fbf6ea] px-2 py-1.5 text-center font-serif text-sm text-stone-800 shadow-sm"
                style={{ top: i * 5, left: i * 2, right: 18 - i * 2 }}
              >
                {LINE}
              </motion.div>
            ))}
            {copies === 0 && <p className="pt-6 text-center text-xs text-muted-foreground">tu spadną odbitki</p>}
          </div>
        </div>

        {/* Dźwignia. */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative w-14 border bg-muted/40" style={{ height: LEVER_PX + 56 }}>
            <span className="absolute inset-x-1/2 top-2 bottom-2 w-1 -translate-x-1/2 bg-stone-400" aria-hidden />
            <button
              type="button"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  press();
                }
              }}
              disabled={finished}
              aria-label="Dźwignia prasy — ściągnij w dół (albo Enter)"
              className="absolute left-1 right-1 h-12 touch-none border-2 enabled:cursor-ns-resize bg-[#c9a77a] text-xs font-bold text-stone-800 disabled:opacity-50"
              style={{ top: 4 + pull * LEVER_PX, borderColor: color }}
            >
              ↓
            </button>
          </div>
          <span className="text-xs text-muted-foreground">dźwignia</span>
        </div>
      </div>

      <p className={cn('min-h-[1.5rem] text-sm', msg ? 'font-medium text-destructive' : 'text-muted-foreground')} aria-live="polite">
        {finished
          ? `${PRINT_COPIES} odbitek w ${fmtSec(sec)} — ${fmtSec(sec / PRINT_COPIES)} na jedną.`
          : (msg ?? `Odbitki: ${copies} z ${PRINT_COPIES}. Farba, potem dźwignia w dół.`)}
      </p>
    </div>
  );
}

export function NextPhaseButton({ color, onClick, children }: { color: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {children} <ArrowRight className="h-4 w-4" aria-hidden />
    </button>
  );
}
