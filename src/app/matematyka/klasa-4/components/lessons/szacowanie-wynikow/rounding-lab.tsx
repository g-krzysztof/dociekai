'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { PLACE_GENITIVE, RoundingMachine, roundToPlace, type RoundingPlace } from './rounding-machine';

interface DemoPhase {
  kind: 'demo';
  id: string;
  value: number;
  place: RoundingPlace;
  lead: string;
}

interface PracticePhase {
  kind: 'practice';
  id: string;
  value: number;
  place: RoundingPlace;
  candidates: number[];
}

type Phase = DemoPhase | PracticePhase;

const PHASES: Phase[] = [
  {
    kind: 'demo',
    id: 'demo-bez-przeniesienia',
    value: 462,
    place: 1,
    lead: 'Zaokrąglamy 462 do pełnych dziesiątek. Kliknij „Zaokrąglij” i patrz, która cyfra decyduje.',
  },
  {
    kind: 'demo',
    id: 'demo-kaskada',
    value: 2996,
    place: 1,
    lead: 'Teraz coś trudniejszego: 2996 do pełnych dziesiątek. Obejrzyj, co się dzieje, gdy przeniesienie „poleci” przez kilka miejsc naraz.',
  },
  {
    kind: 'practice',
    id: 'practice-dziesiatki',
    value: 634,
    place: 1,
    candidates: [630, 640],
  },
  {
    kind: 'practice',
    id: 'practice-setki',
    value: 178,
    place: 2,
    candidates: [100, 200],
  },
  {
    kind: 'practice',
    id: 'practice-tysiace',
    value: 4870,
    place: 3,
    candidates: [4000, 5000],
  },
  {
    kind: 'practice',
    id: 'practice-wzrost',
    value: 950,
    place: 2,
    candidates: [900, 1000],
  },
];

interface RoundingLabProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: dwa pokazy „maszyny zaokrąglającej” (w tym jedna kaskada
 * przeniesień przez kilka miejsc), a potem cztery samodzielne próby —
 * dziecko zgaduje zaokrągloną wartość, zanim zobaczy potwierdzenie.
 */
export function RoundingLab({ color, onComplete }: RoundingLabProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [settled, setSettled] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [guess, setGuess] = useState<number | null>(null);
  const containerRef = useSectionScrollAnchor(phaseIndex);

  const phase = PHASES[phaseIndex];
  const isLastPhase = phaseIndex === PHASES.length - 1;

  const goNext = () => {
    if (isLastPhase) {
      onComplete?.();
      return;
    }
    setPhaseIndex((prev) => prev + 1);
    setSettled(false);
    setResult(null);
    setGuess(null);
  };

  const correctValue = roundToPlace(phase.value, phase.place);

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        {PHASES.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= phaseIndex ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {phaseIndex + 1}/{PHASES.length}
        </span>
      </div>

      <p
        className="mb-1 text-xs font-bold uppercase tracking-[0.15em]"
        style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
      >
        {phase.kind === 'demo' ? 'Pokaz' : 'Twoja kolej'}
      </p>

      {phase.kind === 'demo' ? (
        <p className="mb-5 text-sm leading-relaxed sm:text-base">{phase.lead}</p>
      ) : (
        <p className="mb-5 text-sm leading-relaxed sm:text-base">
          Do ilu zaokrąglisz <strong className="font-mono tabular-nums">{phase.value}</strong> do
          pełnych {PLACE_GENITIVE[phase.place]}? Zgadnij, a potem sprawdź.
        </p>
      )}

      {phase.kind === 'practice' && (
        <div className="mb-5 flex justify-center gap-3">
          {phase.candidates.map((candidate) => {
            const isPicked = guess === candidate;
            const reveal = settled && guess !== null;
            const isCorrect = candidate === correctValue;
            return (
              <button
                key={candidate}
                type="button"
                onClick={() => setGuess(candidate)}
                disabled={guess !== null}
                className={cn(
                  'flex items-center gap-2 border px-6 py-3 font-mono text-lg font-bold tabular-nums transition-all disabled:cursor-not-allowed',
                  !guess && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                  isPicked && !reveal && 'border-2',
                  reveal && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                  reveal && isPicked && !isCorrect && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                  guess !== null && !isPicked && 'opacity-45'
                )}
                style={{ borderColor: isPicked && !reveal ? color : undefined }}
              >
                {reveal && isCorrect && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                {reveal && isPicked && !isCorrect && <X className="h-4 w-4 shrink-0 text-rose-500" />}
                {candidate}
              </button>
            );
          })}
        </div>
      )}

      <RoundingMachine
        key={phase.id}
        value={phase.value}
        place={phase.place}
        color={color}
        disabled={phase.kind === 'practice' && guess === null}
        ariaLabel={`Zaokrąglij ${phase.value} do pełnych ${PLACE_GENITIVE[phase.place]}`}
        onSettle={(value) => {
          setSettled(true);
          setResult(value);
        }}
      />

      {phase.kind === 'practice' && settled && result !== null && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mt-4 p-3 text-center text-sm leading-relaxed',
            guess === result
              ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
              : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
          )}
        >
          <strong>{guess === result ? 'Dokładnie tak! ' : 'Prawie. '}</strong>
          {phase.value} zaokrąglone do pełnych {PLACE_GENITIVE[phase.place]} to {result}.
        </motion.p>
      )}

      {((phase.kind === 'demo' && settled) || (phase.kind === 'practice' && settled && guess !== null)) && (
        <div className="mt-5 flex justify-end">
          <Button onClick={goNext} className="gap-1.5">
            {isLastPhase ? 'Zakończ' : 'Dalej'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
