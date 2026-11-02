'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCw } from 'lucide-react';
import {
  FLAGS,
  FLAG_RED,
  FLAG_WHITE,
  HALF_HI,
  HALF_LO,
  judgeMast,
  judgeWindow,
  nextTurn,
  type MastMode,
  type Turn,
} from './flaga';

type Phase = 'odwroc' | 'swieto' | 'zaloba' | 'okno' | 'koniec';

/**
 * L10 blok 1 (haczyk) — flaga do góry nogami, maszt w święto i w żałobie,
 * flaga w oknie. Gesty: **odwraca flagę przeciągnięciem w pionie**,
 * **ciągnie linkę masztu** (w dół = flaga w górę), **obraca flagę stuknięciami**
 * i wiesza ją w oknie. Sędziowie w `flaga.ts` (reguły z ustawy).
 */
export function FlagaNaMaszcie({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>('odwroc');

  return (
    <div className="space-y-5">
      <Odwroc color={color} flipped={phase !== 'odwroc'} onFlipped={() => setPhase('swieto')} />

      {phase !== 'odwroc' && (
        <section className="border p-4 sm:p-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            Flaga na maszcie
          </p>
          {phase === 'swieto' && (
            <Maszt key="swieto" mode="swieto" color={color} onDone={() => setPhase('zaloba')} />
          )}
          {phase === 'zaloba' && (
            <Maszt key="zaloba" mode="zaloba" color={color} onDone={() => setPhase('okno')} />
          )}
          {(phase === 'okno' || phase === 'koniec') && (
            <p className="text-sm text-muted-foreground">
              <Check className="mr-1 inline h-4 w-4" style={{ color }} aria-hidden />
              Święto — na szczyt. Żałoba — najpierw na szczyt, potem do połowy.
            </p>
          )}
        </section>
      )}

      {(phase === 'okno' || phase === 'koniec') && (
        <section className="border p-4 sm:p-5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            Flaga w oknie
          </p>
          <Okno
            color={color}
            onDone={() => {
              setPhase('koniec');
              onComplete();
            }}
          />
        </section>
      )}

      {phase === 'koniec' && (
        <p className="border bg-muted/40 p-4 text-sm leading-relaxed">
          Trzy sytuacje, trzy zasady — i żadna z nich nie jest wymyślona przez szkołę. Stoją w{' '}
          <strong>ustawie o godle, barwach i hymnie</strong>, bo flaga mówi „to jesteśmy my”.
          Powieszona byle jak mówi coś innego — na przykład „to Monako”.
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- odwróć */

function FlagRect({
  w,
  ratio,
  top,
  bottom,
}: {
  w: number;
  ratio: number;
  top: string;
  bottom: string;
}) {
  const h = Math.round(w * ratio);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="block">
      <rect x={0} y={0} width={w} height={h / 2} fill={top} />
      <rect x={0} y={h / 2} width={w} height={h / 2} fill={bottom} />
      <rect x={0.5} y={0.5} width={w - 1} height={h - 1} fill="none" stroke="#a1a1aa" />
    </svg>
  );
}

function Odwroc({
  color,
  flipped,
  onFlipped,
}: {
  color: string;
  flipped: boolean;
  onFlipped: () => void;
}) {
  const start = useRef<number | null>(null);
  const [pull, setPull] = useState(0);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (flipped) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = e.clientY;
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (start.current === null || flipped) return;
    const dy = e.clientY - start.current;
    setPull(Math.max(-1, Math.min(1, dy / 60)));
    if (Math.abs(dy) > 60) {
      start.current = null;
      setPull(0);
      onFlipped();
    }
  };
  const up = () => {
    start.current = null;
    setPull(0);
  };

  return (
    <section className="border p-4 sm:p-5">
      <p className="mb-3 text-sm leading-relaxed">
        {flipped ? (
          <>Teraz biel jest u góry — tak wygląda flaga Polski.</>
        ) : (
          <>
            Ktoś powiesił flagę na sznurku przed szkołą. Coś tu jest nie tak.{' '}
            <strong>Złap flagę i przeciągnij ją w górę albo w dół</strong>, żeby ją odwrócić.
          </>
        )}
      </p>
      <div className="flex flex-col items-center gap-2">
        <div className="h-[2px] w-56 bg-zinc-500" aria-hidden />
        <div
          role="button"
          tabIndex={flipped ? -1 : 0}
          aria-label="Odwróć flagę"
          onKeyDown={(e) => {
            if (!flipped && (e.key === 'Enter' || e.key === ' ' || e.key.startsWith('Arrow'))) {
              e.preventDefault();
              onFlipped();
            }
          }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          className={`touch-none select-none ${flipped ? '' : 'cursor-grab active:cursor-grabbing'}`}
          style={{ perspective: 600 }}
        >
          <motion.div
            animate={{ rotateX: flipped ? 0 : 180 - pull * 40 }}
            initial={false}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
          >
            <FlagRect w={200} ratio={FLAGS.polska.ratio} top={FLAG_WHITE} bottom={FLAG_RED} />
          </motion.div>
        </div>
      </div>

      {flipped && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 border-t pt-4"
        >
          <p className="mb-3 text-sm leading-relaxed">
            Wisiała <strong>do góry nogami</strong> — czerwień u góry, biel u dołu. Tylko że takie
            flagi już istnieją. Przyjrzyj się:
          </p>
          <div className="flex flex-wrap items-end justify-center gap-5">
            {(['polska', 'monako', 'indonezja'] as const).map((id) => (
              <figure key={id} className="flex flex-col items-center gap-1.5">
                <FlagRect w={92} ratio={FLAGS[id].ratio} top={FLAGS[id].top} bottom={FLAGS[id].bottom} />
                <figcaption className="text-xs">
                  <span className="font-semibold">{FLAGS[id].label}</span>
                  <span className="ml-1 text-muted-foreground">
                    {id === 'polska' ? '5 : 8' : id === 'monako' ? '4 : 5' : '2 : 3'}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed">
            Monako i Indonezja mają czerwień u góry — różnią się od siebie tylko kształtem
            prostokąta. Odwrócona polska flaga mówi więc obcym językiem: „tu jest Monako”.
            Dlatego <span style={{ color }} className="font-semibold">biel zawsze u góry</span>.
          </p>
        </motion.div>
      )}
    </section>
  );
}

/* ----------------------------------------------------------------- maszt */

const MAST_TOP = 24;
const MAST_BOTTOM = 286;
const FLAG_W = 64;
const FLAG_H = 40;

function Maszt({ mode, color, onDone }: { mode: MastMode; color: string; onDone: () => void }) {
  const [height, setHeight] = useState(0);
  const [maxHeight, setMaxHeight] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const set = (h: number) => {
    const v = Math.max(0, Math.min(1, h));
    setHeight(v);
    setMaxHeight((m) => Math.max(m, v));
    setMessage(null);
  };

  /** Uchwyt linki: na dole przy fladze u ziemi, im niżej ściągnięty, tym wyżej flaga. */
  const GRIP_Y0 = 150;
  const GRIP_Y1 = 300;
  const gripY = GRIP_Y0 + (GRIP_Y1 - GRIP_Y0) * height;

  const toSvgY = (clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const pt = svg.createSVGPoint();
    pt.x = 0;
    pt.y = clientY;
    const m = svg.getScreenCTM();
    return m ? pt.matrixTransform(m.inverse()).y : 0;
  };

  const flagTop = MAST_BOTTOM - FLAG_H - (MAST_BOTTOM - FLAG_H - MAST_TOP) * height;

  const check = () => {
    const v = judgeMast(mode, { height, maxHeight });
    if (v.ok) {
      setOk(true);
      setMessage(null);
    } else setMessage(v.message);
  };

  return (
    <div>
      <p className="mb-3 text-sm leading-relaxed">
        {mode === 'swieto' ? (
          <>
            <strong>11 listopada, Narodowe Święto Niepodległości.</strong> Wciągnij flagę na maszt:{' '}
            <strong>ściągaj uchwyt linki w dół</strong> — flaga pojedzie w górę.
          </>
        ) : (
          <>
            <strong>Prezydent ogłosił żałobę narodową.</strong> Jak teraz powinna wisieć flaga?
            Ustaw ją linką i sprawdź.
          </>
        )}
      </p>
      <div className="flex flex-wrap items-start gap-5">
        <svg
          ref={svgRef}
          viewBox="0 0 160 310"
          className="h-[300px] w-auto touch-none select-none"
          role="img"
          aria-label={`Maszt, flaga na ${Math.round(height * 100)}% wysokości`}
        >
          <rect x={0} y={296} width={160} height={14} fill="#d4d4d8" />
          {/* znacznik połowy masztu */}
          <line
            x1={30}
            x2={44}
            y1={MAST_TOP + (MAST_BOTTOM - MAST_TOP) * (1 - (HALF_LO + HALF_HI) / 2)}
            y2={MAST_TOP + (MAST_BOTTOM - MAST_TOP) * (1 - (HALF_LO + HALF_HI) / 2)}
            stroke="#a1a1aa"
            strokeDasharray="2 2"
          />
          <rect x={44} y={MAST_TOP - 8} width={6} height={MAST_BOTTOM - MAST_TOP + 18} fill="#71717a" />
          <circle cx={47} cy={MAST_TOP - 10} r={5} fill="#a1a1aa" />
          {/* linka */}
          <line x1={52} x2={60} y1={MAST_TOP - 6} y2={MAST_TOP - 6} stroke="#52525b" />
          <line x1={60} x2={60} y1={MAST_TOP - 6} y2={gripY} stroke="#52525b" />
          <g transform={`translate(50 ${flagTop})`}>
            <rect width={FLAG_W} height={FLAG_H / 2} fill={FLAG_WHITE} stroke="#a1a1aa" strokeWidth={0.6} />
            <rect y={FLAG_H / 2} width={FLAG_W} height={FLAG_H / 2} fill={FLAG_RED} />
          </g>
          {/* uchwyt */}
          <g
            role="slider"
            tabIndex={ok ? -1 : 0}
            aria-label="Uchwyt linki"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(height * 100)}
            className={ok ? '' : 'cursor-grab active:cursor-grabbing'}
            onKeyDown={(e) => {
              if (ok) return;
              if (e.key === 'ArrowDown') set(height + 0.05);
              if (e.key === 'ArrowUp') set(height - 0.05);
            }}
            onPointerDown={(e) => {
              if (ok) return;
              (e.currentTarget as Element).setPointerCapture(e.pointerId);
              dragging.current = true;
            }}
            onPointerMove={(e) => {
              if (!dragging.current) return;
              set((toSvgY(e.clientY) - GRIP_Y0) / (GRIP_Y1 - GRIP_Y0));
            }}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
          >
            <circle cx={60} cy={gripY} r={22} fill="transparent" />
            <rect x={52} y={gripY - 9} width={16} height={18} fill={color} />
            <line x1={55} x2={65} y1={gripY - 3} y2={gripY - 3} stroke="#fff" />
            <line x1={55} x2={65} y1={gripY + 3} y2={gripY + 3} stroke="#fff" />
          </g>
          <text x={4} y={MAST_TOP + 4} fontSize={10} fill="#71717a">
            szczyt
          </text>
          <text x={4} y={MAST_TOP + (MAST_BOTTOM - MAST_TOP) * 0.5 + 4} fontSize={10} fill="#71717a">
            ½
          </text>
        </svg>
        <div className="min-w-0 flex-1 space-y-3 text-sm">
          <p className="font-mono text-2xl tabular-nums" aria-live="polite">
            {Math.round(height * 100)}%
          </p>
          {!ok && (
            <button
              type="button"
              onClick={check}
              className="cursor-pointer border px-3 py-1.5 font-semibold hover:bg-muted"
              style={{ borderColor: color, color }}
            >
              Tak ma wisieć
            </button>
          )}
          {message && (
            <p className="text-destructive" aria-live="polite">
              {message}
            </p>
          )}
          {ok && (
            <div className="space-y-3" aria-live="polite">
              <p>
                {mode === 'swieto' ? (
                  <>
                    Na sam szczyt — tak flaga wisi w święto. Każdy może ją wtedy wywiesić: ustawa
                    mówi, że barw może używać każdy, zwłaszcza żeby podkreślić święto.
                  </>
                ) : (
                  <>
                    Ustawa: „w czasie żałoby narodowej flagę państwową{' '}
                    <strong>opuszcza się do połowy masztu</strong>”. A zwyczaj dodaje: najpierw na
                    szczyt, potem w dół — flaga oddaje cześć i dopiero wtedy się pochyla.
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={onDone}
                className="cursor-pointer border px-3 py-1.5 font-semibold text-white"
                style={{ background: color, borderColor: color }}
              >
                Dalej
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ okno */

function Okno({ color, onDone }: { color: string; onDone: () => void }) {
  const [turn, setTurn] = useState<Turn>(0);
  const [spins, setSpins] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [hung, setHung] = useState(false);

  const rotate = () => {
    if (hung) return;
    setTurn((t) => nextTurn(t));
    setSpins((s) => s + 1);
    setMessage(null);
  };

  const hang = () => {
    const v = judgeWindow(turn);
    if (v.ok) {
      setHung(true);
      onDone();
    } else setMessage(v.message);
  };

  return (
    <div>
      <p className="mb-3 text-sm leading-relaxed">
        Na święto chcesz powiesić flagę w <strong>wąskim, wysokim oknie</strong>. Długa flaga zwisa
        w nim pionowo. <strong>Stukaj we flagę, żeby ją obracać</strong>, a potem powieś.
      </p>
      <div className="flex flex-wrap items-center gap-6">
        {/* okno */}
        <svg viewBox="0 0 120 200" className="h-[200px] w-auto shrink-0" role="img" aria-label="Okno">
          <rect x={0} y={0} width={120} height={200} fill="#e7e5e4" />
          <rect x={30} y={20} width={60} height={160} fill="#bae6fd" stroke="#78716c" strokeWidth={4} />
          <line x1={60} x2={60} y1={20} y2={180} stroke="#78716c" strokeWidth={3} />
          {hung && (
            <motion.g initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              {/* pionowo, biel po lewej patrzącego */}
              <rect x={40} y={26} width={20} height={130} fill={FLAG_WHITE} stroke="#a1a1aa" strokeWidth={0.6} />
              <rect x={60} y={26} width={20} height={130} fill={FLAG_RED} />
            </motion.g>
          )}
        </svg>

        {!hung && (
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={rotate}
              aria-label="Obróć flagę o ćwierć obrotu"
              className="flex h-[150px] w-[150px] cursor-pointer items-center justify-center"
            >
              <motion.div animate={{ rotate: spins * 90 }} transition={{ type: 'spring', stiffness: 140, damping: 16 }}>
                <svg width={130} height={44} viewBox="0 0 130 44" aria-hidden className="block">
                  <rect width={130} height={22} fill={FLAG_WHITE} stroke="#a1a1aa" strokeWidth={0.6} />
                  <rect y={22} width={130} height={22} fill={FLAG_RED} />
                </svg>
              </motion.div>
            </button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RotateCw className="h-3.5 w-3.5" aria-hidden />
              stuknij, żeby obrócić
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-3 text-sm">
          {!hung && (
            <button
              type="button"
              onClick={hang}
              className="cursor-pointer border px-3 py-1.5 font-semibold hover:bg-muted"
              style={{ borderColor: color, color }}
            >
              Powieś w oknie
            </button>
          )}
          {message && (
            <p className="text-destructive" aria-live="polite">
              {message}
            </p>
          )}
          {hung && (
            <p aria-live="polite">
              Wisi dobrze: pionowo, <strong>biel po lewej</strong> stronie tego, kto patrzy na okno
              z ulicy. Tak mówi ustawa — i tak samo wiesza się flagę pionowo na ścianie czy na
              scenie.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
