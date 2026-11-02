'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';
import { GeoFigure } from './geo-figure';

const [K, P, R, D] = DIFFICULTY_LEVELS;

interface ClassifyDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: rozpoznawanie i nazywanie czterech obiektów na nowych parach liter. */
export function ClassifyDrill({ color, onComplete }: ClassifyDrillProps) {
  const tasks: DiagnosticTask[] = [
    {
      id: 'rozpoznaj-punkt',
      prompt: 'Co przedstawia ten rysunek?',
      type: 'choice',
      visual: <GeoFigure color={color} kind="punkt" pointA={{ x: 160, y: 100 }} pointB={{ x: 0, y: 0 }} labelA="P" labelB="" />,
      options: [
        { id: 'a', text: 'Punkt' },
        { id: 'b', text: 'Odcinek' },
        { id: 'c', text: 'Prosta' },
        { id: 'd', text: 'Półprosta' },
      ],
      correctId: 'a',
      explanation: 'To jedno konkretne miejsce, bez żadnej linii — punkt P.',
      difficulty: { code: K.code, name: K.name },
    },
    {
      id: 'rozpoznaj-odcinek',
      prompt: 'Co przedstawia ten rysunek?',
      type: 'choice',
      visual: (
        <GeoFigure color={color} kind="odcinek" pointA={{ x: 50, y: 130 }} pointB={{ x: 270, y: 70 }} labelA="E" labelB="F" />
      ),
      options: [
        { id: 'a', text: 'Półprosta' },
        { id: 'b', text: 'Prosta' },
        { id: 'c', text: 'Punkt' },
        { id: 'd', text: 'Odcinek' },
      ],
      correctId: 'd',
      explanation: 'Dwa wyraźne końce, żadnej strzałki — to odcinek EF.',
      difficulty: { code: K.code, name: K.name },
    },
    {
      id: 'zapisz-polprosta',
      prompt: 'Ta półprosta zaczyna się w punkcie G. Jak ją poprawnie zapiszemy?',
      type: 'choice',
      visual: (
        <GeoFigure color={color} kind="polprosta" pointA={{ x: 60, y: 140 }} pointB={{ x: 200, y: 80 }} labelA="G" labelB="H" />
      ),
      options: [
        { id: 'a', text: 'HG' },
        { id: 'b', text: 'prosta GH' },
        { id: 'c', text: 'GH' },
        { id: 'd', text: 'odcinek GH' },
      ],
      correctId: 'c',
      explanation: 'Pierwsza litera to zawsze początek półprostej — skoro zaczyna się w G, zapisujemy GH.',
      difficulty: { code: P.code, name: P.name },
    },
    {
      id: 'konce-prostej',
      prompt: 'Ile końców ma prosta?',
      type: 'input',
      visual: (
        <GeoFigure color={color} kind="prosta" pointA={{ x: 70, y: 150 }} pointB={{ x: 250, y: 60 }} labelA="I" labelB="J" />
      ),
      answer: '0',
      explanation: 'Prosta biegnie w nieskończoność w obie strony — nie ma ani początku, ani końca.',
      difficulty: { code: P.code, name: P.name },
    },
    {
      id: 'mierzalna-dlugosc',
      prompt: 'Który z czterech obiektów jako jedyny ma skończoną, mierzalną długość?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Prosta' },
        { id: 'b', text: 'Półprosta' },
        { id: 'c', text: 'Odcinek' },
        { id: 'd', text: 'Punkt' },
      ],
      correctId: 'c',
      explanation: 'Tylko odcinek ma dwa końce jednocześnie, więc tylko jego długość da się zmierzyć linijką.',
      difficulty: { code: R.code, name: R.name },
    },
    {
      id: 'odwrocona-polprosta',
      prompt: 'Punkty G i H są dokładnie takie same jak wcześniej, ale teraz to półprosta HG. Który punkt jest teraz jej początkiem?',
      type: 'choice',
      visual: (
        <GeoFigure color={color} kind="polprosta" pointA={{ x: 200, y: 80 }} pointB={{ x: 60, y: 140 }} labelA="H" labelB="G" />
      ),
      options: [
        { id: 'a', text: 'G' },
        { id: 'b', text: 'H' },
      ],
      correctId: 'b',
      explanation:
        'W zapisie HG pierwsza litera to zawsze początek — więc ta półprosta zaczyna się w H i biegnie w stronę przeciwną niż GH z wcześniejszego zadania.',
      difficulty: { code: D.code, name: D.name },
    },
  ];

  return <DiagnosticQuiz tasks={tasks} color={color} onFinish={onComplete} />;
}
