'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { useTweenedNumber } from '../../../lib/use-tweened-number';
import { DecimalNumeral } from '../../guides/zapis-dziesietny/decimal-numeral';

interface Round {
  /** Jedno zdanie scenariusza. */
  scenario: string;
  /** Pełne metry — pokazane, ale nieruchome; miarka steruje tylko częścią po przecinku. */
  whole: number;
  /** Cel w centymetrach, 0–100. */
  targetCm: number;
  /** W jakim zapisie podano cel — miarka uczy przejścia w drugą stronę. */
  given: 'compound' | 'decimal';
}

const ROUNDS: Round[] = [
  {
    scenario: 'Stolarz odcina półkę o długości 1 m 45 cm. Ustaw miarkę na tej długości.',
    whole: 1,
    targetCm: 45,
    given: 'compound',
  },
  {
    scenario: 'Druga półka ma mieć dokładnie 2,08 m. Ustaw miarkę — policz, ile to centymetrów.',
    whole: 2,
    targetCm: 8,
    given: 'decimal',
  },
  {
    scenario: 'Ostatnia deska ma 1 m 90 cm. Ustaw miarkę i odczytaj jej długość w metrach.',
    whole: 1,
    targetCm: 90,
    given: 'compound',
  },
];

const VB_W = 384;
const TRACK_X0 = 24;
const TRACK_W = 336;
const BASE_Y = 68;

const round3 = (n: number) => Math.round(n * 1000) / 1000;
const xOf = (cm: number) => round3(TRACK_X0 + (cm / 100) * TRACK_W);
const clampCm = (cm: number) => Math.max(0, Math.min(100, Math.round(cm)));
const pad2 = (n: number) => String(n).padStart(2, '0');

interface CutListTapeProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: prawdziwa miarka stolarska. Jedno położenie końca miarki
 * ma dwie nazwy naraz — „1 m 45 cm" i „1,45 m" — i oba odczyty zmieniają się
 * razem z ruchem. Cel podawany jest raz w jednym zapisie, raz w drugim, więc
 * dziecko ćwiczy przejście w obie strony. Sterowanie: przeciąganie końca miarki,
 * klik w linijkę, przyciski ±1/±10 i strzałki (`role="slider"`). Położenie
 * zatrzaskuje się na pełnych centymetrach, więc stan to liczba całkowita i
 * pierwsza klatka SSR jest identyczna z kliencką.
 */
