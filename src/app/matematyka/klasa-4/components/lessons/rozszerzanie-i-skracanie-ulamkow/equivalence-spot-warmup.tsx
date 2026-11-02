'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { FractionBarGlyph } from '../../fraction-bar-glyph';

interface Candidate {
  licznik: number;
  mianownik: number;
}

interface WarmupRound {
  id: string;
  reference: Candidate;
  options: Candidate[];
  correctIndex: number;
}

const ROUNDS: WarmupRound[] = [
  {
    id: 'polowa',
    reference: { licznik: 1, mianownik: 2 },
    options: [
      { licznik: 2, mianownik: 6 },
      { licznik: 3, mianownik: 6 },
      { licznik: 2, mianownik: 5 },
      { licznik: 4, mianownik: 6 },
    ],
    correctIndex: 1,
  },
  {
    id: 'dwie-trzecie',
    reference: { licznik: 2, mianownik: 3 },
    options: [
      { licznik: 4, mianownik: 6 },
      { licznik: 3, mianownik: 6 },
      { licznik: 5, mianownik: 9 },
      { licznik: 2, mianownik: 6 },
    ],
    correctIndex: 0,
  },
  {
    id: 'trzy-czwarte',
    reference: { licznik: 3, mianownik: 4 },
    options: [
      { licznik: 6, mianownik: 12 },
      { licznik: 5, mianownik: 8 },
      { licznik: 9, mianownik: 12 },
      { licznik: 8, mianownik: 12 },
    ],
    correctIndex: 2,
  },
];

function fillSet(licznik: number): Set<number> {
  return new Set(Array.from({ length: licznik }, (_, i) => i));
}

interface EquivalenceSpotWarmupProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: pasek wzorcowy i cztery kandydatury o innych mianownikach — dziecko wskazuje ten, który zamalowuje dokładnie tyle samo, jeszcze zanim pozna słowa „rozszerzanie" i „skracanie". */
export function EquivalenceSpotWarmup({ color, onComplete }: EquivalenceSpotWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const containerRef = useSectionScrollAnchor(index);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setPicked(null);
      return;
    }
    onComplete?.();
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{ROUNDS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={round.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
          <p className="mb-3 text-center text-sm font-semibold sm:text-base">
            Który pasek zamalowuje dokładnie tyle samo, co pasek wzorcowy?
          </p>

          <div className="mx-auto mb-6 max-w-sm">
            <p className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: textColor }}>
                Pasek wzorcowy
              </span>
              <span className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
                {round.reference.licznik}/{round.reference.mianownik}
              </span>
            </p>
            <FractionBarGlyph
              color={color}
              mianownik={round.reference.mianownik}
              filled={fillSet(round.reference.licznik)}
              ariaLabel={`Pasek wzorcowy: ${round.reference.licznik} z ${round.reference.mianownik} części`}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {round.options.map((option, i) => {
              const isCorrect = i === round.correctIndex;
              const isPicked = i === picked;
              const reveal = picked !== null;
              return (
                <button
                  key={`${option.licznik}-${option.mianownik}`}
                  type="button"
                  onClick={() => picked === null && setPicked(i)}
                  disabled={reveal}
                  aria-label={`${option.licznik} przez ${option.mianownik}`}
                  className={cn(
                    'border p-3 transition-all disabled:cursor-not-allowed',
                    !reveal && 'hover:-translate-y-0.5 hover:shadow-md',
                    reveal && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !isCorrect && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isCorrect && 'opacity-50'
                  )}
                  style={!reveal ? { borderColor: `${color}55` } : undefined}
                >
                  <span className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
                      {option.licznik}/{option.mianownik}
                    </span>
                    {isPicked && (isCorrect ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-rose-600" />)}
                  </span>
                  <FractionBarGlyph
                    color={color}
                    mianownik={option.mianownik}
                    filled={fillSet(option.licznik)}
                    ariaLabel={`Kandydat: ${option.licznik} z ${option.mianownik} części`}
                  />
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
              Ten sam kawałek całości można nazwać na wiele sposobów — {round.reference.licznik}/{round.reference.mianownik} to
              dokładnie to samo, co {round.options[round.correctIndex].licznik}/{round.options[round.correctIndex].mianownik}.
            </motion.p>
          )}

          {picked !== null && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>{isLast ? 'Dalej' : 'Następny pasek'}</Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
