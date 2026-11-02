'use client';

import { CookingPot } from 'lucide-react';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { MiniFraction } from '../../mini-fraction';

interface Ingredient {
  name: string;
  /** Ilość w szklankach — ułamek zwykły albo zapis dziesiętny (tak, jak w prawdziwym przepisie). */
  amount: { licznik: number; mianownik: number } | string;
}

const INGREDIENTS: Ingredient[] = [
  { name: 'Mąka', amount: { licznik: 3, mianownik: 4 } },
  { name: 'Cukier', amount: '0,5' },
  { name: 'Mleko', amount: { licznik: 2, mianownik: 5 } },
  { name: 'Masło', amount: '0,25' },
];

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'maka-na-dziesietny',
    question: 'Ile to 3/4 szklanki mąki zapisane liczbą z przecinkiem?',
    options: [
      { id: 'a', text: '0,75 szklanki' },
      { id: 'b', text: '0,34 szklanki' },
      { id: 'c', text: '0,25 szklanki' },
      { id: 'd', text: '0,43 szklanki' },
    ],
    correctId: 'a',
    explanation: '3/4 rozszerzamy przez 25: 75/100 = 0,75 szklanki.',
  },
  {
    id: 'to-samo-co-polowa',
    question: 'Którego składnika jest dokładnie tyle samo, co 1/2 szklanki?',
    options: [
      { id: 'a', text: 'Cukru' },
      { id: 'b', text: 'Mąki' },
      { id: 'c', text: 'Mleka' },
      { id: 'd', text: 'Masła' },
    ],
    correctId: 'a',
    explanation: '1/2 = 0,5 — a cukru jest właśnie 0,5 szklanki.',
  },
  {
    id: 'mleko-na-dziesietny',
    question: 'Zapisz ilość mleka (2/5 szklanki) jako ułamek dziesiętny.',
    options: [
      { id: 'a', text: '0,25 szklanki' },
      { id: 'b', text: '0,4 szklanki' },
      { id: 'c', text: '0,52 szklanki' },
      { id: 'd', text: '2,5 szklanki' },
    ],
    correctId: 'b',
    explanation: '2/5 rozszerzamy przez 2: 4/10 = 0,4 szklanki.',
  },
  {
    id: 'najmniej',
    question: 'Którego składnika przepis wymaga najmniej?',
    options: [
      { id: 'a', text: 'Mąki' },
      { id: 'b', text: 'Cukru' },
      { id: 'c', text: 'Mleka' },
      { id: 'd', text: 'Masła' },
    ],
    correctId: 'd',
    explanation: 'Po zamianie wszystkiego na dziesiętne: mąka 0,75, cukier 0,5, mleko 0,4, masło 0,25 — najmniej masła.',
  },
];

interface RecipeConversionChallengeProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: przepis, w którym część ilości podano ułamkiem zwykłym, część dziesiętnym — żeby je porównać, trzeba sprowadzić do jednego zapisu. */
export function RecipeConversionChallenge({ color, onComplete }: RecipeConversionChallengeProps) {
  return (
    <div className="space-y-5">
      <div className="border">
        <p className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2 text-sm font-semibold">
          <CookingPot className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          Przepis na babeczki (na 1 porcję)
        </p>
        <ul className="divide-y">
          {INGREDIENTS.map((ing) => (
            <li key={ing.name} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-sm font-medium sm:text-base">{ing.name}</span>
              <span className="font-mono text-base font-bold tabular-nums" style={{ color }}>
                {typeof ing.amount === 'string' ? (
                  <>{ing.amount} szklanki</>
                ) : (
                  <>
                    <MiniFraction
                      licznik={ing.amount.licznik}
                      mianownik={ing.amount.mianownik}
                      color={color}
                    />{' '}
                    szklanki
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
