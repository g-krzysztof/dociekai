'use client';

import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Compass, Eraser, Plus, Trash2 } from 'lucide-react';
import { TaskShell, type ProofCriterion } from '@/components/block-lesson/task-shell';
import {
  MEANINGS,
  MIN_SHAPES,
  PLAN_H,
  PLAN_W,
  RIVER,
  ROAD,
  SHAPES,
  judgeVillage,
  readVillage,
  type LegendRow,
  type MeaningId,
  type P,
  type Placed,
  type ShapeId,
  type VillageState,
} from './plan-wioski';

/**
 * Blok 4 — **Plan wioski z własną legendą** (`zadanie`).
 *
 * Gest: wybiera znak z przybornika i **stuka w plan**, żeby go postawić; potem
 * **sam układa legendę** (wiersz = znak + znaczenie) i stawia strzałkę północy
 * (stuknięcie obraca ją o 90°). Odbiór: kryteria z `judgeVillage`, a Czytelnik
 * opowiada wioskę z planu i legendy (`readVillage`) — gubi się dokładnie tam,
 * gdzie legenda zawodzi.
 */

const INK = '#2b2118';
const MAX_PLACED = 16;

const CRITERIA: ProofCriterion[] = [
  { id: 'znaki', label: `Na planie stoją co najmniej ${MIN_SHAPES} różne znaki` },
  { id: 'kazdy-w-legendzie', label: 'Każdy znak z planu ma swój wiersz w legendzie' },
  { id: 'legenda-bez-nadmiaru', label: 'W legendzie nie ma znaków, których nie ma na planie' },
  { id: 'jednoznacznie', label: 'Jeden znak znaczy jedną rzecz, jedna rzecz ma jeden znak' },
  { id: 'polnoc', label: 'Na planie jest strzałka północy' },
];

export function ShapeGlyph({
  shape,
  x,
  y,
  size = 13,
  color = INK,
}: {
  shape: ShapeId;
  x: number;
  y: number;
  size?: number;
  color?: string;
}) {
  const s = size;
  const common = { fill: color, stroke: '#fff', strokeWidth: 1.5 };
  switch (shape) {
    case 'kolo':
      return <circle cx={x} cy={y} r={s * 0.85} {...common} />;
    case 'trojkat':
      return (
        <path
          d={`M${x},${y - s} L${x + s},${y + s * 0.8} L${x - s},${y + s * 0.8} Z`}
          {...common}
        />
      );
    case 'kwadrat':
      return <rect x={x - s * 0.8} y={y - s * 0.8} width={s * 1.6} height={s * 1.6} {...common} />;
    case 'gwiazda': {
      const pts = Array.from({ length: 10 }, (_, i) => {
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 ? s * 0.45 : s;
        return `${Math.round((x + Math.cos(a) * r) * 10) / 10},${Math.round((y + Math.sin(a) * r) * 10) / 10}`;
      });
      return <path d={`M${pts.join(' L')} Z`} {...common} />;
    }
    case 'krzyz':
      return (
        <path
          d={`M${x - s * 0.3},${y - s} h${s * 0.6} v${s * 0.7} h${s * 0.7} v${s * 0.6} h${-s * 0.7} v${s * 0.7} h${-s * 0.6} v${-s * 0.7} h${-s * 0.7} v${-s * 0.6} h${s * 0.7} Z`}
          {...common}
        />
      );
    case 'romb':
      return (
        <path
          d={`M${x},${y - s} L${x + s * 0.8},${y} L${x},${y + s} L${x - s * 0.8},${y} Z`}
          {...common}
        />
      );
  }
}

function MiniGlyph({ shape, color = INK }: { shape: ShapeId; color?: string }) {
  return (
    <svg width="22" height="22" viewBox="-12 -12 24 24" aria-hidden className="shrink-0">
      <ShapeGlyph shape={shape} x={0} y={0} size={9} color={color} />
    </svg>
  );
}

function NorthArrow({ at: [x, y], rot }: { at: P; rot: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <circle r={22} fill="#fffaf0" stroke={INK} strokeWidth={1.2} />
      <path d="M0,-17 L7,6 L0,1 L-7,6 Z" fill={INK} />
      <text y={16} fontSize={11} fontWeight={700} textAnchor="middle" fill={INK}>
        N
      </text>
    </g>
  );
}

const pathOf = (pts: readonly P[]) => 'M' + pts.map((p) => p.join(',')).join(' L');

type Tool = ShapeId | 'polnoc' | 'gumka' | null;

