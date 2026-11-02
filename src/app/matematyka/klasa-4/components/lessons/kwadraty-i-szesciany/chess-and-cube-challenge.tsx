'use client';

import { Grid3x3 } from 'lucide-react';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'szachownica-pola',
    question: 'Szachownica ma 8 wierszy i 8 kolumn pól. Ile pól ma w sumie?',
    options: [
      { id: 'a', text: '16' },
      { id: 'b', text: '64' },
      { id: 'c', text: '56' },
      { id: 'd', text: '32' },
    ],
    correctId: 'b',
    explanation: 'Szachownica to kwadrat o boku 8, więc pól jest 8² = 8 × 8 = 64.',
  },
  {
    id: 'rubik-kostki',
    question: 'Kostka Rubika to sześcian o boku 3 małych kostek. Ile małych kostek zmieściłoby się w środku, licząc wszystkie warstwy?',
    options: [
      { id: 'a', text: '9' },
      { id: 'b', text: '18' },
      { id: 'c', text: '27' },
      { id: 'd', text: '33' },
    ],
    correctId: 'c',
    explanation: 'To sześcian o boku 3, więc 3³ = 3 × 3 × 3 = 27 małych kostek.',
  },
  {
    id: 'wieksza-kostka',
    question: 'Gdyby ktoś zbudował większą „kostkę Rubika” o boku 4 zamiast 3, ile małych kostek by potrzebował?',
    options: [
      { id: 'a', text: '64' },
      { id: 'b', text: '48' },
      { id: 'c', text: '16' },
      { id: 'd', text: '12' },
    ],
    correctId: 'a',
    explanation: 'Sześcian o boku 4 to 4³ = 4 × 4 × 4 = 64 małe kostki.',
  },
  {
    id: 'wieksza-szachownica',
    question: 'Ile pól miałaby szachownica o boku 10, gdyby ktoś taką zrobił?',
    options: [
      { id: 'a', text: '20' },
      { id: 'b', text: '100' },
      { id: 'c', text: '1000' },
      { id: 'd', text: '40' },
    ],
    correctId: 'b',
    explanation: 'Kwadrat o boku 10 to 10² = 10 × 10 = 100 pól.',
  },
];

interface ChessAndCubeChallengeProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: szachownica (kwadrat) i kostka Rubika (sześcian) jako prawdziwe przedmioty z tych wzorów. */
export function ChessAndCubeChallenge({ color, onComplete }: ChessAndCubeChallengeProps) {
  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <Grid3x3 className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Dwa znane przedmioty ukrywają dokładnie te wzory: szachownica to kwadrat, a kostka Rubika
          to sześcian.
        </p>
      </div>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
