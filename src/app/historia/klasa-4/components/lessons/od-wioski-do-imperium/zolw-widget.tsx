'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { plural } from '@/lib/plural';
import { COLS, describeHit, hits, marching, NEXT, ROWS, type Grid, type Hit, type Shield } from './zolw';

const CELL = 64;
const PAD = 12;
const TOP = 36;
const LABEL: Record<Shield, string> = { bok: 'przy boku', przod: 'przed sobą', gora: 'nad głową' };

/**
 * Blok 4 — **Żółw**. Gest: dziecko stuka legionistów, a każdy obraca tarczę
 * (przy boku → przed sobą → nad głową); potem **puszcza strzały** z przodu
 * i z góry. Każda luka to trafienie nazwane miejscem w szyku. Gotowe przy
 * salwie bez trafień.
 */
export function ZolwWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [grid, setGrid] = useState<Grid>(marching);
  const [volley, setVolley] = useState<{ n: number; hits: Hit[] } | null>(null);
  const [tries, setTries] = useState(0);
  const reported = useRef(false);
  const safe = volley !== null && volley.hits.length === 0;

  useEffect(() => {
    if (safe && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [safe, onDone]);

  const turn = (r: number, c: number) => {
    if (safe) return;
    setVolley(null);
    setGrid((g) => g.map((row, ri) => row.map((s, ci) => (ri === r && ci === c ? NEXT[s] : s))));
  };

  const fire = () => {
    setTries((t) => t + 1);
    setVolley({ n: tries + 1, hits: hits(grid) });
  };

  const W = COLS * CELL + PAD * 2;
  const H = ROWS * CELL + PAD * 2 + TOP;
  const isHit = (r: number, c: number) => volley?.hits.some((h) => h.r === r && h.c === c);

  return (
    <div className="space-y-3">
      <div className="mx-auto w-full max-w-[360px] border bg-[#e9e2cf] dark:bg-zinc-900">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full select-none" role="group" aria-label="Oddział legionistów widziany z góry; wróg z przodu, u góry planszy">
          <text x={W / 2} y={16} textAnchor="middle" fontSize={11} fontWeight={700} fill="#7f1d1d">
            ▼ wróg — strzały z przodu i z góry ▼
          </text>
          {/* Salwa: strzały z przodu i z góry. */}
          {volley &&
            Array.from({ length: COLS }, (_, c) => (
              <motion.line
                key={`f${volley.n}-${c}`}
                x1={PAD + c * CELL + CELL / 2}
                x2={PAD + c * CELL + CELL / 2}
                initial={{ y1: 18, y2: 26 }}
                animate={{ y1: TOP - 6, y2: TOP + 4 }}
                transition={{ duration: 0.35, delay: c * 0.05 }}
                stroke="#7f1d1d"
                strokeWidth={2}
              />
            ))}
          {grid.map((row, r) =>
            row.map((s, c) => {
              const x = PAD + c * CELL;
              const y = TOP + PAD + r * CELL;
              const hit = isHit(r, c);
              return (
                <g
                  key={`${r}-${c}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Legionista: ${r + 1}. szereg, ${c + 1}. od lewej, tarcza ${LABEL[s]}`}
                  onClick={() => turn(r, c)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') turn(r, c);
                  }}
                  className="cursor-pointer"
                >
                  <rect x={x + 2} y={y + 2} width={CELL - 4} height={CELL - 4} fill={hit ? '#fecaca' : '#f5efe0'} />
                  <circle cx={x + CELL / 2} cy={y + CELL / 2} r={11} fill="#a8a29e" stroke="#57534e" strokeWidth={2} />
                  <line x1={x + CELL / 2 - 9} x2={x + CELL / 2 + 9} y1={y + CELL / 2} y2={y + CELL / 2} stroke="#b91c1c" strokeWidth={3} />
                  {s === 'przod' && <rect x={x + 6} y={y + 5} width={CELL - 12} height={9} fill="#b91c1c" stroke="#facc15" strokeWidth={1.5} />}
                  {s === 'bok' && <rect x={x + 5} y={y + 10} width={9} height={CELL - 20} fill="#b91c1c" stroke="#facc15" strokeWidth={1.5} />}
                  {s === 'gora' && (
                    <rect x={x + 5} y={y + (r === 1 ? -4 : 5)} width={CELL - 10} height={CELL - (r === 1 ? 1 : 10)} fill="#b91c1c" fillOpacity={0.82} stroke="#facc15" strokeWidth={1.5} />
                  )}
                  {hit && (
                    <text x={x + CELL - 10} y={y + 18} textAnchor="middle" fontSize={16} fontWeight={700} fill="#7f1d1d">
                      ✕
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={fire}
          disabled={safe}
          className="border-2 px-4 py-2 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60"
          style={{ background: color, borderColor: color }}
        >
          Puść strzały
        </button>
        <span className="text-xs text-muted-foreground">Stuknij legionistę, żeby obrócił tarczę: przy boku → przed sobą → nad głową.</span>
      </div>

      <div aria-live="polite" className="text-sm leading-relaxed">
        {volley && volley.hits.length > 0 && (
          <div className="border border-destructive/50 bg-destructive/5 p-3 text-destructive">
            <p className="font-semibold">
              {volley.hits.length} {plural(volley.hits.length, { one: 'trafienie', few: 'trafienia', many: 'trafień' })}. Pierwsze luki:
            </p>
            <ul className="mt-1 list-disc pl-5">
              {volley.hits.slice(0, 3).map((h, i) => (
                <li key={i}>{describeHit(h, grid)}</li>
              ))}
            </ul>
          </div>
        )}
        {safe && (
          <div className="space-y-2 border-2 p-3" style={{ borderColor: color }}>
            <p>
              <strong>Ani jednego trafienia{tries > 1 ? ` — za ${tries}. razem` : ''}.</strong> Pierwszy szereg trzyma tarcze
              przed sobą, reszta nad głowami, a tarcze drugiego szeregu nachodzą na głowy pierwszego. Rzymianie nazywali to
              <em> testudo</em> — żółw.
            </p>
            <p>
              Żółw działał tylko wtedy, gdy wszyscy trzymali tarcze w tej samej chwili. Legioniści ćwiczyli to latami, a za
              ucieczkę z szyku groziły surowe kary. Dyscyplina i zgranie — właśnie dlatego legiony zdobywały świat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
