'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { clarity, heardWords, LINE, ROWS, type Ground } from './akustyka';

const W = 360;
const H = 220;
const BASE_Y = 196;
const rowX = (r: number) => Math.round((44 + (r - 1) * 5.6) * 10) / 10;
const rowY = (r: number, g: Ground) => (g === 'zbocze' ? Math.round((BASE_Y - (r - 1) * 2.7) * 10) / 10 : BASE_Y);
const ACTOR = { x: 18, y: BASE_Y };
const TOP = 50;

/**
 * Blok 1 — **Teatr w Epidauros**. Gest: dziecko przeciąga słuchacza po
 * rzędach widowni (przekrój) i czyta, ile kwestii aktora do niego dociera;
 * przełącza widownię ze zbocza na płaskie pole i porównuje ten sam rząd.
 * Gotowe, gdy siedziało na górze (rząd ≥ 50) w obu wariantach.
 */
export function EpidaurosWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [ground, setGround] = useState<Ground>('pole');
  const [row, setRow] = useState(5);
  const [topSeen, setTopSeen] = useState<Record<Ground, boolean>>({ zbocze: false, pole: false });
  const [canSpeak, setCanSpeak] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const reported = useRef(false);

  useEffect(() => setCanSpeak(typeof window !== 'undefined' && 'speechSynthesis' in window), []);

  const c = clarity(row, ground);
  const words = heardWords(LINE, c);
  const both = topSeen.zbocze && topSeen.pole;

  useEffect(() => {
    if (row >= TOP && !topSeen[ground]) setTopSeen((t) => ({ ...t, [ground]: true }));
  }, [row, ground, topSeen]);

  useEffect(() => {
    if (both && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [both, onDone]);

  const rowFromPointer = (clientX: number) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return;
    const p = new DOMPoint(clientX, 0).matrixTransform(ctm.inverse());
    setRow(Math.max(1, Math.min(ROWS, Math.round((p.x - 44) / 5.6) + 1)));
  };

  const speak = () => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(words.map((w) => (w.heard ? w.word : '…')).join(' '));
    u.lang = 'pl-PL';
    u.volume = Math.max(0.1, c);
    window.speechSynthesis.speak(u);
  };

  const lx = rowX(row);
  const ly = rowY(row, ground);
  const blocked = ground === 'pole' ? row - 1 : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Widownia">
        {(
          [
            ['pole', 'Płaskie pole'],
            ['zbocze', 'Widownia na zboczu (Epidauros)'],
          ] as const
        ).map(([g, label]) => (
          <button
            key={g}
            type="button"
            role="radio"
            aria-checked={ground === g}
            onClick={() => setGround(g)}
            className={cn('border-2 bg-white px-3 py-1.5 text-sm dark:bg-zinc-900', ground === g && 'font-semibold')}
            style={{ borderColor: ground === g ? color : 'var(--border)' }}
          >
            {label} {topSeen[g] && '✓'}
          </button>
        ))}
      </div>

      <div className="border bg-[#f3ecdc] dark:bg-zinc-900">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full touch-none cursor-ew-resize select-none"
          role="slider"
          aria-label="Rząd, w którym siedzi słuchacz"
          aria-valuemin={1}
          aria-valuemax={ROWS}
          aria-valuenow={row}
          tabIndex={0}
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            rowFromPointer(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && rowFromPointer(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setRow((r) => Math.min(ROWS, r + 1));
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setRow((r) => Math.max(1, r - 1));
          }}
        >
          {/* Ziemia / zbocze ze stopniami. */}
          {ground === 'zbocze' ? (
            <path
              d={`M0 ${H} L0 ${BASE_Y + 4} L${rowX(1) - 3} ${BASE_Y + 4} ${Array.from({ length: ROWS }, (_, i) => {
                const r = i + 1;
                return `L${rowX(r) - 3} ${rowY(r, 'zbocze') + 4} L${rowX(r) + 2.6} ${rowY(r, 'zbocze') + 4}`;
              }).join(' ')} L${W} ${rowY(ROWS, 'zbocze') + 4} L${W} ${H} Z`}
              fill="#d9c9a6"
              stroke="#a8916a"
              strokeWidth={0.6}
            />
          ) : (
            <rect x={0} y={BASE_Y + 4} width={W} height={H - BASE_Y - 4} fill="#cdbf9b" />
          )}
          {/* Widzowie: co drugi rząd. */}
          {Array.from({ length: ROWS }, (_, i) => i + 1)
            .filter((r) => r % 2 === 0 && r !== row)
            .map((r) => (
              <g key={r} fill="#8b7355" opacity={0.75}>
                <circle cx={rowX(r)} cy={rowY(r, ground) - 7} r={2.2} />
                <rect x={rowX(r) - 1.8} y={rowY(r, ground) - 5} width={3.6} height={8} />
              </g>
            ))}
          {/* Droga głosu. */}
          <line
            x1={ACTOR.x + 4}
            y1={ACTOR.y - 12}
            x2={lx}
            y2={ly - 8}
            stroke={blocked > 0 ? '#b91c1c' : color}
            strokeWidth={1.4}
            strokeDasharray="3 3"
          />
          {/* Aktor w orchestrze. */}
          <g>
            <ellipse cx={ACTOR.x + 4} cy={BASE_Y + 4} rx={16} ry={3} fill="#e8dcc0" />
            <circle cx={ACTOR.x + 4} cy={ACTOR.y - 14} r={3.4} fill="#5b4a36" />
            <rect x={ACTOR.x + 1.5} y={ACTOR.y - 10.5} width={5} height={14} fill="#5b4a36" />
          </g>
          {/* Słuchacz. */}
          <g transform={`translate(${lx} ${ly})`}>
            <circle cy={-8} r={6} fill={color} stroke="#fff" strokeWidth={2} />
            <text y={-5.2} textAnchor="middle" fontSize={7.5} fontWeight={700} fill="#fff">
              Ty
            </text>
          </g>
          <text x={W - 6} y={14} textAnchor="end" fontSize={10} fill="#5b4a36">
            rząd {row} z {ROWS}
          </text>
        </svg>
      </div>

      <div className="border bg-white p-3 dark:bg-zinc-900/70" aria-live="polite">
        <div className="mb-2 flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Słyszysz</span>
          <div className="h-2 flex-1 bg-muted">
            <div className="h-2 transition-all" style={{ width: `${Math.round(c * 100)}%`, background: c > 0.6 ? color : '#b91c1c' }} />
          </div>
          <span className="w-10 text-right font-mono text-sm tabular-nums">{Math.round(c * 100)}%</span>
          {canSpeak && (
            <button type="button" onClick={speak} className="border p-1.5" aria-label="Odsłuchaj, co słyszysz">
              <Volume2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="min-h-[3.5rem] text-base leading-relaxed">
          {words.map((w, i) => (
            <span key={i} className={w.heard ? '' : 'text-muted-foreground/50'}>
              {w.heard ? w.word : '…'}{' '}
            </span>
          ))}
        </p>
        {ground === 'pole' && row > 10 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Między tobą a aktorem {plural(blocked, { one: 'stoi', few: 'stoją', many: 'stoi' })} {blocked}{' '}
            {plural(blocked, { one: 'rząd', few: 'rzędy', many: 'rzędów' })} ludzi — ich głowy zasłaniają i tłumią głos.
          </p>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Przeciągnij „Ty” po rzędach (albo strzałkami). Usiądź na samej górze — raz na płaskim polu, raz na zboczu.
      </p>

      {both && (
        <p className="border-2 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <strong>Na górze: zbocze {Math.round(clarity(ROWS, 'zbocze') * 100)}%, pole {Math.round(clarity(ROWS, 'pole') * 100)}%.</strong>{' '}
          Grecy budowali teatry na zboczach wzgórz: widownia wznosi się stromo, więc nikt nikomu nie zasłania aktora, a
          kamienna orchestra odbija głos w górę. W Epidauros, w 55 rzędach, mieściło się ok. 12 tysięcy widzów — bez
          mikrofonu. Teatr stoi do dziś i wciąż gra się w nim przedstawienia. <em>(Procenty pochodzą z uproszczonego
          modelu, nie z pomiaru.)</em>
        </p>
      )}
    </div>
  );
}