export function WioskaZLegenda({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [legend, setLegend] = useState<LegendRow[]>([]);
  const [north, setNorth] = useState<VillageState['north']>(null);
  const [tool, setTool] = useState<Tool>(null);
  const keyRef = useRef(1);

  const state: VillageState = { placed, legend, north };

  const planClick = (e: MouseEvent<SVGSVGElement>) => {
    if (!tool || tool === 'gumka') return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = svg.getScreenCTM();
    if (!m) return;
    const p = pt.matrixTransform(m.inverse());
    const at: P = [
      Math.round(Math.max(16, Math.min(PLAN_W - 16, p.x))),
      Math.round(Math.max(16, Math.min(PLAN_H - 16, p.y))),
    ];
    if (tool === 'polnoc') {
      setNorth((n) => ({ at, rot: n?.rot ?? 0 }));
      setTool(null);
      return;
    }
    if (placed.length >= MAX_PLACED) return;
    setPlaced((list) => [...list, { key: keyRef.current++, shape: tool, at }]);
  };

  const addRow = () =>
    setLegend((rows) => [...rows, { key: keyRef.current++, shape: null, meaning: null }]);
  const setRow = (key: number, patch: Partial<LegendRow>) =>
    setLegend((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const reset = () => {
    setPlaced([]);
    setLegend([]);
    setNorth(null);
    setTool(null);
  };

  const toolBtn = (id: Tool, label: string, icon: ReactNode) => (
    <button
      key={String(id)}
      type="button"
      onClick={() => setTool((t) => (t === id ? null : id))}
      aria-pressed={tool === id}
      aria-label={label}
      title={label}
      className="flex h-10 min-w-10 cursor-pointer items-center justify-center gap-1 border px-2 text-xs transition-colors hover:bg-muted"
      style={{
        borderColor: tool === id ? color : undefined,
        backgroundColor: tool === id ? `${color}1f` : undefined,
      }}
    >
      {icon}
    </button>
  );

  const workshop = (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
      <div>
        <div className="mb-2 flex flex-wrap gap-1.5" role="toolbar" aria-label="Przybornik">
          {SHAPES.map((s) => toolBtn(s.id, `Znak: ${s.name}`, <MiniGlyph shape={s.id} />))}
          {toolBtn('polnoc', 'Strzałka północy', <Compass className="h-5 w-5" aria-hidden />)}
          {toolBtn(
            'gumka',
            'Gumka — stuknij znak, żeby go zdjąć',
            <Eraser className="h-5 w-5" aria-hidden />
          )}
        </div>
        <p className="mb-2 min-h-[2.5em] text-xs text-muted-foreground" aria-live="polite">
          {tool === null
            ? 'Wybierz znak z przybornika, potem stuknij w plan, żeby go postawić. Stuknięcie w strzałkę północy obraca ją.'
            : tool === 'gumka'
              ? 'Gumka: stuknij znak na planie, żeby go zdjąć.'
              : tool === 'polnoc'
                ? 'Stuknij w plan, gdzie ma stanąć strzałka północy.'
                : `Stawiasz: ${SHAPES.find((s) => s.id === tool)!.name}. Stukaj w plan — każdy stuk to jeden znak (${placed.length}/${MAX_PLACED}).`}
        </p>
        <svg
          viewBox={`0 0 ${PLAN_W} ${PLAN_H}`}
          className={`block h-auto w-full touch-manipulation select-none border-2 ${tool && tool !== 'gumka' ? 'cursor-crosshair' : ''}`}
          style={{ borderColor: INK }}
          role="img"
          aria-label="Pusty plan wioski: rzeka i droga"
          onClick={planClick}
          data-plan="wioska"
        >
          <rect width={PLAN_W} height={PLAN_H} fill="#eef0dc" />
          <path
            d={pathOf(RIVER)}
            fill="none"
            stroke="#9cc3d6"
            strokeWidth={22}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={pathOf(RIVER)}
            fill="none"
            stroke="#4f86a8"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          <path
            d={pathOf(ROAD)}
            fill="none"
            stroke="#b79a6a"
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={pathOf(ROAD)}
            fill="none"
            stroke="#fffaf0"
            strokeWidth={1.5}
            strokeDasharray="6 6"
          />
          {placed.map((p) => (
            <g
              key={p.key}
              data-placed={p.shape}
              onClick={(e) => {
                if (tool !== 'gumka') return;
                e.stopPropagation();
                setPlaced((list) => list.filter((q) => q.key !== p.key));
              }}
              style={{ cursor: tool === 'gumka' ? 'pointer' : undefined }}
            >
              <ShapeGlyph shape={p.shape} x={p.at[0]} y={p.at[1]} />
              <circle cx={p.at[0]} cy={p.at[1]} r={20} fill="transparent" />
            </g>
          ))}
          {north && (
            <g
              data-north
              onClick={(e) => {
                e.stopPropagation();
                if (tool === 'gumka') setNorth(null);
                else
                  setNorth((n) =>
                    n ? { ...n, rot: ((n.rot + 90) % 360) as 0 | 90 | 180 | 270 } : n
                  );
              }}
              style={{ cursor: 'pointer' }}
            >
              <NorthArrow at={north.at} rot={north.rot} />
            </g>
          )}
        </svg>
      </div>

      <div className="border-2 bg-[#fffaf0] p-3 text-sm" style={{ borderColor: INK, color: INK }}>
        <p className="mb-2 font-serif text-xs font-bold uppercase tracking-[0.2em]">Legenda</p>
        {legend.length === 0 && (
          <p className="mb-2 text-xs text-muted-foreground">
            Pusta. Dodaj wiersz dla każdego znaku z planu.
          </p>
        )}
        <ul className="space-y-2">
          {legend.map((row, i) => (
            <li key={row.key} className="flex items-center gap-1.5" data-legend-row={i}>
              {row.shape ? (
                <MiniGlyph shape={row.shape} />
              ) : (
                <span className="h-[22px] w-[22px] shrink-0 border border-dashed" aria-hidden />
              )}
              <select
                value={row.shape ?? ''}
                onChange={(e) =>
                  setRow(row.key, { shape: (e.target.value || null) as ShapeId | null })
                }
                className="min-w-0 flex-1 border bg-white px-1 py-1 text-sm dark:bg-zinc-900"
                aria-label={`Znak w wierszu ${i + 1}`}
              >
                <option value="">znak…</option>
                {SHAPES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <span aria-hidden>—</span>
              <select
                value={row.meaning ?? ''}
                onChange={(e) =>
                  setRow(row.key, { meaning: (e.target.value || null) as MeaningId | null })
                }
                className="min-w-0 flex-1 border bg-white px-1 py-1 text-sm dark:bg-zinc-900"
                aria-label={`Znaczenie w wierszu ${i + 1}`}
              >
                <option value="">znaczy…</option>
                {MEANINGS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setLegend((rows) => rows.filter((r) => r.key !== row.key))}
                className="cursor-pointer p-1 text-muted-foreground hover:text-rose-600"
                aria-label={`Usuń wiersz ${i + 1}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={addRow}
          disabled={legend.length >= SHAPES.length + 2}
          className="mt-3 inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-muted disabled:opacity-40"
          style={{ borderColor: color, color }}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden /> Dodaj wiersz legendy
        </button>
      </div>
    </div>
  );

  return (
    <TaskShell<{ lines: ReturnType<typeof readVillage> }>
      color={color}
      brief={
        <>
          <p>
            Przed tobą pusty plan wioski: płynie przez nią rzeka, a przez rzekę biegnie droga.
            Postaw na nim znaki — <strong>jakie chcesz, gdzie chcesz</strong> — i ułóż do nich{' '}
            <strong>własną legendę</strong>. Nie ma jednej dobrej wioski: kościół może być kółkiem
            albo gwiazdką. Ważne, żeby ktoś, kto zna tylko plan i legendę, umiał ją przeczytać.
          </p>
          <p className="mt-2">
            Sprawdzi to Czytelnik: opowie twoją wioskę na głos, korzystając tylko z twojego planu.
          </p>
        </>
      }
      criteria={CRITERIA}
      workshop={workshop}
      judge={() => {
        const verdicts = judgeVillage(state);
        return { verdicts, data: { lines: readVillage(state) } };
      }}
      checkLabel="Daj plan Czytelnikowi"
      canCheck={placed.length > 0 || legend.length > 0}
      renderReport={(data) => <Reader lines={data.lines} color={color} />}
      acceptedText={
        <>
          Czytelnik nie widział twojej wioski, a opowiedział ją bez zgubienia się — bo każdy znak
          miał wiersz w legendzie, a strzałka powiedziała, gdzie jest północ. Tak samo działa każda
          mapa historyczna: kto zna legendę, umie ją przeczytać.
        </>
      }
      onReset={reset}
      resetLabel="Wyczyść plan i legendę"
      onComplete={onComplete}
    />
  );
}

function Reader({ lines, color }: { lines: { text: string; lost?: boolean }[]; color: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex shrink-0 flex-col items-center gap-1">
        <svg width="44" height="52" viewBox="0 0 44 52" aria-hidden>
          <circle cx="22" cy="15" r="11" fill="#f2d3b3" stroke={INK} strokeWidth="1.5" />
          <path d="M14,13 h6 M24,13 h6" stroke={INK} strokeWidth="1.5" />
          <circle cx="17" cy="13" r="3.5" fill="none" stroke={INK} strokeWidth="1.2" />
          <circle cx="27" cy="13" r="3.5" fill="none" stroke={INK} strokeWidth="1.2" />
          <path d="M6,52 C6,36 38,36 38,52 Z" fill={color} />
        </svg>
        <span className="text-[11px] font-semibold text-muted-foreground">Czytelnik</span>
      </div>
      <ol className="min-w-0 flex-1 space-y-1.5" aria-live="polite">
        {lines.map((l, i) => (
          <motion.li
            key={`${i}-${l.text}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.6 }}
            className="border px-2.5 py-1.5 text-sm leading-snug"
            style={{
              borderColor: l.lost ? '#e5a199' : `${color}55`,
              backgroundColor: l.lost ? '#fde8e4' : `${color}0f`,
            }}
          >
            {l.text}
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
