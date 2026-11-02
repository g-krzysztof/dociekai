'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { ColumnGrid, type ColumnCellData } from '../../column-grid';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

/** Ręcznie ułożony błędny zapis 216 + 9 (9 stoi pod dziesiątkami zamiast pod jednościami) — do zadania „znajdź błąd”. */
const WRONG_ALIGNMENT_CELLS: ColumnCellData[] = [
  { place: 'setki', top: 2, bottom: null, result: 3, carry: 1 },
  { place: 'dziesiątki', top: 1, bottom: 9, result: 0 },
  { place: 'jedności', top: 6, bottom: null, result: 6 },
];

function buildTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'k1',
      prompt: '34 + 5 =',
      type: 'input',
      answer: '39',
      explanation: 'Jedności pod jednościami: 4 + 5 = 9, dziesiątki zostają bez zmian: 3.',
      difficulty: DIFFICULTY_LEVELS[0],
    },
    {
      id: 'k2',
      prompt: '126 + 3 =',
      type: 'input',
      answer: '129',
      explanation: '6 + 3 = 9 w kolumnie jedności — reszta liczby zostaje bez zmian.',
      difficulty: DIFFICULTY_LEVELS[0],
    },
    {
      id: 'p1',
      prompt: '247 + 158 =',
      type: 'input',
      answer: '405',
      explanation:
        '7 + 8 = 15 (zapisz 5, przenieś 1), 4 + 5 + 1 = 10 (zapisz 0, przenieś 1), 2 + 1 + 1 = 4.',
      difficulty: DIFFICULTY_LEVELS[1],
    },
    {
      id: 'p2',
      prompt: '364 + 278 =',
      type: 'input',
      answer: '642',
      explanation:
        '4 + 8 = 12 (zapisz 2, przenieś 1), 6 + 7 + 1 = 14 (zapisz 4, przenieś 1), 3 + 2 + 1 = 6.',
      difficulty: DIFFICULTY_LEVELS[1],
    },
    {
      id: 'r1',
      prompt: '1587 + 8926 =',
      type: 'input',
      answer: '10513',
      explanation:
        'Przeniesienie idzie przez wszystkie cztery kolumny i tworzy nową kolumnę tysięcy — wynik ma o jedną cyfrę więcej niż obie liczby.',
      difficulty: DIFFICULTY_LEVELS[2],
    },
    {
      id: 'r2',
      prompt: '4285 + 76 =',
      type: 'input',
      answer: '4361',
      explanation:
        'Liczba 76 jest krótsza — jej brakujące kolumny (setki, tysiące) po prostu zostają puste, nie dopisujemy tam zer z lewej.',
      difficulty: DIFFICULTY_LEVELS[2],
    },
    {
      id: 'd1',
      prompt: 'Co jest nieprawidłowe w tym zapisie działania 216 + 9?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Brakuje kolumny tysięcy' },
        { id: 'b', text: 'Liczba 9 stoi pod złą kolumną' },
        { id: 'c', text: '216 powinno być pod spodem' },
        { id: 'd', text: 'Wynik powinien mieć więcej cyfr' },
      ],
      correctId: 'b',
      explanation:
        'Liczba 9 ma tylko jedną cyfrę, więc powinna stanąć pod jednościami — a tu stoi pod dziesiątkami, jakby to było 90.',
      visual: (
        <div className="flex justify-center overflow-x-auto">
          <ColumnGrid
            color={color}
            operator="+"
            cells={WRONG_ALIGNMENT_CELLS}
            ariaLabel="Błędnie zapisane dodawanie 216 plus 9, wynik 306"
          />
        </div>
      ),
      difficulty: DIFFICULTY_LEVELS[3],
    },
    {
      id: 'd2',
      prompt: 'Bez liczenia dokładnie: wynik 4128 + 3951 jest bliżej 6000 czy 8000?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Bliżej 8000' },
        { id: 'b', text: 'Bliżej 6000' },
      ],
      correctId: 'a',
      explanation:
        '4128 to około 4000, a 3951 to też około 4000 — razem to około 8000. Dokładny wynik pisemny (8079) to potwierdza.',
      difficulty: DIFFICULTY_LEVELS[3],
    },
  ];
}

interface DodawanieDrillProps {
  color: string;
  onComplete?: (score: number, total: number) => void;
}

/** Ćwiczenia: 8 zadań K/P/R/D, od prostego dodawania w słupku po wykrywanie błędnego ustawienia i szacowanie wyniku. */
export function DodawanieDrill({ color, onComplete }: DodawanieDrillProps) {
  return <DiagnosticQuiz tasks={buildTasks(color)} color={color} onFinish={onComplete} />;
}
