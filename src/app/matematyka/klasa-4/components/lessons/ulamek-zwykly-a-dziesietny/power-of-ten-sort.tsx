'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { MiniFraction } from '../../mini-fraction';
import { reachesPowerOfTen } from '../../../lib/decimal-fraction';

/** Mianowniki do posortowania — trzy „da się" (same dwójki i piątki), trzy „nie da się". */
const DENOMS = [2, 3, 5, 6, 8, 25];

interface PowerOfTenSortProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: dla każdego mianownika — czy ułamek 1/n da się zapisać jako
 * skończony ułamek dziesiętny? („da się" dokładnie wtedy, gdy mianownik jest
 * zbudowany tylko z dwójek i piątek). Ten sam kształt co `UnitPairsWarmup`.
 */
export function PowerOfTenSort({ color, onComplete }: PowerOfTenSortProps) {
  const [picks, setPicks] = useState<Record<number, boolean>>({});

  const answeredCount = Object.keys(picks).length;
  const allAnswered = answeredCount === DENOMS.length;
  const correctCount = DENOMS.filter((d) => picks[d] === reachesPowerOfTen(d)).length;

  const pick = (denom: number, value: boolean) => {
    if (picks[denom] !== undefined) return;
    setPicks((prev) => {
      const next = { ...prev, [denom]: value };
      if (Object.keys(next).length === DENOMS.length) onComplete?.();
      return next;
    });
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-5 text-sm leading-relaxed sm:text-base">
        Nie każdy ułamek zwykły da się zapisać jako <strong>skończony</strong> ułamek dziesiętny. Dla
        każdego z tych ułamków zdecyduj: <strong>da się czy nie da się?</strong>
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DENOMS.map((denom) => {
          const picked = picks[denom];
          const answered = picked !== undefined;
          const answer = reachesPowerOfTen(denom);

          return (
            <div key={denom} className="flex flex-col items-center gap-3 border p-4">
              <MiniFraction licznik={1} mianownik={denom} size="md" className="text-lg" color={color} />
              <div className="flex gap-2">
                {[
                  { label: 'da się', value: true },
                  { label: 'nie da się', value: false },
                ].map((opt) => {
                  const isPicked = picked === opt.value;
                  const isAnswer = opt.value === answer;
                  const showRight = answered && isAnswer;
                  const showWrong = answered && isPicked && !isAnswer;

                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => pick(denom, opt.value)}
                      disabled={answered}
                      className={[
                        'inline-flex h-9 items-center gap-1 border px-3 text-sm font-semibold transition-all disabled:cursor-not-allowed',
                        !answered && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                        showRight && 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40',
                        showWrong && 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/40',
                        answered && !showRight && !showWrong && 'opacity-40',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {showRight ? <Check className="h-4 w-4" /> : showWrong ? <X className="h-4 w-4" /> : null}
                      {opt.label}
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
            {correctCount} z {DENOMS.length}
          </strong>{' '}
          trafień. Zasada: da się, gdy mianownik jest <strong>zbudowany tylko z dwójek i piątek</strong>{' '}
          (2, 4, 5, 8, 20, 25…). Gdy kryje się w nim 3, 6, 7 czy 9 — wyszłaby liczba bez końca, jak
          0,333…
        </motion.p>
      )}
    </div>
  );
}
