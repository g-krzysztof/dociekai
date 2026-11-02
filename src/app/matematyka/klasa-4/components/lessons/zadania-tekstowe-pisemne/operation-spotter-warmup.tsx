'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Operator = '+' | '−' | '×' | '÷';

interface OperationProblem {
  id: string;
  sentence: string;
  correct: Operator;
  hint: string;
}

const OPERATORS: Operator[] = ['+', '−', '×', '÷'];

const PROBLEMS: OperationProblem[] = [
  {
    id: 'biblioteka',
    sentence: 'Biblioteka miała 2450 książek. Podarowano jej jeszcze 685 książek. Ile książek ma teraz?',
    correct: '+',
    hint: 'Dwie znane części łączysz w całość — to dodawanie pisemne.',
  },
  {
    id: 'zeszyty',
    sentence: 'Sklep miał 3200 zeszytów. Sprzedał 1875 zeszytów. Ile zeszytów zostało?',
    correct: '−',
    hint: 'Znasz całość i jedną część — brakującą część liczysz odejmowaniem pisemnym.',
  },
  {
    id: 'autokary',
    sentence: 'Na wycieczkę pojechało 6 autokarów, w każdym po 48 osób. Ile osób pojechało?',
    correct: '×',
    hint: 'Kilka równych grup liczysz mnożeniem pisemnym, a nie dodawaniem po kolei.',
  },
  {
    id: 'cukierki',
    sentence: '1288 cukierków rozdzielono po równo do 8 pudełek. Ile cukierków trafiło do jednego pudełka?',
    correct: '÷',
    hint: 'Znasz sumę i liczbę grup, a szukasz wielkości jednej grupy — to dzielenie pisemne.',
  },
];

interface OperationSpotterWarmupProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: cztery krótkie zadania, jedno na raz — dziecko wskazuje
 * działanie (+, −, ×, ÷), które je rozwiąże, zanim w ogóle policzy wynik.
 * Błędny wybór to shake + retry, bez blokady (ten sam duch co reszta
 * kursu) — celowo bez liczb widocznych na przyciskach, żeby nic w obrazie
 * ani w UI nie sugerowało odpowiedzi poza samą treścią zdania.
 */
export function OperationSpotterWarmup({ color, onComplete }: OperationSpotterWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Operator | null>(null);
  const [shakeOp, setShakeOp] = useState<Operator | null>(null);

  const problem = PROBLEMS[index];
  const isLast = index === PROBLEMS.length - 1;
  const solved = picked === problem.correct;

  const pick = (op: Operator) => {
    if (solved) return;
    if (op === problem.correct) {
      setPicked(op);
      return;
    }
    setShakeOp(op);
    setTimeout(() => setShakeOp(null), 400);
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
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {PROBLEMS.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{PROBLEMS.length}
        </span>
      </div>

      <p className="mb-5 text-base leading-relaxed sm:text-lg">{problem.sentence}</p>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {OPERATORS.map((op) => {
          const isCorrectPick = solved && op === problem.correct;
          return (
            <motion.button
              key={op}
              type="button"
              onClick={() => pick(op)}
              disabled={solved}
              animate={shakeOp === op ? { x: [0, -6, 6, -6, 6, 0] } : undefined}
              transition={{ duration: 0.4 }}
              className={cn(
                'flex aspect-square items-center justify-center border-2 font-mono text-3xl font-black transition-all sm:text-4xl',
                !solved && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md',
                solved && !isCorrectPick && 'opacity-40'
              )}
              style={{
                borderColor: isCorrectPick ? color : `${color}45`,
                backgroundColor: isCorrectPick ? `${color}1f` : 'transparent',
                color: isCorrectPick ? color : undefined,
              }}
            >
              {op}
            </motion.button>
          );
        })}
      </div>

      {solved && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex items-start gap-3 p-4 text-sm leading-relaxed sm:text-base"
          style={{ backgroundColor: `${color}0f` }}
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          <p>{problem.hint}</p>
        </motion.div>
      )}

      {solved && (
        <div className="mt-5 flex justify-end">
          <Button onClick={next} className="gap-1.5">
            {isLast ? 'Zakończ' : 'Następne zadanie'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
