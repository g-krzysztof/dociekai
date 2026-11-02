'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'czy-przemienne',
    prompt: 'Czy 9 × 6 = 6 × 9?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Nie' },
      { id: 'b', text: 'Tak' },
    ],
    correctId: 'b',
    explanation: 'Mnożenie jest przemienne — 9 × 6 i 6 × 9 to zawsze ta sama wartość: 54.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'ktore-nieprzemienne',
    prompt: 'Które z tych działań na pewno NIE jest przemienne?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Dodawanie' },
      { id: 'b', text: 'Mnożenie' },
      { id: 'c', text: 'Odejmowanie' },
    ],
    correctId: 'c',
    explanation: 'Odejmowanie nie jest przemienne — zamiana kolejności zmienia wynik, a czasem robi go ujemnym.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'rozklad-6x13',
    prompt: 'Rozłóż: 6 × 13 = 6 × 10 + 6 × 3. Ile wynosi całe działanie?',
    type: 'input',
    answer: '78',
    explanation: '6 × 10 = 60, 6 × 3 = 18, razem 60 + 18 = 78.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'ktore-rozbicie',
    prompt: 'Które rozbicie poprawnie stosuje rozdzielność dla działania 8 × 23?',
    type: 'choice',
    options: [
      { id: 'a', text: '8 × 20 + 8 × 3' },
      { id: 'b', text: '8 × 20 × 3' },
      { id: 'c', text: '8 + 20 + 3' },
    ],
    correctId: 'a',
    explanation: '23 = 20 + 3, więc 8 × 23 = 8 × 20 + 8 × 3 = 160 + 24 = 184.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'sprytne-dodawanie',
    prompt: 'Oblicz sprytnie, zmieniając kolejność: 17 + 48 + 3.',
    type: 'input',
    answer: '68',
    explanation: '17 + 3 = 20 (pełna dwudziestka), a potem 20 + 48 = 68.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'ktora-wlasnosc',
    prompt: 'Kasia liczy 4 × 99 jako 4 × 100 − 4 × 1. Z której własności korzysta?',
    type: 'choice',
    options: [
      { id: 'a', text: 'Przemienności' },
      { id: 'b', text: 'Rozdzielności' },
      { id: 'c', text: 'Łączności' },
    ],
    correctId: 'b',
    explanation: '99 = 100 − 1, więc Kasia rozbija mnożenie na dwie części i odejmuje — to rozdzielność mnożenia względem odejmowania, siostrzana zasada tej z lekcji.',
    difficulty: { code: D.code, name: D.name },
  },
];

const RESULT_COPY = {
  perfect: {
    title: 'Komplet! Własności działań masz opanowane.',
    message: 'Przemienność, łączność i rozdzielność — rozpoznajesz je i wykorzystujesz do liczenia sprytniej.',
  },
  good: {
    title: 'Dobra robota!',
    message: 'Większość zadań trafiona. Zerknij jeszcze raz na te trudniejsze, jeśli chcesz się upewnić.',
  },
  poor: {
    title: 'To jeszcze wymaga treningu',
    message: 'Wróć do kroku „Nowe pojęcie” i przećwicz siatkę jeszcze raz, zanim spróbujesz ponownie.',
  },
};

interface PropertyDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) na przemienność, łączność i rozdzielność. */
export function PropertyDrill({ color, onComplete }: PropertyDrillProps) {
  return (
    <DiagnosticQuiz
      tasks={TASKS}
      color={color}
      onFinish={() => onComplete?.()}
      resultCopy={RESULT_COPY}
    />
  );
}
