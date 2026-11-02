import type { DiagnosticTask } from '../../diagnostic-quiz';
import { buildDecimalSubtraction } from '../../../lib/decimal-subtraction';
import { ColumnSubGrid } from './column-sub-grid';

/** Sam obraz ustawionego słupka (bez wyniku) — podpowiedź „jak to zapisać". */
function StackVisual({ a, b, color }: { a: string; b: string; color: string }) {
  return (
    <ColumnSubGrid subtraction={buildDecimalSubtraction(a, b)} color={color} revealed={0} showAllZeros />
  );
}

/**
 * Ćwiczenia: od odejmowania w pamięci, przez pisemne z pożyczaniem przez
 * przecinek, po klasyczną pułapkę „odejmij bez przecinka" i resztę z zakupów.
 * Poziomy K/P/R/D.
 */
export function buildDecimalSubDrill(color: string): DiagnosticTask[] {
  return [
    {
      id: 'pamiec-07-03',
      prompt: 'Policz w pamięci: 0,7 − 0,3 = ?',
      type: 'input',
      answer: '0,4',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: '7 dziesiątych − 3 dziesiąte = 4 dziesiąte, czyli 0,4. Część całkowita zostaje 0.',
    },
    {
      id: 'pamiec-48-25',
      prompt: 'Policz w pamięci: 4,8 − 2,5 = ?',
      type: 'input',
      answer: '2,3',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: 'Osobno całości: 4 − 2 = 2. Osobno dziesiąte: 8 − 5 = 3. Składamy: 2,3.',
    },
    {
      id: 'przez-przecinek-13-06',
      prompt: 'Policz: 1,3 − 0,6 = ?',
      type: 'input',
      answer: '0,7',
      visual: <StackVisual a="1,3" b="0,6" color={color} />,
      difficulty: { code: 'P', name: 'Podstawowe' },
      explanation:
        '3 dziesiąte to za mało, żeby odjąć 6. Pożyczamy 1 całą przez przecinek: 13 dziesiątych − 6 = 7 dziesiątych, a w jednościach zostaje 0. Wynik: 0,7.',
    },
    {
      id: 'wybor-345-12',
      prompt: 'Ile to 3,45 − 1,2?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '2,43' },
        { id: 'b', text: '3,33' },
        { id: 'c', text: '2,25' },
        { id: 'd', text: '2,2' },
      ],
      correctId: 'c',
      explanation:
        '1,2 zapisujemy jako 1,20. Setne: 5 − 0 = 5. Dziesiąte: 4 − 2 = 2. Jedności: 3 − 1 = 2. Wynik: 2,25.',
    },
    {
      id: 'pulapka-bez-przecinka',
      prompt: 'Ola policzyła 5,2 − 3,15 tak: „52 − 315 się nie da, więc 315 − 52 = 263, czyli 2,63". Wpisz poprawny wynik.',
      type: 'input',
      answer: '2,05',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation:
        'Ola pomyliła kolejność i rzędy. Poprawnie: 5,2 to 5,20. Setne: 0 − 5 — pożyczamy, 10 − 5 = 5. Dziesiąte: 1 − 1 = 0. Jedności: 5 − 3 = 2. Wynik: 2,05.',
    },
    {
      id: 'lancuch-6-247',
      prompt: 'Policz pisemnie: 6 − 2,47 = ?',
      type: 'input',
      answer: '3,53',
      visual: <StackVisual a="6" b="2,47" color={color} />,
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation:
        '6 to 6,00. Setne: 0 − 7 — pożyczka wędruje przez dwa zera: jedności oddają 1 dziesiątym, dziesiąte oddają 1 setnym. Setne: 10 − 7 = 3. Dziesiąte: 9 − 4 = 5. Jedności: 4 − 2 = 2. Wynik: 3,53.',
    },
    {
      id: 'reszta-z-zakupu',
      prompt: 'Płacisz banknotem 20 zł za zakupy o wartości 13,60 zł. Ile reszty dostaniesz?',
      type: 'choice',
      difficulty: { code: 'D', name: 'Dopełniające' },
      options: [
        { id: 'a', text: '7,40 zł' },
        { id: 'b', text: '6,40 zł' },
        { id: 'c', text: '6,60 zł' },
        { id: 'd', text: '13,60 zł' },
      ],
      correctId: 'b',
      explanation:
        '20,00 − 13,60. Setne: 0 − 0 = 0. Dziesiąte: 0 − 6 — pożyczka. 10 − 6 = 4. Jedności: 9 − 3 = 6. Dziesiątki: 1 − 1 = 0. Reszta: 6,40 zł.',
    },
  ];
}
