'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, RotateCcw, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from './lesson-shell';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctId: string;
  /** Wyjaśnienie pokazywane po odpowiedzi — zawsze, nie tylko przy błędzie. */
  explanation: string;
}

interface LessonQuizProps {
  questions: QuizQuestion[];
  color: string;
  /** Wywoływane raz, po zobaczeniu ekranu wyniku. */
  onFinish?: (score: number, total: number) => void;
}

/** Quiz jednokrotnego wyboru z natychmiastową informacją zwrotną. Używany przez lekcje matematyki. */
export function LessonQuiz({ questions, color, onFinish }: LessonQuizProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const question = questions[index];
  const isCorrect = picked === question?.correctId;

  const pick = (optionId: string) => {
    if (picked) return;
    setPicked(optionId);
    if (optionId === question.correctId) setScore((prev) => prev + 1);
  };

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    setFinished(true);
    // `score` jest już zaktualizowany — pick() zadziałał w poprzednim renderze.
    onFinish?.(score, questions.length);
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const perfect = score === questions.length;
    const good = score >= Math.ceil(questions.length * 0.6);

    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-extrabold"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          {score}/{questions.length}
        </motion.div>

        <h3 className="mb-2 text-xl font-bold">
          {perfect ? 'Komplet punktów!' : good ? 'Dobra robota!' : 'Jeszcze jedno podejście?'}
        </h3>
        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          {perfect
            ? 'Wiesz wszystko, co trzeba, żeby dobrze zaplanować naukę matematyki.'
            : good
              ? 'Większość odpowiedzi trafiona. Wróć do kroków, w których się pomyliłeś — to dokładnie ta „poprawa błędów”, o której była mowa.'
              : 'Bez obaw — to nie jest ocena. Przejrzyj lekcję jeszcze raz i spróbuj ponownie.'}
        </p>

        <Button variant="outline" onClick={restart} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Powtórz quiz
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {/* Kropki postępu quizu */}
      <div className="mb-4 flex items-center gap-2">
        {questions.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <h3 className="mb-4 text-lg font-bold leading-snug sm:text-xl">{question.question}</h3>

          <div className="grid gap-2">
            {question.options.map((option) => {
              const isPicked = picked === option.id;
              const isAnswer = option.id === question.correctId;
              const reveal = picked !== null;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => pick(option.id)}
                  disabled={reveal}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 border px-4 py-3 text-left text-sm transition-all sm:text-base disabled:cursor-not-allowed',
                    !reveal && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                    reveal && isAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                    reveal &&
                      isPicked &&
                      !isAnswer &&
                      'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                    reveal && !isPicked && !isAnswer && 'opacity-55'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center border text-xs font-bold',
                      reveal && isAnswer && 'border-emerald-500 bg-emerald-500 text-white',
                      reveal && isPicked && !isAnswer && 'border-rose-500 bg-rose-500 text-white'
                    )}
                  >
                    {reveal && isAnswer ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : reveal && isPicked ? (
                      <X className="h-3.5 w-3.5" />
                    ) : (
                      option.id.toUpperCase()
                    )}
                  </span>
                  <span className="flex-1">{option.text}</span>
                </button>
              );
            })}
          </div>

          {picked && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-4 flex items-start gap-3 p-4 text-sm leading-relaxed',
                isCorrect
                  ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                  : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              )}
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>
                <strong>{isCorrect ? 'Dobrze! ' : 'Prawie. '}</strong>
                {question.explanation}
              </p>
            </motion.div>
          )}

          {picked && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>
                {index + 1 < questions.length ? 'Następne pytanie' : 'Zobacz wynik'}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
