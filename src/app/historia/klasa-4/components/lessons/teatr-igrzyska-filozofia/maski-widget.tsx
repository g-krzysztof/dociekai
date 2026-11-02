'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { MaskaGlyph } from './maska-glyph';
import { judgeMask, LINE, PLAYS, SCENES, type Mask } from './maski';

const MASKS: Mask[] = ['tragiczna', 'komiczna'];

/**
 * Blok 2 — **Maski**. Gest: dziecko zakłada aktorowi maskę (przeciąga ją na
 * twarz albo stuk-stuk) — ta sama kwestia zmienia sens, chór i widownia
 * reagują inaczej. Potem przykłada maskę do dwóch prawdziwych dramatów;
 * sędzią jest zakończenie sztuki.
 */
export function MaskiWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [worn, setWorn] = useState<Mask | null>(null);
  const [tried, setTried] = useState<Mask[]>([]);
  const [selected, setSelected] = useState<Mask | null>(null);
  const [posters, setPosters] = useState<Record<string, Mask>>({});
  const [error, setError] = useState<{ id: string; message: string } | null>(null);
  const reported = useRef(false);

  const bothTried = tried.length === 2;
  const complete = PLAYS.every((p) => posters[p.id]);

  useEffect(() => {
    if (complete && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [complete, onDone]);

  const place = (maskId: string, target: string | null) => {
    if (!target) return;
    const mask = maskId as Mask;
    setSelected(null);
    if (target === 'aktor') {
      setWorn(mask);
      setTried((t) => (t.includes(mask) ? t : [...t, mask]));
      return;
    }
    if (target.startsWith('sztuka-')) {
      const id = target.slice(7);
      if (posters[id]) return;
      const v = judgeMask(id, mask);
      if (v.ok) {
        setPosters((p) => ({ ...p, [id]: mask }));
        setError(null);
      } else setError({ id, message: v.message });
    }
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: place,
    onTap: (id) => setSelected((prev) => (prev === id ? null : (id as Mask))),
  });

  const token = (m: Mask) => (
    <button
      key={m}
      type="button"
      {...bind(m)}
      aria-pressed={selected === m}
      aria-label={`Maska ${m}`}
      className={cn('flex touch-none select-none flex-col items-center border-2 bg-white px-3 py-2 text-xs font-semibold dark:bg-zinc-900', drag?.id === m && 'opacity-40')}
      style={{ borderColor: selected === m ? color : 'var(--border)', boxShadow: selected === m ? `0 0 0 2px ${color}` : undefined }}
    >
      <MaskaGlyph mask={m} className="h-10 w-9" />
      {m}
    </button>
  );

  const scene = worn ? SCENES[worn] : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Maski:</span>
        {MASKS.map(token)}
        {selected && <span className="text-xs text-muted-foreground">Stuknij aktora albo plakat.</span>}
      </div>

      <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
        <div
          data-drop="aktor"
          role="button"
          tabIndex={0}
          aria-label="Aktor — załóż mu maskę"
          onClick={() => selected && place(selected, 'aktor')}
          className={cn('relative mx-auto flex h-[190px] w-[150px] items-end justify-center border-2 border-dashed bg-[#f3ecdc] dark:bg-zinc-900', hover === 'aktor' && 'bg-muted')}
          style={{ borderColor: hover === 'aktor' || selected ? color : undefined }}
        >
          <svg viewBox="0 0 100 130" className="h-full w-full" aria-hidden>
            <rect x={0} y={118} width={100} height={12} fill="#d9c9a6" />
            <path d="M30 118 L36 60 C40 52 60 52 64 60 L70 118 Z" fill="#a16207" opacity={0.85} />
            <path d="M36 66 L22 92 M64 66 L80 88" stroke="#a16207" strokeWidth={7} strokeLinecap="round" />
            {!worn && <circle cx={50} cy={40} r={14} fill="#c8a27a" />}
          </svg>
          {worn && (
            <motion.div key={worn} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute left-1/2 top-[14px] -translate-x-1/2">
              <MaskaGlyph mask={worn} className="h-[46px] w-10" />
            </motion.div>
          )}
          {!worn && <span className="absolute top-2 text-[10px] text-muted-foreground">tu maska</span>}
        </div>

        <div className="space-y-2 border bg-white p-3 text-sm leading-relaxed dark:bg-zinc-900/70" aria-live="polite">
          <p className="text-base italic">{LINE}</p>
          {scene ? (
            <>
              <p>{scene.story}</p>
              <p className="text-muted-foreground">{scene.chorus}</p>
              <p className="font-semibold" style={{ color }}>
                {scene.audience}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">Aktor nie ma jeszcze maski. Bez niej widz z 55. rzędu nie wie, czy płakać, czy się śmiać.</p>
          )}
          {worn && !bothTried && <p className="text-xs text-muted-foreground">Teraz załóż mu drugą maskę.</p>}
        </div>
      </div>

      {bothTried && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 border-t pt-4">
          <p className="text-sm leading-relaxed">
            Te same słowa, dwa różne przedstawienia. Grecy mieli na to dwie nazwy: <strong>tragedia</strong> — bohater
            walczy z losem albo z władzą i kończy się nieszczęściem; <strong>komedia</strong> — śmieszy, wyśmiewa ludzi i
            kończy się dobrze. Załóż maskę na plakat dwóch prawdziwych sztuk, granych w Atenach 2400 lat temu.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PLAYS.map((p) => {
              const on = posters[p.id];
              const isHover = hover === `sztuka-${p.id}`;
              return (
                <div
                  key={p.id}
                  data-drop={on ? undefined : `sztuka-${p.id}`}
                  role={on ? undefined : 'button'}
                  tabIndex={on ? undefined : 0}
                  onClick={() => selected && !on && place(selected, `sztuka-${p.id}`)}
                  className={cn('border-2 bg-white p-3 text-sm leading-relaxed dark:bg-zinc-900/70', !on && 'border-dashed', isHover && 'bg-muted')}
                  style={{ borderColor: on || isHover || (selected && !on) ? color : undefined }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="font-semibold">„{p.title}”</p>
                      <p className="text-xs text-muted-foreground">
                        {p.author}, {p.year}
                      </p>
                    </div>
                    {on ? <MaskaGlyph mask={on} className="h-10 w-9 shrink-0" /> : <span className="h-10 w-9 shrink-0 border border-dashed" aria-hidden />}
                  </div>
                  <p className="mt-2">{p.plot}</p>
                  <p className="mt-1 text-muted-foreground">Zakończenie: {p.ending}</p>
                  {error?.id === p.id && !on && (
                    <p className="mt-2 border border-destructive/50 bg-destructive/5 px-2 py-1.5 text-xs text-destructive" aria-live="polite">
                      {error.message}
                    </p>
                  )}
                  {on && (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
                      {on === 'tragiczna' ? 'tragedia' : 'komedia'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {complete && (
            <p className="border-2 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
              Obie sztuki gra się w teatrach do dziś — także w Polsce. Grecy wymyślili teatr ku czci boga Dionizosa: aktorzy
              w maskach, chór, który komentuje, i widzowie, którzy przez cały dzień oglądają kilka sztuk z rzędu.
            </p>
          )}
        </motion.div>
      )}

      <DragGhost drag={drag}>{drag ? token(drag.id as Mask) : null}</DragGhost>
    </div>
  );
}
