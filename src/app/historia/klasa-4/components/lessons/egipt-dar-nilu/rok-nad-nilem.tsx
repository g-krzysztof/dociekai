'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import {
  MONTHS,
  SEASONS,
  SOW_TEXT,
  judgeSowing,
  mudWetness,
  seasonAt,
  waterOnField,
  type SowVerdict,
} from './nil';

/**
 * Blok 1, część A — **siew w porę**. Rok płynie sam (od lipca), a dziecko
 * przeciąga worek ziarna na pole w chwili, którą samo wybierze. Sędzią jest
 * stan pola w tej chwili (woda / mokry muł / spękana skorupa).
 */
const MONTHS_PER_SEC = 0.6;
const SEASON_COLORS: Record<string, string> = { achet: '#5b8fb0', peret: '#5e9a4b', szemu: '#c9a23a' };

export function SiewWPore({ color, onDone }: { color: string; onDone: () => void }) {
  const [t, setT] = useState(0);
  const [running, setRunning] = useState(false);
  const [sownAt, setSownAt] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<SowVerdict | null>(null);
  const [harvested, setHarvested] = useState(false);
  const [tries, setTries] = useState(0);
  const tRef = useRef(0);
  const reported = useRef(false);

  // Zegar roku: przed siewem płynie zwykłym tempem, po udanym siewie — szybciej, do żniw.
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const speed = verdict === 'w-pore' ? 2.4 : MONTHS_PER_SEC;
      let next = tRef.current + dt * speed;
      if (verdict === 'w-pore' && next >= 9) {
        next = 9;
        tRef.current = next;
        setT(next);
        setRunning(false);
        setHarvested(true);
        return;
      }
      if (next >= 12) next -= 12;
      tRef.current = next;
      setT(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, verdict]);

  useEffect(() => {
    if (harvested && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [harvested, onDone]);

  const sow = () => {
    if (sownAt !== null) return;
    const now = tRef.current;
    const v = judgeSowing(now);
    setSownAt(now);
    setVerdict(v);
    setTries((n) => n + 1);
    if (v !== 'w-pore') setRunning(false);
    else setRunning(true);
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: (_id, target) => {
      if (target === 'pole') sow();
    },
    onTap: () => sow(),
    disabled: sownAt !== null || !running,
  });

  const again = () => {
    tRef.current = 0;
    setT(0);
    setSownAt(null);
    setVerdict(null);
    setRunning(true);
  };

  const water = waterOnField(t);
  const wet = mudWetness(t);
  const season = seasonAt(t);
  const sprout = verdict === 'w-pore' && sownAt !== null ? Math.min(1, Math.max(0, (t - sownAt) / 2.5)) : 0;
  const ripe = verdict === 'w-pore' ? Math.min(1, Math.max(0, (t - 7.5) / 1.2)) : 0;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Rok nad Nilem zaczyna się w lipcu — wtedy rzeka zaczyna przybierać. Uruchom rok i obserwuj pole.
        Kiedy uznasz, że to dobra chwila, <strong>przeciągnij worek ziarna na pole</strong> (albo stuknij
        worek). Masz jeden worek na rok.
      </p>

      {/* Koło pór roku rozwinięte w pasek: trzy pory po cztery miesiące */}
      <div>
        <div className="flex">
          {SEASONS.map((s) => (
            <div
              key={s.id}
              className="flex-1 border-r px-1 py-1 text-center text-[11px] font-semibold text-white last:border-r-0 sm:text-xs"
              style={{ background: SEASON_COLORS[s.id], opacity: season.id === s.id ? 1 : 0.55 }}
            >
              {s.name} · {s.what}
            </div>
          ))}
        </div>
        <div className="relative flex border-x border-b">
          {MONTHS.map((m) => (
            <div key={m} className="flex-1 py-0.5 text-center text-[10px] text-muted-foreground">
              {m}
            </div>
          ))}
          <div
            aria-hidden
            className="absolute -top-1 bottom-0 w-0.5 bg-zinc-900 dark:bg-white"
            style={{ left: `${(t / 12) * 100}%` }}
          />
        </div>
      </div>

      <svg viewBox="0 0 360 170" className="w-full border bg-sky-50 dark:bg-sky-950/30" role="img" aria-label="Przekrój doliny Nilu: pustynia, pole i rzeka">
        {/* pustynia po lewej */}
        <path d="M0,40 L70,40 L95,110 L0,110 Z" fill="#e8cf96" />
        <text x="10" y="32" fontSize="10" fill="#8a6a2a">pustynia</text>
        {/* pole */}
        <rect
          data-drop="pole"
          x="95"
          y="100"
          width="170"
          height="20"
          fill={wet > 0 ? `rgb(${Math.round(70 + (1 - wet) * 120)},${Math.round(55 + (1 - wet) * 100)},${Math.round(40 + (1 - wet) * 60)})` : '#c7a46a'}
          stroke={hover === 'pole' ? color : 'none'}
          strokeWidth="3"
        />
        {wet < 0.5 && t > 5 && (
          <path d="M110,104 l12,8 l10,-6 M150,103 l8,10 l14,-5 M200,105 l9,7 l12,-8 M235,103 l6,11" stroke="#7a5a2a" strokeWidth="1" fill="none" />
        )}
        {/* kiełki i zboże */}
        {sprout > 0 &&
          Array.from({ length: 12 }, (_, i) => {
            const x = 105 + i * 13.5;
            const h = 4 + sprout * 22;
            return (
              <line
                key={i}
                x1={x}
                y1={100}
                x2={x}
                y2={100 - h}
                stroke={ripe > 0.5 ? '#d1a93c' : '#4f9a3c'}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })}
        {/* ziarno, które spłynęło albo leży na skorupie */}
        {verdict && verdict !== 'w-pore' && (
          <g fill="#e9d38a">
            {[120, 160, 200, 240].map((x) => (
              <circle key={x} cx={verdict === 'za-pozno' ? x : x + 60} cy={verdict === 'za-pozno' ? 98 : 96} r="2.5" />
            ))}
          </g>
        )}
        {/* rzeka i wylew */}
        <rect x="265" y="100" width="95" height="70" fill="#7aa7c4" />
        <rect x="95" y={100 - water * 22} width="265" height={water * 22} fill="#7aa7c4" opacity="0.85" />
        <rect x="0" y="120" width="265" height="50" fill="#b78b55" />
        <text x="290" y="145" fontSize="11" fill="white">Nil</text>
        <text x="150" y="140" fontSize="10" fill="#f6ead4">pole Ipiego</text>
      </svg>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          {...bind('worek')}
          disabled={sownAt !== null || !running}
          className="touch-none border-2 px-4 py-2 text-sm font-semibold disabled:opacity-40"
          style={{ borderColor: color }}
        >
          🌾 worek ziarna
        </button>
        {sownAt === null && (
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="flex items-center gap-1 border px-3 py-2 text-sm"
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? 'Zatrzymaj rok' : t === 0 ? 'Uruchom rok' : 'Wznów'}
          </button>
        )}
        <span className="text-xs text-muted-foreground">
          teraz: {MONTHS[Math.floor(t) % 12]} · {season.name}
        </span>
      </div>
      <DragGhost drag={drag}>
        <span className="border-2 bg-white px-3 py-1 text-sm dark:bg-zinc-900" style={{ borderColor: color }}>
          🌾
        </span>
      </DragGhost>

      {verdict && (
        <div
          className="border-l-4 p-3 text-sm leading-relaxed"
          style={{ borderColor: verdict === 'w-pore' ? color : '#b91c1c' }}
          role="status"
        >
          <p>{SOW_TEXT[verdict]}</p>
          {verdict !== 'w-pore' && (
            <button type="button" onClick={again} className="mt-2 flex items-center gap-1 border px-3 py-1.5 text-sm">
              <RotateCcw className="h-4 w-4" /> Jeszcze jeden rok
            </button>
          )}
          {harvested && (
            <p className="mt-2">
              {tries > 1 ? `Udało się w ${tries}. roku. ` : ''}
              Okno na siew trwało tylko kilka tygodni — między zejściem wody a wyschnięciem mułu. Egipcjanie
              nie zgadywali: czekali na znak od rzeki.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
