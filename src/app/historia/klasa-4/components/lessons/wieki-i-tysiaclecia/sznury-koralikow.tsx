'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { BEADS_PER_STRING, judgeFirework, type Verdict } from './wieki';

/** Ile pikseli ciągnięcia nici nawleka jeden koralik. */
const PX_PER_BEAD = 7;

type Phase = 'pierwszy' | 'przewijanie' | 'sylwester' | 'gotowe';

/**
 * Blok 1 — **„Sylwester 1999”** (`haczyk`).
 *
 * Gest nowy w kursie: **ciągnie nić, a koraliki-lata same się nawlekają** —
 * tylko do przodu, sto miejsc na sznurze. Pierwszy koralik to rok 1, więc
 * pierwszy sznur zamyka koralik 100 (nie 99). Potem osiemnaście sznurów
 * nawleka się w przyspieszeniu, a na dwudziestym dziecko **stawia fajerwerk
 * za koralikiem, po którym naprawdę kończy się tysiąclecie** — sędzia liczy
 * puste miejsca na sznurze, nie ma klucza autora.
 */
export function SznuryKoralikow({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('pierwszy');
  const [threaded, setThreaded] = useState(0);
  const [boxes, setBoxes] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [firework, setFirework] = useState<number | null>(null);
  const reported = useRef(false);

  // Pierwszy sznur pełny → pudełko 1.
  useEffect(() => {
    if (phase === 'pierwszy' && threaded === BEADS_PER_STRING) setBoxes(1);
  }, [phase, threaded]);

  // Przyspieszenie: sznury 2…19 nawlekają się same.
  useEffect(() => {
    if (phase !== 'przewijanie') return;
    if (boxes >= 19) {
      setPhase('sylwester');
      return;
    }
    const t = window.setTimeout(() => setBoxes((b) => b + 1), 140);
    return () => window.clearTimeout(t);
  }, [phase, boxes]);

  useEffect(() => {
    if (phase === 'gotowe' && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [phase, onComplete]);

  const placeFirework = (year: number) => {
    const v = judgeFirework(year);
    setFirework(year);
    setVerdict(v);
    if (v.ok) {
      setBoxes(20);
      setPhase('gotowe');
    }
  };

  return (
    <div className="space-y-5">
      <Boxes count={boxes} color={color} />

      {phase === 'pierwszy' && (
        <FirstString color={color} threaded={threaded} onThread={setThreaded} onNext={() => setPhase('przewijanie')} />
      )}

      {phase === 'przewijanie' && (
        <p className="text-sm leading-relaxed" aria-live="polite">
          Nawlekamy dalej, sznur po sznurze… <strong className="tabular-nums">{boxes * 100}</strong> lat w pudełkach.
        </p>
      )}

      {(phase === 'sylwester' || phase === 'gotowe') && (
        <Sylwester color={color} firework={firework} verdict={verdict} solved={phase === 'gotowe'} onPlace={placeFirework} />
      )}
    </div>
  );
}

/** Rząd pudełek: każde to jeden pełny sznur, czyli sto lat. */
function Boxes({ count, color }: { count: number; color: string }) {
  return (
    <div>
      <div className="grid grid-cols-10 gap-1" aria-label={`Pełne pudełka: ${count} z 20`}>
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className={cn('flex h-7 items-center justify-center border text-[10px] tabular-nums transition-colors sm:h-8')}
            style={i < count ? { background: `color-mix(in oklch, ${color} 22%, transparent)`, borderColor: color } : undefined}
          >
            {i < count ? i + 1 : ''}
          </div>
        ))}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Pudełka po sto lat — w każdym jeden pełny sznur.</p>
    </div>
  );
}

function Bead({ year, filled, color, mark }: { year: number; filled: boolean; color: string; mark?: boolean }) {
  return (
    <span
      className={cn('flex aspect-square items-center justify-center rounded-full border text-[9px] leading-none tabular-nums sm:text-[10px]')}
      style={
        filled
          ? {
              background: year % 10 === 0 ? color : `color-mix(in oklch, ${color} 35%, white)`,
              borderColor: color,
              color: year % 10 === 0 ? 'white' : undefined,
              boxShadow: mark ? '0 0 0 2px var(--foreground)' : undefined,
            }
          : { borderStyle: 'dashed' }
      }
    >
      {filled && (year % 10 === 0 || year % 100 === 1) ? year : ''}
    </span>
  );
}

