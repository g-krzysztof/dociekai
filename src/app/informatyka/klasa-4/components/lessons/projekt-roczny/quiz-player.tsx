'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, RotateCcw, Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizQuestion } from './quiz-content';

/**
 * Nagrodą za zbudowanie quizu jest zagranie w NIEGO, nie ptaszek — dokładnie
 * ta sama zasada co przy odbiorze plikiem w innych lekcjach, tylko że tu
 * nagrodę odtwarzamy z danych wpisanych na tej stronie, a nie z pliku.
 */

interface QuizPlayerProps {
  color: string;
  questions: QuizQuestion[];
  onFinished?: () => void;
}

export function QuizPlayer({ color, questions, onFinished }: QuizPlayerProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const reported = useRef(false);

  const question = questions[index];
  const finished = index >= questions.length;

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onFinished?.();
    }
  }, [finished, onFinished]);

  const answer = (optionIndex: number) => {
    if (picked !== null) return;
    setPicked(optionIndex);
    if (optionIndex === question.correct) setScore((value) => value + 1);
  };

  const next = () => {
    setPicked(null);
    setIndex((value) => value + 1);
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
  };

  if (finished) {
    return (
      <div className="border bg-white p-5 text-center dark:bg-zinc-900/80 sm:p-6">
        <Trophy className="mx-auto mb-3 h-8 w-8" style={{ color }} aria-hidden />
        <p className="text-lg font-bold">
          Wynik: {score} / {questions.length}
        </p>
        <button
          type="button"
          onClick={restart}
          className="mt-3 inline-flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
          style={{ borderColor: color, color }}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Zagraj jeszcze raz
        </button>
      </div>
    );
  }

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Pytanie {index + 1} z {questions.length}
      </p>
      <p className="mt-2 text-base font-medium">{question.text}</p>
      <div className="mt-3 grid gap-2">
        {question.options.map((option, optionIndex) => {
          const isCorrect = optionIndex === question.correct;
          const show = picked !== null;
          return (
            <button
              key={optionIndex}
              type="button"
              onClick={() => answer(optionIndex)}
              disabled={picked !== null}
              className={cn(
                'flex items-center gap-2 border p-3 text-left text-sm transition-colors',
                !show && 'hover:bg-muted/50'
              )}
              style={
                show && isCorrect
                  ? { borderColor: color, backgroundColor: `${color}14` }
                  : show && picked === optionIndex
                    ? { borderColor: '#d4643a', backgroundColor: '#d4643a14' }
                    : undefined
              }
            >
              {show && isCorrect && <Check className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />}
              {show && !isCorrect && picked === optionIndex && (
                <X className="h-4 w-4 shrink-0 text-[#d4643a]" aria-hidden />
              )}
              {option}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <button
          type="button"
          onClick={next}
          className="mt-4 border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
          style={{ borderColor: color, color }}
        >
          {index + 1 < questions.length ? 'Dalej' : 'Zobacz wynik'}
        </button>
      )}
    </div>
  );
}
