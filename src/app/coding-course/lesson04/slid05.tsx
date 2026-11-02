'use client';

import React, { useState } from 'react';
import "@/lib/reactReduxShim";
import { QuizProvider, useQuiz, useActions } from 'react-quiz-kit';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Slid05Props {
  onNext?: () => void;
}

export const Slid05 = ({ onNext }: Slid05Props) => {
  return (
    <div className="mt-6 sm:mt-12 w-full px-2 sm:px-4">
      <QuizProvider
        quizData={{
          title: "Quiz: Zmienne i stałe",
          description: "Sprawdź swoją wiedzę o zmiennych i stałych!",
          questions: [
            {
              id: "q1",
              text: "Co to jest zmienna w programowaniu?",
              type: "multiple-choice",
              options: [
                "Pudełko, które zawsze ma tę samą wartość",
                "Pudełko, w którym możemy przechowywać różne wartości",
                "Komenda dla robota",
                "Nazwa programu",
              ],
              correctAnswer: "Pudełko, w którym możemy przechowywać różne wartości",
              points: 1,
            },
            {
              id: "q2",
              text: "Co to jest stała w programowaniu?",
              type: "multiple-choice",
              options: [
                "Wartość, która może się zmieniać",
                "Wartość, której nie można zmienić po ustawieniu",
                "Zmienna o bardzo długiej nazwie",
                "Błąd w programie",
              ],
              correctAnswer: "Wartość, której nie można zmienić po ustawieniu",
              points: 1,
            },
            {
              id: "q3",
              text: "Kiedy powinniśmy używać stałej zamiast zmiennej?",
              type: "multiple-choice",
              options: [
                "Gdy wartość może się zmienić w przyszłości",
                "Gdy nie jesteśmy pewni co zapisać",
                "Gdy wartość jest zawsze taka sama",
                "Zawsze powinniśmy używać zmiennych",
              ],
              correctAnswer: "Gdy wartość jest zawsze taka sama",
              points: 1,
            },
            {
              id: "q4",
              text: "Czy można zmienić wartość stałej po jej utworzeniu?",
              type: "multiple-choice",
              options: [
                "Tak, zawsze można",
                "Nie, nie można zmienić",
                "Tylko raz można zmienić",
                "Zależy od nazwy stałej",
              ],
              correctAnswer: "Nie, nie można zmienić",
              points: 1,
            },
            {
              id: "q5",
              text: "Co lepiej zapisać jako stałą?",
              type: "multiple-choice",
              options: [
                "Wiek dziecka",
                "Punkty w grze",
                "Liczba miesięcy w roku",
                "Aktualna temperatura",
              ],
              correctAnswer: "Liczba miesięcy w roku",
              points: 1,
            },
            {
              id: "q6",
              text: "Co lepiej zapisać jako zmienną?",
              type: "multiple-choice",
              options: [
                "Liczba dni w tygodniu",
                "Rok urodzenia",
                "Liczba punktów w grze",
                "Liczba godzin w dniu",
              ],
              correctAnswer: "Liczba punktów w grze",
              points: 1,
            },
            {
              id: "q7",
              text: "Która z tych wartości NIE powinna być stałą?",
              type: "multiple-choice",
              options: [
                "Liczba miesięcy w roku (12)",
                "Wynik testu (mogę poprawić)",
                "Liczba planet w Układzie Słonecznym (8)",
                "Liczba dni w tygodniu (7)",
              ],
              correctAnswer: "Wynik testu (mogę poprawić)",
              points: 1,
            },
            {
              id: "q8",
              text: "Jaką ikonę używamy do przedstawienia stałej?",
              type: "multiple-choice",
              options: [
                "📦 Otwarte pudełko",
                "🔒 Zamknięta kłódka",
                "🤖 Robot",
                "🎮 Grę",
              ],
              correctAnswer: "🔒 Zamknięta kłódka",
              points: 1,
            },
          ],
        }}
        preventAnswersToOtherThanCurrent={true}
      >
        <Card className="py-3 sm:py-4">
          <CardContent>
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold">Quiz: Zmienne i stałe</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Sprawdź swoją wiedzę o zmiennych i stałych!</p>
                </div>
                <Badge variant="outline">lekcja 4</Badge>
              </div>
            </div>
            <InnerQuiz onNext={onNext} />
          </CardContent>
        </Card>
      </QuizProvider>
    </div>
  );
};

