'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { scaleDecimal, type DecimalScaling, type ScalingOp } from '../../../lib/decimal-scaling';

interface WorkedExample {
  id: string;
  input: string;
  op: ScalingOp;
  question: string;
  steps: string[];
}

const EXAMPLES: WorkedExample[] = [
  {
    id: 'x100-dopisz-zero',
    input: '2,6',
    op: 'x100',
    question: 'Jedna butelka soku kosztuje 2,6 zł. Ile kosztuje 100 butelek?',
    steps: [
      '100 ma dwa zera, więc przecinek przeskakuje o 2 miejsca w prawo.',
      '2,6 → cyfry to 2 i 6. Po przeskoku przecinek stoi za szóstką: 26, a dalej brakuje jednego miejsca.',
      'Brakujące miejsce dopełniamy zerem: 260. Sto butelek kosztuje 260 zł.',
    ],
  },
  {
    id: 'd10-bez-dopisania',
    input: '38,4',
    op: 'd10',
    question: '10 jednakowych batonów waży razem 38,4 dag. Ile waży jeden baton?',
    steps: [
      '10 ma jedno zero, więc przecinek przeskakuje o 1 miejsce w lewo.',
      '38,4 → przecinek wchodzi między 3 a 8: 3,84.',
      'Wszystkie miejsca są zajęte cyframi — nic nie trzeba dopisywać. Jeden baton waży 3,84 dag.',
    ],
  },
  {
    id: 'd100-zero-z-przodu',
    input: '7',
    op: 'd100',
    question: '100 jednakowych spinaczy waży 7 g. Ile waży jeden spinacz?',
    steps: [
      '100 ma dwa zera, więc przecinek przeskakuje o 2 miejsca w lewo.',
      '7 to jedna cyfra. Przecinek wychodzi przed nią — powstaje zapis „,07”.',
      'Przed przecinkiem musi coś stać: dopisujemy 0. Jeden spinacz waży 0,07 g.',
    ],
  },
];

interface ScaleShiftStepsProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: trzy gotowe działania przez 10/100/1000, rozpisane krok po kroku. */
export function ScaleShiftSteps({ color, onComplete }: ScaleShiftStepsProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;
  const scaling = useMemo(() => scaleDecimal(example.input, example.op), [example.input, example.op]);

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setRevealed(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
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

      <p
        className="mb-2 text-center font-mono text-2xl font-black tabular-nums sm:text-3xl"
        style={{ color }}
      >
        {scaling.inputText} {scaling.meta.label.replace('·', '×').replace(':', '÷')}
      </p>
      <p className="mb-4 text-sm leading-relaxed sm:text-base">{example.question}</p>

      <HopStrip scaling={scaling} color={color} revealed={revealed} />

      {!revealed ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Zap className="h-4 w-4" aria-hidden />
            Pokaż rozwiązanie
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 dark:bg-emerald-950/40 sm:p-5"
        >
          <ol className="space-y-2">
            {example.steps.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100"
              >
                <span className="mt-0.5 w-5 shrink-0 font-mono text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 border-t border-emerald-200/60 pt-3 font-mono text-base font-bold text-emerald-800 dark:border-emerald-800/60 dark:text-emerald-200">
            {scaling.inputText} {scaling.meta.label.replace('·', '×').replace(':', '÷')} ={' '}
            {scaling.resultText}
          </p>
        </motion.div>
      )}

      {revealed && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
            {isLast ? 'Do ćwiczeń' : 'Kolejny przykład'}
          </Button>
        </div>
      )}
    </div>
  );
}

/** Pasek cyfr z zaznaczonym przeskokiem przecinka (przed → po) i dopisanymi zerami. */
function HopStrip({
  scaling,
  color,
  revealed,
}: {
  scaling: DecimalScaling;
  color: string;
  revealed: boolean;
}) {
  const commaPos = revealed ? scaling.commaTo : scaling.commaFrom;
  const STRIDE = 40;
  const GAP = 4;
  const rowWidth = scaling.cells.length * STRIDE + (scaling.cells.length - 1) * GAP;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex justify-center overflow-x-auto">
        <div className="relative" style={{ width: rowWidth }}>
          {/* Przecinek „przed" — wyszarzony, tylko po odsłonięciu, na linii cyfr */}
          {revealed && scaling.commaFrom < scaling.cells.length && (
            <span
              className="pointer-events-none absolute left-0 top-0 flex h-12 w-4 items-center justify-center text-2xl font-black leading-none text-muted-foreground/50"
              style={{ transform: `translateX(${scaling.commaFrom * (STRIDE + GAP) - 8}px)` }}
              aria-hidden
            >
              ,
            </span>
          )}
          {/* Przecinek „teraz" — na linii cyfr; znika, gdy wychodzi poza ostatnią komórkę */}
          <motion.span
            className="pointer-events-none absolute left-0 top-0 z-10 flex h-12 w-4 items-center justify-center text-2xl font-black leading-none"
            style={{ color }}
            initial={false}
            animate={{
              x: commaPos * (STRIDE + GAP) - 8,
              opacity: commaPos >= scaling.cells.length ? 0 : 1,
            }}
            transition={{
              x: { type: 'spring', stiffness: 160, damping: 18 },
              opacity: { duration: 0.2 },
            }}
            aria-hidden
          >
            ,
          </motion.span>

          <div className="flex gap-1">
            {scaling.cells.map((cell, i) => {
              const show = !cell.added || revealed;
              return (
                <span
                  key={i}
                  className={cn(
                    'flex h-12 w-10 items-center justify-center border font-mono text-xl font-bold tabular-nums sm:text-2xl',
                    cell.added && show && 'border-2'
                  )}
                  style={{
                    borderColor: cell.added && show ? color : `${color}33`,
                    backgroundColor: cell.added && show ? `${color}14` : undefined,
                    color: cell.added ? color : `color-mix(in oklch, ${color} 92%, black)`,
                    visibility: cell.added && !show ? 'hidden' : undefined,
                  }}
                >
                  {cell.char}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      {revealed && (
        <p className="flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
          {scaling.direction === 'right' ? (
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          )}
          przecinek o {scaling.hops} {scaling.direction === 'right' ? 'w prawo' : 'w lewo'}
          {scaling.zerosToFill > 0 &&
            ` · dopisane ${scaling.zerosToFill === 1 ? 'zero' : 'zera'}: ${scaling.zerosToFill}`}
        </p>
      )}
    </div>
  );
}
