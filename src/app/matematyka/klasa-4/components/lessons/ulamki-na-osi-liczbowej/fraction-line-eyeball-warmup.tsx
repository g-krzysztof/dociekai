'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { NumberLine } from '../../number-line';

interface WarmupRound {
  id: string;
  mianownik: number;
  licznik: number;
  options: string[];
  correctIndex: number;
}

const ROUNDS: WarmupRound[] = [
  { id: 'cztery', mianownik: 4, licznik: 3, options: ['4/3', '3/4', '1/4', '3/3'], correctIndex: 1 },
  { id: 'piec', mianownik: 5, licznik: 2, options: ['2/5', '5/2', '3/5', '2/3'], correctIndex: 0 },
  { id: 'osiem', mianownik: 8, licznik: 5, options: ['5/8', '3/8', '8/5', '5/3'], correctIndex: 0 },
];

interface FractionLineEyeballWarmupProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: punkt jest już zaznaczony na podzielonej osi, dziecko wybiera pasujący zapis — z pułapką odwróconego licznika/mianownika wśród opcji w każdej rundzie. */
export function FractionLineEyeballWarmup({ color, onComplete }: FractionLineEyeballWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const containerRef = useSectionScrollAnchor(`${index}`);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
  };

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
          <p className="mb-4 text-center text-sm font-semibold sm:text-base">
            Który zapis pasuje do zaznaczonego punktu?
          </p>

          <div className="mx-auto mb-5 max-w-sm">
            <NumberLine
              min={0}
              max={1}
              majorStep={1}
              minorStep={1 / round.mianownik}
              color={color}
              markers={[{ value: round.licznik / round.mianownik, color }]}
              ariaLabel={`Odcinek od 0 do 1 podzielony na ${round.mianownik} części, punkt zaznaczony na jednej z podziałek`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {round.options.map((option, i) => {
              const isCorrect = i === round.correctIndex;
              const isPicked = i === picked;
              const reveal = picked !== null;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => choose(i)}
                  disabled={reveal}
                  className={cn(
                    'flex flex-col items-center gap-1 border px-3 py-4 font-mono text-lg font-bold tabular-nums transition-all disabled:cursor-not-allowed',
                    !reveal && 'hover:-translate-y-0.5 hover:shadow-md',
                    reveal && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !isCorrect && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isCorrect && 'opacity-50'
                  )}
                  style={!reveal ? { borderColor: `${color}55`, color } : undefined}
                >
                  {option}
                  {isPicked && (isCorrect ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-rose-600" />)}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-sm leading-relaxed text-muted-foreground"
            >
              Punkt stoi po {round.licznik} podziałkach z {round.mianownik} — licznik liczy podziałki od zera, mianownik to wszystkie równe części.
            </motion.p>
          )}

          {picked !== null && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>{isLast ? 'Dalej' : 'Następny punkt'}</Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
