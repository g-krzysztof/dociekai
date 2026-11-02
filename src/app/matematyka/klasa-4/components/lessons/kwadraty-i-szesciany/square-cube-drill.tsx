'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'kwadrat-5',
    prompt: '5² = ?',
    type: 'input',
    answer: '25',
    explanation: '5² = 5 × 5 = 25.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'szescian-2',
    prompt: '2³ = ?',
    type: 'input',
    answer: '8',
    explanation: '2³ = 2 × 2 × 2 = 8.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'siedem-kwadrat',
    prompt: 'Ile to jest 7 do kwadratu?',
    type: 'input',
    answer: '49',
    explanation: '7 do kwadratu to 7² = 7 × 7 = 49.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'ktora-nie-kwadratowa',
    prompt: 'Która z tych liczb NIE jest liczbą kwadratową?',
    type: 'choice',
    options: [
      { id: 'a', text: '16' },
      { id: 'b', text: '25' },
      { id: 'c', text: '30' },
      { id: 'd', text: '49' },
    ],
    correctId: 'c',
    explanation: '16 = 4², 25 = 5², 49 = 7², ale żadna liczba pomnożona przez samą siebie nie da 30.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'pulapka-kuba',
    prompt: 'Kuba obliczył 5² jako 5 × 2 = 10. Co jest w tym nie tak?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Nic, to poprawny wynik' },
      { id: 'b', text: 'Powinno być 5 × 5 = 25' },
      { id: 'c', text: 'Powinno być 5 × 3 = 15' },
      { id: 'd', text: '5² to to samo co 2 × 5' },
    ],
    correctId: 'b',
    explanation: 'Kwadrat liczby to mnożenie jej przez samą siebie, nie przez 2 — poprawnie 5² = 5 × 5 = 25.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'lamiglowka-roznica',
    prompt: 'Szukam liczby, której sześcian minus jej kwadrat daje dokładnie 18. Jaka to liczba?',
    type: 'input',
    answer: '3',
    explanation: 'Dla 3: sześcian to 27, kwadrat to 9, a 27 − 9 = 18 — pasuje dokładnie.',
    difficulty: { code: D.code, name: D.name },
  },
];

interface SquareCubeDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) o kwadratach i sześcianach liczb naturalnych. */
export function SquareCubeDrill({ color, onComplete }: SquareCubeDrillProps) {
  return <DiagnosticQuiz tasks={TASKS} color={color} onFinish={() => onComplete?.()} />;
}
