'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import {
  ATHENIANS,
  CITY_M,
  FARM_STEPS,
  PLACES,
  SEASONS,
  SOURCE_M,
  TABLET_TARGET,
  judgeCamp,
  judgeChannel,
  judgeFarm,
  judgeSow,
  judgeTablet,
  judgeVoters,
  type LayerId,
  type Place,
  type Season,
  type Verdict,
  type Wedge,
} from './warstwy';

interface TaskProps {
  color: string;
  /** Wywoływane po każdej próbie — `ok` kończy zadanie. */
  onTry: (v: Verdict) => void;
}

const btn = 'border-2 px-3 py-1.5 text-sm font-semibold';

export function MikroZadanie({ layer, color, onTry }: { layer: LayerId } & TaskProps) {
  switch (layer) {
    case 'rzym':
      return <Akwedukt color={color} onTry={onTry} />;
    case 'grecja':
      return <Glosujacy color={color} onTry={onTry} />;
    case 'egipt':
      return <Siew color={color} onTry={onTry} />;
    case 'mezopotamia':
      return <Tabliczka color={color} onTry={onTry} />;
    case 'neolit':
      return <RokRolnika color={color} onTry={onTry} />;
    case 'pradzieje':
      return <Oboz color={color} onTry={onTry} />;
  }
}

/** L28 — dwa punkty kanału między źródłem a miastem; woda płynie tylko w dół. */
function Akwedukt({ color, onTry }: TaskProps) {
  const [h1, setH1] = useState(85);
  const [h2, setH2] = useState(60);
  const y = (m: number) => Math.round(100 - m);
  const pts: [number, number][] = [
    [10, y(SOURCE_M)],
    [70, y(h1)],
    [130, y(h2)],
    [190, y(CITY_M)],
  ];
  return (
    <div className="space-y-2">
      <p className="text-sm">
        Ustaw dwa punkty kanału między źródłem ({SOURCE_M} m) a miastem ({CITY_M} m) tak, żeby woda płynęła do miasta.
      </p>
      <svg viewBox="0 0 200 100" className="block h-auto w-full max-w-[360px] bg-white dark:bg-zinc-900" aria-hidden>
        <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth={2.5} />
        {pts.map(([x, py], i) => (
          <g key={i}>
            <line x1={x} y1={py} x2={x} y2={100} stroke="#b8ab8a" strokeWidth={i === 1 || i === 2 ? 4 : 1} />
            <circle cx={x} cy={py} r={3.5} fill={i === 0 || i === 3 ? '#2b2b2b' : color} />
          </g>
        ))}
        <text x={10} y={y(SOURCE_M) - 6} fontSize={8}>źródło</text>
        <text x={190} y={y(CITY_M) - 6} fontSize={8} textAnchor="end">miasto</text>
      </svg>
      <label className="block text-sm">
        Punkt 1: <strong className="tabular-nums">{h1} m</strong>
        <input type="range" min={20} max={95} value={h1} onChange={(e) => setH1(Number(e.target.value))} className="block w-full max-w-[360px] cursor-ew-resize" style={{ accentColor: color }} />
      </label>
      <label className="block text-sm">
        Punkt 2: <strong className="tabular-nums">{h2} m</strong>
        <input type="range" min={20} max={95} value={h2} onChange={(e) => setH2(Number(e.target.value))} className="block w-full max-w-[360px] cursor-ew-resize" style={{ accentColor: color }} />
      </label>
      <button type="button" className={btn} style={{ borderColor: color, color }} onClick={() => onTry(judgeChannel(h1, h2))}>
        Puść wodę
      </button>
    </div>
  );
}

/** L23 — kto miał prawo głosu na zgromadzeniu w Atenach. */
function Glosujacy({ color, onTry }: TaskProps) {
  const [picked, setPicked] = useState<string[]>([]);
  return (
    <div className="space-y-2">
      <p className="text-sm">Na skorupie ktoś wydrapał imię — tak głosowano w Atenach. Stuknij wszystkich, którzy mogli głosować na zgromadzeniu.</p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {ATHENIANS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={picked.includes(p.id)}
            onClick={() => setPicked((x) => (x.includes(p.id) ? x.filter((i) => i !== p.id) : [...x, p.id]))}
            className={cn('border-2 bg-white px-2.5 py-1.5 text-left text-sm dark:bg-zinc-900', picked.includes(p.id) && 'font-semibold')}
            style={picked.includes(p.id) ? { borderColor: color } : undefined}
          >
            {p.label}
          </button>
        ))}
      </div>
      <button type="button" className={btn} style={{ borderColor: color, color }} onClick={() => onTry(judgeVoters(picked))}>
        Policz głosujących
      </button>
    </div>
  );
}

/** L19 — trzy pory roku Egipcjan; ziarno wrzucone w jedną z nich. */
function Siew({ color, onTry }: TaskProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm">Rok Egipcjan miał trzy pory. Stuknij porę, w której rolnik sieje ziarno.</p>
      <div className="grid gap-1.5 sm:grid-cols-3">
        {SEASONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onTry(judgeSow(s.id as Season))}
            className="border-2 bg-white px-2.5 py-2 text-left text-sm dark:bg-zinc-900"
          >
            <span className="block font-semibold" style={{ color }}>
              {s.name}
            </span>
            {s.what}
          </button>
        ))}
      </div>
    </div>
  );
}