/**
 * Pierwszy sznur: nić ciągnie się w prawo (tylko do przodu), każde kilka
 * pikseli nawleka koralik. Sznur ma sto miejsc w dziesięciu rzędach.
 */
function FirstString({
  color,
  threaded,
  onThread,
  onNext,
}: {
  color: string;
  threaded: number;
  onThread: (n: number) => void;
  onNext: () => void;
}) {
  const drag = useRef<{ x: number; carry: number } | null>(null);
  const full = threaded === BEADS_PER_STRING;

  const add = (n: number) => onThread(Math.min(BEADS_PER_STRING, threaded + n));

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (full) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, carry: 0 };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    d.x = e.clientX;
    if (dx <= 0) return; // nici nie da się wepchnąć z powrotem
    d.carry += dx;
    const beads = Math.floor(d.carry / PX_PER_BEAD);
    if (beads > 0) {
      d.carry -= beads * PX_PER_BEAD;
      add(beads);
    }
  };
  const stop = () => {
    drag.current = null;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight') return;
    e.preventDefault();
    add(e.shiftKey ? 10 : 1);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Każdy koralik to jeden rok naszej ery. Pierwszy to <strong>rok 1</strong> — roku zero nie było. Ciągnij nić w
        prawo, a koraliki same się nawleką. Zatrzymaj się na chwilę przy 99.
      </p>

      <div className="grid max-w-sm grid-cols-10 gap-1 sm:gap-1.5" aria-label={`Nawleczone koraliki: ${threaded} ze 100`}>
        {Array.from({ length: BEADS_PER_STRING }, (_, i) => (
          <Bead key={i} year={i + 1} filled={i < threaded} color={color} mark={i + 1 === threaded} />
        ))}
      </div>

      <div
        role="slider"
        tabIndex={full ? -1 : 0}
        aria-label="Nić — ciągnij w prawo"
        aria-valuemin={0}
        aria-valuemax={BEADS_PER_STRING}
        aria-valuenow={threaded}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={stop}
        onPointerCancel={stop}
        onKeyDown={onKeyDown}
        className={cn(
          'relative flex h-12 max-w-sm touch-none select-none items-center border bg-muted/40 px-3 outline-none focus-visible:ring-2',
          full ? 'opacity-50' : 'cursor-ew-resize'
        )}
      >
        <span className="h-0.5 flex-1" style={{ background: color }} aria-hidden />
        <span className="ml-2 text-xs font-semibold" style={{ color }}>
          {full ? 'sznur pełny' : 'ciągnij nić →'}
        </span>
      </div>

      <p className="min-h-[2.5rem] text-sm leading-relaxed" aria-live="polite">
        {threaded === 0 && 'Sznur jest pusty.'}
        {threaded > 0 && threaded < 99 && (
          <>
            Ostatni koralik: <strong className="tabular-nums">rok {threaded}</strong>.
          </>
        )}
        {threaded === 99 && (
          <>
            Koralik 99 — i <strong>jedno puste miejsce</strong> na sznurze. Pierwsze sto lat jeszcze się nie skończyło.
          </>
        )}
        {full && (
          <>
            <strong>Rok 100 zamyka sznur.</strong> Pierwsze sto lat naszej ery to lata od 1 do 100 — i tak się liczy
            każdy wiek. Sznur ląduje w pudełku.
          </>
        )}
      </p>

      {full && (
        <button
          type="button"
          onClick={onNext}
          className="border-2 px-4 py-2 text-sm font-semibold"
          style={{ borderColor: color, color }}
        >
          Nawlecz następne sznury aż do Sylwestra 1999
        </button>
      )}
    </div>
  );
}

const LAST_ROW = Array.from({ length: 10 }, (_, i) => 1991 + i);
const NEXT_ROW = Array.from({ length: 10 }, (_, i) => 2001 + i);

