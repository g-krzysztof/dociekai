'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatM, jump, swingAt, TIMING_TEXT, type Jump } from './skok';

const GROUND = 150;
const START_X = 46;
const PX_PER_M = 88;
const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Blok 3 — **Skok z ciężarkami**. Gest: wyczucie chwili. Ręce zawodnika same
 * wymachują ciężarkami w przód i w tył; dziecko stuka „Skacz!” — liczy się
 * faza wymachu w chwili odbicia (model wg Minettiego i Ardigò, 2002). Gotowe,
 * gdy jest skok bez ciężarków i skok z ciężarkami dłuższy od niego.
 */
export function SkokWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [weights, setWeights] = useState(true);
  const [t, setT] = useState(0);
  const [jumps, setJumps] = useState<Jump[]>([]);
  const [flying, setFlying] = useState<Jump | null>(null);
  const start = useRef<number | null>(null);
  const reported = useRef(false);

  useEffect(() => {
    if (flying) return;
    let raf = 0;
    const tick = (now: number) => {
      if (start.current === null) start.current = now;
      setT(now - start.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [flying]);

  const without = jumps.filter((j) => !j.weights);
  const withW = jumps.filter((j) => j.weights);
  const bestWithout = without.length ? Math.max(...without.map((j) => j.metres)) : null;
  const bestWith = withW.length ? Math.max(...withW.map((j) => j.metres)) : null;
  const done = bestWithout !== null && bestWith !== null && bestWith > bestWithout;

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [done, onDone]);

  const doJump = () => {
    if (flying) return;
    const j = jump(weights, t);
    setFlying(j);
    setJumps((prev) => [...prev, j]);
    window.setTimeout(() => setFlying(null), 1300);
  };

  const { arm } = swingAt(t);
  const shown = flying ? (flying.weights ? 1 : 0.4) : arm;
  const a = (shown * 100 * Math.PI) / 180;
  const shoulder = { x: 0, y: -46 };
  const hand = { x: r1(shoulder.x + 26 * Math.sin(a)), y: r1(shoulder.y + 26 * Math.cos(a)) };
  const last = jumps[jumps.length - 1];
  const landX = (m: number) => r1(START_X + m * PX_PER_M);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Ciężarki">
        {[true, false].map((w) => (
          <button
            key={String(w)}
            type="button"
            role="radio"
            aria-checked={weights === w}
            onClick={() => setWeights(w)}
            disabled={!!flying}
            className={cn('border-2 bg-white px-3 py-1.5 text-sm dark:bg-zinc-900', weights === w && 'font-semibold')}
            style={{ borderColor: weights === w ? color : 'var(--border)' }}
          >
            {w ? 'Z ciężarkami' : 'Bez ciężarków'}
          </button>
        ))}
      </div>

      <div className="border bg-[#f3ecdc] dark:bg-zinc-900">
        <svg viewBox="0 0 360 180" className="block h-auto w-full select-none" role="img" aria-label="Skocznia: zawodnik przy belce i piasek z miarą">
          <rect x={0} y={GROUND} width={360} height={30} fill="#cdbf9b" />
          <rect x={START_X} y={GROUND} width={300} height={10} fill="#ead9a8" />
          <rect x={START_X - 4} y={GROUND} width={4} height={10} fill="#78350f" />
          {[0, 1, 2, 3].map((m) => (
            <g key={m}>
              <line x1={landX(m)} x2={landX(m)} y1={GROUND + 10} y2={GROUND + 16} stroke="#5b4a36" />
              <text x={landX(m)} y={GROUND + 26} textAnchor="middle" fontSize={9} fill="#5b4a36">
                {m} m
              </text>
            </g>
          ))}
          {jumps.map((j, i) => (
            <line key={i} x1={landX(j.metres)} x2={landX(j.metres)} y1={GROUND} y2={GROUND + 10} stroke={j.weights ? color : '#57534e'} strokeWidth={i === jumps.length - 1 ? 2.5 : 1.2} opacity={i === jumps.length - 1 ? 1 : 0.5} />
          ))}
          <motion.g
            key={jumps.length}
            initial={{ x: flying ? START_X : last ? landX(last.metres) : START_X, y: GROUND }}
            animate={
              flying
                ? { x: [START_X, (START_X + landX(flying.metres)) / 2, landX(flying.metres)], y: [GROUND, GROUND - 46, GROUND] }
                : { x: last ? landX(last.metres) : START_X, y: GROUND }
            }
            transition={{ duration: flying ? 1.1 : 0, ease: 'easeOut' }}
          >
            {/* Zawodnik — sylwetka kreskowa. */}
            <circle cx={0} cy={-58} r={7} fill="#78350f" />
            <line x1={0} y1={-51} x2={0} y2={-22} stroke="#78350f" strokeWidth={4} strokeLinecap="round" />
            <line x1={0} y1={-22} x2={-8} y2={0} stroke="#78350f" strokeWidth={4} strokeLinecap="round" />
            <line x1={0} y1={-22} x2={8} y2={0} stroke="#78350f" strokeWidth={4} strokeLinecap="round" />
            <line x1={shoulder.x} y1={shoulder.y} x2={hand.x} y2={hand.y} stroke="#78350f" strokeWidth={3.5} strokeLinecap="round" />
            {weights && <rect x={hand.x - 5} y={hand.y - 3} width={10} height={6} fill="#57534e" />}
          </motion.g>
        </svg>
      </div>

      <button
        type="button"
        onClick={doJump}
        disabled={!!flying}
        className="w-full border-2 py-3 text-base font-bold uppercase tracking-wide text-white disabled:opacity-60"
        style={{ background: color, borderColor: color }}
      >
        Skacz!
      </button>

      <div aria-live="polite" className="min-h-[3rem] text-sm leading-relaxed">
        {last && !flying ? (
          <p>
            <strong>{formatM(last.metres)}</strong> — {TIMING_TEXT[last.timing]}
          </p>
        ) : (
          !last && (
            <p className="text-muted-foreground">
              Grecy skakali z miejsca, trzymając w dłoniach kamienne albo ołowiane ciężarki. Patrz na ręce: stuknij „Skacz!”
              w chwili, gdy ciężarki są najdalej z przodu. Skocz raz bez ciężarków i spróbuj go pobić z ciężarkami.
            </p>
          )
        )}
        {(bestWithout !== null || bestWith !== null) && (
          <p className="mt-1 text-muted-foreground">
            Najlepszy bez ciężarków: {bestWithout !== null ? formatM(bestWithout) : '—'} · z ciężarkami:{' '}
            {bestWith !== null ? formatM(bestWith) : '—'}
          </p>
        )}
      </div>

      {done && (
        <p className="border-2 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <strong>
            Pobite o {Math.round(((bestWith ?? 0) - (bestWithout ?? 0)) * 100)} cm.
          </strong>{' '}
          W 2002 roku naukowcy z Włoch kazali współczesnym sportowcom skakać z kopiami greckich ciężarków. Dobrze zgrany
          wymach wydłużał skok o kilkanaście centymetrów — a źle zgrany go skracał. Ciężarki pomagały tylko temu, kto miał
          wyczucie chwili.
        </p>
      )}
    </div>
  );
}
