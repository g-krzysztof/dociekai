'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';
import { LinePairFigure } from './line-pair-figure';

const [K, P, R, D] = DIFFICULTY_LEVELS;

interface ClassifyDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: rozpoznawanie relacji między parami prostych na rysunkach. */
export function ClassifyDrill({ color, onComplete }: ClassifyDrillProps) {
  const tasks: DiagnosticTask[] = [
    {
      id: 'rozpoznaj-prostopadle',
      prompt: 'Jak nazywamy te dwie proste?',
      type: 'choice',
      visual: <LinePairFigure color={color} relation="prostopadle" labelA="a" labelB="b" />,
      options: [
        { id: 'a', text: 'Prostopadłe' },
        { id: 'b', text: 'Równoległe' },
        { id: 'c', text: 'To jedna i ta sama prosta' },
      ],
      correctId: 'a',
      explanation:
        'Przecinają się pod kątem prostym (90°) — kwadracik w rogu to znak kąta prostego, a to proste prostopadłe.',
      difficulty: { code: K.code, name: K.name },
    },
    {
      id: 'rozpoznaj-rownolegle',
      prompt: 'Jak nazywamy te dwie proste?',
      type: 'choice',
      visual: <LinePairFigure color={color} relation="rownolegle" labelA="c" labelB="d" />,
      options: [
        { id: 'a', text: 'Przecinające się' },
        { id: 'b', text: 'Równoległe' },
        { id: 'c', text: 'Prostopadłe' },
      ],
      correctId: 'b',
      explanation:
        'Nigdy się nie przetną i cały czas są w tej samej odległości — to proste równoległe (∥).',
      difficulty: { code: K.code, name: K.name },
    },
    {
      id: 'skosne-nie-prostopadle',
      prompt: 'Te proste przecinają się, ale nie pod kątem prostym. Czy są prostopadłe?',
      type: 'choice',
      visual: <LinePairFigure color={color} relation="skosne" />,
      options: [
        { id: 'a', text: 'Tak' },
        { id: 'b', text: 'Nie' },
      ],
      correctId: 'b',
      explanation:
        'Prostopadłe znaczy dokładnie „pod kątem prostym”. Te przecinają się pod kątem ostrym, więc prostopadłe nie są.',
      difficulty: { code: P.code, name: P.name },
    },
    {
      id: 'miara-kata-prostego',
      prompt: 'Ile stopni ma kąt, pod którym przecinają się proste prostopadłe?',
      type: 'input',
      answer: '90',
      unit: '°',
      explanation: 'Prostopadłe proste przecinają się zawsze pod kątem prostym, czyli 90°.',
      difficulty: { code: P.code, name: P.name },
    },
    {
      id: 'symbol-prostopadlosci',
      prompt: 'Którym zapisem oznaczymy: prosta a jest prostopadła do prostej b?',
      type: 'choice',
      options: [
        { id: 'a', text: 'a ⊥ b' },
        { id: 'b', text: 'a ∥ b' },
        { id: 'c', text: 'a = b' },
        { id: 'd', text: 'a ≈ b' },
      ],
      correctId: 'a',
      explanation:
        'Znak ⊥ wygląda jak dwie prostopadłe kreski — czytamy go „jest prostopadła do”. Symbol ∥ to równoległość.',
      difficulty: { code: R.code, name: R.name },
    },
    {
      id: 'przenoszenie-rownoleglosci',
      prompt:
        'Prosta a jest równoległa do prostej b, a prosta b jest równoległa do prostej c. Co możesz powiedzieć o prostych a i c?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Są prostopadłe' },
        { id: 'b', text: 'Przecinają się' },
        { id: 'c', text: 'Nie da się ustalić' },
        { id: 'd', text: 'Są równoległe' },
      ],
      correctId: 'd',
      explanation:
        'Równoległość się przenosi: jeśli a ∥ b i b ∥ c, to także a ∥ c — jak szczeble drabiny, wszystkie w tę samą stronę.',
      difficulty: { code: D.code, name: D.name },
    },
  ];

  return <DiagnosticQuiz tasks={tasks} color={color} onFinish={onComplete} />;
}