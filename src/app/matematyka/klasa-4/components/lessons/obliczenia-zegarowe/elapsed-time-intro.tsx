'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { ClockJumps } from './clock-jumps';
import { buildTimeJumps, formatDuration, totalMinutes, type TimeJump } from '../../../lib/time';
import { digital24 } from '../../../lib/clock';

interface Moment {
  h: number;
  m: number;
}

const DEMO: { start: Moment; end: Moment } = { start: { h: 8, m: 40 }, end: { h: 11, m: 15 } };

const ROUNDS: { start: Moment; end: Moment }[] = [
  { start: { h: 14, m: 20 }, end: { h: 16, m: 5 } },
  { start: { h: 10, m: 0 }, end: { h: 12, m: 40 } },
];

const PHASE_COUNT = 1 + ROUNDS.length;

interface ElapsedTimeIntroProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: demo (klikanie „Pokaż kolejny skok" na jednym, w pełni
 * rozwiązanym przykładzie) + dwie samodzielne rundy, w których dziecko samo
 * wybiera kolejny skok spośród trzech chipów (poprawny + dwa zwodnicze) —
 * ta sama filozofia „żadnego złego kliknięcia, tylko spróbuj ponownie" co w
 * `<FactTriangle>`/`<RomanForgeIntro>`, tu zastosowana do budowania skoków
 * po tarczy zegara zamiast po osi liczbowej czy symbolach rzymskich.
 */
export function ElapsedTimeIntro({ color, onComplete }: ElapsedTimeIntroProps) {
  const [phase, setPhase] = useState(0);
  const containerRef = useSectionScrollAnchor(phase);

  const advance = () => {
    if (phase + 1 < PHASE_COUNT) {
      setPhase((p) => p + 1);
      return;
    }
    onComplete?.();
    setPhase((p) => p + 1);
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        {Array.from({ length: PHASE_COUNT }, (_, i) => (
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
  const jumps = useMemo(() => buildTimeJumps(totalMinutes(DEMO.start.h, DEMO.start.m), totalMinutes(DEMO.end.h, DEMO.end.m)), []);
  const [revealedCount, setRevealedCount] = useState(0);
  const finished = revealedCount === jumps.length;
  const totalDelta = jumps.reduce((sum, j) => sum + j.deltaMinutes, 0);

  return (
    <div>
      <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
        Pamiętasz skoki po osi liczbowej z pierwszego modułu? Tu zrobimy to samo, ale po tarczy
        zegara — od <strong>{digital24(DEMO.start.h, DEMO.start.m)}</strong> do{' '}
        <strong>{digital24(DEMO.end.h, DEMO.end.m)}</strong>.
      </p>

      <ClockJumps
        color={color}
        jumps={jumps}
        revealedCount={revealedCount}
        ariaLabel={`Zegar pokazujący skoki od ${digital24(DEMO.start.h, DEMO.start.m)} do ${digital24(DEMO.end.h, DEMO.end.m)}`}
      />

      <div className="mt-4 min-h-[3rem]">
        <AnimatePresence mode="wait">
          {revealedCount > 0 && !finished && (
            <motion.p
              key={revealedCount}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm leading-relaxed sm:text-base"
            >
              {jumps[revealedCount - 1].caption}
            </motion.p>
          )}
          {finished && (
            <motion.p
              key="final"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm font-semibold leading-relaxed sm:text-base"
              style={{ color }}
            >
              {digital24(DEMO.start.h, DEMO.start.m)} → {digital24(DEMO.end.h, DEMO.end.m)} to razem{' '}
              {formatDuration(totalDelta)}.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex justify-center">
        {!finished ? (
          <Button onClick={() => setRevealedCount((c) => c + 1)} className="gap-2">
            <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
            Pokaż kolejny skok
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

function decoysFor(jump: TimeJump): number[] {
  const step = jump.kind === 'hours' ? 60 : 5;
  const correct = jump.deltaMinutes;
  const candidates = [correct - step, correct + step, correct - step * 2, correct + step * 2].filter(
    (n) => n > 0 && n !== correct
  );
  const seen = new Set<number>();
  const result: number[] = [];
  for (const c of candidates) {
    if (seen.has(c)) continue;
    seen.add(c);
    result.push(c);
    if (result.length === 2) break;
  }
  return result;
}

function labelFor(kind: TimeJump['kind'], deltaMinutes: number): string {
  return kind === 'hours' ? `+${deltaMinutes / 60} h` : `+${deltaMinutes} min`;
}

interface PracticeRoundProps {
  color: string;
  roundIndex: number;
  round: { start: Moment; end: Moment };
  isLast: boolean;
  onDone: () => void;
}

function PracticeRound({ color, roundIndex, round, isLast, onDone }: PracticeRoundProps) {
  const jumps = useMemo(
    () => buildTimeJumps(totalMinutes(round.start.h, round.start.m), totalMinutes(round.end.h, round.end.m)),
    [round.start.h, round.start.m, round.end.h, round.end.m]
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [wrongId, setWrongId] = useState<number | null>(null);
  const finished = stepIndex === jumps.length;
  const totalDelta = jumps.reduce((sum, j) => sum + j.deltaMinutes, 0);
  const currentJump = jumps[stepIndex];

  const options = useMemo(() => {
    if (!currentJump) return [];
    const values = [currentJump.deltaMinutes, ...decoysFor(currentJump)];
    // Poprawna odpowiedź nie zawsze na tej samej pozycji.
    const rotation = (roundIndex + stepIndex) % values.length;
    const rotated = [...values.slice(rotation), ...values.slice(0, rotation)];
    return rotated.map((value) => ({
      value,
      isCorrect: value === currentJump.deltaMinutes,
      label: labelFor(currentJump.kind, value),
    }));
  }, [currentJump, roundIndex, stepIndex]);

  const pick = (value: number, isCorrect: boolean) => {
    if (wrongId !== null) return;
    if (isCorrect) {
      setStepIndex((i) => i + 1);
      return;
    }
    setWrongId(value);
    setTimeout(() => setWrongId(null), 600);
  };

  return (
    <div>
      <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
        Runda {roundIndex + 1}: od <strong>{digital24(round.start.h, round.start.m)}</strong> do{' '}
        <strong>{digital24(round.end.h, round.end.m)}</strong>. Wybierz kolejny skok.
      </p>

      <ClockJumps
        color={color}
        jumps={jumps}
        revealedCount={stepIndex}
        ariaLabel={`Zegar — runda ${roundIndex + 1}, od ${digital24(round.start.h, round.start.m)} do ${digital24(round.end.h, round.end.m)}`}
      />

      <div className="mt-4 min-h-[6rem]">
        {!finished ? (
          <div className="grid grid-cols-3 gap-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => pick(option.value, option.isCorrect)}
                className={cn(
                  'flex items-center justify-center gap-1.5 border-2 px-3 py-3 font-mono text-base font-bold tabular-nums transition-all sm:text-lg',
                  wrongId === option.value
                    ? 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                    : 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={wrongId === option.value ? undefined : { borderColor: `${color}55`, color }}
              >
                {wrongId === option.value && <X className="h-4 w-4 shrink-0" aria-hidden />}
                {option.label}
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
              Zgadza się: {formatDuration(totalDelta)}.
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
