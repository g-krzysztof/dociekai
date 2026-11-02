'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'przez-2',
    prompt: 'Czy 358 dzieli się przez 2?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Tak' },
      { id: 'b', text: 'Nie' },
    ],
    correctId: 'a',
    explanation: 'Ostatnia cyfra to 8 — parzysta, więc 358 dzieli się przez 2.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'przez-5',
    prompt: 'Czy 605 dzieli się przez 5?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Nie' },
      { id: 'b', text: 'Tak' },
    ],
    correctId: 'b',
    explanation: 'Ostatnia cyfra to 5, więc 605 dzieli się przez 5.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'przez-4',
    prompt: 'Czy 732 dzieli się przez 4?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Tak' },
      { id: 'b', text: 'Nie' },
    ],
    correctId: 'a',
    explanation: 'Ostatnie dwie cyfry to 32, a 32 : 4 = 8, więc 732 dzieli się przez 4.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'przez-9',
    prompt: 'Czy 891 dzieli się przez 9?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Nie' },
      { id: 'b', text: 'Tak' },
    ],
    correctId: 'b',
    explanation: 'Suma cyfr to 8 + 9 + 1 = 18, a 18 : 9 = 2, więc 891 dzieli się przez 9.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'konczy-sie-piatka',
    prompt: 'Liczba kończy się cyfrą 5. Przez które z tych liczb na pewno się NIE dzieli?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Tylko przez 2' },
      { id: 'b', text: 'Przez 2, 4 i 10' },
      { id: 'c', text: 'Przez 3 i 9' },
      { id: 'd', text: 'Przez żadną z nich' },
    ],
    correctId: 'b',
    explanation: 'Liczba kończąca się na 5 jest nieparzysta, więc nie dzieli się przez 2 — a skoro nie dzieli się przez 2, nie dzieli się też przez 4 ani przez 10 (te wymagają cyfry 0 na końcu).',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'lamiglowka-2-i-5',
    prompt: 'Szukam najmniejszej liczby trzycyfrowej, która dzieli się jednocześnie przez 2 i przez 5. Jaka to liczba?',
    type: 'input',
    answer: '100',
    explanation: 'Liczba podzielna i przez 2, i przez 5 musi kończyć się na 0 — najmniejsza taka liczba trzycyfrowa to 100.',
    difficulty: { code: D.code, name: D.name },
  },
];

interface DivisibilityDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) o cechach podzielności. */
export function DivisibilityDrill({ color, onComplete }: DivisibilityDrillProps) {
  return <DiagnosticQuiz tasks={TASKS} color={color} onFinish={() => onComplete?.()} />;
}
