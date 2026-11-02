'use client';

import { Armchair } from 'lucide-react';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'ile-krzesel',
    question: 'Na akademię szkolną ustawiono krzesła w 6 rzędach po 14 krzeseł. Ile krzeseł jest łącznie?',
    options: [
      { id: 'a', text: '74' },
      { id: 'b', text: '90' },
      { id: 'c', text: '84' },
      { id: 'd', text: '78' },
    ],
    correctId: 'c',
    explanation: 'Rozdzielność ułatwia liczenie: 6 × 14 = 6 × 10 + 6 × 4 = 60 + 24 = 84.',
  },
  {
    id: 'z-drugiej-strony',
    question: 'Woźny liczy to samo, ale z drugiej strony sali: 14 rzędów po 6 krzeseł. Ile mu wyjdzie?',
    options: [
      { id: 'a', text: '98' },
      { id: 'b', text: '70' },
      { id: 'c', text: '80' },
      { id: 'd', text: '84' },
    ],
    correctId: 'd',
    explanation: 'Przemienność mnożenia: 14 × 6 to dokładnie ta sama liczba krzeseł co 6 × 14 — 84.',
  },
  {
    id: 'dostawione-rzedy',
    question: 'Dostawiono jeszcze 2 rzędy po 14 krzeseł. Ile krzeseł jest teraz łącznie na sali?',
    options: [
      { id: 'a', text: '112' },
      { id: 'b', text: '110' },
      { id: 'c', text: '100' },
      { id: 'd', text: '120' },
    ],
    correctId: 'a',
    explanation: 'Teraz to 8 rzędów po 14: (6 + 2) × 14 = 6 × 14 + 2 × 14 = 84 + 28 = 112.',
  },
  {
    id: 'kolejnosc-dodawania',
    question:
      'W trzech klasach jest 23, 17 i 7 uczniów. Żeby zsumować to szybko w pamięci, którą kolejność dodawania wybierzesz?',
    options: [
      { id: 'a', text: '23 + 17 najpierw, potem + 7' },
      { id: 'b', text: '23 + 7 najpierw, potem + 17' },
      { id: 'c', text: '17 + 7 najpierw, potem + 23' },
      { id: 'd', text: 'Kolejność nie wpływa na to, jak szybko policzysz' },
    ],
    correctId: 'b',
    explanation:
      'Każda kolejność da tę samą sumę (47) — dzięki przemienności i łączności. Ale 23 + 7 = 30 to pełna dziesiątka, więc ta kolejność liczy się najszybciej w głowie.',
  },
  {
    id: 'ktory-zapis',
    question: 'Które zdanie jest prawdziwe dla dowolnych liczb a, b, c?',
    options: [
      { id: 'a', text: 'a × (b + c) = a × b + c' },
      { id: 'b', text: 'a × (b + c) = (a × b) × c' },
      { id: 'c', text: 'a × (b + c) = a × b + a × c' },
      { id: 'd', text: 'a + (b × c) = (a + b) × (a + c)' },
    ],
    correctId: 'c',
    explanation: 'To ogólny zapis rozdzielności mnożenia względem dodawania — działa dla każdych trzech liczb, nie tylko w przykładach z lekcji.',
  },
];

interface AssemblySeatingChallengeProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: krzesła na akademii jako naturalny kontekst dla siatki rzędów i kolumn. */
export function AssemblySeatingChallenge({ color, onComplete }: AssemblySeatingChallengeProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
        <Armchair className="h-8 w-8 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Sala gimnastyczna, akademia szkolna, krzesła ustawione w równych rzędach — dokładnie ta
          sama siatka, co w tej lekcji, tylko w prawdziwym życiu.
        </p>
      </div>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
