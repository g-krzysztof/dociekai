'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface Card {
  id: string;
  big: string;
  small: string;
  answer: number;
  options: number[];
}

/** Cztery przeliczniki, na których stoi cała lekcja: dwa po 100, dwa po 1000. */
const CARDS: Card[] = [
  { id: 'm-cm', big: 'm', small: 'cm', answer: 100, options: [10, 100, 1000] },
  { id: 'zl-gr', big: 'zł', small: 'gr', answer: 100, options: [50, 100, 1000] },
  { id: 'kg-g', big: 'kg', small: 'g', answer: 1000, options: [100, 500, 1000] },
  { id: 'm-mm', big: 'm', small: 'mm', answer: 1000, options: [10, 100, 1000] },
];

interface UnitPairsWarmupProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: „ile mniejszych jednostek to jedna większa?". Odpowiedź (100 albo
 * 1000) to dokładnie liczba, której zera zdecydują potem o liczbie miejsc po
 * przecinku — dlatego to pierwszy krok, zanim cokolwiek zamieniamy.
 */
export function UnitPairsWarmup({ color, onComplete }: UnitPairsWarmupProps) {
  const [picks, setPicks] = useState<Record<string, number>>({});

  const answeredCount = Object.keys(picks).length;
  const allAnswered = answeredCount === CARDS.length;
  const correctCount = CARDS.filter((card) => picks[card.id] === card.answer).length;

  const pick = (cardId: string, value: number) => {
    if (picks[cardId] !== undefined) return;
    setPicks((prev) => {
      const next = { ...prev, [cardId]: value };
      if (Object.keys(next).length === CARDS.length) onComplete?.();
      return next;
    });
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-5 text-sm leading-relaxed sm:text-base">
        W każdej parze mniejsza jednostka mieści się w większej{' '}
        <strong>okrągłą liczbę razy</strong>. Kliknij właściwą liczbę — to ona zdecyduje, ile miejsc
        po przecinku dostanie liczba dziesiętna.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {CARDS.map((card) => {
          const picked = picks[card.id];
          const answered = picked !== undefined;

          return (
            <div key={card.id} className="border p-4">
              <p className="mb-3 text-center text-lg font-bold sm:text-xl">
                1 {card.big} ={' '}
                <span style={{ color }}>?</span> {card.small}
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
                      className={[
                        'flex h-11 min-w-[3.25rem] items-center justify-center border px-2 font-mono text-base font-bold tabular-nums transition-all disabled:cursor-not-allowed',
                        !answered && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                        showRight && 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40',
                        showWrong && 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/40',
                        answered && !showRight && !showWrong && 'opacity-40',
                      ]
                        .filter(Boolean)
                        .join(' ')}
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
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 border-t pt-4 text-sm leading-relaxed"
        >
          <strong style={{ color }}>
            {correctCount} z {CARDS.length}
          </strong>{' '}
          trafień. Zapamiętaj: <strong>100 ma dwa zera → dwa miejsca po przecinku</strong>, a{' '}
          <strong>1000 ma trzy zera → trzy miejsca</strong>.
        </motion.p>
      )}
    </div>
  );
}
