'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { toMixed, formatMixed } from '../../../lib/mixed-number';

/** Trzy sposoby domknięcia dzielenia, które nie wychodzi równo. */
type Shape = 'reszta' | 'ulamek' | 'wgore';

interface ShapeSpec {
  label: string;
  hint: string;
}

const SHAPES: Record<Shape, ShapeSpec> = {
  reszta: { label: 'Tyle pełnych, reszta zostaje', hint: 'Iloraz i reszta osobno — resztą nikt się dalej nie zajmuje.' },
  ulamek: { label: 'Resztę dokrawamy — wychodzi ułamek', hint: 'Reszta idzie do licznika: wynik jest liczbą mieszaną.' },
  wgore: { label: 'Zaokrąglamy w górę do pełnej', hint: 'Reszta i tak wymaga jeszcze jednej całej sztuki.' },
};

export interface SwitchRound {
  id: string;
  story: string;
  question: string;
  /** Dzielna i dzielnik — z nich liczą się wszystkie trzy odpowiedzi, żadna nie jest wpisana ręcznie. */
  dividend: number;
  divisor: number;
  correct: Shape;
  /**
   * Jednostka w formie pasującej do każdej z trzech odpowiedzi („3 metry”,
   * „3 1/2 metra”, „4 metry”) — polską odmianę niosą dane, nie kod.
   */
  units: Record<Shape, string>;
  explanation: string;
}

interface RemainderSwitchProps {
  color: string;
  rounds: SwitchRound[];
  onComplete?: () => void;
}

/** Trzy odpowiedzi z tej samej pary liczb — pełne, mieszane i zaokrąglone w górę. */
function answersFor(dividend: number, divisor: number, units: Record<Shape, string>): Record<Shape, string> {
  const whole = Math.floor(dividend / divisor);
  const rest = dividend % divisor;
  return {
    reszta: `${whole} ${units.reszta}, reszta ${rest}`,
    ulamek: `${formatMixed(toMixed(dividend, divisor))} ${units.ulamek}`,
    wgore: `${whole + 1} ${units.wgore}`,
  };
}

/**
 * Zadanie problemowe: **to samo dzielenie, trzy poprawnie policzone
 * odpowiedzi — a wybiera między nimi treść zadania, nie rachunek.** Liczby
 * w każdej rundzie są identyczne dla wszystkich trzech wariantów (liczone
 * jedną funkcją `answersFor`), więc dziecko nie może trafić po arytmetyce:
 * musi przeczytać, o co naprawdę pyta historia.
 *
 * Nowość względem biblioteki: pierwszy widżet w kursie, w którym błędna
 * odpowiedź nie jest źle policzona. Wszystkie dotychczasowe wybory rozstrzygał
 * rachunek albo rysunek (`DiagramAudit` ocenia poprawność schematu,
 * `PlanFitLab` — czy coś się mieści); tu rachunek jest wspólny, a decyduje
 * sens sytuacji.
 */
export function RemainderSwitch({ color, rounds, onComplete }: RemainderSwitchProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Shape | null>(null);
  const containerRef = useSectionScrollAnchor(index);

  const round = rounds[index] ?? rounds[rounds.length - 1];
  const isLast = index === rounds.length - 1;
  const answers = answersFor(round.dividend, round.divisor, round.units);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const order: Shape[] = ['reszta', 'ulamek', 'wgore'];

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    onComplete?.();
  };

  if (index >= rounds.length) return null;

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {rounds.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{rounds.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={round.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
          <p className="mb-3 text-sm leading-relaxed sm:text-base">{round.story}</p>

          {/* Wspólny rachunek — ten sam dla wszystkich trzech odpowiedzi */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3 border p-3" style={{ borderColor: `${color}33` }}>
            <span className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: textColor }}>
              Rachunek jest jeden
            </span>
            <span className="font-mono text-xl font-black tabular-nums sm:text-2xl" style={{ color }}>
              {round.dividend} : {round.divisor}
            </span>
          </div>

          <p className="mb-3 text-sm font-semibold leading-relaxed sm:text-base">{round.question}</p>

          <div className="grid gap-2">
            {order.map((shape) => {
              const isCorrect = shape === round.correct;
              const isPicked = shape === picked;
              const reveal = picked !== null;
              return (
                <button
                  key={shape}
                  type="button"
                  onClick={() => picked === null && setPicked(shape)}
                  disabled={reveal}
                  className={cn(
                    'flex items-start justify-between gap-3 border p-3 text-left transition-all disabled:cursor-not-allowed',
                    !reveal && 'hover:-translate-y-0.5 hover:shadow-md',
                    reveal && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !isCorrect && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isCorrect && 'opacity-50'
                  )}
                  style={!reveal ? { borderColor: `${color}55` } : undefined}
                >
                  <span>
                    <span className="block font-mono text-lg font-black tabular-nums" style={{ color }}>
                      {answers[shape]}
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold">{SHAPES[shape].label}</span>
                    {reveal && <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{SHAPES[shape].hint}</span>}
                  </span>
                  {isPicked && (isCorrect ? <Check className="mt-1 h-5 w-5 shrink-0 text-emerald-600" /> : <X className="mt-1 h-5 w-5 shrink-0 text-rose-600" />)}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex flex-wrap items-center justify-between gap-4 bg-emerald-50 p-4 dark:bg-emerald-950/40"
            >
              <p className="max-w-2xl text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">{round.explanation}</p>
              <Button onClick={next} style={{ backgroundColor: color }} className="gap-1.5 text-white hover:opacity-90">
                {isLast ? 'Dalej' : 'Kolejna sytuacja'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
