'use client';

import { Wallet } from 'lucide-react';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';

interface Purchase {
  day: string;
  item: string;
  amount: number;
}

const PURCHASES: Purchase[] = [
  { day: 'Dzień 1', item: 'Lody', amount: 8 },
  { day: 'Dzień 2', item: 'Bilet do kina', amount: 19 },
  { day: 'Dzień 3', item: 'Naklejki', amount: 6 },
  { day: 'Dzień 4', item: 'Prezent dla brata', amount: 12 },
];

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'dzien-1',
    question: 'Zosia miała 50 zł kieszonkowego. Ile jej zostało po lodach za 8 zł?',
    options: [
      { id: 'a', text: '40 zł' },
      { id: 'b', text: '42 zł' },
      { id: 'c', text: '48 zł' },
      { id: 'd', text: '58 zł' },
    ],
    correctId: 'b',
    explanation: 'Łatwiej odjąć 10 i dodać z powrotem 2: 50 − 10 = 40, + 2 = 42.',
  },
  {
    id: 'dzien-2',
    question: 'Zosia miała 42 zł. Ile zostało po bilecie do kina za 19 zł?',
    options: [
      { id: 'a', text: '21 zł' },
      { id: 'b', text: '33 zł' },
      { id: 'c', text: '13 zł' },
      { id: 'd', text: '23 zł' },
    ],
    correctId: 'd',
    explanation: 'Rozłóż 19 na 20 i 1: 42 − 20 = 22 (odjąłeś o 1 za dużo), więc 22 + 1 = 23.',
  },
  {
    id: 'dzien-3',
    question: 'Zosia miała 23 zł. Ile zostało po naklejkach za 6 zł?',
    options: [
      { id: 'a', text: '17 zł' },
      { id: 'b', text: '19 zł' },
      { id: 'c', text: '13 zł' },
      { id: 'd', text: '27 zł' },
    ],
    correctId: 'a',
    explanation: 'Rozłóż 6 na 3 i 3: 23 − 3 = 20 (pełna dziesiątka), potem 20 − 3 = 17.',
  },
  {
    id: 'dzien-4',
    question: 'Zosia miała 17 zł. Ile zostało po prezencie dla brata za 12 zł?',
    options: [
      { id: 'a', text: '7 zł' },
      { id: 'b', text: '3 zł' },
      { id: 'c', text: '5 zł' },
      { id: 'd', text: '15 zł' },
    ],
    correctId: 'c',
    explanation: 'Odejmij dziesiątki i jedności osobno: 17 − 10 = 7, a potem 7 − 2 = 5.',
  },
  {
    id: 'suma',
    question: 'Ile w sumie Zosia wydała przez cztery dni?',
    options: [
      { id: 'a', text: '40 zł' },
      { id: 'b', text: '45 zł' },
      { id: 'c', text: '50 zł' },
      { id: 'd', text: '55 zł' },
    ],
    correctId: 'b',
    explanation:
      'Możesz łączyć wydatki w pary, które ładnie się dodają: 8 + 12 = 20, a 19 + 6 = 25. Razem 20 + 25 = 45.',
  },
];

interface PocketMoneyChallengeProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: cztery dni wydatków z kieszonkowego — czyste odejmowanie i dodawanie w pamięci w kontekście. */
export function PocketMoneyChallenge({ color, onComplete }: PocketMoneyChallengeProps) {
  return (
    <div className="space-y-5">
      <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
        <p className="mb-3 text-sm leading-relaxed sm:text-base">
          Zosia dostała <strong>50 zł</strong> kieszonkowego na majówkę. Każdego dnia coś kupowała:
        </p>
        <ul className="divide-y border">
          {PURCHASES.map((purchase) => (
            <li key={purchase.day} className="flex items-center gap-3 px-4 py-3">
              <Wallet className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span className="flex-1 text-sm sm:text-base">
                <span className="font-medium">{purchase.day}:</span> {purchase.item}
              </span>
              <span className="font-mono text-base font-bold tabular-nums sm:text-lg" style={{ color }}>
                {purchase.amount} zł
              </span>
            </li>
          ))}
        </ul>
      </div>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
