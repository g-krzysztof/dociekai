'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarModel } from '../../bar-model';
import { FractionBarGlyph } from '../../fraction-bar-glyph';
import type { BarModelSpec } from '../../../lib/word-problem-model';

type StoryVisual =
  | { kind: 'groups'; spec: BarModelSpec }
  | { kind: 'bars'; mianownik: number; rows: { licznik: number; caption: string }[] };

interface StoryExample {
  id: string;
  title: string;
  story: string;
  question: string;
  visual: StoryVisual;
  steps: string[];
  equation: string;
  answer: string;
}

const EXAMPLES: StoryExample[] = [
  {
    id: 'ulamek-z-liczby',
    title: 'Ułamek liczby przedmiotów',
    story: 'W klasie jest 20 uczniów. 3/5 z nich zapisało się na wycieczkę.',
    question: 'Ilu uczniów jedzie na wycieczkę?',
    visual: {
      kind: 'groups',
      spec: { type: 'equal-groups', groupLabel: 'grupa', unitLabel: 'uczniów', groups: 5, perGroup: null, total: 20 },
    },
    steps: [
      'Mianownik 5 mówi, na ile równych grup trzeba podzielić całą klasę: 20 : 5 = 4 uczniów w jednej grupie.',
      'Licznik 3 mówi, ile takich grup nas interesuje: 3 · 4 = 12.',
      'Czyli 3/5 z 20 to 12 uczniów. Najpierw dzielimy przez mianownik, potem mnożymy przez licznik.',
    ],
    equation: '20 : 5 = 4,   3 · 4 = 12',
    answer: 'Na wycieczkę jedzie 12 uczniów.',
  },
  {
    id: 'odejmowanie-w-zadaniu',
    title: 'Ile zostało z całości',
    story: 'Tort pokrojono na 8 równych kawałków. Na przyjęciu zjedzono 5/8 tortu.',
    question: 'Jaka część tortu została?',
    visual: {
      kind: 'bars',
      mianownik: 8,
      rows: [
        { licznik: 8, caption: 'Cały tort: 8/8' },
        { licznik: 5, caption: 'Zjedzone: 5/8' },
      ],
    },
    steps: [
      'Cały tort to 8/8 — tyle kawałków, ile jest w komplecie.',
      'Od całości odejmujemy zjedzoną część: 8/8 − 5/8.',
      'Mianowniki są jednakowe, więc odejmujemy same liczniki: 8 − 5 = 3.',
    ],
    equation: '8/8 − 5/8 = 3/8',
    answer: 'Został 3/8 tortu.',
  },
  {
    id: 'mnozenie-w-zadaniu',
    title: 'Ta sama porcja kilka razy',
    story: 'Na jedną porcję naleśników idą 3/4 szklanki mleka. Mama robi naleśniki na 4 porcje.',
    question: 'Ile szklanek mleka potrzeba?',
    visual: {
      kind: 'bars',
      mianownik: 4,
      rows: [
        { licznik: 3, caption: 'Porcja 1' },
        { licznik: 3, caption: 'Porcja 2' },
        { licznik: 3, caption: 'Porcja 3' },
        { licznik: 3, caption: 'Porcja 4' },
      ],
    },
    steps: [
      'Ta sama porcja powtarza się 4 razy, więc to mnożenie: 4 · 3/4.',
      'Mnożymy sam licznik: 4 · 3 = 12. Mianownik zostaje 4.',
      'Wychodzi 12/4 szklanki, a cztery ćwiartki to jedna szklanka — 12 : 4 = 3.',
    ],
    equation: '4 · 3/4 = 12/4 = 3',
    answer: 'Potrzeba dokładnie 3 szklanek mleka.',
  },
];

function fill(count: number): Set<number> {
  return new Set(Array.from({ length: count }, (_, i) => i));
}

interface StoryWorkedExamplesProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Przykłady: trzy zadania tekstowe pokrywające trzy różne działania na
 * ułamkach — ułamek liczby przedmiotów (dzielenie i mnożenie), odejmowanie
 * części od całości i powtórzenie tej samej porcji. Każde ma rysunek
 * postawiony nad przyciskiem, żeby dało się spróbować przed odsłonięciem.
 */
export function StoryWorkedExamples({ color, onComplete }: StoryWorkedExamplesProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setRevealed(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {EXAMPLES.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{EXAMPLES.length}
        </span>
      </div>

      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        {example.title}
      </p>
      <p className="mb-1 text-sm leading-relaxed sm:text-base">{example.story}</p>
      <p className="mb-4 text-sm font-semibold leading-relaxed sm:text-base">{example.question}</p>

      <div className="mb-4 border p-4" style={{ borderColor: `${color}33` }}>
        {example.visual.kind === 'groups' ? (
          <BarModel spec={example.visual.spec} color={color} />
        ) : (
          <div className="mx-auto max-w-xs space-y-3">
            {example.visual.rows.map((row, i) => (
              <div key={i}>
                <p className="mb-0.5 text-xs font-semibold" style={{ color: textColor }}>
                  {row.caption}
                </p>
                <FractionBarGlyph
                  color={color}
                  mianownik={example.visual.kind === 'bars' ? example.visual.mianownik : 1}
                  filled={fill(row.licznik)}
                  ariaLabel={`${row.caption}: ${row.licznik} części`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {!revealed ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Zap className="h-4 w-4" aria-hidden />
            Pokaż rozwiązanie
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 p-4 dark:bg-emerald-950/40 sm:p-5">
          <ol className="mb-4 space-y-3">
            {example.steps.map((step, i) => (
              <li key={step} className="flex items-start gap-3 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
                <span className="w-5 shrink-0 font-mono text-base font-bold leading-none tabular-nums text-emerald-700 dark:text-emerald-300">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-center font-mono text-base font-bold text-emerald-800 dark:text-emerald-200">{example.equation}</p>
          <p className="mt-2 text-center text-sm font-semibold text-emerald-900 dark:text-emerald-100">{example.answer}</p>
        </motion.div>
      )}

      {revealed && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
            {isLast ? 'Do ćwiczeń' : 'Kolejne zadanie'}
          </Button>
        </div>
      )}
    </div>
  );
}
