'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import { hieroglyphFont, phoenicianFont } from './fonts';
import { ALEF_STAGES, ALEF_TURN, snaps, type AlefStage } from './pismo';

/**
 * Blok 4 (oś czasu): **z głowy wołu litera A.** Dziecko obraca znak palcem po
 * okręgu: egipski hieroglif głowy wołu → ćwierć obrotu → fenicki alef →
 * jeszcze ćwierć → grecka alfa (głowa wołu rogami w dół) → Rzymianie
 * przejmują A. Każde przejście przesuwa znacznik na osi lat pod tarczą.
 * Pod tarczą stoi cień następnego znaku — obrót „klika”, gdy znak się na
 * niego nałoży (± 16°). Znaki z fontów Noto (OFL).
 */

const AXIS_FROM = -2700;
const AXIS_TO = 2026;
const axisPct = (year: number) => ((year - AXIS_FROM) / (AXIS_TO - AXIS_FROM)) * 100;

function fontClass(s: AlefStage) {
  if (s.font === 'egipski') return hieroglyphFont.className;
  if (s.font === 'fenicki') return phoenicianFont.className;
  if (s.font === 'lacinski') return 'font-serif';
  return '';
}

function angleOf(e: { clientX: number; clientY: number }, el: Element) {
  const r = el.getBoundingClientRect();
  return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
}

export function AlefWidget({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [stage, setStage] = useState(0);
  const [rot, setRot] = useState(0);
  const [snapFlash, setSnapFlash] = useState(false);
  const last = useRef<number | null>(null);
  const reported = useRef(false);

  const cur = ALEF_STAGES[stage];
  const nextStage = ALEF_STAGES[stage + 1];
  const finished = stage === ALEF_STAGES.length - 1;
  const rotating = stage < 2;

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [finished, onComplete]);

  const trySnap = (r: number) => {
    if (rotating && snaps(r, ALEF_TURN[stage])) {
      setStage((s) => s + 1);
      setRot(0);
      setSnapFlash(true);
      window.setTimeout(() => setSnapFlash(false), 500);
      return true;
    }
    return false;
  };

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!rotating) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = angleOf(e, e.currentTarget);
  };

  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (last.current === null) return;
    const a = angleOf(e, e.currentTarget);
    let d = a - last.current;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    last.current = a;
    setRot((r) => Math.max(-200, Math.min(60, r + d)));
  };

  const up = () => {
    if (last.current === null) return;
    last.current = null;
    trySnap(rot);
  };

  const nudge = (d: number) => {
    const r = Math.max(-200, Math.min(60, rot + d));
    if (!trySnap(r)) setRot(r);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        {rotating ? (
          <>
            <strong>Obróć znak palcem</strong> (kręć po tarczy) tak, żeby nałożył się na cień — o ćwierć obrotu w
            lewo. Zobaczysz, co z niego zrobili {nextStage.people}.
          </>
        ) : !finished ? null : (
          <>Litera przeszła przez cztery ludy i ponad dwa tysiące lat — i trafiła do twojego zeszytu.</>
        )}
      </p>

      <div className="grid items-center gap-4 sm:grid-cols-[240px_1fr]">
        <div
          className={`relative mx-auto aspect-square w-full max-w-[240px] touch-none select-none rounded-full border-2 ${rotating ? 'cursor-grab' : ''}`}
          style={{ borderColor: snapFlash ? color : undefined, backgroundColor: snapFlash ? `${color}18` : undefined }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={() => (last.current = null)}
          role={rotating ? 'slider' : 'img'}
          aria-label={rotating ? `Obrót znaku ${cur.name}: ${Math.round(rot)} stopni` : `Litera ${cur.name}`}
          aria-valuenow={rotating ? Math.round(rot) : undefined}
          aria-valuemin={rotating ? -200 : undefined}
          aria-valuemax={rotating ? 60 : undefined}
          tabIndex={rotating ? 0 : -1}
          onKeyDown={(e) => {
            if (!rotating) return;
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              nudge(-15);
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              nudge(15);
            }
          }}
        >
          {rotating && nextStage && (
            <span
              className={`${fontClass(nextStage)} pointer-events-none absolute inset-0 flex items-center justify-center text-[110px] leading-none opacity-15`}
              aria-hidden
            >
              {nextStage.glyph}
            </span>
          )}
          <span
            className={`${fontClass(cur)} pointer-events-none absolute inset-0 flex items-center justify-center text-[110px] leading-none`}
            style={{ transform: `rotate(${Math.round(rot)}deg)`, color }}
            aria-hidden
          >
            {cur.glyph}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            {cur.people} · {cur.when}
          </p>
          <p className="text-lg font-semibold">{cur.name}</p>
          <p className="text-sm leading-relaxed">{cur.note}</p>
          {rotating && (
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => nudge(-15)} className="inline-flex items-center gap-1 border px-3 py-1.5 text-sm" aria-label="Obróć w lewo o 15 stopni">
                <RotateCcw className="h-4 w-4" /> w lewo
              </button>
              <button type="button" onClick={() => nudge(15)} className="inline-flex items-center gap-1 border px-3 py-1.5 text-sm" aria-label="Obróć w prawo o 15 stopni">
                <RotateCw className="h-4 w-4" /> w prawo
              </button>
            </div>
          )}
          {stage === 2 && (
            <button
              type="button"
              onClick={() => setStage(3)}
              className="border px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color, borderColor: color }}
            >
              Przekaż literę Rzymianom
            </button>
          )}
        </div>
      </div>

      {/* oś lat pod tarczą */}
      <div className="relative mx-2 h-16" aria-label="Oś lat od 2700 p.n.e. do dziś">
        <div className="absolute inset-x-0 top-6 border-t-2" />
        <div className="absolute top-3 h-6 border-l-2 border-dashed" style={{ left: `${axisPct(0)}%` }} aria-hidden />
        <span className="absolute top-10 -translate-x-1/2 text-[10px] text-muted-foreground" style={{ left: `${axisPct(0)}%` }}>
          1 n.e.
        </span>
        <span className="absolute top-10 right-0 text-[10px] text-muted-foreground">dziś</span>
        {ALEF_STAGES.map((s, i) =>
          i <= stage ? (
            <span
              key={s.id}
              className={`${fontClass(s)} absolute top-0 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-background text-sm leading-none transition-all duration-500`}
              style={{ left: `${axisPct(s.year)}%`, borderColor: color, zIndex: i }}
              title={`${s.name}, ${s.when}`}
            >
              {s.glyph}
            </span>
          ) : null
        )}
        <span
          className="absolute top-10 whitespace-nowrap text-[10px] font-semibold"
          style={{
            left: `${axisPct(cur.year)}%`,
            transform: axisPct(cur.year) < 15 ? 'translateX(-12px)' : 'translateX(-50%)',
            color,
          }}
        >
          {cur.when}
        </span>
      </div>

      {finished && (
        <div className="space-y-2 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <p>
            Sprawdź sam/a: odwróć literę A do góry nogami —{' '}
            <span className="inline-block rotate-180 font-serif text-xl font-bold" style={{ color }}>
              A
            </span>{' '}
            — i zobaczysz głowę wołu z dwoma rogami. Z rysunku wołu najpierw zrobiła się litera Fenicjan,
            potem Greków, a w końcu Rzymian. Podobną drogę przeszła większość liter, którymi piszesz.
          </p>
        </div>
      )}
    </div>
  );
}
