'use client';

import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { NumberLine } from '../../number-line';

const STOPS = [
  { value: 0, label: 'START' },
  { value: 12, label: 'Wieża widokowa' },
  { value: 27, label: 'Jezioro' },
  { value: 40, label: 'META' },
];

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'dlugosc-trasy',
    question: 'Ile kilometrów ma cała trasa?',
    options: [
      { id: 'a', text: '28 km' },
      { id: 'b', text: '52 km' },
      { id: 'c', text: '12 km' },
      { id: 'd', text: '40 km' },
    ],
    correctId: 'd',
    explanation: 'Trasa biegnie od 0 do 40 na osi, więc ma 40 km.',
  },
  {
    id: 'blizej-mety',
    question: 'Który punkt trasy jest bliżej mety: Wieża widokowa czy Jezioro?',
    options: [
      { id: 'a', text: 'Jezioro' },
      { id: 'b', text: 'Wieża widokowa' },
    ],
    correctId: 'a',
    explanation: 'Jezioro (27 km) leży dalej w prawo na osi niż Wieża widokowa (12 km), więc jest bliżej mety (40 km).',
  },
  {
    id: 'polowa-trasy',
    question: 'Rowerzysta jest dokładnie w połowie trasy (20 km). Między którymi punktami się znajduje?',
    options: [
      { id: 'a', text: 'START a Wieża widokowa' },
      { id: 'b', text: 'Jezioro a META' },
      { id: 'c', text: 'Wieża widokowa a Jezioro' },
    ],
    correctId: 'c',
    explanation: '20 km leży między Wieżą widokową (12 km) a Jeziorem (27 km).',
  },
  {
    id: 'odleglosc-miedzy',
    question: 'Ile kilometrów dzieli Wieżę widokową od Jeziora?',
    options: [
      { id: 'a', text: '39 km' },
      { id: 'b', text: '15 km' },
      { id: 'c', text: '9 km' },
      { id: 'd', text: '21 km' },
    ],
    correctId: 'b',
    explanation: 'Odległość na osi to różnica pozycji: 27 − 12 = 15 km.',
  },
];

interface RouteMapProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: trasa rowerowa jako oś liczbowa z przystankami. */
export function RouteMap({ color, onComplete }: RouteMapProps) {
  return (
    <div className="space-y-5">
      <div className="border p-5 sm:p-6" style={{ backgroundColor: `${color}0a` }}>
        <NumberLine
          min={0}
          max={40}
          majorStep={10}
          color={color}
          markers={STOPS.map((stop) => ({ value: stop.value, label: stop.label }))}
          ariaLabel="Trasa rowerowa od 0 do 40 kilometrów z czterema przystankami"
        />
      </div>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
