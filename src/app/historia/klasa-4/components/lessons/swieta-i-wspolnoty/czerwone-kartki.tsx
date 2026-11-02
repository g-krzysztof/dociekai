'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { OsDziejow } from '../../timeline/os-dziejow';
import { AXIS_FROM, AXIS_TO, HOLIDAYS, judgeKartka, type Holiday } from './swieta';

const RED = '#DC143C';
const SPAN = AXIS_TO - AXIS_FROM;
const LAT = { one: 'rok', few: 'lata', many: 'lat' };

interface Drag {
  id: Holiday['id'];
  x: number;
  y: number;
  sx: number;
  sy: number;
  moved: boolean;
}

/** Kartka z kalendarza ściennego: czerwona cyfra dnia, miesiąc i nazwa święta. */
function Kartka({ h, small = false }: { h: Holiday; small?: boolean }) {
  return (
    <span className={cn('flex flex-col items-center border bg-white text-center shadow-sm dark:bg-zinc-900', small ? 'w-12' : 'w-full')}>
      <span className="block w-full py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white" style={{ background: RED }}>
        {h.month}
      </span>
      <span className={cn('block font-serif font-bold leading-none', small ? 'py-1 text-xl' : 'py-2 text-4xl')} style={{ color: RED }}>
        {h.day}
      </span>
    </span>
  );
}

/**
 * L11 blok 2 — czerwone kartki kalendarza. Dziecko czyta, co upamiętnia
 * każde z trzech świąt państwowych, i **przenosi kartkę kalendarza na oś lat
 * 1760–2030** do roku wydarzenia; przy dobrym roku kartka się przykleja, a od
 * niej do dziś rośnie pasek „tyle lat pamiętamy”. Pinezki 1791, 1918 i 1920
 * na Osi dziejów wynikają z zaliczenia bloku.
 */
