'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'cm-na-mm',
    prompt: 'Ile milimetrów ma 4 cm?',
    type: 'choice',
    options: [
      { id: 'a', text: '400' },
      { id: 'b', text: '40' },
      { id: 'c', text: '4' },
      { id: 'd', text: '14' },
    ],
    correctId: 'b',
    explanation: 'Z centymetrów na milimetry mnożysz przez 10: 4 cm = 4 × 10 = 40 mm.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'dm-na-cm',
    prompt: 'Ile centymetrów ma 2 dm?',
    type: 'choice',
    options: [
      { id: 'a', text: '2' },
      { id: 'b', text: '200' },
      { id: 'c', text: '20' },
      { id: 'd', text: '12' },
    ],
    correctId: 'c',
    explanation: 'Z decymetrów na centymetry mnożysz przez 10: 2 dm = 2 × 10 = 20 cm.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'm-i-cm-na-cm',
    prompt: 'Zamień na centymetry: 3 m 5 cm = ? cm',
    type: 'input',
    answer: '305',
    unit: 'cm',
    explanation: '3 m to 300 cm, plus 5 cm = 305 cm.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'm-na-km',
    prompt: 'Zamień na kilometry: 3200 m = ? km',
    type: 'input',
    answer: '3.2',
    unit: 'km',
    explanation: 'Z metrów na kilometry dzielisz przez 1000: 3200 : 1000 = 3,2 km.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'porownanie-cm-dm',
    prompt: 'Co jest dłuższe: 90 cm czy 8 dm?',
    type: 'choice',
    options: [
      { id: 'a', text: '90 cm' },
      { id: 'b', text: '8 dm' },
      { id: 'c', text: 'To samo' },
      { id: 'd', text: 'Nie da się porównać' },
    ],
    correctId: 'a',
    explanation: '8 dm to 80 cm. 90 cm > 80 cm, więc 90 cm jest dłuższe.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'wstazka-zadanie',
    prompt:
      'Ala ma wstążkę długości 2 m 30 cm. Odcięła kawałek długości 45 cm. Ile centymetrów wstążki jej zostało?',
    type: 'input',
    answer: '185',
    unit: 'cm',
    explanation: '2 m 30 cm to 230 cm. 230 cm − 45 cm = 185 cm.',
    difficulty: { code: D.code, name: D.name },
  },
];

interface DlugoscDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) o zamianie i porównywaniu długości. */
export function DlugoscDrill({ color, onComplete }: DlugoscDrillProps) {
  return <DiagnosticQuiz tasks={TASKS} color={color} onFinish={() => onComplete?.()} />;
}
