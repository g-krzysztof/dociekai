'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';
import { BarModel } from '../../bar-model';

const [K, P, R, D] = DIFFICULTY_LEVELS;

function buildTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'co-jest-pytaniem',
      prompt:
        'W zadaniu: „Ela ma 12 naklejek, a Kuba ma 7 naklejek. Ile naklejek ma Ela więcej niż Kuba?” — co jest tu pytaniem?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Ile naklejek ma Kuba' },
        { id: 'b', text: 'Ile naklejek ma Ela więcej niż Kuba' },
        { id: 'c', text: 'Ile naklejek ma Ela' },
        { id: 'd', text: 'Ile naklejek mają razem' },
      ],
      correctId: 'b',
      explanation:
        'Pytanie to zawsze to zdanie, które kończy się znakiem zapytania — reszta to dane.',
      difficulty: { code: K.code, name: K.name },
    },
    {
      id: 'suma-uczniowie',
      prompt: 'W klasie jest 15 dziewczynek i 13 chłopców. Ilu uczniów jest w klasie?',
      type: 'input',
      answer: '28',
      unit: 'uczniów',
      explanation: 'Dwie znane części łączysz w całość dodawaniem: 15 + 13 = 28.',
      difficulty: { code: K.code, name: K.name },
    },
    {
      id: 'buty-tata',
      prompt: 'Tata miał 200 zł. Kupił buty i zostało mu 65 zł. Ile kosztowały buty?',
      type: 'input',
      answer: '135',
      unit: 'zł',
      visual: (
        <BarModel
          spec={{
            type: 'part-whole',
            wholeLabel: 'na start',
            wholeValue: 200,
            parts: [
              { label: 'zostało', value: 65 },
              { label: 'buty', value: null },
            ],
          }}
          color={color}
          size="sm"
        />
      ),
      explanation:
        'Znasz całość (200 zł) i jedną część (65 zł) — brakującą część liczysz odejmowaniem: 200 − 65 = 135.',
      difficulty: { code: P.code, name: P.name },
    },
    {
      id: 'ciastka-tace',
      prompt:
        'Piekarz upiekł 9 tac ciastek. Na każdej tacy było 24 ciastka. Ile ciastek upiekł piekarz?',
      type: 'input',
      answer: '216',
      unit: 'ciastek',
      explanation: 'Dziewięć równych grup po 24 sztuki — to mnożenie: 9 × 24 = 216.',
      difficulty: { code: P.code, name: P.name },
    },
    {
      id: 'biblioteka-dni',
      prompt:
        'Do biblioteki przyszło 84 uczniów w ciągu 4 dni. W poniedziałek padał deszcz. Jeśli każdego dnia przychodziła taka sama liczba uczniów, ilu przychodziło dziennie?',
      type: 'input',
      answer: '21',
      unit: 'uczniów',
      explanation:
        'Pogoda w poniedziałek nie ma znaczenia dla obliczeń — liczy się tylko 84 : 4 = 21.',
      difficulty: { code: R.code, name: R.name },
    },
    {
      id: 'pies-waga',
      prompt:
        'Chłopiec ma 9 lat i waży 32 kg. Jego pies ma 3 lata. O ile kilogramów chłopiec jest cięższy od psa?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Nie da się obliczyć — nie wiemy, ile waży pies' },
        { id: 'b', text: '29 kg' },
        { id: 'c', text: '23 kg' },
        { id: 'd', text: '5 kg' },
      ],
      correctId: 'a',
      explanation:
        'W zadaniu w ogóle nie podano wagi psa — wiek psa (3 lata) to nie to samo co jego waga. Bez tej informacji różnicy nie da się policzyć, nawet jeśli w treści są inne, kuszące liczby.',
      difficulty: { code: D.code, name: D.name },
    },
  ];
}

interface WordProblemDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) — od wskazania pytania po zadanie bez wystarczających danych. */
export function WordProblemDrill({ color, onComplete }: WordProblemDrillProps) {
  return <DiagnosticQuiz tasks={buildTasks(color)} color={color} onFinish={() => onComplete?.()} />;
}
