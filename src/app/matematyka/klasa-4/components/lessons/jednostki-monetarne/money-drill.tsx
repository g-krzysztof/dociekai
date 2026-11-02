'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'zl-na-grosze',
    prompt: 'Ile to groszy: 2 zł 10 gr?',
    type: 'choice',
    options: [
      { id: 'a', text: '201' },
      { id: 'b', text: '210' },
      { id: 'c', text: '21' },
      { id: 'd', text: '120' },
    ],
    correctId: 'b',
    explanation: '2 zł to 200 gr, plus 10 gr = 210 gr.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'grosze-na-zl',
    prompt: '639 gr to:',
    type: 'choice',
    options: [
      { id: 'a', text: '6 zł 39 gr' },
      { id: 'b', text: '63 zł 9 gr' },
      { id: 'c', text: '6 zł 3 gr' },
      { id: 'd', text: '639 zł' },
    ],
    correctId: 'a',
    explanation: '639 : 100 = 6 reszty 39, więc 639 gr to 6 zł 39 gr.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'dodawanie-w-groszach',
    prompt: 'Oblicz: 12 zł 80 gr + 5 zł 45 gr = ? (wpisz wynik w groszach)',
    type: 'input',
    answer: '1825',
    unit: 'gr',
    explanation: '80 gr + 45 gr = 125 gr, czyli 1 zł 25 gr. 12 zł + 5 zł + 1 zł = 18 zł, razem 1825 gr.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'odejmowanie-w-groszach',
    prompt: 'Oblicz: 20 zł − 7 zł 60 gr = ? (wpisz wynik w groszach)',
    type: 'input',
    answer: '1240',
    unit: 'gr',
    explanation: '20 zł to 1000 gr. 1000 − 760 = 240 gr powyżej 12 zł, czyli 12 zł 40 gr = 1240 gr.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'pulapka-groszy',
    prompt: 'Co jest warte więcej: 3 zł 5 gr czy 3 zł 50 gr?',
    type: 'choice',
    options: [
      { id: 'a', text: 'To samo' },
      { id: 'b', text: '3 zł 5 gr' },
      { id: 'c', text: 'Nie da się porównać' },
      { id: 'd', text: '3 zł 50 gr' },
    ],
    correctId: 'd',
    explanation: '3 zł 5 gr to 305 gr, a 3 zł 50 gr to 350 gr — różnica to całe 45 gr, mimo że zapis wygląda podobnie.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'reszta-w-sklepie',
    prompt:
      'Masz banknot 10 zł. Kupujesz zeszyt za 4 zł 65 gr i długopis za 1 zł 80 gr. Ile wynosi reszta? (wpisz w groszach)',
    type: 'input',
    answer: '355',
    unit: 'gr',
    explanation: 'Zakupy razem: 465 + 180 = 645 gr. Reszta: 1000 − 645 = 355 gr, czyli 3 zł 55 gr.',
    difficulty: { code: D.code, name: D.name },
  },
];

interface MoneyDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) o zamianie i liczeniu pieniędzy. */
export function MoneyDrill({ color, onComplete }: MoneyDrillProps) {
  return <DiagnosticQuiz tasks={TASKS} color={color} onFinish={() => onComplete?.()} />;
}