/**
 * Dwudziesty sznur w Sylwestra 1999: ostatni rząd (1991–2000) z jednym
 * pustym miejscem i obok pierwszy rząd sznura dwudziestego pierwszego.
 * Dziecko przeciąga fajerwerk na koralik, po którym kończy się tysiąclecie.
 */
function Sylwester({
  color,
  firework,
  verdict,
  solved,
  onPlace,
}: {
  color: string;
  firework: number | null;
  verdict: Verdict | null;
  solved: boolean;
  onPlace: (year: number) => void;
}) {
  const [armed, setArmed] = useState(false);
  const { bind, drag, hover } = useDragToken({
    disabled: solved,
    onDrop: (_id, target) => {
      if (target?.startsWith('rok-')) onPlace(Number(target.slice(4)));
    },
    onTap: () => setArmed((a) => !a),
  });

  const slot = (year: number, filled: boolean) => {
    const here = firework === year;
    const over = hover === `rok-${year}`;
    return (
      <button
        key={year}
        type="button"
        data-drop={`rok-${year}`}
        disabled={solved}
        onClick={() => {
          if (armed) {
            setArmed(false);
            onPlace(year);
          }
        }}
        className={cn('relative flex flex-col items-center gap-0.5 p-0.5', over && 'bg-muted')}
        aria-label={`Postaw fajerwerk za rokiem ${year}`}
      >
        <span className="h-4 text-amber-500" aria-hidden>
          {here && <Sparkles className={cn('h-4 w-4', verdict?.ok ? '' : 'opacity-60')} />}
        </span>
        <span className="w-full">
          <Bead year={year} filled={filled} color={color} />
        </span>
        <span className="text-[9px] tabular-nums text-muted-foreground">{year}</span>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        31 grudnia 1999 roku ludzie na całym świecie świętowali <strong>koniec drugiego tysiąclecia</strong>. Tak wyglądał
        wtedy dwudziesty sznur. <strong>Przeciągnij fajerwerk</strong> za koralik, po którym naprawdę kończy się
        tysiąclecie (albo stuknij fajerwerk, potem koralik).
      </p>

      <div className="max-w-md space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Sznur 20 — ostatni rząd</p>
        <div className="grid grid-cols-10 gap-0.5 sm:gap-1">
          {LAST_ROW.map((y) => slot(y, y < 2000 || solved))}
        </div>
        <p className="text-xs font-semibold text-muted-foreground">Sznur 21 — pierwszy rząd</p>
        <div className="grid grid-cols-10 gap-0.5 sm:gap-1">{NEXT_ROW.map((y) => slot(y, false))}</div>
      </div>

      {!solved && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            {...bind('fajerwerk')}
            className={cn(
              'flex touch-none select-none items-center gap-2 border-2 px-3 py-2 text-sm font-semibold',
              armed && 'bg-muted'
            )}
            style={{ borderColor: color }}
          >
            <Sparkles className="h-4 w-4 text-amber-500" aria-hidden /> fajerwerk
          </button>
          {armed && <span className="text-xs text-muted-foreground">Teraz stuknij koralik.</span>}
        </div>
      )}
      <DragGhost drag={drag}>
        <span className="flex items-center gap-1 border-2 bg-background px-2 py-1 text-sm" style={{ borderColor: color }}>
          <Sparkles className="h-4 w-4 text-amber-500" aria-hidden /> fajerwerk
        </span>
      </DragGhost>

      {verdict && (
        <p className={cn('text-sm leading-relaxed', !verdict.ok && 'text-destructive')} aria-live="polite">
          {verdict.ok && <strong className="text-success">Tak. </strong>}
          {verdict.ok ? verdict.message.replace(/^Tak\. /, '') : verdict.message}
        </p>
      )}
      {solved && (
        <p className="text-sm leading-relaxed">
          Dwadzieścia pełnych sznurów to <strong>dwa tysiąclecia</strong>. Trzecie tysiąclecie i XXI wiek zaczęły się
          1 stycznia 2001 roku — od pierwszego koralika nowego sznura. Ludzie świętowali o rok za wcześnie, bo „2000”
          wyglądało jak okrągły początek.
        </p>
      )}
    </div>
  );
}
