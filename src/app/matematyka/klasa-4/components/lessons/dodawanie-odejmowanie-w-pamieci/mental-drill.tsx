'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'proste-dodawanie',
    prompt: '34 + 5 = ?',
    type: 'input',
    answer: '39',
    explanation: 'Bez przekraczania dziesiątki — dodajesz jedności wprost: 4 + 5 = 9.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'proste-odejmowanie',
    prompt: '58 − 20 = ?',
    type: 'input',
    answer: '38',
    explanation: 'Odejmujesz same dziesiątki: 5 − 2 = 3 dziesiątki, jedności zostają bez zmian.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'przez-prog',
    prompt: '47 + 8 = ?',
    type: 'input',
    answer: '55',
    explanation: 'Rozłóż 8 na 3 i 5: 47 + 3 = 50 (pełna dziesiątka), potem 50 + 5 = 55.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'rozklad',
    prompt: 'Chcesz obliczyć 76 + 28. Na jakie dwie liczby najwygodniej rozłożyć 28?',
    type: 'choice',
    options: [
      { id: 'a', text: '25 i 3' },
      { id: 'b', text: '20 i 8' },
      { id: 'c', text: '14 i 14' },
    ],
    correctId: 'b',
    explanation: '28 = 20 + 8 — dziesiątki i jedności to zawsze najprostszy podział do skoków.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'przez-setke',
    prompt: '145 − 38 = ?',
    type: 'input',
    answer: '107',
    explanation: 'Rozłóż 38 na 40 i 2: 145 − 40 = 105, a potem 105 + 2 = 107 (odjąłeś o 2 za dużo).',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'zaokraglenie-w-gore',
    prompt: 'Zosia liczy 199 + 56, rozkładając 199 na 200 − 1. Jaki wynik otrzyma?',
    type: 'input',
    answer: '255',
    explanation: '200 + 56 = 256, a potem − 1 (bo 199 to o 1 mniej niż 200) daje 255.',
    difficulty: { code: D.code, name: D.name },
  },
];

const RESULT_COPY = {
  perfect: {
    title: 'Komplet! Skoki po osi masz w małym palcu.',
    message: 'Rozkładanie na dziesiątki i jedności działa teraz w obie strony i na każdym zakresie liczb.',
  },
  good: {
    title: 'Dobra robota!',
    message: 'Większość zadań trafiona. Zerknij jeszcze raz na te trudniejsze, jeśli chcesz się upewnić.',
  },
  poor: {
    title: 'To jeszcze wymaga treningu',
    message: 'Wróć do kroku „Nowe pojęcie” i przećwicz skoki na osi jeszcze raz, zanim spróbujesz ponownie.',
  },
};

interface MentalDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) na dodawanie i odejmowanie w pamięci. */
export function MentalDrill({ color, onComplete }: MentalDrillProps) {
  return (
    <DiagnosticQuiz
      tasks={TASKS}
      color={color}
      onFinish={() => onComplete?.()}
      resultCopy={RESULT_COPY}
    />
  );
}
