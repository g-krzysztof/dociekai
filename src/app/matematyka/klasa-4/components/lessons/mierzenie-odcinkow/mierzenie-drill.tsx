'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';
import { RulerVisual } from './ruler-visual';

const [K, P, R, D] = DIFFICULTY_LEVELS;

interface MierzenieDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: odczyty z gotowych rysunków linijki, w tym odcinki, które NIE zaczynają się od zera. */
export function MierzenieDrill({ color, onComplete }: MierzenieDrillProps) {
  const tasks: DiagnosticTask[] = [
    {
      id: 'odczyt-od-zera',
      prompt: 'Ile mm ma ten odcinek?',
      type: 'input',
      visual: (
        <RulerVisual color={color} maxMm={100} segmentStartMm={0} segmentEndMm={38} labelA="K" labelB="L" />
      ),
      answer: '38',
      unit: 'mm',
      explanation: 'Odcinek zaczyna się w zerze, więc odczyt przy L to od razu jego długość: 38 mm.',
      difficulty: { code: K.code, name: K.name },
    },
    {
      id: 'zamiana-cm-mm',
      prompt: '7 cm 4 mm to ile milimetrów?',
      type: 'choice',
      options: [
        { id: 'a', text: '47 mm' },
        { id: 'b', text: '74 mm' },
        { id: 'c', text: '11 mm' },
        { id: 'd', text: '740 mm' },
      ],
      correctId: 'b',
      explanation: '1 cm to 10 mm, więc 7 cm = 70 mm. Dodaj resztę: 70 mm + 4 mm = 74 mm.',
      difficulty: { code: K.code, name: K.name },
    },
    {
      id: 'odczyt-nie-od-zera',
      prompt: 'Ten odcinek narysowano na linijce, ale nie zaczyna się w zerze. Ile ma mm?',
      type: 'input',
      visual: (
        <RulerVisual color={color} maxMm={100} segmentStartMm={15} segmentEndMm={69} labelA="M" labelB="N" />
      ),
      answer: '54',
      unit: 'mm',
      explanation: 'Skoro nie zaczyna się w zerze, odejmij: 69 mm − 15 mm = 54 mm.',
      difficulty: { code: P.code, name: P.name },
    },
    {
      id: 'zamiana-62mm',
      prompt: '62 mm zapiszemy w cm i mm jako:',
      type: 'choice',
      options: [
        { id: 'a', text: '2 cm 6 mm' },
        { id: 'b', text: '62 cm' },
        { id: 'c', text: '6 cm 2 mm' },
        { id: 'd', text: '6 cm 20 mm' },
      ],
      correctId: 'c',
      explanation: '62 mm to 6 pełnych dziesiątek (6 cm) i reszta 2 mm — czyli 6 cm 2 mm.',
      difficulty: { code: P.code, name: P.name },
    },
    {
      id: 'odczyt-duzy',
      prompt: 'A ile ma ten odcinek?',
      type: 'input',
      visual: (
        <RulerVisual color={color} maxMm={150} segmentStartMm={27} segmentEndMm={134} labelA="O" labelB="P" />
      ),
      answer: '107',
      unit: 'mm',
      explanation: '134 mm − 27 mm = 107 mm.',
      difficulty: { code: R.code, name: R.name },
    },
    {
      id: 'poprawne-ustawienie',
      prompt: 'Które ustawienie linijki daje poprawny pomiar odcinka?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Fizyczny brzeg linijki na początku odcinka' },
        { id: 'b', text: 'Dowolne miejsce na linijce' },
        { id: 'c', text: 'Środek linijki na początku odcinka' },
        { id: 'd', text: 'Kreska 0 na początku odcinka' },
      ],
      correctId: 'd',
      explanation:
        'Tylko kreska 0 wyznacza prawdziwy początek pomiaru — brzeg linijki to nie zawsze to samo miejsce, co zaraz zobaczysz.',
      difficulty: { code: D.code, name: D.name },
    },
  ];

  return <DiagnosticQuiz tasks={tasks} color={color} onFinish={onComplete} />;
}
