'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface MythCard {
  id: string;
  statement: string;
  /** true = zdanie jest prawdziwe, false = to mit. */
  isTrue: boolean;
  explanation: string;
}

const CARDS: MythCard[] = [
  {
    id: 'talent',
    statement: 'Do matematyki trzeba się urodzić. Albo masz talent, albo nie.',
    isTrue: false,
    explanation:
      'Mózg działa jak mięsień — rośnie od treningu. Ktoś, kto ćwiczy 15 minut dziennie, po miesiącu wyprzedzi „talent”, który nie robi nic.',
  },
  {
    id: 'szybkosc',
    statement: 'Najlepszy z matematyki jest ten, kto liczy najszybciej.',
    isTrue: false,
    explanation:
      'Szybkie liczenie to tylko wprawa w rachunkach. W matematyce najbardziej liczy się zrozumienie zadania — a na to wolno mieć czas.',
  },
  {
    id: 'blad',
    statement: 'Błąd jest cenny, bo pokazuje dokładnie, czego jeszcze nie umiem.',
    isTrue: true,
    explanation:
      'Zadanie zrobione od razu dobrze niczego cię nie uczy — już to umiałeś. Dopiero poprawiony błąd zostaje w głowie na długo.',
  },
  {
    id: 'regularnosc',
    statement: 'Lepiej ćwiczyć 15 minut codziennie niż 2 godziny raz w tygodniu.',
    isTrue: true,
    explanation:
      'Krótkie, częste powtórki działają dużo lepiej niż jedno długie „wkuwanie”. Za chwilę zobaczysz na wykresie, dlaczego.',
  },
  {
    id: 'od-razu',
    statement: 'Jeśli nie rozumiem od razu, to znaczy, że nie zrozumiem nigdy.',
    isTrue: false,
    explanation:
      'Zrozumienie bardzo często przychodzi za drugim albo trzecim podejściem — po przespanej nocy albo po jednym dobrym pytaniu do nauczyciela.',
  },
];

interface MythCheckProps {
  color: string;
  onComplete?: () => void;
}

/** Rozgrzewka: dziecko ocenia 5 zdań o uczeniu się matematyki jako mit albo prawdę. */
export function MythCheck({ color, onComplete }: MythCheckProps) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const card = CARDS[index];
  const correct = answer !== null && answer === card?.isTrue;

  const choose = (value: boolean) => {
    if (answer !== null) return;
    setAnswer(value);
    if (value === card.isTrue) setScore((prev) => prev + 1);
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
            <h3 className="text-lg font-bold">Trzy rzeczy do zapamiętania</h3>
            <p className="text-sm text-muted-foreground">
              To one wracają w całej dzisiejszej lekcji.
            </p>
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-3">
          {[
            { emoji: '💪', text: 'Matematyki uczysz się treningiem, nie talentem.' },
            { emoji: '🧠', text: 'Krótko, ale często — tak zapamiętujesz najwięcej.' },
            { emoji: '🔍', text: 'Błąd to wskazówka, nie porażka.' },
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
      {/* Kropki postępu */}
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
          {/* Karta z twierdzeniem */}
          <div
            className="relative mb-5 overflow-hidden border p-6 text-center sm:p-8"
            style={{
              borderColor: `${color}40`,
              backgroundColor: `${color}0f`,
            }}
          >
            <span className="mb-3 block text-4xl leading-none opacity-30" aria-hidden>
              &ldquo;
            </span>
            <p className="text-lg font-bold leading-snug sm:text-2xl">{card.statement}</p>

            {/* Pieczątka z werdyktem */}
            <AnimatePresence>
              {answer !== null && (
                <motion.span
                  initial={{ opacity: 0, scale: 2.2, rotate: -25 }}
                  animate={{ opacity: 1, scale: 1, rotate: -12 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                  className={cn(
                    'absolute right-3 top-3 rounded-lg border-4 px-3 py-1 text-lg font-extrabold uppercase tracking-widest sm:right-6 sm:text-2xl',
                    card.isTrue
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-rose-500 text-rose-600'
                  )}
                >
                  {card.isTrue ? 'Prawda' : 'Mit'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Wybór */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => choose(false)}
              disabled={answer !== null}
              className={cn(
                'cursor-pointer border px-4 py-4 text-base font-bold transition-all disabled:cursor-not-allowed sm:text-lg',
                answer === null && 'hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-md',
                answer !== null && !card.isTrue && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                answer === false && card.isTrue && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                answer !== null && answer !== false && card.isTrue && 'opacity-50'
              )}
            >
              🚫 To mit
            </button>
            <button
              type="button"
              onClick={() => choose(true)}
              disabled={answer !== null}
              className={cn(
                'cursor-pointer border px-4 py-4 text-base font-bold transition-all disabled:cursor-not-allowed sm:text-lg',
                answer === null && 'hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md',
                answer !== null && card.isTrue && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                answer === true && !card.isTrue && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                answer !== null && answer !== true && !card.isTrue && 'opacity-50'
              )}
            >
              ✅ To prawda
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
              {correct ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              )}
              <p>
                <strong>{correct ? 'Zgadza się! ' : 'Niezupełnie. '}</strong>
                {card.explanation}
              </p>
            </motion.div>
          )}

          {answer !== null && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>
                {index + 1 < CARDS.length ? 'Następne zdanie' : 'Podsumuj'}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
