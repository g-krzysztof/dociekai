'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkedExample {
  id: string;
  title: string;
  question: string;
  formula: string;
  answer: string;
  note: string;
}

const EXAMPLES: WorkedExample[] = [
  {
    id: 'wanna',
    title: 'Z rysunku na rzeczywistość',
    question: 'Na planie łazienki wanna ma długość 4 cm. Skala planu to 1:20. Jaka jest prawdziwa długość wanny?',
    formula: '4 cm × 20',
    answer: '= 80 cm',
    note: 'Mnożysz długość na rysunku przez drugą liczbę skali.',
  },
  {
    id: 'boisko',
    title: 'Z rzeczywistości na rysunek',
    question: 'Prawdziwa szerokość boiska to 45 m. Skala planu to 1:1500. Ile centymetrów zajmie na rysunku?',
    formula: '4500 cm ÷ 1500',
    answer: '= 3 cm',
    note: '45 m zamieniasz najpierw na 4500 cm — obie strony skali muszą być w tej samej jednostce.',
  },
];

interface ScaleWorkedExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: dwa nowe zastosowania tej samej zależności co w przewodniku, tym razem na planie łazienki i boisku — ten sam rytm „ukryte → pokaż" co `CircleFormulaShowcase`. */
export function ScaleWorkedExamples({ color, onComplete }: ScaleWorkedExamplesProps) {
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
            Pokaż wynik
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 p-4 text-center dark:bg-emerald-950/40">
          <p className="font-mono text-base font-bold tabular-nums text-emerald-900 dark:text-emerald-100 sm:text-lg">
            {example.formula} {example.answer}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">{example.note}</p>
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
