'use client';

import { Landmark } from 'lucide-react';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'rok-budowy',
    question: 'Na starej kamienicy wykuto datę budowy: MDCCCXCII. Który to rok?',
    options: [
      { id: 'a', text: '1802' },
      { id: 'b', text: '1892' },
      { id: 'c', text: '1982' },
      { id: 'd', text: '1882' },
    ],
    correctId: 'b',
    explanation: 'M = 1000, DCCC = 800, XC = 90, II = 2. Razem: 1000 + 800 + 90 + 2 = 1892.',
  },
  {
    id: 'napisy-koncowe',
    question: 'W napisach końcowych filmu widzisz rok MMXXIV. Który to rok?',
    options: [
      { id: 'a', text: '2014' },
      { id: 'b', text: '2034' },
      { id: 'c', text: '2024' },
      { id: 'd', text: '2004' },
    ],
    correctId: 'c',
    explanation: 'MM = 2000, XX = 20, IV = 4. Razem: 2000 + 20 + 4 = 2024.',
  },
  {
    id: 'zegar-wieza',
    question:
      'Zegar na wieży ratusza ma tarczę z cyframi rzymskimi. Wskazówka stoi przy IX. Która to godzina?',
    options: [
      { id: 'a', text: '11' },
      { id: 'b', text: '6' },
      { id: 'c', text: '4' },
      { id: 'd', text: '9' },
    ],
    correctId: 'd',
    explanation: 'IX to I przed X — odejmowanie: 10 − 1 = 9.',
  },
  {
    id: 'papiez',
    question:
      'W książce historii czytasz o „Janie Pawle II". Którym z kolei papieżem o tym imieniu był?',
    options: [
      { id: 'a', text: 'Drugim' },
      { id: 'b', text: 'Trzecim' },
      { id: 'c', text: 'Czwartym' },
      { id: 'd', text: 'Pierwszym' },
    ],
    correctId: 'a',
    explanation: 'II to zwykłe 2 — „drugi" w imieniu, tak samo jak w numeracji królów i papieży.',
  },
  {
    id: 'numer-pomnika',
    question: 'Na cokole pomnika wyryto numer rocznika: XLIX. Ile to w zwykłych cyfrach?',
    options: [
      { id: 'a', text: '39' },
      { id: 'b', text: '49' },
      { id: 'c', text: '51' },
      { id: 'd', text: '41' },
    ],
    correctId: 'b',
    explanation: 'XL to 40 (50 − 10), IX to 9 (10 − 1). Razem: 40 + 9 = 49.',
  },
];

interface InscriptionChallengeProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: napisy rzymskimi cyframi w realnych kontekstach — budynki, filmy, zegary, imiona. */
export function InscriptionChallenge({ color, onComplete }: InscriptionChallengeProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
        <Landmark className="h-8 w-8 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Rzymskie cyfry wciąż otaczają cię na co dzień — na starych budynkach, zegarach, w napisach
          filmowych i imionach władców. Odczytaj je tak, jak dopiero co się nauczyłeś.
        </p>
      </div>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
