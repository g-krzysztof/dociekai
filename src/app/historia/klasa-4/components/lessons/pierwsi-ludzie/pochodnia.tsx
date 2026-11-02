'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { CLAIMS, DWELL_MS, FIGURES, figureAt, judgeClaim, type FigureId, type ProofTarget } from './jaskinia';

/**
 * Blok 4 (źródło): **pochodnia w jaskini**. Ciemna ściana — prawdziwa
 * fotografia malowideł z Lascaux; światło idzie za palcem (albo strzałkami).
 * Postać jest znaleziona, gdy światło chwilę na niej stoi. Potem dziecko
 * przykłada wnioski do ściany (przeciąga kartkę na postać albo na półkę
 * „ściana milczy”) — przyjmujemy tylko to, co da się na ścianie wskazać.
 */

const ASPECT = 472 / 720;
const LIGHT = 13; // promień jasnego środka, % szerokości

export function Pochodnia({ color, wall, onComplete }: { color: string; wall: string; onComplete: () => void }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [lightOn, setLightOn] = useState(false);
  const [radius, setRadius] = useState(90);
  const [found, setFound] = useState<FigureId[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, ProofTarget>>({});
  const [pickedClaim, setPickedClaim] = useState<string | null>(null);
  const [claimMsg, setClaimMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const dwell = useRef<{ id: FigureId; since: number } | null>(null);
  const completed = useRef(false);

  const allFound = found.length === FIGURES.length;
  const allPlaced = CLAIMS.every((c) => placed[c.id] === c.proof);

  useEffect(() => {
    if (allFound || !lightOn) return;
    const t = window.setInterval(() => {
      const d = dwell.current;
      if (d && performance.now() - d.since >= DWELL_MS) {
        dwell.current = null;
        const next = found.includes(d.id) ? found : [...found, d.id];
        setFound(next);
        const left = FIGURES.filter((f) => !next.includes(f.id));
        const text = FIGURES.find((f) => f.id === d.id)!.found;
        setNote(left.length === 1 ? `${text} ${left[0].hint}` : text);
      }
    }, 80);
    return () => window.clearInterval(t);
  }, [allFound, lightOn, found]);

  const moveTo = (x: number, y: number) => {
    const nx = Math.max(0, Math.min(100, x));
    const ny = Math.max(0, Math.min(100, y));
    setPos({ x: nx, y: ny });
    setLightOn(true);
    const f = figureAt(nx, ny, ASPECT, found);
    if (!f) dwell.current = null;
    else if (dwell.current?.id !== f.id) dwell.current = { id: f.id, since: performance.now() };
  };

  const onPointer = (e: PointerEvent<HTMLDivElement>) => {
    if (allFound || !box.current) return;
    if (e.type === 'pointerdown') e.currentTarget.setPointerCapture(e.pointerId);
    if (e.type === 'pointermove' && e.pointerType !== 'mouse' && e.buttons === 0) return;
    const r = box.current.getBoundingClientRect();
    setRadius(Math.max(60, r.width * LIGHT * 0.01));
    moveTo(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = 4;
    const k: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const d = k[e.key];
    if (!d || allFound) return;
    e.preventDefault();
    moveTo(pos.x + d[0], pos.y + d[1]);
  };

  const place = (claimId: string, target: ProofTarget) => {
    const claim = CLAIMS.find((c) => c.id === claimId)!;
    const res = judgeClaim(claim, target);
    setClaimMsg(res);
    setPickedClaim(null);
    if (!res.ok) return;
    const next = { ...placed, [claimId]: target };
    setPlaced(next);
    if (CLAIMS.every((c) => next[c.id] === c.proof) && !completed.current) {
      completed.current = true;
      onComplete();
    }
  };
  const tapTarget = (t: ProofTarget) => {
    if (pickedClaim) place(pickedClaim, t);
  };

  const { drag, hover, bind } = useDragToken({
    disabled: !allFound,
    onDrop: (id, target) => {
      if (!target) return;
      if (target === 'milczy') place(id, 'milczy');
      else if (target.startsWith('fig-')) place(id, target.slice(4) as FigureId);
    },
    onTap: (id) => setPickedClaim((p) => (p === id ? null : id)),
  });

  return (
    <div className="space-y-4">
      {!allFound ? (
        <p className="text-sm leading-relaxed">
          To prawdziwa ściana w jaskini Lascaux we Francji — zdjęcie zrobione przy sztucznym świetle. Ludzie, którzy ją
          malowali, widzieli ją tylko przy ogniu. <strong>Prowadź pochodnię palcem po ścianie</strong> i zatrzymaj światło na
          tym, co znajdziesz. Są tu cztery rzeczy.
        </p>
      ) : (
        <p className="text-sm leading-relaxed">
          Malowidła mają ok. 17 tysięcy lat. Czego się z nich dowiemy o malarzach? <strong>Przyłóż każdy wniosek do ściany</strong>{' '}
          — do postaci, która go dowodzi. A jeśli na ścianie nie ma dowodu, połóż go na półce „ściana milczy”.
        </p>
      )}

      <div
        ref={box}
        role="application"
        aria-label="Ściana jaskini — prowadź światło palcem albo strzałkami"
        tabIndex={allFound ? -1 : 0}
        onPointerDown={onPointer}
        onPointerMove={onPointer}
        onKeyDown={onKeyDown}
        className={`relative mx-auto w-full max-w-[640px] select-none overflow-hidden border bg-black ${allFound ? '' : 'cursor-crosshair touch-none'}`}
        style={{ aspectRatio: '720 / 472' }}
      >
        <Image
          src={wall}
          alt="Fotografia: ściana jaskini Lascaux — wielkie byki (tury) namalowane czarną i białą farbą, ciemny koń u góry, małe czerwone jelenie i rząd czerwonych kresek na jasnej skale"
          width={720}
          height={472}
          draggable={false}
          className="pointer-events-none h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-[background] duration-700"
          style={{
            background: allFound
              ? 'rgba(8,5,2,0.12)'
              : `radial-gradient(circle ${radius}px at ${pos.x}% ${pos.y}%, rgba(255,190,110,0.1) 0%, rgba(8,5,2,0.15) 55%, rgba(8,5,2,0.97) 100%)`,
          }}
        />
        {FIGURES.map((f) => {
          const isFound = found.includes(f.id);
          if (!isFound) return null;
          const claims = CLAIMS.filter((c) => placed[c.id] === f.id);
          return (
            <div
              key={f.id}
              data-drop={allFound ? `fig-${f.id}` : undefined}
              onClick={() => allFound && tapTarget(f.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                width: `${f.r * 2}%`,
                height: `${(f.r * 2) / ASPECT}%`,
                borderColor: hover === `fig-${f.id}` ? '#fde047' : 'rgba(253,224,71,0.7)',
                background: hover === `fig-${f.id}` ? 'rgba(253,224,71,0.18)' : undefined,
                cursor: allFound && pickedClaim ? 'pointer' : undefined,
              }}
            >
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-black/75 px-1 text-[10px] font-semibold text-amber-200">
                {f.name}
                {claims.length ? ` · ${claims.length} ✓` : ''}
              </span>
            </div>
          );
        })}
        {!allFound && (
          <span className="absolute right-1 top-1 bg-black/70 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-amber-200">
            {found.length}/{FIGURES.length}
          </span>
        )}
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">
        Malowidła w jaskini Lascaux (Francja), ok. 17 tys. lat temu. Fotografia: Wikimedia Commons, „Lascaux painting.jpg”,
        domena publiczna.
      </p>

      {!allFound && note && (
        <p className="border-l-2 pl-3 text-sm" style={{ borderColor: color }} aria-live="polite">
          {note}
        </p>
      )}

      {allFound && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {CLAIMS.filter((c) => !placed[c.id]).map((c) => (
              <button
                key={c.id}
                type="button"
                {...bind(c.id)}
                className="touch-none border bg-white px-3 py-2 text-left text-sm dark:bg-zinc-900"
                style={{ outline: pickedClaim === c.id ? `3px solid ${color}` : undefined }}
              >
                {c.text}
              </button>
            ))}
          </div>
          <div
            data-drop="milczy"
            onClick={() => tapTarget('milczy')}
            className="min-h-[3.5rem] border border-dashed p-2"
            style={{ borderColor: hover === 'milczy' ? color : undefined, cursor: pickedClaim ? 'pointer' : undefined }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ściana milczy</p>
            <ul className="mt-1 space-y-0.5 text-sm">
              {CLAIMS.filter((c) => placed[c.id] === 'milczy').map((c) => (
                <li key={c.id}>{c.text}</li>
              ))}
            </ul>
          </div>
          {claimMsg && (
            <p className={`text-sm ${claimMsg.ok ? '' : 'text-destructive'}`} aria-live="polite">
              {claimMsg.text}
            </p>
          )}
          {allPlaced && (
            <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
              Malarze z Lascaux nie zostawili ani jednego słowa — a jednak wiemy, jakie zwierzęta widzieli wokół siebie:
              tury, konie, jelenie. Pisma jeszcze nie było, więc to, co namalowali, jest dla nas <strong>źródłem</strong>.
              Najstarsze znane malowidła, w Indonezji, mają ponad 50 tysięcy lat.
            </p>
          )}
          <DragGhost drag={drag}>
            <span className="block max-w-[240px] border bg-white px-3 py-2 text-sm">{CLAIMS.find((c) => c.id === drag?.id)?.text}</span>
          </DragGhost>
        </div>
      )}
    </div>
  );
}
