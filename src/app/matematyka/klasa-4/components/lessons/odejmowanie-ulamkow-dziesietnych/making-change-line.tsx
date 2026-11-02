'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Coins, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface RoundConfig {
  id: string;
  /** Wartości w setnych — trzymamy liczby całkowite, żeby uniknąć błędu float64. */
  startC: number;
  targetC: number;
  scenario: string;
  question: string;
  /** Nazwa różnicy w tym kontekście (reszta / różnica wysokości…). */
  resultNoun: string;
}

const ROUNDS: RoundConfig[] = [
  {
    id: 'reszta',
    startC: 635,
    targetC: 1000,
    scenario: 'Kupujesz zeszyt i długopis za 6,35 zł. Płacisz banknotem 10 zł.',
    question: 'Dolicz od 6,35 zł do 10 zł krótkimi skokami — ile reszty dostaniesz?',
    resultNoun: 'reszta',
  },
  {
    id: 'polki',
    startC: 175,
    targetC: 210,
    scenario: 'Dolna półka wisi na wysokości 1,75 m, górna na 2,10 m.',
    question: 'Dolicz od 1,75 m do 2,10 m — o ile wyżej jest górna półka?',
    resultNoun: 'różnica wysokości',
  },
];

/** Zapis liczby setnych jako złotówki/metry z przecinkiem: 635 → „6,35". */
function fmt(cents: number): string {
  const whole = Math.floor(cents / 100);
  const rest = cents % 100;
  return `${whole},${String(rest).padStart(2, '0')}`;
}

type JumpKind = 'setna' | 'dziesiata' | 'calosc' | 'do-dziesiatej' | 'do-calosci' | 'do-celu';

interface JumpButtonDef {
  kind: JumpKind;
  label: string;
  /** Ile setnych doda ten skok przy bieżącej pozycji (0 = niedostępny). */
  value: (currentC: number, targetC: number) => number;
}

const JUMP_BUTTONS: JumpButtonDef[] = [
  { kind: 'setna', label: '+0,01', value: () => 1 },
  { kind: 'dziesiata', label: '+0,1', value: () => 10 },
  { kind: 'calosc', label: '+1', value: () => 100 },
  {
    kind: 'do-dziesiatej',
    label: 'skok do najbliższej dziesiątej',
    value: (c) => (c % 10 === 0 ? 0 : 10 - (c % 10)),
  },
  {
    kind: 'do-calosci',
    label: 'skok do najbliższej całości',
    value: (c) => (c % 100 === 0 ? 0 : 100 - (c % 100)),
  },
  {
    kind: 'do-celu',
    // Dostępny dopiero, gdy do celu zostało nie więcej niż 1 — inaczej dziecko
    // przeskoczyłoby całą oś jednym kliknięciem, a chodzi o krótkie skoki.
    label: 'skok prosto do celu',
    value: (c, t) => (t - c <= 100 ? t - c : 0),
  },
];

interface Jump {
  fromC: number;
  toC: number;
}

