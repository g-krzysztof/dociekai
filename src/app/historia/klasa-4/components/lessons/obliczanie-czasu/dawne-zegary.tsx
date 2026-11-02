'use client';

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import Image from 'next/image';
import { Moon, Wheat } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  festivalDay,
  formatDay,
  judgeNoon,
  seasonOf,
  shadowDirection,
  shadowLength,
  type Season,
  type Verdict,
} from './obliczanie';

type Stage = 'cien' | 'klepsydra' | 'ksiezyc' | 'gotowe';

/** Patyk wbity w ziemię — 100 cm. */
const STICK_CM = 100;

/**
 * Blok 3 — **Jak dawniej mierzono czas** (`symulator`). Trzy przyrządy po kolei:
 *  1. **przesuwa słońce po niebie** — cień patyka obraca się i skraca; zadanie:
 *     zatrzymać słońce w południe (sędzia mierzy cień, nie zgaduje);
 *  2. **przewraca klepsydrę** — obraca ją palcem po okręgu; piasek płynie
 *     także nocą, ale godziny nie powie;
 *  3. **suwakiem lat przesuwa kalendarz księżycowy** — święto żniw co roku
 *     wypada 11 dni wcześniej, aż ląduje w zimie; przełącznik na kalendarz
 *     Egipcjan (365 dni) zatrzymuje dryf.
 */
