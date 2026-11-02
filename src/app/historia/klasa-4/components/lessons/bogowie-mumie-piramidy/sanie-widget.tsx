'use client';

import Image from 'next/image';
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { plural } from '@/lib/plural';
import {
  RAMP_MAX_M,
  RAMP_MIN_M,
  ROPE_MAX,
  SAND_LABEL,
  SEGMENTS,
  WORKERS_MIN,
  WORKERS_STEP,
  judgeFlatPull,
  judgeRampPull,
  neededFlat,
  neededRamp,
  rampAngleDeg,
  sandState,
  shortestWorkingRamp,
  type PullVerdict,
  type SandState,
} from './sanie';
import { img } from '@/lib/media';

/**
 * Blok 1 L20 — **ciągniemy blok**. Dziecko ustawia liczbę ludzi przy linie
 * i ciągnie linę (uchwyt pod sceną, ręka za ręką — po puszczeniu wraca).
 * Na suchym piasku 40 ludzi nie wystarcza; po pierwszej porażce odsłania się
 * prawdziwe malowidło z grobowca Dżehutihotepa i dzban — dziecko polewa piasek,
 * wodząc dzbanem przed saniami (za dużo = błoto). Potem pochylnia: dziecko
 * ciągnie jej podstawę — za stroma nie da się wciągnąć bloku pełną liną.
 */

const W = 400;
const GROUND = 128;
const X0 = 20;
const SW = 26;
const TRACK_END = X0 + SEGMENTS * SW;
const SLED = 60;
const POS_MAX = (TRACK_END - X0 - SLED) / SW;

const RAMP_TOP_X = 372;
const RAMP_GROUND = 150;
const PX_PER_M = 2.3;
const RAMP_TOP_Y = RAMP_GROUND - 20 * PX_PER_M;

const SAND_FILL: Record<SandState, string> = {
  suchy: '#ecd9ae',
  wilgotny: '#d8be8a',
  'w-sam-raz': '#bf9f68',
  mokry: '#9c8058',
  bloto: '#7a6247',
};

const round2 = (n: number) => Math.round(n * 100) / 100;
const IMG = img('/images/historia/lekcje/bogowie-mumie-piramidy/malowidlo-dzehutihotepa.jpg');

function svgX(svg: SVGSVGElement | null, clientX: number, clientY: number): number {
  if (!svg) return 0;
  const ctm = svg.getScreenCTM();
  if (!ctm) return 0;
  const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
  return p.x;
}

