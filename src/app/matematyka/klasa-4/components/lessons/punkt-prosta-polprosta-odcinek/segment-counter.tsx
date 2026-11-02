'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Lightbulb, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { extendFar } from './geo-shape';

interface NamedPoint {
  id: string;
  x: number;
  y: number;
}

const POINTS: NamedPoint[] = [
  { id: 'A', x: 60, y: 150 },
  { id: 'B', x: 262, y: 168 },
  { id: 'C', x: 280, y: 40 },
  { id: 'D', x: 42, y: 48 },
];

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 200;

/** Wszystkie 6 możliwych par (kolejność w kluczu bez znaczenia — odcinek AB to odcinek BA). */
const ALL_PAIRS: [string, string][] = [];
for (let i = 0; i < POINTS.length; i++) {
  for (let j = i + 1; j < POINTS.length; j++) {
    ALL_PAIRS.push([POINTS[i].id, POINTS[j].id]);
  }
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join('-');
}

/** Wiązka prostych przez punkt A — kierunki dobrane wektorowo. */
const FAN_DIRECTIONS: [number, number][] = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [2, 1],
  [1, 2],
  [-2, 1],
  [-1, 2],
];

const PHASE_COPY = [
  'Jeden punkt A. Dodawaj kolejne proste przechodzące przez ten sam punkt — ile da się ich narysować?',
  'Teraz dwa punkty: A i B. Ile prostych przechodzi przez oba naraz?',
  'Na koniec 4 punkty: A, B, C i D. Kliknij dwa punkty, żeby narysować łączący je odcinek — narysuj wszystkie możliwe odcinki.',
];

const PHASE_QUESTIONS = [
  {
    question: 'Ile prostych można poprowadzić przez punkt A?',
    options: [
      { id: 'finite', label: 'Tyle, ile się zmieści na rysunku' },
      { id: 'infinite', label: 'Nieskończenie wiele' },
      { id: 'one', label: 'Dokładnie jedną' },
    ],
    correctId: 'infinite',
    success:
      'Dokładnie tak! Przez jeden punkt można poprowadzić nieskończenie wiele prostych — zawsze da się dorysować kolejną.',
  },
  {
    question: 'Ile prostych przechodzi przez punkty A i B naraz?',
    options: [
      { id: 'one', label: 'Dokładnie jedna' },
      { id: 'two', label: 'Dwie' },
      { id: 'infinite', label: 'Nieskończenie wiele' },
    ],
    correctId: 'one',
    success: 'Tak! Przez dwa różne punkty przechodzi zawsze dokładnie jedna prosta.',
  },
] as const;

interface SegmentCounterProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe, trzy fazy. Fazy 0–1 budują aksjomat Euklidesa (przez
 * jeden punkt — nieskończenie wiele prostych, przez dwa — dokładnie jedna) i
 * kończą się pytaniem blokującym przejście dalej, aż dziecko odpowie
 * poprawnie (shake + retry na złej odpowiedzi, nigdy hard lock). Faza 2 to
 * oryginalne zadanie: klikając pary z czterech punktów, dziecko rysuje
 * WSZYSTKIE możliwe odcinki między nimi — kliknięcie już narysowanego
 * odcinka go usuwa. Ta sama litera A oznacza ten sam punkt w każdej fazie,
 * B dochodzi w fazie 1, C i D w fazie 2 — punkty się nie przenumerowują.
 */
