"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import "@/lib/reactReduxShim";
import { QuizProvider, useQuiz, useActions } from "react-quiz-kit";

interface Slid06Props {
  onNext?: () => void;
}

export const Slid06 = ({}: Slid06Props) => {

  return (
    <div className="w-full mx-auto px-2 sm:px-4">
      <h2 className="text-base sm:text-lg mb-4"><span className="font-bold">wyzwanie 2</span>: Wykonaj quiz i utrwal wiedzę o zmiennych!</h2>
      <div className="mt-4 sm:mt-6">
        <QuizProvider
          quizData={{
            title: "Zmienne i tablice",
            description: "Krótki quiz — sprawdź, czy pamiętasz, czym są zmienne i tablice.",
            questions: [
              {
                id: "q1",
                text: "Co to jest zmienna?",
                type: "multiple-choice",
                options: [
                  "Rodzaj komputera",
                  "Pudełko z nazwą, w którym trzymamy dane",
                  "Program do gier",
                ],
                correctAnswer: "Pudełko z nazwą, w którym trzymamy dane",
                points: 1,
                explanation: "Zmienna to jak pudełko, w którym komputer przechowuje różne rzeczy - liczby, słowa, czy inne informacje.",
              },
              {
                id: "q2",
                text: "Co możemy przechować w zmiennej 'wiek'?",
                type: "multiple-choice",
                options: ["Liczbę lat", "Samochód", "Obraz"],
                correctAnswer: "Liczbę lat",
                points: 1,
              },
              {
                id: "q3",
                text: "Co to jest tablica?",
                type: "multiple-choice",
                options: [
                  "Półka, na której stoją pudełka (elementy) w kolejności",
                  "Pojedyncza liczba",
                  "Rodzaj komputera",
                ],
                correctAnswer: "Półka, na której stoją pudełka (elementy) w kolejności",
                points: 1,
                explanation: "Tablica to specjalny rodzaj zmiennej - półka, na której możemy ustawić wiele pudełek (wartości) obok siebie.",
              },
              {
                id: "q4",
                text: "Czy tablica to też rodzaj zmiennej?",
                type: "true-false",
                correctAnswer: "true",
                points: 1,
                explanation: "Tak! Tablica to specjalny rodzaj zmiennej, która przechowuje wiele wartości naraz.",
              },
              {
                id: "q5",
                text: "Jak zapisujemy tablicę w programowaniu?",
                type: "multiple-choice",
                options: [
                  "Używając nawiasów kwadratowych [ ]",
                  "Używając wykrzyknika !",
                  "Używając gwiazdki *",
                ],
                correctAnswer: "Używając nawiasów kwadratowych [ ]",
                points: 1,
                explanation: "Tablicę zapisujemy używając nawiasów kwadratowych, np. [\"jabłko\", \"gruszka\"]",
              },
              {
                id: "q6",
                text: "W grze z robotem, program to:",
                type: "multiple-choice",
                options: [
                  "Pojedyncza zmienna",
                  "Tablica z poleceniami",
                  "Obraz robota",
                ],
                correctAnswer: "Tablica z poleceniami",
                points: 1,
                explanation: "Program robota to tablica poleceń, np. [\"góra\", \"prawo\", \"podnieś\"]",
              },
              {
                id: "q7",
                text: "Co oznacza zapis program[0]?",
                type: "multiple-choice",
                options: [
                  "Pierwszy element tablicy program",
                  "Program ma zero elementów",
                  "Program jest pusty",
                ],
                correctAnswer: "Pierwszy element tablicy program",
                points: 1,
                explanation: "W programowaniu liczymy od zera, więc [0] oznacza pierwszy element tablicy.",
              },
              {
                id: "q8",
                text: "Czy w zmiennej 'imię' możemy przechować liczbę?",
                type: "true-false",
                correctAnswer: "false",
                points: 1,
                explanation: "Zmienna 'imię' powinna przechowywać tekst (jak 'Ania' lub 'Tomek'), a nie liczby.",
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
                    <h3 className="text-lg sm:text-xl font-semibold">Zmienne i tablice</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Krótki quiz — sprawdź swoją wiedzę o zmiennych!</p>
                  </div>
                  <Badge variant="outline">lekcja 3</Badge>
                </div>
              </div>
              <InnerQuiz />
            </CardContent>
          </Card>
        </QuizProvider>
      </div>

      
    </div>
  );
};

const InnerQuiz = () => {
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
        <h4 className="text-xs sm:text-sm font-semibold mb-2">Wybrane odpowiedzi</h4>
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
              <div className="mt-4">
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

          {current.type === "short-answer" && (
            <div>
              <input
                type="text"
                className="w-full p-2 border rounded text-sm sm:text-base"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
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
