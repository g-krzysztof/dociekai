'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { ColumnGrid, type ColumnCellData } from '../../column-grid';
import { buildMultiplicationSteps, type MultiplicationColumnStep } from '../../../lib/column-algorithm';

/** Pierwszy pełny przykład: łańcuch przeniesień 4 → 2, żeby od razu pokazać, że w mnożeniu przeniesienie bywa większe niż 1. */
const DEMO = { a: 347, multiplier: 6 };
/** Runda 1: pojedyncze małe przeniesienie (rozgrzewa mechanikę). Runda 2: duże przenoszenia (5, 7, 7) i nowa wiodąca cyfra — główne wyzwanie lekcji. */
const ROUNDS = [
  { a: 246, multiplier: 3 },
  { a: 786, multiplier: 9 },
];

function buildCells(
  steps: MultiplicationColumnStep[],
  multiplier: number,
  revealedCount: number
): ColumnCellData[] {
  const places = steps.length;
  return Array.from({ length: places }, (_, pos) => {
    const stepIndex = places - 1 - pos;
    const step = steps[stepIndex];
    const solved = stepIndex < revealedCount;
    const rightNeighbor = steps[stepIndex - 1];
    const carryVisible = Boolean(
      rightNeighbor && stepIndex - 1 < revealedCount && rightNeighbor.outgoingCarry > 0
    );
    return {
      place: step.place,
      top: step.topDigit,
      bottom: step.place === 'jedności' ? multiplier : null,
      result: solved ? step.resultDigit : null,
      carry: carryVisible ? rightNeighbor.outgoingCarry : null,
      highlight: stepIndex === revealedCount,
    };
  });
}

function stepNarrative(step: MultiplicationColumnStep, multiplier: number): string {
  const parts = [`${step.topDigit} × ${multiplier} = ${step.digitProduct}`];
  if (step.incomingCarry > 0) {
    parts.push(`${step.digitProduct} + ${step.incomingCarry} (przeniesienie) = ${step.total}`);
  }
  const text = parts.join('. ');
  if (step.outgoingCarry > 0) {
    return `Kolumna ${step.place}: ${text}. To 10 lub więcej, więc zapisujemy tylko ${step.resultDigit}, a „${step.outgoingCarry}” przenosimy do sąsiedniej kolumny po lewej.`;
  }
  return `Kolumna ${step.place}: ${text}. Mniej niż 10, więc po prostu zapisujemy ${step.resultDigit}.`;
}

function decoysFor(step: MultiplicationColumnStep): number[] {
  const correct = step.resultDigit;
  // Najczęstszy błąd: policzyć cyfrę × mnożnik poprawnie, ale zapomnieć dodać przeniesienie.
  const forgotCarry = step.digitProduct % 10;
  const pool = [forgotCarry, correct + 1, correct - 1, correct + 2].filter(
    (n) => n >= 0 && n <= 9 && n !== correct
  );
  const seen = new Set<number>();
  const result: number[] = [];
  for (const n of pool) {
    if (seen.has(n)) continue;
    seen.add(n);
    result.push(n);
    if (result.length === 2) break;
  }
  return result;
}

interface ColumnMultiplicationLabProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: demo (klikanie „Policz kolumnę” na w pełni narrowanym
 * przykładzie z łańcuchem przeniesień) + dwie samodzielne rundy wyboru cyfry
 * wyniku — ta sama struktura co `<ColumnAdditionLab>`/`<ColumnSubtractionLab>`,
 * ale mnożnik jest zapisywany tylko raz, pod kolumną jedności (`bottom` ma
 * wartość wyłącznie w tej jednej kolumnie), a przeniesienie — inaczej niż
 * przy dodawaniu, gdzie zawsze wynosi 0 albo 1 — może urosnąć aż do 8,
 * bo `9 × 9 = 81` to największy możliwy iloczyn dwóch cyfr.
 */
export function ColumnMultiplicationLab({ color, onComplete }: ColumnMultiplicationLabProps) {
  const [phase, setPhase] = useState(0);
  const containerRef = useSectionScrollAnchor(phase);
  const phaseCount = 1 + ROUNDS.length;

  const advance = () => {
    if (phase + 1 < phaseCount) {
      setPhase((p) => p + 1);
      return;
    }
    onComplete?.();
    setPhase((p) => p + 1);
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        {Array.from({ length: phaseCount }, (_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= phase ? color : `${color}26` }}
          />
        ))}
      </div>

      {phase === 0 && <DemoPhase color={color} onDone={advance} />}
      {phase >= 1 && phase <= ROUNDS.length && (
        <PracticeRound
          key={phase}
          color={color}
          roundIndex={phase - 1}
          round={ROUNDS[phase - 1]}
          isLast={phase === ROUNDS.length}
          onDone={advance}
        />
      )}
    </div>
  );
}

