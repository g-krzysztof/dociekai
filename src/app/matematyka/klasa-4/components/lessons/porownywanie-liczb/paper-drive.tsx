'use client';

import { Recycle } from 'lucide-react';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';

interface ClassResult {
  name: string;
  kg: number;
}

/** Kolejność alfabetyczna, nie wg wyniku — pytania wymagają realnego porównania liczb. */
const RESULTS: ClassResult[] = [
  { name: 'Klasa 4a', kg: 342 },
  { name: 'Klasa 4b', kg: 298 },
  { name: 'Klasa 4c', kg: 356 },
  { name: 'Klasa 4d', kg: 301 },
];

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'najwiecej',
    question: 'Która klasa zebrała najwięcej makulatury?',
    options: [
      { id: 'a', text: 'Klasa 4a' },
      { id: 'b', text: 'Klasa 4b' },
      { id: 'c', text: 'Klasa 4c' },
      { id: 'd', text: 'Klasa 4d' },
    ],
    correctId: 'c',
    explanation: '356 kg (klasa 4c) to najwyższy wynik z całej tabeli.',
  },
  {
    id: 'znak-4a-4d',
    question: 'Który znak pasuje? Wynik klasy 4a (342 kg) ___ wynik klasy 4d (301 kg)',
    options: [
      { id: 'a', text: '<' },
      { id: 'b', text: '>' },
      { id: 'c', text: '=' },
    ],
    correctId: 'b',
    explanation: 'Obie liczby mają 3 cyfry i zaczynają się na 3. Na miejscu dziesiątek: 4 > 0, więc 342 > 301.',
  },
  {
    id: 'drugie-miejsce',
    question:
      'Ustawcie klasy w kolejności rosnącej wyników. Która klasa jest na drugim miejscu, licząc od najmniejszego wyniku?',
    options: [
      { id: 'a', text: 'Klasa 4a' },
      { id: 'b', text: 'Klasa 4b' },
      { id: 'c', text: 'Klasa 4c' },
      { id: 'd', text: 'Klasa 4d' },
    ],
    correctId: 'd',
    explanation: 'Kolejność rosnąca: 4b (298), 4d (301), 4a (342), 4c (356) — na drugim miejscu jest 4d.',
  },
  {
    id: 'roznica',
    question: 'O ile kilogramów klasa 4c wyprzedza klasę 4b?',
    options: [
      { id: 'a', text: '58 kg' },
      { id: 'b', text: '54 kg' },
      { id: 'c', text: '48 kg' },
      { id: 'd', text: '68 kg' },
    ],
    correctId: 'a',
    explanation: '356 kg − 298 kg = 58 kg.',
  },
];

interface PaperDriveProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: zbiórka makulatury jako materiał do porównywania i porządkowania wyników. */
export function PaperDrive({ color, onComplete }: PaperDriveProps) {
  return (
    <div className="space-y-5">
      <ul className="divide-y border">
        {RESULTS.map((result) => (
          <li key={result.name} className="flex items-center gap-3 px-4 py-3">
            <Recycle className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            <span className="flex-1 text-sm font-medium sm:text-base">{result.name}</span>
            <span className="font-mono text-base font-bold tabular-nums sm:text-lg" style={{ color }}>
              {result.kg.toLocaleString('pl-PL')} kg
            </span>
          </li>
        ))}
      </ul>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
