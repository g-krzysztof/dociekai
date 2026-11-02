'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Card {
  id: string;
  question: string;
  answer: number;
  options: number[];
}

/** Cała lekcja stoi na jednej zasadzie: liczba zer = liczba miejsc przeskoku przecinka. */
const CARDS: Card[] = [
  { id: 'zer-10', question: 'Ile zer ma liczba 10?', answer: 1, options: [1, 2, 3] },
  { id: 'zer-1000', question: 'Ile zer ma liczba 1000?', answer: 3, options: [1, 2, 3] },
  {
    id: 'skok-x100',
    question: 'Mnożąc przez 100, o ile miejsc przeskakuje przecinek?',
    answer: 2,
    options: [1, 2, 3],
  },
  {
    id: 'skok-d1000',
    question: 'Dzieląc przez 1000, o ile miejsc przeskakuje przecinek?',
    answer: 3,
    options: [1, 2, 3],
  },
];

interface PowerZeroWarmupProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: policz zera. Odpowiedź (1, 2 albo 3) to dokładnie liczba miejsc,
 * o którą przeskoczy przecinek — dlatego to pierwszy krok, zanim cokolwiek
 * mnożymy czy dzielimy.
 */
export function PowerZeroWarmup({ color, onComplete }: PowerZeroWarmupProps) {
  const [picks, setPicks] = useState<Record<string, number>>({});

  const pick = (cardId: string, value: number) => {
    if (picks[cardId] !== undefined) return;
    // Nie wołamy onComplete wewnątrz funkcji-updatera setState (to setState innego
    // komponentu w trakcie renderu tego) — budujemy następny stan z domknięcia.
    const next = { ...picks, [cardId]: value };
    setPicks(next);
    if (Object.keys(next).length === CARDS.length) onComplete?.();
  };

  const allAnswered = Object.keys(picks).length === CARDS.length;
  const correctCount = CARDS.filter((card) => picks[card.id] === card.answer).length;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-5 text-sm leading-relaxed sm:text-base">
        Zanim zaczniesz mnożyć i dzielić, policz zera. <strong>Ile zer ma liczba</strong>, o tyle
        miejsc przeskoczy przecinek — nic więcej.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {CARDS.map((card) => {
          const picked = picks[card.id];
          const answered = picked !== undefined;

          return (
            <div key={card.id} className="border p-4">
              <p className="mb-3 text-center text-sm font-bold leading-snug sm:text-base">
                {card.question}
              </p>
              <div className="flex justify-center gap-2">
                {card.options.map((option) => {
                  const isPicked = picked === option;
                  const isAnswer = option === card.answer;
                  const showRight = answered && isAnswer;
                  const showWrong = answered && isPicked && !isAnswer;

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => pick(card.id, option)}
                      disabled={answered}
                      className={cn(
                        'flex h-11 min-w-[3rem] items-center justify-center border px-2 font-mono text-base font-bold tabular-nums transition-all disabled:cursor-not-allowed',
                        !answered && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                        showRight && 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40',
                        showWrong && 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/40',
                        answered && !showRight && !showWrong && 'opacity-40'
                      )}
                    >
                      {showRight ? (
                        <Check className="h-4 w-4" />
                      ) : showWrong ? (
                        <X className="h-4 w-4" />
                      ) : (
                        option
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {allAnswered && (
        <p className="mt-5 text-center text-sm font-semibold" style={{ color }}>
          {correctCount === CARDS.length
            ? 'Komplet! Liczba zer = liczba miejsc przeskoku przecinka.'
            : `${correctCount}/${CARDS.length}. Zapamiętaj: tyle zer, ile ma mnożnik lub dzielnik — tyle miejsc przeskoku.`}
        </p>
      )}
    </div>
  );
}
