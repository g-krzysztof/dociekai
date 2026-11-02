'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

type DiagramType = 'belka' | 'os' | 'szkic';

const DIAGRAM_LABEL: Record<DiagramType, string> = {
  belka: 'Model belkowy (paski)',
  os: 'Oś liczbowa',
  szkic: 'Rysunek sytuacji',
};

interface PickerRound {
  id: string;
  problem: string;
  correct: DiagramType;
  explanation: string;
}

const ROUNDS: PickerRound[] = [
  {
    id: 'zlotowki',
    problem: 'Ala miała 24 zł i wydała 9 zł. Ile pieniędzy jej zostało?',
    correct: 'belka',
    explanation: 'Znasz całość i jedną część — model belkowy pokaże od razu, że brakującą część liczysz odejmowaniem.',
  },
  {
    id: 'rowerzysta',
    problem: 'Rowerzysta wyruszył o godzinie 8:00 i jechał 3 godziny. O której skończył?',
    correct: 'os',
    explanation: 'To skok w czasie od punktu startowego — oś liczbowa (albo zegarowa) pokazuje taki skok najlepiej.',
  },
  {
    id: 'lawki',
    problem: 'W klasie jest 6 rzędów ławek, w każdym po 4 ławki. Ile ławek jest w klasie?',
    correct: 'belka',
    explanation: 'To równe grupy (6 grup po 4) — model belkowy z równymi odcinkami pokazuje to mnożenie od razu.',
  },
  {
    id: 'ogrodek',
    problem: 'Prostokątny ogródek ma długość 12 m i szerokość 5 m. Jaki ma obwód?',
    correct: 'szkic',
    explanation: 'Tu liczy się kształt i to, które boki się powtarzają — zwykły rysunek prostokąta z podpisanymi bokami pomoże najbardziej.',
  },
];

function shuffledOptions(correct: DiagramType, seed: number): DiagramType[] {
  const all: DiagramType[] = ['belka', 'os', 'szkic'];
  const rest = all.filter((d) => d !== correct);
  return seed % 2 === 0 ? [correct, rest[0], rest[1]] : [rest[1], correct, rest[0]];
}

interface DiagramPickerProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: który rodzaj rysunku pomocniczego pasuje do tego zadania? Ten sam mechanizm co „Prawda/Mit" (`myth-check.tsx`), tu z trzema opcjami zamiast dwóch. */
export function DiagramPicker({ color, onComplete }: DiagramPickerProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<DiagramType | null>(null);
  const containerRef = useSectionScrollAnchor(`${index}`);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const options = useMemo(() => shuffledOptions(round.correct, index), [round, index]);

  const choose = (value: DiagramType) => {
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
          <p className="mb-4 text-center text-sm leading-relaxed sm:text-base">{round.problem}</p>
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
            Który rysunek pomocniczy pasuje najlepiej?
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {options.map((option) => {
              const isCorrect = option === round.correct;
              const isPicked = option === picked;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => choose(option)}
                  disabled={picked !== null}
                  className={cn(
                    'flex flex-col items-center gap-2 border px-3 py-4 text-center text-sm font-semibold transition-all disabled:cursor-not-allowed',
                    picked === null && 'hover:-translate-y-0.5 hover:shadow-md',
                    picked !== null && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    isPicked && !isCorrect && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    picked !== null && !isPicked && !isCorrect && 'opacity-50'
                  )}
                  style={picked === null ? { borderColor: `${color}55`, color } : undefined}
                >
                  {DIAGRAM_LABEL[option]}
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
              <Button onClick={next}>{isLast ? 'Do zadania' : 'Następne zadanie'}</Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
