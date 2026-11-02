'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'zaokraglij-dziesiatki',
    prompt: 'Zaokrąglij 47 do pełnych dziesiątek.',
    type: 'input',
    answer: '50',
    explanation: 'Cyfra jedności to 7 (≥ 5) → zaokrąglamy w górę: 50.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'zaokraglij-setki',
    prompt: 'Zaokrąglij 382 do pełnych setek.',
    type: 'input',
    answer: '400',
    explanation: 'Cyfra dziesiątek to 8 (≥ 5) → zaokrąglamy w górę: 400.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'oszacuj-sume',
    prompt: 'Oszacuj sumę 289 + 503 (zaokrąglij obie liczby do pełnych setek).',
    type: 'choice',
    options: [
      { id: 'a', text: '700' },
      { id: 'b', text: '800' },
      { id: 'c', text: '900' },
      { id: 'd', text: '600' },
    ],
    correctId: 'b',
    explanation: '289 → 300, 503 → 500, więc 300 + 500 = 800.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'oszacuj-roznice',
    prompt: 'Oszacuj różnicę 6120 − 2890 (zaokrąglij obie liczby do pełnych tysięcy).',
    type: 'choice',
    options: [
      { id: 'a', text: '3000' },
      { id: 'b', text: '4000' },
      { id: 'c', text: '2000' },
      { id: 'd', text: '5000' },
    ],
    correctId: 'a',
    explanation: '6120 → 6000, 2890 → 3000, więc 6000 − 3000 = 3000.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'sensownosc-wyniku',
    prompt: 'Ktoś obliczył 48 × 21 = 1008. Szacunek to 50 × 20 = 1000. Co mówi to o wyniku?',
    type: 'choice',
    options: [
      { id: 'a', text: 'To za mało, wynik powinien być dużo większy' },
      { id: 'b', text: 'Wynik pasuje do szacunku — jest sensowny' },
      { id: 'c', text: 'To za dużo, coś jest nie tak' },
      { id: 'd', text: 'Szacunku nie da się tu użyć' },
    ],
    correctId: 'b',
    explanation: '1008 jest bardzo blisko szacunku 1000 — dokładny wynik ma sens.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'lamiglowka-sala',
    prompt: 'Trzy klasy liczą po około 27 uczniów każda. Czy na pewno zmieszczą się w sali na 100 miejsc?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Nie wiadomo, trzeba policzyć dokładnie' },
      { id: 'b', text: 'Nie, bo 3 razy 27 to więcej niż 100' },
      { id: 'c', text: 'Tak, bo każda klasa ma dokładnie 30 uczniów' },
      { id: 'd', text: 'Tak, bo 3 razy 30 to około 90 — mniej niż 100' },
    ],
    correctId: 'd',
    explanation: 'Zaokrąglając 27 do 30 dostajesz bezpieczne oszacowanie z górką: 3 × 30 = 90, a to mniej niż 100 miejsc.',
    difficulty: { code: D.code, name: D.name },
  },
];

interface EstimationDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) o zaokrąglaniu i szacowaniu wyników. */
export function EstimationDrill({ color, onComplete }: EstimationDrillProps) {
  return <DiagnosticQuiz tasks={TASKS} color={color} onFinish={() => onComplete?.()} />;
}
