'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CHECK_MAX,
  CHECK_MIN,
  FIELD_HEIGHTS,
  FLOOD_YEARS,
  HERODOT,
  SPOTS,
  VILLAGE_HEIGHT,
  herodotYears,
  judgeHerodotAt,
  type SpotId,
} from './nil';

/**
 * Blok 4, część B — **gdzie i kiedy Herodot ma rację**. Dziecko podnosi Nil
 * suwakiem i stawia Herodota przy jednym z trzech pól przekroju doliny. Każde
 * zdanie źródła zapala się ✓ albo ✗ z powodem — sędzią jest ten sam mechanizm
 * co nilometr. Gotowe, gdy wszystkie cztery zdania są prawdziwe naraz.
 */
const W = 360;
const H = 190;
const TOP = 14;
const BOTTOM = 178;
const yOf = (lvl: number) => BOTTOM - ((lvl - 10) / (20 - 10)) * (BOTTOM - TOP);

const DYKE_X = 330;
const DYKE_TOP = 19.5;
/** Profil doliny (x, wysokość w łokciach): koryto, tarasy pól, wioska, grobla, pole za groblą. */
const PROFILE: [number, number][] = [
  [0, 10.3],
  [46, 10.3],
  [58, FIELD_HEIGHTS[0]],
  [128, FIELD_HEIGHTS[0]],
  [128, FIELD_HEIGHTS[1]],
  [166, FIELD_HEIGHTS[1]],
  [166, FIELD_HEIGHTS[2]],
  [204, FIELD_HEIGHTS[2]],
  [204, FIELD_HEIGHTS[3]],
  [262, FIELD_HEIGHTS[3]],
  [270, VILLAGE_HEIGHT],
  [316, VILLAGE_HEIGHT],
  [DYKE_X - 6, DYKE_TOP],
  [DYKE_X + 6, DYKE_TOP],
  [DYKE_X + 14, 15],
  [W, 15],
];
const GROUND = `M0 ${H} ${PROFILE.map(([x, h]) => `L${x} ${yOf(h).toFixed(1)}`).join(' ')} L${W} ${H} Z`;

/** Gdzie stoi Herodot na przekroju i jak szerokie jest pole. */
const SPOT_AT: Record<SpotId, { x0: number; x1: number; h: number }> = {
  brzeg: { x0: 58, x1: 128, h: FIELD_HEIGHTS[0] },
  taras: { x0: 204, x1: 262, h: FIELD_HEIGHTS[3] },
  grobla: { x0: DYKE_X + 14, x1: W, h: 15 },
};

