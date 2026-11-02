'use client';

import Image from 'next/image';
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { PAPYRUS_STOPS } from './waga';
import { img } from '@/lib/media';

/**
 * Blok 2 L20, część A — **prowadzi zmarłego palcem po papirusie**. Pod
 * prawdziwą fotografią Księgi Umarłych Hunefera biegnie ścieżka; dziecko
 * przesuwa po niej żeton zmarłego od lewej do prawej. Przy każdej postaci
 * żeton przystaje, nad fotografią zapala się znacznik i pojawia się podpis:
 * kim jest bóg, po czym go poznać, co robi w tej scenie. Gotowe, gdy zmarły
 * minie wszystkie postacie.
 */

const IMG = img('/images/historia/lekcje/bogowie-mumie-piramidy/papirus-hunefera.jpg');
const SNAP = 0.035;

export function PapirusWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [x, setX] = useState(0.02);
  const [visited, setVisited] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const nearest = PAPYRUS_STOPS.reduce((best, s) => (Math.abs(s.x - x) < Math.abs(best.x - x) ? s : best), PAPYRUS_STOPS[0]);
  const active = Math.abs(nearest.x - x) <= SNAP ? nearest : null;

  const moveTo = (nx: number) => {
    const clamped = Math.max(0.02, Math.min(0.97, nx));
    setX(clamped);
    const near = PAPYRUS_STOPS.find((s) => Math.abs(s.x - clamped) <= SNAP);
    if (near && !visited.includes(near.id)) {
      const next = [...visited, near.id];
      setVisited(next);
      if (next.length === PAPYRUS_STOPS.length && !finished) {
        setFinished(true);
        onDone();
      }
    }
  };

  const fromClient = (clientX: number) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (!r) return x;
    return (clientX - r.left) / r.width;
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // bez przechwycenia też działa
    }
    dragging.current = true;
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) moveTo(fromClient(e.clientX));
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = PAPYRUS_STOPS.findIndex((s) => s.x > x + 0.001);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      moveTo(i === -1 ? 0.97 : PAPYRUS_STOPS[i].x);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = [...PAPYRUS_STOPS].reverse().find((s) => s.x < x - 0.001);
      moveTo(prev ? prev.x : 0.02);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Image
          src={IMG}
          alt="Fotografia prawdziwego papirusu: po lewej mężczyzna w białej szacie prowadzony za rękę przez postać z głową szakala; pośrodku wielka waga, przy niej klęczy postać z głową szakala, obok potwór z głową krokodyla, dalej postać z głową ibisa pisze na tabliczce; postać z głową sokoła prowadzi mężczyznę do siedzącego na tronie boga w białej koronie i z zieloną skórą, za tronem stoją dwie kobiety; w górnym pasie rząd siedzących bóstw i hieroglify"
          width={1280}
          height={582}
          className="h-auto w-full border"
        />
        {PAPYRUS_STOPS.map((s) => (
          <span
            key={s.id}
            aria-hidden
            className="pointer-events-none absolute bottom-0 top-[30%] w-0.5 transition-opacity"
            style={{
              left: `${s.x * 100}%`,
              background: color,
              opacity: active?.id === s.id ? 0.9 : visited.includes(s.id) ? 0.25 : 0,
            }}
          />
        ))}
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">
        Księga Umarłych pisarza Hunefera, ok. 1300 r. p.n.e., British Museum. Fot. Wikimedia Commons, domena publiczna.
      </p>

      <div ref={trackRef} className="relative h-12 border-y border-dashed" style={{ borderColor: color }}>
        {PAPYRUS_STOPS.map((s) => (
          <span
            key={s.id}
            aria-hidden
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{ left: `${s.x * 100}%`, background: visited.includes(s.id) ? color : 'transparent', borderColor: color }}
          />
        ))}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Zmarły Hunefer — prowadź go po papirusie w prawo"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(x * 100)}
          aria-valuetext={active ? active.name : undefined}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          onKeyDown={onKey}
          className="absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-full border-2 bg-white shadow-sm dark:bg-zinc-900"
          style={{ left: `${x * 100}%`, borderColor: color }}
        >
          <svg viewBox="0 0 20 20" className="h-6 w-6" aria-hidden>
            <circle cx={10} cy={5} r={3} fill="#3a2e22" />
            <path d="M 6 9 L 14 9 L 15 19 L 5 19 Z" fill="#f4efe4" stroke="#8a7a62" strokeWidth={0.8} />
          </svg>
        </div>
      </div>

      <div className="min-h-[96px] border p-3 text-sm leading-relaxed" aria-live="polite">
        {active ? (
          <>
            <p className="font-semibold" style={{ color }}>
              {active.name} <span className="font-normal text-muted-foreground">· znak: {active.sign}</span>
            </p>
            <p className="mt-1">{active.text}</p>
          </>
        ) : (
          <p className="text-muted-foreground">
            {visited.length === 0
              ? 'Chwyć zmarłego pod papirusem i poprowadź go w prawo — przez cały sąd.'
              : `Prowadź dalej. Minięte postacie: ${visited.length} z ${PAPYRUS_STOPS.length}.`}
          </p>
        )}
      </div>

      {finished && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Policz bogów w jednej tej scenie: Anubis, Thot, Horus, Ozyrys, Izyda, Neftyda — a w górnym pasie siedzi jeszcze cały rząd
          sędziów. Na papirusie brakuje najważniejszego: <strong>Ra</strong>, boga słońca z głową sokoła i tarczą słońca nad nią. Egipcjanie
          wierzyli, że co dzień przepływa łodzią po niebie. Wiara w wielu bogów, z których każdy opiekuje się czymś innym, to{' '}
          <strong>politeizm</strong> (z greckiego: „wielu bogów”).
        </p>
      )}
    </div>
  );
}
