'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FractionBarGlyph } from '../../fraction-bar-glyph';
import { MiniFraction } from '../../mini-fraction';
import { toMixed, formatMixed } from '../../../lib/mixed-number';

interface WorkedExample {
  id: string;
  title: string;
  question: string;
  mnoznik: number;
  licznik: number;
  mianownik: number;
  portionCaption: string;
  resultCaption: string;
  steps: string[];
  closing: string;
}

const EXAMPLES: WorkedExample[] = [
  {
    id: 'wlasciwy-wynik',
    title: 'Gdy wszystko mieści się w jednej całości',
    question: 'Do jednej szklanki lemoniady wchodzą 2/9 cytryny. Ile cytryny trzeba na 4 szklanki?',
    mnoznik: 4,
    licznik: 2,
    mianownik: 9,
    portionCaption: '4 porcje po 2/9 cytryny',
    resultCaption: 'Razem na jednym rysunku',
    steps: [
      'Cztery razy ta sama porcja to 2/9 + 2/9 + 2/9 + 2/9 — samo dodawanie tego samego składnika.',
      'Krócej zapisujemy to jako 4 · 2/9. Cytryna przez cały czas jest podzielona na 9 części, więc mianownik się nie zmienia.',
      'Mnożymy sam licznik: 4 · 2 = 8, czyli 4 · 2/9 = 8/9 cytryny.',
    ],
    closing: '8/9 to wciąż mniej niż cała cytryna — jedna dziewiąta została w misce.',
  },
  {
    id: 'niewlasciwy-wynik',
    title: 'Gdy wychodzi więcej niż całość',
    question: 'Na jeden bochenek chleba idą 3/4 szklanki mleka. Ile mleka trzeba na 3 bochenki?',
    mnoznik: 3,
    licznik: 3,
    mianownik: 4,
    portionCaption: '3 porcje po 3/4 szklanki',
    resultCaption: 'Razem, poskładane w całości',
    steps: [
      'Trzy porcje po 3/4 szklanki to 3 · 3/4.',
      'Mnożymy licznik przez liczbę porcji: 3 · 3 = 9. Mianownik zostaje 4, bo szklanka dalej jest podzielona na ćwiartki.',
      'Wychodzi 9/4 szklanki — dziewięć ćwiartek.',
    ],
    closing: 'Cztery ćwiartki to jedna szklanka, więc 9/4 czytamy jako 2 1/4 szklanki: dwie pełne szklanki i jeszcze ćwiartka.',
  },
  {
    id: 'rowno-calosc',
    title: 'Gdy z kawałków wychodzi dokładnie całość',
    question: 'Jedna porcja owsianki to 2/10 opakowania płatków. Ile opakowań zejdzie na 5 porcji?',
    mnoznik: 5,
    licznik: 2,
    mianownik: 10,
    portionCaption: '5 porcji po 2/10 opakowania',
    resultCaption: 'Razem',
    steps: [
      'Pięć porcji po 2/10 to 5 · 2/10.',
      'Licznik: 5 · 2 = 10. Mianownik dalej 10.',
      'Wynik to 10/10 opakowania.',
    ],
    closing: '10 kawałków po jednej dziesiątej składa się w komplet, więc 10/10 to dokładnie 1 opakowanie. Wynik mnożenia ułamka bywa zwykłą liczbą naturalną.',
  },
];

function fill(count: number): Set<number> {
  return new Set(Array.from({ length: count }, (_, i) => i));
}

interface MultiplyWorkedExamplesProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Przykłady: trzy mnożenia dobrane tak, żeby pokryć trzy różne kształty
 * wyniku — ułamek właściwy, ułamek niewłaściwy czytany jako liczba mieszana
 * i wynik równy okrągłej całości.
 */
export function MultiplyWorkedExamples({ color, onComplete }: MultiplyWorkedExamplesProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const total = example.mnoznik * example.licznik;
  const result = toMixed(total, example.mianownik);

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
      <p className="mb-4 text-sm leading-relaxed sm:text-base">{example.question}</p>

      <div className="mb-4 border p-4" style={{ borderColor: `${color}33` }}>
        <p className="mb-1 text-xs font-semibold" style={{ color: textColor }}>
          {example.portionCaption}
        </p>
        <div className="mx-auto max-w-xs space-y-3">
          {Array.from({ length: example.mnoznik }, (_, i) => (
            <FractionBarGlyph
              key={i}
              color={color}
              mianownik={example.mianownik}
              filled={fill(example.licznik)}
              ariaLabel={`Porcja ${i + 1}: ${example.licznik} z ${example.mianownik} części`}
            />
          ))}
        </div>
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

          <p className="mb-1 text-xs font-semibold text-emerald-900 dark:text-emerald-100">{example.resultCaption}</p>
          <div className="mx-auto mb-3 max-w-xs space-y-3">
            {Array.from({ length: Math.max(result.whole, 0) }, (_, i) => (
              <FractionBarGlyph
                key={`whole-${i}`}
                color="#10b981"
                mianownik={example.mianownik}
                filled={fill(example.mianownik)}
                ariaLabel={`Pełna całość numer ${i + 1}`}
              />
            ))}
            {result.licznik > 0 && (
              <FractionBarGlyph
                color="#10b981"
                mianownik={example.mianownik}
                filled={fill(result.licznik)}
                ariaLabel={`Reszta: ${result.licznik} z ${example.mianownik} części`}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-emerald-800 dark:text-emerald-200">
            <span className="font-mono text-base font-bold tabular-nums">{example.mnoznik}</span>
            <span className="font-mono text-base font-bold">·</span>
            <MiniFraction licznik={example.licznik} mianownik={example.mianownik} />
            <span className="font-mono text-base font-bold">=</span>
            <MiniFraction licznik={total} mianownik={example.mianownik} />
            <span className="font-mono text-sm">= {formatMixed(result)}</span>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">{example.closing}</p>
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
