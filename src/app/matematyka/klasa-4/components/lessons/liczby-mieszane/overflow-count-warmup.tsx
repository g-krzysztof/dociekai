'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { SliceWedge, WholePie } from './mixed-pieces';

interface WarmupRound {
  id: string;
  /** Ta sama scena wraca w dwóch rundach — raz liczona kawałkami, raz całościami. */
  wholes: number;
  parts: number;
  mianownik: number;
  noun: string;
  nounPlural: string;
  question: string;
  options: string[];
  correctIndex: number;
  note: string;
}

const ROUNDS: WarmupRound[] = [
  {
    id: 'cwiartki-ile-kawalkow',
    wholes: 1,
    parts: 3,
    mianownik: 4,
    noun: 'pizza',
    nounPlural: 'pizze',
    question: 'Na stole leży cała pizza pokrojona na ćwiartki i jeszcze trzy luźne ćwiartki. Ile jest wszystkich ćwiartek?',
    options: ['4 ćwiartki', '7 ćwiartek', '3 ćwiartki', '8 ćwiartek'],
    correctIndex: 1,
    note: 'Cała pizza to 4 ćwiartki, do tego 3 luźne — razem 7 ćwiartek. Zapiszemy to jako 7/4, choć licznik jest większy od mianownika.',
  },
  {
    id: 'cwiartki-ile-calych',
    wholes: 1,
    parts: 3,
    mianownik: 4,
    noun: 'pizza',
    nounPlural: 'pizze',
    question: 'Ta sama scena, inne pytanie: ile jest całych pizz, a ile zostaje luźnych ćwiartek?',
    options: ['2 całe i 1 ćwiartka', '7 całych', '1 cała i 4 ćwiartki', '1 cała i 3 ćwiartki'],
    correctIndex: 3,
    note: 'Ta sama ilość jedzenia, tylko policzona inaczej: 1 cała i 3 ćwiartki. To jest właśnie liczba mieszana.',
  },
  {
    id: 'tercje-ile-kawalkow',
    wholes: 2,
    parts: 1,
    mianownik: 3,
    noun: 'placek',
    nounPlural: 'placki',
    question: 'Dwa całe placki pokrojone na trzy części i jeszcze jeden luźny kawałek. Ile jest wszystkich kawałków?',
    options: ['5 kawałków', '6 kawałków', '7 kawałków', '3 kawałki'],
    correctIndex: 2,
    note: 'Każdy cały placek to 3 kawałki, więc 3 + 3 + 1 = 7 kawałków. Czyli 7/3.',
  },
  {
    id: 'tercje-ile-calych',
    wholes: 2,
    parts: 1,
    mianownik: 3,
    noun: 'placek',
    nounPlural: 'placki',
    question: 'A ile to całych placków i ile luźnych kawałków?',
    options: ['2 całe i 1 kawałek', '7 całych', '1 cały i 2 kawałki', '2 całe i 3 kawałki'],
    correctIndex: 0,
    note: 'Dwa całe placki i jeden kawałek — dokładnie to samo, co 7 kawałków po jednej trzeciej.',
  },
];

interface OverflowCountWarmupProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: ta sama scena wraca dwa razy pod rząd, raz liczona w samych
 * kawałkach, raz w całościach i reszcie. Chodzi o to, żeby dziecko zobaczyło
 * dwa poprawne odczyty jednej ilości, zanim pozna słowa „ułamek niewłaściwy”
 * i „liczba mieszana”.
 */
export function OverflowCountWarmup({ color, onComplete }: OverflowCountWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const containerRef = useSectionScrollAnchor(index);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
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

      <div className="mb-5 flex min-h-[110px] flex-wrap items-center justify-center gap-3 border p-4" style={{ borderColor: `${color}33` }}>
        {Array.from({ length: round.wholes }, (_, i) => (
          <div key={`w-${i}`} className="w-16 sm:w-20">
            <WholePie color={color} mianownik={round.mianownik} label={`Cały ${round.noun}`} />
          </div>
        ))}
        {Array.from({ length: round.parts }, (_, i) => (
          <SliceWedge key={`p-${i}`} color={color} mianownik={round.mianownik} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={round.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
          <p className="mb-4 text-sm font-semibold leading-relaxed sm:text-base">{round.question}</p>

          <div className="grid gap-2 sm:grid-cols-2">
            {round.options.map((option, i) => {
              const isCorrect = i === round.correctIndex;
              const isPicked = i === picked;
              const reveal = picked !== null;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => picked === null && setPicked(i)}
                  disabled={reveal}
                  className={cn(
                    'flex items-center justify-between gap-2 border p-3 text-left text-sm font-semibold transition-all disabled:cursor-not-allowed',
                    !reveal && 'hover:-translate-y-0.5 hover:shadow-md',
                    reveal && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal && isPicked && !isCorrect && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isCorrect && 'opacity-50'
                  )}
                  style={!reveal ? { borderColor: `${color}55` } : undefined}
                >
                  <span>{option}</span>
                  {isPicked && (isCorrect ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : <X className="h-4 w-4 shrink-0 text-rose-600" />)}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <>
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {round.note}
              </motion.p>
              <div className="mt-4 flex justify-end">
                <Button onClick={next}>{isLast ? 'Dalej' : 'Następne pytanie'}</Button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
