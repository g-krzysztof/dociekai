'use client';

import { Timer } from 'lucide-react';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';

interface Runner {
  name: string;
  time: string;
}

/** Kolejność celowo alfabetyczna, nie wg czasu — pytania wymagają realnego porównania liczb. */
const RUNNERS: Runner[] = [
  { name: 'Kuba', time: '9,8' },
  { name: 'Marek', time: '9,79' },
  { name: 'Ola', time: '10,05' },
  { name: 'Zosia', time: '9,84' },
];

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'odczyt-zosia',
    question: 'Jak przeczytamy na głos czas Zosi (9,84 s)?',
    options: [
      { id: 'a', text: 'dziewięć całych i osiemdziesiąt cztery setne' },
      { id: 'b', text: 'dziewięć przecinek osiem cztery' },
      { id: 'c', text: 'dziewięćdziesiąt osiem i cztery setne' },
      { id: 'd', text: 'dziewięć całych i osiem, cztery' },
    ],
    correctId: 'a',
    explanation:
      'Część całkowita to „dziewięć całych”, a dwie cyfry po przecinku czytamy razem, jako jedną liczbę: „osiemdziesiąt cztery setne”.',
  },
  {
    id: 'kuba-setne',
    question: 'Czas Kuby to 9,8 s. Jak zapiszemy go z dwoma miejscami po przecinku (w setnych)?',
    options: [
      { id: 'a', text: '9,08 s' },
      { id: 'b', text: '9,80 s' },
      { id: 'c', text: '9,008 s' },
      { id: 'd', text: '0,98 s' },
    ],
    correctId: 'b',
    explanation: 'Dopisanie zera na końcu części dziesiętnej nie zmienia wartości: 9,8 = 9,80.',
  },
  {
    id: 'najszybszy',
    question: 'Kto z czwórki pobiegł najszybciej, czyli miał najkrótszy czas?',
    options: [
      { id: 'a', text: 'Zosia' },
      { id: 'b', text: 'Kuba' },
      { id: 'c', text: 'Ola' },
      { id: 'd', text: 'Marek' },
    ],
    correctId: 'd',
    explanation: '9,79 s (Marek) jest najmniejsze z czterech czasów — mniej sekund znaczy szybszy bieg.',
  },
  {
    id: 'piec-setnych-nad-dziesiec',
    question: 'Który zawodnik miał czas równy „dziesięć całych i pięć setnych”?',
    options: [
      { id: 'a', text: 'Zosia' },
      { id: 'b', text: 'Kuba' },
      { id: 'c', text: 'Ola' },
      { id: 'd', text: 'Marek' },
    ],
    correctId: 'c',
    explanation: '10,05 s to właśnie „dziesięć całych i pięć setnych” — czas Oli.',
  },
];

interface RaceTimesChallengeProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: czasy z biegu na 60 m jako materiał do ćwiczenia czytania i porównywania ułamków dziesiętnych. */
export function RaceTimesChallenge({ color, onComplete }: RaceTimesChallengeProps) {
  return (
    <div className="space-y-5">
      <ul className="divide-y border">
        {RUNNERS.map((runner) => (
          <li key={runner.name} className="flex items-center gap-3 px-4 py-3">
            <Timer className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            <span className="flex-1 text-sm font-medium sm:text-base">{runner.name}</span>
            <span className="font-mono text-base font-bold tabular-nums sm:text-lg" style={{ color }}>
              {runner.time} s
            </span>
          </li>
        ))}
      </ul>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
