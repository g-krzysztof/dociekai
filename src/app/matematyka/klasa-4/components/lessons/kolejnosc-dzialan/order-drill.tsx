'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'podstawowe-mnozenie',
    prompt: '4 + 3 × 2 = ?',
    type: 'input',
    answer: '10',
    explanation: '3 × 2 = 6, więc 4 + 6 = 10.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'podstawowy-nawias',
    prompt: '(5 + 1) × 3 = ?',
    type: 'input',
    answer: '18',
    explanation: '5 + 1 = 6, więc 6 × 3 = 18.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'odejmowanie-mnozenie',
    prompt: '20 − 4 × 4 = ?',
    type: 'input',
    answer: '4',
    explanation: '4 × 4 = 16, więc 20 − 16 = 4.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'dwa-priorytety',
    prompt: '16 : 2 + 3 × 2 = ?',
    type: 'input',
    answer: '14',
    explanation: '16 : 2 = 8, a 3 × 2 = 6, więc 8 + 6 = 14.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'pulapka-ola',
    prompt: 'Ola policzyła 12 − 2 × 3 jako (12 − 2) × 3 = 30. Co jest w tym nie tak?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Nic, to poprawny wynik' },
      { id: 'b', text: 'Powinno być 12 − (2 × 3) = 6' },
      { id: 'c', text: 'Powinno być (12 − 2 × 3) = 10 × 3' },
      { id: 'd', text: 'Wynik i tak jest ten sam' },
    ],
    correctId: 'b',
    explanation: 'W zapisie nie ma żadnego nawiasu — Ola dodała go sobie. Bez nawiasu mnożenie liczysz najpierw: 2 × 3 = 6, więc 12 − 6 = 6.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'lamiglowka-nawias',
    prompt: 'Gdzie trzeba postawić nawiasy w 2 + 3 × 4, żeby wynik wyniósł 20?',
    type: 'choice',
    options: [
      { id: 'a', text: '(2 + 3) × 4' },
      { id: 'b', text: '2 + (3 × 4)' },
      { id: 'c', text: '(2 + 3 × 4)' },
      { id: 'd', text: 'Nigdzie — zawsze wyjdzie 20' },
    ],
    correctId: 'a',
    explanation: '(2 + 3) × 4 = 5 × 4 = 20 — nawias wymusza dodawanie przed mnożeniem.',
    difficulty: { code: D.code, name: D.name },
  },
];

interface OrderDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) o kolejności wykonywania działań. */
export function OrderDrill({ color, onComplete }: OrderDrillProps) {
  return <DiagnosticQuiz tasks={TASKS} color={color} onFinish={() => onComplete?.()} />;
}
