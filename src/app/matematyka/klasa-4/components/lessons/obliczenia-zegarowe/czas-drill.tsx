'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'h-na-min',
    prompt: 'Ile minut ma 1 godzina?',
    type: 'choice',
    options: [
      { id: 'a', text: '6' },
      { id: 'b', text: '60' },
      { id: 'c', text: '100' },
      { id: 'd', text: '600' },
    ],
    correctId: 'b',
    explanation: '1 godzina to 60 minut — tyle samo, ile minutowa wskazówka ma kresek na tarczy.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'min-na-s',
    prompt: 'Ile sekund ma 1 minuta?',
    type: 'choice',
    options: [
      { id: 'a', text: '100' },
      { id: 'b', text: '6' },
      { id: 'c', text: '60' },
      { id: 'd', text: '1000' },
    ],
    correctId: 'c',
    explanation: '1 minuta to 60 sekund — dokładnie tak samo jak godzina ma 60 minut.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'godziny-na-minuty',
    prompt: 'Zamień na minuty: 4 h = ? min',
    type: 'input',
    answer: '240',
    unit: 'min',
    explanation: '4 h to 4 × 60 = 240 min.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'zajecia-minuty',
    prompt: 'Zajęcia trwały od 9:00 do 10:15. Ile to minut?',
    type: 'input',
    answer: '75',
    unit: 'min',
    explanation: 'Od 9:00 do 10:00 to 60 min, plus jeszcze 15 min do 10:15 — razem 75 min.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'trening',
    prompt: 'Trening piłkarski: początek 17:35, koniec 18:10. Ile trwał trening?',
    type: 'choice',
    options: [
      { id: 'a', text: '55 min' },
      { id: 'b', text: '45 min' },
      { id: 'c', text: '25 min' },
      { id: 'd', text: '35 min' },
    ],
    correctId: 'd',
    explanation: 'Od 17:35 do 18:00 to 25 min, plus jeszcze 10 min do 18:10 — razem 35 min.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'wycieczka',
    prompt: 'Wycieczka: wyjazd o 8:15, powrót o 13:40. Ile minut trwała cała wycieczka?',
    type: 'input',
    answer: '325',
    unit: 'min',
    explanation:
      'Od 8:15 do 9:00 to 45 min, od 9:00 do 13:00 to 4 godziny (240 min), od 13:00 do 13:40 to jeszcze 40 min. Razem 45 + 240 + 40 = 325 min.',
    difficulty: { code: D.code, name: D.name },
  },
];

interface CzasDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) o zamianie jednostek czasu i liczeniu upływu czasu. */
export function CzasDrill({ color, onComplete }: CzasDrillProps) {
  return <DiagnosticQuiz tasks={TASKS} color={color} onFinish={() => onComplete?.()} />;
}
