'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { Eye } from 'lucide-react';
import { plural } from '@/lib/plural';
import { KorpusText } from '../../korpus/korpus-text';
import { episodeMinutes } from '../../../lib/czytelnia/types';
import { PLATES, START_DISTANCE, byCloseness, gustMessage, hasPreference, type PlateId } from './degustacja';
import { OPENINGS, PLATE_INFO } from './otwarcia';

/**
 * L2, blok 1 „Ślepa degustacja” — **gest nowy dla kursu: przysuwa talerz do
 * siebie albo go odsuwa.** Sześć otwarć bez tytułu i autora, każde pod
 * kloszem. Stuknięcie talerza zdejmuje klosz i podaje otwarcie;
 * potem talerz przesuwa się po stole — w dół, do siebie, gdy chce się dalej,
 * w górę, gdy nie. Pod tekstem ten sam talerz na listwie (dla wygody na
 * telefonie, ten sam stan). Po sześciu degustacjach — odsłonięcie i gust
 * wyczytany z ruchów, bez dobrych i złych odpowiedzi.
 */

const TABLE_H = 230;
const PLATE = 46;

interface Props {
  color: string;
  dist: Record<string, number>;
  onDist: (d: Record<string, number>) => void;
  revealed: boolean;
  onReveal: () => void;
}

