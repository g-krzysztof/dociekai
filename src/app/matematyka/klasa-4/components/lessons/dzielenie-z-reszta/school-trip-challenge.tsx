'use client';

import { Bus } from 'lucide-react';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'pelne-autokary',
    question: '34 uczniów jedzie na wycieczkę. Każdy autokar mieści 8 osób. Ile pełnych autokarów da się zapełnić?',
    options: [
      { id: 'a', text: '4' },
      { id: 'b', text: '5' },
      { id: 'c', text: '34' },
      { id: 'd', text: '2' },
    ],
    correctId: 'a',
    explanation: '34 : 8 = 4 r 2 — cztery autokary da się zapełnić do pełna, a 2 uczniów zostaje.',
  },
  {
    id: 'bez-miejsca',
    question: 'Ilu uczniów zostanie bez miejsca, jeśli wynajmiemy tylko te 4 pełne autokary?',
    options: [
      { id: 'a', text: '8' },
      { id: 'b', text: '4' },
      { id: 'c', text: '2' },
      { id: 'd', text: '0' },
    ],
    correctId: 'c',
    explanation: 'To właśnie reszta z 34 : 8 = 4 r 2 — zostaje 2 uczniów bez miejsca.',
  },
  {
    id: 'ile-wynajac',
    question: 'Ile autokarów trzeba WYNAJĄĆ, żeby zabrać WSZYSTKICH 34 uczniów (nawet niepełny autokar się liczy)?',
    options: [
      { id: 'a', text: '4' },
      { id: 'b', text: '5' },
      { id: 'c', text: '6' },
      { id: 'd', text: '34' },
    ],
    correctId: 'b',
    explanation: 'Samą resztę też trzeba gdzieś zabrać, więc mimo że 4 autokary wystarczą na 32 osoby, potrzeba piątego, niepełnego, na ostatnich 2 uczniów — w sumie 5.',
  },
  {
    id: 'inna-klasa',
    question: 'Inna klasa: 45 uczniów, autokary po 10 osób. Ile autokarów trzeba wynająć, żeby zabrać wszystkich?',
    options: [
      { id: 'a', text: '5' },
      { id: 'b', text: '4' },
      { id: 'c', text: '6' },
      { id: 'd', text: '4,5' },
    ],
    correctId: 'a',
    explanation: '45 : 10 = 4 r 5 — cztery pełne autokary i piąty, niepełny, na ostatnich 5 uczniów. W sumie 5 autokarów.',
  },
];

interface SchoolTripChallengeProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: wycieczka szkolna pokazuje, że czasem resztę trzeba zaokrąglić w górę, nie odrzucić. */
export function SchoolTripChallenge({ color, onComplete }: SchoolTripChallengeProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 border p-4" style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}>
        <Bus className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Szkoła organizuje wycieczkę i wynajmuje autokary. Uważaj: w tym zadaniu resztę czasem
          trzeba zaokrąglić w górę, bo każdy uczeń — nawet ten z „resztki” — też potrzebuje miejsca.
        </p>
      </div>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
