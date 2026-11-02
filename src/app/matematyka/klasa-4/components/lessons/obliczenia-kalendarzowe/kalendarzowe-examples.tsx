'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { CalendarTrail } from './calendar-trail';
import { MONTH_NAMES, buildDateJumps, formatWeeksAndDays, weeksAndDays } from '../../../lib/calendar';

const YEAR = 2026;

interface DatePoint {
  day: number;
  monthIndex: number;
}

interface WeeksToDaysExample {
  kind: 'weeks-to-days';
  id: string;
  weeks: number;
}

interface DaysToWeeksExample {
  kind: 'days-to-weeks';
  id: string;
  days: number;
}

interface ElapsedExample {
  kind: 'elapsed';
  id: string;
  label: string;
  from: DatePoint;
  to: DatePoint;
  /** Tylko dla przykładu z pułapką — pokazuje ostrzeżenie przed odsłonięciem poprawnej metody. */
  trapWarning?: string;
}

type Example = WeeksToDaysExample | DaysToWeeksExample | ElapsedExample;

const EXAMPLES: Example[] = [
  { kind: 'weeks-to-days', id: 'tyg-na-dni', weeks: 3 },
  { kind: 'days-to-weeks', id: 'dni-na-tyg', days: 23 },
  {
    kind: 'elapsed',
    id: 'listopad-grudzien',
    label: 'Za ile dni zacznie się grudzień?',
    from: { day: 22, monthIndex: 10 },
    to: { day: 1, monthIndex: 11 },
  },
  {
    kind: 'elapsed',
    id: 'styczen-marzec',
    label: 'Ile dni upłynie od 18 stycznia do 5 marca?',
    from: { day: 18, monthIndex: 0 },
    to: { day: 5, monthIndex: 2 },
    trapWarning:
      'Częsty błąd: policzyć „mniej więcej dwa miesiące, czyli około 60 dni” zamiast sprawdzić naprawdę. Luty ma tylko 28 dni (w latach przestępnych 29) — żeby dobrze policzyć, trzeba dodać dni każdego miesiąca osobno, tak jak w kroku wyżej.',
  },
];

const dateLabel = (p: DatePoint) => `${p.day} ${MONTH_NAMES[p.monthIndex]}`;

interface KalendarzoweExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: 4 krótkie zamiany i obliczenia kalendarzowe — dwie zamiany tygodni i dni, jeden upływ dni bez pułapki i jeden z klasyczną pułapką „miesiąc to nie zawsze 30 dni”. */
export function KalendarzoweExamples({ color, onComplete }: KalendarzoweExamplesProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${revealed}`);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setRevealed(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {EXAMPLES.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{EXAMPLES.length}
        </span>
      </div>

      {example.kind === 'weeks-to-days' && (
        <WeeksToDaysCard example={example} color={color} revealed={revealed} onReveal={() => setRevealed(true)} />
      )}
      {example.kind === 'days-to-weeks' && (
        <DaysToWeeksCard example={example} color={color} revealed={revealed} onReveal={() => setRevealed(true)} />
      )}
      {example.kind === 'elapsed' && (
        <ElapsedCard example={example} color={color} revealed={revealed} onReveal={() => setRevealed(true)} />
      )}

      {revealed && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next} className="gap-1.5">
            {isLast ? 'Zakończ' : 'Następny przykład'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function WeeksToDaysCard({
  example,
  color,
  revealed,
  onReveal,
}: {
  example: WeeksToDaysExample;
  color: string;
  revealed: boolean;
  onReveal: () => void;
}) {
  const value = example.weeks * 7;

  return (
    <div className="text-center">
      <h3 className="mb-5 font-mono text-2xl font-black tracking-wide sm:text-3xl" style={{ color }}>
        {example.weeks} {example.weeks === 1 ? 'tydzień' : 'tygodnie'} = ? dni
      </h3>

      {!revealed ? (
        <Button onClick={onReveal}>Sprawdź</Button>
      ) : (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md text-sm leading-relaxed sm:text-base"
        >
          {example.weeks} × 7 = <strong style={{ color }}>{value} dni</strong> — bo każdy tydzień to 7 dni.
        </motion.p>
      )}
    </div>
  );
}

function DaysToWeeksCard({
  example,
  color,
  revealed,
  onReveal,
}: {
  example: DaysToWeeksExample;
  color: string;
  revealed: boolean;
  onReveal: () => void;
}) {
  const { weeks, days } = weeksAndDays(example.days);

  return (
    <div className="text-center">
      <h3 className="mb-5 font-mono text-2xl font-black tracking-wide sm:text-3xl" style={{ color }}>
        {example.days} dni = ? tygodni i ? dni
      </h3>

      {!revealed ? (
        <Button onClick={onReveal}>Sprawdź</Button>
      ) : (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md text-sm leading-relaxed sm:text-base"
        >
          {example.days} : 7 = {weeks} reszta {days} —{' '}
          <strong style={{ color }}>{formatWeeksAndDays(example.days)}</strong>. Dokładnie to samo
          dzielenie z resztą, które znasz z Modułu 1.
        </motion.p>
      )}
    </div>
  );
}

function ElapsedCard({
  example,
  color,
  revealed,
  onReveal,
}: {
  example: ElapsedExample;
  color: string;
  revealed: boolean;
  onReveal: () => void;
}) {
  const jumps = buildDateJumps(example.from.day, example.from.monthIndex, example.to.day, example.to.monthIndex, YEAR);
  const total = jumps.reduce((sum, j) => sum + j.deltaDays, 0);

  return (
    <div className="text-center">
      <p className="mb-1 text-sm font-semibold text-muted-foreground sm:text-base">{example.label}</p>
      <h3 className="mb-4 font-mono text-2xl font-black tracking-wide sm:text-3xl" style={{ color }}>
        {dateLabel(example.from)} → {dateLabel(example.to)}
      </h3>

      {example.trapWarning && (
        <div className="mx-auto mb-4 flex max-w-md items-start gap-2 border border-amber-300 bg-amber-50 p-3 text-left text-xs leading-relaxed text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100 sm:text-sm">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{example.trapWarning}</span>
        </div>
      )}

      {!revealed ? (
        <Button onClick={onReveal}>Policz upływ dni</Button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <CalendarTrail
            color={color}
            fromDay={example.from.day}
            fromMonthIndex={example.from.monthIndex}
            toDay={example.to.day}
            year={YEAR}
            jumps={jumps}
            revealedCount={jumps.length}
            ariaLabel={`Kalendarz — ${example.label}`}
          />
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed sm:text-base">
            Razem <strong style={{ color }}>{total} dni</strong>, czyli {formatWeeksAndDays(total)}.
          </p>
        </motion.div>
      )}
    </div>
  );
}
