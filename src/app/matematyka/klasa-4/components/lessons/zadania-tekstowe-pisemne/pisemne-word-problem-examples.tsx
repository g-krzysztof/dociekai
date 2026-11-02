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
    id: 'zabawki',
    sentence:
      'Fabryka zabawek wyprodukowała w poniedziałek 1875 misiów, a we wtorek 2340 misiów. Ile misiów wyprodukowała łącznie przez te dwa dni?',
    model: {
      type: 'part-whole',
      wholeLabel: 'razem',
      wholeValue: null,
      parts: [
        { label: 'poniedziałek', value: 1875 },
        { label: 'wtorek', value: 2340 },
      ],
    },
    equation: '1875 + 2340 = ?',
    answer: 4215,
    answerLabel: 'misiów',
    explain:
      'Dwie znane części łączysz w całość — dodawanie pisemne dokładnie takie, jak w lekcji o dodawaniu, tylko liczby pochodzą z historyjki, a nie z gotowego działania.',
  },
  {
    id: 'stadion',
    sentence: 'Stadion mieści 8500 kibiców. Na mecz przyszło 6860 osób. Ile wolnych miejsc zostało?',
    model: {
      type: 'part-whole',
      wholeLabel: 'miejsca na stadionie',
      wholeValue: 8500,
      parts: [
        { label: 'zajęte', value: 6860 },
        { label: 'wolne', value: null },
      ],
    },
    equation: '8500 − 6860 = ?',
    answer: 1640,
    answerLabel: 'miejsc',
    explain:
      'Znasz całość i jedną część — brakującą część liczysz odejmowaniem pisemnym, tu akurat z pożyczaniem od zera w liczbie 8500.',
  },
  {
    id: 'podreczniki',
    sentence:
      'Wydawnictwo spakowało 24 paczki podręczników. W każdej paczce było 135 książek. Ile książek spakowano w sumie?',
    model: {
      type: 'equal-groups',
      groupLabel: 'paczka',
      unitLabel: 'książek razem',
      groups: 24,
      perGroup: 135,
      total: null,
    },
    equation: '24 × 135 = ?',
    answer: 3240,
    answerLabel: 'książek',
    explain:
      'Równe grupy przy dwucyfrowym mnożniku — to mnożenie pisemne przez liczbę wielocyfrową, z iloczynami cząstkowymi, których nauczyłeś/aś się dwie lekcje temu.',
  },
  {
    id: 'oboz',
    sentence:
      'Organizator obozu podzielił 1728 zł kosztów po równo między 12 uczestników. Ile zapłacił każdy uczestnik?',
    model: {
      type: 'equal-groups',
      groupLabel: 'uczestnik',
      unitLabel: 'zł razem',
      groups: 12,
      perGroup: null,
      total: 1728,
    },
    equation: '1728 : 12 = ?',
    answer: 144,
    answerLabel: 'zł',
    explain:
      'Znasz sumę i liczbę grup, a szukasz wielkości jednej grupy — to dzielenie, tu z dwucyfrowym dzielnikiem większym niż w podstawowym wprowadzeniu z poprzedniej lekcji.',
  },
];

interface PisemneWordProblemExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: cztery zadania, po jednym na każde z czterech działań pisemnych, wszystkie z liczbami wielocyfrowymi. */
export function PisemneWordProblemExamples({ color, onComplete }: PisemneWordProblemExamplesProps) {
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
