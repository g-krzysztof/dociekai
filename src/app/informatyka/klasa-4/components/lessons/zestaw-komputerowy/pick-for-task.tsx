'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Target, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Ćwiczenie na „celowe korzystanie” z `[4.1]`: dziecko dobiera urządzenie do
 * zadania z życia, a nie nazywa je z obrazka. Do każdego zadania pasuje jedno
 * urządzenie-klucz — to, bez którego zadania po prostu nie da się wykonać.
 *
 * To ćwiczenie, nie test: zła odpowiedź nie zamyka zadania i nie pokazuje
 * właściwej odpowiedzi (byłaby ściągą), tylko odsyła do jednego pytania —
 * czy informacja ma wejść do komputera, czy z niego wyjść. Wyjaśnienie
 * przychodzi z trafieniem. Blok kończy się po rozwiązaniu wszystkich pięciu.
 *
 * Klucze są rozrzucone po pozycjach opcji (2, 4, 1, 3, 2 z czterech), żeby nie
 * dało się ich trafić rytmem.
 */

interface Task {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
}

const TASKS: Task[] = [
  {
    id: 'babcia',
    prompt: 'Chcesz porozmawiać z babcią przez internet tak, żeby się nawzajem widzieć.',
    options: ['Głośnik', 'Kamera internetowa', 'Drukarka', 'Mysz'],
    answer: 'Kamera internetowa',
    explanation:
      'Żeby babcia cię widziała, twój obraz musi najpierw wejść do komputera — a to robi kamera. Do tego przydadzą się mikrofon i głośnik, ale bez kamery nie ma obrazu.',
  },
  {
    id: 'rysunek',
    prompt: 'Masz rysunek na kartce i chcesz mieć go w komputerze, żeby wysłać go cioci.',
    options: ['Monitor', 'Klawiatura', 'Drukarka', 'Skaner'],
    answer: 'Skaner',
    explanation:
      'Obraz z papieru ma wejść do komputera — od tego jest skaner (albo urządzenie wielofunkcyjne, które też skanuje). Drukarka robi coś odwrotnego: wypuszcza plik na papier.',
  },
  {
    id: 'zaproszenia',
    prompt: 'Zrobiłeś zaproszenie na urodziny i chcesz rozdać je kolegom na papierze.',
    options: ['Drukarka', 'Skaner', 'Pendrive', 'Głośnik'],
    answer: 'Drukarka',
    explanation:
      'Gotowy plik ma wyjść z komputera na kartki — to zadanie dla drukarki. Skaner poszedłby w złą stronę: z papieru do komputera.',
  },
  {
    id: 'piosenka',
    prompt: 'Chcesz nagrać, jak śpiewasz, i puścić nagranie rodzicom.',
    options: ['Klawiatura', 'Kamera internetowa', 'Mikrofon', 'Drukarka'],
    answer: 'Mikrofon',
    explanation:
      'Twój głos musi wejść do komputera, żeby dało się go nagrać — od tego jest mikrofon. Kamera nagrałaby też obraz, ale do samego głosu wystarczy mikrofon.',
  },
  {
    id: 'szkola',
    prompt: 'Chcesz zabrać swoją pracę do szkoły, na komputer, którego nie znasz.',
    options: ['Monitor', 'Pendrive', 'Mysz', 'Skaner'],
    answer: 'Pendrive',
    explanation:
      'Plik trzeba wynieść z komputera i wnieść na inny — pendrive robi jedno i drugie. Da się to też przez chmurę, ale o niej dopiero w następnej lekcji.',
  },
];

interface PickForTaskProps {
  color: string;
  onComplete?: () => void;
}

export function PickForTask({ color, onComplete }: PickForTaskProps) {
  /** id zadania → ostatnio wybrana opcja (albo brak). */
  const [picks, setPicks] = useState<Record<string, string>>({});

  const solved = TASKS.filter((task) => picks[task.id] === task.answer).length;
  const finished = solved === TASKS.length;

  const choose = (task: Task, option: string) => {
    if (picks[task.id] === task.answer) return;
    const next = { ...picks, [task.id]: option };
    setPicks(next);
    if (TASKS.every((item) => next[item.id] === item.answer)) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="flex items-start gap-2 text-sm leading-relaxed sm:text-base">
          <Target className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          <span>
            Pięć zadań z życia. Przy każdym wybierz <strong>jedno urządzenie</strong>, bez którego
            tego zadania nie da się wykonać.
          </span>
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {solved}/{TASKS.length}
        </p>
      </div>

      <ol className="space-y-5">
        {TASKS.map((task, index) => {
          const picked = picks[task.id];
          const settled = picked === task.answer;
          const wrong = picked !== undefined && !settled;

          return (
            <li key={task.id} className="border p-3 sm:p-4">
              <p className="mb-3 flex gap-2 text-sm leading-relaxed sm:text-base">
                <span className="font-mono font-bold" style={{ color }}>
                  {index + 1}.
                </span>
                <span>{task.prompt}</span>
              </p>

              <div className="flex flex-wrap gap-2">
                {task.options.map((option) => {
                  const isPicked = picked === option;
                  const isRight = settled && isPicked;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => choose(task, option)}
                      disabled={settled}
                      aria-pressed={isPicked}
                      className={cn(
                        'inline-flex items-center gap-1.5 border px-3 py-2 text-xs font-medium transition-colors sm:text-sm',
                        settled ? 'cursor-default' : 'cursor-pointer hover:bg-muted/60',
                        isPicked && !isRight && 'border-red-600 text-red-700 dark:text-red-400'
                      )}
                      style={
                        isRight
                          ? { borderColor: color, backgroundColor: `${color}14`, color }
                          : undefined
                      }
                    >
                      {isRight && <Check className="h-4 w-4 shrink-0" aria-hidden />}
                      {option}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {picked !== undefined && (
                  <motion.p
                    key={settled ? 'ok' : 'nope'}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 border-l-2 pl-3 text-sm leading-relaxed"
                    style={{ borderColor: settled ? color : '#dc2626' }}
                  >
                    {wrong ? (
                      <>
                        <span className="mr-1 inline-flex items-center font-semibold text-red-700 dark:text-red-400">
                          <X className="mr-1 h-4 w-4" aria-hidden />
                          Nie to.
                        </span>
                        Pomyśl, w którą stronę ma płynąć informacja: ma <strong>wejść</strong> do
                        komputera, czy z niego <strong>wyjść</strong>?
                      </>
                    ) : (
                      task.explanation
                    )}
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      <AnimatePresence>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Pięć na pięć.</strong> Za każdym razem pomogło to samo pytanie: czy coś ma
            wejść do komputera, czy z niego wyjść. Kto zna tę różnicę, ten dobiera sprzęt do
            zadania, a nie klika po omacku.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