/** L18 — rylec po glinie: pociągnięcie w dół = klin pionowy (1), w bok = klin kątowy (10). */
function Tabliczka({ color, onTry }: TaskProps) {
  const [wedges, setWedges] = useState<Wedge[]>([]);
  const start = useRef<{ x: number; y: number } | null>(null);
  const down = (e: PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // bez przechwycenia też zadziała
    }
    start.current = { x: e.clientX, y: e.clientY };
  };
  const up = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = Math.abs(e.clientX - s.x);
    const dy = Math.abs(e.clientY - s.y);
    if (Math.max(dx, dy) < 12) return;
    setWedges((w) => (w.length >= 12 ? w : [...w, dy > dx ? 1 : 10]));
  };
  return (
    <div className="space-y-2">
      <p className="text-sm">
        Skryba ma zapisać na tabliczce <strong>{TABLET_TARGET}</strong> worki jęczmienia. Pociągnij rylcem po glinie:{' '}
        <strong>w dół</strong> — klin pionowy (1), <strong>w bok</strong> — klin kątowy (10).
      </p>
      <div
        onPointerDown={down}
        onPointerUp={up}
        onPointerCancel={() => {
          start.current = null;
        }}
        className="flex h-24 w-full max-w-[360px] cursor-crosshair touch-none flex-wrap content-center items-center gap-1 border-2 border-[#8a6a3a] bg-[#d9c29a] px-3"
        role="img"
        aria-label={`Tabliczka: ${wedges.map((w) => (w === 10 ? 'klin kątowy' : 'klin pionowy')).join(', ') || 'pusta'}`}
      >
        {wedges.map((w, i) => (
          <span key={i} className="select-none font-serif text-2xl leading-none text-[#5b4128]" aria-hidden>
            {w === 10 ? '◁' : '▽'}
          </span>
        ))}
        {wedges.length === 0 && <span className="text-xs text-[#5b4128]/70">mokra glina — przeciągnij po niej palcem</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn} style={{ borderColor: color, color }} onClick={() => onTry(judgeTablet(wedges))}>
          Gotowe
        </button>
        <button type="button" className="border px-3 py-1.5 text-sm" onClick={() => setWedges((w) => w.slice(0, -1))}>
          Cofnij klin
        </button>
        <button type="button" className="border px-3 py-1.5 text-sm" onClick={() => setWedges([])}>
          Wygładź glinę
        </button>
      </div>
    </div>
  );
}

/** L16 — rok pierwszego rolnika: stuka prace po kolei. */
function RokRolnika({ color, onTry }: TaskProps) {
  const [order, setOrder] = useState<string[]>([]);
  const shuffled = [FARM_STEPS[2], FARM_STEPS[0], FARM_STEPS[3], FARM_STEPS[1]];
  const tap = (id: string) => {
    const next = order.includes(id) ? order.filter((x) => x !== id) : [...order, id];
    setOrder(next);
    if (next.length === FARM_STEPS.length) {
      const v = judgeFarm(next);
      onTry(v);
      if (!v.ok) setOrder([]);
    }
  };
  return (
    <div className="space-y-2">
      <p className="text-sm">Kamień do mielenia ziarna to ślad rolnika. Stuknij jego prace w roku po kolei.</p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {shuffled.map((s) => {
          const n = order.indexOf(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => tap(s.id)}
              className="flex items-center gap-2 border-2 bg-white px-2.5 py-1.5 text-left text-sm dark:bg-zinc-900"
              style={n >= 0 ? { borderColor: color } : undefined}
            >
              <span className="w-5 shrink-0 font-mono font-bold tabular-nums" style={{ color }}>
                {n >= 0 ? n + 1 : '·'}
              </span>
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** L15 — ślady stada na rysunku; obóz przenosi się tam, dokąd poszło jedzenie. */
function Oboz({ color, onTry }: TaskProps) {
  const prints = [
    [70, 70],
    [88, 64],
    [106, 60],
    [124, 55],
    [142, 52],
    [160, 48],
  ];
  return (
    <div className="space-y-2">
      <p className="text-sm">Stado reniferów odeszło nocą. Popatrz na ślady i stuknij, dokąd przenieść obóz.</p>
      <svg viewBox="0 0 220 120" className="block h-auto w-full max-w-[360px] bg-[#eef1e6] dark:bg-zinc-900" aria-label="Rysunek: obóz w środku, ślady kopyt prowadzą na wschód, w stronę jeziora">
        <text x={110} y={10} fontSize={8} textAnchor="middle" fill="#666">północ ↑</text>
        <ellipse cx={195} cy={45} rx={22} ry={14} fill="#a9cbe0" />
        <path d="M5,40 Q25,20 40,42 L40,60 L5,60 Z" fill="#9b8f80" />
        <path d="M80,118 Q110,88 140,118 Z" fill="#c9c2a5" />
        <path d="M52,78 L60,64 L68,78 Z" fill={color} />
        {prints.map(([x, py], i) => (
          <g key={i} fill="#5b4128">
            <ellipse cx={x} cy={py} rx={2} ry={3} transform={`rotate(70 ${x} ${py})`} />
            <ellipse cx={x + 3} cy={py + 3} rx={2} ry={3} transform={`rotate(70 ${x + 3} ${py + 3})`} />
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap gap-1.5">
        {PLACES.map((p) => (
          <button key={p.id} type="button" onClick={() => onTry(judgeCamp(p.id as Place))} className="border-2 bg-white px-2.5 py-1.5 text-sm dark:bg-zinc-900">
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
