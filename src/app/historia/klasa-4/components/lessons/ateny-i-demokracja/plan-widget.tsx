'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import { KALLIAS_GOAL, PLACES, PLAN_H, PLAN_W, START, placeAt, roleDone, visit, type PlaceId, type Role } from './plan';

/**
 * Blok 3 — **Dzień Ateńczyka**. Dziecko prowadzi palcem po planie Aten najpierw
 * obywatela Kalliasa, potem jego córkę Kleo. Miejsca „ożywają” po wejściu; gdzie
 * córce nie wolno, niewidzialny mur odpycha ją z powrotem.
 */
const ROLES: { id: Role; name: string; who: string }[] = [
  { id: 'kallias', name: 'Kallias', who: 'obywatel, 40 lat' },
  { id: 'kleo', name: 'Kleo', who: 'jego córka, 11 lat' },
];

export function PlanWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [role, setRole] = useState<Role>('kallias');
  const [pos, setPos] = useState(START.kallias);
  const [visited, setVisited] = useState<Record<Role, PlaceId[]>>({ kallias: [], kleo: [] });
  const [refused, setRefused] = useState<PlaceId[]>([]);
  const [msg, setMsg] = useState<{ text: string; bad: boolean } | null>(null);
  const [bump, setBump] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const lastSafe = useRef(START.kallias);
  const here = useRef<PlaceId | null>('dom');
  const reported = useRef(false);

  const kalliasDone = roleDone('kallias', visited.kallias, []);
  const kleoDone = roleDone('kleo', visited.kleo, refused);

  const toMap = (e: PointerEvent<SVGSVGElement>) => {
    const box = svgRef.current!.getBoundingClientRect();
    const k = PLAN_W / box.width;
    return { x: Math.max(8, Math.min(PLAN_W - 8, (e.clientX - box.left) * k)), y: Math.max(8, Math.min(PLAN_H - 8, (e.clientY - box.top) * k)) };
  };

  const enter = (id: PlaceId) => {
    const v = visit(role, id);
    if (v.access === 'zakaz') {
      dragging.current = false;
      setPos(lastSafe.current);
      setBump((b) => b + 1);
      setMsg({ text: v.text, bad: true });
      if (!refused.includes(id)) {
        const nextRefused = [...refused, id];
        setRefused(nextRefused);
        if (roleDone('kleo', visited.kleo, nextRefused) && !reported.current) {
          reported.current = true;
          onDone();
        }
      }
      return false;
    }
    setMsg({ text: v.text, bad: false });
    if (!visited[role].includes(id)) {
      const next = { ...visited, [role]: [...visited[role], id] };
      setVisited(next);
      if (role === 'kleo' && roleDone('kleo', next.kleo, refused) && !reported.current) {
        reported.current = true;
        onDone();
      }
    }
    return true;
  };

  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const p = toMap(e);
    const id = placeAt(p.x, p.y);
    if (id !== here.current) {
      here.current = id;
      if (id && !enter(id)) {
        here.current = placeAt(lastSafe.current.x, lastSafe.current.y);
        return;
      }
    }
    if (!id || visit(role, id).access !== 'zakaz') lastSafe.current = p;
    setPos(p);
  };

  const switchRole = (r: Role) => {
    setRole(r);
    setPos(START[r]);
    lastSafe.current = START[r];
    here.current = 'dom';
    setMsg(null);
  };

  const goal = role === 'kallias' ? `Zaprowadź Kalliasa na agorę, na Pnyks i na Akropol.` : `Przejdź z Kleo tę samą trasę — i zobacz, dokąd wejdzie.`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            disabled={r.id === 'kleo' && !kalliasDone}
            onClick={() => switchRole(r.id)}
            className={cn('border-2 px-3 py-1.5 text-left text-sm disabled:opacity-40', role === r.id ? 'font-semibold' : 'bg-white dark:bg-zinc-900')}
            style={role === r.id ? { borderColor: color, color } : undefined}
          >
            {r.name} <span className="text-xs font-normal text-muted-foreground">· {r.who}</span>
          </button>
        ))}
      </div>
      <p className="text-sm leading-relaxed">
        <strong>Prowadź palcem</strong> {role === 'kallias' ? 'Kalliasa' : 'Kleo'} po planie Aten. {goal}
      </p>

      <div className="mx-auto max-w-[520px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${PLAN_W} ${PLAN_H}`}
          className="w-full cursor-grab touch-none border bg-[#efe6cf] dark:bg-zinc-800"
          role="img"
          aria-label="Plan Aten: dom, fontanna, agora, sąd, wzgórze Pnyks, Akropol i teatr"
          onPointerDown={(e) => {
            const p = toMap(e);
            if (Math.hypot(p.x - pos.x, p.y - pos.y) > 34) return;
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={move}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          <ellipse cx="200" cy="150" rx="196" ry="142" fill="none" stroke="#a08a5c" strokeWidth="3" strokeDasharray="10 4" />
          <path d="M62,62 L168,46 M62,62 L190,112 L282,170 M190,112 L132,128 L92,212 M282,170 L318,246 M190,112 L92,212" stroke="#d2c19a" strokeWidth="6" fill="none" strokeLinecap="round" />
          <ellipse cx="282" cy="170" rx="58" ry="40" fill="#cbb68a" />
          <ellipse cx="92" cy="216" rx="42" ry="30" fill="#d6c59c" />
          {PLACES.map((pl) => {
            const v = visit(role, pl.id);
            const seen = visited[role].includes(pl.id);
            const no = role === 'kleo' && refused.includes(pl.id);
            return (
              <g key={pl.id} pointerEvents="none">
                <circle cx={pl.x} cy={pl.y} r={pl.r} fill={no ? '#fecaca' : seen ? `${color}33` : '#ffffff99'} stroke={no ? '#b91c1c' : seen ? color : '#8a7650'} strokeWidth="1.5" strokeDasharray={v.access === 'sporne' && role === 'kleo' ? '4 3' : undefined} />
                <text x={pl.x} y={pl.y + 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#3b2a12">
                  {pl.name}
                </text>
              </g>
            );
          })}
          <g key={bump} transform={`translate(${pos.x.toFixed(1)} ${pos.y.toFixed(1)})`} className={bump ? 'hist-bump' : undefined} pointerEvents="none">
            <circle r="13" fill="white" stroke={color} strokeWidth="2.5" />
            <text y="4.5" textAnchor="middle" fontSize="12" fontWeight="bold" fill={color}>
              {role === 'kallias' ? 'K' : 'Kl'}
            </text>
          </g>
        </svg>
        <style>{`.hist-bump{animation:histbump .35s}@keyframes histbump{25%{opacity:.4}75%{opacity:.4}}@media (prefers-reduced-motion: reduce){.hist-bump{animation:none}}`}</style>
      </div>

      {msg && (
        <p className={cn('text-sm leading-relaxed', msg.bad && 'text-destructive')} role="status">
          {msg.text}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {role === 'kallias'
          ? `Odwiedzone: ${KALLIAS_GOAL.filter((p) => visited.kallias.includes(p)).length} z ${KALLIAS_GOAL.length}`
          : `Kleo weszła do ${visited.kleo.length} miejsc, zatrzymana ${refused.length} ${refused.length === 1 ? 'raz' : 'razy'}.`}
        {kalliasDone && role === 'kallias' && ' — teraz przełącz na Kleo.'}
      </p>

      {kleoDone && (
        <div className="border-l-4 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          To samo miasto, dwa różne dni. Kallias decyduje o wojnie i sądzi sąsiadów. Kleo zna dom, fontannę i święto —
          a o tym, za kogo wyjdzie za mąż, zdecyduje jej ojciec. Demokracja ateńska była demokracją dla obywateli.
        </div>
      )}
    </div>
  );
}
