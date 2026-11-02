'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { ColumnGrid, type ColumnCellData } from '../../column-grid';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

/**
 * Ręcznie ułożony błędny zapis 62 − 35: kolumna dziesiątek pożyczyła jedności
 * dziesiątkę, ale jej cyfra (6) nie została zmniejszona do 5 — do zadania
 * „znajdź błąd".
 */
const WRONG_BORROW_CELLS: ColumnCellData[] = [
  { place: 'dziesiątki', top: 6, bottom: 3, result: 3 },
  { place: 'jedności', top: 2, bottom: 5, result: 7, borrowedTen: true },
];

function buildTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'k1',
      prompt: '63 − 28 =',
      type: 'input',
      answer: '35',
      explanation: '3 jest mniejsze od 8, więc pożyczamy 10 z dziesiątek: 13 − 8 = 5, a 5 (po oddaniu) minus 2 = 3.',
      difficulty: DIFFICULTY_LEVELS[0],
    },
    {
      id: 'k2',
      prompt: '91 − 47 =',
      type: 'input',
      answer: '44',
      explanation: '1 jest mniejsze od 7, pożyczamy 10: 11 − 7 = 4. Dziewiątka po oddaniu to 8, 8 − 4 = 4.',
      difficulty: DIFFICULTY_LEVELS[0],
    },
    {
      id: 'p1',
      prompt: '623 − 359 =',
      type: 'input',
      answer: '264',
      explanation: 'Pożyczanie powtarza się w dwóch kolumnach z rzędu: jedności i dziesiątki.',
      difficulty: DIFFICULTY_LEVELS[1],
    },
    {
      id: 'p2',
      prompt: '700 − 456 =',
      type: 'input',
      answer: '244',
      explanation:
        'Dziesiątki i setki mają zapisane zero — pożyczka przechodzi przez obie, zanim dotrze do jedynej niezerowej cyfry.',
      difficulty: DIFFICULTY_LEVELS[1],
    },
    {
      id: 'r1',
      prompt: '6253 − 1487 =',
      type: 'input',
      answer: '4766',
      explanation: 'Pożyczanie powtarza się w trzech kolejnych kolumnach, ale bez żadnego zera po drodze.',
      difficulty: DIFFICULTY_LEVELS[2],
    },
    {
      id: 'r2',
      prompt: '2000 − 856 =',
      type: 'input',
      answer: '1144',
      explanation:
        'Trzy zera z rzędu — pożyczka wędruje od jedności, przez dziesiątki i setki, aż do tysięcy, które jako jedyne mają czym się podzielić.',
      difficulty: DIFFICULTY_LEVELS[2],
    },
    {
      id: 'd1',
      prompt: 'Co jest nieprawidłowe w tym zapisie działania 62 − 35?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Wynik powinien mieć więcej cyfr' },
        { id: 'b', text: 'Kolumna dziesiątek nie została zmniejszona po pożyczeniu' },
        { id: 'c', text: 'Liczby są źle ustawione względem siebie' },
        { id: 'd', text: 'W kolumnie jedności nie trzeba było pożyczać' },
      ],
      correctId: 'b',
      explanation:
        'Dziesiątki oddały jedynkę jedności, więc ich cyfra powinna zmienić się z 6 na 5 (przekreślona) — tu wciąż stoi 6, jakby nic nie pożyczono.',
      visual: (
        <div className="flex justify-center overflow-x-auto">
          <ColumnGrid
            color={color}
            operator="−"
            cells={WRONG_BORROW_CELLS}
            ariaLabel="Błędnie zapisane odejmowanie 62 minus 35, wynik 37"
          />
        </div>
      ),
      difficulty: DIFFICULTY_LEVELS[3],
    },
    {
      id: 'd2',
      prompt: 'Bez liczenia dokładnie: różnica 8043 − 3958 jest bliżej 4000 czy 5000?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Bliżej 5000' },
        { id: 'b', text: 'Bliżej 4000' },
      ],
      correctId: 'b',
      explanation:
        '8043 to około 8000, a 3958 to około 4000 — różnica to około 4000. Dokładny wynik pisemny (4085) to potwierdza.',
      difficulty: DIFFICULTY_LEVELS[3],
    },
  ];
}

interface OdejmowanieDrillProps {
  color: string;
  onComplete?: (score: number, total: number) => void;
}

/** Ćwiczenia: 8 zadań K/P/R/D, od prostego pożyczania po wykrywanie błędnie zapisanej redukcji i szacowanie różnicy. */
export function OdejmowanieDrill({ color, onComplete }: OdejmowanieDrillProps) {
  return <DiagnosticQuiz tasks={buildTasks(color)} color={color} onFinish={onComplete} />;
}
