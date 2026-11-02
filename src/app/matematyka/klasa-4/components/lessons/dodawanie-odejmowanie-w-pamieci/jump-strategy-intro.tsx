'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { JumpLine } from './jump-line';

interface DemoPhase {
  kind: 'demo';
  id: string;
  start: number;
  target: number;
  /** Skoki odsłaniane jeden po drugim przyciskiem „Pokaż skok”. */
  sequence: number[];
  /** Tekst pod skoczkiem: [0] przed pierwszym skokiem, potem po każdym kolejnym. */
  explain: string[];
}

interface PracticePhase {
  kind: 'practice';
  id: string;
  start: number;
  target: number;
  prompt: string;
  /** Dwa poprawne skoki + dwa dystraktory — dziecko samo wybiera, które i w jakiej kolejności kliknąć. */
  chips: { id: string; delta: number }[];
}

type Phase = DemoPhase | PracticePhase;

const PHASES: Phase[] = [
  {
    kind: 'demo',
    id: 'demo-dodawanie',
    start: 47,
    target: 73,
    sequence: [20, 6],
    explain: [
      'Chcemy policzyć 47 + 26. Rozkładamy 26 na dziesiątki i jedności: 20 i 6.',
      'Najpierw duży skok: +20. Dziesiątki dodaje się prosto, bez przekraczania progu: 47 + 20 = 67.',
      'Teraz mały skok: +6. 67 + 6 = 73 — dokładnie tyle, ile miało wyjść.',
    ],
  },
  {
    kind: 'practice',
    id: 'practice-dodawanie',
    start: 38,
    target: 63,
    prompt: 'Twoja kolej: dolicz 25 do 38. Wybierz dwa skoki, które razem dadzą dokładnie 25.',
    chips: [
      { id: 'a', delta: 5 },
      { id: 'b', delta: 30 },
      { id: 'c', delta: 20 },
      { id: 'd', delta: 2 },
    ],
  },
  {
    kind: 'demo',
    id: 'demo-odejmowanie',
    start: 82,
    target: 35,
    sequence: [-40, -7],
    explain: [
      'Teraz odejmowanie: 82 − 47. Odejmowaną liczbę też rozkładamy: 40 i 7.',
      'Duży skok w lewo: −40. 82 − 40 = 42.',
      'Mały skok: −7. 42 − 7 = 35. Ta sama sztuczka działa w obie strony.',
    ],
  },
  {
    kind: 'practice',
    id: 'practice-odejmowanie',
    start: 91,
    target: 55,
    prompt: 'Twoja kolej: odejmij 36 od 91. Wybierz dwa skoki, które razem dadzą dokładnie 36.',
    chips: [
      { id: 'a', delta: -6 },
      { id: 'b', delta: -40 },
      { id: 'c', delta: -30 },
      { id: 'd', delta: -3 },
    ],
  },
];

interface JumpStrategyIntroProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: strategia "pustej osi liczbowej" — rozkładanie liczby na dziesiątki
 * i jedności, a potem doskakiwanie do wyniku skok po skoku. Dwa pokazy (dodawanie,
 * odejmowanie) na przemian z dwoma samodzielnymi próbami na tym samym `<JumpLine>`.
 */
export function JumpStrategyIntro({ color, onComplete }: JumpStrategyIntroProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [taken, setTaken] = useState<string[]>([]);
  const containerRef = useSectionScrollAnchor(phaseIndex);

  const phase = PHASES[phaseIndex];
  const isLastPhase = phaseIndex === PHASES.length - 1;

  const jumps =
    phase.kind === 'demo'
      ? phase.sequence.slice(0, revealed)
      : taken.map((id) => phase.chips.find((chip) => chip.id === id)!.delta);

  const current = jumps.reduce((sum, delta) => sum + delta, phase.start);
  const solved = current === phase.target;
  const direction = phase.target > phase.start ? 1 : -1;
  const overshoot = phase.kind === 'practice' && (direction === 1 ? current > phase.target : current < phase.target);

  const goToNextPhase = () => {
    if (isLastPhase) {
      onComplete?.();
      return;
    }
    setPhaseIndex((prev) => prev + 1);
    setRevealed(0);
    setTaken([]);
  };

  const revealNext = () => {
    if (phase.kind !== 'demo') return;
    setRevealed((prev) => Math.min(phase.sequence.length, prev + 1));
  };

  const pickChip = (chipId: string) => {
    if (phase.kind !== 'practice' || taken.includes(chipId)) return;
    setTaken((prev) => [...prev, chipId]);
  };

  const undoLast = () => {
    setTaken((prev) => prev.slice(0, -1));
  };

  const demoFullyRevealed = phase.kind === 'demo' && revealed === phase.sequence.length;

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {/* Kropki postępu przez 4 fazy */}
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
        <p className="mb-4 text-sm leading-relaxed sm:text-base">{phase.explain[revealed]}</p>
      ) : (
        <p className="mb-4 text-sm leading-relaxed sm:text-base">{phase.prompt}</p>
      )}

      <JumpLine
        start={phase.start}
        target={phase.target}
        jumps={jumps}
        color={color}
        ariaLabel={`Pusta oś liczbowa: od ${phase.start} do ${phase.target}`}
        className="mb-4"
      />

      {phase.kind === 'practice' && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {phase.chips.map((chip) => {
            const used = taken.includes(chip.id);
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => pickChip(chip.id)}
                disabled={used || solved}
                className={cn(
                  'border px-4 py-2 font-mono text-sm font-bold tabular-nums transition-all disabled:cursor-not-allowed',
                  used ? 'opacity-35' : 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={{ borderColor: `${color}59`, color: used ? undefined : color }}
              >
                {chip.delta >= 0 ? '+' : '−'}
                {Math.abs(chip.delta)}
              </button>
            );
          })}
          {taken.length > 0 && !solved && (
            <button
              type="button"
              onClick={undoLast}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Cofnij ostatni skok
            </button>
          )}
        </div>
      )}

      {overshoot && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
        >
          Za daleko! Cofnij ostatni skok i spróbuj innej wielkości.
        </motion.p>
      )}

      {solved && phase.kind === 'practice' && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          Dokładnie w cel — {Math.abs(phase.target - phase.start)} rozłożone na{' '}
          {taken.map((id) => Math.abs(phase.chips.find((c) => c.id === id)!.delta)).join(' i ')}.
        </motion.p>
      )}

      <div className="flex justify-end">
        {phase.kind === 'demo' && !demoFullyRevealed && (
          <Button onClick={revealNext}>Pokaż skok</Button>
        )}
        {phase.kind === 'demo' && demoFullyRevealed && (
          <Button onClick={goToNextPhase} className="gap-1.5">
            {isLastPhase ? 'Zakończ' : 'Dalej'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        {phase.kind === 'practice' && solved && (
          <Button onClick={goToNextPhase} className="gap-1.5">
            {isLastPhase ? 'Zakończ' : 'Dalej'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
