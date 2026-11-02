'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const TASKS: DiagnosticTask[] = [
  {
    id: 'k1',
    prompt: '848 : 4 =',
    type: 'input',
    answer: '212',
    explanation: 'Każda cyfra dzielnej jest większa lub równa 4, więc żaden krok nie musi łączyć dwóch cyfr: 2, 1, 2.',
    difficulty: DIFFICULTY_LEVELS[0],
  },
  {
    id: 'k2',
    prompt: '396 : 3 =',
    type: 'input',
    answer: '132',
    explanation: 'Dzieli się bez reszty w każdym kroku: 3 : 3 = 1, 9 : 3 = 3, 6 : 3 = 2.',
    difficulty: DIFFICULTY_LEVELS[0],
  },
  {
    id: 'p1',
    prompt: '168 : 4 =',
    type: 'input',
    answer: '42',
    explanation: 'Sama pierwsza cyfra (1) jest mniejsza od 4, więc pierwszy krok łączy dwie cyfry: 16 : 4 = 4. Potem 8 : 4 = 2.',
    difficulty: DIFFICULTY_LEVELS[1],
  },
  {
    id: 'p2',
    prompt: '918 : 9 =',
    type: 'input',
    answer: '102',
    explanation: 'Środkowa cyfra (1) jest mniejsza od 9, więc w ilorazie zapisujemy 0 i od razu znosimy kolejną cyfrę — inaczej wyjdzie tylko dwucyfrowy wynik zamiast 102.',
    difficulty: DIFFICULTY_LEVELS[1],
  },
  {
    id: 'r1',
    prompt: '743 : 6 = ? (iloraz i reszta)',
    type: 'choice',
    options: [
      { id: 'a', text: '124 r 5' },
      { id: 'b', text: '123 r 0' },
      { id: 'c', text: '123 r 5' },
      { id: 'd', text: '23 r 5' },
    ],
    correctId: 'c',
    explanation: '7 : 6 = 1 r 1. 14 : 6 = 2 r 2. 23 : 6 = 3 r 5 — 5 to już ostateczna, nieskonsumowana reszta.',
    difficulty: DIFFICULTY_LEVELS[2],
  },
  {
    id: 'r2',
    prompt: '1685 : 5 =',
    type: 'input',
    answer: '337',
    explanation: 'Pierwsza cyfra (1) jest za mała, więc start to 16 : 5 = 3 r 1. Potem 18 : 5 = 3 r 3. Na końcu 35 : 5 = 7.',
    difficulty: DIFFICULTY_LEVELS[2],
  },
  {
    id: 'd1',
    prompt: 'Ktoś policzył 636 : 6 i wyszło mu 16 zamiast prawidłowych 106. Co dokładnie zrobił źle?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Zniesioną cyfrę 3 (mniejszą od 6) pominął, zamiast zapisać w ilorazie 0' },
      { id: 'b', text: 'Pomylił dzielenie z mnożeniem' },
      { id: 'c', text: 'Źle ustawił dzielną i dzielnik względem siebie' },
      { id: 'd', text: 'Zapomniał o reszcie na samym końcu' },
    ],
    correctId: 'a',
    explanation:
      '6 : 6 = 1. Potem zniesiona cyfra 3 jest mniejsza od 6 — trzeba zapisać 0 i dopiero razem z kolejną cyfrą liczyć dalej (36 : 6 = 6). Pominięcie tego zera daje za krótki wynik: 16 zamiast 106.',
    difficulty: DIFFICULTY_LEVELS[3],
  },
  {
    id: 'd2',
    prompt: 'Bez liczenia dokładnie: 483 : 6 jest bliżej 80 czy 70?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Bliżej 70' },
      { id: 'b', text: 'Bliżej 80' },
    ],
    correctId: 'b',
    explanation: '483 to prawie 480, a 480 : 6 = 80 dokładnie. Dokładny wynik pisemny (80 r 3) to potwierdza.',
    difficulty: DIFFICULTY_LEVELS[3],
  },
];

interface DzielenieDrillProps {
  color: string;
  onComplete?: (score: number, total: number) => void;
}

/** Ćwiczenia: 8 zadań K/P/R/D, od dzielenia bez łączenia cyfr po pułapkę zera w ilorazie i szacowanie wyniku. */
export function DzielenieDrill({ color, onComplete }: DzielenieDrillProps) {
  return <DiagnosticQuiz tasks={TASKS} color={color} onFinish={onComplete} />;
}
