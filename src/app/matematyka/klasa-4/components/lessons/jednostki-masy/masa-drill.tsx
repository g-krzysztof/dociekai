'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'dag-na-g',
    prompt: 'Ile gramów ma 1 dag?',
    type: 'choice',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '10' },
      { id: 'c', text: '100' },
      { id: 'd', text: '1000' },
    ],
    correctId: 'b',
    explanation: '1 dag to 10 g — z dekagramów na gramy zawsze mnożysz przez 10.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'kg-na-dag',
    prompt: 'Ile dekagramów ma 1 kg?',
    type: 'choice',
    options: [
      { id: 'a', text: '10' },
      { id: 'b', text: '1000' },
      { id: 'c', text: '100' },
      { id: 'd', text: '10 000' },
    ],
    correctId: 'c',
    explanation: '1 kg to 100 dag — tu skok jest ×100, nie ×10 jak wszędzie indziej.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'kg-i-dag-na-g',
    prompt: 'Zamień na gramy: 2 kg 30 dag = ? g',
    type: 'input',
    answer: '2300',
    unit: 'g',
    explanation: '2 kg to 2000 g, plus 30 dag to 300 g. Razem 2000 g + 300 g = 2300 g.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 't-na-kg',
    prompt: 'Zamień na kilogramy: 4 t = ? kg',
    type: 'input',
    answer: '4000',
    unit: 'kg',
    explanation: 'Z ton na kilogramy mnożysz przez 1000: 4 t = 4000 kg.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'porownanie-g-dag',
    prompt: 'Co jest cięższe: 900 g czy 8 dag?',
    type: 'choice',
    options: [
      { id: 'a', text: '900 g' },
      { id: 'b', text: '8 dag' },
      { id: 'c', text: 'To samo' },
      { id: 'd', text: 'Nie da się porównać' },
    ],
    correctId: 'a',
    explanation: '8 dag to tylko 80 g. 900 g > 80 g, więc 900 g jest cięższe.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'plecak-zadanie',
    prompt:
      'Plecak turystyczny waży 3 kg, a w środku niesiesz jeszcze bidon o masie 45 dag. Ile gramów waży to razem?',
    type: 'input',
    answer: '3450',
    unit: 'g',
    explanation: '3 kg to 3000 g, 45 dag to 450 g. Razem 3000 g + 450 g = 3450 g.',
    difficulty: { code: D.code, name: D.name },
  },
];

interface MasaDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) o zamianie i porównywaniu jednostek masy. */
export function MasaDrill({ color, onComplete }: MasaDrillProps) {
  return <DiagnosticQuiz tasks={TASKS} color={color} onFinish={() => onComplete?.()} />;
}
