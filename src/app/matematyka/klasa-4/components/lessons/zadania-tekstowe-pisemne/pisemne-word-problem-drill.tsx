'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';

const [K, P, R, D] = DIFFICULTY_LEVELS;

const TASKS: DiagnosticTask[] = [
  {
    id: 'biblioteka-suma',
    prompt:
      'Biblioteka szkolna ma 2860 książek beletrystycznych i 1450 książek popularnonaukowych. Ile książek ma razem?',
    type: 'input',
    answer: '4310',
    unit: 'książek',
    explanation: 'Dwie znane części, szukana całość — dodawanie pisemne: 2860 + 1450 = 4310.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'piekarnia-zostalo',
    prompt: 'Piekarnia upiekła 3200 bułek. Sprzedała 2485 bułek. Ile bułek zostało?',
    type: 'input',
    answer: '715',
    unit: 'bułek',
    explanation: 'Znasz całość i jedną część — odejmowanie pisemne: 3200 − 2485 = 715.',
    difficulty: { code: K.code, name: K.name },
  },
  {
    id: 'krzesla-koncert',
    prompt: 'Na koncercie ustawiono 18 rzędów krzeseł po 42 krzesła w rzędzie. Ile krzeseł ustawiono?',
    type: 'input',
    answer: '756',
    unit: 'krzeseł',
    explanation: 'Równe grupy przy dwucyfrowym mnożniku — mnożenie pisemne: 18 × 42 = 756.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'zeszyty-kartony',
    prompt: 'Fabryka zapakowała 936 zeszytów po równo do 8 kartonów. Ile zeszytów trafiło do jednego kartonu?',
    type: 'input',
    answer: '117',
    unit: 'zeszytów',
    explanation: 'Znasz sumę i liczbę grup — dzielenie pisemne: 936 : 8 = 117.',
    difficulty: { code: P.code, name: P.name },
  },
  {
    id: 'sok-kartony',
    prompt:
      'Sklep zamówił 45 kartonów soku. W każdym kartonie jest 24 butelki. Cena jednej butelki to 3 zł. Ile butelek soku zamówił sklep?',
    type: 'input',
    answer: '1080',
    unit: 'butelek',
    explanation:
      'Cena butelki (3 zł) nie jest tu potrzebna — liczy się tylko mnożenie pisemne: 45 × 24 = 1080.',
    difficulty: { code: R.code, name: R.name },
  },
  {
    id: 'budzet-nagrody',
    prompt:
      'Szkoła ma budżet 5000 zł na nagrody. Kupiła 38 zestawów nagród po 95 zł każdy. Ile pieniędzy zostało w budżecie po zakupie?',
    type: 'input',
    answer: '1390',
    unit: 'zł',
    explanation:
      'Dwa kroki: najpierw koszt zestawów (38 × 95 = 3610 zł), potem reszta z budżetu (5000 − 3610 = 1390 zł).',
    difficulty: { code: D.code, name: D.name },
  },
];

interface PisemneWordProblemDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) z liczbami wymagającymi działań pisemnych, ostatnie dwuetapowe. */
export function PisemneWordProblemDrill({ color, onComplete }: PisemneWordProblemDrillProps) {
  return <DiagnosticQuiz tasks={TASKS} color={color} onFinish={() => onComplete?.()} />;
}
