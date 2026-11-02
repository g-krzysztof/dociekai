'use client';

import { Ticket } from 'lucide-react';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'bilet-5',
    question: 'W loterii wygrywają bilety podzielne przez 5. Czy bilet nr 645 wygrywa?',
    options: [
      { id: 'a', text: 'Tak' },
      { id: 'b', text: 'Nie' },
    ],
    correctId: 'a',
    explanation: '645 kończy się cyfrą 5, więc dzieli się przez 5 — to zwycięski bilet.',
  },
  {
    id: 'bilet-4',
    question: 'Bilet nr 812 wygrywa nagrodę, jeśli dzieli się przez 4. Czy wygrywa?',
    options: [
      { id: 'a', text: 'Nie' },
      { id: 'b', text: 'Tak' },
    ],
    correctId: 'b',
    explanation: 'Ostatnie dwie cyfry to 12, a 12 : 4 = 3 — 812 dzieli się przez 4, więc wygrywa.',
  },
  {
    id: 'bilet-9',
    question: 'Bilet nr 963 wygrywa, jeśli dzieli się przez 9. Sprawdź sumę cyfr — czy wygrywa?',
    options: [
      { id: 'a', text: 'Nie' },
      { id: 'b', text: 'Tak' },
    ],
    correctId: 'b',
    explanation: '9 + 6 + 3 = 18, a 18 : 9 = 2 — 963 dzieli się przez 9, więc wygrywa.',
  },
  {
    id: 'bilet-3',
    question: 'Bilet nr 217 wygrywa, jeśli dzieli się przez 3. Czy wygrywa?',
    options: [
      { id: 'a', text: 'Tak' },
      { id: 'b', text: 'Nie' },
    ],
    correctId: 'b',
    explanation: '2 + 1 + 7 = 10, a 10 nie dzieli się przez 3 — 217 nie dzieli się przez 3, więc nie wygrywa.',
  },
];

interface LotteryChallengeProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: loteria szkolna, gdzie zwycięskie bilety trzeba rozpoznać po cechach podzielności. */
export function LotteryChallenge({ color, onComplete }: LotteryChallengeProps) {
  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <Ticket className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Szkolna loteria fantowa: zamiast dzielić każdy numer na kartce, rozpoznaj zwycięskie
          bilety po cesze podzielności.
        </p>
      </div>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