interface MakingChangeLineProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe (nowa interakcja lekcji): odejmowanie „przez doliczanie".
 * Zamiast liczyć w słupku, dziecko dolicza od odjemnika do odjemnej krótkimi,
 * przyjaznymi skokami po osi z przecinkiem — do pełnej setnej, do pełnej
 * dziesiątej, do całości. Suma długości skoków to szukana różnica. Dziesiętny
 * potomek `JumpLine` z modułu 1 (tam liczby naturalne; tu skoki zatrzaskują się
 * na „okrągłych" ułamkach dziesiętnych i sumują się jako liczby z przecinkiem).
 */
export function MakingChangeLine({ color, onComplete }: MakingChangeLineProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [currentC, setCurrentC] = useState(ROUNDS[0].startC);
  const [jumps, setJumps] = useState<Jump[]>([]);
  const [finished, setFinished] = useState(false);

  const round = ROUNDS[roundIndex] ?? ROUNDS[ROUNDS.length - 1];
  const done = currentC >= round.targetC;
  const containerRef = useSectionScrollAnchor(`${roundIndex}-${done}-${finished}`);

  const span = round.targetC - round.startC;
  const differenceC = round.targetC - round.startC;

  const doJump = (deltaC: number) => {
    if (deltaC <= 0 || currentC + deltaC > round.targetC) return;
    setJumps((prev) => [...prev, { fromC: currentC, toC: currentC + deltaC }]);
    setCurrentC((prev) => prev + deltaC);
  };

  const resetRound = () => {
    setCurrentC(round.startC);
    setJumps([]);
  };

  const goNext = () => {
    if (roundIndex + 1 < ROUNDS.length) {
      const nextRound = ROUNDS[roundIndex + 1];
      setRoundIndex((index) => index + 1);
      setCurrentC(nextRound.startC);
      setJumps([]);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Odejmowanie przez doliczanie masz opanowane</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Zamiast słupka można dojść od mniejszej liczby do większej krótkimi skokami — do pełnej
          setnej, dziesiątej, całości. Suma tych skoków to dokładnie ta sama różnica, którą dałby
          słupek.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {/* Kropki rund */}
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((item, i) => (
          <span
            key={item.id}
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
          key={round.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-1 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <Coins className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            {round.scenario}
          </p>
          <p className="mb-4 text-base font-bold leading-snug sm:text-lg">{round.question}</p>

          <JumpAxis
            startC={round.startC}
            targetC={round.targetC}
            currentC={currentC}
            jumps={jumps}
            span={span}
            color={color}
          />

          {/* Suma skoków */}
          <div className="mt-4 min-h-[2.5rem] text-center">
            {jumps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Zacznij od <span className="font-mono font-bold" style={{ color }}>{fmt(round.startC)}</span> i
                dobijaj skokami do <span className="font-mono font-bold" style={{ color }}>{fmt(round.targetC)}</span>.
              </p>
            ) : (
              <p className="font-mono text-base font-bold tabular-nums sm:text-lg" style={{ color }}>
                {jumps.map((j, i) => (
                  <span key={i}>
                    {i > 0 && <span className="mx-1 text-muted-foreground">+</span>}
                    {fmt(j.toC - j.fromC)}
                  </span>
                ))}
                {done && (
                  <>
                    <span className="mx-1 text-muted-foreground">=</span>
                    {fmt(differenceC)}
                  </>
                )}
              </p>
            )}
          </div>

          {!done ? (
            <>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {JUMP_BUTTONS.map((btn) => {
                  const delta = btn.value(currentC, round.targetC);
                  const disabled = delta <= 0 || currentC + delta > round.targetC;
                  return (
                    <button
                      key={btn.kind}
                      type="button"
                      onClick={() => doJump(delta)}
                      disabled={disabled}
                      className={cn(
                        'border px-3 py-2 text-center text-xs font-semibold transition-all sm:text-sm',
                        disabled
                          ? 'cursor-not-allowed opacity-40'
                          : 'cursor-pointer hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md'
                      )}
                    >
                      {btn.label}
                      {!disabled && btn.kind.startsWith('do-') && (
                        <span className="ml-1 font-mono" style={{ color }}>
                          (+{fmt(delta)})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {jumps.length > 0 && (
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={resetRound}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden /> Zacznij skoki od nowa
                  </button>
                </div>
              )}
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
              <div
                className="flex items-start gap-3 p-4 text-sm leading-relaxed"
                style={{ backgroundColor: `${color}0f` }}
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                <p>
                  Skoki dobiły do {fmt(round.targetC)}. Ich suma to{' '}
                  <span className="font-mono font-bold" style={{ color }}>
                    {fmt(differenceC)}
                  </span>{' '}
                  — i tyle właśnie wynosi {round.resultNoun}: {fmt(round.targetC)} − {fmt(round.startC)} ={' '}
                  {fmt(differenceC)}.
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={goNext}>
                  {roundIndex + 1 < ROUNDS.length ? (
                    'Następna sytuacja'
                  ) : (
                    <>
                      <Check className="mr-1 h-4 w-4" /> Zakończ zadanie
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function JumpAxis({
  startC,
  targetC,
  currentC,
  jumps,
  span,
  color,
}: {
  startC: number;
  targetC: number;
  currentC: number;
  jumps: Jump[];
  span: number;
  color: string;
}) {
  // Układ osi. Wysokość musi zmieścić: łuki skoków (nad osią), kreski,
  // podpisy całości oraz podpisy start/cel z etykietą pod spodem.
  const W = 680;
  const H = 136;
  const padX = 46;
  const axisY = 86;
  const usable = W - padX * 2;

  const x = (cents: number) => padX + ((cents - startC) / span) * usable;
  const rx = (cents: number) => Math.round(x(cents) * 1000) / 1000;

  // Kreski co 0,1 w zakresie (bez samego celu — ten dostaje własny znacznik).
  const ticks = useMemo(() => {
    const list: { cents: number; whole: boolean }[] = [];
    const firstTenth = Math.ceil(startC / 10) * 10;
    for (let c = firstTenth; c < targetC; c += 10) {
      list.push({ cents: c, whole: c % 100 === 0 });
    }
    return list;
  }, [startC, targetC]);

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto block h-auto w-full max-w-[680px]"
        role="img"
        aria-label={`Oś liczbowa od ${fmt(startC)} do ${fmt(targetC)}, obecna pozycja ${fmt(currentC)}`}
      >
        {/* Oś */}
        <line x1={padX} y1={axisY} x2={W - padX} y2={axisY} stroke={color} strokeWidth={2.5} />

        {/* Kreski podziałki */}
        {ticks.map((tick) => {
          const isEndpoint = tick.cents === startC || tick.cents === targetC;
          return (
            <g key={tick.cents}>
              <line
                x1={rx(tick.cents)}
                y1={axisY - (tick.whole ? 9 : 5)}
                x2={rx(tick.cents)}
                y2={axisY + (tick.whole ? 9 : 5)}
                stroke={color}
                strokeWidth={tick.whole ? 2 : 1}
                opacity={tick.whole ? 0.85 : 0.35}
              />
              {tick.whole && !isEndpoint && (
                <text
                  x={rx(tick.cents)}
                  y={axisY + 22}
                  textAnchor="middle"
                  className="fill-current font-mono text-[10px] font-semibold"
                  style={{ color, opacity: 0.7 }}
                >
                  {fmt(tick.cents)}
                </text>
              )}
            </g>
          );
        })}

        {/* Łuki skoków */}
        {jumps.map((jump, i) => {
          const x1 = x(jump.fromC);
          const x2 = x(jump.toC);
          const midX = (x1 + x2) / 2;
          const arcH = 28 + (i % 2) * 10;
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              <path
                d={`M ${Math.round(x1 * 1000) / 1000} ${axisY} Q ${Math.round(midX * 1000) / 1000} ${axisY - arcH} ${Math.round(x2 * 1000) / 1000} ${axisY}`}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeDasharray="4 3"
              />
              <text
                x={Math.round(midX * 1000) / 1000}
                y={axisY - arcH + 1}
                textAnchor="middle"
                className="fill-current font-mono text-[9px] font-bold"
                style={{ color }}
              >
                +{fmt(jump.toC - jump.fromC)}
              </text>
            </motion.g>
          );
        })}

        {/* Start i cel */}
        <Endpoint cx={rx(startC)} axisY={axisY} label={fmt(startC)} sub="START" color={color} />
        <Endpoint cx={rx(targetC)} axisY={axisY} label={fmt(targetC)} sub="CEL" color={color} filled />

        {/* Obecna pozycja */}
        <motion.g
          animate={{ x: rx(currentC) - padX }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        >
          <polygon
            points={`${padX},${axisY - 3} ${padX - 5.5},${axisY - 14} ${padX + 5.5},${axisY - 14}`}
            fill={color}
          />
        </motion.g>
      </svg>
    </div>
  );
}

function Endpoint({
  cx,
  axisY,
  label,
  sub,
  color,
  filled = false,
}: {
  cx: number;
  axisY: number;
  label: string;
  sub: string;
  color: string;
  filled?: boolean;
}) {
  return (
    <g>
      <circle cx={cx} cy={axisY} r={4.5} fill={filled ? color : '#fff'} stroke={color} strokeWidth={2} />
      <text
        x={cx}
        y={axisY + 22}
        textAnchor="middle"
        className="fill-current font-mono text-[11px] font-bold"
        style={{ color }}
      >
        {label}
      </text>
      <text
        x={cx}
        y={axisY + 34}
        textAnchor="middle"
        className="fill-current text-[7px] font-bold uppercase tracking-[0.1em]"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {sub}
      </text>
    </g>
  );
}
