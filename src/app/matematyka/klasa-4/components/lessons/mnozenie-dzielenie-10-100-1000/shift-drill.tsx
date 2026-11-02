'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'razy-10',
    prompt: '34 × 10 = ?',
    type: 'input',
    answer: '340',
    explanation: 'Mnożenie przez 10 przesuwa każdą cyfrę o jedno miejsce w lewo i dopisuje jedno zero: 34 → 340.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'dziel-10',
    prompt: '600 : 10 = ?',
    type: 'input',
    answer: '60',
    explanation: 'Dzielenie przez 10 skreśla jedno zero z końca: 600 → 60.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'razy-100',
    prompt: '45 × 100 = ?',
    type: 'input',
    answer: '4500',
    explanation: 'Mnożenie przez 100 dopisuje dwa zera: 45 → 4500.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'dziel-100',
    prompt: '7200 : 100 = ?',
    type: 'input',
    answer: '72',
    explanation: 'Dzielenie przez 100 skreśla dwa zera z końca: 7200 → 72.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'pulapka-450',
    prompt: 'Ile wynosi 450 : 100?',
    type: 'choice',
    options: [
      { id: 'a', text: '4' },
      { id: 'b', text: '45' },
      { id: 'c', text: '4,5' },
      { id: 'd', text: 'Nie da się bez reszty' },
    ],
    correctId: 'd',
    explanation:
      '450 ma na końcu tylko jedno zero, a do podzielenia przez 100 potrzeba dwóch — bez reszty się nie da (o zapisie takich wyników dowiesz się w lekcji o ułamkach dziesiętnych).',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'lamiglowka-mnozenia',
    prompt: 'Zaczynasz od liczby 6. Ile razy musisz pomnożyć ją przez 10, żeby wynik przekroczył 5000?',
    type: 'input',
    answer: '3',
    unit: 'razy',
    explanation: '6 → 60 → 600 → 6000 — dopiero po trzecim mnożeniu przez 10 wynik przekracza 5000 (6000 > 5000).',
    difficulty: { code: D.code, name: D.name },
  },
];

interface ShiftDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) o mnożeniu i dzieleniu przez 10, 100, 1000. */
export function ShiftDrill({ color, onComplete }: ShiftDrillProps) {
  return <DiagnosticQuiz tasks={TASKS} color={color} onFinish={() => onComplete?.()} />;
}
