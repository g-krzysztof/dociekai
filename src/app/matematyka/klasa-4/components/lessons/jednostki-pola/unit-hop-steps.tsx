'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import {
  AREA_STEP,
  AREA_UNITS,
  areaUnitIndex,
  buildAreaConversion,
  formatArea,
} from '../../../lib/area-units';

interface Example {
  id: string;
  value: number;
  fromCode: string;
  toCode: string;
  story: string;
  moral: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'biurko',
    value: 3,
    fromCode: 'm²',
    toCode: 'dm²',
    story:
      'Blat biurka ma 3 m². Ile to decymetrów kwadratowych? Jeden szczebel w dół drabinki, czyli jeden krok ×100.',
    moral: 'Jeden szczebel w dół — do liczby dopisują się dwa zera. Nic więcej się nie dzieje.',
  },
  {
    id: 'dywan',
    value: 40_000,
    fromCode: 'cm²',
    toCode: 'm²',
    story:
      'Dywan ma 40 000 cm². W takiej liczbie trudno się połapać, więc idziemy w górę drabinki — dwa szczeble, dwa razy :100.',
    moral:
      'Dwa szczeble w górę to dwa razy :100, czyli razem :10 000. Z 40 000 cm² robią się 4 m² — i dopiero teraz wiadomo, jak duży jest ten dywan.',
  },
  {
    id: 'pole',
    value: 3,
    fromCode: 'ha',
    toCode: 'm²',
    story:
      'Rolnik ma 3 hektary pola. Ile to metrów kwadratowych? Z hektara najpierw schodzimy na ary, a dopiero z arów na metry.',
    moral:
      'Ar i hektar siedzą w tej samej drabince co reszta — między nimi też jest 100. Dlatego z hektara na metry są dwa zwykłe kroki, a nie jeden wielki skok.',
  },
];

interface UnitHopStepsProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Przykłady: zamiana rozpisana na pojedyncze szczeble drabinki, po jednym
 * kliknięciu na szczebel. Liczba nie zmienia się skokiem na gotowy wynik —
 * dopisuje albo zdejmuje dokładnie dwa zera, a żeton przesuwa się o jeden
 * szczebel. Dzięki temu „×10 000” przestaje być magiczną liczbą i zostaje tym,
 * czym jest: dwoma takimi samymi krokami pod rząd.
 *
 * Wszystkie liczby (także pośrednie) pochodzą z `buildAreaConversion` — w tym
 * pliku nie ma ani jednego wpisanego ręcznie wyniku.
 */
export function UnitHopSteps({ color, onComplete }: UnitHopStepsProps) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const example = EXAMPLES[index] ?? EXAMPLES[EXAMPLES.length - 1];
  const conversion = buildAreaConversion(example.value, example.fromCode, example.toCode);
  const containerRef = useSectionScrollAnchor(`${index}-${step}-${finished}`);

  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const lastHop = step > 0 ? conversion.hops[step - 1] : undefined;
  const nextHop = conversion.hops[step];
  const current = lastHop ? lastHop.after : example.value;
  const currentUnit = lastHop ? lastHop.to : conversion.from;
  const complete = step === conversion.hops.length;
  /** Dwie ostatnie cyfry podświetlamy tylko wtedy, gdy właśnie się dopisały (skok w dół). */
  const tailIsNew = lastHop?.direction === 'down';

  const goNext = () => {
    if (index + 1 < EXAMPLES.length) {
      setIndex((value) => value + 1);
      setStep(0);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  const digits = String(current).split('');

  return (
    <div ref={containerRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: textColor }}>
        Przykład {index + 1} z {EXAMPLES.length}
      </p>
      <p className="mb-5 text-sm leading-relaxed sm:text-base">{example.story}</p>

      {/* Drabinka — od najmniejszej jednostki po największą, tak jak suwak kamery wyżej. */}
      <ol className="mb-6 grid grid-cols-7 gap-1">
        {AREA_UNITS.map((unit, rung) => {
          const isCurrent = unit.code === currentUnit.code;
          const inRange =
            (rung - areaUnitIndex(example.fromCode)) * (rung - areaUnitIndex(example.toCode)) <= 0;
          return (
            <li key={unit.code} className="relative">
              <div
                className={cn(
                  'border py-2 text-center font-mono text-xs font-bold tabular-nums sm:text-sm',
                  !inRange && 'opacity-35'
                )}
                style={{
                  borderColor: isCurrent ? color : `${color}3d`,
                  backgroundColor: isCurrent ? `${color}1f` : undefined,
                  color: textColor,
                }}
              >
                {unit.code}
              </div>
              {isCurrent && (
                <motion.div
                  layoutId="hop-token"
                  className="absolute -bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45"
                  style={{ backgroundColor: color }}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Liczba */}
      <div className="flex flex-wrap items-end justify-center gap-2 border-2 border-dashed p-5" style={{ borderColor: `${color}40` }}>
        <div className="flex items-end">
          <AnimatePresence initial={false} mode="popLayout">
            {digits.map((digit, position) => {
              const fromEnd = digits.length - position;
              const added = tailIsNew && fromEnd <= 2;
              return (
                <motion.span
                  key={position}
                  layout
                  initial={{ opacity: 0, y: -14, scale: 0.7 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 14, scale: 0.7 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    'font-mono text-4xl font-bold tabular-nums sm:text-5xl',
                    fromEnd % 3 === 0 && position > 0 && 'ml-2'
                  )}
                  style={{ color: added ? color : undefined }}
                >
                  {digit}
                </motion.span>
              );
            })}
          </AnimatePresence>
        </div>
        <span className="pb-1 font-mono text-xl font-bold sm:text-2xl" style={{ color: textColor }}>
          {currentUnit.code}
        </span>
      </div>

      {/* Sterowanie */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {complete ? (
          <p className="flex items-start gap-2 text-sm leading-relaxed">
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            <span>
              <strong className="font-mono tabular-nums">
                {formatArea(example.value)} {conversion.from.code} = {formatArea(conversion.result)}{' '}
                {conversion.to.code}
              </strong>
              . {example.moral}
            </span>
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Następny szczebel: {nextHop.from.code} → {nextHop.to.code}, czyli{' '}
            <strong style={{ color: textColor }}>
              {nextHop.direction === 'down' ? `×${AREA_STEP}` : `:${AREA_STEP}`}
            </strong>
            .
          </p>
        )}

        <div className="flex shrink-0 gap-2">
          {step > 0 && !complete && (
            <Button variant="outline" onClick={() => setStep((value) => value - 1)}>
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden />
              Cofnij skok
            </Button>
          )}
          {complete ? (
            <Button onClick={goNext} style={{ backgroundColor: color }} className="text-white">
              {index + 1 < EXAMPLES.length ? 'Następny przykład' : 'Rozumiem'}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          ) : (
            <Button
              onClick={() => setStep((value) => value + 1)}
              style={{ backgroundColor: color }}
              className="text-white"
            >
              Zrób skok
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>

      {finished && (
        <p className="mt-5 border-t pt-4 text-sm leading-relaxed text-muted-foreground">
          Trzy przykłady, jedna zasada: liczysz szczeble między jednostkami i tyle razy powtarzasz
          ten sam krok — ×100 w dół, :100 w górę.
        </p>
      )}
    </div>
  );
}
