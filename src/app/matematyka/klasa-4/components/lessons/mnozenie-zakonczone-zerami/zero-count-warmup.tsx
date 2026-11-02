'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { trailingZerosOf } from '../../../lib/trailing-zeros';

interface Round {
  id: string;
  value: number;
  note: string;
}

/**
 * Trzy pary „na pierwszy rzut oka podobne, ale różne": 205↔2050 i 300↔108
 * zderzają liczbę zer w zapisie z liczbą zer, które NAPRAWDĘ da się obciąć —
 * dokładnie ta pułapka, którą reszta lekcji zakłada jako już opanowaną.
 */
const ROUNDS: Round[] = [
  { id: 'r1', value: 40, note: '40 kończy się jednym zerem — to jedyna cyfra na końcu, więc można je obciąć.' },
  {
    id: 'r2',
    value: 205,
    note: '205 kończy się na 5, nie na zero! Zero w środku (między 2 a 5) nie jest zerem KOŃCOWYM — nic tu nie obcinasz.',
  },
  { id: 'r3', value: 300, note: '300 kończy się dwoma zerami z rzędu — obie cyfry na końcu to zera.' },
  {
    id: 'r4',
    value: 2050,
    note: '2050 ma dwa zera w zapisie, ale tylko jedno z nich jest na końcu. Drugie siedzi w środku, między 2 a 5 — ono się nie liczy.',
  },
  { id: 'r5', value: 108, note: '108 kończy się na 8. To zero w środku nie jest zerem końcowym — zer do obcięcia jest zero.' },
  { id: 'r6', value: 7000, note: '7000 kończy się aż trzema zerami z rzędu — wszystkie trzy są końcowe.' },
];

const OPTIONS = [0, 1, 2, 3] as const;

function zeroLabel(n: number): string {
  if (n === 0) return '0 zer';
  if (n === 1) return '1 zero';
  return `${n} zera`;
}

interface ZeroCountWarmupProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: zanim dziecko zacznie obcinać zera, musi bezbłędnie odróżniać
 * zero KOŃCOWE (na samym końcu zapisu) od zera gdziekolwiek indziej w liczbie
 * — bez tego cała reszta lekcji liczy błędnie. Ta sama „ile" − klik na liczbę
 * − feedback pętla co `PrzeniesienieWarmup`, ale odpowiedź to liczba (0–3)
 * zamiast tak/nie.
 */
export function ZeroCountWarmup({ color, onComplete }: ZeroCountWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];
  const correctCount = trailingZerosOf(round.value);

  const pick = (value: number) => {
    if (picked !== null) return;
    setPicked(value);
    if (value === correctCount) setScore((prev) => prev + 1);
  };

  const next = () => {
    if (index + 1 < ROUNDS.length) {
      setIndex((prev) => prev + 1);
      setPicked(null);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-extrabold"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          {score}/{ROUNDS.length}
        </motion.div>
        <h3 className="mb-2 text-xl font-bold">Zero na końcu, nie zero gdziekolwiek</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Ta sama uważność — czy zero naprawdę stoi na samym końcu — będzie ci potrzebna w każdym
          kolejnym kroku tej lekcji.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        {ROUNDS.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{ROUNDS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-3 text-center text-sm text-muted-foreground sm:text-base">
            Ile zer KOŃCOWYCH możesz obciąć z tej liczby?
          </p>
          <p
            className="mb-5 text-center font-mono text-4xl font-black tabular-nums sm:text-5xl"
            style={{ color }}
          >
            {round.value}
          </p>

          <div className="grid grid-cols-4 gap-2">
            {OPTIONS.map((value) => {
              const isAnswer = value === correctCount;
              const isPicked = picked === value;
              const reveal = picked !== null;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => pick(value)}
                  disabled={reveal}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 border-2 px-2 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed',
                    !reveal && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    reveal && isAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !isAnswer && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isAnswer && 'opacity-55'
                  )}
                  style={!reveal ? { borderColor: `${color}55` } : undefined}
                >
                  {reveal && isAnswer && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                  {reveal && isPicked && !isAnswer && <X className="h-4 w-4 shrink-0 text-rose-600" />}
                  {zeroLabel(value)}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-4 p-4 text-center text-sm leading-relaxed',
                picked === correctCount
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <strong>{picked === correctCount ? 'Dobrze! ' : 'Prawie. '}</strong>
              {round.note}
            </motion.div>
          )}

          {picked !== null && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>{index + 1 < ROUNDS.length ? 'Następna liczba' : 'Zakończ'}</Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
