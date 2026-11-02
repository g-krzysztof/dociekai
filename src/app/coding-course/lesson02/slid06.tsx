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
      <h2 className="text-base sm:text-lg mb-4"><span className="font-bold">wyzwanie 4</span>: Wykonaj quiz i utrwal wiedzę o błędach!</h2>
      <div className="mt-4 sm:mt-6">
        <QuizProvider
          quizData={{
            title: "Błędy w programowaniu",
            description: "Krótki quiz — sprawdź, czy pamiętasz, czym są błędy i jak z nimi walczyć.",
            questions: [
              {
                id: "q1",
                text: "Co to jest bug?",
                type: "multiple-choice",
                options: [
                  "Rodzaj owada",
                  "Błąd w programie",
                  "Nowy komputer",
                ],
                correctAnswer: "Błąd w programie",
                points: 1,
                explanation: "Bug to potoczna nazwa na błąd w programie komputerowym.",
              },
              {
                id: "q2",
                text: "Czy błędy w programach są normalne?",
                type: "true-false",
                correctAnswer: "true",
                points: 1,
                explanation: "Tak! Nawet najlepsi programiści robią błędy. To część procesu uczenia się i tworzenia programów.",
              },
              {
                id: "q3",
                text: "Co nazywamy debugowaniem?",
                type: "multiple-choice",
                options: ["Znajdowanie i naprawianie błędów", "Usuwanie programu", "Pisanie nowego kodu"],
                correctAnswer: "Znajdowanie i naprawianie błędów",
                points: 1,
                explanation: "Debugowanie to proces szukania i poprawiania błędów w programie.",
              },
              {
                id: "q4",
                text: "Jak można naprawić błędny program?",
                type: "multiple-choice",
                options: [
                  "Nie da się go naprawić",
                  "Trzeba usunąć komputer",
                  "Można usunąć złe polecenia lub zmienić ich kolejność",
                ],
                correctAnswer: "Można usunąć złe polecenia lub zmienić ich kolejność",
                points: 1,
              },
              {
                id: "q5",
                text: "Czy każdy błąd to okazja do nauki?",
                type: "true-false",
                correctAnswer: "true",
                points: 1,
                explanation: "Tak! Im więcej błędów znajdziesz i naprawisz, tym lepszym programistą się staniesz.",
              },
              {
                id: "q6",
                text: "Co trzeba zrobić, gdy program ma niepotrzebne kroki?",
                type: "multiple-choice",
                options: [
                  "Zostawić je tam",
                  "Usunąć niepotrzebne polecenia",
                  "Dodać jeszcze więcej kroków",
                ],
                correctAnswer: "Usunąć niepotrzebne polecenia",
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
                    <h3 className="text-lg sm:text-xl font-semibold">Błędy w programowaniu</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Krótki quiz — sprawdź swoją wiedzę o bugach!</p>
                  </div>
                  <Badge variant="outline">lekcja 2</Badge>
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
                <div className="mt-2 p-2 sm:p-3 rounded-md bg-emerald-100 text-emerald-800 text-sm sm:text-base">
                  <strong>Gratulacje!</strong> Ukończyłeś quiz z wynikiem {pct}% — super robota! 🎉
                </div>
              ) : (
                <div className="mt-2 p-2 sm:p-3 rounded-md bg-yellow-100 text-yellow-800 text-sm sm:text-base">
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

