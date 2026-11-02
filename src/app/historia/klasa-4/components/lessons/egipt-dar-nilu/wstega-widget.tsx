'use client';

import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import {
  EG_CAIRO_Y,
  EG_CELL,
  EG_COLS,
  EG_LAND,
  EG_NILE,
  EG_OASES,
  EG_PLACES,
  EG_VIEW,
  FLOOD_ROWS,
} from './geo-egipt';
import {
  OASES_GOAL,
  RIVER_GOAL,
  brush,
  floodStats,
  judgeHalf,
  makeGrid,
  type Half,
  type HalfLabel,
} from './nil';

/**
 * Blok 2 — **zielona wstęga**. Dziecko maluje palcem po mapie Egiptu: farba
 * rozlewa się tylko tam, dokąd dochodzi wylew (dolina, delta, Fajum), a oazy
 * zielenieją jak wyspy. Pustynia farby nie przyjmuje. Potem tabliczki „Dolny”
 * i „Górny Egipt” — sędzią jest kierunek, w którym płynie Nil.
 */
const GRID = makeGrid(FLOOD_ROWS, EG_CELL);
const BRUSH_SCREEN_PX = 16;
const HALF_LABELS: { id: HalfLabel; text: string }[] = [
  { id: 'gorny', text: 'Górny Egipt' },
  { id: 'dolny', text: 'Dolny Egipt' },
];

