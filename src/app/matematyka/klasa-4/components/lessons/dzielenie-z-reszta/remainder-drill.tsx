'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'iloraz-reszta-17-5',
    prompt: '17 : 5 = ? (iloraz i reszta)',
    type: 'choice',
    options: [
      { id: 'a', text: '2 r 3' },
      { id: 'b', text: '3 r 2' },
      { id: 'c', text: '3 r 5' },
      { id: 'd', text: '4 r 0' },
    ],
    correctId: 'b',
    explanation: '5 × 3 = 15, a 17 − 15 = 2, więc 17 : 5 = 3 r 2.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'reszta-22-6',
    prompt: 'Ile wynosi reszta z dzielenia 22 : 6?',
    type: 'input',
    answer: '4',
    explanation: '6 × 3 = 18, a 22 − 18 = 4 — to jest reszta.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'iloraz-35-8',
    prompt: 'Ile wynosi iloraz z dzielenia 35 : 8?',
    type: 'input',
    answer: '4',
    explanation: '8 × 4 = 32, co jest największą wielokrotnością 8 nieprzekraczającą 35 — iloraz to 4 (reszta 3).',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'ktore-bez-reszty',
    prompt: 'Które z tych dzieleń da resztę 0?',
    type: 'choice',
    options: [
      { id: 'a', text: '31 : 5' },
      { id: 'b', text: '36 : 6' },
      { id: 'c', text: '29 : 4' },
      { id: 'd', text: '50 : 7' },
    ],
    correctId: 'b',
    explanation: '36 : 6 = 6 r 0 — jedyne z tych czterech, które dzieli się bez reszty.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'pulapka-kuba',
    prompt: 'Kuba policzył: 26 : 5 = 4 r 6. Co jest w tym nie tak?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Nic, to poprawny wynik' },
      { id: 'b', text: 'Reszta nie może być większa lub równa dzielnikowi — powinno być 5 r 1' },
      { id: 'c', text: 'Iloraz powinien być 6' },
      { id: 'd', text: '26 nie dzieli się przez 5' },
    ],
    correctId: 'b',
    explanation: 'Reszta (6) jest większa niż dzielnik (5), więc dzielenie nie jest skończone — poprawnie: 5 × 5 = 25, 26 − 25 = 1, czyli 5 r 1.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'lamiglowka-liczba',
    prompt: 'Szukam liczby, która przy dzieleniu przez 7 daje resztę 3, a iloraz to 5. Jaka to liczba?',
    type: 'input',
    answer: '38',
    explanation: '7 × 5 = 35, a 35 + 3 = 38 — to jedyna liczba, która pasuje.',
    difficulty: { code: D.code, name: D.name },
  },
];

interface RemainderDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) o dzieleniu z resztą. */
export function RemainderDrill({ color, onComplete }: RemainderDrillProps) {
  return <DiagnosticQuiz tasks={TASKS} color={color} onFinish={() => onComplete?.()} />;
}
