'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NumberLine } from '../../number-line';

interface WorkedExample {
  id: string;
  title: string;
  question: string;
  mianownik: number;
  licznik: number;
  note: string;
}

const EXAMPLES: WorkedExample[] = [
  {
    id: 'szlak',
    title: 'Odcinek jako trasa',
    question:
      'Cały szlak turystyczny podzielono na 8 równych odcinków. Turysta pokonał już 3 z nich. W którym miejscu osi jest teraz?',
    mianownik: 8,
    licznik: 3,
    note: 'Cały szlak to odcinek od 0 do 1. Podzielony na 8 równych kawałków, punkt turysty stoi po trzecim z nich.',
  },
  {
    id: 'wstazka-pomiar',
    title: 'Ta sama zasada, inna miara',
    question: 'Wstążkę o długości jednej jednostki podzielono na 5 równych odcinków. Zaznaczono punkt po 4 odcinkach. Jaki to ułamek?',
    mianownik: 5,
    licznik: 4,
    note: 'Nieważne, czy mierzymy szlak czy wstążkę — liczy się tylko, ile równych odcinków minęliśmy od zera.',
  },
];

interface FractionLineWorkedExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: dwa gotowe rozwiązania, punkt na osi budowany na żywo z pary (licznik, mianownik) zamiast wzoru liczbowego — tu „obliczeniem" jest samo odczytanie rysunku. */
export function FractionLineWorkedExamples({ color, onComplete }: FractionLineWorkedExamplesProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

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
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {EXAMPLES.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{EXAMPLES.length}
        </span>
      </div>

      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}>
        {example.title}
      </p>
      <p className="mb-4 text-sm leading-relaxed sm:text-base">{example.question}</p>

      {!revealed ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setRevealed(true)} className="gap-2">
            <Zap className="h-4 w-4" aria-hidden />
            Pokaż rozwiązanie
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 p-4 dark:bg-emerald-950/40">
          <div className="mx-auto mb-3 max-w-sm">
            <NumberLine
              min={0}
              max={1}
              majorStep={1}
              minorStep={1 / example.mianownik}
              color="#10b981"
              markers={[
                {
                  value: example.licznik / example.mianownik,
                  color: '#10b981',
                  label: `${example.licznik}/${example.mianownik}`,
                },
              ]}
              ariaLabel={`Odcinek od 0 do 1 podzielony na ${example.mianownik} części, punkt zaznaczony po ${example.licznik} podziałkach`}
            />
          </div>
          <p className="mt-2 text-center text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">{example.note}</p>
        </motion.div>
      )}

      {revealed && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
            {isLast ? 'Do ćwiczeń' : 'Kolejny przykład'}
          </Button>
        </div>
      )}
    </div>
  );
}