export function SanieWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [stage, setStage] = useState<'plaski' | 'rampa' | 'koniec'>('plaski');
  const [workers, setWorkers] = useState(20);
  const [wet, setWet] = useState<number[]>(() => Array(SEGMENTS).fill(0));
  const [pos, setPos] = useState(0);
  const [hint, setHint] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [jugX, setJugX] = useState(X0 + SLED + 30);
  const [rampLen, setRampLen] = useState(40);
  const [climb, setClimb] = useState(0);
  const [strain, setStrain] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const jugDrag = useRef<{ lastSeg: number } | null>(null);
  const ropeRef = useRef<HTMLDivElement>(null);
  const ropeDrag = useRef<{ startX: number; base: number; moved: boolean; failed: boolean } | null>(null);
  const [grip, setGrip] = useState(0);
  const footDrag = useRef(false);

  const front = X0 + pos * SW + SLED;
  // Liczy się odcinek, na który sanie właśnie wjeżdżają (przed płozami).
  const frontSeg = Math.min(SEGMENTS - 1, Math.ceil((front - X0) / SW - 0.001));
  const needed = stage === 'plaski' ? neededFlat(wet[frontSeg]) : neededRamp(rampLen);

  const verdict = (): PullVerdict =>
    stage === 'plaski' ? judgeFlatPull(wet[frontSeg], workers) : judgeRampPull(rampLen, workers);

  const failText = (v: Exclude<PullVerdict, { ok: true }>): string => {
    if (v.kind === 'bloto')
      return `Sanie grzęzną! Za dużo wody — piasek zamienił się w błoto i tu trzeba aż ${v.needed} ludzi. Nasyp suchego piasku i polej mniej.`;
    if (v.kind === 'lina-za-krotka')
      return stage === 'plaski'
        ? `Lina się napina, a blok ani drgnie. Na suchym piasku trzeba ${v.needed} ludzi — a przy linie zmieści się najwyżej ${ROPE_MAX}.`
        : `Za stromo! Na pochylni o nachyleniu ${Math.round(rampAngleDeg(rampLen))}° trzeba ${v.needed} ludzi, a przy linie zmieści się ${ROPE_MAX}. Wydłuż pochylnię.`;
    return `Blok stoi: tu trzeba ${v.needed} ${plural(v.needed, { one: 'człowieka', few: 'ludzi', many: 'ludzi' })}, a ciągnie ${v.workers}. Dołóż ludzi.`;
  };

  // ── lina ──────────────────────────────────────────────────────────────
  const fail = (v: Exclude<PullVerdict, { ok: true }>) => {
    setStrain((s) => s + 1);
    setMsg({ ok: false, text: failText(v) });
    if (v.kind === 'lina-za-krotka' && stage === 'plaski') setHint(true);
  };

  /** Przesuwa sanie do `value` (płasko: odcinki, pochylnia: 0–1). */
  const advance = (value: number) => {
    if (stage === 'plaski') {
      const next = Math.min(POS_MAX, value);
      setPos(next);
      if (next >= POS_MAX - 0.001) {
        ropeDrag.current = null;
        setGrip(0);
        setStage('rampa');
        setMsg({
          ok: true,
          text: 'Blok dojechał do pochylni. Teraz trzeba go wciągnąć 20 metrów w górę, na kolejną warstwę piramidy. Pochylnię też polewano wodą. Ustaw jej długość, ciągnąc podstawę.',
        });
        return;
      }
      setMsg({
        ok: true,
        text:
          wet[frontSeg] > 0
            ? `Ruszył! Na piasku „${SAND_LABEL[sandState(wet[frontSeg])]}” wystarczy ${needed} ludzi — na suchym trzeba by ${neededFlat(0)}.`
            : `Ruszył! Tu wystarczy ${needed} ludzi.`,
      });
    } else if (stage === 'rampa') {
      const next = Math.min(1, value);
      setClimb(next);
      if (next >= 1) {
        ropeDrag.current = null;
        setGrip(0);
        setStage('koniec');
        setMsg(null);
        onDone();
        return;
      }
      setMsg({ ok: true, text: `Jedzie w górę! Na tej pochylni trzeba ${needed} ludzi, ciągnie ${workers}.` });
    }
  };

  const ropeGain = stage === 'plaski' ? 4 : 0.5;

  const onRopeDown = (e: PointerEvent<HTMLDivElement>) => {
    if (stage === 'koniec') return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // bez przechwycenia też działa, dopóki palec jest nad uchwytem
    }
    ropeDrag.current = { startX: e.clientX, base: stage === 'plaski' ? pos : climb, moved: false, failed: false };
  };
  const onRopeMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = ropeDrag.current;
    const track = ropeRef.current;
    if (!d || !track) return;
    const width = track.getBoundingClientRect().width - 56;
    const frac = Math.max(0, Math.min(1, (e.clientX - d.startX) / width));
    if (frac > 0.02) d.moved = true;
    const v = verdict();
    if (!v.ok) {
      // Opór: gdy siła za mała, uchwyt ledwo się przesuwa.
      setGrip(Math.min(frac, 0.06));
      if (d.moved && !d.failed) {
        d.failed = true;
        fail(v);
      }
      return;
    }
    setGrip(frac);
    advance(d.base + frac * ropeGain);
  };
  const onRopeUp = () => {
    const d = ropeDrag.current;
    ropeDrag.current = null;
    setGrip(0);
    if (d && !d.moved) {
      const v = verdict();
      if (!v.ok) fail(v);
    }
  };
  const onRopeKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const v = verdict();
      if (!v.ok) fail(v);
      else advance((stage === 'plaski' ? pos : climb) + 0.15 * ropeGain);
    }
  };

  // ── dzban ─────────────────────────────────────────────────────────────
  const segAt = (x: number) => Math.floor((x - X0) / SW);
  const moveJug = (clientX: number, clientY: number) => {
    const x = Math.max(front + 4, Math.min(TRACK_END - 4, svgX(svgRef.current, clientX, clientY)));
    setJugX(x);
    const seg = segAt(x);
    const d = jugDrag.current;
    if (d && seg !== d.lastSeg && seg >= frontSeg && seg < SEGMENTS) {
      d.lastSeg = seg;
      setWet((w) => w.map((v, i) => (i === seg ? v + 1 : v)));
    }
  };
  const onJugDown = (e: PointerEvent<SVGGElement>) => {
    if (stage !== 'plaski') return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // jw.
    }
    const x = svgX(svgRef.current, e.clientX, e.clientY);
    const seg = segAt(Math.max(front + 4, x));
    jugDrag.current = { lastSeg: seg };
    if (seg >= frontSeg && seg < SEGMENTS) setWet((w) => w.map((v, i) => (i === seg ? v + 1 : v)));
  };
  const onJugKey = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const x = Math.max(front + 4, Math.min(TRACK_END - 4, jugX + (e.key === 'ArrowRight' ? SW : -SW)));
      setJugX(x);
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const seg = segAt(jugX);
      if (seg >= frontSeg && seg < SEGMENTS) setWet((w) => w.map((v, i) => (i === seg ? v + 1 : v)));
    }
  };
  const drySand = () => setWet((w) => w.map((v, i) => (i >= frontSeg ? 0 : v)));

  // ── pochylnia ─────────────────────────────────────────────────────────
  const footX = RAMP_TOP_X - rampLen * PX_PER_M;
  const setFootFromX = (x: number) => {
    const len = Math.round((RAMP_TOP_X - x) / PX_PER_M);
    setRampLen(Math.max(RAMP_MIN_M, Math.min(RAMP_MAX_M, len)));
    setClimb(0);
  };
  const onFootDown = (e: PointerEvent<SVGGElement>) => {
    if (stage !== 'rampa') return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // jw.
    }
    footDrag.current = true;
  };
  const onFootMove = (e: PointerEvent<SVGGElement>) => {
    if (!footDrag.current) return;
    setFootFromX(svgX(svgRef.current, e.clientX, e.clientY));
  };
  const onFootKey = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'ArrowLeft') setRampLen((l) => Math.min(RAMP_MAX_M, l + 5));
    else if (e.key === 'ArrowRight') setRampLen((l) => Math.max(RAMP_MIN_M, l - 5));
    else return;
    e.preventDefault();
    setClimb(0);
  };

  const angle = rampAngleDeg(rampLen);
  const a = Math.atan(20 / rampLen);
  const rampSledX = round2(footX + climb * (RAMP_TOP_X - footX));
  const rampSledY = round2(RAMP_GROUND - climb * (RAMP_GROUND - RAMP_TOP_Y));
  const deg = round2((-a * 180) / Math.PI);
  const ok = workers >= needed && needed <= ROPE_MAX;

  return (
    <div className="mx-auto max-w-[640px] space-y-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} 170`}
        className="mx-auto block w-full max-w-[640px] touch-none select-none border bg-[#f8f1e1] dark:bg-[#3a3326]"
        role="img"
        aria-label={stage === 'plaski' ? 'Sanie z kamiennym blokiem na piasku, przed nimi lina do ludzi' : 'Pochylnia prowadząca na warstwę piramidy'}
      >
        {stage === 'plaski' ? (
          <>
            {wet.map((v, i) => (
              <rect key={i} x={X0 + i * SW} y={GROUND} width={SW} height={14} fill={SAND_FILL[sandState(v)]} stroke="#c9b48a" strokeWidth={0.5} />
            ))}
            <line x1={X0} y1={GROUND} x2={W} y2={GROUND} stroke="#a88f62" />
            {/* meta */}
            <line x1={TRACK_END} y1={GROUND - 30} x2={TRACK_END} y2={GROUND + 14} stroke={color} strokeDasharray="3 3" />
            <text x={TRACK_END - 3} y={GROUND + 24} fontSize={11} textAnchor="end" fill="currentColor">
              do pochylni
            </text>
            <Sled x={round2(X0 + pos * SW)} y={GROUND} strain={strain} />
            {/* lina i ludzie */}
            <line x1={round2(front)} y1={GROUND - 8} x2={W} y2={GROUND - 14} stroke="#8a6a3a" strokeWidth={1.5} />
            <Haulers count={workers} ok={ok} />
            {hint && (
              <g
                transform={`translate(${round2(jugX)} ${GROUND - 34})`}
                onPointerDown={onJugDown}
                onPointerMove={(e) => jugDrag.current && moveJug(e.clientX, e.clientY)}
                onPointerUp={() => (jugDrag.current = null)}
                onPointerCancel={() => (jugDrag.current = null)}
                onKeyDown={onJugKey}
                tabIndex={0}
                role="button"
                aria-label="Dzban z wodą — przesuń nad piaskiem przed saniami, żeby go polać"
                className="cursor-grab outline-none"
              >
                <circle r={20} fill="transparent" />
                <path d="M -7 -10 Q -11 0 -6 9 L 6 9 Q 11 0 7 -10 Z" fill="#b5653a" stroke="#6f3b1f" />
                <rect x={-4} y={-14} width={8} height={4} fill="#9a5230" />
                <path d="M 7 -4 Q 14 -4 13 4" fill="none" stroke="#6f3b1f" />
                {jugDrag.current && <path d="M 2 10 L 0 24 M -2 12 L -4 22 M 5 11 L 6 21" stroke="#5aa0d8" strokeWidth={1.2} />}
              </g>
            )}
          </>
        ) : (
          <>
            <rect x={0} y={RAMP_GROUND} width={W} height={20} fill="#ecd9ae" />
            <rect x={RAMP_TOP_X} y={RAMP_TOP_Y} width={W - RAMP_TOP_X} height={RAMP_GROUND - RAMP_TOP_Y} fill="#e6dcc6" stroke="#b8a888" />
            <polygon
              points={`${round2(footX)},${RAMP_GROUND} ${RAMP_TOP_X},${round2(RAMP_TOP_Y)} ${RAMP_TOP_X},${RAMP_GROUND}`}
              fill="#c9a877"
              stroke="#8a6a3a"
            />
            <text x={RAMP_TOP_X - 2} y={RAMP_TOP_Y - 6} fontSize={11} textAnchor="end" fill="currentColor">
              warstwa
            </text>
            <g transform={`translate(${rampSledX} ${rampSledY}) rotate(${deg})`}>
              <rect x={0} y={-22} width={30} height={18} fill="#e8e0cc" stroke="#7d7360" />
              <rect x={-2} y={-4} width={36} height={4} fill="#8a6a3a" />
            </g>
            <g
              transform={`translate(${round2(footX)} ${RAMP_GROUND})`}
              onPointerDown={onFootDown}
              onPointerMove={onFootMove}
              onPointerUp={() => (footDrag.current = false)}
              onPointerCancel={() => (footDrag.current = false)}
              onKeyDown={onFootKey}
              tabIndex={stage === 'rampa' ? 0 : -1}
              role="slider"
              aria-label="Podstawa pochylni — przesuń w lewo, żeby wydłużyć pochylnię"
              aria-valuemin={RAMP_MIN_M}
              aria-valuemax={RAMP_MAX_M}
              aria-valuenow={rampLen}
              className={stage === 'rampa' ? 'cursor-ew-resize outline-none' : 'outline-none'}
            >
              <circle r={22} fill="transparent" />
              <circle r={7} fill={color} stroke="white" strokeWidth={2} />
              <path d="M -13 0 L -9 -3 L -9 3 Z M 13 0 L 9 -3 L 9 3 Z" fill={color} />
            </g>
            <text x={8} y={22} fontSize={14} fill="currentColor">
              pochylnia: {rampLen} m · nachylenie {Math.round(angle)}°
            </text>
          </>
        )}
      </svg>

      {/* licznik siły */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>
            Potrzeba: <strong className="tabular-nums">{needed}</strong>
          </span>
          <span>
            Ciągnie: <strong className="tabular-nums">{workers}</strong> (lina mieści {ROPE_MAX})
          </span>
        </div>
        <div className="relative h-3 border bg-muted">
          <div className="absolute inset-y-0 left-0" style={{ width: `${Math.min(100, (workers / 60) * 100)}%`, background: ok ? color : '#d97757' }} />
          <div className="absolute inset-y-[-3px] w-0.5 bg-foreground" style={{ left: `${Math.min(100, (needed / 60) * 100)}%` }} aria-hidden />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm">Ludzie przy linie:</span>
        <button
          type="button"
          aria-label="mniej ludzi"
          disabled={stage === 'koniec' || workers <= WORKERS_MIN}
          onClick={() => setWorkers((w) => Math.max(WORKERS_MIN, w - WORKERS_STEP))}
          className="border p-2 disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center font-mono text-lg tabular-nums">{workers}</span>
        <button
          type="button"
          aria-label="więcej ludzi"
          disabled={stage === 'koniec' || workers >= ROPE_MAX}
          onClick={() => setWorkers((w) => Math.min(ROPE_MAX, w + WORKERS_STEP))}
          className="border p-2 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
        {stage === 'plaski' && hint && (
          <button type="button" onClick={drySand} className="ml-auto inline-flex items-center gap-1 border px-2 py-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> nasyp suchego piasku
          </button>
        )}
      </div>

      {stage !== 'koniec' && (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Chwyć linę i pociągnij w prawo. Puść — i ciągnij jeszcze raz.</p>
          <div ref={ropeRef} className="relative h-12 border bg-[#f3ead6] dark:bg-[#3a3326]">
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-[#8a6a3a]" />
            <div
              role="slider"
              aria-label="Lina — ciągnij w prawo"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(grip * 100)}
              tabIndex={0}
              onPointerDown={onRopeDown}
              onPointerMove={onRopeMove}
              onPointerUp={onRopeUp}
              onPointerCancel={onRopeUp}
              onKeyDown={onRopeKey}
              className="absolute top-1 flex h-10 w-14 cursor-grab touch-none items-center justify-center border-2 bg-white text-xs font-semibold dark:bg-zinc-900"
              style={{ left: `calc(${grip} * (100% - 56px))`, borderColor: color, transition: ropeDrag.current ? 'none' : 'left 0.25s' }}
            >
              ciągnij
            </div>
          </div>
        </div>
      )}

      {msg && (
        <p
          className={`border-l-2 pl-3 text-sm leading-relaxed ${msg.ok ? '' : 'text-destructive'}`}
          style={msg.ok ? { borderColor: color } : { borderColor: 'currentColor' }}
          aria-live="polite"
        >
          {msg.text}
        </p>
      )}

      {hint && stage === 'plaski' && (
        <figure className="space-y-2 border p-3">
          <Image src={IMG} alt="Rysunek prawdziwego malowidła z grobowca: ogromny posąg siedzącego człowieka na saniach, przed nim cztery długie szeregi ludzi ciągnących liny; jeden człowiek stoi z przodu sań, na płozach, i wylewa coś z naczynia na ziemię pod saniami" width={892} height={403} className="h-auto w-full" />
          <figcaption className="text-sm leading-relaxed">
            <strong>Prawdziwe źródło.</strong> Malowidło z grobowca namiestnika Dżehutihotepa (ok. 1900 r. p.n.e.). Ludzie ciągną posąg
            na saniach. Spójrz na człowieka stojącego z przodu sań, tuż przy płozach — co robi? Teraz w scenie pojawił się dzban:{' '}
            <strong>przeciągnij go nad piaskiem przed saniami</strong>.
            <span className="mt-1 block text-[11px] text-muted-foreground">
              Przerys malowidła z XIX w. (P. Newberry, 1895), Wikimedia Commons, domena publiczna.
            </span>
          </figcaption>
        </figure>
      )}

      {stage === 'koniec' && (
        <div className="space-y-2 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <p>
            <strong>Blok na górze!</strong> Twoja pochylnia: {rampLen} m, nachylenie {Math.round(angle)}°, przy linie {workers}{' '}
            {plural(workers, { one: 'człowiek', few: 'ludzi', many: 'ludzi' })}. Najkrótsza pochylnia, po której {ROPE_MAX} ludzi wciągnie taki
            blok, ma ok. {shortestWorkingRamp()} m — a każdy metr pochylni to dodatkowa praca, więc budowniczowie szukali nachylenia w sam raz.
          </p>
          <p>
            Zauważ, czego tu nie było: koła, wozu ani konia. Tylko sanie, lina, woda i ludzie. Takich bloków w jednej piramidzie były
            ponad dwa miliony, a budowa trwała dziesiątki lat.
          </p>
        </div>
      )}
    </div>
  );
}

