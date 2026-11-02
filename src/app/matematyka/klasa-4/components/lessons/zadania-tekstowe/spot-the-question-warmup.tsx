'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProblemUnpacker, type WordProblem } from '../../problem-unpacker';

const PROBLEMS: WordProblem[] = [
  {
    id: 'muszelki',
    phrases: [
      { id: 'muszelki-p1', text: 'Kasia zebrała ' },
      {
        id: 'muszelki-g1',
        text: '14 muszelek',
        tappable: true,
        role: 'given',
        label: 'muszelki Kasi',
      },
      { id: 'muszelki-p2', text: ', a jej brat Tomek zebrał ' },
      {
        id: 'muszelki-g2',
        text: '9 muszelek',
        tappable: true,
        role: 'given',
        label: 'muszelki Tomka',
      },
      { id: 'muszelki-p3', text: '. ' },
      {
        id: 'muszelki-q',
        text: 'Ile muszelek zebrały dzieci razem?',
        tappable: true,
        role: 'question',
      },
    ],
    model: {
      type: 'part-whole',
      wholeLabel: 'razem',
      wholeValue: null,
      parts: [
        { label: 'Kasia', value: 14 },
        { label: 'Tomek', value: 9 },
      ],
    },
    equation: '14 + 9 = ?',
    answer: 23,
    answerLabel: 'muszelek',
  },
  {
    id: 'biblioteka',
    phrases: [
      { id: 'biblioteka-p1', text: 'W bibliotece szkolnej było ' },
      {
        id: 'biblioteka-g1',
        text: '120 książek',
        tappable: true,
        role: 'given',
        label: 'książki na start',
      },
      { id: 'biblioteka-p2', text: '. Nauczycielka kupiła jeszcze ' },
      {
        id: 'biblioteka-g2',
        text: '35 nowych książek',
        tappable: true,
        role: 'given',
        label: 'nowe książki',
      },
      { id: 'biblioteka-p3', text: '. ' },
      {
        id: 'biblioteka-q',
        text: 'Ile książek jest teraz w bibliotece?',
        tappable: true,
        role: 'question',
      },
    ],
    model: {
      type: 'part-whole',
      wholeLabel: 'razem',
      wholeValue: null,
      parts: [
        { label: 'na start', value: 120 },
        { label: 'nowe', value: 35 },
      ],
    },
    equation: '120 + 35 = ?',
    answer: 155,
    answerLabel: 'książek',
  },
];

interface SpotTheQuestionWarmupProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: samo wyławianie danych i pytania (`mode="spot"`, bez schematu
 * i wyniku) — trening pojedynczej umiejętności, zanim Nowe pojęcie doda do
 * niej resztę strategii.
 */
export function SpotTheQuestionWarmup({ color, onComplete }: SpotTheQuestionWarmupProps) {
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);

  const problem = PROBLEMS[index];
  const isLast = index === PROBLEMS.length - 1;

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setSolved(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {PROBLEMS.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{PROBLEMS.length}
        </span>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Zanim zaczniesz liczyć, sprawdź, czy potrafisz znaleźć w zdaniu dwie rzeczy:{' '}
        <strong>dane</strong> (liczby, które już znasz) i <strong>pytanie</strong> (o co pyta
        zadanie). Kliknij je w tekście.
      </p>

      <ProblemUnpacker
        key={problem.id}
        problem={problem}
        color={color}
        mode="spot"
        onComplete={() => setSolved(true)}
      />

      {solved && (
        <div className="mt-5 flex justify-end">
          <Button onClick={next} className="gap-1.5">
            {isLast ? 'Zakończ' : 'Następne zdanie'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
