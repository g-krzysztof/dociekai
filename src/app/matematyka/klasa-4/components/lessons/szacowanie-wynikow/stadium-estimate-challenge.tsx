'use client';

import { Users } from 'lucide-react';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'sektor-a-b',
    question: 'Sektor A ma około 180 kibiców, sektor B około 240. Oszacuj ich łączną liczbę (zaokrąglij do pełnych setek).',
    options: [
      { id: 'a', text: '500' },
      { id: 'b', text: '400' },
      { id: 'c', text: '300' },
      { id: 'd', text: '600' },
    ],
    correctId: 'b',
    explanation: '180 → 200, a 240 → 200, więc 200 + 200 = 400.',
  },
  {
    id: 'sektor-c',
    question: 'Dochodzi jeszcze sektor C z około 65 kibicami. Zaokrąglij i dodaj do wcześniejszego szacunku.',
    options: [
      { id: 'a', text: '600' },
      { id: 'b', text: '450' },
      { id: 'c', text: '500' },
      { id: 'd', text: '400' },
    ],
    correctId: 'c',
    explanation: '65 → 100 (cyfra dziesiątek to 6, więc w górę), a wcześniejszy szacunek to 400, więc 400 + 100 = 500.',
  },
  {
    id: 'ogloszenie-przesadzone',
    question: 'Spiker ogłasza: „Mamy dziś 4850 kibiców!”. Twój szacunek to około 500. Czy to ogłoszenie ma sens?',
    options: [
      { id: 'a', text: 'Tak, to się zgadza' },
      { id: 'b', text: 'Nie da się ocenić' },
      { id: 'c', text: 'Tak, bo szacunki zawsze są mniejsze od prawdy' },
      { id: 'd', text: 'Nie, to dużo za dużo — ktoś się pomylił' },
    ],
    correctId: 'd',
    explanation: '4850 jest ponad dziesięć razy większe niż Twój szacunek 500 — to za duża różnica, żeby ogłoszenie mogło być poprawne.',
  },
  {
    id: 'ogloszenie-pasujace',
    question: 'Gdyby zamiast tego spiker ogłosił „510 kibiców”, czy pasuje to do Twojego szacunku?',
    options: [
      { id: 'a', text: 'Nie, to za dużo' },
      { id: 'b', text: 'Tak, to bardzo blisko szacunku (500)' },
      { id: 'c', text: 'Nie, to za mało' },
      { id: 'd', text: 'Nie można tego porównać' },
    ],
    correctId: 'b',
    explanation: '510 leży bardzo blisko szacunku 500 — to wygląda na wiarygodną liczbę.',
  },
];

interface StadiumEstimateChallengeProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: frekwencja na meczu szkolnym liczona sektorami, a potem sprawdzana szacunkiem. */
export function StadiumEstimateChallenge({ color, onComplete }: StadiumEstimateChallengeProps) {
  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <Users className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Nikt nie liczy kibiców na trybunach co do jednego — szacunek sektor po sektorze
          wystarczy, żeby ocenić, czy ogłoszona liczba w ogóle ma sens.
        </p>
      </div>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
