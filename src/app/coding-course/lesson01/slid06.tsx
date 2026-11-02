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
      <h2 className="text-base sm:text-lg mb-4"><span className="font-bold">wyzwanie 4</span>: Wykonaj quizz i utrwal zdobyte informacje!</h2>
      <div className="mt-4 sm:mt-6">
        <QuizProvider
          quizData={{
            title: "Co to jest program?",
            description: "Krótki quiz dla 7-latka — sprawdź, czy pamiętasz, co to jest program.",
            questions: [
              {
                id: "q1",
                text: "Co to jest program?",
                type: "multiple-choice",
                options: [
                  "Zwierzątko domowe",
                  "Zestaw instrukcji dla komputera",
                  "Rodzaj jedzenia",
                ],
                correctAnswer: "Zestaw instrukcji dla komputera",
                points: 1,
                explanation: "Program to instrukcje, które mówią komputerowi, co ma robić.",
              },
              {
                id: "q2",
                text: "Kto pisze programy?",
                type: "multiple-choice",
                options: ["Programy same się tworzą", "Tylko zwierzęta", "Programy piszą ludzie (programiści)"],
                correctAnswer: "Programy piszą ludzie (programiści)",
                points: 1,
              },
              {
                id: "q3",
                text: "Po co są programy?",
                type: "multiple-choice",
                options: ["Aby komputer mógł wykonywać zadania", "Aby rosnąć", "Aby śpiewać piosenki samemu"],
                correctAnswer: "Aby komputer mógł wykonywać zadania",
                points: 1,
              },
              {
                id: "q4",
                text: "Czy programy są stworzone, żeby pomagać ludziom?",
                type: "true-false",
                correctAnswer: "true",
                points: 1,
                explanation: "Wiele programów pomaga ludziom robić różne rzeczy, np. liczyć, rysować czy grać.",
              },
              {
                id: "q5",
                text: "Kiedy używasz programu?",
                type: "multiple-choice",
                options: ["Gdy idziesz spać", "Gdy rośniesz", "Gdy grasz w grę na komputerze"],
                correctAnswer: "Gdy grasz w grę na komputerze",
                points: 1,
              },
              {
                id: "q6",
                text: "Czy program sam myśli jak człowiek?",
                type: "multiple-choice",
                options: ["Nie, wykonuje instrukcje napisane przez ludzi", "Tak, dokładnie jak człowiek", "Programy śnią w nocy"],
                correctAnswer: "Nie, wykonuje instrukcje napisane przez ludzi",
                points: 1,
              },
              {
                id: "q7",
                text: "Co można stworzyć za pomocą programów?",
                type: "multiple-choice",
                options: ["Tylko bajki", "Gry, aplikacje i strony internetowe", "Tylko rysunki"],
                correctAnswer: "Gry, aplikacje i strony internetowe",
                points: 1,
              },
            ],
          }}
          preventAnswersToOtherThanCurrent={true}
        >
          <Card className="py-3 sm:py-4">
            <CardContent className="px-3 sm:px-6">
              <div className="mb-3 sm:mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold">Co to jest program?</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Krótki quiz — sprawdź, czy pamiętasz, co to jest program.</p>
                  </div>
                  <Badge variant="outline" className="self-start sm:self-auto">lekcja 1</Badge>
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
      <aside className="col-span-1 p-3 border rounded-lg bg-background/50">
        <h4 className="text-xs sm:text-sm font-semibold mb-2">Wybrane odpowiedzi</h4>
        <div className="flex flex-col gap-2 text-xs sm:text-sm">
          {questions?.map((q, i) => {
            const resp = userResponses?.find((r: UserResponse) => r.questionId === q.id);
            const correct = resp ? resp.isCorrect : undefined;
            const isCurrent = i === idx;
            return (
              <div
                key={q.id}
                className={cn(
                  'flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-md text-xs',
                  isCurrent ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-accent/5'
                )}
              >
                <div className={cn('truncate flex-1', isCurrent ? 'font-semibold' : 'text-xs sm:text-sm')}>{i + 1}. {q.text}</div>
                <div className="flex items-center gap-1 sm:gap-2">
                  {typeof correct === 'boolean' ? (
                    <span className={cn(correct ? 'text-emerald-600' : 'text-rose-600')}>
                      {correct ? '✔' : '✖'}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">•</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    );
  };

  if (status === "idle") {
    return (
      <div className="mt-3 sm:mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
              <Button onClick={() => startQuiz()} size="sm" className="self-start sm:self-auto">Start</Button>
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
      <div className="mt-3 sm:mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
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
    <div className="mt-3 sm:mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
            <label key={opt} className="flex items-start gap-2 cursor-pointer text-sm sm:text-base">
              <input
                type="radio"
                name={current.id}
                value={opt}
                checked={answer === opt}
                onChange={() => onSelect(opt)}
                className="mt-1"
              />
              <span className="flex-1">{opt}</span>
            </label>
          ))}

          {current.type === "true-false" && (
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm sm:text-base">
                <input
                  type="radio"
                  name={current.id}
                  value="true"
                  checked={answer === "true"}
                  onChange={() => onSelect("true")}
                />
                <span>Tak</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm sm:text-base">
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
          <Button onClick={() => prevQuestion()} disabled={currentQuestionIndex <= 1} size="sm" className="w-full sm:w-auto">Wstecz</Button>
          {idx < (questions.length - 1) ? (
            <Button onClick={handleAnswerAndNext} disabled={!answer} size="sm" className="w-full sm:w-auto">Następne</Button>
          ) : (
            <Button onClick={handleFinish} disabled={!answer} size="sm" className="w-full sm:w-auto">Zakończ quiz</Button>
          )}
        </div>
      </div>

      {renderSidebar()}
    </div>
  );
};
