'use client';

import { Check, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  emptyQuestion,
  isQuestionComplete,
  type QuizQuestion,
} from './quiz-content';

interface QuizBuilderProps {
  color: string;
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

export function QuizBuilder({ color, questions, onChange }: QuizBuilderProps) {
  const setText = (id: string, text: string) =>
    onChange(questions.map((q) => (q.id === id ? { ...q, text } : q)));

  const setOption = (id: string, index: 0 | 1 | 2, value: string) =>
    onChange(
      questions.map((q) => {
        if (q.id !== id) return q;
        const options = [...q.options] as [string, string, string];
        options[index] = value;
        return { ...q, options };
      })
    );

  const setCorrect = (id: string, index: number) =>
    onChange(questions.map((q) => (q.id === id ? { ...q, correct: index } : q)));

  const addQuestion = () => {
    if (questions.length >= MAX_QUESTIONS) return;
    onChange([...questions, emptyQuestion(`q${questions.length}-${Date.now()}`)]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= MIN_QUESTIONS) return;
    onChange(questions.filter((q) => q.id !== id));
  };

  return (
    <div>
      <div className="space-y-4">
        {questions.map((question, index) => {
          const done = isQuestionComplete(question);
          return (
            <div key={question.id} className="border p-4" style={done ? { borderColor: `${color}55` } : undefined}>
              <div className="flex items-start gap-2">
                <span className="mt-2 w-5 shrink-0 text-right font-mono text-xs text-muted-foreground">
                  {index + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={question.text}
                    onChange={(event) => setText(question.id, event.target.value)}
                    placeholder="Treść pytania, np. Które zwierzę śpi zimą?"
                    className="w-full border px-3 py-1.5 text-sm font-medium"
                  />
                  <p className="mb-1.5 mt-3 text-xs text-muted-foreground">
                    Wpisz trzy odpowiedzi i zaznacz kółkiem tę poprawną
                  </p>
                  <div className="space-y-1.5">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correct === optionIndex}
                          onChange={() => setCorrect(question.id, optionIndex)}
                          className="shrink-0"
                          style={{ accentColor: color }}
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(event) =>
                            setOption(question.id, optionIndex as 0 | 1 | 2, event.target.value)
                          }
                          placeholder={`Odpowiedź ${optionIndex + 1}`}
                          className="min-w-0 flex-1 border px-2.5 py-1 text-sm"
                        />
                      </label>
                    ))}
                  </div>
                </div>
                {questions.length > MIN_QUESTIONS && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    aria-label="Usuń pytanie"
                    className="shrink-0 p-1.5 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                )}
              </div>
              {done && (
                <p className="mt-2 flex items-center gap-1.5 pl-7 text-xs font-medium" style={{ color }}>
                  <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Gotowe.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {questions.length < MAX_QUESTIONS && (
        <button
          type="button"
          onClick={addQuestion}
          className={cn(
            'mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80'
          )}
          style={{ color }}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Dodaj kolejne pytanie
        </button>
      )}
    </div>
  );
}
