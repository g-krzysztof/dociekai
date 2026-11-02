'use client';

import { MapPin } from 'lucide-react';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';

interface City {
  name: string;
  population: number;
}

/** Kolejność celowo alfabetyczna, nie wg wielkości — pytania wymagają realnego porównania liczb. */
const CITIES: City[] = [
  { name: 'Gdańsk', population: 486_000 },
  { name: 'Kraków', population: 804_000 },
  { name: 'Łódź', population: 664_000 },
  { name: 'Poznań', population: 532_000 },
  { name: 'Warszawa', population: 1_863_000 },
  { name: 'Wrocław', population: 643_000 },
];

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'poznan-gdansk',
    question: 'Które miasto z tabeli ma więcej mieszkańców: Poznań czy Gdańsk?',
    options: [
      { id: 'a', text: 'Gdańsk' },
      { id: 'b', text: 'Poznań' },
    ],
    correctId: 'b',
    explanation: '532 000 (Poznań) jest większe niż 486 000 (Gdańsk) — obie liczby mają 6 cyfr, więc trzeba porównać kolejne cyfry.',
  },
  {
    id: 'zapis-slowny',
    question: 'Jak poprawnie zapiszemy słownie liczbę mieszkańców Poznania (532 000)?',
    options: [
      { id: 'a', text: 'pięćdziesiąt trzy tysiące dwieście' },
      { id: 'b', text: 'pięć tysięcy trzysta dwadzieścia' },
      { id: 'c', text: 'pięćset trzydzieści dwa tysiące' },
    ],
    correctId: 'c',
    explanation: '532 000 to klasa tysięcy „532” i pusta klasa jedności — czytamy „pięćset trzydzieści dwa tysiące”.',
  },
  {
    id: 'dziesiatki-tysiecy',
    question: 'W liczbie mieszkańców Warszawy (1 863 000) którą cyfrę zapisano na miejscu dziesiątek tysięcy?',
    options: [
      { id: 'a', text: '1' },
      { id: 'b', text: '8' },
      { id: 'c', text: '6' },
      { id: 'd', text: '3' },
    ],
    correctId: 'c',
    explanation: 'Klasa tysięcy w 1 863 000 to 8-6-3: setki tysięcy 8, dziesiątki tysięcy 6, jedności tysięcy 3.',
  },
  {
    id: 'najmniej',
    question: 'Które z tych miast ma najmniej mieszkańców: Kraków, Łódź, Wrocław czy Gdańsk?',
    options: [
      { id: 'a', text: 'Kraków' },
      { id: 'b', text: 'Łódź' },
      { id: 'c', text: 'Wrocław' },
      { id: 'd', text: 'Gdańsk' },
    ],
    correctId: 'd',
    explanation: '486 000 (Gdańsk) to najmniejsza z czterech liczb — wszystkie mają 6 cyfr, więc decydują kolejne cyfry od lewej.',
  },
];

interface PopulationChallengeProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: liczby mieszkańców polskich miast jako materiał do ćwiczenia czytania i porównywania. */
export function PopulationChallenge({ color, onComplete }: PopulationChallengeProps) {
  return (
    <div className="space-y-5">
      <ul className="divide-y border">
        {CITIES.map((city) => (
          <li key={city.name} className="flex items-center gap-3 px-4 py-3">
            <MapPin className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            <span className="flex-1 text-sm font-medium sm:text-base">{city.name}</span>
            <span className="font-mono text-base font-bold tabular-nums sm:text-lg" style={{ color }}>
              ok. {city.population.toLocaleString('pl-PL')}
            </span>
          </li>
        ))}
      </ul>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
