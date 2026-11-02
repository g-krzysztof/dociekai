'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FractionBarGlyph } from '../../fraction-bar-glyph';
import { MiniFraction } from '../../mini-fraction';
import { toMixed } from '../../../lib/mixed-number';

interface Amount {
  whole: number;
  licznik: number;
}

interface WorkedExample {
  id: string;
  title: string;
  question: string;
  mianownik: number;
  left: Amount;
  right: Amount;
  operation: 'plus' | 'minus';
  leftCaption: string;
  rightCaption: string;
  resultCaption: string;
  steps: string[];
  /** Domknięcie przykładu: skrócenie wyniku, odczyt liczby mieszanej — jedno zdanie pod działaniem. */
  closing: string;
}

const EXAMPLES: WorkedExample[] = [
  {
    id: 'dodawanie-proste',
    title: 'Dwie porcje tego samego ciasta',
    question: 'Kuba zjadł 2/7 blachy ciasta, a jego siostra 3/7. Jaką część blachy zjedli razem?',
    mianownik: 7,
    left: { whole: 0, licznik: 2 },
    right: { whole: 0, licznik: 3 },
    operation: 'plus',
    leftCaption: 'Kuba: 2 kawałki',
    rightCaption: 'Siostra: 3 kawałki',
    resultCaption: 'Razem na jednym pasku',
    steps: [
      'Blacha jest przez cały czas pokrojona tak samo — na 7 równych kawałków. Mianownik nie ma powodu się zmieniać.',
      'Zjedzone kawałki po prostu liczymy: 2 + 3 = 5 kawałków po jednej siódmej.',
      'Zapisujemy to jako 2/7 + 3/7 = 5/7 — dodajemy liczniki, mianownik przepisujemy.',
    ],
    closing: '5/7 to ułamek właściwy — zjedli mniej niż całą blachę, więc coś jeszcze zostało.',
  },
  {
    id: 'odejmowanie-i-skracanie',
    title: 'Ile soku zostało w butelce',
    question: 'W butelce było 5/6 soku. Do szklanek nalano 2/6. Ile soku zostało w butelce?',
    mianownik: 6,
    left: { whole: 0, licznik: 5 },
    right: { whole: 0, licznik: 2 },
    operation: 'minus',
    leftCaption: 'Na początku: 5 kawałków',
    rightCaption: 'Nalane do szklanek: 2 kawałki',
    resultCaption: 'Zostało w butelce',
    steps: [
      'Butelka jest podzielona na 6 równych części i tak zostaje — nalewanie soku nie zmienia podziałki.',
      'Odejmujemy same liczniki: 5 − 2 = 3 kawałki po jednej szóstej.',
      '5/6 − 2/6 = 3/6. Mianownik znowu przepisany bez zmian.',
    ],
    closing: '3/6 da się jeszcze skrócić przez 3 — to dokładnie połowa butelki, czyli 1/2. Wynik wolno (i warto) skrócić na końcu.',
  },
  {
    id: 'liczby-mieszane',
    title: 'Kiedy do dodania są całe butelki i jeszcze kawałki',
    question: 'Na wycieczkę zabrano 1 1/4 litra wody w jednym bidonie i 2 2/4 litra w drugim. Ile wody jest razem?',
    mianownik: 4,
    left: { whole: 1, licznik: 1 },
    right: { whole: 2, licznik: 2 },
    operation: 'plus',
    leftCaption: 'Pierwszy bidon: 1 1/4 litra',
    rightCaption: 'Drugi bidon: 2 2/4 litra',
    resultCaption: 'Razem',
    steps: [
      'Liczby mieszane rozkładamy na dwie osobne kupki: całości do całości, kawałki do kawałków.',
      'Całości: 1 + 2 = 3. Kawałki: 1/4 + 2/4 = 3/4 — znów tylko liczniki, bo mianownik jest ten sam.',
      'Składamy z powrotem: 1 1/4 + 2 2/4 = 3 3/4 litra.',
    ],
    closing: 'Kawałków wyszło mniej niż 4, więc nic nie składa się w kolejną całość. Gdyby wyszło 5/4, trzeba by je zamienić na 1 1/4 i dołożyć tę całość do trójki.',
  },
];

function fill(count: number): Set<number> {
  return new Set(Array.from({ length: count }, (_, i) => i));
}

interface AmountRowProps {
  color: string;
  mianownik: number;
  amount: Amount;
  caption: string;
}

/** Jedna wielkość na rysunku: tyle pełnych pasków, ile całości, plus pasek z resztą kawałków. */
function AmountRow({ color, mianownik, amount, caption }: AmountRowProps) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold" style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}>
        {caption}
      </p>
      <div className="mx-auto max-w-xs space-y-3">
        {Array.from({ length: amount.whole }, (_, i) => (
          <FractionBarGlyph
            key={`whole-${i}`}
            color={color}
            mianownik={mianownik}
            filled={fill(mianownik)}
            ariaLabel={`Pełna całość numer ${i + 1}`}
          />
        ))}
        <FractionBarGlyph
          color={color}
          mianownik={mianownik}
          filled={fill(amount.licznik)}
          ariaLabel={`Pasek podzielony na ${mianownik} równych części, zamalowane ${amount.licznik}`}
        />
      </div>
    </div>
  );
}

interface SumWorkedExamplesProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Przykłady: dodawanie, odejmowanie ze skracaniem wyniku i dodawanie liczb
 * mieszanych. Rysunek składników stoi nad przyciskiem „Pokaż rozwiązanie",
 * żeby dało się najpierw spróbować samemu — dopiero panel z rozwiązaniem
 * dokłada pasek wyniku i rozpisane kroki.
 */
export function SumWorkedExamples({ color, onComplete }: SumWorkedExamplesProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const example = EXAMPLES[index];
  const isLast = index === EXAMPLES.length - 1;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const sign = example.operation === 'plus' ? '+' : '−';

  const leftTotal = example.left.whole * example.mianownik + example.left.licznik;
  const rightTotal = example.right.whole * example.mianownik + example.right.licznik;
  const resultTotal = example.operation === 'plus' ? leftTotal + rightTotal : leftTotal - rightTotal;
  const result = toMixed(resultTotal, example.mianownik);

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

      <div className="mb-4 grid gap-4 border p-4 sm:grid-cols-2" style={{ borderColor: `${color}33` }}>
        <AmountRow color={color} mianownik={example.mianownik} amount={example.left} caption={example.leftCaption} />
        <AmountRow color={color} mianownik={example.mianownik} amount={example.right} caption={example.rightCaption} />
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

          <div className="mb-3">
            <AmountRow color="#10b981" mianownik={example.mianownik} amount={{ whole: result.whole, licznik: result.licznik }} caption={example.resultCaption} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-emerald-800 dark:text-emerald-200">
            <MiniFraction licznik={example.left.licznik} mianownik={example.mianownik} whole={example.left.whole} />
            <span className="font-mono text-base font-bold">{sign}</span>
            <MiniFraction licznik={example.right.licznik} mianownik={example.mianownik} whole={example.right.whole} />
            <span className="font-mono text-base font-bold">=</span>
            <MiniFraction licznik={result.licznik} mianownik={example.mianownik} whole={result.whole} />
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