export function CutListTape({ color, onComplete }: CutListTapeProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  // `setPos` skacze (przeciąganie 1:1, reset rundy), `tweenPos` płynnie
  // przesuwa koniec miarki (przyciski ±1/±10, strzałki), żeby klik był
  // przejazdem miarki, a nie cięciem — też gdy autoplay rolki klika przyciski.
  const { value: pos, set: setPos, tweenTo: tweenPos } = useTweenedNumber(0, { duration: 0.32 });
  const [dragging, setDragging] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useSectionScrollAnchor(`${roundIndex}-${finished}`);

  const round = ROUNDS[roundIndex];
  const isLast = roundIndex === ROUNDS.length - 1;
  const moduleTextColor = `color-mix(in oklch, ${color} 88%, black)`;
  // W trakcie tweenu `pos` przechodzi przez wartości ułamkowe: rysunek (płynny
  // znacznik, zamalowanie) bierze surowe `pos`, wszystkie odczyty liczbowe i
  // porównania — `posInt`. Tween kończy się dokładnie na `clampCm(target)`,
  // więc stan w spoczynku zawsze jest całkowity (niezmiennik SSR zachowany).
  const posInt = Math.round(pos);

  const revealIfTarget = (finalCm: number) => {
    if (finalCm === round.targetCm) setRevealed(true);
  };

  // Przeciąganie/klik w linijkę — skok bez animacji (pointermove sam jest płynny).
  const setClamped = (cm: number) => {
    const next = clampCm(cm);
    setPos(next);
    if (next === round.targetCm) setRevealed(true);
  };

  // Przyciski i klawiatura — płynny przejazd miarki do nowej wartości.
  const nudge = (delta: number) => tweenPos((cur) => clampCm(cur + delta), revealIfTarget);

  const cmFromClientX = (clientX: number): number | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return null;
    const px = ((clientX - rect.left) / rect.width) * VB_W;
    return ((px - TRACK_X0) / TRACK_W) * 100;
  };

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
    const cm = cmFromClientX(event.clientX);
    if (cm !== null) setClamped(cm);
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const cm = cmFromClientX(event.clientX);
    if (cm !== null) setClamped(cm);
  };

  const endDrag = (event: PointerEvent<SVGSVGElement>) => {
    setDragging(false);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, number> = {
      ArrowLeft: -1,
      ArrowDown: -1,
      ArrowRight: 1,
      ArrowUp: 1,
      PageUp: 10,
      PageDown: -10,
    };
    if (event.key === 'Home') {
      event.preventDefault();
      tweenPos(0, revealIfTarget);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      tweenPos(100, revealIfTarget);
      return;
    }
    const delta = map[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    const step = event.shiftKey ? delta * 10 : delta;
    tweenPos((cur) => clampCm(cur + step), revealIfTarget);
  };

  const advance = () => {
    if (isLast) {
      setFinished(true);
      onComplete?.();
      return;
    }
    setRoundIndex((i) => i + 1);
    setPos(0);
    setRevealed(false);
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Ruler className="mx-auto mb-4 h-9 w-9" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Wszystkie deski odmierzone!</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Każdy wymiar zapisałeś/aś dwa razy tak samo — raz miarką „metr i centymetry”, raz jedną
          liczbą z przecinkiem. To ta sama długość, tylko inaczej zapisana.
        </p>
      </div>
    );
  }

  const ticks = Array.from({ length: 101 }, (_, cm) => cm);
  // 100 cm domyka się w pełny metr — odczyt w metrach liczymy z całości, nie z surowego `pos`.
  const totalCm = round.whole * 100 + posInt;
  const decWhole = Math.floor(totalCm / 100);
  const decFrac = totalCm % 100;
  const fracDigits = [Number(pad2(decFrac)[0]), Number(pad2(decFrac)[1])];

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {roundIndex + 1}/{ROUNDS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={roundIndex}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-3 text-sm leading-relaxed sm:text-base">{round.scenario}</p>

          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="text-muted-foreground">Cel:</span>
            <span className="font-mono text-lg font-black tabular-nums" style={{ color }}>
              {round.given === 'compound'
                ? `${round.whole} m ${round.targetCm} cm`
                : `${round.whole},${pad2(round.targetCm)} m`}
            </span>
          </div>

          {/* Miarka */}
          <div
            role="slider"
            tabIndex={0}
            aria-label="Koniec miarki w centymetrach"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={posInt}
            aria-valuetext={`${round.whole} metrów ${posInt} centymetrów`}
            onKeyDown={handleKey}
            className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <div className="flex items-stretch gap-2">
              <span
                className="flex shrink-0 items-center border-r-2 pr-2 font-mono text-sm font-bold tabular-nums"
                style={{ borderColor: `${color}59`, color: moduleTextColor }}
              >
                {round.whole} m +
              </span>
              <svg
                ref={svgRef}
                viewBox={`0 0 ${VB_W} 104`}
                className={`w-full touch-none select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                aria-hidden
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerLeave={endDrag}
                onPointerCancel={endDrag}
              >
                {/* korpus */}
                <rect
                  x={TRACK_X0}
                  y={BASE_Y}
                  width={TRACK_W}
                  height={6}
                  fill={`${color}1f`}
                />
                {/* zamalowanie do końca miarki */}
                <rect
                  x={TRACK_X0}
                  y={BASE_Y - 3}
                  width={Math.max(0, xOf(pos) - TRACK_X0)}
                  height={9}
                  fill={`${color}59`}
                />
                {/* kreski */}
                {ticks.map((cm) => {
                  const major = cm % 10 === 0;
                  const mid = cm % 5 === 0;
                  const h = major ? 22 : mid ? 14 : 8;
                  return (
                    <line
                      key={cm}
                      x1={xOf(cm)}
                      x2={xOf(cm)}
                      y1={BASE_Y}
                      y2={BASE_Y - h}
                      stroke={major ? `${color}b0` : `${color}70`}
                      strokeWidth={major ? 1.6 : 1}
                    />
                  );
                })}
                {ticks
                  .filter((cm) => cm % 20 === 0)
                  .map((cm) => (
                    <text
                      key={cm}
                      x={xOf(cm)}
                      y={BASE_Y + 20}
                      textAnchor="middle"
                      className="font-mono"
                      fontSize={10}
                      fill={`${color}99`}
                    >
                      {cm}
                    </text>
                  ))}
                {/* znacznik końca miarki */}
                <line
                  x1={xOf(pos)}
                  x2={xOf(pos)}
                  y1={14}
                  y2={BASE_Y + 4}
                  stroke={color}
                  strokeWidth={2.5}
                />
                <path
                  d={`M ${xOf(pos) - 7} 6 L ${xOf(pos) + 7} 6 L ${xOf(pos)} 18 Z`}
                  fill={color}
                />
                <circle cx={xOf(pos)} cy={9} r={dragging ? 5 : 3.5} fill="white" stroke={color} strokeWidth={2} />
                {/* pełnowymiarowa warstwa, żeby klik/drag łapał się też między kreskami */}
                <rect x={0} y={0} width={VB_W} height={104} fill="#fff" fillOpacity={0.001} />
              </svg>
            </div>
          </div>

          {/* przyciski */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <StepButton label="−10 cm" onClick={() => nudge(-10)} disabled={posInt === 0}>
              <Minus className="h-3.5 w-3.5" /> 10
            </StepButton>
            <StepButton label="−1 cm" onClick={() => nudge(-1)} disabled={posInt === 0}>
              <Minus className="h-3.5 w-3.5" /> 1
            </StepButton>
            <span
              className="min-w-[6rem] text-center font-mono text-base font-bold tabular-nums"
              style={{ color }}
            >
              {posInt} cm
            </span>
            <StepButton label="+1 cm" onClick={() => nudge(1)} disabled={posInt === 100}>
              <Plus className="h-3.5 w-3.5" /> 1
            </StepButton>
            <StepButton label="+10 cm" onClick={() => nudge(10)} disabled={posInt === 100}>
              <Plus className="h-3.5 w-3.5" /> 10
            </StepButton>
          </div>

          {/* dwa odczyty tego samego położenia */}
          <div className="mt-4 grid gap-2 border-t pt-4 sm:grid-cols-2">
            <div className="border p-3 text-center">
              <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                miarką
              </p>
              <p className="font-mono text-lg font-black tabular-nums" style={{ color: moduleTextColor }}>
                {round.whole} m {posInt} cm
              </p>
            </div>
            <div className="border p-3 text-center">
              <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                w metrach
              </p>
              <DecimalNumeral
                value={{ whole: decWhole, digits: fracDigits }}
                color={color}
                className="text-lg"
              />
              <span className="ml-1 font-mono text-base font-bold" style={{ color }}>
                m
              </span>
            </div>
          </div>

          {revealed ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex flex-col gap-3 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 sm:flex-row sm:items-center sm:justify-between dark:bg-emerald-950/40 dark:text-emerald-100"
            >
              <span className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  <strong>
                    {round.whole} m {round.targetCm} cm
                  </strong>{' '}
                  to dokładnie{' '}
                  <strong>
                    {round.whole},{pad2(round.targetCm)} m
                  </strong>{' '}
                  — to samo, dwa zapisy.
                </span>
              </span>
              <Button onClick={advance} className="shrink-0">
                {isLast ? (
                  <>
                    <Check className="mr-1 h-4 w-4" /> Zakończ
                  </>
                ) : (
                  'Następna deska'
                )}
              </Button>
            </motion.div>
          ) : (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Przesuń koniec miarki tak, aby pokazała{' '}
              <strong style={{ color: moduleTextColor }}>
                {round.given === 'compound'
                  ? `${round.targetCm} cm`
                  : `${round.whole},${pad2(round.targetCm)} m`}
              </strong>
              .
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StepButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-9 items-center gap-1 border px-2.5 font-mono text-sm font-bold transition-all hover:-translate-y-0.5 hover:border-primary/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
    >
      {children}
    </button>
  );
}
