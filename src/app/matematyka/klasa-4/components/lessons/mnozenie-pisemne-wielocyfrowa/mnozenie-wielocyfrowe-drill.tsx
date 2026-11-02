'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { LongMultiplicationGrid, type LongMultiplicationRow } from './long-multiplication-grid';
import { digitsOf, shiftDigits } from '../../../lib/column-algorithm';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

/**
 * Ręcznie ułożony błędny zapis 43 × 12: pierwszy iloczyn cząstkowy (43 × 2 =
 * 86) jest poprawny, ale drugi (43 × 1 = 43) został zapisany bez
 * przesunięcia o kolumnę — tak, jakby to było zwykłe 43, a nie 430. Suma
 * 86 + 43 = 129 jest w efekcie kilka razy za mała od prawdziwego wyniku
 * (516) — do zadania „co jest nie tak w tym zapisie".
 */
const WRONG_SHIFT_TOP = digitsOf(43, 4);
const WRONG_SHIFT_MULTIPLIER = digitsOf(12, 4);
const WRONG_SHIFT_ROWS: LongMultiplicationRow[] = [
  { digits: shiftDigits(digitsOf(86, 4), 0), revealed: true },
  { digits: shiftDigits(digitsOf(43, 4), 0), revealed: true },
];
const WRONG_SHIFT_SUM = digitsOf(129, 4);

function buildTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'k1',
      prompt: '12 × 11 =',
      type: 'input',
      answer: '132',
      explanation: 'Iloczyny cząstkowe: 12 × 1 = 12 (jedności), 12 × 1 = 12 przesunięte o kolumnę = 120. 12 + 120 = 132.',
      difficulty: DIFFICULTY_LEVELS[0],
    },
    {
      id: 'k2',
      prompt: '23 × 12 =',
      type: 'input',
      answer: '276',
      explanation: 'Iloczyny cząstkowe: 23 × 2 = 46, 23 × 1 = 23 przesunięte o kolumnę = 230. 46 + 230 = 276.',
      difficulty: DIFFICULTY_LEVELS[0],
    },
    {
      id: 'p1',
      prompt: '46 × 23 =',
      type: 'input',
      answer: '1058',
      explanation: 'Iloczyny cząstkowe: 46 × 3 = 138 (z przeniesieniem), 46 × 2 = 92 przesunięte o kolumnę = 920. 138 + 920 = 1058.',
      difficulty: DIFFICULTY_LEVELS[1],
    },
    {
      id: 'p2',
      prompt: '58 × 34 =',
      type: 'input',
      answer: '1972',
      explanation: 'Iloczyny cząstkowe: 58 × 4 = 232, 58 × 3 = 174 przesunięte o kolumnę = 1740. 232 + 1740 = 1972.',
      difficulty: DIFFICULTY_LEVELS[1],
    },
    {
      id: 'r1',
      prompt: '236 × 42 =',
      type: 'input',
      answer: '9912',
      explanation: 'Iloczyny cząstkowe: 236 × 2 = 472, 236 × 4 = 944 przesunięte o kolumnę = 9440. 472 + 9440 = 9912.',
      difficulty: DIFFICULTY_LEVELS[2],
    },
    {
      id: 'r2',
      prompt: '148 × 63 =',
      type: 'input',
      answer: '9324',
      explanation: 'Iloczyny cząstkowe: 148 × 3 = 444, 148 × 6 = 888 przesunięte o kolumnę = 8880. 444 + 8880 = 9324.',
      difficulty: DIFFICULTY_LEVELS[2],
    },
    {
      id: 'd1',
      prompt: 'Co jest nieprawidłowe w tym zapisie mnożenia 43 × 12?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Wynik powinien mieć mniej cyfr' },
        { id: 'b', text: 'W pierwszym iloczynie cząstkowym zabrakło przeniesienia' },
        { id: 'c', text: 'Liczby na górze są źle ustawione względem siebie' },
        { id: 'd', text: 'Drugi iloczyn cząstkowy nie został przesunięty o kolumnę' },
      ],
      correctId: 'd',
      explanation:
        '43 × 1 = 43 to iloczyn przez cyfrę dziesiątek, więc powinien być przesunięty o jedną kolumnę w lewo (czyli reprezentować 430), a nie zapisany od kolumny jedności. Poprawny wynik to 516, nie 129.',
      visual: (
        <div className="flex justify-center overflow-x-auto">
          <LongMultiplicationGrid
            color={color}
            topDigits={WRONG_SHIFT_TOP}
            multiplierDigits={WRONG_SHIFT_MULTIPLIER}
            rows={WRONG_SHIFT_ROWS}
            sumDigits={WRONG_SHIFT_SUM}
            ariaLabel="Błędnie zapisane mnożenie 43 razy 12, wynik 129"
          />
        </div>
      ),
      difficulty: DIFFICULTY_LEVELS[3],
    },
    {
      id: 'd2',
      prompt: 'Bez liczenia dokładnie: iloczyn 213 × 42 jest bliżej 8000 czy 12000?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Bliżej 8000' },
        { id: 'b', text: 'Bliżej 12000' },
      ],
      correctId: 'a',
      explanation: '213 to około 200, a 42 to około 40. 200 × 40 = 8000. Dokładny wynik pisemny (8946) to potwierdza.',
      difficulty: DIFFICULTY_LEVELS[3],
    },
  ];
}

interface MnozenieWielocyfroweDrillProps {
  color: string;
  onComplete?: (score: number, total: number) => void;
}

/** Ćwiczenia: 8 zadań K/P/R/D, od dwucyfrowego mnożnika bez przeniesień po wykrywanie brakującego przesunięcia i szacowanie iloczynu. */
export function MnozenieWielocyfroweDrill({ color, onComplete }: MnozenieWielocyfroweDrillProps) {
  return <DiagnosticQuiz tasks={buildTasks(color)} color={color} onFinish={onComplete} />;
}