const InnerQuiz = ({ onNext }: { onNext?: () => void }) => {
  const questions = useQuiz((state) => state.quizData.questions);
  const currentQuestionIndex = useQuiz((state) => state.currentQuestionIndex);
  const status = useQuiz((state) => state.status);
  const score = useQuiz((state) => state.score);

  const { startQuiz, answerQuestion, nextQuestion, prevQuestion, finishQuiz, resetQuiz } = useActions();
  const [answer, setAnswer] = useState<string>("");
  type UserResponse = {
    questionId: string;
    selectedAnswer: string | string[];
    isCorrect?: boolean;
  };

  const userResponses = useQuiz((state) => state.userResponses as UserResponse[] | undefined);

  const idx = (currentQuestionIndex || 1) - 1;
  const current = questions && questions[idx];
  const progress = questions && questions.length ? ((idx + 1) / questions.length) * 100 : 0;

  const onSelect = (val: string) => {
    setAnswer(val);
  };

  const handleAnswerAndNext = () => {
    if (!current) return;
    try {
      answerQuestion({ questionId: current.id, selectedAnswer: answer });
    } catch {
      // ignore for now
    }
    setAnswer("");
    nextQuestion();
  };

  const handleFinish = () => {
    if (!current) return;
    try {
      answerQuestion({ questionId: current.id, selectedAnswer: answer });
    } catch {}
    finishQuiz();
  };

  const renderSidebar = () => {
    return (
      <aside className="col-span-1 p-2 sm:p-3 border rounded-lg bg-background/50">
        <h4 className="text-xs sm:text-sm font-semibold mb-2">Twoje odpowiedzi</h4>
        <div className="flex flex-col gap-2 text-xs sm:text-sm">
          {questions?.map((q, i) => {
            const resp = userResponses?.find((r: UserResponse) => r.questionId === q.id);
            const selected = resp ? (Array.isArray(resp.selectedAnswer) ? resp.selectedAnswer.join(', ') : resp.selectedAnswer) : '—';
            const correct = resp ? resp.isCorrect : undefined;
            const isCurrent = i === idx;
            return (
              <div
                key={q.id}
                className={cn(
                  'flex items-center gap-2 p-1.5 sm:p-2 rounded-md',
                  isCurrent ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-accent/5'
                )}
              >
                <div className={cn('truncate text-xs sm:text-sm', isCurrent ? 'font-semibold' : '')}>{i + 1}. {q.text}</div>
                <div className="flex items-center gap-2 ml-2">
                  {typeof correct === 'boolean' ? (
                    <span className={cn(correct ? 'text-emerald-600' : 'text-rose-600')}>
                      {correct ? '✔' : '✖'}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">•</span>
                  )}
                </div>
                <div className="w-full text-right text-xs text-muted-foreground truncate">{selected}</div>
              </div>
            );
          })}
        </div>
      </aside>
    );
  };

  if (status === "idle") {
    return (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="col-span-1">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex-1">
                <Progress value={0} />
              </div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">0 / {questions?.length ?? 0}</div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="mb-0 sm:mb-2 text-sm sm:text-base">Gotowy? Zacznij quiz!</p>
              <Button onClick={() => startQuiz()} size="sm">Start</Button>
            </div>
          </div>
        </div>
        {renderSidebar()}
      </div>
    );
  }

  if (status === "finished") {
    const totalPoints = questions?.reduce((s, q) => s + (q.points ?? 0), 0) ?? 0;
    const pct = totalPoints > 0 ? Math.round(((score ?? 0) / totalPoints) * 100) : 0;
    const passed = pct >= 60;

    return (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="col-span-1">
          <div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex-1">
                <Progress value={100} />
              </div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">{totalPoints} / {totalPoints}</div>
            </div>
            <div className="mt-3">
              <p className="mb-2 text-base sm:text-lg font-medium">Twój wynik: {score ?? 0} / {totalPoints} — {pct}%</p>
              {passed ? (
                <div className="mt-2 p-2 sm:p-3 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-sm sm:text-base">
                  <strong>Gratulacje!</strong> Ukończyłeś quiz z wynikiem {pct}% — super robota! 🎉
                </div>
              ) : (
                <div className="mt-2 p-2 sm:p-3 rounded-md bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 text-sm sm:text-base">
                  Ukończyłeś quiz. Spróbuj jeszcze raz, żeby osiągnąć powyżej 60%.
                </div>
              )}
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    resetQuiz();
                    setAnswer("");
                  }}
                >
                  Spróbuj jeszcze raz
                </Button>
                <Button onClick={onNext} size="sm">Zakończ lekcję!</Button>
              </div>
            </div>
          </div>
        </div>
        {renderSidebar()}
      </div>
    );
  }

  if (!current) return <div>Brak pytań</div>;

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      <div className="col-span-1">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex-1">
            <Progress value={progress} />
          </div>
          <div className="text-xs sm:text-sm font-medium text-muted-foreground">{idx + 1} / {questions?.length ?? 0}</div>
        </div>
        <div className="mt-3 mb-2 font-semibold text-sm sm:text-base">{idx + 1}. {current.text}</div>

        <div className="space-y-2">
          {current.type === "multiple-choice" && current.options?.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm sm:text-base">
              <input
                type="radio"
                name={current.id}
                value={opt}
                checked={answer === opt}
                onChange={() => onSelect(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}

          {current.type === "true-false" && (
            <div className="flex flex-col">
              <label className="flex items-center gap-2 text-sm sm:text-base">
                <input
                  type="radio"
                  name={current.id}
                  value="true"
                  checked={answer === "true"}
                  onChange={() => onSelect("true")}
                />
                <span>Tak</span>
              </label>
              <label className="flex items-center gap-2 text-sm sm:text-base">
                <input
                  type="radio"
                  name={current.id}
                  value="false"
                  checked={answer === "false"}
                  onChange={() => onSelect("false")}
                />
                <span>Nie</span>
              </label>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button onClick={() => prevQuestion()} disabled={currentQuestionIndex <= 1} size="sm" className="flex-1 sm:flex-initial">Wstecz</Button>
          {idx < (questions.length - 1) ? (
            <Button onClick={handleAnswerAndNext} disabled={!answer} size="sm" className="flex-1 sm:flex-initial">Następne</Button>
          ) : (
            <Button onClick={handleFinish} disabled={!answer} size="sm" className="flex-1 sm:flex-initial">Zakończ quiz</Button>
          )}
        </div>
      </div>

      {renderSidebar()}
    </div>
  );
};
