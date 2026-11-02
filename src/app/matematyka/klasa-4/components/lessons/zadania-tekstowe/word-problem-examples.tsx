'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { BarModel } from '../../bar-model';
import type { BarModelSpec } from '../../../lib/word-problem-model';

interface Example {
  id: string;
  sentence: string;
  model: BarModelSpec;
  equation: string;
  answer: number;
  answerLabel: string;
  explain: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'autokary',
    sentence:
      'Na wycieczkę pojechało 6 autokarów. W każdym było po 42 uczniów. Ilu uczniów pojechało na wycieczkę?',
    model: {
      type: 'equal-groups',
      groupLabel: 'autokar',
      unitLabel: 'uczniów razem',
      groups: 6,
      perGroup: 42,
      total: null,
    },
    equation: '6 × 42 = ?',
    answer: 252,
    answerLabel: 'uczniów',
    explain:
      'To „równe grupy”: 6 takich samych autokarów po 42 osoby. Kiedy wszystkie grupy są tej samej wielkości, liczysz je mnożeniem, a nie dodawaniem po kolei.',
  },
  {
    id: 'miseczki',
    sentence:
      '216 cukierków rozdzielono po równo do 8 miseczek. Ile cukierków znalazło się w jednej miseczce?',
    model: {
      type: 'equal-groups',
      groupLabel: 'miseczka',
      unitLabel: 'cukierków razem',
      groups: 8,
      perGroup: null,
      total: 216,
    },
    equation: '216 : 8 = ?',
    answer: 27,
    answerLabel: 'cukierków w miseczce',
    explain:
      'Tym razem znasz sumę i liczbę grup, a szukasz wielkości jednej grupy — to dzielenie. Schemat wygląda podobnie jak wyżej, tylko niewiadoma siedzi w innym miejscu.',
  },
  {
    id: 'kartoniki',
    sentence:
      'Sklep ma 96 jajek. Pakuje je po 6 sztuk w jednym kartoniku. Ile kartoników potrzeba?',
    model: {
      type: 'equal-groups',
      groupLabel: 'kartonik',
      unitLabel: 'jajek razem',
      groups: null,
      perGroup: 6,
      total: 96,
    },
    equation: '96 : 6 = ?',
    answer: 16,
    answerLabel: 'kartoników',
    explain:
      'A tu znasz sumę i wielkość jednej grupy, a szukasz liczby grup — to też dzielenie, tylko pytanie brzmi inaczej: nie „ile w jednej?”, tylko „ile grup?”.',
  },
];

interface WordProblemExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: trzy zadania na równe grupy — mnożenie i dwa warianty dzielenia (szukana wielkość grupy / szukana liczba grup). */
export function WordProblemExamples({ color, onComplete }: WordProblemExamplesProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${revealed}`);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setRevealed(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {EXAMPLES.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{EXAMPLES.length}
        </span>
      </div>

      <p className="mb-4 text-sm leading-relaxed sm:text-base">{example.sentence}</p>

      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <BarModel spec={example.model} color={color} />
          <p className="text-center font-mono text-lg font-bold tabular-nums" style={{ color }}>
            {example.equation} = {example.answer} {example.answerLabel}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {example.explain}
          </p>
        </motion.div>
      )}

      <div className="mt-4 flex justify-end">
        {!revealed ? (
          <Button onClick={() => setRevealed(true)} className="gap-1.5">
            <Eye className="h-4 w-4" />
            Pokaż schemat
          </Button>
        ) : (
          <Button onClick={next} className="gap-1.5">
            {isLast ? 'Zakończ' : 'Następny przykład'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