export function DawneZegary({ color, nileImage, onComplete }: { color: string; nileImage: string; onComplete: () => void }) {
  const [stage, setStage] = useState<Stage>('cien');
  const reported = useRef(false);

  useEffect(() => {
    if (stage === 'gotowe' && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [stage, onComplete]);

  const order: Stage[] = ['cien', 'klepsydra', 'ksiezyc', 'gotowe'];
  const reached = (s: Stage) => order.indexOf(stage) >= order.indexOf(s);

  return (
    <div className="space-y-8">
      <Part n={1} title="Cień patyka" color={color}>
        <SunDial color={color} solved={reached('klepsydra')} onSolved={() => setStage((s) => (s === 'cien' ? 'klepsydra' : s))} />
      </Part>
      {reached('klepsydra') && (
        <Part n={2} title="Klepsydra" color={color}>
          <Hourglass color={color} solved={reached('ksiezyc')} onSolved={() => setStage((s) => (s === 'klepsydra' ? 'ksiezyc' : s))} />
        </Part>
      )}
      {reached('ksiezyc') && (
        <Part n={3} title="Kalendarz z Księżyca" color={color}>
          <LunarCalendar
            color={color}
            nileImage={nileImage}
            solved={reached('gotowe')}
            onSolved={() => setStage((s) => (s === 'ksiezyc' ? 'gotowe' : s))}
          />
        </Part>
      )}
    </div>
  );
}

function Part({ n, title, color, children }: { n: number; title: string; color: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="mb-2 flex items-baseline gap-2 text-sm font-semibold uppercase tracking-wide">
        <span className="font-mono" style={{ color }}>
          {n}.
        </span>
        {title}
      </h4>
      {children}
    </section>
  );
}

/* ─────────────── 1. słońce i cień ─────────────── */

const W = 320;
const H = 210;
const CX = 160;
const HORIZON = 150;
const BASE_Y = 178;

const r1 = (n: number) => Math.round(n * 10) / 10;

function sunPos(t: number) {
  return { x: r1(CX - 135 * Math.cos(Math.PI * t)), y: r1(HORIZON - 120 * Math.sin(Math.PI * t)) };
}

function SunDial({ color, solved, onSolved }: { color: string; solved: boolean; onSolved: () => void }) {
  const [t, setT] = useState(0.18);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const sun = sunPos(t);
  const len = shadowLength(t, STICK_CM);
  const dir = shadowDirection(t);
  const px = Math.min(len, 330) * 0.45;
  // Ziemia w lekkim skrócie: cień „do patrzącego” rysujemy w dół, prawie bez skrótu, żeby w południe był widać.
  const tip = { x: r1(CX + dir.x * px), y: r1(BASE_Y + dir.y * px * 0.8) };

  const fromPointer = (e: PointerEvent) => {
    const box = svg.current?.getBoundingClientRect();
    if (!box) return;
    const x = ((e.clientX - box.left) / box.width) * W;
    const c = Math.max(-1, Math.min(1, (CX - x) / 135));
    setT(Math.max(0.02, Math.min(0.98, Math.acos(c) / Math.PI)));
    setVerdict(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Patyk wbity w ziemię to najstarszy zegar. <strong>Przesuwaj słońce palcem po niebie</strong> i patrz na cień.
        Zatrzymaj słońce w <strong>południe</strong> — wtedy, gdy cień jest najkrótszy.
      </p>
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className={cn('w-full max-w-md touch-none select-none border bg-sky-50 dark:bg-sky-950/30', !solved && 'cursor-grab')}
        onPointerDown={(e) => {
          if (solved) return;
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e);
        }}
        onPointerMove={(e) => dragging.current && fromPointer(e)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        role="img"
        aria-label={`Słońce i cień patyka; cień ma ${Math.round(len)} cm`}
      >
        <path d={`M ${CX - 135} ${HORIZON} A 135 120 0 0 1 ${CX + 135} ${HORIZON}`} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeDasharray="4 5" />
        <rect x={0} y={HORIZON} width={W} height={H - HORIZON} className="fill-lime-100 dark:fill-lime-950/50" />
        <text x={10} y={HORIZON - 6} fontSize={10} className="fill-muted-foreground">wschód</text>
        <text x={W - 10} y={HORIZON - 6} fontSize={10} textAnchor="end" className="fill-muted-foreground">zachód</text>
        <line x1={CX} y1={BASE_Y} x2={tip.x} y2={tip.y} stroke="#334155" strokeOpacity={0.35} strokeWidth={7} strokeLinecap="round" />
        <line x1={CX} y1={BASE_Y} x2={CX} y2={BASE_Y - 34} stroke="#7c5a3a" strokeWidth={4} strokeLinecap="round" />
        <circle cx={sun.x} cy={sun.y} r={14} fill="#facc15" stroke="#eab308" strokeWidth={2} />
      </svg>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span>
          Cień: <strong className="font-mono tabular-nums">{Math.round(len)} cm</strong>
        </span>
        {!solved && (
          <button
            type="button"
            onClick={() => {
              const v = judgeNoon(t, STICK_CM);
              setVerdict(v);
              if (v.ok) onSolved();
            }}
            className="border-2 px-3 py-1.5 font-semibold"
            style={{ borderColor: color }}
          >
            Zatrzymaj słońce tutaj
          </button>
        )}
      </div>
      {verdict && (
        <p className={cn('text-sm leading-relaxed', !verdict.ok && 'text-destructive')} aria-live="polite">
          {verdict.ok ? <strong className="text-success">{verdict.message}</strong> : verdict.message}
        </p>
      )}
      {solved && (
        <p className="text-sm leading-relaxed">
          Tak mierzyli czas starożytni Egipcjanie i Grecy: z długości i kierunku cienia. Tylko że… w pochmurny dzień i w
          nocy cienia nie ma.
        </p>
      )}
    </div>
  );
}

/* ─────────────── 2. klepsydra ─────────────── */

const FLOW_MS = 6000;

function Hourglass({ color, solved, onSolved }: { color: string; solved: boolean; onSolved: () => void }) {
  const [angle, setAngle] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sand, setSand] = useState(1); // ile piasku na górze po przewróceniu: 1 → 0
  const box = useRef<HTMLDivElement>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!flipped) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const left = Math.max(0, 1 - (now - start) / FLOW_MS);
      setSand(left);
      if (left > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [flipped]);

  useEffect(() => {
    if (flipped && sand === 0 && !solved) onSolved();
  }, [flipped, sand, solved, onSolved]);

  const pointerAngle = (e: PointerEvent) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return 0;
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (last.current === null || flipped) return;
    const a = pointerAngle(e);
    let d = a - last.current;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    last.current = a;
    setAngle((prev) => {
      const next = prev + d;
      return Math.abs(next) >= 150 ? Math.sign(next) * 180 : next;
    });
  };

  useEffect(() => {
    if (Math.abs(angle) === 180 && !flipped) setFlipped(true);
  }, [angle, flipped]);

  // Po przewróceniu rysujemy klepsydrę prosto (piasek u góry), bez obrotu.
  const shown = flipped ? 0 : angle;
  const top = flipped ? sand : 0;
  const bottom = flipped ? 1 - sand : 1;
  const night = flipped && sand < 0.6;

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Piasek leży na dole. <strong>Obróć klepsydrę palcem dookoła</strong>, aż stanie do góry nogami.
      </p>
      <div className="flex flex-wrap items-center gap-6">
        <div
          ref={box}
          className={cn('relative flex h-44 w-44 touch-none select-none items-center justify-center rounded-full border transition-colors', night ? 'bg-slate-800' : 'bg-amber-50 dark:bg-amber-950/30', !flipped && 'cursor-grab')}
          onPointerDown={(e) => {
            if (flipped) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            last.current = pointerAngle(e);
          }}
          onPointerMove={onMove}
          onPointerUp={() => {
            last.current = null;
            if (!flipped) setAngle(0);
          }}
          onPointerCancel={() => (last.current = null)}
          role="img"
          aria-label={flipped ? 'Klepsydra przewrócona, piasek się przesypuje' : 'Klepsydra — obróć ją palcem dookoła'}
        >
          {night && <Moon className="absolute right-5 top-5 h-5 w-5 text-slate-200" aria-hidden />}
          <svg viewBox="0 0 60 100" className="h-32" style={{ transform: `rotate(${shown}deg)` }} aria-hidden>
            <rect x={6} y={2} width={48} height={6} fill="#8b5e3c" />
            <rect x={6} y={92} width={48} height={6} fill="#8b5e3c" />
            <path d="M12 8 C12 35 27 42 29 50 C27 58 12 65 12 92 L48 92 C48 65 33 58 31 50 C33 42 48 35 48 8 Z" fill="white" fillOpacity={0.7} stroke="#94a3b8" />
            {/* piasek u góry — opada od góry */}
            <clipPath id="hg-top">
              <rect x={0} y={8 + 40 * (1 - top)} width={60} height={42} />
            </clipPath>
            <path d="M12 8 C12 35 27 42 29 50 L31 50 C33 42 48 35 48 8 Z" fill="#e2c48d" clipPath="url(#hg-top)" />
            {/* piasek na dole — kopczyk rośnie */}
            <clipPath id="hg-bottom">
              <rect x={0} y={92 - 40 * bottom} width={60} height={42} />
            </clipPath>
            <path d="M29 50 C27 58 12 65 12 92 L48 92 C48 65 33 58 31 50 Z" fill="#e2c48d" clipPath="url(#hg-bottom)" />
            {flipped && sand > 0 && <line x1={30} y1={50} x2={30} y2={90} stroke="#e2c48d" strokeWidth={1} />}
          </svg>
        </div>
        <p className="max-w-xs text-sm leading-relaxed" aria-live="polite">
          {!flipped
            ? 'Kręć dalej — klepsydra musi stanąć do góry nogami.'
            : sand > 0
              ? 'Piasek płynie… Zapadła noc, a klepsydra mierzy dalej.'
              : 'Cały piasek na dole. Klepsydra odmierzyła zawsze ten sam kawałek czasu — w dzień i w nocy, w słońcu i w chmurach. Ale która jest godzina? Tego nie powie: mierzy, ile czasu minęło, a nie, która jest pora.'}
        </p>
      </div>
      {!flipped && Math.abs(angle) > 5 && (
        <p className="text-xs font-semibold tabular-nums" style={{ color }}>
          Obrót: {Math.round(Math.abs(angle))}°
        </p>
      )}
    </div>
  );
}