export function HerodotGdzieKiedy({ color, onDone }: { color: string; onDone: () => void }) {
  const [level, setLevel] = useState(12);
  const [spot, setSpot] = useState<SpotId>('grobla');
  const [solved, setSolved] = useState(false);
  const reported = useRef(false);

  const verdicts = HERODOT.map((h) => ({ ...h, v: judgeHerodotAt(h.id, level, spot) }));
  const allTrue = verdicts.every((x) => x.v.ok);

  useEffect(() => {
    if (!allTrue || reported.current) return;
    reported.current = true;
    setSolved(true);
    onDone();
  }, [allTrue, onDone]);

  const years = herodotYears();
  const set = (n: number) => !solved && setLevel(Math.max(CHECK_MIN, Math.min(CHECK_MAX, Math.round(n * 2) / 2)));
  const wy = yOf(level);

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Notatki przeczą Herodotowi — ale może opisał coś, co naprawdę widział? <strong>Podnieś Nil i postaw
        Herodota przy polu tak, żeby wszystkie cztery jego zdania były prawdziwe naraz.</strong>
      </p>

      <div className="border bg-white p-3 dark:bg-zinc-900">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Przekrój doliny Nilu, woda na ${level} łokciach`}>
          <rect x={0} y={0} width={W} height={H} fill="#fdf6e3" />
          <rect x={0} y={wy} width={DYKE_X} height={H - wy} fill="#60a5fa" opacity={0.75} />
          <path d={GROUND} fill="#d6b77f" stroke="#a07a3f" strokeWidth={1} />
          {(['brzeg', 'taras', 'grobla'] as SpotId[]).map((id) => {
            const s = SPOT_AT[id];
            const wet = id !== 'grobla' && level >= s.h;
            return (
              <g key={id} onClick={() => !solved && setSpot(id)} className={solved ? undefined : 'cursor-pointer'}>
                <rect x={s.x0} y={yOf(s.h) - 3} width={s.x1 - s.x0} height={5} fill={wet ? '#3f3a2a' : '#c9a86a'} />
                <rect x={s.x0} y={yOf(s.h) - 40} width={s.x1 - s.x0} height={44} fill="transparent" />
              </g>
            );
          })}
          {/* wioska */}
          {[276, 292, 306].map((x) => (
            <rect key={x} x={x} y={yOf(VILLAGE_HEIGHT) - 9} width={10} height={9} fill="#b08850" stroke="#7c5a2a" strokeWidth={0.8} />
          ))}
          <text x={293} y={yOf(VILLAGE_HEIGHT) - 13} textAnchor="middle" fontSize={9} fill="#5b4320">
            wioska
          </text>
          <text x={DYKE_X} y={yOf(DYKE_TOP) - 4} textAnchor="middle" fontSize={9} fill="#5b4320">
            grobla
          </text>
          <text x={6} y={wy - 4} fontSize={10} fill="#1e3a8a" fontWeight={600}>
            {level} łokci
          </text>
          {/* Herodot */}
          {(() => {
            const s = SPOT_AT[spot];
            const x = (s.x0 + s.x1) / 2;
            const y = yOf(s.h) - 3;
            return (
              <g transform={`translate(${x} ${y})`} aria-hidden>
                <circle cx={0} cy={-26} r={5} fill="#e7c9a0" stroke="#3f2d1a" strokeWidth={1} />
                <path d="M-6 -20 L6 -20 L8 0 L-8 0 Z" fill="#f5f5f4" stroke="#3f2d1a" strokeWidth={1} />
                <text x={0} y={-35} textAnchor="middle" fontSize={9} fontWeight={700} fill={color}>
                  Herodot
                </text>
              </g>
            );
          })()}
        </svg>

        <div className="mt-3 flex items-center gap-2">
          <span className="shrink-0 text-xs font-semibold">Nil:</span>
          <button type="button" className="h-8 w-8 border text-sm" disabled={solved} onClick={() => set(level - 0.5)} aria-label="Niżej o pół łokcia">
            −
          </button>
          <input
            type="range"
            min={CHECK_MIN}
            max={CHECK_MAX}
            step={0.5}
            value={level}
            disabled={solved}
            onChange={(e) => set(Number(e.target.value))}
            className="w-full cursor-ew-resize"
            style={{ accentColor: color }}
            aria-label="Poziom Nilu w łokciach"
          />
          <button type="button" className="h-8 w-8 border text-sm" disabled={solved} onClick={() => set(level + 0.5)} aria-label="Wyżej o pół łokcia">
            +
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="self-center text-xs font-semibold">Herodot stoi przy:</span>
          {SPOTS.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={solved}
              onClick={() => setSpot(s.id)}
              className="border px-2 py-1 text-xs"
              style={spot === s.id ? { borderColor: color, background: `${color}1a`, fontWeight: 600 } : undefined}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-1.5">
        {verdicts.map(({ id, text, v }) => (
          <li key={id} className="grid grid-cols-[1.25rem_1fr] gap-x-1 py-1 text-sm">
            <span className="font-bold" style={{ color: v.ok ? '#15803d' : '#b91c1c' }} aria-label={v.ok ? 'prawda' : 'nieprawda'}>
              {v.ok ? '✓' : '✗'}
            </span>
            <span className="font-serif">„{text}”</span>
            {!v.ok && <span className="col-start-2 block text-xs text-muted-foreground">{v.why}</span>}
          </li>
        ))}
      </ul>

      {solved && (
        <div className="border p-3 text-sm leading-relaxed" style={{ borderColor: `${color}66`, background: `${color}0f` }}>
          Herodot ma rację — ale tylko w dobrym roku i tylko przy polu, do którego woda przychodzi sama. Z Twoich{' '}
          {FLOOD_YEARS.length} lat na nilometrze ({FLOOD_YEARS.join(', ')} łokci) taki był{' '}
          {years.length === 1 ? 'tylko jeden' : `${years.length}`}: {years.join(', ')} łokci. Herodot nie kłamał — był
          w Egipcie raz, przez kilka miesięcy, i pisał o rolnikach z delty, gdzie wstęga jest najszersza. Nie widział
          lat głodu, kanałów ani worków oddawanych pisarzowi. <strong>Gość widzi jeden rok i jedno miejsce.</strong> A Ty,
          po tej lekcji, wiesz to, czego nie zobaczył: bez wylewów Nilu Egipt byłby pustynią, a cały rok Egipcjan
          kręcił się wokół rzeki.
        </div>
      )}
    </div>
  );
}
