'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Check, TriangleAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Wyjaśnienie lekcji: ta sama informacja na dwóch stronach. Strona A to spokojny
 * artykuł z autorem, datą i źródłami; strona B to krzykliwy wpis bez autora,
 * z reklamami i zachętą do kupna. Dziecko odsłania pięć pytań kontrolnych i przy
 * każdym rozstrzyga, która strona na nie odpowiada „tak”.
 *
 * To nie test punktowany — chodzi o to, żeby przejść przez wszystkie pięć pytań.
 * Werdykt na końcu pokazuje, że różnica nie jest w wyglądzie, tylko w tych
 * pięciu odpowiedziach. Wzorzec „odsłoń po kolei” z `IoMap` / `BrowserVsEngine`.
 */

interface CheckQuestion {
  id: string;
  question: string;
  /** Która strona odpowiada na to pytanie „tak”. */
  answer: 'A' | 'B';
  noteA: string;
  noteB: string;
}

const QUESTIONS: CheckQuestion[] = [
  {
    id: 'kto',
    question: 'Wiadomo, kto to napisał?',
    answer: 'A',
    noteA: 'Podpisany autor i nazwa redakcji. Można sprawdzić, kim jest.',
    noteB: 'Żadnego nazwiska. „Redakcja poleca” to nie autor.',
  },
  {
    id: 'kiedy',
    question: 'Widać, kiedy tekst powstał albo był aktualizowany?',
    answer: 'A',
    noteA: 'Jest data publikacji i data ostatniej aktualizacji.',
    noteB: 'Brak daty. Nie wiadomo, czy to sprzed roku, czy sprzed dziesięciu lat.',
  },
  {
    id: 'zrodla',
    question: 'Tekst podaje, skąd wie to, co pisze?',
    answer: 'A',
    noteA: 'Są odnośniki do badań i innych stron — da się je sprawdzić.',
    noteB: '„Naukowcy udowodnili” — ale którzy i gdzie, nie napisano.',
  },
  {
    id: 'sprzedaz',
    question: 'Strona próbuje ci coś sprzedać przy okazji?',
    answer: 'B',
    noteA: 'Nie. Tekst nie prowadzi do żadnego sklepu.',
    noteB: 'Tak — co drugi akapit to zachęta do kupna „cudownego” suplementu. To zmienia wszystko: autor zarabia na tym, w co masz uwierzyć.',
  },
  {
    id: 'zgodne',
    question: 'Inne poważne strony piszą to samo?',
    answer: 'A',
    noteA: 'To samo znajdziesz w encyklopedii i na stronach instytucji zdrowia.',
    noteB: 'Tej rewelacji nie potwierdza żadne inne znane źródło. Jest tylko tutaj.',
  },
];

interface SourceCheckProps {
  color: string;
  onComplete?: () => void;
}

export function SourceCheck({ color, onComplete }: SourceCheckProps) {
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B'>>({});

  const solved = QUESTIONS.filter((q) => answers[q.id] === q.answer).length;
  const finished = solved === QUESTIONS.length;

  const choose = (question: CheckQuestion, side: 'A' | 'B') => {
    if (answers[question.id] === question.answer) return;
    const next = { ...answers, [question.id]: side };
    setAnswers(next);
    if (QUESTIONS.every((item) => next[item.id] === item.answer)) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Obie strony twierdzą to samo: <em>„marchew radykalnie poprawia wzrok”</em>. Ale to dwie
          bardzo różne strony. Przy każdym pytaniu wskaż, <strong>która odpowiada „tak”</strong>.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {solved}/{QUESTIONS.length}
        </p>
      </div>

      {/* Dwie strony obok siebie — makiety w czystym DOM, nie SVG */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <article className="border p-3 text-xs leading-relaxed">
          <p className="mb-1.5 flex items-center gap-2 text-sm font-bold" style={{ color }}>
            <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
            Strona A · portal popularnonaukowy
          </p>
          <p className="text-muted-foreground">
            „Marchew a wzrok — ile w tym prawdy”. Autor: dr n. med. A. Nowak, redakcja Zdrowie
            Dziecka. Opublikowano 3 marca 2026, zaktualizowano 12 sierpnia 2026. W tekście: spokojne
            wyjaśnienie, że marchew pomaga tylko przy niedoborze witaminy A, i trzy odnośniki do
            badań. Bez reklam.
          </p>
        </article>
        <article className="border p-3 text-xs leading-relaxed">
          <p className="mb-1.5 flex items-center gap-2 text-sm font-bold text-red-700 dark:text-red-400">
            <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
            Strona B · blog „Sekrety Zdrowia 24”
          </p>
          <p className="text-muted-foreground">
            „SZOK! Zjadaj TO codziennie, a wyrzucisz okulary do kosza! Lekarze w szoku!”. Bez
            autora, bez daty. Co drugi akapit to zachęta: „Kliknij i zamów NaturaVit — ostatnie
            sztuki!”. Wielkie migające bannery. Nigdzie nie napisano, skąd te informacje.
          </p>
        </article>
      </div>

      <ol className="space-y-3">
        {QUESTIONS.map((question, index) => {
          const said = answers[question.id];
          const settled = said === question.answer;
          const wrong = said !== undefined && !settled;

          return (
            <li key={question.id} className="border p-3">
              <p className="mb-2.5 flex items-start gap-2 text-sm leading-relaxed sm:text-base">
                <span className="font-mono font-bold" style={{ color }}>
                  {index + 1}.
                </span>
                <span className={cn(settled && 'font-medium')}>{question.question}</span>
              </p>

              <div className="flex flex-wrap gap-2">
                {(['A', 'B'] as const).map((side) => {
                  const picked = said === side;
                  const isRight = settled && picked;
                  return (
                    <button
                      key={side}
                      type="button"
                      onClick={() => choose(question, side)}
                      disabled={settled}
                      aria-pressed={picked}
                      className={cn(
                        'inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm',
                        settled ? 'cursor-default' : 'cursor-pointer hover:bg-muted/60',
                        picked && !isRight && 'border-red-600 text-red-700 dark:text-red-400'
                      )}
                      style={
                        isRight
                          ? { borderColor: color, backgroundColor: `${color}14`, color }
                          : undefined
                      }
                    >
                      {isRight && <Check className="h-4 w-4 shrink-0" aria-hidden />}
                      Strona {side}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {said !== undefined && (
                  <motion.div
                    key={settled ? 'ok' : 'nope'}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2.5 border-l-2 pl-3 text-sm leading-relaxed"
                    style={{ borderColor: settled ? color : '#dc2626' }}
                  >
                    {wrong ? (
                      <span className="inline-flex items-center font-semibold text-red-700 dark:text-red-400">
                        <X className="mr-1 h-4 w-4" aria-hidden />
                        Jeszcze raz — przeczytaj opis obu stron.
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Strona A:</strong> {question.noteA}{' '}
                        <strong className="text-foreground">Strona B:</strong> {question.noteB}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <p>
              <strong>Cztery „tak” dla strony A, jedno ostrzegawcze „tak” dla strony B.</strong>{' '}
              Nie chodziło o to, która ładniejsza ani która głośniejsza — chodziło o pięć pytań:
              kto, kiedy, skąd wie, czy coś sprzedaje, czy inni piszą to samo.
            </p>
            <p className="mt-2">
              Zadaj je każdej stronie, zanim uwierzysz w to, co na niej piszą. Zwłaszcza tej, która
              akurat mówi to, co chciałbyś/chciałabyś usłyszeć.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