export function CzerwoneKartki({
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Holiday['id']>(HOLIDAYS[0].id);
  const [stuck, setStuck] = useState<Partial<Record<Holiday['id'], true>>>({});
  const [drag, setDrag] = useState<Drag | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const reported = useRef(false);
  const now = new Date().getFullYear();

  const allStuck = HOLIDAYS.every((h) => stuck[h.id]);
  useEffect(() => {
    if (allStuck && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [allStuck, onComplete]);

  const yearAt = (clientX: number, clientY: number, strict: boolean) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r) return null;
    if (strict && (clientY < r.top - 70 || clientY > r.bottom + 40)) return null;
    const u = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
    return AXIS_FROM + u * SPAN;
  };

  const drop = (id: Holiday['id'], year: number) => {
    const h = HOLIDAYS.find((x) => x.id === id)!;
    const v = judgeKartka(h, year);
    if (v.ok) {
      setStuck((s) => ({ ...s, [id]: true }));
      setMessage(null);
      const next = HOLIDAYS.find((x) => x.id !== id && !stuck[x.id]);
      if (next) setSelected(next.id);
    } else {
      setMessage(v.message);
    }
  };

  const start = (id: Holiday['id'], e: ReactPointerEvent) => {
    if (stuck[id]) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    setSelected(id);
    setDrag({ id, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false });
  };
  const move = (e: ReactPointerEvent) => {
    if (!drag) return;
    setDrag({ ...drag, x: e.clientX, y: e.clientY, moved: drag.moved || Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6 });
  };
  const end = (e: ReactPointerEvent) => {
    if (!drag) return;
    if (drag.moved) {
      const y = yearAt(e.clientX, e.clientY, true);
      if (y !== null) drop(drag.id, y);
    }
    setDrag(null);
  };

  const onTrackClick = (e: React.MouseEvent) => {
    if (stuck[selected]) return;
    const y = yearAt(e.clientX, e.clientY, false);
    if (y !== null) drop(selected, y);
  };

  const h = HOLIDAYS.find((x) => x.id === selected)!;
  const pct = (year: number) => `${((year - AXIS_FROM) / SPAN) * 100}%`;
  const ghostYear = drag?.moved ? yearAt(drag.x, drag.y, true) : null;
  const ticks = Array.from({ length: SPAN / 10 + 1 }, (_, i) => AXIS_FROM + i * 10);
  const showAll = done || allStuck;

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        W kalendarzu są dni zaznaczone na czerwono — wtedy nie idziesz do szkoły. Trzy z nich to
        <strong> święta państwowe</strong>. Stuknij kartkę i przeczytaj, o czym przypomina. Potem
        przenieś ją na oś do roku, w którym to się stało (albo stuknij kartkę, a potem miejsce na osi).
      </p>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {HOLIDAYS.map((x) => (
          <button
            key={x.id}
            type="button"
            onPointerDown={(e) => start(x.id, e)}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={() => setDrag(null)}
            onClick={() => setSelected(x.id)}
            disabled={!!stuck[x.id] || done}
            className={cn(
              'touch-none cursor-grab p-1 disabled:cursor-default',
              selected === x.id && !stuck[x.id] && !done && 'ring-2',
              (stuck[x.id] || done) && 'opacity-40'
            )}
            style={{ '--tw-ring-color': color } as React.CSSProperties}
            aria-label={`${x.day} ${x.month} — ${x.name}`}
          >
            <Kartka h={x} />
            <span className="mt-1 block text-[11px] leading-tight">{x.name}</span>
          </button>
        ))}
      </div>

      {!showAll && (
        <div className="border-l-2 bg-muted/30 px-3 py-2" style={{ borderColor: RED }} aria-live="polite">
          <p className="text-xs font-semibold" style={{ color: RED }}>
            {h.day} {h.month} · {h.name}
          </p>
          <p>{h.story}</p>
          {h.note && <p className="mt-1 text-xs text-muted-foreground">{h.note}</p>}
        </div>
      )}

      {/* Oś lat 1760–2030 */}
      <div className="px-2 pb-1 pt-2">
        <div ref={trackRef} className="relative h-28 touch-none select-none" onClick={onTrackClick}>
          {/* paski „tyle lat pamiętamy” */}
          {HOLIDAYS.map((x, i) =>
            stuck[x.id] || done ? (
              <div
                key={x.id}
                className="absolute h-4 text-[10px] font-semibold leading-4 text-white"
                style={{ left: pct(x.year), width: `calc(${pct(now)} - ${pct(x.year)})`, top: 4 + i * 18, background: `${RED}cc` }}
              >
                <span className="whitespace-nowrap pl-1">{now - x.year} {plural(now - x.year, LAT)}</span>
              </div>
            ) : null
          )}
          <div className="absolute inset-x-0 top-[66px] h-0.5 bg-foreground/60" />
          {ticks.map((t) => (
            <div key={t} className="absolute top-[62px]" style={{ left: pct(t) }}>
              <div className={cn('w-px bg-foreground/50', t % 50 === 0 ? 'h-3' : 'h-1.5')} style={{ marginTop: t % 50 === 0 ? 0 : 3 }} />
              {t % 50 === 0 && <span className="absolute left-0 top-4 -translate-x-1/2 font-mono text-[10px] text-muted-foreground">{t}</span>}
            </div>
          ))}
          <div className="absolute top-[56px] -translate-x-1/2 text-[10px] font-semibold" style={{ left: pct(now), color }}>
            ▼
          </div>
          <span className="absolute top-[84px] -translate-x-1/2 text-[10px] font-semibold" style={{ left: pct(now), color }}>
            dziś
          </span>
          {/* przyklejone kartki — znaczniki */}
          {HOLIDAYS.map((x) =>
            stuck[x.id] || done ? (
              <span
                key={x.id}
                className="absolute top-[60px] h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white"
                style={{ left: pct(x.year), background: RED }}
                title={`${x.year}`}
              />
            ) : null
          )}
          {ghostYear !== null && (
            <div className="absolute top-[52px] -translate-x-1/2 font-mono text-xs font-bold" style={{ left: pct(ghostYear), color: RED }}>
              {Math.round(ghostYear)}
            </div>
          )}
        </div>
      </div>

      {drag?.moved &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full" style={{ left: drag.x, top: drag.y - 8 }}>
            <Kartka h={HOLIDAYS.find((x) => x.id === drag.id)!} small />
          </div>,
          document.body
        )}

      {message && (
        <p className="text-destructive" aria-live="polite">
          {message}
        </p>
      )}

      {showAll && (
        <div className="space-y-3">
          <div className="space-y-2 p-3" style={{ backgroundColor: `${color}14` }}>
            <p className="flex items-center gap-2 font-semibold" style={{ color }}>
              <Check className="h-4 w-4" aria-hidden /> Trzy kartki, trzy wydarzenia.
            </p>
            <p>
              Kalendarz jest kartkowany co roku od nowa, a mimo to te same dni wracają na czerwono.
              Święto państwowe to umowa całej wspólnoty: <strong>tego dnia wszyscy pamiętamy o tym samym</strong> —
              w Lublinie, w Wilnie i w Chicago. Dlatego te trzy wydarzenia wiszą też na twojej Osi dziejów.
            </p>
          </div>
          <OsDziejow color={color} lesson={lesson} highlightIds={['konstytucja', 'niepodleglosc', 'bitwa-warszawska']} />
        </div>
      )}
    </div>
  );
}
