'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

type ShapeId = 'heart' | 'letterF' | 'star' | 'letterS' | 'trapezoid';

interface ShapeCard {
  id: string;
  shape: ShapeId;
  label: string;
  /** true = figura ma oś symetrii. */
  symmetric: boolean;
  explanation: string;
}

const CARDS: ShapeCard[] = [
  {
    id: 'serce',
    shape: 'heart',
    label: 'Serce',
    symmetric: true,
    explanation: 'Pionowa linia przez środek dzieli serce na dwie lustrzane połówki.',
  },
  {
    id: 'litera-f',
    shape: 'letterF',
    label: 'Litera F',
    symmetric: false,
    explanation: 'Żadna prosta linia nie podzieli litery F na dwie identyczne, lustrzane części.',
  },
  {
    id: 'gwiazda',
    shape: 'star',
    label: 'Gwiazda pięcioramienna',
    symmetric: true,
    explanation: 'Gwiazda ma aż pięć osi symetrii — każda przechodzi przez jeden wierzchołek i środek przeciwległego boku.',
  },
  {
    id: 'litera-s',
    shape: 'letterS',
    label: 'Litera S',
    symmetric: false,
    explanation: 'Obrócona o pół obrotu litera S wygląda tak samo, ale żadna linia nie da dwóch lustrzanych połówek.',
  },
  {
    id: 'trapez',
    shape: 'trapezoid',
    label: 'Trapez równoramienny',
    symmetric: true,
    explanation: 'Pionowa oś przez środki obu podstaw dzieli ten trapez na dwie lustrzane połówki.',
  },
];

function ShapeIcon({ shape, color }: { shape: ShapeId; color: string }) {
  const content: Record<ShapeId, ReactNode> = {
    heart: (
      <path
        d="M50,80 C20,55 20,25 40,25 C48,25 50,35 50,40 C50,35 52,25 60,25 C80,25 80,55 50,80 Z"
        fill={`${color}33`}
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
      />
    ),
    letterF: (
      <text x={50} y={72} textAnchor="middle" style={{ fontSize: 68, fontWeight: 800 }} fill={color}>
        F
      </text>
    ),
    star: (
      <polygon
        points={Array.from({ length: 10 }, (_, k) => {
          const angle = ((-90 + k * 36) * Math.PI) / 180;
          const r = k % 2 === 0 ? 38 : 15;
          return `${50 + Math.cos(angle) * r},${52 + Math.sin(angle) * r}`;
        }).join(' ')}
        fill={`${color}33`}
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
      />
    ),
    letterS: (
      <text x={50} y={72} textAnchor="middle" style={{ fontSize: 68, fontWeight: 800 }} fill={color}>
        S
      </text>
    ),
    trapezoid: (
      <polygon points="25,75 75,75 60,30 40,30" fill={`${color}33`} stroke={color} strokeWidth={3} strokeLinejoin="round" />
    ),
  };

  return (
    <svg viewBox="0 0 100 100" className="mx-auto h-28 w-28" role="img" aria-hidden>
      {content[shape]}
    </svg>
  );
}

interface SymmetryCheckProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: dziecko ocenia 5 figur — czy mają oś symetrii, czy nie. Ten sam mechanizm co „Prawda/Mit” z `myth-check.tsx`, tu zastosowany do kształtów zamiast zdań. */
export function SymmetryCheck({ color, onComplete }: SymmetryCheckProps) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const card = CARDS[index];
  const correct = answer !== null && answer === card?.symmetric;

  const choose = (value: boolean) => {
    if (answer !== null) return;
    setAnswer(value);
    if (value === card.symmetric) setScore((prev) => prev + 1);
  };

  const next = () => {
    if (index + 1 < CARDS.length) {
      setIndex(index + 1);
      setAnswer(null);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 dark:bg-zinc-900/80 sm:p-8">
        <div className="mb-5 flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-extrabold"
            style={{ backgroundColor: `${color}1f`, color }}
          >
            {score}/{CARDS.length}
          </span>
          <div>
            <h3 className="text-lg font-bold">Jak rozpoznać oś symetrii</h3>
            <p className="text-sm text-muted-foreground">Trzymaj to w głowie w tej lekcji.</p>
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            { emoji: '🪞', text: 'Oś dzieli figurę na dwie lustrzane połówki.' },
            { emoji: '📐', text: 'Niektóre figury mają kilka osi naraz — inne żadnej.' },
            { emoji: '🔁', text: 'Obrót to nie to samo co odbicie — S wygląda tak samo do góry nogami, ale osi symetrii nie ma.' },
          ].map((item) => (
            <li key={item.text} className="border p-4">
              <span className="mb-2 block text-2xl">{item.emoji}</span>
              <span className="text-sm leading-relaxed">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        {CARDS.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{CARDS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, y: -20, rotate: 1.5 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="relative mb-5 overflow-hidden border p-6 text-center sm:p-8"
            style={{ borderColor: `${color}40`, backgroundColor: `${color}0f` }}
          >
            <ShapeIcon shape={card.shape} color={color} />
            <p className="mt-3 text-lg font-bold leading-snug sm:text-xl">{card.label}</p>

            <AnimatePresence>
              {answer !== null && (
                <motion.span
                  initial={{ opacity: 0, scale: 2.2, rotate: -25 }}
                  animate={{ opacity: 1, scale: 1, rotate: -12 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                  className={cn(
                    'absolute right-3 top-3 rounded-lg border-4 px-3 py-1 text-sm font-extrabold uppercase tracking-widest sm:right-6 sm:text-lg',
                    card.symmetric ? 'border-emerald-500 text-emerald-600' : 'border-rose-500 text-rose-600'
                  )}
                >
                  {card.symmetric ? 'Symetryczna' : 'Bez osi'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => choose(false)}
              disabled={answer !== null}
              className={cn(
                'cursor-pointer border px-4 py-4 text-sm font-bold transition-all disabled:cursor-not-allowed sm:text-base',
                answer === null && 'hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-md',
                answer !== null && !card.symmetric && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                answer === false && card.symmetric && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                answer !== null && answer !== false && card.symmetric && 'opacity-50'
              )}
            >
              🚫 Nie ma osi symetrii
            </button>
            <button
              type="button"
              onClick={() => choose(true)}
              disabled={answer !== null}
              className={cn(
                'cursor-pointer border px-4 py-4 text-sm font-bold transition-all disabled:cursor-not-allowed sm:text-base',
                answer === null && 'hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md',
                answer !== null && card.symmetric && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                answer === true && !card.symmetric && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                answer !== null && answer !== true && !card.symmetric && 'opacity-50'
              )}
            >
              ✅ Ma oś symetrii
            </button>
          </div>

          {answer !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-4 flex items-start gap-3 p-4 text-sm leading-relaxed',
                correct
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              {correct ? <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
              <p>
                <strong>{correct ? 'Zgadza się! ' : 'Niezupełnie. '}</strong>
                {card.explanation}
              </p>
            </motion.div>
          )}

          {answer !== null && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>{index + 1 < CARDS.length ? 'Następna figura' : 'Podsumuj'}</Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
