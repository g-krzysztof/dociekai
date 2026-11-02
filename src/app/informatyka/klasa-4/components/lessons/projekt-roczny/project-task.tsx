'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { QuizBuilder } from './quiz-builder';
import { QuizPlayer } from './quiz-player';
import { GameBuilder } from './game-builder';
import { GamePlayer } from './game-player';
import { TesterFeedbackLog } from './tester-feedback-log';
import { emptyQuestion, isQuizComplete, type QuizQuestion } from './quiz-content';
import { EMPTY_GRID, isGameComplete, type GameGrid } from './game-content';
import type { ProjectPlan } from './plan';

/**
 * Zadanie tej lekcji dzieje się **w całości na stronie** — zero pliku, zero
 * wychodzenia do zewnętrznego programu. Trzy etapy zamiast dowodu z pliku:
 *
 * 1. **Buduj** — dziecko składa własny quiz albo grę wprost tutaj
 *    (`QuizBuilder`/`GameBuilder`), z kartą projektu z bloku 3 jako punktem
 *    wyjścia. Kompletność liczy sama struktura danych (pytanie bez zaznaczonej
 *    poprawnej odpowiedzi po prostu nie jest gotowe) — nie ma czego kliknąć
 *    „zrobione” na oszustwo.
 * 2. **Zagraj sam/sama** — ten sam widżet ożywa jako grywalna wersja
 *    (`QuizPlayer`/`GamePlayer`). Nagrodą jest zagranie we WŁASNY projekt, nie
 *    ptaszek — ta sama zasada, która wcześniej stała za odbiorem plikiem,
 *    zrealizowana bez pliku.
 * 3. **Pokaż komuś** — dziecko podaje URZĄDZENIE (nie plik) co najmniej
 *    dwóm innym osobom, żeby zagrały w to samo, co przed chwilą samo
 *    przetestowało, i zapisuje ich uwagi w dzienniku testów.
 *
 * `.sb3`, Scratch i odbiór plikiem **celowo nie występują tutaj** — patrz
 * `feedback_zadania_praktyczne_dowod` w pamięci projektu: zakaz z 2026-09-19
 * jest bezwyjątkowy dla nowych lekcji, nawet gdy temat „własny quiz/gra"
 * kusi analogią do modułu 6.
 */

interface ProjectTaskProps {
  color: string;
  plan: ProjectPlan;
  onComplete?: () => void;
}

export function ProjectTask({ color, plan, onComplete }: ProjectTaskProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => [
    emptyQuestion('q0'),
    emptyQuestion('q1'),
    emptyQuestion('q2'),
  ]);
  const [grid, setGrid] = useState<GameGrid>(EMPTY_GRID);
  const [ownTestDone, setOwnTestDone] = useState(false);
  const [testersDone, setTestersDone] = useState(false);
  const reported = useRef(false);

  const contentComplete = plan.kind === 'quiz' ? isQuizComplete(questions) : isGameComplete(grid);
  const allDone = contentComplete && ownTestDone && testersDone;

  useEffect(() => {
    if (allDone && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  }, [allDone, onComplete]);

  return (
    <div className="border bg-white dark:bg-zinc-900/80">
      <Stage number="01" label="Buduj" color={color}>
        <p className="text-sm leading-relaxed sm:text-base">
          Z karty projektu wiem: budujesz <strong>{plan.kind === 'quiz' ? 'quiz' : 'grę'}</strong> o
          temacie <strong>„{plan.temat || 'Twój temat'}”</strong>. Dokończ go tutaj —{' '}
          {plan.kind === 'quiz'
            ? 'co najmniej trzy pytania, każde z trzema odpowiedziami i jedną poprawną.'
            : 'ustaw start, metę i przynajmniej dwie przeszkody na planszy.'}
        </p>
        <div className="mt-4">
          {plan.kind === 'quiz' ? (
            <QuizBuilder color={color} questions={questions} onChange={setQuestions} />
          ) : (
            <GameBuilder color={color} grid={grid} onChange={setGrid} />
          )}
        </div>
      </Stage>

      <Stage number="02" label="Zagraj sam/sama" color={color} locked={!contentComplete}>
        {contentComplete ? (
          <>
            <p className="mb-3 text-sm leading-relaxed">
              Gotowe — zagraj we własny projekt, zanim pokażesz go komukolwiek innemu.
            </p>
            {plan.kind === 'quiz' ? (
              <QuizPlayer color={color} questions={questions} onFinished={() => setOwnTestDone(true)} />
            ) : (
              <GamePlayer color={color} grid={grid} onWon={() => setOwnTestDone(true)} />
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Dokończ budowanie wyżej, żeby tu zagrać.</p>
        )}
      </Stage>

      <Stage number="03" label="Pokaż komuś" color={color} last locked={!ownTestDone}>
        {ownTestDone ? (
          <TesterFeedbackLog color={color} onComplete={() => setTestersDone(true)} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Najpierw sam/sama dojdź do końca powyżej — dopiero potem jest co pokazywać innym.
          </p>
        )}

        {allDone && (
          <div className="mt-5 p-3" style={{ backgroundColor: `${color}14` }}>
            <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
              <Check className="h-4 w-4 shrink-0" aria-hidden />
              Cykl domknięty.
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              Pomysł, budowa, testy u kogoś innego, poprawki — dokładnie to, co robi każdy, kto
              naprawdę coś tworzy. To, co zbudowałeś/zbudowałaś, zostaje na tej stronie i możesz do
              niego wrócić w każdej chwili.
            </p>
          </div>
        )}
      </Stage>
    </div>
  );
}

function Stage({
  number,
  label,
  color,
  last,
  locked,
  children,
}: {
  number: string;
  label: string;
  color: string;
  last?: boolean;
  locked?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={last ? 'p-5 sm:p-6' : 'border-b p-5 sm:p-6'}>
      <div className="mb-4 flex items-baseline gap-3">
        <span
          className="font-mono text-lg font-bold leading-none tabular-nums"
          style={{ color: locked ? undefined : color }}
        >
          {number}
        </span>
        <span
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: locked ? undefined : color }}
        >
          {label}
        </span>
      </div>
      {children}
    </section>
  );
}