export function WstegaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [painted, setPainted] = useState<Set<number>>(() => new Set());
  const [cursor, setCursor] = useState<{ x: number; y: number; dry: boolean } | null>(null);
  const [halves, setHalves] = useState<Partial<Record<HalfLabel, Half>>>({});
  const [picked, setPicked] = useState<HalfLabel | null>(null);
  const [why, setWhy] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const down = useRef(false);
  const reported = useRef(false);

  const stats = useMemo(() => floodStats(GRID, painted), [painted]);
  const paintedEnough = stats.river >= RIVER_GOAL && stats.oases.length >= OASES_GOAL;
  const halvesDone = HALF_LABELS.every((l) => halves[l.id]);

  const toMap = (e: PointerEvent<SVGSVGElement>) => {
    const box = svgRef.current!.getBoundingClientRect();
    const k = EG_VIEW.w / box.width;
    return { x: (e.clientX - box.left) * k, y: (e.clientY - box.top) * k, k };
  };

  const paint = (e: PointerEvent<SVGSVGElement>) => {
    const { x, y, k } = toMap(e);
    const { wet, dry } = brush(GRID, painted, x, y, BRUSH_SCREEN_PX * k);
    setCursor({ x, y, dry: wet.length === 0 && dry.length > 0 });
    if (wet.length) setPainted((prev) => new Set([...prev, ...wet]));
  };

  const placeHalf = (label: HalfLabel, half: Half) => {
    const v = judgeHalf(label, half);
    if (!v.ok) {
      setWhy(v.why ?? null);
      return;
    }
    setWhy(null);
    setPicked(null);
    const next = { ...halves, [label]: half };
    setHalves(next);
    if (HALF_LABELS.every((l) => next[l.id]) && !reported.current) {
      reported.current = true;
      onDone();
    }
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: (id, target) => {
      if (target === 'polnoc' || target === 'poludnie') placeHalf(id as HalfLabel, target);
    },
    onTap: (id) => setPicked(id as HalfLabel),
    disabled: !paintedEnough || halvesDone,
  });

  const cells = [...painted];

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        {paintedEnough ? (
          <>
            Nil płynie przez cały kraj w jedną stronę — patrz na fale na rzece. Egipcjanie dzielili swój kraj na
            dwie części i nazywali je od biegu rzeki. <strong>Przyłóż tabliczki</strong> „Górny Egipt” i „Dolny
            Egipt” do właściwej części mapy.
          </>
        ) : (
          <>
            Co roku Nil wylewał i zostawiał na polach czarny muł. <strong>Maluj palcem po mapie</strong> — farba
            rozleje się tam, dokąd dochodziła woda. Pomaluj całą zieloną wstęgę wzdłuż rzeki i deltę przy morzu.
          </>
        )}
      </p>

      <div className="relative mx-auto max-w-[560px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${EG_VIEW.w} ${EG_VIEW.h}`}
          className={`w-full border bg-[#a9cbe0] ${paintedEnough ? '' : 'cursor-crosshair touch-none'}`}
          role="img"
          aria-label="Mapa Egiptu: pustynia, Nil, delta i oazy"
          onPointerDown={(e) => {
            if (paintedEnough) return;
            down.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            paint(e);
          }}
          onPointerMove={(e) => {
            if (paintedEnough) return;
            if (down.current) paint(e);
            else {
              const { x, y } = toMap(e);
              setCursor({ x, y, dry: false });
            }
          }}
          onPointerUp={() => (down.current = false)}
          onPointerCancel={() => (down.current = false)}
          onPointerLeave={() => !down.current && setCursor(null)}
        >
          {EG_LAND.map((d, i) => (
            <path key={i} d={d} fill="#ead6a6" stroke="#c9ad74" strokeWidth="0.8" />
          ))}
          <g fill="#5a9e45" opacity="0.9">
            {cells.map((id) => (
              <circle key={id} cx={((id % EG_COLS) + 0.5) * EG_CELL} cy={(Math.floor(id / EG_COLS) + 0.5) * EG_CELL} r={EG_CELL * 0.85} />
            ))}
          </g>
          {EG_NILE.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="#3f7fae" strokeWidth="2.2" strokeLinejoin="round" />
          ))}
          {/* fale płyną z biegiem rzeki: ścieżki NE biegną od źródeł do ujścia */}
          {EG_NILE.map((d, i) => (
            <path key={`f${i}`} d={d} fill="none" stroke="#e8f4fb" strokeWidth="1.4" strokeDasharray="3 14" className="eg-nile-flow" />
          ))}
          {stats.oases.map((id) => {
            const o = EG_OASES[Number(id) - 1];
            return (
              <text key={id} x={o.at.x + 10} y={o.at.y + 4} fontSize="13" fill="#2f5d22" fontWeight="bold">
                {o.name}
              </text>
            );
          })}
          {paintedEnough &&
            EG_PLACES.filter((p) => p.id !== 'giza').map((p) => (
              <g key={p.id}>
                <circle cx={p.at.x} cy={p.at.y} r="4" fill="#5b3a1a" />
                <text x={p.at.x + 7} y={p.at.y + 4} fontSize="13" fill="#3b2a12">
                  {p.name}
                </text>
              </g>
            ))}
          <text x="200" y="22" fontSize="14" fill="#2c5878" fontStyle="italic">
            Morze Śródziemne
          </text>
          {paintedEnough && (
            <>
              <rect data-drop="polnoc" x="0" y="0" width={EG_VIEW.w} height={EG_CAIRO_Y} fill={hover === 'polnoc' ? `${color}33` : 'transparent'} stroke={hover === 'polnoc' ? color : 'none'} strokeWidth="3" onClick={() => picked && placeHalf(picked, 'polnoc')} />
              <rect data-drop="poludnie" x="0" y={EG_CAIRO_Y} width={EG_VIEW.w} height={EG_VIEW.h - EG_CAIRO_Y} fill={hover === 'poludnie' ? `${color}33` : 'transparent'} stroke={hover === 'poludnie' ? color : 'none'} strokeWidth="3" onClick={() => picked && placeHalf(picked, 'poludnie')} />
              <line x1="0" x2={EG_VIEW.w} y1={EG_CAIRO_Y} y2={EG_CAIRO_Y} stroke="#5b3a1a" strokeDasharray="6 5" strokeWidth="1" pointerEvents="none" />
              {(['dolny', 'gorny'] as const).map((l) =>
                halves[l] ? (
                  <text key={l} x="40" y={l === 'dolny' ? 60 : EG_CAIRO_Y + 40} fontSize="22" fontWeight="bold" fill={color} pointerEvents="none">
                    {l === 'dolny' ? 'Dolny Egipt' : 'Górny Egipt'}
                  </text>
                ) : null
              )}
            </>
          )}
          {cursor && !paintedEnough && (
            <circle cx={cursor.x} cy={cursor.y} r={BRUSH_SCREEN_PX * (EG_VIEW.w / (svgRef.current?.getBoundingClientRect().width || EG_VIEW.w))} fill="none" stroke={cursor.dry ? '#b45309' : '#2f5d22'} strokeWidth="1.5" pointerEvents="none" />
          )}
        </svg>
        <style>{`.eg-nile-flow{animation:egflow 1.6s linear infinite}@keyframes egflow{to{stroke-dashoffset:-17}}@media (prefers-reduced-motion: reduce){.eg-nile-flow{animation:none}}`}</style>
      </div>

      {!paintedEnough && (
        <div className="space-y-1 text-sm" role="status">
          <p>
            Dolina i delta: <strong>{Math.round(stats.river * 100)}%</strong> · oazy: <strong>{stats.oases.length}</strong>
            {cursor?.dry && <span className="ml-2 text-amber-700 dark:text-amber-400">— piasek wypija farbę, tu woda nie dochodzi</span>}
          </p>
          {stats.river >= RIVER_GOAL && stats.oases.length < OASES_GOAL && (
            <p>
              Wstęga gotowa! Ale na pustyni są jeszcze zielone wyspy — oazy, gdzie woda wypływa spod ziemi.
              Egipcjanie znali pięć. Znajdź choć dwie — szukaj na zachód od Nilu.
            </p>
          )}
        </div>
      )}

      {paintedEnough && !halvesDone && (
        <div className="flex flex-wrap gap-2">
          {HALF_LABELS.filter((l) => !halves[l.id]).map((l) => (
            <button
              key={l.id}
              type="button"
              {...bind(l.id)}
              className="touch-none border-2 bg-white px-3 py-1.5 text-sm font-semibold dark:bg-zinc-900"
              style={{ borderColor: picked === l.id ? color : undefined }}
            >
              {l.text}
            </button>
          ))}
        </div>
      )}
      <DragGhost drag={drag}>
        <span className="border-2 bg-white px-3 py-1 text-sm font-semibold dark:bg-zinc-900">
          {HALF_LABELS.find((l) => l.id === drag?.id)?.text}
        </span>
      </DragGhost>
      {why && (
        <p className="text-sm text-destructive" role="status">
          {why}
        </p>
      )}

      {paintedEnough && (
        <div className="border-l-4 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <p>
            Twoja zielona wstęga to tylko <strong>{stats.greenOfLand.toFixed(1).replace('.', ',')}%</strong> lądu na
            tej mapie — a reszta to pustynia. Wąsko na południu, szeroko w delcie przy morzu. Żeby woda doszła
            choć trochę dalej, Egipcjanie kopali kanały i sypali groble.
          </p>
          {halvesDone && (
            <p className="mt-2">
              Nil płynie z południa na północ, więc Górny Egipt leży na południu, a Dolny — przy ujściu. Około 3000
              roku p.n.e. władca z południa (tradycja nazywa go Menesem) połączył oba kraje w jedno państwo. Odtąd
              faraon nosił podwójną koronę: białą Górnego i czerwoną Dolnego Egiptu.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
