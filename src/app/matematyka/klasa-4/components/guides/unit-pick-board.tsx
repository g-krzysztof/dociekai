'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Dobieranie jednostki do przedmiotu — jedna poprawna, reszta absurdalna, ale nie śmieszna. */
export interface UnitPick {
  id: string;
  /** Rzecz, której wielkość dobieramy — wstawiana w `prompt`. */
  thing: string;
  options: string[];
  correct: string;
  why: string;
}

interface UnitPickBoardProps {
  items: UnitPick[];
  /**
   * Początek pytania, np. „W czym najwygodniej podać pole, jakie zajmuje” —
   * `thing` i znak zapytania dokleja komponent. To jedyne, co różni ten widżet
   * między przewodnikiem o polu a przewodnikiem o objętości.
   */
  prompt: string;
  color: string;
}

/**
 * Dobieranie jednostki do przedmiotu. Zły wybór nie blokuje — drga i mówi
 * dlaczego, ta sama zasada „żaden klik nie jest złym kliknięciem” co w lekcjach.
 * Wszystkie wyjaśnienia siedzą w liście `sr-only` niżej, więc treść odsłaniana
 * klikiem i tak jest w DOM (SEO + czytniki ekranu).
 *
 * Powstał w przewodniku o jednostkach pola, promowany do współdzielonych
 * `guides/` przy drugim konsumencie (przewodnik o jednostkach objętości) — ta
 * sama zasada „promuj przy drugim użyciu” co przy `SummaryPlayer`.
 */
export function UnitPickBoard({ items, prompt, color }: UnitPickBoardProps) {
  const [picked, setPicked] = useState<Record<string, string>>({});
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const choice = picked[item.id];
        const correct = choice === item.correct;
        return (
          <div key={item.id} className="border bg-white p-4 dark:bg-zinc-900/80">
            <p className="mb-3 text-sm sm:text-base">
              {prompt} <strong style={{ color: textColor }}>{item.thing}</strong>?
            </p>
            <motion.div
              key={`${item.id}-${choice ?? 'none'}`}
              animate={choice && !correct ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              {item.options.map((option) => {
                const isPicked = choice === option;
                const isAnswer = option === item.correct;
                const revealed = correct;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPicked((prev) => ({ ...prev, [item.id]: option }))}
                    className={cn(
                      'cursor-pointer border px-2 py-2.5 text-center font-mono text-sm font-bold transition-all',
                      !revealed && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                      revealed && !isAnswer && 'opacity-50',
                    )}
                    style={
                      (revealed && isAnswer) || (isPicked && !isAnswer)
                        ? {
                            borderColor: color,
                            backgroundColor: isAnswer ? `${color}1a` : undefined,
                            color: isAnswer ? textColor : undefined,
                          }
                        : undefined
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </motion.div>
            {choice && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
              >
                {correct ? item.why : 'Ta jednostka da liczbę bardzo dużą albo bardzo małą. Spróbuj innej.'}
              </motion.p>
            )}
          </div>
        );
      })}

      <ul className="sr-only">
        {items.map((item) => (
          <li key={item.id}>
            {item.thing}: {item.correct}. {item.why}
          </li>
        ))}
      </ul>
    </div>
  );
}
