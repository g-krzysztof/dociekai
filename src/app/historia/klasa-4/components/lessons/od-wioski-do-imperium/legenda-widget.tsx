'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Shovel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LEGENDA, scoreMarks, type Mark } from './legenda';

const MARK_STYLE: Record<Mark, { bg: string; label: string }> = {
  sprawdzic: { bg: '#bbf7d0', label: 'da się sprawdzić' },
  legenda: { bg: '#fde68a', label: 'tylko legenda' },
};

/**
 * Blok 1 — **Romulus i Remus — sprawdzam**. Gest (znany z L14): zakreślacz
 * dwoma kolorami — dziecko wybiera kolor i stuka zdania; potem **wysuwa
 * szufladę** z wykopaliskami (ciągnie uchwyt w prawo albo stuka), a szuflada
 * stempluje każde zdanie. `onDone` po otwarciu szuflady.
 */
export function LegendaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [pen, setPen] = useState<Mark>('sprawdzic');
  const [marks, setMarks] = useState<Record<string, Mark | undefined>>({});
  const [open, setOpen] = useState(0); // 0..1 wysunięcie szuflady
  const [opened, setOpened] = useState(false);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reported = useRef(false);

  const allMarked = LEGENDA.every((s) => marks[s.id]);
  const score = opened ? scoreMarks(marks) : null;

  useEffect(() => {
    if (opened && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [opened, onDone]);

  const setOpenAmount = (v: number) => {
    const c = Math.max(0, Math.min(1, v));
    setOpen(c);
    if (c >= 0.85 && !opened) {
      setOpen(1);
      setOpened(true);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Zakreślacz">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Zakreślacz:</span>
        {(Object.keys(MARK_STYLE) as Mark[]).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={pen === m}
            disabled={opened}
            onClick={() => setPen(m)}
            className={cn('border-2 px-3 py-1 text-sm', pen === m && 'font-semibold')}
            style={{ background: MARK_STYLE[m].bg, borderColor: pen === m ? '#111' : 'transparent' }}
          >
            {MARK_STYLE[m].label}
          </button>
        ))}
      </div>

      <ol className="space-y-1.5 border bg-white p-3 text-base leading-relaxed dark:bg-zinc-900/70">
        {LEGENDA.map((s) => {
          const m = marks[s.id];
          const bad = score && m !== s.truth;
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={opened}
                onClick={() => setMarks((prev) => ({ ...prev, [s.id]: prev[s.id] === pen ? undefined : pen }))}
                className="rounded-sm px-1 text-left"
                style={{ background: m ? MARK_STYLE[m].bg : undefined }}
              >
                {s.text}
              </button>
              {score && (
                <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={cn('ml-1 mt-0.5 border-l-2 pl-2 text-sm', bad ? 'border-destructive text-destructive' : 'text-muted-foreground')} style={bad ? undefined : { borderColor: color }}>
                  <strong>{s.truth === 'sprawdzic' ? '✓ potwierdzone' : '? łopatą nie sprawdzisz'}</strong> — {s.evidence}
                </motion.p>
              )}
            </li>
          );
        })}
      </ol>

      <div className="border bg-[#efe6d2] p-2 dark:bg-zinc-900">
        <div ref={trackRef} className="relative h-12 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 flex items-center gap-2 border bg-[#c9a66b] px-3 text-sm font-semibold text-[#3b2a14]"
            style={{ width: `${30 + open * 70}%` }}
          >
            <Shovel className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">Szuflada: wykopaliska na Palatynie</span>
          </div>
          <button
            type="button"
            disabled={!allMarked || opened}
            aria-label="Wysuń szufladę z wykopaliskami"
            onPointerDown={(e) => {
              if (!allMarked || opened) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, start: open };
            }}
            onPointerMove={(e) => {
              if (!drag.current || !trackRef.current) return;
              setOpenAmount(drag.current.start + (e.clientX - drag.current.x) / (trackRef.current.clientWidth * 0.7));
            }}
            onPointerUp={() => {
              if (drag.current && !opened) setOpen(0);
              drag.current = null;
            }}
            onClick={() => allMarked && !opened && open === 0 && setOpenAmount(1)}
            className="absolute inset-y-1 touch-none cursor-grab border-2 bg-white px-2 text-lg font-bold disabled:cursor-not-allowed disabled:opacity-50"
            style={{ left: `calc(${30 + open * 70}% - 2.25rem)`, borderColor: color }}
          >
            ⟫
          </button>
        </div>
      </div>

      <p aria-live="polite" className="text-sm leading-relaxed">
        {!allMarked && !opened && (
          <span className="text-muted-foreground">
            Zaznacz każde zdanie jednym z dwóch kolorów. Potem pociągnij szufladę z dowodami w prawo.
          </span>
        )}
        {allMarked && !opened && <span className="text-muted-foreground">Gotowe. Pociągnij uchwyt szuflady w prawo.</span>}
        {score && (
          <span className="block border-2 p-3" style={{ borderColor: color }}>
            Zgadzasz się z wykopaliskami w {score.agree} z {score.total} zdań. Legenda o wilczycy to cuda i bogowie —
            ale stoi na prawdziwym miejscu i w prawdziwym czasie: <strong>w VIII wieku p.n.e. na wzgórzach nad Tybrem
            naprawdę była wioska pasterzy.</strong> Z niej wyrósł Rzym.
          </span>
        )}
      </p>
    </div>
  );
}
