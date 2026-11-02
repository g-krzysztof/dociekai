'use client';

import { useRef, useState, type PointerEvent } from 'react';
import type { GameProps } from '../types';

/**
 * Dział 3 — **POMNIEJSZ!** Uchwyt narożny obrazka, taki jak w `StretchTest`:
 * ciągnięcie za róg zmienia szerokość i wysokość **niezależnie**, więc łatwo
 * zniekształcić rysunek. Cel to mniej więcej połowa szerokości — ale słońce ma
 * zostać okrągłe. Dziecko widzi zniekształcenie na własne oczy (owal zamiast
 * koła); żadna linia pomocnicza go nie prowadzi.
 *
 * Sprawdzenie następuje przy puszczeniu uchwytu, więc w czasie gry można
 * próbować kilka razy.
 */

const W0 = 200;
const H0 = 150;
const ORIGIN = 12;
const MIN_W = 40;
const MIN_H = 30;

export function ShrinkGame({ finish }: GameProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: W0, h: H0 });
  const [dragging, setDragging] = useState(false);
  const [verdict, setVerdict] = useState<string | null>(null);

  const measure = (event: PointerEvent<HTMLElement>) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return size;
    return {
      w: Math.round(Math.max(MIN_W, Math.min(rect.width - ORIGIN - 4, event.clientX - rect.left - ORIGIN))),
      h: Math.round(Math.max(MIN_H, Math.min(rect.height - ORIGIN - 4, event.clientY - rect.top - ORIGIN))),
    };
  };

  const onDown = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    setVerdict(null);
  };
  const onMove = (event: PointerEvent<HTMLElement>) => {
    if (dragging) setSize(measure(event));
  };
  const onUp = (event: PointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!dragging) return;
    setDragging(false);
    const next = measure(event);
    setSize(next);
    const ratio = next.w / next.h;
    const shapeOk = ratio >= 1.22 && ratio <= 1.45;
    const sizeOk = next.w >= 84 && next.w <= 118;
    if (shapeOk && sizeOk) {
      finish(true);
      return;
    }
    setVerdict(!shapeOk ? 'Obrazek się zniekształcił — słońce nie jest okrągłe.' : next.w > 118 ? 'Jeszcze za duży.' : 'Za mały.');
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={boxRef} className="relative min-h-[15rem] flex-1 overflow-hidden bg-muted/40">
        <svg
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${W0} ${H0}`}
          preserveAspectRatio="none"
          className="absolute shadow"
          style={{ left: ORIGIN, top: ORIGIN }}
          role="img"
          aria-label="Obrazek ze słońcem, wzgórzem i domkiem"
        >
          <rect width={W0} height={H0} fill="#bfe3f7" />
          <circle cx="150" cy="42" r="24" fill="#fcd34d" />
          <path d="M0 150 L0 104 Q50 70 100 104 T200 96 L200 150 Z" fill="#86c98a" />
          <rect x="40" y="86" width="42" height="34" fill="#f5e1c0" />
          <path d="M34 88 L61 62 L88 88 Z" fill="#d9776a" />
          <rect x="54" y="100" width="14" height="20" fill="#8a6a4a" />
        </svg>
        <button
          type="button"
          aria-label="Uchwyt zmiany rozmiaru obrazka — przeciągnij"
          className="absolute h-7 w-7 cursor-nwse-resize border-2 border-slate-700 bg-white shadow"
          style={{ left: ORIGIN + size.w - 14, top: ORIGIN + size.h - 14, touchAction: 'none' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
      </div>
      <p className="mt-2 min-h-[1.25rem] text-xs tabular-nums text-muted-foreground">
        Szerokość: {size.w} px (na starcie {W0}). {verdict}
      </p>
    </div>
  );
}