function Sled({ x, y, strain }: { x: number; y: number; strain: number }) {
  return (
    <g transform={`translate(${x} ${y})`} key={strain}>
      <rect x={4} y={-40} width={50} height={34} fill="#e8e0cc" stroke="#7d7360" />
      <path d="M 10 -30 L 24 -26 M 30 -18 L 46 -22" stroke="#bdb39c" />
      <rect x={0} y={-6} width={60} height={5} fill="#8a6a3a" />
      <path d="M -4 -1 Q -2 2 4 2 L 60 2" fill="none" stroke="#6a4f2a" strokeWidth={2} />
      <text x={29} y={-18} fontSize={11} textAnchor="middle" fill="#5f5646">
        2,5 t
      </text>
    </g>
  );
}

/** Szereg ciągnących — kropki-głowy po prawej, liczba ludzi jako podpis. */
function Haulers({ count, ok }: { count: number; ok: boolean }) {
  const rows = 2;
  const perRow = Math.ceil(Math.min(count, 40) / rows);
  const shown = Math.min(perRow, 8);
  return (
    <g>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: shown }).map((__, i) => {
          const cx = round2(TRACK_END + 10 + i * 7);
          const cy = GROUND - 30 + r * 14;
          return (
            <g key={`${r}-${i}`} transform={`translate(${cx} ${cy}) rotate(${ok ? 0 : 12})`}>
              <circle r={2.4} fill="#4a3a2a" />
              <path d="M 0 2 L -3 10 M -1 6 L 3 7" stroke="#4a3a2a" strokeWidth={1.2} />
            </g>
          );
        }),
      )}
      <text x={TRACK_END + 34} y={GROUND + 36} fontSize={12} textAnchor="middle" fill="currentColor">
        {count} ludzi →
      </text>
    </g>
  );
}