/* ─────────────── 3. kalendarz księżycowy i Nil ─────────────── */

const SEASONS: { id: Season; label: string; cls: string }[] = [
  { id: 'zima', label: 'zima', cls: 'bg-sky-100 dark:bg-sky-950/50' },
  { id: 'wiosna', label: 'wiosna', cls: 'bg-lime-100 dark:bg-lime-950/50' },
  { id: 'lato', label: 'lato', cls: 'bg-amber-100 dark:bg-amber-950/50' },
  { id: 'jesien', label: 'jesień', cls: 'bg-orange-100 dark:bg-orange-950/50' },
];

/** Pas roku: odcinki pór roku od 1 stycznia do 31 grudnia. */
const BANDS: { from: number; to: number; season: Season }[] = [
  { from: 1, to: 79, season: 'zima' },
  { from: 80, to: 171, season: 'wiosna' },
  { from: 172, to: 265, season: 'lato' },
  { from: 266, to: 355, season: 'jesien' },
  { from: 356, to: 365, season: 'zima' },
];

function LunarCalendar({
  color,
  nileImage,
  solved,
  onSolved,
}: {
  color: string;
  nileImage: string;
  solved: boolean;
  onSolved: () => void;
}) {
  const [years, setYears] = useState(0);
  const [calendar, setCalendar] = useState<'ksiezycowy' | 'sloneczny'>('ksiezycowy');
  const [winterAt, setWinterAt] = useState<number | null>(null);

  const day = festivalDay(years, calendar);
  const season = seasonOf(day);

  useEffect(() => {
    if (calendar === 'ksiezycowy' && season === 'zima' && winterAt === null) setWinterAt(years);
  }, [calendar, season, years, winterAt]);

  useEffect(() => {
    if (calendar === 'sloneczny' && years >= 10 && !solved) onSolved();
  }, [calendar, years, solved, onSolved]);

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Najprostszy kalendarz to Księżyc: od pełni do pełni mija ok. 29 i pół dnia, a dwanaście takich miesięcy to{' '}
        <strong>354 dni</strong>. Rolnicy świętują żniwa w sierpniu. <strong>Przesuwaj lata suwakiem</strong> i patrz,
        kiedy wypada święto żniw według kalendarza z Księżyca.
      </p>

      <div className="relative pt-7">
        <div className="flex h-10 border">
          {BANDS.map((b, i) => (
            <div
              key={i}
              className={cn('flex items-center justify-center text-[11px] text-muted-foreground', SEASONS.find((s) => s.id === b.season)!.cls)}
              style={{ width: `${((b.to - b.from + 1) / 365) * 100}%` }}
            >
              {b.to - b.from > 30 ? SEASONS.find((s) => s.id === b.season)!.label : ''}
            </div>
          ))}
        </div>
        <div className="absolute top-0 -translate-x-1/2 transition-[left] duration-200" style={{ left: `${((day - 0.5) / 365) * 100}%` }}>
          <Wheat className="h-6 w-6" style={{ color }} aria-hidden />
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>1 stycznia</span>
          <span>31 grudnia</span>
        </div>
      </div>

      <label className="block text-sm">
        <span className="flex justify-between">
          <span>
            Rok: <strong className="font-mono tabular-nums">{years + 1}.</strong>
          </span>
          <span>
            Żniwa: <strong>{formatDay(day)}</strong> ({SEASONS.find((s) => s.id === season)!.label})
          </span>
        </span>
        <input
          type="range"
          min={0}
          max={20}
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          className="mt-2 w-full"
          style={{ accentColor: color }}
          aria-label="Który rok"
        />
      </label>

      {winterAt !== null && (
        <div className="space-y-3 border bg-muted/30 p-4 text-sm leading-relaxed" aria-live="polite">
          <p>
            W {winterAt + 1}. roku święto żniw wypada <strong>w środku zimy</strong>! Rok z Księżyca jest o 11 dni
            krótszy od roku Słońca, więc co roku święto ucieka o 11 dni.
          </p>
          <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
            <Image src={nileImage} alt="Akwarela: szeroki Nil w porze wylewu — woda rozlana po polach, palmy daktylowe stoją w wodzie, na wzniesieniu domy z cegły mułowej, w oddali żaglówka i pustynne skały" width={180} height={135} className="h-auto w-full" />
            <p>
              Egipcjanie patrzyli więc na <strong>Słońce i Nil</strong>, który wylewał co roku o tej samej porze. Ułożyli
              kalendarz słoneczny: 12 miesięcy po 30 dni i 5 dni świąt — razem <strong>365 dni</strong>.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={calendar === 'sloneczny'}
            onClick={() => {
              setCalendar((c) => (c === 'ksiezycowy' ? 'sloneczny' : 'ksiezycowy'));
              setYears(0);
            }}
            className="flex items-center gap-3 border-2 px-3 py-2 font-semibold"
            style={{ borderColor: color }}
          >
            <span className="inline-block h-5 w-9 border p-0.5">
              <span className={cn('block h-full w-1/2 transition-transform', calendar === 'sloneczny' && 'translate-x-full')} style={{ background: color }} />
            </span>
            Kalendarz Egipcjan: 365 dni
          </button>
          {calendar === 'sloneczny' && (
            <p>
              {years < 10
                ? 'Teraz przesuń lata jeszcze raz — co najmniej do 11. roku.'
                : 'Święto żniw zostaje latem, rok po roku. Kalendarz trzyma się Słońca.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
