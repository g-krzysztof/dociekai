import type { DiagnosticTask } from '../../diagnostic-quiz';
import { buildDecimalAddition } from '../../../lib/decimal-addition';
import { ColumnAddGrid } from './column-add-grid';

/** Sam obraz ustawionego słupka (bez wyniku) — podpowiedź „jak to zapisać". */
function StackVisual({ a, b, color }: { a: string; b: string; color: string }) {
  return <ColumnAddGrid addition={buildDecimalAddition(a, b)} color={color} revealed={0} showAllZeros />;
}

/**
 * Ćwiczenia: od dodawania w pamięci, przez pisemne z przeniesieniem przez
 * przecinek, po klasyczną pułapkę „wyrównaj do prawej" i rachunek ze sklepiku.
 * Poziomy K/P/R/D.
 */
export function buildDecimalAddDrill(color: string): DiagnosticTask[] {
  return [
    {
      id: 'pamiec-03-04',
      prompt: 'Policz w pamięci: 0,3 + 0,4 = ?',
      type: 'input',
      answer: '0,7',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: '3 dziesiąte + 4 dziesiąte = 7 dziesiątych, czyli 0,7. Część całkowita zostaje 0.',
    },
    {
      id: 'pamiec-12-35',
      prompt: 'Policz w pamięci: 1,2 + 3,5 = ?',
      type: 'input',
      answer: '4,7',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: 'Osobno całości: 1 + 3 = 4. Osobno dziesiąte: 2 + 5 = 7. Składamy: 4,7.',
    },
    {
      id: 'przez-przecinek-08-06',
      prompt: 'Policz: 0,8 + 0,6 = ?',
      type: 'input',
      answer: '1,4',
      visual: <StackVisual a="0,8" b="0,6" color={color} />,
      difficulty: { code: 'P', name: 'Podstawowe' },
      explanation:
        '8 dziesiątych + 6 dziesiątych = 14 dziesiątych. Zapisujemy 4, a 1 całą przenosimy przez przecinek: 1,4.',
    },
    {
      id: 'wybor-245-13',
      prompt: 'Ile to 2,45 + 1,3?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '3,58' },
        { id: 'b', text: '3,75' },
        { id: 'c', text: '2,75' },
        { id: 'd', text: '3,7' },
      ],
      correctId: 'b',
      explanation:
        '1,3 dopisujemy jako 1,30. Setne: 5 + 0 = 5. Dziesiąte: 4 + 3 = 7. Jedności: 2 + 1 = 3. Wynik: 3,75.',
    },
    {
      id: 'pulapka-do-prawej',
      prompt:
        'Franek policzył 0,7 + 0,25 tak: „7 + 25 = 32, więc 0,32". Wpisz poprawny wynik.',
      type: 'input',
      answer: '0,95',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation:
        'Franek wyrównał liczby do prawej. Poprawnie: 0,7 to 0,70, czyli 70 setnych. 70 setnych + 25 setnych = 95 setnych = 0,95.',
    },
    {
      id: 'dwa-przeniesienia-57-458',
      prompt: 'Policz pisemnie: 5,7 + 4,58 = ?',
      type: 'input',
      answer: '10,28',
      visual: <StackVisual a="5,7" b="4,58" color={color} />,
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation:
        '5,7 to 5,70. Setne: 0 + 8 = 8. Dziesiąte: 7 + 5 = 12 → 2, przenosimy 1 przez przecinek. Jedności: 5 + 4 + 1 = 10 → 0, przenosimy 1 do dziesiątek. Wynik: 10,28.',
    },
    {
      id: 'sklepik-suma',
      prompt: 'W sklepiku: sok 2,80 zł, bułka 1,45 zł, jabłko 0,90 zł. Ile kosztują razem?',
      type: 'choice',
      difficulty: { code: 'D', name: 'Dopełniające' },
      options: [
        { id: 'a', text: '4,15 zł' },
        { id: 'b', text: '5,05 zł' },
        { id: 'c', text: '5,15 zł' },
        { id: 'd', text: '5,25 zł' },
      ],
      correctId: 'c',
      explanation:
        'Dodajemy po kolei: 2,80 + 1,45 = 4,25, a potem 4,25 + 0,90 = 5,15 zł. Wszystkie kwoty mają po dwa miejsca po przecinku, więc grosze pod groszami.',
    },
  ];
}
