'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { LAYERS, MILE_KM, MILESTONE_MILES, MILESTONE_TEXT, testRoad, type LayerId, type RoadTest } from './droga';

const LAYER_LOOK: Record<LayerId, { fill: string; pattern: 'big' | 'mid' | 'fine' | 'slab' }> = {
  kamienie: { fill: '#8b8378', pattern: 'big' },
  gruz: { fill: '#a89f91', pattern: 'mid' },
  zwir: { fill: '#d6cbb5', pattern: 'fine' },
  plyty: { fill: '#6b6459', pattern: 'slab' },
};

/**
 * Blok 2 — **Droga na tysiąc lat**. Gest: dziecko przeciąga warstwy do wykopu
 * (każda kładzie się na poprzedniej; stuknięcie w wierzchnią ją zdejmuje),
 * potem puszcza wozy przez sto lat w przyspieszeniu — zła kolejność kończy się
 * koleinami, zapadnięciem albo pękaniem w roku, który podaje sędzia. Na końcu
 * kamień milowy z cyframi rzymskimi.
 */
export function DrogaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [stack, setStack] = useState<LayerId[]>([]);
  const [test, setTest] = useState<RoadTest | null>(null);
  const [year, setYear] = useState(0);
  const [selected, setSelected] = useState<LayerId | null>(null);
  const [miles, setMiles] = useState(0);
  const [milesOk, setMilesOk] = useState(false);
  const [milesMsg, setMilesMsg] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const reported = useRef(false);
  const built = test?.failYear === null && year >= 100;

  useEffect(() => {
    if (milesOk && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [milesOk, onDone]);

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  const add = (id: LayerId) => {
    if (stack.includes(id) || stack.length >= 4) return;
    setSelected(null);
    setTest(null);
    setYear(0);
    setStack((s) => [...s, id]);
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: (id, target) => target === 'wykop' && add(id as LayerId),
    onTap: (id) => setSelected((s) => (s === id ? null : (id as LayerId))),
  });

  const runYears = () => {
    const t = testRoad(stack);
    setTest(t);
    setYear(0);
    if (timer.current) window.clearInterval(timer.current);
    const end = t.failYear ?? 100;
    timer.current = window.setInterval(() => {
      setYear((y) => {
        const next = Math.min(end, y + 2);
        if (next >= end && timer.current) {
          window.clearInterval(timer.current);
          timer.current = null;
        }
        return next;
      });
    }, 40);
  };

  const broken = test && test.failYear !== null && year >= test.failYear;
  const card = (id: LayerId) => {
    const l = LAYERS.find((x) => x.id === id)!;
    return (
      <button
        key={id}
        type="button"
        {...bind(id)}
        aria-pressed={selected === id}
        className={cn('flex touch-none select-none items-center gap-2 border-2 bg-white px-2 py-1.5 text-left text-xs dark:bg-zinc-900', drag?.id === id && 'opacity-40')}
        style={{ borderColor: selected === id ? color : 'var(--border)' }}
      >
        <span className="h-6 w-6 shrink-0" style={{ background: LAYER_LOOK[id].fill }} aria-hidden />
        <span>
          <span className="block font-semibold">{l.name}</span>
          <span className="text-muted-foreground">{l.hint}</span>
        </span>
      </button>
    );
  };

  const tray = LAYERS.filter((l) => !stack.includes(l.id));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Warstwy ({tray.length})</p>
          {tray.map((l) => card(l.id))}
          {tray.length === 0 && <p className="text-sm text-muted-foreground">Wszystkie warstwy w wykopie.</p>}
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Przekrój drogi</p>
          <div
            data-drop="wykop"
            role="button"
            tabIndex={0}
            aria-label="Wykop pod drogę — połóż tu warstwę"
            onClick={() => selected && add(selected)}
            className={cn('relative h-48 overflow-hidden border-2 border-dashed bg-[#c7b48f]', (hover === 'wykop' || selected) && 'bg-[#d6c6a3]')}
            style={{ borderColor: hover === 'wykop' || selected ? color : undefined }}
          >
            <svg viewBox="0 0 200 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
              {stack.map((id, i) => {
                const y = 120 - (i + 1) * 26;
                const look = LAYER_LOOK[id];
                return (
                  <g key={id}>
                    <rect x={10} y={y} width={180} height={26} fill={look.fill} stroke="#57534e" strokeWidth={0.5} />
                    {look.pattern === 'big' && Array.from({ length: 9 }, (_, k) => <ellipse key={k} cx={20 + k * 20} cy={y + 13} rx={8} ry={9} fill="#776f63" />)}
                    {look.pattern === 'mid' && Array.from({ length: 18 }, (_, k) => <circle key={k} cx={15 + k * 10} cy={y + 8 + (k % 2) * 10} r={3} fill="#8b8274" />)}
                    {look.pattern === 'slab' && Array.from({ length: 4 }, (_, k) => <line key={k} x1={10 + (k + 1) * 36} x2={10 + (k + 1) * 36} y1={y} y2={y + 26} stroke="#3f3a33" strokeWidth={1} />)}
                  </g>
                );
              })}
              {broken && test?.failYear === 3 && <path d={`M40,${120 - stack.length * 26} q10,8 20,0 M120,${120 - stack.length * 26} q10,8 20,0`} stroke="#3f2d1d" strokeWidth={3} fill="none" />}
              {broken && test?.failYear === 20 && <path d={`M10,${120 - stack.length * 26} Q100,${130 - stack.length * 26 + 16} 190,${120 - stack.length * 26}`} stroke="#7f1d1d" strokeWidth={3} fill="none" />}
              {broken && test?.failYear === 55 && <path d={`M60,${120 - stack.length * 26} l10,8 l-6,6 l12,8 M140,${120 - stack.length * 26} l-8,10 l8,6`} stroke="#111" strokeWidth={1.5} fill="none" />}
            </svg>
            {stack.length === 0 && <span className="absolute inset-0 flex items-center justify-center text-xs text-[#5b4a36]">wykop — połóż pierwszą warstwę na dnie</span>}
          </div>
          {stack.length > 0 && !test && (
            <button
              type="button"
              onClick={() => setStack((s) => s.slice(0, -1))}
              className="mt-1 text-xs underline underline-offset-2"
            >
              Zdejmij wierzchnią warstwę
            </button>
          )}
        </div>
      </div>

      {stack.length === 4 && !built && (
        <div className="space-y-2">
          <button type="button" onClick={runYears} className="border-2 px-4 py-2 text-sm font-bold text-white" style={{ background: color, borderColor: color }}>
            Puść wozy na 100 lat
          </button>
          {test && (
            <div className="flex items-center gap-3">
              <span className="font-mono text-lg font-bold tabular-nums" style={{ color }}>
                rok {year}
              </span>
              <div className="h-2 flex-1 bg-muted">
                <motion.div className="h-2" style={{ width: `${year}%`, background: broken ? '#b91c1c' : color }} />
              </div>
            </div>
          )}
        </div>
      )}

      <div aria-live="polite" className="text-sm leading-relaxed">
        {broken && test?.problem && (
          <div className="space-y-1 border border-destructive/50 bg-destructive/5 p-3 text-destructive">
            <p>
              <strong>Rok {test.failYear}:</strong> {test.problem}
            </p>
            <button
              type="button"
              onClick={() => {
                setStack([]);
                setTest(null);
                setYear(0);
              }}
              className="text-xs underline underline-offset-2"
            >
              Rozkop i buduj od nowa
            </button>
          </div>
        )}
        {built && (
          <p className="border-2 p-3" style={{ borderColor: color }}>
            <strong>Sto lat wozów i deszczów — bez jednej dziury.</strong> Rzymianie zbudowali tysiące kilometrów takich dróg.
            Niektóre odcinki, jak Via Appia pod Rzymem, służą do dziś — ponad 2300 lat.
          </p>
        )}
      </div>

      {built && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid items-start gap-4 border-t pt-4 sm:grid-cols-[120px_1fr]">
          <svg viewBox="0 0 100 160" className="mx-auto h-40 w-24" aria-label={`Kamień milowy z napisem ${MILESTONE_TEXT}`} role="img">
            <rect x={20} y={20} width={60} height={130} fill="#d6d0c4" stroke="#78716c" />
            <ellipse cx={50} cy={20} rx={30} ry={8} fill="#e7e2d8" stroke="#78716c" />
            <text x={50} y={70} textAnchor="middle" fontSize={11} fontFamily="serif" fontWeight={700} fill="#44403c">
              M · P
            </text>
            <text x={50} y={90} textAnchor="middle" fontSize={14} fontFamily="serif" fontWeight={700} fill="#44403c">
              XXIV
            </text>
          </svg>
          <div className="space-y-2 text-sm leading-relaxed">
            <p>
              Przy rzymskiej drodze co milę stał kamień milowy. „M · P” to <em>milia passuum</em> — tysiące kroków, czyli
              mile. <strong>Ile mil stąd do Rzymu?</strong> Odczytaj liczbę.
            </p>
            <div className="flex items-center gap-2">
              {[-10, -1].map((d) => (
                <button key={d} type="button" disabled={milesOk} onClick={() => setMiles((m) => Math.max(0, m + d))} className="border px-2 py-1 text-sm">
                  {d}
                </button>
              ))}
              <span className="w-12 text-center font-mono text-xl font-bold tabular-nums" aria-live="polite">
                {miles}
              </span>
              {[1, 10].map((d) => (
                <button key={d} type="button" disabled={milesOk} onClick={() => setMiles((m) => m + d)} className="border px-2 py-1 text-sm">
                  +{d}
                </button>
              ))}
              {!milesOk && (
                <button
                  type="button"
                  onClick={() => {
                    if (miles === MILESTONE_MILES) {
                      setMilesOk(true);
                      setMilesMsg(null);
                    } else setMilesMsg(miles < MILESTONE_MILES ? 'Za mało — X to 10, a są dwa X.' : 'Za dużo — IV to 5 bez jednego, czyli 4.')
                  }}
                  className="border-2 px-3 py-1 text-sm font-semibold"
                  style={{ borderColor: color, color }}
                >
                  Sprawdź
                </button>
              )}
            </div>
            {milesMsg && <p className="text-destructive">{milesMsg}</p>}
            {milesOk && (
              <p>
                XXIV = 24 mile. Mila rzymska to ok. {MILE_KM.toString().replace('.', ',')} km, więc do Rzymu zostało ok.{' '}
                {Math.round(MILESTONE_MILES * MILE_KM)} km — jakieś dwa dni marszu legionu.
              </p>
            )}
          </div>
        </motion.div>
      )}

      <DragGhost drag={drag}>{drag ? card(drag.id as LayerId) : null}</DragGhost>
    </div>
  );
}
