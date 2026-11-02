'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FractionBarGlyph } from '../../fraction-bar-glyph';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface WarmupRound {
  id: string;
  mianownik: number;
  licznik: number;
  copies: number;
  caption: string;
  question: string;
  options: string[];
  correctIndex: number;
  note: string;
}

const ROUNDS: WarmupRound[] = [
  {
    id: 'trzy-cwiartki',
    mianownik: 4,
    licznik: 1,
    copies: 3,
    caption: 'Trzy identyczne porcje po jednej czwartej',
    question: 'Jak zapisać dodawaniem to, co widzisz na rysunku?',
    options: ['1/4 + 1/4 + 1/4, czyli 3/4', '1/4 + 3, czyli 3 1/4', '3/12', '1/4 + 1/4, czyli 2/4'],
    correctIndex: 0,
    note: 'Trzy razy ta sama porcja to zwykłe dodawanie tego samego składnika: 1/4 + 1/4 + 1/4 = 3/4. Kawałki są jednakowe, więc po prostu je liczymy.',
  },
  {
    id: 'cztery-po-dwie-osme',
    mianownik: 8,
    licznik: 2,
    copies: 4,
    caption: 'Cztery porcje po 2/8',
    question: 'To samo dodawanie da się zapisać krócej — mnożeniem. Który zapis jest poprawny?',
    options: ['2 · 4/8', '8 · 2/4', '4 · 2/8', '4 + 2/8'],
    correctIndex: 2,
    note: 'Cztery porcje po 2/8 to 4 · 2/8. Pierwsza liczba mówi, ILE RAZY bierzemy porcję, a ułamek — jak duża jest jedna porcja.',
  },
  {
    id: 'piec-trzecich',
    mianownik: 3,
    licznik: 1,
    copies: 5,
    caption: 'Pięć porcji po jednej trzeciej',
    question: 'Ile razem jest trzecich części? Chodzi o samą liczbę kawałków.',
    options: ['3 kawałki', '15 kawałków', '8 kawałków', '5 kawałków'],
    correctIndex: 3,
    note: 'Pięć porcji po jednym kawałku to 5 kawałków po 1/3, czyli 5/3. Licznik policzył kawałki, mianownik dalej mówi, że każdy z nich to jedna trzecia.',
  },
  {
    id: 'przekracza-calosc',
    mianownik: 5,
    licznik: 3,
    copies: 2,
    caption: 'Dwie porcje po 3/5',
    question: 'Ile to razem?',
    options: ['3/10', '6/5', '5/6', '6/10'],
    correctIndex: 1,
    note: 'Dwa razy po 3 kawałki to 6 kawałków po 1/5, czyli 6/5. Wyszło więcej niż jedna całość — i to jest w porządku, taki ułamek nazywamy niewłaściwym.',
  },
];

interface RepeatCountWarmupProps {
  color: string;
  onComplete?: () => void;
}

function fill(count: number): Set<number> {
  return new Set(Array.from({ length: count }, (_, i) => i));
}

/**
 * Rozgrzewka: mnożenie ułamka przez liczbę naturalną jeszcze bez słowa
 * „mnożenie” — najpierw jako kilka identycznych porcji, które trzeba zliczyć.
 * Dopiero druga runda pokazuje, że ten sam rysunek zapisuje się krócej
 * mnożeniem, a ostatnia — że wynik spokojnie może przekroczyć całość.
 */
export function RepeatCountWarmup({ color, onComplete }: RepeatCountWarmupProps) {
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
          <div className="mb-5 border p-4" style={{ borderColor: `${color}33` }}>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: textColor }}>
              {round.caption}
            </p>
            <div className="mx-auto max-w-sm space-y-3">
              {Array.from({ length: round.copies }, (_, i) => (
                <FractionBarGlyph
                  key={i}
                  color={color}
                  mianownik={round.mianownik}
                  filled={fill(round.licznik)}
                  ariaLabel={`Porcja ${i + 1}: ${round.licznik} z ${round.mianownik} części`}
                />
              ))}
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
                <Button onClick={next}>{isLast ? 'Dalej' : 'Następny rysunek'}</Button>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
