'use client';

import { Cookie } from 'lucide-react';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'ile-ciastek',
    question: 'Pani Kowalska pakuje ciastka do pudełek po 8 sztuk. Upiekła 6 pudełek. Ile ciastek upiekła łącznie?',
    options: [
      { id: 'a', text: '40' },
      { id: 'b', text: '48' },
      { id: 'c', text: '44' },
      { id: 'd', text: '52' },
    ],
    correctId: 'b',
    explanation: '6 pudełek po 8 ciastek: 6 × 8 = 48.',
  },
  {
    id: 'ile-pudelek-56',
    question: 'Ma teraz 56 upieczonych ciastek. Do ilu pudełek po 8 sztuk je zapakuje?',
    options: [
      { id: 'a', text: '6' },
      { id: 'b', text: '9' },
      { id: 'c', text: '8' },
      { id: 'd', text: '7' },
    ],
    correctId: 'd',
    explanation: '56 : 8 = 7 — pytasz, przez co pomnożyć 8, żeby dostać 56. Odpowiedź: przez 7.',
  },
  {
    id: 'ile-pudelek-72',
    question: 'Zamówienie wymaga 72 ciastek. Ile pudełek po 8 sztuk potrzeba?',
    options: [
      { id: 'a', text: '9' },
      { id: 'b', text: '8' },
      { id: 'c', text: '7' },
      { id: 'd', text: '10' },
    ],
    correctId: 'a',
    explanation: '72 : 8 = 9, bo 8 × 9 = 72.',
  },
  {
    id: 'po-9-sztuk',
    question: 'Gdyby pakowała po 9 ciastek zamiast po 8, ile pudełek zajęłoby tych samych 72 ciastek?',
    options: [
      { id: 'a', text: '9' },
      { id: 'b', text: '7' },
      { id: 'c', text: '8' },
      { id: 'd', text: '6' },
    ],
    correctId: 'c',
    explanation: '72 : 9 = 8, bo 9 × 8 = 72 — te same 72 ciastka, inny podział.',
  },
  {
    id: 'jak-sprawdzic',
    question: 'Jak najlepiej sprawdzić, czy 56 : 8 = 7 jest poprawne?',
    options: [
      { id: 'a', text: 'Oba sposoby są poprawne' },
      { id: 'b', text: 'Policzyć 8 × 7' },
      { id: 'c', text: 'Policzyć 7 × 8' },
      { id: 'd', text: 'Nie da się tego sprawdzić bez kalkulatora' },
    ],
    correctId: 'a',
    explanation: 'Mnożenie i dzielenie opierają się na tych samych liczbach — zarówno 8 × 7, jak i 7 × 8 dają 56 i potwierdzają dzielenie.',
  },
];

interface BakeryBoxesChallengeProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: pakowanie ciastek do pudełek — mnożenie i dzielenie w jednym, konkretnym kontekście. */
export function BakeryBoxesChallenge({ color, onComplete }: BakeryBoxesChallengeProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
        <Cookie className="h-8 w-8 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Piekarnia pani Kowalskiej pakuje ciastka do pudełek po równej liczbie sztuk — idealna
          okazja, żeby mnożenie i dzielenie zadziałały razem.
        </p>
      </div>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
