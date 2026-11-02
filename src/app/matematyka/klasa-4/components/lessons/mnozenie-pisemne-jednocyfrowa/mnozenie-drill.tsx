'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { ColumnGrid, type ColumnCellData } from '../../column-grid';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

/**
 * Ręcznie ułożony błędny zapis 24 × 6: kolumna jedności oddała dziesiątkom
 * przeniesienie 2, ale dziesiątki policzyły tylko 2 × 6 = 12 → 2, zapominając
 * dodać tę dwójkę (powinno być 14 → 4, z przeniesieniem 1 dalej) — do
 * zadania „znajdź błąd". Kolumna setek musi zostać pokazana mimo że 24 ma
 * tylko dwie cyfry — bez niej wynik czytałby się jako „24”, a nie „124”,
 * i zaprzeczałby własnemu wyjaśnieniu zadania.
 */
const WRONG_CARRY_CELLS: ColumnCellData[] = [
  { place: 'setki', top: null, bottom: null, result: 1, carry: 1 },
  { place: 'dziesiątki', top: 2, bottom: null, result: 2, carry: 2 },
  { place: 'jedności', top: 4, bottom: 6, result: 4 },
];

function buildTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'k1',
      prompt: '123 × 3 =',
      type: 'input',
      answer: '369',
      explanation: 'Każdy iloczyn cyfry i mnożnika jest mniejszy od 10, więc żadna kolumna nie potrzebuje przeniesienia: 3, 6, 9.',
      difficulty: DIFFICULTY_LEVELS[0],
    },
    {
      id: 'k2',
      prompt: '214 × 4 =',
      type: 'input',
      answer: '856',
      explanation: '4 × 4 = 16, zapisujemy 6 i przenosimy 1. 1 × 4 + 1 = 5. 2 × 4 = 8.',
      difficulty: DIFFICULTY_LEVELS[0],
    },
    {
      id: 'p1',
      prompt: '356 × 4 =',
      type: 'input',
      answer: '1424',
      explanation: 'Przeniesienie powtarza się w trzech kolumnach z rzędu: 2, potem 2, potem 1.',
      difficulty: DIFFICULTY_LEVELS[1],
    },
    {
      id: 'p2',
      prompt: '507 × 8 =',
      type: 'input',
      answer: '4056',
      explanation: 'Zero w środku liczby samo daje zero (0 × 8 = 0), ale wciąż dostaje przeniesienie z jedności — dlatego w wyniku stoi tam 5, nie 0.',
      difficulty: DIFFICULTY_LEVELS[1],
    },
    {
      id: 'r1',
      prompt: '649 × 7 =',
      type: 'input',
      answer: '4543',
      explanation: 'Przeniesienia rosną w trzech kolejnych kolumnach: 6, 3, 4 — żadne z nich nie wynosi 1.',
      difficulty: DIFFICULTY_LEVELS[2],
    },
    {
      id: 'r2',
      prompt: '999 × 8 =',
      type: 'input',
      answer: '7992',
      explanation: 'Każda kolumna liczy 9 × 8 = 72, do tego dochodzi poprzednie przeniesienie 7 — powtarza się to trzy razy z rzędu.',
      difficulty: DIFFICULTY_LEVELS[2],
    },
    {
      id: 'd1',
      prompt: 'Co jest nieprawidłowe w tym zapisie mnożenia 24 × 6?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Wynik powinien mieć więcej cyfr' },
        { id: 'b', text: 'W kolumnie jedności nie trzeba było przenosić' },
        { id: 'c', text: 'W kolumnie dziesiątek zapomniano dodać przeniesienie' },
        { id: 'd', text: 'Liczby są źle ustawione względem siebie' },
      ],
      correctId: 'c',
      explanation:
        'Jedności oddały dziesiątkom przeniesienie 2, ale w dziesiątkach policzono tylko 2 × 6 = 12 → 2, zapominając dodać te 2. Powinno być 12 + 2 = 14, czyli 4 (z przeniesieniem 1 dalej) — poprawny wynik to 144, nie 124.',
      visual: (
        <div className="flex justify-center overflow-x-auto">
          <ColumnGrid
            color={color}
            operator="×"
            cells={WRONG_CARRY_CELLS}
            ariaLabel="Błędnie zapisane mnożenie 24 razy 6, wynik 124"
          />
        </div>
      ),
      difficulty: DIFFICULTY_LEVELS[3],
    },
    {
      id: 'd2',
      prompt: 'Bez liczenia dokładnie: iloczyn 612 × 4 jest bliżej 3200 czy 2400?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Bliżej 3200' },
        { id: 'b', text: 'Bliżej 2400' },
      ],
      correctId: 'b',
      explanation: '612 to około 600, a 600 × 4 = 2400. Dokładny wynik pisemny (2448) to potwierdza.',
      difficulty: DIFFICULTY_LEVELS[3],
    },
  ];
}

interface MnozenieDrillProps {
  color: string;
  onComplete?: (score: number, total: number) => void;
}

/** Ćwiczenia: 8 zadań K/P/R/D, od mnożenia bez przeniesienia po wykrywanie pominiętego przeniesienia i szacowanie iloczynu. */
export function MnozenieDrill({ color, onComplete }: MnozenieDrillProps) {
  return <DiagnosticQuiz tasks={buildTasks(color)} color={color} onFinish={onComplete} />;
}