export function SlepaDegustacja({ color, dist, onDist, revealed, onReveal }: Props) {
  const [open, setOpen] = useState<PlateId | null>(null);
  const [tasted, setTasted] = useState<Set<PlateId>>(new Set());
  const [moved, setMoved] = useState<Set<PlateId>>(new Set());

  const taste = (id: PlateId) => {
    setOpen(id);
    setTasted((t) => (t.has(id) ? t : new Set(t).add(id)));
  };
  const move = (id: PlateId, value: number) => {
    onDist({ ...dist, [id]: Math.max(0, Math.min(100, Math.round(value))) });
    setMoved((m) => (m.has(id) ? m : new Set(m).add(id)));
  };

  const allTasted = tasted.size === PLATES.length;
  const canReveal = allTasted && hasPreference(dist) && !revealed;
  const order = byCloseness(dist);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Na stole stoi sześć talerzy z początkami sześciu książek. Nie wiesz, jakie to książki. <strong>Stuknij talerz</strong>,
        żeby spróbować. Potem przysuń go do siebie, jeśli masz ochotę na dalszy ciąg — albo odsuń, jeśli nie.
      </p>

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Table color={color} dist={dist} tasted={tasted} open={open} revealed={revealed} onTaste={taste} onMove={move} />

        <div className="min-w-0">
          {open ? (
            <OpeningPanel key={open} id={open} color={color} value={dist[open] ?? START_DISTANCE} onMove={(v) => move(open, v)} />
          ) : (
            <p className="border border-dashed p-4 text-sm text-muted-foreground">
              Wybierz talerz. Każdy początek czyta się albo słucha około minuty.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 min-h-[4.5rem] border-t pt-4" aria-live="polite">
        {!revealed ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onReveal}
              disabled={!canReveal}
              className="flex items-center gap-2 border-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: color, borderColor: color }}
            >
              <Eye className="h-4 w-4" /> Odsłoń talerze
            </button>
            <span className="text-sm text-muted-foreground">
              {!allTasted
                ? `Spróbowane: ${tasted.size} z 6.`
                : !hasPreference(dist)
                  ? 'Wszystkie talerze stoją prawie tak samo. Przysuń te, na które masz największą ochotę.'
                  : moved.size < 2
                    ? 'Możesz jeszcze poprzesuwać talerze — albo odsłonić.'
                    : 'Gotowe? Odsłoń, co było na talerzach.'}
            </span>
          </div>
        ) : (
          <div>
            <ol className="grid gap-2 sm:grid-cols-2">
              {order.map((id, i) => {
                const b = OPENINGS[id].book;
                return (
                  <li key={id} className="flex gap-3 border p-3 text-sm" style={{ borderColor: i < 2 ? color : undefined }}>
                    <span className="font-mono text-lg font-bold tabular-nums" style={{ color }}>
                      {PLATES.indexOf(id) + 1}
                    </span>
                    <span className="min-w-0">
                      <strong className="block">{b.title}</strong>
                      <span className="block text-muted-foreground">
                        {b.author}
                        {b.translator ? `, tłum. ${b.translator}` : ''}
                      </span>
                      <span className="mt-1 block">
                        {b.genre} · {b.mood} · {b.episodes.length}{' '}
                        {plural(b.episodes.length, { one: 'odcinek', few: 'odcinki', many: 'odcinków' })}, razem ok.{' '}
                        {b.episodes.reduce((s, e) => s + episodeMinutes(e.words), 0)} min
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-3 text-sm leading-relaxed sm:text-base">{gustMessage(order, PLATE_INFO)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Stół z góry: sześć kolumn, u dołu brzeg, przy którym siedzisz. */
function Table({
  color,
  dist,
  tasted,
  open,
  revealed,
  onTaste,
  onMove,
}: {
  color: string;
  dist: Record<string, number>;
  tasted: Set<PlateId>;
  open: PlateId | null;
  revealed: boolean;
  onTaste: (id: PlateId) => void;
  onMove: (id: PlateId, v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: PlateId; y0: number; v0: number; moved: boolean } | null>(null);
  const span = TABLE_H - PLATE - 8;

  const down = (id: PlateId) => (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button > 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* syntetyczne zdarzenia */
    }
    drag.current = { id, y0: e.clientY, v0: dist[id] ?? START_DISTANCE, moved: false };
  };
  const moveP = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.abs(e.clientY - d.y0) < 6) return;
    if (!tasted.has(d.id)) return; // najpierw spróbuj
    d.moved = true;
    onMove(d.id, d.v0 + ((e.clientY - d.y0) / span) * 100);
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) onTaste(d.id);
  };

  return (
    <div>
      <div
        ref={ref}
        className="relative grid grid-cols-6 border-2"
        style={{
          height: TABLE_H,
          borderColor: '#b08968',
          background: 'repeating-linear-gradient(90deg, #f3e3cf 0 22px, #efdcc4 22px 24px)',
        }}
      >
        <span className="pointer-events-none absolute left-2 top-1 text-[11px] text-stone-600">daleko</span>
        {PLATES.map((id, i) => {
          const v = dist[id] ?? START_DISTANCE;
          const top = 4 + Math.round((v / 100) * span);
          const isOpen = open === id;
          const has = tasted.has(id);
          return (
            <div key={id} className="relative">
              <button
                type="button"
                aria-label={`Talerz ${i + 1}${has ? '' : ' pod kloszem'}`}
                aria-pressed={isOpen}
                onPointerDown={down(id)}
                onPointerMove={moveP}
                onPointerUp={up}
                onPointerCancel={() => (drag.current = null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTaste(id);
                  }
                  if (has && e.key === 'ArrowDown') onMove(id, v + 10);
                  if (has && e.key === 'ArrowUp') onMove(id, v - 10);
                }}
                className="absolute left-1/2 flex -translate-x-1/2 touch-none items-center justify-center rounded-full font-mono text-sm font-bold"
                style={{
                  top,
                  width: PLATE,
                  height: PLATE,
                  cursor: has ? 'grab' : 'pointer',
                  background: has ? '#fffdf8' : 'radial-gradient(circle at 35% 30%, #f1f5f9, #94a3b8)',
                  border: `3px solid ${isOpen ? color : has ? '#d6d3d1' : '#64748b'}`,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
                  color: has ? color : '#fff',
                }}
              >
                {i + 1}
              </button>
              {revealed && (
                <span
                  className="pointer-events-none absolute left-1/2 w-[56px] -translate-x-1/2 text-center text-[10px] leading-tight text-stone-700"
                  style={{ top: Math.min(top + PLATE + 2, TABLE_H - 26) }}
                >
                  {PLATE_INFO[id].genre}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <p className="border-x-2 border-b-2 py-1 text-center text-xs font-semibold uppercase tracking-wide" style={{ borderColor: '#b08968', color }}>
        tu siedzisz ty
      </p>
    </div>
  );
}

function OpeningPanel({ id, color, value, onMove }: { id: PlateId; color: string; value: number; onMove: (v: number) => void }) {
  const o = OPENINGS[id];
  const n = 1 + (PLATES as readonly string[]).indexOf(id);

  return (
    <div className="border p-4" style={{ borderColor: color }}>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        Talerz {n} · początek książki
      </p>
      <KorpusText korpus={o.korpus} color={color} className="mt-3 text-[15px] leading-7 sm:text-base" />
      <p className="mt-1 text-sm text-muted-foreground">…</p>
      <label className="mt-3 block text-sm font-medium" htmlFor={`plate-${id}`}>
        Ten talerz na stole:
      </label>
      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
        <span>odsuń</span>
        <input
          id={`plate-${id}`}
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onMove(Number(e.target.value))}
          className="w-full cursor-ew-resize"
          style={{ accentColor: color }}
        />
        <span>przysuń do siebie</span>
      </div>
    </div>
  );
}
