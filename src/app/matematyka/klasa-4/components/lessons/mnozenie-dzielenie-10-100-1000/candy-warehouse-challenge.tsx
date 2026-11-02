'use client';

import { Package } from 'lucide-react';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';

interface PackagingLevel {
  name: string;
  pieces: number;
}

const LEVELS: PackagingLevel[] = [
  { name: '1 cukierek (sztuka)', pieces: 1 },
  { name: '1 paczka = 10 cukierków', pieces: 10 },
  { name: '1 karton = 10 paczek', pieces: 100 },
  { name: '1 paleta = 10 kartonów', pieces: 1000 },
];

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'kartony-do-sztuk',
    question: 'Hurtownia ma 6 kartonów cukierków. Ile to sztuk?',
    options: [
      { id: 'a', text: '60' },
      { id: 'b', text: '600' },
      { id: 'c', text: '6000' },
      { id: 'd', text: '6' },
    ],
    correctId: 'b',
    explanation: '1 karton to 100 cukierków, więc 6 kartonów to 6 × 100 = 600 sztuk.',
  },
  {
    id: 'palety-do-sztuk',
    question: 'Sklep zamówił 3 palety. Ile cukierków dostanie?',
    options: [
      { id: 'a', text: '300' },
      { id: 'b', text: '30' },
      { id: 'c', text: '3000' },
      { id: 'd', text: '30000' },
    ],
    correctId: 'c',
    explanation: '1 paleta to 1000 cukierków, więc 3 palety to 3 × 1000 = 3000 sztuk.',
  },
  {
    id: 'paczki-do-kartonow',
    question: 'W magazynie jest 80 paczek. Ile to pełnych kartonów?',
    options: [
      { id: 'a', text: '8' },
      { id: 'b', text: '80' },
      { id: 'c', text: '800' },
      { id: 'd', text: '0,8' },
    ],
    correctId: 'a',
    explanation: '1 karton to 10 paczek, więc 80 paczek to 80 : 10 = 8 kartonów.',
  },
  {
    id: 'sztuki-do-paczek',
    question: 'Trzeba spakować 250 cukierków w paczki po 10 sztuk. Ile paczek się z tego zrobi?',
    options: [
      { id: 'a', text: '2500' },
      { id: 'b', text: '25' },
      { id: 'c', text: '2,5' },
      { id: 'd', text: '250' },
    ],
    correctId: 'b',
    explanation: '250 : 10 = 25 — dokładnie tyle paczek po 10 sztuk zmieści wszystkie cukierki, bez reszty.',
  },
];

interface CandyWarehouseChallengeProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: hurtownia cukierków, w której każde opakowanie jest 10 razy większe od poprzedniego. */
export function CandyWarehouseChallenge({ color, onComplete }: CandyWarehouseChallengeProps) {
  return (
    <div className="space-y-5">
      <ul className="divide-y border">
        {LEVELS.map((level) => (
          <li key={level.name} className="flex items-center gap-3 px-4 py-3">
            <Package className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            <span className="flex-1 text-sm font-medium sm:text-base">{level.name}</span>
            <span className="font-mono text-base font-bold tabular-nums sm:text-lg" style={{ color }}>
              {level.pieces.toLocaleString('pl-PL')} szt.
            </span>
          </li>
        ))}
      </ul>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
