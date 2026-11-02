'use client';

import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { DIFFICULTY_LEVELS } from '../../../data/curriculum';
import { NumberLine } from '../../number-line';

const [K, P, R, D] = DIFFICULTY_LEVELS;

function buildTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'odczyt-podpisana',
      prompt: 'Jaka liczba jest zaznaczona na osi?',
      type: 'choice',
      options: [
        { id: 'a', text: '6' },
        { id: 'b', text: '8' },
        { id: 'c', text: '7' },
        { id: 'd', text: '5' },
      ],
      correctId: 'c',
      explanation: 'Punkt stoi dokładnie na dużej kresce podpisanej liczbą 7.',
      difficulty: { code: K.code, name: K.name },
      visual: (
        <NumberLine
          min={0}
          max={10}
          majorStep={1}
          color={color}
          markers={[{ value: 7 }]}
          ariaLabel="Oś liczbowa od 0 do 10 z zaznaczonym punktem"
        />
      ),
    },
    {
      id: 'wartosc-dzialki',
      prompt: 'Ile wynosi jedna mała działka (kreska) na tej osi?',
      type: 'choice',
      options: [
        { id: 'a', text: '5' },
        { id: 'b', text: '1' },
        { id: 'c', text: '10' },
        { id: 'd', text: '2' },
      ],
      correctId: 'a',
      explanation: 'Od 0 do 50 są duże kreski co 10, a każda z nich podzielona jest na 2 części po 5.',
      difficulty: { code: K.code, name: K.name },
      visual: (
        <NumberLine
          min={0}
          max={50}
          majorStep={10}
          minorStep={5}
          color={color}
          ariaLabel="Oś liczbowa od 0 do 50 z małymi działkami"
        />
      ),
    },
    {
      id: 'odczyt-miedzy',
      prompt: 'Jaką wartość ma zaznaczony punkt?',
      type: 'choice',
      options: [
        { id: 'a', text: '120' },
        { id: 'b', text: '140' },
        { id: 'c', text: '110' },
        { id: 'd', text: '130' },
      ],
      correctId: 'd',
      explanation: 'Duże kreski są co 20, małe co 10. Punkt stoi 3 małe kreski za liczbą 100, czyli 100 + 30 = 130.',
      difficulty: { code: P.code, name: P.name },
      visual: (
        <NumberLine
          min={100}
          max={200}
          majorStep={20}
          minorStep={10}
          color={color}
          markers={[{ value: 130 }]}
          ariaLabel="Oś liczbowa od 100 do 200 z zaznaczonym punktem"
        />
      ),
    },
    {
      id: 'odczyt-tysiace',
      prompt: 'Działka na tej osi to 100. Ile wynosi zaznaczona liczba?',
      type: 'input',
      answer: '400',
      explanation: 'Punkt stoi 4 działki za zerem: 4 × 100 = 400.',
      difficulty: { code: P.code, name: P.name },
      visual: (
        <NumberLine
          min={0}
          max={1000}
          majorStep={100}
          color={color}
          markers={[{ value: 400 }]}
          ariaLabel="Oś liczbowa od 0 do 1000 z zaznaczonym punktem"
        />
      ),
    },
    {
      id: 'polowa-odstepu',
      prompt: 'Zaznaczony punkt leży dokładnie w połowie między dwiema sąsiednimi kreskami. Jaka to liczba?',
      type: 'input',
      answer: '5450',
      explanation: 'Sąsiednie kreski to 5400 i 5500. Połowa odstępu między nimi to 5400 + 50 = 5450.',
      difficulty: { code: R.code, name: R.name },
      visual: (
        <NumberLine
          min={5000}
          max={6000}
          majorStep={200}
          minorStep={100}
          color={color}
          markers={[{ value: 5450 }]}
          ariaLabel="Oś liczbowa od 5000 do 6000 z zaznaczonym punktem między kreskami"
        />
      ),
    },
    {
      id: 'duze-i-male',
      prompt: 'Duże kreski na tej osi są co 20, a małe co 5. Ile wynosi zaznaczona liczba?',
      type: 'input',
      answer: '55',
      explanation: 'Punkt jest 2 duże kreski (2 × 20 = 40) i 3 małe kreski (3 × 5 = 15) od zera: 40 + 15 = 55.',
      difficulty: { code: D.code, name: D.name },
      visual: (
        <NumberLine
          min={0}
          max={100}
          majorStep={20}
          minorStep={5}
          color={color}
          markers={[{ value: 55 }]}
          ariaLabel="Oś liczbowa od 0 do 100 z zaznaczonym punktem"
        />
      ),
    },
  ];
}

const RESULT_COPY = {
  perfect: {
    title: 'Komplet! Oś liczbową masz opanowaną.',
    message: 'Duże i małe kreski, każda skala — czytasz to bezbłędnie.',
  },
  good: {
    title: 'Dobra robota!',
    message: 'Większość zadań trafiona. Wróć do trudniejszych, jeśli chcesz się upewnić.',
  },
  poor: {
    title: 'To jeszcze wymaga treningu',
    message: 'Wróć do kroku „Nowe pojęcie” — samo klikanie na osi bardzo pomaga to zrozumieć.',
  },
};

interface LineDrillProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: 6 zadań rosnącej trudności (K→P→R→D) czytania i szacowania punktów na osi. */
export function LineDrill({ color, onComplete }: LineDrillProps) {
  return (
    <DiagnosticQuiz
      tasks={buildTasks(color)}
      color={color}
      onFinish={() => onComplete?.()}
      resultCopy={RESULT_COPY}
    />
  );
}