function DemoPhase({ color, onDone }: { color: string; onDone: () => void }) {
  const steps = useMemo(() => buildMultiplicationSteps(DEMO.a, DEMO.multiplier), []);
  const [revealed, setRevealed] = useState(0);
  const finished = revealed >= steps.length;
  const cells = buildCells(steps, DEMO.multiplier, revealed);
  const result = DEMO.a * DEMO.multiplier;

  return (
    <div>
      <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
        Obejrzyj, jak {DEMO.a} × {DEMO.multiplier} liczy się kolumna po kolumnie — tu przeniesienie
        urośnie do 4, a potem do 2, więc widać, że wcale nie musi być zawsze „1”.
      </p>

      <div className="mb-4 flex justify-center overflow-x-auto">
        <ColumnGrid
          color={color}
          operator="×"
          cells={cells}
          showPlaceLabels
          reserveAnnotationRow
          ariaLabel={`Mnożenie pisemne ${DEMO.a} razy ${DEMO.multiplier}`}
        />
      </div>

      <div className="mb-4 flex min-h-[4.5rem] items-center justify-center">
        <AnimatePresence mode="wait">
          {!finished ? (
            <motion.p
              key={revealed}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-lg text-center text-sm leading-relaxed sm:text-base"
            >
              {stepNarrative(steps[revealed], DEMO.multiplier)}
            </motion.p>
          ) : (
            <motion.p
              key="done"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center font-mono text-lg font-black tabular-nums"
              style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
            >
              {DEMO.a} × {DEMO.multiplier} = {result}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center">
        {!finished ? (
          <Button onClick={() => setRevealed((r) => r + 1)} className="gap-2">
            <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
            Policz kolumnę: {steps[revealed].place}
          </Button>
        ) : (
          <Button onClick={onDone} className="gap-1.5">
            Spróbuj sam/a
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface PracticeRoundProps {
  color: string;
  roundIndex: number;
  round: { a: number; multiplier: number };
  isLast: boolean;
  onDone: () => void;
}

function PracticeRound({ color, roundIndex, round, isLast, onDone }: PracticeRoundProps) {
  const steps = useMemo(() => buildMultiplicationSteps(round.a, round.multiplier), [round.a, round.multiplier]);
  const [solvedCount, setSolvedCount] = useState(0);
  const [wrongValue, setWrongValue] = useState<number | null>(null);
  const finished = solvedCount === steps.length;
  const currentStep = steps[solvedCount];
  const cells = buildCells(steps, round.multiplier, solvedCount);

  const options = useMemo(() => {
    if (!currentStep) return [];
    const values = [currentStep.resultDigit, ...decoysFor(currentStep)];
    // Poprawna odpowiedź nie zawsze na tej samej pozycji.
    const rotation = (roundIndex + solvedCount) % values.length;
    const rotated = [...values.slice(rotation), ...values.slice(0, rotation)];
    return rotated.map((value) => ({ value, isCorrect: value === currentStep.resultDigit }));
  }, [currentStep, roundIndex, solvedCount]);

  const pick = (value: number, isCorrect: boolean) => {
    if (wrongValue !== null) return;
    if (isCorrect) {
      setSolvedCount((c) => c + 1);
      return;
    }
    setWrongValue(value);
    setTimeout(() => setWrongValue(null), 600);
  };

  return (
    <div>
      <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
        Runda {roundIndex + 1}: {round.a} × {round.multiplier}. Wybierz cyfrę, którą zapiszesz w
        kolumnie <strong>{currentStep ? currentStep.place : ''}</strong>.
      </p>

      <div className="mb-4 flex justify-center overflow-x-auto">
        <ColumnGrid
          color={color}
          operator="×"
          cells={cells}
          showPlaceLabels
          reserveAnnotationRow
          ariaLabel={`Runda ${roundIndex + 1} — mnożenie pisemne ${round.a} razy ${round.multiplier}`}
        />
      </div>

      <div className="min-h-[6rem]">
        {!finished ? (
          <div className="grid grid-cols-3 gap-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => pick(option.value, option.isCorrect)}
                className={cn(
                  'flex items-center justify-center border-2 px-3 py-3 font-mono text-lg font-bold tabular-nums transition-all',
                  wrongValue === option.value
                    ? 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                    : 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={wrongValue === option.value ? undefined : { borderColor: `${color}55`, color }}
              >
                {wrongValue === option.value && <X className="mr-1 h-4 w-4 shrink-0" aria-hidden />}
                {option.value}
              </button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold sm:text-base" style={{ color }}>
              <Check className="h-4 w-4 shrink-0" aria-hidden />
              {round.a} × {round.multiplier} = {round.a * round.multiplier}
            </p>
            <Button onClick={onDone} className="gap-1.5">
              {isLast ? 'Zakończ' : 'Następna runda'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
