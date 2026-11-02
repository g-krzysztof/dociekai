'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import {
  FIELD,
  GRID_H,
  GRID_W,
  SQUARES_PER_SACK,
  clampStake,
  judgeStakes,
  judgeTax,
  knots,
  ringOrder,
  type Pt,
} from './pole';

/**
 * Blok 3 L21 — **mierniczy po wylewie**. Miedze zmyła woda; zostały dwa
 * kamienie graniczne i nowy brzeg rzeki. Dziecko **wbija paliki** (stuknięcie
 * w węzeł siatki) i **przeciąga je**, a sznur z węzłami rozciąga się między
 * nimi i liczy odcinki na żywo. Sędzia sprawdza prostokąt, kamienie i brzeg;
 * potem dziecko liczy podatek z pola, które samo wytyczyło.
 */

const CELL = 30;
const PAD = 14;
const VW = GRID_W * CELL + PAD * 2;
const VH = GRID_H * CELL + PAD * 2;
const px = (v: number) => PAD + v * CELL;

const SACK = { one: 'worek', few: 'worki', many: 'worków' };
const KRATKA = { one: 'kratka', few: 'kratki', many: 'kratek' };

export function MierniczyWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [stakes, setStakes] = useState<Pt[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<ReturnType<typeof judgeStakes> | null>(null);
  const [sacks, setSacks] = useState(FIELD.before.w * FIELD.before.h / SQUARES_PER_SACK);
  const [taxMsg, setTaxMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const measured = verdict?.ok ? verdict : null;

  const toGrid = (e: PointerEvent): Pt | null => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return clampStake({ x: (p.x - PAD) / CELL, y: (p.y - PAD) / CELL });
  };

  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    if (measured) return;
    const g = toGrid(e);
    if (!g) return;
    const hit = stakes.findIndex((s) => s.x === g.x && s.y === g.y);
    if (hit >= 0) {
      setDragging(hit);
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    if (stakes.length >= 4) return;
    setVerdict(null);
    setStakes((prev) => [...prev, g]);
    setDragging(stakes.length);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (dragging === null) return;
    const g = toGrid(e);
    if (!g) return;
    setVerdict(null);
    setStakes((prev) => prev.map((s, i) => (i === dragging ? g : s)));
  };

  const onUp = () => setDragging(null);

  const ring = ringOrder(stakes);
  const segs = ring.length >= 2 ? ring.map((a, i) => [a, ring[(i + 1) % ring.length]] as const).slice(0, ring.length === 2 ? 1 : ring.length) : [];
  const badStake = verdict && !verdict.ok && verdict.stake !== undefined ? stakes[verdict.stake] : null;

  const check = () => {
    const v = judgeStakes(stakes);
    setVerdict(v);
  };

  const checkTax = () => {
    if (!measured) return;
    const v = judgeTax(measured.area, sacks);
    if (v.ok) {
      setTaxMsg({
        ok: true,
        text: `Zgadza się: ${measured.area} ${plural(measured.area, KRATKA)} to ${sacks} ${plural(sacks, SACK)}. Rzeka zabrała trzecią część pola — i podatek zmalał o trzecią część.`,
      });
      onDone();
    } else setTaxMsg({ ok: false, text: v.text });
  };

  const bankY = px(FIELD.bank);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border bg-[#f6ead0]/60 p-3 text-sm leading-relaxed dark:bg-zinc-900/60">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Zapis pisarza sprzed wylewu</p>
          <p className="mt-1">
            Pole chłopa Ipiego: <strong>{FIELD.before.w} sznurów</strong> wzdłuż rzeki, <strong>{FIELD.before.h} sznurów</strong> w głąb —{' '}
            {FIELD.before.w * FIELD.before.h} kratek. Podatek: <strong>1 worek zboża od każdych {SQUARES_PER_SACK} kratek</strong>, czyli{' '}
            {(FIELD.before.w * FIELD.before.h) / SQUARES_PER_SACK} worków.
          </p>
        </div>
        <p className="text-sm leading-relaxed">
          Woda opadła. Miedze zniknęły pod mułem, a rzeka zmieniła brzeg i zabrała kawałek pola. Zostały <strong>dwa kamienie graniczne</strong>.
          Jesteś mierniczym faraona: <strong>stuknij w węzeł siatki</strong>, żeby wbić palik, i <strong>przeciągnij go</strong>, żeby
          przesunąć. Między palikami napina się sznur — liczby mówią, ile odcinków sznura ma każdy bok.
        </p>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        className={cn('mx-auto block w-full max-w-[560px] touch-none select-none border', !measured && 'cursor-crosshair')}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        role="application"
        aria-label="Pole po wylewie: kratka sznurów, dwa kamienie graniczne, rzeka na dole"
      >
        {/* pustynia nad polem, muł, rzeka */}
        <rect x={0} y={0} width={VW} height={px(0.6)} fill="#e9d29a" />
        <rect x={0} y={px(0.6)} width={VW} height={bankY - px(0.6)} fill="#6b5236" />
        <path
          d={`M 0 ${bankY} ${Array.from({ length: 13 }, (_, i) => `Q ${i * 30 + 15} ${bankY + (i % 2 ? 5 : -5)} ${(i + 1) * 30} ${bankY}`).join(' ')} L ${VW} ${VH} L 0 ${VH} Z`}
          fill="#3f7fa8"
        />
        {[1, 2, 3].map((k) => (
          <path
            key={k}
            d={`M ${20 + k * 40} ${bankY + 22 + k * 14} q 12 -6 24 0 t 24 0`}
            stroke="#a9d1ea"
            strokeWidth={1.5}
            fill="none"
            opacity={0.8}
          />
        ))}
        {/* węzły siatki */}
        {Array.from({ length: GRID_W + 1 }, (_, x) =>
          Array.from({ length: GRID_H + 1 }, (_, y) => (
            <circle key={`${x}-${y}`} cx={px(x)} cy={px(y)} r={1.3} fill={y > FIELD.bank ? '#cfe6f3' : '#e8d9b8'} opacity={0.6} />
          )),
        )}
        {/* pole policzone */}
        {measured &&
          Array.from({ length: measured.w }, (_, x) =>
            Array.from({ length: measured.h }, (_, y) => (
              <rect
                key={`${x}-${y}`}
                x={px(Math.min(...stakes.map((s) => s.x)) + x) + 1.5}
                y={px(Math.min(...stakes.map((s) => s.y)) + y) + 1.5}
                width={CELL - 3}
                height={CELL - 3}
                fill="#9fbf5a"
                opacity={0.55}
              />
            )),
          )}
        {/* kamienie graniczne */}
        {FIELD.stones.map((s, i) => (
          <g key={i}>
            <path
              d={`M ${px(s.x) - 9} ${px(s.y) + 7} L ${px(s.x) - 7} ${px(s.y) - 6} L ${px(s.x) + 2} ${px(s.y) - 10} L ${px(s.x) + 9} ${px(s.y) - 3} L ${px(s.x) + 8} ${px(s.y) + 7} Z`}
              fill="#b8b2a6"
              stroke="#5c574d"
              strokeWidth={1.2}
            />
          </g>
        ))}
        {/* sznur */}
        {segs.map(([a, b], i) => {
          const n = knots(a, b);
          const mx = (px(a.x) + px(b.x)) / 2;
          const my = (px(a.y) + px(b.y)) / 2;
          return (
            <g key={i}>
              <line x1={px(a.x)} y1={px(a.y)} x2={px(b.x)} y2={px(b.y)} stroke={n === null ? '#e05a47' : '#f4e3b5'} strokeWidth={2.5} strokeDasharray={n === null ? '6 4' : undefined} />
              {n !== null &&
                Array.from({ length: Math.max(0, n - 1) }, (_, k) => {
                  const t = (k + 1) / n;
                  return <circle key={k} cx={px(a.x) + (px(b.x) - px(a.x)) * t} cy={px(a.y) + (px(b.y) - px(a.y)) * t} r={3} fill="#8a5a1f" />;
                })}
              {n !== null && n > 0 && (
                <g>
                  <rect x={mx - 11} y={my - 9} width={22} height={18} fill="#fffaf0" stroke="#8a5a1f" />
                  <text x={mx} y={my + 4.5} fontSize={12} fontWeight={700} textAnchor="middle" fill="#3b2a14">
                    {n}
                  </text>
                </g>
              )}
            </g>
          );
        })}
        {/* paliki */}
        {stakes.map((s, i) => (
          <g key={i}>
            <rect x={px(s.x) - 3} y={px(s.y) - 14} width={6} height={16} fill="#c58a3c" stroke="#5a3a12" />
            <circle cx={px(s.x)} cy={px(s.y)} r={4} fill={badStake && badStake.x === s.x && badStake.y === s.y ? '#e05a47' : '#5a3a12'} />
          </g>
        ))}
      </svg>

      {!measured && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm">Paliki: {stakes.length} z 4</span>
          <button
            type="button"
            onClick={() => {
              setStakes([]);
              setVerdict(null);
            }}
            disabled={stakes.length === 0}
            className="flex items-center gap-1 border px-3 py-2 text-sm disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" /> Wyrwij paliki
          </button>
          <button type="button" onClick={check} className="border-2 px-3 py-2 text-sm font-semibold" style={{ borderColor: color }}>
            Sprawdź granice
          </button>
        </div>
      )}

      {verdict && !verdict.ok && (
        <p aria-live="polite" className="border-l-2 border-destructive pl-3 text-sm leading-relaxed text-destructive">
          {verdict.text}
        </p>
      )}

      {measured && (
        <div className="space-y-3 border-t pt-3">
          <p className="text-sm leading-relaxed">
            Granice stoją. Pole to prostokąt: <strong>{measured.w}</strong> odcinków sznura wzdłuż i <strong>{measured.h}</strong> w głąb. Kratek
            jest tyle, ile rzędów razy kratek w rzędzie:{' '}
            <strong>
              {measured.w} × {measured.h} = {measured.area}
            </strong>
            . Ile worków podatku zapłaci teraz Ipi?
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" aria-label="mniej worków" onClick={() => { setSacks((s) => Math.max(0, s - 1)); setTaxMsg(null); }} className="border p-2" disabled={taxMsg?.ok}>
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-20 text-center font-mono text-lg tabular-nums">
              {sacks} <span className="text-xs">{plural(sacks, SACK)}</span>
            </span>
            <button type="button" aria-label="więcej worków" onClick={() => { setSacks((s) => Math.min(12, s + 1)); setTaxMsg(null); }} className="border p-2" disabled={taxMsg?.ok}>
              <Plus className="h-4 w-4" />
            </button>
            {!taxMsg?.ok && (
              <button type="button" onClick={checkTax} className="ml-2 border-2 px-3 py-2 text-sm font-semibold" style={{ borderColor: color }}>
                Zapisz podatek
              </button>
            )}
          </div>
          {taxMsg && (
            <p
              aria-live="polite"
              className={cn('border-l-2 pl-3 text-sm leading-relaxed', taxMsg.ok ? '' : 'border-destructive text-destructive')}
              style={taxMsg.ok ? { borderColor: color } : undefined}
            >
              {taxMsg.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
