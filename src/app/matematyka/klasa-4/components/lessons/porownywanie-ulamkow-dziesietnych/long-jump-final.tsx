'use client';

import { MoveHorizontal } from 'lucide-react';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';

interface Jumper {
  name: string;
  distance: string;
}

/** Kolejność alfabetyczna, nie wg wyniku — pytania wymagają realnego porównania. */
const JUMPERS: Jumper[] = [
  { name: 'Bartek', distance: '3,405' },
  { name: 'Lena', distance: '3,4' },
  { name: 'Nikodem', distance: '3,45' },
  { name: 'Sara', distance: '3,399' },
  { name: 'Wojtek', distance: '3,41' },
];

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'najdluzszy',
    question: 'Kto skoczył najdalej?',
    options: [
      { id: 'a', text: 'Wojtek (3,41 m)' },
      { id: 'b', text: 'Nikodem (3,45 m)' },
      { id: 'c', text: 'Bartek (3,405 m)' },
      { id: 'd', text: 'Lena (3,4 m)' },
    ],
    correctId: 'b',
    explanation:
      'Po wyrównaniu do trzech miejsc: 3,450 to najwięcej. 3,45 m Nikodema bije 3,41; 3,405 i 3,4.',
  },
  {
    id: 'najkrotszy',
    question: 'Czyj skok był najkrótszy?',
    options: [
      { id: 'a', text: 'Lena (3,4 m)' },
      { id: 'b', text: 'Bartek (3,405 m)' },
      { id: 'c', text: 'Sara (3,399 m)' },
      { id: 'd', text: 'Wszyscy skoczyli tak samo' },
    ],
    correctId: 'c',
    explanation:
      '3,399 zaczyna się od „3,3…”, a wszystkie inne od „3,4…”. Mimo że „399” wygląda na dużo, to najmniejsza z liczb.',
  },
  {
    id: 'odczyt',
    question: 'Czyj wynik to „trzy całe i cztery dziesiąte metra”?',
    options: [
      { id: 'a', text: 'Bartek' },
      { id: 'b', text: 'Nikodem' },
      { id: 'c', text: 'Wojtek' },
      { id: 'd', text: 'Lena' },
    ],
    correctId: 'd',
    explanation: '„Trzy całe i cztery dziesiąte” to 3,4 — wynik Leny.',
  },
  {
    id: 'bartek-wojtek',
    question: 'Który skok był dłuższy — Bartka (3,405 m) czy Wojtka (3,41 m)?',
    options: [
      { id: 'a', text: 'Bartka, bo 405 to więcej niż 41' },
      { id: 'b', text: 'Wojtka' },
      { id: 'c', text: 'Oba były równe' },
      { id: 'd', text: 'Nie da się porównać' },
    ],
    correctId: 'b',
    explanation:
      'Wyrównaj: 3,405 i 3,410. Rząd dziesiątych równy (4 = 4), w setnych 0 < 1 — więc 3,41 > 3,405.',
  },
  {
    id: 'ilu-ponad-34',
    question: 'Ilu zawodników skoczyło dalej niż 3,4 m (czyli więcej niż dokładnie 3,4)?',
    options: [
      { id: 'a', text: '2' },
      { id: 'b', text: '4' },
      { id: 'c', text: '3' },
      { id: 'd', text: '5' },
    ],
    correctId: 'c',
    explanation:
      'Dalej niż 3,400 skoczyli: Bartek (3,405), Nikodem (3,45) i Wojtek (3,41) — trzech. Lena ma dokładnie 3,4, a Sara mniej.',
  },
];

interface LongJumpFinalProps {
  color: string;
  onComplete?: () => void;
}

/** Zadanie problemowe: finał skoku w dal — wyniki w metrach do tysięcznych jako materiał do porównywania i porządkowania. */
export function LongJumpFinal({ color, onComplete }: LongJumpFinalProps) {
  return (
    <div className="space-y-5">
      <div className="border">
        <p
          className="border-b px-4 py-2 text-xs font-bold uppercase tracking-wide"
          style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
        >
          Finał skoku w dal — wyniki (w metrach)
        </p>
        <ul className="divide-y">
          {JUMPERS.map((jumper) => (
            <li key={jumper.name} className="flex items-center gap-3 px-4 py-3">
              <MoveHorizontal className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span className="flex-1 text-sm font-medium sm:text-base">{jumper.name}</span>
              <span
                className="font-mono text-base font-bold tabular-nums sm:text-lg"
                style={{ color }}
              >
                {jumper.distance} m
              </span>
            </li>
          ))}
        </ul>
      </div>

      <LessonQuiz questions={QUESTIONS} color={color} onFinish={() => onComplete?.()} />
    </div>
  );
}
