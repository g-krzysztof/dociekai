'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'tydzien-dni',
    prompt: 'Ile dni ma tydzień?',
    type: 'input',
    answer: '7',
    explanation: 'Tydzień zawsze ma 7 dni, od poniedziałku do niedzieli.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'rok-miesiace',
    prompt: 'Ile miesięcy ma rok?',
    type: 'input',
    answer: '12',
    explanation: 'Rok ma 12 miesięcy — siedem po 31 dni, cztery po 30 i luty.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'tygodnie-na-dni',
    prompt: 'Zamień na dni: 4 tygodnie = ? dni',
    type: 'input',
    answer: '28',
    unit: 'dni',
    explanation: '4 tygodnie to 4 × 7 = 28 dni.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'dni-na-tygodnie',
    prompt: '23 dni to:',
    type: 'choice',
    options: [
      { id: 'a', text: '2 tygodnie i 3 dni' },
      { id: 'b', text: '3 tygodnie i 3 dni' },
      { id: 'c', text: '3 tygodnie i 2 dni' },
      { id: 'd', text: '2 tygodnie i 5 dni' },
    ],
    correctId: 'c',
    explanation: '23 : 7 = 3 reszta 2, czyli 3 tygodnie i 2 dni (3 × 7 = 21, zostają jeszcze 2 dni).',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'luty-przestepny',
    prompt: 'Rok 2028 jest przestępny. Ile dni ma luty w 2028 roku?',
    type: 'input',
    answer: '29',
    unit: 'dni',
    explanation: 'W roku przestępnym luty ma o jeden dzień więcej — 29 zamiast zwykłych 28.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'ferie',
    prompt: 'Ferie trwają od 15 stycznia do 2 lutego. Ile to tygodni i dni?',
    type: 'choice',
    options: [
      { id: 'a', text: '1 tydzień i 4 dni' },
      { id: 'b', text: '3 tygodnie i 4 dni' },
      { id: 'c', text: '2 tygodnie i 3 dni' },
      { id: 'd', text: '2 tygodnie i 4 dni' },
    ],
    correctId: 'd',
    explanation:
      'Od 15 do 31 stycznia to 16 dni, plus jeszcze 2 dni lutego — razem 18 dni. 18 : 7 = 2 reszta 4, czyli 2 tygodnie i 4 dni.',
    difficulty: { code: D.code, name: D.name },
  },
];

interface KalendarzoweDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) o zamianie dni/tygodni i liczeniu upływu dni, w tym reguła roku przestępnego. */
export function KalendarzoweDrill({ color, onComplete }: KalendarzoweDrillProps) {
  return <DiagnosticQuiz tasks={TASKS} color={color} onFinish={() => onComplete?.()} />;
}
