'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ClipboardList, Minus, Plus, RotateCcw, Wheat } from 'lucide-react';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import {
  COLS,
  DAYS_LEFT,
  FIELDS,
  HEIGHTS,
  MAX_DIGGERS,
  RIVER_LEVEL,
  SOLO_LIMIT,
  daysNeeded,
  extendPath,
  judgeCanal,
  judgeDig,
  same,
  type Cell,
} from './kanaly';

/**
 * Blok 1 (symulator), część 1: **rysuje kanał palcem** od rzeki do pól po
 * terenie z wysokościami — woda płynie tylko w dół. Część 2: **kopanie** —
 * licznik kopaczy i **nadzorca z tabliczką** przeciągany na budowę. Bez
 * nadzorcy więcej niż czterech kopaczy pracuje o połowę wolniej.
 */

const SHADE = ['#e0f2fe', '#f5efd9', '#ece2c0', '#e1d2a2', '#d4c08a', '#c4aa6e', '#a98c52'];

export function KanalyWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [path, setPath] = useState<Cell[]>([]);
  const [wet, setWet] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof judgeCanal> | null>(null);
  const [canalOk, setCanalOk] = useState(false);
  const [diggers, setDiggers] = useState(2);
  const [overseer, setOverseer] = useState(false);
  const [dig, setDig] = useState<ReturnType<typeof judgeDig> | null>(null);
  const drawing = useRef(false);
  const doneRef = useRef(false);

  // animacja wody: kratka po kratce
  useEffect(() => {
    if (!result) return;
    if (wet >= result.flow.wet) return;
    const t = window.setTimeout(() => setWet((w) => w + 1), 120);
    return () => window.clearTimeout(t);
  }, [result, wet]);

  const cellAt = (x: number, y: number): Cell | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-kratka]');
    if (!el) return null;
    const [r, c] = el.dataset.kratka!.split(',').map(Number);
    return [r, c];
  };

  const add = (cell: Cell | null) => {
    if (!cell || canalOk) return;
    setResult(null);
    setWet(0);
    setPath((p) => extendPath(p, cell));
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (canalOk) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    add(cellAt(e.clientX, e.clientY));
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (drawing.current) add(cellAt(e.clientX, e.clientY));
  };
  const onUp = () => {
    drawing.current = false;
  };

  const letWater = () => {
    const r = judgeCanal(path);
    setWet(0);
    setResult(r);
    if (r.ok) window.setTimeout(() => setCanalOk(true), 120 * r.flow.wet + 200);
  };

  const { drag, hover, bind } = useDragToken({
    disabled: !canalOk || overseer || dig?.ok === true,
    onDrop: (_id, target) => {
      if (target === 'budowa') setOverseer(true);
    },
    onTap: () => setOverseer(true),
  });

  const startDig = () => {
    const r = judgeDig(path.length, diggers, overseer);
    setDig(r);
    if (r.ok && !doneRef.current) {
      doneRef.current = true;
      onDone();
    }
  };

  const inPath = (r: number, c: number) => path.findIndex((p) => same(p, [r, c]));
  const preview = daysNeeded(path.length, diggers, overseer);

  return (
    <div className="space-y-4">
      {!canalOk ? (
        <p className="text-sm leading-relaxed">
          Między rzekami Mezopotamii pada mało deszczu — pola trzeba nawadniać. <strong>Narysuj palcem kanał</strong> od rzeki
          (niebieski pas po lewej) do trzech pól. Liczby to wysokość terenu. Rzeka płynie na wysokości {RIVER_LEVEL}, a{' '}
          <strong>woda płynie tylko w dół albo po równym</strong>. Potem puść wodę.
        </p>
      ) : (
        <p className="text-sm leading-relaxed">
          Kanał wytyczony: {path.length} kratek. Teraz trzeba go wykopać — każda kratka to 20 dni pracy jednego człowieka,
          a <strong>za {DAYS_LEFT} dni rzeka wyleje</strong>. Zbierz kopaczy.
        </p>
      )}

      <div
        data-drop="budowa"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className={`mx-auto grid max-w-[520px] select-none gap-px border bg-stone-300 ${canalOk ? '' : 'cursor-crosshair touch-none'}`}
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, outline: hover === 'budowa' ? `3px solid ${color}` : undefined }}
        role="group"
        aria-label="Teren między rzeką a polami"
      >
        {HEIGHTS.map((row, r) =>
          row.map((h, c) => {
            const k = inPath(r, c);
            const field = FIELDS.find((f) => same(f.at, [r, c]));
            const watered = result?.flow.watered.includes(field?.id ?? '') && wet >= (result?.flow.wet ?? 0);
            const isWet = k >= 0 && k < wet;
            const blocked = result?.flow.blockedAt && same(result.flow.blockedAt, [r, c]);
            return (
              <div
                key={`${r},${c}`}
                data-kratka={`${r},${c}`}
                className="relative aspect-square"
                style={{ background: c === 0 ? '#60a5fa' : SHADE[h] }}
              >
                {c > 0 && <span className="absolute left-0.5 top-0 font-mono text-[10px] text-stone-600">{h}</span>}
                {k >= 0 && (
                  <span
                    className="absolute inset-[22%]"
                    style={{ background: isWet ? '#3b82f6' : '#8b5e34', outline: blocked ? '2px solid #dc2626' : undefined }}
                  />
                )}
                {field && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Wheat className="h-5 w-5" style={{ color: watered ? '#15803d' : '#a16207' }} aria-label={field.name} />
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {!canalOk && (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" disabled={!path.length} onClick={letWater} className="border px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50" style={{ background: color }}>
            Puść wodę
          </button>
          <button type="button" onClick={() => { setPath([]); setResult(null); setWet(0); }} className="inline-flex items-center gap-1 border px-3 py-1.5 text-sm">
            <RotateCcw className="h-4 w-4" aria-hidden /> Od nowa
          </button>
          <span className="text-xs text-muted-foreground">Cofnięcie palca na poprzednią kratkę skraca kanał.</span>
        </div>
      )}
      {result && !canalOk && (
        <p className={`text-sm ${result.ok ? '' : 'text-destructive'}`} aria-live="polite">
          {result.text}
        </p>
      )}

      {canalOk && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm">Kopacze:</span>
            <button type="button" aria-label="Mniej kopaczy" disabled={dig?.ok} onClick={() => { setDiggers((d) => Math.max(1, d - 1)); setDig(null); }} className="border p-1.5">
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-[2ch] text-center font-mono text-lg font-bold tabular-nums">{diggers}</span>
            <button type="button" aria-label="Więcej kopaczy" disabled={dig?.ok} onClick={() => { setDiggers((d) => Math.min(MAX_DIGGERS, d + 1)); setDig(null); }} className="border p-1.5">
              <Plus className="h-4 w-4" />
            </button>
            <span className="flex gap-0.5" aria-hidden>
              {Array.from({ length: diggers }, (_, k) => (
                <span key={k} className="inline-block h-4 w-2" style={{ background: k < SOLO_LIMIT || overseer ? '#78716c' : '#d6d3d1' }} />
              ))}
            </span>
          </div>

          {!overseer ? (
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" {...bind('nadzorca')} className="inline-flex touch-none items-center gap-2 border bg-white px-3 py-2 text-sm dark:bg-zinc-900">
                <ClipboardList className="h-4 w-4" aria-hidden /> Nadzorca z glinianą tabliczką
              </button>
              <span className="text-xs text-muted-foreground">Przeciągnij go na budowę, jeśli trzeba kimś pokierować.</span>
            </div>
          ) : (
            <p className="text-sm">
              Na budowie jest <strong>nadzorca</strong>: dzieli kanał na odcinki i na glinianej tabliczce zapisuje, kto ile
              kopał i ile ziarna mu się należy.
            </p>
          )}
          <DragGhost drag={drag}>
            <span className="inline-flex items-center gap-2 border bg-white px-3 py-2 text-sm">
              <ClipboardList className="h-4 w-4" aria-hidden /> Nadzorca
            </span>
          </DragGhost>

          {!dig?.ok && (
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={startDig} className="border px-3 py-1.5 text-sm font-semibold text-white" style={{ background: color }}>
                Kopiemy!
              </button>
              <span className="text-xs tabular-nums text-muted-foreground">Szacunek: {Number.isFinite(preview) ? `${preview} dni` : '—'}</span>
            </div>
          )}
          {dig && (
            <p className={`border-l-2 pl-3 text-sm leading-relaxed ${dig.ok ? '' : 'text-destructive'}`} style={{ borderColor: dig.ok ? color : 'hsl(var(--destructive))' }} aria-live="polite">
              {dig.text}
            </p>
          )}
          {dig?.ok && (
            <div className="border bg-amber-50 p-3 dark:bg-zinc-900">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tabliczka nadzorcy</p>
              <ul className="grid grid-cols-1 gap-x-4 font-mono text-xs sm:grid-cols-2">
                {Array.from({ length: diggers }, (_, k) => (
                  <li key={k}>
                    kopacz {k + 1}: {'|'.repeat(Math.min(12, dig.days / 3 | 0))} → ziarno
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
