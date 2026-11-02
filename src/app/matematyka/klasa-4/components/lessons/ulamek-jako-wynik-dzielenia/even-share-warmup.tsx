'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface WarmupRound {
  id: string;
  items: number;
  people: number;
  itemLabel: string;
  question: string;
  options: string[];
  correctIndex: number;
  note: string;
}

const ROUNDS: WarmupRound[] = [
  {
    id: 'jablka',
    items: 8,
    people: 4,
    itemLabel: 'jabłek',
    question: 'Osiem jabłek dzielimy między czworo dzieci. Ile całych jabłek dostanie każde i ile zostanie?',
    options: ['Po 2 jabłka, zostanie 0', 'Po 4 jabłka, zostanie 0', 'Po 2 jabłka, zostaną 2', 'Po 1 jabłku, zostaną 4'],
    correctIndex: 0,
    note: '8 : 4 = 2 bez reszty. Takie dzielenie wychodzi równo i nic nie zostaje — nie trzeba niczego kroić.',
  },
  {
    id: 'batony',
    items: 6,
    people: 4,
    itemLabel: 'batonów',
    question: 'Sześć batonów, czworo dzieci. Ile całych batonów dostanie każde i ile zostanie?',
    options: ['Po 2 batony, zostaną 2', 'Po 1 batonie, zostanie 1', 'Po 1 batonie, zostaną 2', 'Po 1 batonie, zostaną 3'],
    correctIndex: 2,
    note: '6 : 4 = 1 reszty 2. Dwa batony leżą na stole i nikt ich nie dostał — na razie.',
  },
  {
    id: 'pizze',
    items: 3,
    people: 4,
    itemLabel: 'pizze',
    question: 'Trzy pizze, czworo dzieci. Ile CAŁYCH pizz dostanie każde dziecko?',
    options: ['Po jednej całej', 'Po pół pizzy', 'Po trzy pizze', 'Ani jednej całej — zostają wszystkie trzy'],
    correctIndex: 3,
    note: 'Tu dzielenie w ogóle nie rusza: 3 : 4 = 0 reszty 3. Cała odpowiedź siedzi w tym, co zostało — i właśnie dlatego potrzebujemy ułamków.',
  },
  {
    id: 'kanapki',
    items: 5,
    people: 2,
    itemLabel: 'kanapek',
    question: 'Pięć kanapek dla dwóch osób. Ile całych kanapek dostanie każda i ile zostanie?',
    options: ['Po 3 kanapki, zostanie 0', 'Po 2 kanapki, zostaną 2', 'Po 2 kanapki, zostanie 1', 'Po 1 kanapce, zostaną 3'],
    correctIndex: 2,
    note: '5 : 2 = 2 reszty 1. Ta jedna kanapka aż się prosi, żeby przekroić ją na pół — i to zrobimy za chwilę.',
  },
];

interface EvenShareWarmupProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: powrót do dzielenia z resztą z modułu 1, ale z uwagą
 * przesuniętą na resztę. Cztery sytuacje ustawione tak, żeby reszta robiła
 * się coraz bardziej kłopotliwa — aż do 3 : 4, gdzie nikt nie dostaje nawet
 * jednej całości. To jest pytanie, na które odpowiada cała lekcja.
 */
export function EvenShareWarmup({ color, onComplete }: EvenShareWarmupProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const containerRef = useSectionScrollAnchor(index);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

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

      <AnimatePresence mode="wait">
        <motion.div key={round.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
          {/* Scena: tyle przedmiotów, tyle osób */}
          <div className="mb-5 grid gap-3 border p-4 sm:grid-cols-2" style={{ borderColor: `${color}33` }}>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: textColor }}>
                {round.items} {round.itemLabel}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: round.items }, (_, i) => (
                  <span key={i} className="h-6 w-6 border-2" style={{ borderColor: color, backgroundColor: `${color}33` }} aria-hidden />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: textColor }}>
                {round.people} osoby
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: round.people }, (_, i) => (
                  <User key={i} className="h-6 w-6" style={{ color }} aria-hidden />
                ))}
              </div>
            </div>
          </div>

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
                <Button onClick={next}>{isLast ? 'Dalej' : 'Następna sytuacja'}</Button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
