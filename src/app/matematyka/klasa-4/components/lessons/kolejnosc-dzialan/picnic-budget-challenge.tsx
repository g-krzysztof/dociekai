'use client';

import { ShoppingBasket } from 'lucide-react';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'koszt-zakupow',
    question: 'Klasa kupuje 3 paczki soków po 4 zł i 2 paczki ciastek po 6 zł. Ile to kosztuje razem?',
    options: [
      { id: 'a', text: '20 zł' },
      { id: 'b', text: '24 zł' },
      { id: 'c', text: '18 zł' },
      { id: 'd', text: '26 zł' },
    ],
    correctId: 'b',
    explanation: '3 × 4 zł + 2 × 6 zł = 12 zł + 12 zł = 24 zł — oba mnożenia liczysz przed dodawaniem.',
  },
  {
    id: 'po-rabacie',
    question: 'Do zakupów dochodzi rabat 5 zł za cały koszyk. Ile klasa zapłaci ostatecznie?',
    options: [
      { id: 'a', text: '19 zł' },
      { id: 'b', text: '24 zł' },
      { id: 'c', text: '14 zł' },
      { id: 'd', text: '29 zł' },
    ],
    correctId: 'a',
    explanation: '3 × 4 + 2 × 6 − 5 = 12 + 12 − 5 = 19 zł.',
  },
  {
    id: 'wiecej-sokow',
    question: 'Gdyby klasa kupiła 5 paczek soków zamiast 3 (cena i rabat bez zmian), ile zapłaciłaby ostatecznie?',
    options: [
      { id: 'a', text: '25 zł' },
      { id: 'b', text: '32 zł' },
      { id: 'c', text: '27 zł' },
      { id: 'd', text: '22 zł' },
    ],
    correctId: 'c',
    explanation: '5 × 4 + 2 × 6 − 5 = 20 + 12 − 5 = 27 zł.',
  },
  {
    id: 'dlaczego-bez-nawiasow',
    question: 'Dlaczego w obliczeniu 3 × 4 + 2 × 6 − 5 nie trzeba stawiać żadnych nawiasów?',
    options: [
      { id: 'a', text: 'Bo mnożenie i tak liczy się przed dodawaniem i odejmowaniem' },
      { id: 'b', text: 'Bo w tym zadaniu nawiasy nie istnieją' },
      { id: 'c', text: 'Bo dodawanie zawsze jest pierwsze' },
      { id: 'd', text: 'Bo kolejność liczenia nie ma tu znaczenia' },
    ],
    correctId: 'a',
    explanation: 'Reguła pierwszeństwa działań sama zapewnia właściwą kolejność — nawiasy potrzebne są tylko, gdy chcesz ją zmienić.',
  },
];

interface PicnicBudgetChallengeProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: budżet klasowego pikniku liczony jednym wyrażeniem, bez rozbijania go na osobne działania. */
export function PicnicBudgetChallenge({ color, onComplete }: PicnicBudgetChallengeProps) {
  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <ShoppingBasket className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Klasa planuje piknik i liczy koszty jednym wyrażeniem zamiast osobnych działań na
          kartce — dokładnie tak, jak zrobiłby to kalkulator.
        </p>
      </div>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
