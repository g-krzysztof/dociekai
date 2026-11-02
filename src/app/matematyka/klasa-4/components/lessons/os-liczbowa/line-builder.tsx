'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { NumberLine, type LineMarker } from '../../number-line';

interface Round {
  min: number;
  max: number;
  majorStep: number;
  minorStep: number;
  target: number;
  words: string;
}

const ROUNDS: Round[] = [
  { min: 0, max: 100, majorStep: 20, minorStep: 10, target: 70, words: 'siedemdziesiąt' },
  { min: 0, max: 1000, majorStep: 200, minorStep: 100, target: 700, words: 'siedemset' },
  { min: 0, max: 10000, majorStep: 2000, minorStep: 500, target: 3500, words: 'trzy tysiące pięćset' },
  {
    min: 0,
    max: 1000000,
    majorStep: 200000,
    minorStep: 50000,
    target: 650000,
    words: 'sześćset pięćdziesiąt tysięcy',
  },
];

interface LineBuilderProps {
  color: string;
  onComplete?: () => void;
}

/** Nowe pojęcie: dziecko klika na osi, żeby zaznaczyć podaną liczbę — 4 rundy, coraz większa skala. */
export function LineBuilder({ color, onComplete }: LineBuilderProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${roundIndex}-${finished}`);

  const round = ROUNDS[roundIndex];
  const correct = picked === round.target;

  const check = () => setChecked(true);

  const next = () => {
    if (roundIndex + 1 < ROUNDS.length) {
      setRoundIndex((prev) => prev + 1);
      setPicked(null);
      setChecked(false);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Umiesz już zaznaczać liczby na osi!</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Od dziesiątek po setki tysięcy — działa dokładnie ta sama metoda: znajdź sąsiednie duże
          kreski, policz działki i policz, ile ich potrzeba.
        </p>
      </div>
    );
  }

  const markers: LineMarker[] = [];
  if (picked !== null && !checked) {
    markers.push({ value: picked, filled: false, color });
  }
  if (checked) {
    markers.push({
      value: round.target,
      color: '#10b981',
      label: round.target.toLocaleString('pl-PL'),
    });
    if (picked !== null && picked !== round.target) {
      markers.push({ value: picked, color: '#f43f5e', filled: false });
    }
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {roundIndex + 1}/{ROUNDS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={roundIndex}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-5 text-base font-bold leading-snug sm:text-lg">
            Kliknij na osi miejsce, w którym jest liczba:{' '}
            <span style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}>
              „{round.words}” ({round.target.toLocaleString('pl-PL')})
            </span>
          </p>

          <div className="mb-5">
            <NumberLine
              min={round.min}
              max={round.max}
              majorStep={round.majorStep}
              minorStep={round.minorStep}
              color={color}
              markers={markers}
              onPick={checked ? undefined : setPicked}
              ariaLabel={`Oś liczbowa od ${round.min} do ${round.max}, kliknij aby zaznaczyć liczbę ${round.target}`}
            />
          </div>

          {!checked ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {picked === null
                  ? 'Dotknij lub kliknij oś, żeby postawić punkt.'
                  : `Zaznaczono: ${picked.toLocaleString('pl-PL')}`}
              </p>
              <Button onClick={check} disabled={picked === null}>
                Sprawdź
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex items-start gap-3 p-4 text-sm leading-relaxed',
                correct
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              {correct ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              )}
              <p>
                <strong>{correct ? 'Dokładnie tam! ' : 'Prawie. '}</strong>
                {correct
                  ? `To jest ${round.target.toLocaleString('pl-PL')}.`
                  : `Poprawne miejsce to ${round.target.toLocaleString('pl-PL')} — zielony punkt na osi pokazuje, gdzie powinien być.`}
              </p>
            </motion.div>
          )}

          {checked && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>
                {roundIndex + 1 < ROUNDS.length ? 'Następna liczba' : 'Zakończ'}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
