'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { Footprints, RotateCcw, Sailboat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AEGEAN_LAND, AEGEAN_VIEW, TERRAIN, TERRAIN_CELL } from './geo-egejskie';
import {
  DESTS,
  START,
  TERRAIN_NAME,
  arrived,
  compare,
  formatDays,
  portWalkDays,
  step,
  type CityId,
  type Mode,
  type Results,
  type Terrain,
} from './podroz';

/**
 * Blok 1 — **Z Aten do…**. Dziecko prowadzi palcem wędrowca albo statek z Aten
 * do Koryntu, Sparty i Miletu. Żeton idzie za palcem z prędkością terenu: po
 * równinie żwawo, w górach wlecze się (palec ucieka, lina się napina), statek
 * mknie, ale nie wpłynie na ląd. Licznik dni rośnie sam.
 */

const W = AEGEAN_VIEW.w;
const H = AEGEAN_VIEW.h;

function terrainPath(kind: string) {
  let d = '';
  TERRAIN.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] === kind) d += `M${c * TERRAIN_CELL},${r * TERRAIN_CELL}h${TERRAIN_CELL}v${TERRAIN_CELL}h-${TERRAIN_CELL}Z`;
    }
  });
  return d;
}

const TERRAIN_LOOK: Record<'2' | '3', string> = { '2': '#c8b07a', '3': '#9a7b4f' };

