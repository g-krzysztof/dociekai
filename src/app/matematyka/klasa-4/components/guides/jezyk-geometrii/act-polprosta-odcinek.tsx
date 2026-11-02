'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GuideAct } from '../guide-act';
import { POINT_A, POINT_B, arrowheadPoints, extendPoint, type GeoPoint } from './guide-content';

type PointId = 'A' | 'B';
type Mode = 'odcinek' | 'polprosta';

const POINTS: Record<PointId, GeoPoint> = { A: POINT_A, B: POINT_B };
const POSITIONS: Record<PointId, { left: string; top: string }> = {
  A: { left: `${(POINT_A.x / 400) * 100}%`, top: `${(POINT_A.y / 220) * 100}%` },
  B: { left: `${(POINT_B.x / 400) * 100}%`, top: `${(POINT_B.y / 220) * 100}%` },
};

const MODE_OPTIONS: { key: Mode; label: string }[] = [
  { key: 'odcinek', label: 'Odcinek' },
  { key: 'polprosta', label: 'Półprosta' },
];

export function ActPolprostaOdcinek({ color }: { color: string }) {
  return (
    <GuideAct id="polprosta-odcinek" mode="flow">
      <PolprostaOdcinekBody color={color} />
    </GuideAct>
  );
}

function PolprostaOdcinekBody({ color }: { color: string }) {
  const [mode, setMode] = useState<Mode>('odcinek');
  const [order, setOrder] = useState<PointId[]>([]);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const handlePick = (id: PointId) => {
    setOrder((prev) => {
      if (prev.length >= 2) return [id];
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  };

  const handleSwap = () => {
    setOrder((prev) => (prev.length === 2 ? [prev[1], prev[0]] : prev));
  };

  const complete = order.length === 2;
  const [firstId, secondId] = order;

  let lineEl: React.ReactNode = null;
  let caption = 'Kliknij oba punkty w wybranej kolejności, żeby zbudować nazwę.';

  if (complete) {
    if (mode === 'odcinek') {
      lineEl = (
        <line x1={POINT_A.x} y1={POINT_A.y} x2={POINT_B.x} y2={POINT_B.y} stroke={color} strokeWidth={3} />
      );
      caption = `odcinek ${firstId}${secondId} — to ten sam odcinek co ${secondId}${firstId}, kolejność liter bez znaczenia`;
    } else {
      const from = POINTS[firstId];
      const through = POINTS[secondId];
      const tip = extendPoint(from, through, 70);
      const arrow = arrowheadPoints(from, tip);
      lineEl = (
        <>
          <line x1={from.x} y1={from.y} x2={tip.x} y2={tip.y} stroke={color} strokeWidth={3} />
          <polygon points={arrow} fill={color} />
        </>
      );
      caption = `półprosta ${firstId}${secondId} — zaczyna się w punkcie ${firstId}, biegnie przez ${secondId} w nieskończoność; ${secondId}${firstId} byłaby zupełnie inną półprostą`;
    }
  }

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Półprosta i odcinek</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Te same dwa punkty, dwa różne obiekty. Wybierz tryb, potem kliknij punkty A i B w takiej
        kolejności, w jakiej chcesz je nazwać.
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {MODE_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setMode(option.key)}
            aria-pressed={mode === option.key}
            className={cn(
              'cursor-pointer border px-4 py-2 text-sm font-semibold transition-all',
              mode !== option.key && 'hover:-translate-y-0.5 hover:shadow-md'
            )}
            style={
              mode === option.key
                ? { borderColor: color, backgroundColor: `${color}14`, color }
                : { borderColor: `${color}59`, color }
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="relative mb-4 aspect-[400/220] w-full max-w-md overflow-hidden border bg-white dark:bg-zinc-900/80">
        <svg viewBox="0 0 400 220" className="absolute inset-0 h-full w-full" aria-hidden>
          {lineEl}
        </svg>

        {(['A', 'B'] as const).map((id) => {
          const clickIndex = order.indexOf(id);
          const picked = clickIndex !== -1;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handlePick(id)}
              aria-pressed={picked}
              aria-label={`Punkt ${id}${picked ? `, kliknięty jako ${clickIndex + 1}.` : ''}`}
              className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 bg-background text-sm font-bold transition-all hover:scale-110"
              style={{
                left: POSITIONS[id].left,
                top: POSITIONS[id].top,
                borderColor: color,
                ...(picked ? { backgroundColor: color, color: 'white' } : { color }),
              }}
            >
              {id}
              {picked && (
                <span
                  className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border bg-background text-[10px] font-bold"
                  style={{ borderColor: color, color }}
                >
                  {clickIndex + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div
        className="mb-4 flex min-h-[52px] items-center border-l-4 p-4 sm:p-5"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <p className="font-mono text-sm font-semibold leading-relaxed sm:text-base" style={{ color: textColor }}>
          {caption}
        </p>
      </div>

      {complete && (
        <button
          type="button"
          onClick={handleSwap}
          className="cursor-pointer border px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ borderColor: `${color}59`, color }}
        >
          Zamień kolejność: {secondId}
          {firstId}
        </button>
      )}
    </>
  );
}
