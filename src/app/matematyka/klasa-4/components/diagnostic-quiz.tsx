'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, RotateCcw, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from './lesson-shell';

export interface DiagnosticOption {
  id: string;
  text: string;
}

export interface DiagnosticTask {
  id: string;
  /** Treść pytania lub działania, np. „245 + 138 =”. */
  prompt: string;
  /** `input` — dziecko wpisuje liczbę; `choice` — wybiera z opcji. */
  type: 'input' | 'choice';
  /** Poprawna odpowiedź dla `input` (porównanie po przycięciu spacji i zamianie przecinka na kropkę). */
  answer?: string;
  /** Etykieta jednostki pokazywana przy polu, np. „min”, „cm”. */
  unit?: string;
  options?: DiagnosticOption[];
  correctId?: string;
  explanation: string;
  /** Poziom wymagań (K/P/R/D z `DIFFICULTY_LEVELS`) pokazywany nad pytaniem — pomija się, gdy zadania nie są stopniowane. */
  difficulty?: { code: string; name: string };
  /** Ilustracja/diagram nad treścią pytania, np. `<NumberLine>` — pomija się, gdy zadanie jest czysto tekstowe. */
  visual?: ReactNode;
}

interface ResultCopyVariant {
  title: string;
  message: string;
}

interface ResultCopy {
  perfect: ResultCopyVariant;
  good: ResultCopyVariant;
  poor: ResultCopyVariant;
}

const DEFAULT_RESULT_COPY: ResultCopy = {
  perfect: { title: 'Komplet punktów!', message: 'Ten temat masz opanowany od podszewki.' },
  good: {
    title: 'Dobrze poszło!',
    message: 'Większość zadań trafiona — resztę spokojnie nadrobisz w kolejnych lekcjach.',
  },
  poor: {
    title: 'Jest nad czym popracować',
    message: 'Bez obaw, właśnie po to jest ten test — pokazuje, co warto powtórzyć.',
  },
};

interface DiagnosticQuizProps {
  tasks: DiagnosticTask[];
  color: string;
  /** Wywoływane raz, po zobaczeniu ekranu wyniku tego sprawdzianu. */
  onFinish?: (score: number, total: number) => void;
  /** Nadpisuje domyślne teksty ekranu wyniku (np. lekcja spoza modułu diagnostycznego). */
  resultCopy?: Partial<ResultCopy>;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(',', '.');
}

/** Sprawdzian: mieszanka zadań z wpisywaną odpowiedzią i wyboru — z natychmiastową informacją zwrotną. */
export function DiagnosticQuiz({ tasks, color, onFinish, resultCopy }: DiagnosticQuizProps) {
  const [index, setIndex] = useState(0);
  const [pickedChoice, setPickedChoice] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [inputState, setInputState] = useState<'idle' | 'answered'>('idle');
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const copy: ResultCopy = {
    perfect: resultCopy?.perfect ?? DEFAULT_RESULT_COPY.perfect,
    good: resultCopy?.good ?? DEFAULT_RESULT_COPY.good,
    poor: resultCopy?.poor ?? DEFAULT_RESULT_COPY.poor,
  };

  const task = tasks[index];
  const answered = task.type === 'choice' ? pickedChoice !== null : inputState === 'answered';
  const isCorrect =
    task.type === 'choice'
      ? pickedChoice === task.correctId
      : normalize(inputValue) === normalize(task.answer ?? '');

  const pickChoice = (optionId: string) => {
    if (pickedChoice) return;
    setPickedChoice(optionId);
    if (optionId === task.correctId) setScore((prev) => prev + 1);
  };

  const submitInput = (event: FormEvent) => {
    event.preventDefault();
    if (inputState === 'answered' || !inputValue.trim()) return;
    setInputState('answered');
    if (normalize(inputValue) === normalize(task.answer ?? '')) setScore((prev) => prev + 1);
  };

  const next = () => {
    if (index + 1 < tasks.length) {
      setIndex(index + 1);
      setPickedChoice(null);
      setInputValue('');
      setInputState('idle');
      return;
    }
    setFinished(true);
    onFinish?.(score, tasks.length);
  };

  const restart = () => {
    setIndex(0);
    setPickedChoice(null);
    setInputValue('');
    setInputState('idle');
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const perfect = score === tasks.length;
    const good = score >= Math.ceil(tasks.length * 0.6);
    const variant = perfect ? copy.perfect : good ? copy.good : copy.poor;

    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-extrabold"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          {score}/{tasks.length}
        </motion.div>

        <h3 className="mb-2 text-xl font-bold">{variant.title}</h3>
        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          {variant.message}
        </p>

        <Button variant="outline" onClick={restart} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Spróbuj jeszcze raz
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {/* Kropki postępu */}
      <div className="mb-4 flex items-center gap-2">
        {tasks.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{tasks.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={task.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          {task.difficulty && (
            <p
              className="mb-2 text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
            >
              {task.difficulty.code} · {task.difficulty.name}
            </p>
          )}
          <h3 className="mb-4 text-lg font-bold leading-snug sm:text-xl">{task.prompt}</h3>
          {task.visual && <div className="mb-4">{task.visual}</div>}

          {task.type === 'choice' ? (
            <div className="grid gap-2">
              {task.options?.map((option) => {
                const isPicked = pickedChoice === option.id;
                const isAnswer = option.id === task.correctId;
                const reveal = pickedChoice !== null;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => pickChoice(option.id)}
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
          ) : (
            <form onSubmit={submitInput} className="flex flex-wrap items-center gap-2">
              <Input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                disabled={inputState === 'answered'}
                inputMode="text"
                autoComplete="off"
                placeholder="wpisz odpowiedź"
                className={cn(
                  'w-36 font-mono text-base',
                  inputState === 'answered' && isCorrect && 'border-emerald-500',
                  inputState === 'answered' && !isCorrect && 'border-rose-400'
                )}
              />
              {task.unit && <span className="text-sm text-muted-foreground">{task.unit}</span>}
              {inputState === 'idle' && (
                <Button type="submit" disabled={!inputValue.trim()}>
                  Sprawdź
                </Button>
              )}
              {inputState === 'answered' && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-sm font-semibold',
                    isCorrect ? 'text-emerald-600' : 'text-rose-600'
                  )}
                >
                  {isCorrect ? (
                    <>
                      <Check className="h-4 w-4" /> Dobrze!
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" /> Poprawna odpowiedź: {task.answer}
                      {task.unit ? ` ${task.unit}` : ''}
                    </>
                  )}
                </span>
              )}
            </form>
          )}

          {answered && (
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
                {task.explanation}
              </p>
            </motion.div>
          )}

          {answered && (
            <div className="mt-4 flex justify-end">
              <Button onClick={next}>
                {index + 1 < tasks.length ? 'Następne zadanie' : 'Zobacz wynik'}
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
