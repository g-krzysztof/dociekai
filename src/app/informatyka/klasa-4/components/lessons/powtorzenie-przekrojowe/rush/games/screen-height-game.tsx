'use client';

import { useState } from 'react';
import { pick, type GameProps } from '../types';

/**
 * Dział 0 — **USTAW EKRAN!** Jedno z trzech ustawień stanowiska z lekcji o
 * pracy przy komputerze, zawężone do tego, które widać na rysunku: górna
 * krawędź ekranu ma stać na wysokości oczu albo odrobinę niżej. Dziecko
 * przesuwa monitor suwakiem (natywny `<input type="range">`, więc działa
 * palcem, myszą i klawiaturą) i zatwierdza „Gotowe”.
 *
 * Zielony zakres jest ten sam co w `WorkstationSim`: od 10 cm poniżej oczu do
 * równo z oczami. Geometria liczy się z jednej liczby przez stałą, bez trygonometrii.
 */

const EYE_Y = 66;
const PX = 2.4;
const SCREEN_H = 46;
const DESK_Y = 152;

export function ScreenHeightGame({ finish, seed }: GameProps) {
  const [v, setV] = useState(pick([12, -12, 9], seed));
  const top = EYE_Y - v * PX;
  const reading = v === 0 ? 'równo z oczami' : v > 0 ? `${v} cm nad oczami` : `${-v} cm pod oczami`;

  return (
    <div className="flex h-full flex-col">
      <svg viewBox="0 0 320 200" className="w-full flex-1" role="img" aria-label={`Monitor stoi tak, że górna krawędź jest ${reading}.`}>
        <rect width="320" height="200" className="fill-slate-50 dark:fill-zinc-800" />
        <rect x="0" y="188" width="320" height="12" className="fill-slate-200 dark:fill-zinc-700" />
        {/* biurko */}
        <rect x="140" y={DESK_Y} width="172" height="8" className="fill-amber-200 dark:fill-amber-800" />
        <rect x="150" y={DESK_Y + 8} width="8" height={188 - DESK_Y - 8} className="fill-amber-300 dark:fill-amber-900" />
        <rect x="294" y={DESK_Y + 8} width="8" height={188 - DESK_Y - 8} className="fill-amber-300 dark:fill-amber-900" />
        {/* dziecko */}
        <rect x="68" y="96" width="34" height="76" className="fill-sky-300 dark:fill-sky-700" />
        <rect x="90" y="140" width="66" height="10" className="fill-sky-300 dark:fill-sky-700" />
        <rect x="64" y="172" width="8" height="16" className="fill-slate-400" />
        <rect x="96" y="150" width="8" height="38" className="fill-slate-400" />
        <circle cx="86" cy="66" r="18" className="fill-orange-200 dark:fill-orange-300" />
        <circle cx="97" cy={EYE_Y} r="2.6" className="fill-slate-800" />
        {/* linia wzroku */}
        <line x1="100" y1={EYE_Y} x2="292" y2={EYE_Y} strokeDasharray="4 5" className="stroke-slate-400" strokeWidth="1.5" />
        {/* monitor */}
        <rect x="233" y={top + SCREEN_H} width="6" height={Math.max(0, DESK_Y - (top + SCREEN_H))} className="fill-slate-500" />
        <rect x="216" y={DESK_Y - 4} width="40" height="4" className="fill-slate-500" />
        <rect x="196" y={top} width="80" height={SCREEN_H} className="fill-slate-800 stroke-slate-500" strokeWidth="3" />
        <rect x="203" y={top + 6} width="66" height={SCREEN_H - 12} className="fill-sky-100 dark:fill-sky-300" />
      </svg>

      <div className="mt-2 space-y-2">
        <label className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="w-12 shrink-0 text-right">niżej</span>
          <input
            type="range"
            min={-12}
            max={16}
            step={1}
            value={v}
            onChange={(event) => setV(Number(event.target.value))}
            className="h-8 w-full flex-1 cursor-pointer accent-slate-600"
            aria-label="Wysokość monitora względem oczu"
          />
          <span className="w-12 shrink-0">wyżej</span>
        </label>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm tabular-nums text-muted-foreground">Górna krawędź: {reading}</span>
          <button
            type="button"
            onClick={() => finish(v >= -10 && v <= 0)}
            className="min-h-11 cursor-pointer bg-slate-700 px-6 text-sm font-bold text-white hover:bg-slate-600"
          >
            GOTOWE
          </button>
        </div>
      </div>
    </div>
  );
}
