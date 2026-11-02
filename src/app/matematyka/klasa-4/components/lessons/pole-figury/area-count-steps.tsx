'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GridFigure } from './grid-figure';
import { type GridCell, type HalfCell } from '../../../lib/area';

function rect(x: number, y: number, w: number, h: number): GridCell[] {
  const cells: GridCell[] = [];
  for (let dy = 0; dy < h; dy += 1) {
    for (let dx = 0; dx < w; dx += 1) cells.push({ x: x + dx, y: y + dy });
  }
  return cells;
}

interface WorkedExample {
  id: string;
  title: string;
  question: string;
  width: number;
  height: number;
  cells: GridCell[];
  halves?: HalfCell[];
  steps: string[];
  answer: string;
}

const EXAMPLES: WorkedExample[] = [
  {
    id: 'prostokat',
    title: 'Prostokąt',
    question: 'Ile kwadratów jednostkowych mieści ta figura?',
    width: 7,
    height: 4,
    cells: rect(1, 1, 5, 2),
    steps: [
      'Zamiast liczyć kratki jedna po drugiej, policz je rzędami — w każdym rzędzie jest ich tyle samo.',
      'Rzędy są dwa, w każdym po 5 kratek: 5 + 5.',
      'Razem 10 kratek. Pole tej figury to 10 kwadratów jednostkowych.',
    ],
    answer: '10 kratek',
  },
  {
    id: 'litera-l',
    title: 'Figura w kształcie L',
    question: 'A ile kratek mieści ta? Rzędy nie są już równe.',
    width: 7,
    height: 5,
    cells: [...rect(1, 1, 2, 3), ...rect(3, 3, 3, 1)],
    steps: [
      'Ta figura nie jest prostokątem, więc „tyle samo w każdym rzędzie” nie zadziała.',
      'Podziel ją myślowo na dwa prostokąty: pionowy słupek 2 na 3 kratki i doklejony pasek 3 na 1 kratkę.',
      'Słupek ma 6 kratek, pasek 3 kratki. Razem 6 + 3 = 9 kratek.',
    ],
    answer: '9 kratek',
  },
  {
    id: 'polowki',
    title: 'Figura z ukośnym bokiem',
    question: 'Tutaj bok jest ukośny i tnie kratki na pół. Jak policzyć pole?',
    width: 7,
    height: 4,
    cells: [...rect(1, 2, 4, 1), ...rect(2, 1, 2, 1)],
    halves: [
      { x: 1, y: 1, cut: 'br' },
      { x: 4, y: 1, cut: 'bl' },
    ],
    steps: [
      'Najpierw policz same całe kratki: cztery na dole i dwie wyżej — razem 6.',
      'Zostały dwie połówki, po jednej z każdej strony. Dwie połówki to jedna cała kratka.',
      'Do 6 całych dokładasz 1 z połówek: 6 + 1 = 7 kratek.',
    ],
    answer: '7 kratek',
  },
];

interface AreaCountStepsProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: trzy rozpisane sposoby liczenia pola — rzędami, przez podział, z połówkami. */
export function AreaCountSteps({ color, onComplete }: AreaCountStepsProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const example = EXAMPLES[index] ?? EXAMPLES[EXAMPLES.length - 1];
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
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
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

      <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        {example.title}
      </p>
      <p className="mb-4 text-sm leading-relaxed sm:text-base">{example.question}</p>

      <GridFigure
        width={example.width}
        height={example.height}
        cells={example.cells}
        halves={example.halves}
        color={color}
        unit={40}
        className="mx-auto h-auto w-full max-w-[440px]"
        title={`${example.title} narysowana na kratownicy`}
      />

      {!revealed ? (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Zap className="h-4 w-4" aria-hidden />
            Pokaż, jak to policzyć
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-50 p-4 dark:bg-emerald-950/40 sm:p-5"
        >
          <ol className="space-y-2">
            {example.steps.map((step, i) => (
              <li
                key={step}
                className="flex items-start gap-3 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100"
              >
                <span className="font-mono text-base font-bold leading-none tabular-nums opacity-70">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p
            className="mt-4 border-t-2 pt-3 text-center font-mono text-xl font-bold tabular-nums"
            style={{ borderColor: color, color }}
          >
            Pole = {example.answer}
          </p>
          <div className="mt-4 flex justify-end">
            <Button onClick={next} style={{ backgroundColor: color }}>
              {isLast ? 'Do ćwiczeń' : 'Następny przykład'}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