export function SegmentCounter({ color, onComplete }: SegmentCounterProps) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [addedCount, setAddedCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [drawn, setDrawn] = useState<Set<string>>(new Set());
  const [notified, setNotified] = useState(false);

  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const done = drawn.size === ALL_PAIRS.length;

  const pointAt = (id: string) => POINTS.find((p) => p.id === id)!;
  const A = POINTS[0];
  const B = POINTS[1];

  const answerQuestion = (id: string) => {
    if (answered) return;
    const question = PHASE_QUESTIONS[phase as 0 | 1];
    if (id === question.correctId) {
      setAnswered(true);
      return;
    }
    setWrongChoice(id);
    setTimeout(() => setWrongChoice(null), 650);
  };

  const addLine = () => {
    if (answered || addedCount >= FAN_DIRECTIONS.length) return;
    setAddedCount((prev) => Math.min(FAN_DIRECTIONS.length, prev + 1));
  };

  const goNextPhase = () => {
    setPhase((prev) => (prev === 0 ? 1 : 2));
    setAddedCount(0);
    setAnswered(false);
    setWrongChoice(null);
  };

  const handleClick = (id: string) => {
    if (phase !== 2) return;
    if (!selected) {
      setSelected(id);
      return;
    }
    if (selected === id) {
      setSelected(null);
      return;
    }
    const key = pairKey(selected, id);
    const next = new Set(drawn);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setDrawn(next);
    setSelected(null);
    if (next.size === ALL_PAIRS.length && !notified) {
      setNotified(true);
      onComplete?.();
    }
  };

  const reset = () => {
    setDrawn(new Set());
    setSelected(null);
    setNotified(false);
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {/* Fazy */}
      <div className="mb-4 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= phase ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">{phase + 1}/3</span>
      </div>

      <p className="mb-1 text-base leading-relaxed sm:text-lg">{PHASE_COPY[phase]}</p>
      {phase === 2 && (
        <p className="mb-5 text-sm text-muted-foreground">
          Kliknięcie już narysowanego odcinka go usuwa, jeśli chcesz poprawić.
        </p>
      )}

      <div className="mb-4 flex items-center justify-center gap-4">
        <div className="relative overflow-hidden border bg-white dark:bg-zinc-900/80">
          <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="h-auto w-full max-w-sm">
            {/* Faza 0: wiązka prostych przez punkt A */}
            {phase === 0 &&
              FAN_DIRECTIONS.slice(0, addedCount).map(([dx, dy], i) => {
                const through = { x: A.x + dx * 20, y: A.y + dy * 20 };
                const tipForward = extendFar(A, through);
                const tipBackward = extendFar(through, A);
                return (
                  <line
                    key={i}
                    x1={tipBackward.x}
                    y1={tipBackward.y}
                    x2={tipForward.x}
                    y2={tipForward.y}
                    stroke={color}
                    strokeWidth={2}
                    opacity={0.5}
                  />
                );
              })}

            {/* Faza 1: jedna prosta przez A i B */}
            {phase === 1 &&
              (() => {
                const tipForward = extendFar(A, B);
                const tipBackward = extendFar(B, A);
                return (
                  <line
                    x1={tipBackward.x}
                    y1={tipBackward.y}
                    x2={tipForward.x}
                    y2={tipForward.y}
                    stroke={color}
                    strokeWidth={3}
                    strokeLinecap="round"
                  />
                );
              })()}

            {/* Faza 2: narysowane odcinki */}
            {phase === 2 &&
              ALL_PAIRS.map(([a, b]) => {
                const key = pairKey(a, b);
                if (!drawn.has(key)) return null;
                const pa = pointAt(a);
                const pb = pointAt(b);
                return (
                  <motion.line
                    key={key}
                    x1={pa.x}
                    y1={pa.y}
                    x2={pb.x}
                    y2={pb.y}
                    stroke={color}
                    strokeWidth={2.5}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                );
              })}

            {/* Punkty widoczne w danej fazie */}
            {(phase === 2 ? POINTS : phase === 1 ? [A, B] : [A]).map((point) => {
              const isSelected = phase === 2 && selected === point.id;
              return (
                <g key={point.id}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={18}
                    fill="transparent"
                    className={phase === 2 ? 'cursor-pointer' : undefined}
                    onClick={phase === 2 ? () => handleClick(point.id) : undefined}
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isSelected ? 9 : 7}
                    fill={isSelected ? color : 'white'}
                    stroke={color}
                    strokeWidth={2.5}
                    className="pointer-events-none transition-all"
                  />
                  <text
                    x={point.x + (point.x > VIEW_WIDTH / 2 ? 14 : -22)}
                    y={point.y - 10}
                    style={{ fontSize: 20, fontWeight: 800 }}
                    fill={textColor}
                    className="pointer-events-none"
                  >
                    {point.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Faza 0: dodawanie prostych */}
      {phase === 0 && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Button onClick={addLine} disabled={answered || addedCount >= FAN_DIRECTIONS.length} className="gap-1.5">
              <Plus className="h-4 w-4" aria-hidden />
              Dodaj prostą
            </Button>
            {addedCount >= FAN_DIRECTIONS.length && !answered && (
              <p className="mt-2 text-sm text-muted-foreground">I zawsze można dodać następną…</p>
            )}
          </div>
          <p className="text-sm font-semibold" style={{ color: textColor }}>
            Narysowane proste: <span className="font-mono tabular-nums">{addedCount}</span>
          </p>
        </div>
      )}

      {/* Pytania blokujące fazy 0–1 */}
      {(phase === 0 || phase === 1) && (
        <div className="mb-5">
          <p className="mb-3 text-base font-semibold leading-relaxed sm:text-lg">
            {PHASE_QUESTIONS[phase].question}
          </p>
          <div className="flex flex-wrap gap-2">
            {PHASE_QUESTIONS[phase].options.map((option) => {
              const isCorrectPick = answered && option.id === PHASE_QUESTIONS[phase].correctId;
              const isWrongPick = wrongChoice === option.id;
              return (
                <motion.button
                  key={option.id}
                  type="button"
                  onClick={() => answerQuestion(option.id)}
                  disabled={answered}
                  animate={isWrongPick ? { x: [0, -6, 6, -6, 6, 0] } : undefined}
                  transition={{ duration: 0.55 }}
                  className={cn(
                    'border-2 px-4 py-2 text-sm font-semibold transition-colors sm:text-base',
                    !answered && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md',
                    isCorrectPick && 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40',
                    isWrongPick && 'border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                  )}
                  style={!answered && !isWrongPick ? { borderColor: `${color}55`, color } : undefined}
                >
                  {isCorrectPick && <Check className="mr-1.5 inline h-4 w-4" aria-hidden />}
                  {option.label}
                </motion.button>
              );
            })}
          </div>

          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-3 p-4 text-sm leading-relaxed sm:text-base"
              style={{ backgroundColor: `${color}0f` }}
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <p>{PHASE_QUESTIONS[phase].success}</p>
            </motion.div>
          )}
          {wrongChoice && !answered && (
            <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">To nie ta odpowiedź — spróbuj jeszcze raz.</p>
          )}

          <div className="mt-5 flex justify-end">
            <Button onClick={goNextPhase} disabled={!answered} className="gap-1.5">
              {phase === 0 ? 'Dodaj punkt B' : 'Dodaj punkty C i D'}
            </Button>
          </div>
        </div>
      )}

      {/* Faza 2: licznik i wynik */}
      {phase === 2 && (
        <>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold" style={{ color: textColor }}>
              Narysowane odcinki: <span className="font-mono tabular-nums">{drawn.size}</span> / {ALL_PAIRS.length}
            </p>
            {drawn.size > 0 && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Zacznij od nowa
              </button>
            )}
          </div>

          {done && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 text-sm leading-relaxed"
              style={{ backgroundColor: `${color}0f` }}
            >
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <p>
                <strong>Wszystkie 6 znalezione!</strong> Skąd akurat 6? Z każdego z 4 punktów wychodzą odcinki do
                pozostałych 3 punktów, czyli 4 × 3 = 12 — ale w ten sposób każdy odcinek policzyłeś/aś dwa razy (raz od
                jednego końca, raz od drugiego). 12 ÷ 2 = 6. To ten sam rysunek pomocniczy, po który sięgniesz w
                trudniejszych zadaniach tekstowych.
              </p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