export function PodrozWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [dest, setDest] = useState<CityId>('korynt');
  const [mode, setMode] = useState<Mode>('pieszo');
  const [results, setResults] = useState<Results>({});
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: START[0], y: START[1] });
  const [trail, setTrail] = useState<string>(`M${START[0]},${START[1]}`);
  const [days, setDays] = useState(0);
  const [finger, setFinger] = useState<{ x: number; y: number } | null>(null);
  const [terrain, setTerrain] = useState<Terrain>(1);
  const [blocked, setBlocked] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const live = useRef({ pos: { x: START[0], y: START[1] }, days: 0, trail: `M${START[0]},${START[1]}`, target: null as null | { x: number; y: number }, side: 1 as 1 | -1 });
  const reported = useRef(false);

  const d = DESTS.find((x) => x.id === dest)!;
  const key = `${dest}-${mode}` as const;
  const finished = results[key] !== undefined;
  const allDone = DESTS.every((x) => results[`${x.id}-pieszo`] !== undefined && results[`${x.id}-statek`] !== undefined);
  const hills = useMemo(() => terrainPath('2'), []);
  const peaks = useMemo(() => terrainPath('3'), []);

  const reset = (nextDest = dest, nextMode = mode) => {
    setDest(nextDest);
    setMode(nextMode);
    live.current = { pos: { x: START[0], y: START[1] }, days: 0, trail: `M${START[0]},${START[1]}`, target: null, side: 1 };
    setPos(live.current.pos);
    setTrail(live.current.trail);
    setDays(0);
    setFinger(null);
    setBlocked(false);
  };

  // Pętla ruchu: żeton goni palec, dopóki palec jest wciśnięty.
  useEffect(() => {
    if (finished) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const L = live.current;
      if (L.target) {
        const s = step(L.pos, L.target, dt, mode, d, L.side);
        L.side = s.side;
        if (s.x !== L.pos.x || s.y !== L.pos.y) {
          L.pos = { x: s.x, y: s.y };
          L.days += s.days;
          L.trail += `L${s.x.toFixed(1)},${s.y.toFixed(1)}`;
          setPos(L.pos);
          setDays(L.days);
          setTrail(L.trail);
        }
        setTerrain(s.terrain);
        setBlocked(s.blocked);
        if (arrived(L.pos, mode, d)) {
          const total = L.days + (mode === 'statek' ? portWalkDays(d) : 0);
          L.target = null;
          setFinger(null);
          setResults((prev) => ({ ...prev, [key]: total }));
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [finished, mode, d, key]);

  useEffect(() => {
    if (allDone && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [allDone, onDone]);

  const toMap = (e: PointerEvent<SVGSVGElement>) => {
    const box = svgRef.current!.getBoundingClientRect();
    const k = W / box.width;
    return { x: (e.clientX - box.left) * k, y: (e.clientY - box.top) * k };
  };

  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    if (finished) return;
    const p = toMap(e);
    // Chwyta się żeton (albo okolicę), nie dowolny punkt mapy.
    const box = svgRef.current!.getBoundingClientRect();
    if (Math.hypot(p.x - live.current.pos.x, p.y - live.current.pos.y) > 34 * (W / box.width)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    live.current.target = p;
    setFinger(p);
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!live.current.target) return;
    const p = toMap(e);
    live.current.target = p;
    setFinger(p);
  };
  const onUp = () => {
    live.current.target = null;
    setFinger(null);
    setBlocked(false);
  };

  const rope = finger && Math.hypot(finger.x - pos.x, finger.y - pos.y) > 10;
  const goal = mode === 'statek' && d.port ? d.port : d;
  const res = (id: CityId, m: Mode) => results[`${id}-${m}`];

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Wyruszasz z Aten. <strong>Chwyć wędrowca albo statek i prowadź go palcem</strong> do celu. Liczy się, ile
        dni zajmie podróż — w górach wędrowiec ledwo nadąża, a statek nie wpłynie na ląd. Każde miasto odwiedź
        dwa razy: pieszo i statkiem.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {DESTS.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => reset(x.id, mode)}
            className={cn('border-2 px-3 py-1.5 text-sm font-semibold', dest === x.id ? 'text-white' : 'bg-white dark:bg-zinc-900')}
            style={dest === x.id ? { background: color, borderColor: color } : undefined}
          >
            {x.name}
            <span className="ml-1.5 text-xs font-normal opacity-80">
              {res(x.id, 'pieszo') !== undefined ? '👣✓' : ''}
              {res(x.id, 'statek') !== undefined ? '⛵✓' : ''}
            </span>
          </button>
        ))}
        <span className="mx-1 h-6 w-px bg-border" aria-hidden />
        {(['pieszo', 'statek'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => reset(dest, m)}
            className={cn('flex items-center gap-1.5 border-2 px-3 py-1.5 text-sm', mode === m ? 'font-semibold' : 'bg-white dark:bg-zinc-900')}
            style={mode === m ? { borderColor: color, color } : undefined}
            aria-pressed={mode === m}
          >
            {m === 'pieszo' ? <Footprints className="h-4 w-4" aria-hidden /> : <Sailboat className="h-4 w-4" aria-hidden />}
            {m === 'pieszo' ? 'Pieszo' : 'Statkiem'}
          </button>
        ))}
      </div>

      <div className="relative mx-auto max-w-[480px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className={cn('w-full touch-none border bg-[#a9cbe0]', !finished && 'cursor-grab')}
          role="img"
          aria-label={`Mapa Grecji i Morza Egejskiego: góry, wyspy, Ateny i cel podróży — ${d.name}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <defs>
            <clipPath id="hist-aegean-land">
              <path d={AEGEAN_LAND} />
            </clipPath>
            <filter id="hist-aegean-soft" x="-5%" y="-5%" width="110%" height="110%">
              <feGaussianBlur stdDeviation="3.2" />
            </filter>
          </defs>
          <path d={AEGEAN_LAND} fill="#e6d9a8" stroke="#b49a63" strokeWidth="0.7" />
          <g clipPath="url(#hist-aegean-land)">
            <g filter="url(#hist-aegean-soft)">
              <path d={hills} fill={TERRAIN_LOOK['2']} opacity="0.7" />
              <path d={peaks} fill={TERRAIN_LOOK['3']} opacity="0.85" />
            </g>
          </g>
          <text x="300" y="250" fontSize="13" fill="#2c5878" fontStyle="italic" pointerEvents="none">
            Morze Egejskie
          </text>
          <path d={trail} fill="none" stroke={mode === 'statek' ? '#1d4ed8' : '#7c2d12'} strokeWidth="2.2" strokeDasharray={mode === 'statek' ? '5 4' : undefined} strokeLinejoin="round" pointerEvents="none" />

          {/* cele */}
          {DESTS.map((x) => (
            <g key={x.id} pointerEvents="none" opacity={x.id === dest ? 1 : 0.45}>
              <circle cx={x.xy[0]} cy={x.xy[1]} r={x.id === dest ? 6 : 4} fill="#5b3a1a" stroke="white" strokeWidth="1.5" />
              <text x={x.xy[0] + (x.id === 'sparta' ? -50 : 8)} y={x.xy[1] - 6} fontSize="14" fontWeight="bold" fill="#3b2a12">
                {x.name}
              </text>
            </g>
          ))}
          {mode === 'statek' && d.port && d.port.km > 0 && (
            <g pointerEvents="none">
              <circle cx={d.port.xy[0]} cy={d.port.xy[1]} r="5" fill="none" stroke={color} strokeWidth="2" />
              <text x={d.port.xy[0] + 8} y={d.port.xy[1] + 14} fontSize="12" fill="#3b2a12">
                port {d.port.name}
              </text>
            </g>
          )}
          {!finished && (
            <circle cx={goal.xy[0]} cy={goal.xy[1]} r="12" fill="none" stroke={color} strokeWidth="2" strokeDasharray="3 3" pointerEvents="none" className="hist-goal-pulse" />
          )}
          <g pointerEvents="none">
            <circle cx={START[0]} cy={START[1]} r="5" fill="#5b3a1a" stroke="white" strokeWidth="1.5" />
            <text x={START[0] + 8} y={START[1] + 16} fontSize="14" fontWeight="bold" fill="#3b2a12">
              Ateny
            </text>
          </g>

          {rope && finger && (
            <line x1={pos.x} y1={pos.y} x2={finger.x} y2={finger.y} stroke={blocked ? '#dc2626' : '#57534e'} strokeWidth="1.5" strokeDasharray="2 3" pointerEvents="none" />
          )}
          <g transform={`translate(${pos.x.toFixed(1)} ${pos.y.toFixed(1)})`} pointerEvents="none">
            <circle r="13" fill="white" stroke={color} strokeWidth="2.5" />
            {mode === 'statek' ? (
              <path d="M-7,3 L7,3 L4,7 L-4,7 Z M0,-8 L0,3 M0,-8 L6,1 L0,1" fill={color} stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
            ) : (
              <g fill={color}>
                <circle cx="0" cy="-6" r="2.6" />
                <path d="M-3,-2 L3,-2 L2.5,4 L4,9 L1.5,9 L0,5 L-1.5,9 L-4,9 L-2.5,4 Z" />
              </g>
            )}
          </g>
        </svg>
        <div className="pointer-events-none absolute left-2 top-2 border bg-white/90 px-2 py-1 text-xs dark:bg-zinc-900/90" aria-hidden>
          dzień <strong className="text-base tabular-nums">{Math.floor(days) + 1}</strong>
          <span className="ml-1.5 text-muted-foreground">{TERRAIN_NAME[terrain]}</span>
        </div>
        <style>{`.hist-goal-pulse{animation:histgoal 1.4s ease-in-out infinite}@keyframes histgoal{50%{opacity:.35}}@media (prefers-reduced-motion: reduce){.hist-goal-pulse{animation:none}}`}</style>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" role="status">
        <span>
          Dzień podróży: <strong className="text-lg tabular-nums">{Math.floor(days) + 1}</strong>
        </span>
        <span className="text-muted-foreground">teren: {TERRAIN_NAME[terrain]}</span>
        {blocked && (
          <span className="text-destructive">{mode === 'statek' ? 'Statek nie wpłynie na ląd — płyń wzdłuż brzegu.' : 'Pieszo nie przejdziesz przez morze.'}</span>
        )}
        {!finished && days > 0 && (
          <button type="button" onClick={() => reset()} className="ml-auto flex items-center gap-1 text-xs underline">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> od nowa
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        <span className="mr-1 inline-block h-2.5 w-3 align-middle" style={{ background: TERRAIN_LOOK['2'] }} /> wyżyny
        <span className="ml-3 mr-1 inline-block h-2.5 w-3 align-middle" style={{ background: TERRAIN_LOOK['3'] }} /> góry
        <span className="ml-3">· po równinie piechur robi ok. 30 km dziennie, w górach ok. 10, statek ok. 70</span>
      </p>

      {finished && (
        <div className="border-l-4 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <p>
            Dotarłeś/łaś do {d.name === 'Korynt' ? 'Koryntu' : d.name === 'Sparta' ? 'Sparty' : 'Miletu'}{' '}
            {mode === 'pieszo' ? 'pieszo' : 'statkiem'}: <strong>{formatDays(results[key]!)}</strong>
            {mode === 'statek' && d.port && d.port.km > 0 && <> (w tym ok. {formatDays(portWalkDays(d))} marszu z portu {d.port.name})</>}.
          </p>
          {compare(d, results) && <p className="mt-2">{compare(d, results)}</p>}
          {!allDone && (
            <p className="mt-2 text-muted-foreground">
              {results[`${dest}-${mode === 'pieszo' ? 'statek' : 'pieszo'}`] === undefined
                ? `Teraz ta sama podróż ${mode === 'pieszo' ? 'statkiem' : 'pieszo'} — przełącz wyżej.`
                : 'Wybierz następne miasto.'}
            </p>
          )}
        </div>
      )}

      {allDone && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[300px] border text-sm">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="p-2">Z Aten do…</th>
                <th className="p-2">pieszo</th>
                <th className="p-2">statkiem</th>
              </tr>
            </thead>
            <tbody>
              {DESTS.map((x) => {
                const w = res(x.id, 'pieszo')!;
                const s = res(x.id, 'statek')!;
                return (
                  <tr key={x.id} className="border-t">
                    <td className="p-2 font-semibold">{x.name}</td>
                    <td className={cn('p-2 tabular-nums', w < s && 'font-bold')}>{formatDays(w)}</td>
                    <td className={cn('p-2 tabular-nums', s <= w && 'font-bold')} style={s <= w ? { color } : undefined}>
                      {formatDays(s)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
