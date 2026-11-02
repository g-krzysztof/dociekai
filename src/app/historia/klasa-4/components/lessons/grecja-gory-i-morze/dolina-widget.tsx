'use client';

import { useRef, useState } from 'react';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { FAMILIES, FIELDS, judgeValley, type ValleyTarget } from './kolonie';

/**
 * Wstęp do bloku 3 — **ciasna dolina**. Dziecko rozsadza rodziny na pola doliny
 * zamkniętej górami. Pól jest sześć, rodzin dziewięć: kto nie dostał ziemi,
 * musi wsiąść na statek. Tak zaczynała się każda kolonia.
 */
const FIELD_RECTS = Array.from({ length: FIELDS }, (_, i) => ({
  x: 92 + (i % 3) * 62,
  y: 96 + Math.floor(i / 3) * 44,
}));

export function DolinaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [fields, setFields] = useState<(number | null)[]>(() => Array(FIELDS).fill(null));
  const [aboard, setAboard] = useState<number[]>([]);
  const [why, setWhy] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const reported = useRef(false);

  const waiting = Array.from({ length: FAMILIES }, (_, i) => i).filter((i) => !fields.includes(i) && !aboard.includes(i));
  const sailed = waiting.length === 0;

  const place = (fam: number, target: ValleyTarget) => {
    const v = judgeValley(fields, target);
    if (!v.ok) {
      setWhy(v.why);
      return;
    }
    setWhy(null);
    setPicked(null);
    if (target === 'statek') {
      const next = [...aboard, fam];
      setAboard(next);
      if (next.length + FIELDS === FAMILIES && !reported.current) {
        reported.current = true;
        onDone();
      }
    } else if (target !== 'gory') {
      const i = Number(target.slice(5));
      setFields((prev) => prev.map((f, j) => (j === i ? fam : f)));
    }
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: (id, target) => target && place(Number(id), target as ValleyTarget),
    onTap: (id) => setPicked(Number(id)),
    disabled: sailed,
  });
  const tapTarget = (t: ValleyTarget) => picked !== null && place(picked, t);

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        W greckiej dolinie przybywa ludzi, a ziemi nie. <strong>Rozsadź rodziny na pola</strong> — jedno pole
        wyżywi jedną rodzinę. Przeciągnij rodzinę albo stuknij ją, a potem miejsce.
      </p>
      <div className="mx-auto max-w-[460px]">
        <svg viewBox="0 0 380 250" className="w-full border bg-[#a9cbe0]" role="img" aria-label="Dolina otoczona górami, sześć pól, zatoka ze statkiem">
          <path
            data-drop="gory"
            d="M0,0 H380 V196 L330,200 L300,120 L290,70 L250,60 L200,72 L150,58 L100,66 L72,110 L60,200 L0,196 Z"
            fill={hover === 'gory' ? '#a8886066' : '#a88860'}
            onClick={() => tapTarget('gory')}
          />
          <path d="M0,0 L40,0 L20,40 Z M60,0 L120,0 L90,46 Z M150,0 L230,0 L190,52 Z M250,0 L320,0 L285,44 Z M330,0 L380,0 L380,60 Z" fill="#7d6343" pointerEvents="none" />
          <path d="M72,110 L100,66 L150,58 L200,72 L250,60 L290,70 L300,120 L312,196 L72,196 Z" fill="#d9c98d" pointerEvents="none" />
          {FIELD_RECTS.map((r, i) => {
            const fam = fields[i];
            const id = `pole-${i}` as ValleyTarget;
            return (
              <g key={i} data-drop={id} onClick={() => tapTarget(id)}>
                <rect x={r.x} y={r.y} width="56" height="38" fill={fam !== null ? '#8fae5a' : hover === id ? `${color}55` : '#c2b56e'} stroke={hover === id ? color : '#8a7a3c'} strokeWidth={hover === id ? 2.5 : 1} />
                {fam !== null && (
                  <text x={r.x + 28} y={r.y + 24} textAnchor="middle" fontSize="12" fill="#2f4a12" fontWeight="bold" pointerEvents="none">
                    rodzina {fam + 1}
                  </text>
                )}
              </g>
            );
          })}
          <text x="14" y="120" fontSize="12" fill="#3b2a12" pointerEvents="none">góry</text>
          <g data-drop="statek" onClick={() => tapTarget('statek')} className={cn(sailed && 'hist-ship-sail')}>
            <rect x="150" y="204" width="90" height="40" fill={hover === 'statek' ? `${color}33` : 'transparent'} stroke={hover === 'statek' ? color : 'none'} strokeWidth="2" />
            <path d="M160,230 L230,230 L222,240 L168,240 Z" fill="#6b4423" />
            <path d="M195,206 L195,230 M195,208 L218,226 L195,226 Z" fill="#f5f0e1" stroke="#6b4423" strokeWidth="1.2" />
            {aboard.length > 0 && (
              <text x="246" y="232" fontSize="12" fill="#1e3a5f" fontWeight="bold" pointerEvents="none">
                na pokładzie: {aboard.length}
              </text>
            )}
          </g>
          <text x="20" y="232" fontSize="12" fill="#2c5878" fontStyle="italic" pointerEvents="none">zatoka</text>
        </svg>
        <style>{`.hist-ship-sail{animation:histsail 3s ease-in forwards}@keyframes histsail{to{transform:translate(160px,0);opacity:.2}}@media (prefers-reduced-motion: reduce){.hist-ship-sail{animation:none}}`}</style>
      </div>
      {!sailed && (
        <div className="flex flex-wrap gap-1.5">
          {waiting.map((i) => (
            <button
              key={i}
              type="button"
              {...bind(String(i))}
              className="flex touch-none items-center gap-1 border-2 bg-white px-2 py-1 text-xs font-semibold dark:bg-zinc-900"
              style={{ borderColor: picked === i ? color : undefined }}
            >
              <Users className="h-3.5 w-3.5" aria-hidden /> rodzina {i + 1}
            </button>
          ))}
        </div>
      )}
      <DragGhost drag={drag}>
        <span className="flex items-center gap-1 border-2 bg-white px-2 py-1 text-xs font-semibold dark:bg-zinc-900">
          <Users className="h-3.5 w-3.5" aria-hidden /> rodzina {drag ? Number(drag.id) + 1 : ''}
        </span>
      </DragGhost>
      {why && (
        <p className="text-sm text-destructive" role="status">
          {why}
        </p>
      )}
      {sailed && (
        <p className="border-l-4 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Trzy rodziny odpływają. Za morzem szukały zatoki z portem i kawałka równiny — i zakładały nowe miasto,
          które Grecy nazywali <strong>kolonią</strong>. Mówiło po grecku i czciło tych samych bogów, ale rządziło
          się samo, jak każda polis.
        </p>
      )}
    </div>
  );
}
