/**
 * Treść własnego quizu dziecka — trzy pytania, każde z trzema odpowiedziami
 * i jedną zaznaczoną jako poprawna. Powstaje w całości na tej stronie: to
 * jest realizacja zadania, nie plan do niego (patrz `plan.ts`).
 */

export interface QuizQuestion {
  id: string;
  text: string;
  options: [string, string, string];
  correct: number | null;
}

export const MIN_QUESTIONS = 3;
export const MAX_QUESTIONS = 6;

export function emptyQuestion(id: string): QuizQuestion {
  return { id, text: '', options: ['', '', ''], correct: null };
}

export function isQuestionComplete(question: QuizQuestion): boolean {
  return (
    question.text.trim() !== '' &&
    question.options.every((option) => option.trim() !== '') &&
    question.correct !== null
  );
}

export function isQuizComplete(questions: QuizQuestion[]): boolean {
  return questions.length >= MIN_QUESTIONS && questions.every(isQuestionComplete);
}
