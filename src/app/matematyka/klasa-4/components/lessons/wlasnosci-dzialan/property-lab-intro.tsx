'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { CommutativityDemo } from './commutativity-demo';
import { AssociativityDemo } from './associativity-demo';
import { DistributivityDemo } from './distributivity-demo';

const PHASES = [
  { id: 'przemiennosc', label: 'Przemienność', title: 'Kolejność nie ma znaczenia' },
  { id: 'lacznosc', label: 'Łączność', title: 'Kolejność sumowania nie ma znaczenia' },
  { id: 'rozdzielnosc', label: 'Rozdzielność', title: 'Duże mnożenie da się rozbić na mniejsze' },
] as const;

interface PropertyLabIntroProps {
  color: string;
  onComplete?: () => void;
}

/** Nowe pojęcie: trzy własności działań, jedna po drugiej, każda na swoim
 * interaktywnym modelu — obracana siatka, grupowane słupki, przeciągany podział. */
export function PropertyLabIntro({ color, onComplete }: PropertyLabIntroProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseDone, setPhaseDone] = useState(false);
  const containerRef = useSectionScrollAnchor(phaseIndex);

  const phase = PHASES[phaseIndex];
  const isLast = phaseIndex === PHASES.length - 1;

  const goNext = () => {
    if (isLast) {
      onComplete?.();
      return;
    }
    setPhaseIndex((prev) => prev + 1);
    setPhaseDone(false);
  };

  const markDone = () => setPhaseDone(true);

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
        {phase.label}
      </p>
      <h3 className="mb-4 text-lg font-bold leading-snug sm:text-xl">{phase.title}</h3>

      {phase.id === 'przemiennosc' && <CommutativityDemo color={color} onComplete={markDone} />}
      {phase.id === 'lacznosc' && <AssociativityDemo color={color} onComplete={markDone} />}
      {phase.id === 'rozdzielnosc' && <DistributivityDemo color={color} onComplete={markDone} />}

      {phaseDone && (
        <div className="mt-4 flex justify-end">
          <Button onClick={goNext} className="gap-1.5">
            {isLast ? 'Zakończ' : 'Dalej'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
