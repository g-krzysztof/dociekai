'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'wartosc-l',
    prompt: 'Jaką wartość ma symbol L?',
    type: 'choice',
    options: [
      { id: 'a', text: '5' },
      { id: 'b', text: '50' },
      { id: 'c', text: '500' },
      { id: 'd', text: '15' },
    ],
    correctId: 'b',
    explanation:
      'L to 50 — jeden z sześciu podstawowych symboli obok I (1), V (5), X (10), C (100), D (500), M (1000).',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'vii',
    prompt: 'Zapisz cyframi liczbę rzymską: VII',
    type: 'input',
    answer: '7',
    explanation: 'VII to V (5) i dwie jedynki: 5 + 1 + 1 = 7 — czysto dodawanie, bez odejmowania.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'xiv',
    prompt: 'Zapisz cyframi liczbę rzymską: XIV',
    type: 'input',
    answer: '14',
    explanation: 'X to 10, a IV to 4 (I przed V odejmuje: 5 − 1). Razem: 10 + 4 = 14.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'dziewiecdziesiat',
    prompt: 'Który zapis oznacza liczbę 90?',
    type: 'choice',
    options: [
      { id: 'a', text: 'LX' },
      { id: 'b', text: 'IC' },
      { id: 'c', text: 'XC' },
      { id: 'd', text: 'XXXXX' },
    ],
    correctId: 'c',
    explanation:
      'XC: X przed C odejmuje 10 od 100, czyli 90. IC nie istnieje — odejmować można tylko od najbliższego większego symbolu.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'sto-siedemdziesiat-dziewiec',
    prompt: 'Zapisz liczbą rzymską: 179',
    type: 'input',
    answer: 'CLXXIX',
    explanation: 'Setki: 1 → C. Dziesiątki: 7 → LXX. Jedności: 9 → IX. Razem: CLXXIX.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'dziewiecset-czterdziesci-cztery',
    prompt: 'Zapisz liczbą rzymską: 944',
    type: 'input',
    answer: 'CMXLIV',
    explanation: 'Setki: 9 → CM. Dziesiątki: 4 → XL. Jedności: 4 → IV. Razem: CMXLIV.',
    difficulty: { code: D.code, name: D.name },
  },
  {
    id: 'blad-zapisu',
    prompt: 'Który zapis jest niepoprawny — łamie zasady systemu rzymskiego?',
    type: 'choice',
    options: [
      { id: 'a', text: 'IIII' },
      { id: 'b', text: 'XL' },
      { id: 'c', text: 'CM' },
      { id: 'd', text: 'LXX' },
    ],
    correctId: 'a',
    explanation:
      'Tego samego symbolu nie powtarza się więcej niż trzy razy pod rząd — 4 to zawsze IV, nigdy IIII.',
    difficulty: { code: D.code, name: D.name },
  },
];

const RESULT_COPY = {
  perfect: {
    title: 'Komplet! System rzymski masz opanowany.',
    message:
      'Zamiana w obie strony idzie ci sprawnie — nawet z trudniejszymi, subtraktywnymi zapisami.',
  },
  good: {
    title: 'Dobra robota!',
    message:
      'Większość zadań trafiona. Zerknij jeszcze raz na te trudniejsze, jeśli chcesz się upewnić.',
  },
  poor: {
    title: 'To jeszcze wymaga treningu',
    message:
      'Wróć do kroku „Nowe pojęcie” i spróbuj ponownie — zamiana miejsce po miejscu robi się prostsza z każdą próbą.',
  },
};

interface RomanDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 7 zadań rosnącej trudności (K→P→R→D), zamiana rzymskie ↔ arabskie w obie strony. */
export function RomanDrill({ color, onComplete }: RomanDrillProps) {
  return (
    <DiagnosticQuiz
      tasks={TASKS}
      color={color}
      onFinish={() => onComplete?.()}
      resultCopy={RESULT_COPY}
    />
  );
}
