'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { CalendarTrail } from './calendar-trail';
import { MONTH_NAMES, buildDateJumps, formatWeeksAndDays, type DateJump } from '../../../lib/calendar';

interface DatePoint {
  day: number;
  monthIndex: number;
}

const YEAR = 2026;
const DEMO: { from: DatePoint; to: DatePoint } = {
  from: { day: 5, monthIndex: 6 }, // 5 lipca
  to: { day: 2, monthIndex: 8 }, // 2 września — po drodze cały sierpień
};

const ROUNDS: { from: DatePoint; to: DatePoint }[] = [
  { from: { day: 20, monthIndex: 8 }, to: { day: 8, monthIndex: 9 } }, // 20 wrz → 8 paź, sąsiednie miesiące
  { from: { day: 10, monthIndex: 9 }, to: { day: 15, monthIndex: 11 } }, // 10 paź → 15 gru, cały listopad po drodze
];

const PHASE_COUNT = 1 + ROUNDS.length;

const dateLabel = (p: DatePoint) => `${p.day} ${MONTH_NAMES[p.monthIndex]}`;

interface CalendarTrailIntroProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: demo (klikanie „Pokaż kolejny odcinek” na w pełni
 * rozwiązanym przykładzie, celowo z całym miesiącem po drodze) + dwie
 * samodzielne rundy, w których dziecko wybiera długość kolejnego odcinka
 * spośród trzech chipów (poprawny + dwa zwodnicze) — ta sama filozofia
 * „żadnego złego kliknięcia, tylko spróbuj ponownie” co w
 * `<ElapsedTimeIntro>`, tu zastosowana do prawdziwego kalendarza zamiast
 * tarczy zegara.
 */
export function CalendarTrailIntro({ color, onComplete }: CalendarTrailIntroProps) {
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
  const jumps = useMemo(
    () => buildDateJumps(DEMO.from.day, DEMO.from.monthIndex, DEMO.to.day, DEMO.to.monthIndex, YEAR),
    []
  );
  const [revealedCount, setRevealedCount] = useState(0);
  const finished = revealedCount === jumps.length;
  const totalDelta = jumps.reduce((sum, j) => sum + j.deltaDays, 0);

  return (
    <div>
      <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
        Pamiętasz skoki po osi liczbowej i po tarczy zegara? Tu zrobimy to samo po prawdziwym
        kalendarzu — od <strong>{dateLabel(DEMO.from)}</strong> do <strong>{dateLabel(DEMO.to)}</strong>,
        a po drodze cały jeden miesiąc.
      </p>

      <CalendarTrail
        color={color}
        fromDay={DEMO.from.day}
        fromMonthIndex={DEMO.from.monthIndex}
        toDay={DEMO.to.day}
        year={YEAR}
        jumps={jumps}
        revealedCount={revealedCount}
        ariaLabel={`Kalendarz pokazujący odcinek od ${dateLabel(DEMO.from)} do ${dateLabel(DEMO.to)}`}
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
              {dateLabel(DEMO.from)} → {dateLabel(DEMO.to)} to razem {totalDelta} dni, czyli{' '}
              {formatWeeksAndDays(totalDelta)}.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex justify-center">
        {!finished ? (
          <Button onClick={() => setRevealedCount((c) => c + 1)} className="gap-2">
            <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
            Pokaż kolejny odcinek
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

function decoysFor(jump: DateJump): number[] {
  const step = 3;
  const correct = jump.deltaDays;
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

interface PracticeRoundProps {
  color: string;
  roundIndex: number;
  round: { from: DatePoint; to: DatePoint };
  isLast: boolean;
  onDone: () => void;
}

function PracticeRound({ color, roundIndex, round, isLast, onDone }: PracticeRoundProps) {
  const jumps = useMemo(
    () => buildDateJumps(round.from.day, round.from.monthIndex, round.to.day, round.to.monthIndex, YEAR),
    [round.from.day, round.from.monthIndex, round.to.day, round.to.monthIndex]
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [wrongValue, setWrongValue] = useState<number | null>(null);
  const finished = stepIndex === jumps.length;
  const totalDelta = jumps.reduce((sum, j) => sum + j.deltaDays, 0);
  const currentJump = jumps[stepIndex];

  const options = useMemo(() => {
    if (!currentJump) return [];
    const values = [currentJump.deltaDays, ...decoysFor(currentJump)];
    // Poprawna odpowiedź nie zawsze na tej samej pozycji.
    const rotation = (roundIndex + stepIndex) % values.length;
    const rotated = [...values.slice(rotation), ...values.slice(0, rotation)];
    return rotated.map((value) => ({ value, isCorrect: value === currentJump.deltaDays }));
  }, [currentJump, roundIndex, stepIndex]);

  const pick = (value: number, isCorrect: boolean) => {
    if (wrongValue !== null) return;
    if (isCorrect) {
      setStepIndex((i) => i + 1);
      return;
    }
    setWrongValue(value);
    setTimeout(() => setWrongValue(null), 600);
  };

  return (
    <div>
      <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
        Runda {roundIndex + 1}: od <strong>{dateLabel(round.from)}</strong> do{' '}
        <strong>{dateLabel(round.to)}</strong>. Wybierz długość kolejnego odcinka.
      </p>

      <CalendarTrail
        color={color}
        fromDay={round.from.day}
        fromMonthIndex={round.from.monthIndex}
        toDay={round.to.day}
        year={YEAR}
        jumps={jumps}
        revealedCount={stepIndex}
        ariaLabel={`Kalendarz — runda ${roundIndex + 1}, od ${dateLabel(round.from)} do ${dateLabel(round.to)}`}
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
                  wrongValue === option.value
                    ? 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                    : 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={wrongValue === option.value ? undefined : { borderColor: `${color}55`, color }}
              >
                {wrongValue === option.value && <X className="h-4 w-4 shrink-0" aria-hidden />}+{option.value} dni
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
              Zgadza się: {totalDelta} dni, czyli {formatWeeksAndDays(totalDelta)}.
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
