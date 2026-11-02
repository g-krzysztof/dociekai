'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { buildTimeJumps, formatDuration, totalMinutes } from '../../../lib/time';
import { digital24 } from '../../../lib/clock';

interface ConvertExample {
  kind: 'convert';
  id: string;
  prompt: string;
  from: number;
  unitFrom: string;
  unitTo: string;
}

interface ElapsedExample {
  kind: 'elapsed';
  id: string;
  label: string;
  start: { h: number; m: number };
  end: { h: number; m: number };
  /** Tylko dla przykładu z pułapką — pokazuje ostrzeżenie przed odsłonięciem poprawnej metody. */
  trapWarning?: string;
}

type Example = ConvertExample | ElapsedExample;

const EXAMPLES: Example[] = [
  { kind: 'convert', id: 'h-na-min', prompt: '3 h = ? min', from: 3, unitFrom: 'h', unitTo: 'min' },
  { kind: 'convert', id: 'min-na-s', prompt: '5 min = ? s', from: 5, unitFrom: 'min', unitTo: 's' },
  {
    kind: 'elapsed',
    id: 'film',
    label: 'Ile trwał film?',
    start: { h: 16, m: 20 },
    end: { h: 18, m: 0 },
  },
  {
    kind: 'elapsed',
    id: 'basen',
    label: 'Zajęcia na basenie: wejście i wyjście',
    start: { h: 15, m: 35 },
    end: { h: 16, m: 10 },
    trapWarning:
      'Częsty błąd: policzyć osobno godziny (16 − 15 = 1) i minuty (10 − 35), pożyczając „1" tak jak przy zwykłym odejmowaniu — i pomylić się, bo tu pożycza się 60, nie 10. Bezpieczniej doliczać, tak jak w kroku wyżej.',
  },
];

interface TimeExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: 4 krótkie zamiany i obliczenia upływu czasu — dwie zamiany jednostek, film bez pułapki i basen z klasyczną pułapką pożyczania. */
export function TimeExamples({ color, onComplete }: TimeExamplesProps) {
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

      {example.kind === 'convert' ? (
        <ConvertCard example={example} color={color} revealed={revealed} onReveal={() => setRevealed(true)} />
      ) : (
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

function ConvertCard({
  example,
  color,
  revealed,
  onReveal,
}: {
  example: ConvertExample;
  color: string;
  revealed: boolean;
  onReveal: () => void;
}) {
  const value = example.from * 60;

  return (
    <div className="text-center">
      <h3 className="mb-5 font-mono text-2xl font-black tracking-wide sm:text-3xl" style={{ color }}>
        {example.prompt}
      </h3>

      {!revealed ? (
        <Button onClick={onReveal}>Sprawdź</Button>
      ) : (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-md text-sm leading-relaxed sm:text-base"
        >
          {example.from} {example.unitFrom} = {example.from} × 60 ={' '}
          <strong style={{ color }}>
            {value} {example.unitTo}
          </strong>{' '}
          — bo {example.unitFrom === 'h' ? 'godzina' : 'minuta'} to 60 {example.unitTo}.
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
  const jumps = buildTimeJumps(totalMinutes(example.start.h, example.start.m), totalMinutes(example.end.h, example.end.m));
  const total = jumps.reduce((sum, j) => sum + j.deltaMinutes, 0);

  return (
    <div className="text-center">
      <p className="mb-1 text-sm font-semibold text-muted-foreground sm:text-base">{example.label}</p>
      <h3 className="mb-4 font-mono text-2xl font-black tracking-wide sm:text-3xl" style={{ color }}>
        {digital24(example.start.h, example.start.m)} → {digital24(example.end.h, example.end.m)}
      </h3>

      {example.trapWarning && (
        <div className="mx-auto mb-4 flex max-w-md items-start gap-2 border border-amber-300 bg-amber-50 p-3 text-left text-xs leading-relaxed text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100 sm:text-sm">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{example.trapWarning}</span>
        </div>
      )}

      {!revealed ? (
        <Button onClick={onReveal}>Policz upływ czasu</Button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
            {jumps.map((jump) => (
              <span
                key={jump.id}
                className="border px-2.5 py-1 font-mono text-xs font-bold tabular-nums sm:text-sm"
                style={{ borderColor: color, color, backgroundColor: `${color}14` }}
              >
                {jump.shortLabel}
              </span>
            ))}
          </div>
          <p className="mx-auto max-w-md text-sm leading-relaxed sm:text-base">
            Doliczasz kolejne skoki — razem{' '}
            <strong style={{ color }}>{formatDuration(total)}</strong>.
          </p>
        </motion.div>
      )}
    </div>
  );
}
