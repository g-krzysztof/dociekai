'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface RiddleRound {
  id: string;
  clues: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

const ROUNDS: RiddleRound[] = [
  {
    id: 'wzrost',
    clues: 'Karol jest wyższy od Marka. Marek jest wyższy od Oli.',
    question: 'Kto jest najniższy?',
    options: ['Karol', 'Marek', 'Ola'],
    correct: 'Ola',
    explanation: 'Karol > Marek > Ola — Ola jest na końcu tego łańcucha, więc jest najniższa.',
  },
  {
    id: 'cukierki',
    clues: 'Ania ma więcej cukierków niż Zosia. Kasia ma mniej cukierków niż Zosia.',
    question: 'Kto ma najwięcej cukierków?',
    options: ['Ania', 'Zosia', 'Kasia'],
    correct: 'Ania',
    explanation: 'Ania > Zosia > Kasia — Ania jest na szczycie tego łańcucha.',
  },
  {
    id: 'pociagi',
    clues: 'Pociąg A jest szybszy od pociągu B. Pociąg C jest szybszy od pociągu A.',
    question: 'Który pociąg jest najszybszy?',
    options: ['Pociąg A', 'Pociąg B', 'Pociąg C'],
    correct: 'Pociąg C',
    explanation: 'C > A > B — mimo że C nie jest porównany bezpośrednio z B, łańcuch pokazuje, że C jest najszybszy.',
  },
  {
    id: 'budzenie',
    clues: 'Basia obudziła się wcześniej niż Tomek. Ola obudziła się później niż Tomek.',
    question: 'Kto obudził się jako pierwszy?',
    options: ['Basia', 'Tomek', 'Ola'],
    correct: 'Basia',
    explanation: 'Basia → Tomek → Ola, w kolejności budzenia — Basia była pierwsza.',
  },
];

interface OrderingRiddleWarmupProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: łamigłówki logiczne bez liczb — łańcuch porównań trzeba ułożyć w głowie. Ten sam mechanizm co „Prawda/Mit" (`myth-check.tsx`), tu z trzema opcjami i czystym rozumowaniem zamiast liczenia. */
export function OrderingRiddleWarmup({ color, onComplete }: OrderingRiddleWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const containerRef = useSectionScrollAnchor(`${index}`);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;

  const choose = (value: string) => {
    if (picked !== null) return;
    setPicked(value);
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
          <p className="mb-2 text-center text-sm leading-relaxed sm:text-base">{round.clues}</p>
          <p className="mb-4 text-center text-sm font-semibold sm:text-base">{round.question}</p>

          <div className="grid grid-cols-3 gap-3">
            {round.options.map((option) => {
              const isCorrect = option === round.correct;
              const isPicked = option === picked;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => choose(option)}
                  disabled={picked !== null}
                  className={cn(
                    'flex flex-col items-center gap-1 border px-3 py-4 text-center text-sm font-semibold transition-all disabled:cursor-not-allowed',
                    picked === null && 'hover:-translate-y-0.5 hover:shadow-md',
                    picked !== null && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    isPicked && !isCorrect && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    picked !== null && !isPicked && !isCorrect && 'opacity-50'
                  )}
                  style={picked === null ? { borderColor: `${color}55`, color } : undefined}
                >
                  {option}
                  {isPicked && (isCorrect ? <Check className="h-4 w-4 text-emerald-600" /> : <X className="h-4 w-4 text-rose-600" />)}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
              {round.explanation}
            </motion.p>
          )}

          {picked !== null && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>{isLast ? 'Do układania zadań' : 'Następna łamigłówka'}</Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
