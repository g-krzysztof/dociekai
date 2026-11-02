'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'prawdziwe-porownanie',
    prompt: 'Które porównanie jest prawdziwe?',
    type: 'choice',
    options: [
      { id: 'a', text: '482 > 1204' },
      { id: 'b', text: '482 = 1204' },
      { id: 'c', text: '1204 > 482' },
    ],
    correctId: 'c',
    explanation: '1204 ma 4 cyfry, a 482 tylko 3 — więcej cyfr, większa liczba.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'znak-1',
    prompt: 'Który znak pasuje? 5300 ___ 5290',
    type: 'choice',
    options: [
      { id: 'a', text: '>' },
      { id: 'b', text: '<' },
      { id: 'c', text: '=' },
    ],
    correctId: 'a',
    explanation: 'Obie liczby mają 4 cyfry i zaczynają się na 5. Na miejscu setek: 3 > 2, więc 5300 > 5290.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'znak-pulapka',
    prompt: 'Który znak pasuje? 68 200 ___ 682 000',
    type: 'choice',
    options: [
      { id: 'a', text: '>' },
      { id: 'b', text: '<' },
      { id: 'c', text: '=' },
    ],
    correctId: 'b',
    explanation: '68 200 ma 5 cyfr, a 682 000 ma 6 cyfr — mimo że zaczynają się podobnie, 682 000 jest większa.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'najmniejsza-z-trzech',
    prompt: 'Która z liczb: 4102, 4120, 4012 jest najmniejsza? Zapisz ją cyframi.',
    type: 'input',
    answer: '4012',
    explanation: 'Wszystkie zaczynają się na 4. Na miejscu setek 4012 ma 0 — najmniej ze wszystkich.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'najwieksza-z-cyfr',
    prompt:
      'Zapisz największą liczbę czterocyfrową, jaką można ułożyć z cyfr 3, 0, 7, 1 — każdej dokładnie raz, bez zera na początku.',
    type: 'input',
    answer: '7310',
    explanation: 'Największą liczbę dostajesz, ustawiając cyfry malejąco: 7 3 1 0.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'najmniejsza-z-cyfr',
    prompt:
      'Ustawiono cyfry liczby 5213 tak, by powstała najmniejsza możliwa liczba (bez zera na początku). Czy ta nowa liczba jest mniejsza czy większa od 1999?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Większa' },
      { id: 'b', text: 'Równa' },
      { id: 'c', text: 'Mniejsza' },
    ],
    correctId: 'c',
    explanation: 'Najmniejsze ustawienie cyfr 5, 2, 1, 3 to 1235. Obie liczby mają 4 cyfry, a 1235 < 1999, bo 2 < 9 na miejscu setek.',
    difficulty: { code: D.code, name: D.name },
  },
];

const RESULT_COPY = {
  perfect: {
    title: 'Komplet! Porównywanie masz opanowane.',
    message: 'Liczba cyfr, potem cyfra po cyfrze — działa za każdym razem.',
  },
  good: {
    title: 'Dobra robota!',
    message: 'Większość zadań trafiona. Zerknij jeszcze raz na te trudniejsze, jeśli chcesz się upewnić.',
  },
  poor: {
    title: 'To jeszcze wymaga treningu',
    message: 'Wróć do kroku „Nowe pojęcie” — samo porównywanie cyfra po cyfrze bardzo w tym pomaga.',
  },
};

interface CompareDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) na porównywanie i porządkowanie liczb. */
export function CompareDrill({ color, onComplete }: CompareDrillProps) {
  return (
    <DiagnosticQuiz
      tasks={TASKS}
      color={color}
      onFinish={() => onComplete?.()}
      resultCopy={RESULT_COPY}
    />
  );
}
