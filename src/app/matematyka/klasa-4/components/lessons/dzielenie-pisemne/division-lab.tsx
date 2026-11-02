'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { DivisionLedger } from './division-ledger';
import { buildLongDivisionSteps, type DivisionStep } from '../../../lib/long-division';

/** Demo: klasyczny, bezpułapkowy przypadek — od razu widać mechanikę bez dodatkowej złożoności. */
const DEMO = { dividend: 936, divisor: 4 };
/** Runda 1: rozgrzewa wybieranie cyfry ilorazu bez żadnych komplikacji. Runda 2: pierwsza cyfra dzielnej jest za mała, więc trzeba złączyć dwie cyfry na start — główne wyzwanie tego kroku. */
const ROUNDS = [
  { dividend: 639, divisor: 3 },
  { dividend: 216, divisor: 6 },
];

function stepNarrative(step: DivisionStep, divisor: number): string {
  const brought = step.broughtDownDigits.join('');
  const lead =
    step.index === 0
      ? step.broughtDownDigits.length > 1
        ? `Sama pierwsza cyfra jest mniejsza od ${divisor}, więc biorę od razu dwie: ${brought}.`
        : `Zaczynam od pierwszej cyfry dzielnej: ${brought}.`
      : `Znoszę kolejną cyfrę i doklejam ją do reszty — razem daje to ${step.currentValue}.`;
  const compute = `${step.currentValue} : ${divisor} = ${step.quotientDigit}, bo ${step.quotientDigit} × ${divisor} = ${step.product}. Zostaje reszta ${step.remainder}.`;
  const trap =
    step.quotientDigit === 0
      ? ` Uwaga: ${step.currentValue} jest mniejsze niż ${divisor}, więc w ilorazie MUSI się pojawić 0 — i od razu znoszę kolejną cyfrę.`
      : '';
  return `${lead} ${compute}${trap}`;
}

function decoysFor(step: DivisionStep): number[] {
  const correct = step.quotientDigit;
  const pool = [correct + 1, correct - 1, correct + 2].filter((n) => n >= 0 && n <= 9 && n !== correct);
  return [...new Set(pool)].slice(0, 2);
}

interface DivisionLabProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: demo (klikanie „Policz krok” na w pełni narrowanym przykładzie)
 * + dwie samodzielne rundy wyboru cyfry ilorazu — ta sama struktura co
 * `<ColumnMultiplicationLab>`, tylko wizualizacja to `<DivisionLedger>`
 * zamiast `<ColumnGrid>`, bo dzielenie liczy się od lewej i ma zmienną
 * liczbę kroków (patrz komentarz w `lib/long-division.ts`).
 */
export function DivisionLab({ color, onComplete }: DivisionLabProps) {
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
        <PracticeRound key={phase} color={color} roundIndex={phase - 1} round={ROUNDS[phase - 1]} isLast={phase === ROUNDS.length} onDone={advance} />
      )}
    </div>
  );
}

function DemoPhase({ color, onDone }: { color: string; onDone: () => void }) {
  const result = useMemo(() => buildLongDivisionSteps(DEMO.dividend, DEMO.divisor), []);
  const [revealed, setRevealed] = useState(0);
  const finished = revealed >= result.steps.length;
  const activeStep = result.steps[revealed];

  return (
    <div>
      <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
        Obejrzyj, jak {DEMO.dividend} : {DEMO.divisor} liczy się krok po kroku — inaczej niż w
        dodawaniu czy mnożeniu, dzielenie zaczyna się od LEWEJ, od najstarszej cyfry.
      </p>

      <div className="mb-4 flex justify-center overflow-x-auto">
        <DivisionLedger
          color={color}
          dividendDigits={result.dividendDigits}
          divisor={DEMO.divisor}
          steps={result.steps}
          revealedCount={revealed}
          highlightDigitIndex={activeStep?.digitIndex ?? null}
          ariaLabel={`Dzielenie pisemne ${DEMO.dividend} przez ${DEMO.divisor}`}
        />
      </div>

      <div className="mb-4 flex min-h-[5rem] items-center justify-center">
        <AnimatePresence mode="wait">
          {!finished ? (
            <motion.p
              key={revealed}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-lg text-center text-sm leading-relaxed sm:text-base"
            >
              {stepNarrative(activeStep, DEMO.divisor)}
            </motion.p>
          ) : (
            <motion.p
              key="done"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center font-mono text-lg font-black tabular-nums"
              style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
            >
              {DEMO.dividend} : {DEMO.divisor} = {result.quotient} r {result.remainder}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center">
        {!finished ? (
          <Button onClick={() => setRevealed((r) => r + 1)} className="gap-2">
            <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
            Policz krok {revealed + 1}
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
  round: { dividend: number; divisor: number };
  isLast: boolean;
  onDone: () => void;
}

function PracticeRound({ color, roundIndex, round, isLast, onDone }: PracticeRoundProps) {
  const result = useMemo(() => buildLongDivisionSteps(round.dividend, round.divisor), [round.dividend, round.divisor]);
  const [solvedCount, setSolvedCount] = useState(0);
  const [wrongValue, setWrongValue] = useState<number | null>(null);
  const finished = solvedCount === result.steps.length;
  const currentStep = result.steps[solvedCount];

  const options = useMemo(() => {
    if (!currentStep) return [];
    const values = [currentStep.quotientDigit, ...decoysFor(currentStep)];
    const rotation = (roundIndex + solvedCount) % values.length;
    const rotated = [...values.slice(rotation), ...values.slice(0, rotation)];
    return rotated.map((value) => ({ value, isCorrect: value === currentStep.quotientDigit }));
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
        Runda {roundIndex + 1}: {round.dividend} : {round.divisor}. Wybierz cyfrę, którą zapiszesz w
        ilorazie{currentStep?.quotientDigit === 0 ? ' — uważaj, tu może być pułapka' : ''}.
      </p>

      <div className="mb-4 flex justify-center overflow-x-auto">
        <DivisionLedger
          color={color}
          dividendDigits={result.dividendDigits}
          divisor={round.divisor}
          steps={result.steps}
          revealedCount={solvedCount}
          highlightDigitIndex={currentStep?.digitIndex ?? null}
          ariaLabel={`Runda ${roundIndex + 1} — dzielenie pisemne ${round.dividend} przez ${round.divisor}`}
        />
      </div>

      <div className="min-h-[6rem]">
        {!finished ? (
          <div className="mx-auto grid max-w-xs grid-cols-3 gap-2">
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
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 text-center">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold sm:text-base" style={{ color }}>
              <Check className="h-4 w-4 shrink-0" aria-hidden />
              {round.dividend} : {round.divisor} = {result.quotient} r {result.remainder}
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
