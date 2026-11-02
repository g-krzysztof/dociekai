'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const TASKS: DiagnosticTask[] = [
  {
    id: 'k1',
    prompt: '20 × 4 =',
    type: 'input',
    answer: '80',
    explanation: 'Jedno zero do obcięcia z 20. Rdzeń 2 × 4 = 8, dopisujemy zero: 80.',
    difficulty: DIFFICULTY_LEVELS[0],
  },
  {
    id: 'k2',
    prompt: '300 × 3 =',
    type: 'input',
    answer: '900',
    explanation: 'Dwa zera z 300. Rdzeń 3 × 3 = 9, dopisujemy oba zera: 900.',
    difficulty: DIFFICULTY_LEVELS[0],
  },
  {
    id: 'p1',
    prompt: '50 × 60 =',
    type: 'input',
    answer: '3000',
    explanation:
      'Po jednym zerze z każdej liczby, razem dwa. Rdzeń 5 × 6 = 30 — sam kończy się zerem! Dopisujemy do niego jeszcze dwa: 3000.',
    difficulty: DIFFICULTY_LEVELS[1],
  },
  {
    id: 'p2',
    prompt: '700 × 90 =',
    type: 'input',
    answer: '63000',
    explanation: 'Dwa zera z 700, jedno z 90 — razem trzy. Rdzeń 7 × 9 = 63, dopisujemy trzy zera: 63000.',
    difficulty: DIFFICULTY_LEVELS[1],
  },
  {
    id: 'r1',
    prompt: '25 × 40 =',
    type: 'input',
    answer: '1000',
    explanation: 'Jedno zero z 40. Rdzeń 25 × 4 = 100 — sam ma dwa zera. Dopisujemy jeszcze jedno: 1000.',
    difficulty: DIFFICULTY_LEVELS[2],
  },
  {
    id: 'r2',
    prompt: '35 × 200 =',
    type: 'input',
    answer: '7000',
    explanation: 'Dwa zera z 200. Rdzeń 35 × 2 = 70 — sam kończy się zerem. Dopisujemy do niego jeszcze dwa: 7000.',
    difficulty: DIFFICULTY_LEVELS[2],
  },
  {
    id: 'd1',
    prompt:
      'Zosia liczy 60 × 500. Obcina 3 zera (jedno z 60, dwa z 500), liczy rdzeń 6 × 5 = 30 i dopisuje do niego 3 zera, otrzymując 30000. Czy ma rację?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Tak, 30000 to poprawny wynik' },
      { id: 'b', text: 'Nie, powinno być 3000' },
      { id: 'c', text: 'Nie, powinno być 300000' },
      { id: 'd', text: 'Nie, trzeba było pomnożyć 6 × 50, nie 6 × 5' },
    ],
    correctId: 'a',
    explanation:
      '60 × 500 rzeczywiście daje 30000. Zosia poprawnie dopisała 3 obcięte zera do CAŁEGO rdzenia 30 (który już sam ma jedno własne zero) — 30 + 000 = 30000.',
    difficulty: DIFFICULTY_LEVELS[3],
  },
  {
    id: 'd2',
    prompt: 'Ile zer na końcu będzie miał wynik działania 40 × 25, jeśli rdzeń to 4 × 25 = 100?',
    type: 'choice',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '2' },
      { id: 'c', text: '3' },
      { id: 'd', text: '4' },
    ],
    correctId: 'c',
    explanation:
      'Obcięliśmy tylko jedno zero (z 40), ale rdzeń 100 sam ma już dwa własne zera. Dopisujemy nasze jedno zero do 100 → 1000, czyli trzy zera razem.',
    difficulty: DIFFICULTY_LEVELS[3],
  },
];

interface ZakonczoneZeramiDrillProps {
  color: string;
  onComplete?: (score: number, total: number) => void;
}

/** Ćwiczenia: 8 zadań K/P/R/D, od pojedynczego zera po przypadki, w których sam rdzeń kończy się zerem. */
export function ZakonczoneZeramiDrill({ color, onComplete }: ZakonczoneZeramiDrillProps) {
  return <DiagnosticQuiz tasks={TASKS} color={color} onFinish={onComplete} />;
}
