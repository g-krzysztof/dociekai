import type { DiagnosticTask } from '../../diagnostic-quiz';
import { ScaleShiftMini } from './scale-shift-mini';

/**
 * Ćwiczenia: od mnożenia i dzielenia przez 10 w pamięci, przez dopisywanie zer,
 * po klasyczną pułapkę „dopisuję zera zawsze" i zadanie z ceną hurtową.
 * Poziomy K/P/R/D.
 */
export function buildScalingDrill(color: string): DiagnosticTask[] {
  return [
    {
      id: 'x10-25',
      prompt: 'Policz w pamięci: 2,5 · 10 = ?',
      type: 'input',
      answer: '25',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: '10 ma jedno zero, więc przecinek przeskakuje o 1 w prawo: 2,5 → 25.',
    },
    {
      id: 'd10-63',
      prompt: 'Policz w pamięci: 6,3 : 10 = ?',
      type: 'input',
      answer: '0,63',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: '10 ma jedno zero, więc przecinek przeskakuje o 1 w lewo: 6,3 → 0,63. Przed przecinkiem piszemy 0.',
    },
    {
      id: 'x100-04',
      prompt: 'Policz: 0,4 · 100 = ?',
      type: 'input',
      answer: '40',
      visual: <ScaleShiftMini input="0,4" op="x100" color={color} />,
      difficulty: { code: 'P', name: 'Podstawowe' },
      explanation:
        '100 ma dwa zera → przecinek o 2 w prawo. 0,4 ma tylko jedną cyfrę po przecinku, więc brakujące miejsce dopełniamy zerem: 40.',
    },
    {
      id: 'x1000-37',
      prompt: 'Ile to 3,7 · 1000?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '37 000' },
        { id: 'b', text: '3700' },
        { id: 'c', text: '370' },
        { id: 'd', text: '0,0037' },
      ],
      correctId: 'b',
      explanation:
        '1000 ma trzy zera → przecinek o 3 w prawo. 3,7 → 37, brakują dwa miejsca, dopisujemy dwa zera: 3700.',
    },
    {
      id: 'pulapka-dopisz-zera',
      prompt: 'Kuba policzył 5,2 · 100 tak: „dopisuję dwa zera na końcu: 5,200”. Wpisz poprawny wynik.',
      type: 'input',
      answer: '520',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation:
        'Zera dopisujemy dopiero wtedy, gdy przecinek WYJDZIE poza cyfry. Tu przecinek przeskakuje o 2 w prawo: 5,2 → 52, brakuje jeszcze jednego miejsca → 520. Zapis 5,200 to wciąż 5,2.',
    },
    {
      id: 'd10-008',
      prompt: 'Policz: 0,08 : 10 = ?',
      type: 'input',
      answer: '0,008',
      visual: <ScaleShiftMini input="0,08" op="d10" color={color} />,
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation:
        '10 ma jedno zero → przecinek o 1 w lewo. 0,08 → przed ósemką dochodzi jeszcze jedno zero: 0,008.',
    },
    {
      id: 'cena-hurtowa',
      prompt: '1000 jednakowych gwoździ waży razem 4,5 kg. Ile waży jeden gwóźdź?',
      type: 'choice',
      difficulty: { code: 'D', name: 'Dopełniające' },
      options: [
        { id: 'a', text: '4500 kg' },
        { id: 'b', text: '0,45 kg' },
        { id: 'c', text: '0,0045 kg' },
        { id: 'd', text: '0,045 kg' },
      ],
      correctId: 'c',
      explanation:
        '„1000 sztuk waży 4,5 kg” → jedna sztuka to 4,5 : 1000. Przecinek o 3 w lewo, z dwoma zerami z przodu: 0,0045 kg.',
    },
  ];
}
