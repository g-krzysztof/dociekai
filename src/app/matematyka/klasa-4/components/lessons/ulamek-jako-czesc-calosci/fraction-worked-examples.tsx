'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FractionBarGlyph } from '../../fraction-bar-glyph';

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
    id: 'chleb',
    title: 'Podzielony kształt',
    question: 'Bochenek chleba pokrojono na 10 równych kromek. Tata zjadł już 3 kromki na śniadanie. Jaki to ułamek bochenka?',
    mianownik: 10,
    licznik: 3,
    note: 'Mianownik (10) to wszystkie kromki. Licznik (3) to te zjedzone.',
  },
  {
    id: 'wstazka',
    title: 'Ta sama zasada, inny kształt',
    question: 'Wstążkę pocięto na 6 równych kawałków do ozdobienia paczek. Do jednej paczki użyto 4 kawałki. Jaki to ułamek całej wstążki?',
    mianownik: 6,
    licznik: 4,
    note: 'Nie musi to być koło ani prostokąt — zasada działa dla każdego kształtu podzielonego na równe części.',
  },
];

interface FractionWorkedExamplesProps {
  color: string;
  onComplete?: () => void;
}

/** Przykłady: dwa gotowe rozwiązania, zapis budowany na żywo z pary (licznik, mianownik) zamiast wzoru liczbowego jak w innych lekcjach — tu „obliczeniem" jest samo odczytanie rysunku. */
export function FractionWorkedExamples({ color, onComplete }: FractionWorkedExamplesProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;
  const filled = new Set(Array.from({ length: example.licznik }, (_, i) => i));

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
          <div className="mx-auto mb-3 max-w-xs">
            <FractionBarGlyph
              color={color}
              mianownik={example.mianownik}
              filled={filled}
              ariaLabel={`Pasek podzielony na ${example.mianownik} części, ${example.licznik} zamalowane`}
            />
          </div>
          <p className="text-center font-mono text-base font-bold tabular-nums text-emerald-900 dark:text-emerald-100 sm:text-lg">
            {example.licznik}/{example.mianownik}
          </p>
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
