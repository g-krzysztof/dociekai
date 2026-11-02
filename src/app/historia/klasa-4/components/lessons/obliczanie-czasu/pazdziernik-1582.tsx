'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import { getCorePin } from '../../../lib/timeline/pins';
import { PrzypnijPinezke } from '../../timeline/przypnij-pinezke';
import { OCTOBER_1582, VANISHED_DAYS, judgeVanished, type Verdict } from './obliczanie';

/** Ile pikseli w dół trzeba pociągnąć kartkę, żeby się oderwała. */
const TEAR_PX = 70;

/**
 * Blok 4 — **Październik 1582** (`os-czasu`).
 *
 * Gest nowy w kursie: **zrywa kartki kalendarza ściennego** — chwyta kartkę i
 * ciągnie w dół, aż się oderwie: 1, 2, 3, 4… a pod czwartkiem 4 października
 * leży piątek 15. Dziecko liczy, ile dni zniknęło (sędzia wyłapuje 15 − 4),
 * a potem przypina na Osi dziejów pinezkę kalendarza gregoriańskiego.
 */
export function Pazdziernik1582({
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
  const [torn, setTorn] = useState(0);
  const [pull, setPull] = useState(0);
  const [answer, setAnswer] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const start = useRef<number | null>(null);

  const page = OCTOBER_1582[torn];
  const last = torn === OCTOBER_1582.length - 1;
  const canTear = !last;

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!canTear) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = e.clientY;
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (start.current === null) return;
    const dy = Math.max(0, e.clientY - start.current);
    if (dy >= TEAR_PX) {
      start.current = null;
      setPull(0);
      setTorn((t) => t + 1);
      return;
    }
    setPull(dy);
  };
  const onUp = () => {
    start.current = null;
    setPull(0);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Kalendarz z kartką na każdy dzień. <strong>Zrywaj kartki — chwyć i pociągnij w dół</strong>.
      </p>

      <div className="flex flex-wrap items-end gap-6">
        <div className="relative w-44 select-none" aria-live="polite">
          <div className="h-5 border-x-2 border-t-2 bg-muted" style={{ borderColor: color }} />
          {/* kartka pod spodem — następna */}
          {!last && (
            <div className="absolute inset-x-0 top-5">
              <Page day={OCTOBER_1582[torn + 1].day} weekday={OCTOBER_1582[torn + 1].weekday} />
            </div>
          )}
          <div
            className={cn('relative touch-none', canTear && 'cursor-grab')}
            style={{ transform: `translateY(${pull * 0.5}px) rotate(${pull * 0.08}deg)`, transformOrigin: 'top left' }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={(e) => {
              if (canTear && (e.key === 'ArrowDown' || e.key === 'Enter')) {
                e.preventDefault();
                setTorn((t) => t + 1);
              }
            }}
            role="button"
            tabIndex={canTear ? 0 : -1}
            aria-label={`Kartka: ${page.weekday}, ${page.day} października 1582${canTear ? ' — pociągnij w dół, żeby zerwać' : ''}`}
          >
            <Page day={page.day} weekday={page.weekday} highlight={last} color={color} />
          </div>
        </div>

        <div className="text-sm">
          <p className="text-xs text-muted-foreground">Zerwane kartki:</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {OCTOBER_1582.slice(0, torn).map((p) => (
              <span key={p.day} className="border bg-background px-2 py-0.5 font-mono tabular-nums" style={{ transform: `rotate(${(p.day % 3) * 3 - 3}deg)` }}>
                {p.day}
              </span>
            ))}
          </div>
        </div>
      </div>

      {last && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Po czwartku 4 października przyszedł piątek 15 października. Ile dni zniknęło?</p>
          <form
            className="flex flex-wrap items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (answer) setVerdict(judgeVanished(Number(answer)));
            }}
          >
            <input
              inputMode="numeric"
              value={answer}
              disabled={verdict?.ok}
              onChange={(e) => {
                setAnswer(e.target.value.replace(/\D/g, '').slice(0, 2));
                setVerdict(null);
              }}
              className="w-20 border-2 bg-background px-3 py-2 font-mono text-xl tabular-nums"
              style={{ borderColor: color }}
              aria-label="Ile dni zniknęło"
            />
            {!verdict?.ok && (
              <button type="submit" disabled={!answer} className="border-2 px-4 py-2 text-sm font-semibold disabled:opacity-40" style={{ borderColor: color }}>
                Sprawdź
              </button>
            )}
          </form>
          {verdict && (
            <p className={cn('text-sm leading-relaxed', !verdict.ok && 'text-destructive')} aria-live="polite">
              {verdict.ok ? <strong className="text-success">{verdict.message}</strong> : verdict.message}
            </p>
          )}
        </div>
      )}

      {verdict?.ok && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1" aria-label="Dni, których nie było: od 5 do 14 października 1582">
            {VANISHED_DAYS.map((d) => (
              <span key={d} className="border border-dashed px-2 py-1 font-mono text-sm tabular-nums text-muted-foreground line-through">
                {d}
              </span>
            ))}
          </div>
          <div className="border bg-muted/30 p-4 text-sm leading-relaxed" style={{ borderColor: color }}>
            <p>
              Dlaczego? Kalendarz Juliusza Cezara (od 46 r. p.n.e.) miał rok o długości 365 dni i ćwierć — co cztery lata
              dodawano dzień, <strong>29 lutego</strong>. Ale prawdziwy rok Słońca jest o 11 minut krótszy. Przez
              stulecia te minuty urosły do 10 dni: pierwszy dzień wiosny wypadał w kalendarzu już 11 marca zamiast 21.
            </p>
            <p className="mt-2">
              W 1582 roku papież <strong>Grzegorz XIII</strong> kazał te dni po prostu przeskoczyć i poprawił zasady
              lat przestępnych. Tak powstał <strong>kalendarz gregoriański</strong> — ten, który wisi dziś na Twojej
              ścianie. Polska przyjęła go od razu, w 1582 roku.
            </p>
          </div>
          <PrzypnijPinezke pin={getCorePin('kalendarz-gregorianski')} color={color} lesson={lesson} done={done} onPinned={onComplete} />
        </div>
      )}
    </div>
  );
}

function Page({ day, weekday, highlight, color }: { day: number; weekday: string; highlight?: boolean; color?: string }) {
  return (
    <div
      className="flex h-48 flex-col items-center justify-center border-2 bg-[#fffdf6] text-zinc-800 shadow-sm"
      style={{ borderColor: highlight ? color : '#d6d3d1' }}
    >
      <span className="text-[11px] font-semibold uppercase tracking-widest">październik 1582</span>
      <span className="font-serif text-7xl font-bold leading-none tabular-nums" style={highlight ? { color } : undefined}>
        {day}
      </span>
      <span className="mt-1 text-sm">{weekday}</span>
    </div>
  );
}
