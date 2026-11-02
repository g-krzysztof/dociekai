'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { RectSketch } from './rect-sketch';
import {
  missingSide,
  rectangleArea,
  type RectangleSpec,
} from '../../../lib/rectangle-area';

interface Example {
  id: string;
  spec: RectangleSpec;
  unitLabel: string;
  /** Który bok jest niewiadomą — `undefined` znaczy „szukamy pola”. */
  unknown?: 'height';
  story: string;
  steps: string[];
  answer: string;
  moral: string;
}

const DYWAN: RectangleSpec = { width: 5, height: 3 };
const TARAS: RectangleSpec = { width: 4, height: 4 };
const GRZADKA: RectangleSpec = { width: 4, height: 7 };

const EXAMPLES: Example[] = [
  {
    id: 'dywan',
    spec: DYWAN,
    unitLabel: 'm',
    story: 'Dywan w pokoju ma boki 5 m i 3 m. Jakie ma pole?',
    steps: [
      'Odczytujemy oba boki: a = 5 m, b = 3 m. Uwaga — obie liczby są w tej samej jednostce, więc nic nie trzeba zamieniać.',
      'Podstawiamy do wzoru: P = a · b, czyli P = 5 · 3.',
      `Liczymy: 5 · 3 = ${rectangleArea(DYWAN)}. Metr razy metr daje metr kwadratowy, więc wynik to ${rectangleArea(DYWAN)} m².`,
    ],
    answer: `P = 5 · 3 = ${rectangleArea(DYWAN)} m²`,
    moral: 'Nie policzyliśmy ani jednej kratki — wystarczyły dwie liczby z rysunku.',
  },
  {
    id: 'taras',
    spec: TARAS,
    unitLabel: 'm',
    story: 'Kwadratowy taras ma bok 4 m. Ile płytek o boku 1 m trzeba na jego wyłożenie?',
    steps: [
      'Kwadrat ma wszystkie boki równe, więc drugiego boku nie trzeba mierzyć — też ma 4 m.',
      'Wzór jest ten sam co dla prostokąta, tylko oba boki to ta sama liczba: P = a · a, czyli P = 4 · 4.',
      `Liczymy: 4 · 4 = ${rectangleArea(TARAS)}. Płytka ma pole 1 m², więc potrzeba ${rectangleArea(TARAS)} płytek.`,
    ],
    answer: `P = 4 · 4 = ${rectangleArea(TARAS)} m²`,
    moral: 'Kwadrat to prostokąt o równych bokach — nie ma dla niego osobnego wzoru do zapamiętania.',
  },
  {
    id: 'grzadka',
    spec: GRZADKA,
    unitLabel: 'm',
    unknown: 'height',
    story: `Grządka ma pole ${rectangleArea(GRZADKA)} m², a jej krótszy bok mierzy 4 m. Jak długi jest drugi bok?`,
    steps: [
      `Tym razem znamy wynik mnożenia (${rectangleArea(GRZADKA)}) i jeden czynnik (4), a szukamy drugiego czynnika.`,
      `Odwracamy mnożenie na dzielenie: b = P : a, czyli b = ${rectangleArea(GRZADKA)} : 4.`,
      `Liczymy: ${rectangleArea(GRZADKA)} : 4 = ${missingSide(rectangleArea(GRZADKA), 4)}. Drugi bok ma ${missingSide(
        rectangleArea(GRZADKA),
        4
      )} m — sprawdzenie: 4 · ${missingSide(rectangleArea(GRZADKA), 4)} = ${rectangleArea(GRZADKA)}.`,
    ],
    answer: `b = ${rectangleArea(GRZADKA)} : 4 = ${missingSide(rectangleArea(GRZADKA), 4)} m`,
    moral: 'Wzór działa w obie strony: z dwóch boków liczysz pole, a z pola i jednego boku — drugi bok.',
  },
];

/**
 * Przykłady: trzy rozwiązania odsłaniane krok po kroku, jedno kliknięcie na
 * krok. Trzeci przykład celowo idzie w drugą stronę (znane pole, szukany bok),
 * bo to najczęstsze miejsce, w którym wzór przestaje działać „z pamięci”.
 */
export function AreaFormulaSteps({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const example = EXAMPLES[Math.min(index, EXAMPLES.length - 1)];
  const containerRef = useSectionScrollAnchor(`${index}-${step}-${finished}`);
  const complete = step === example.steps.length;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const goNext = () => {
    if (index + 1 < EXAMPLES.length) {
      setIndex(index + 1);
      setStep(0);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  return (
    <div ref={containerRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: textColor }}>
        Przykład {index + 1} z {EXAMPLES.length}
      </p>
      <p className="mb-4 text-sm leading-relaxed sm:text-base">{example.story}</p>

      <div className="grid gap-5 md:grid-cols-[200px_1fr]">
        <RectSketch
          spec={example.spec}
          color={color}
          unitLabel={example.unitLabel}
          tiles={index < 2}
          heightLabel={example.unknown === 'height' ? '? m' : undefined}
          caption={
            example.unknown === 'height'
              ? `pole = ${rectangleArea(example.spec)} m²`
              : undefined
          }
        />

        <div>
          <ol className="space-y-2">
            <AnimatePresence initial={false}>
              {example.steps.slice(0, step).map((text, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 border-l-2 py-1 pl-3 text-sm leading-relaxed"
                  style={{ borderColor: `${color}66` }}
                >
                  <span className="font-mono font-bold tabular-nums" style={{ color }}>
                    {i + 1}
                  </span>
                  <span>{text}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>

          {complete && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 border p-3 font-mono text-lg font-bold tabular-nums"
              style={{ color, backgroundColor: `${color}0f` }}
            >
              {example.answer}
            </motion.p>
          )}
          {complete && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{example.moral}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {!complete && (
              <Button size="sm" onClick={() => setStep(step + 1)} style={{ backgroundColor: color }}>
                {step === 0 ? 'Pokaż pierwszy krok' : 'Następny krok'}
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
              </Button>
            )}
            {complete && !finished && (
              <Button size="sm" onClick={goNext} style={{ backgroundColor: color }}>
                {index + 1 < EXAMPLES.length ? 'Następny przykład' : 'Rozumiem wzór'}
              </Button>
            )}
            {finished && (
              <p className="flex items-center gap-2 text-sm font-medium" style={{ color }}>
                <Check className="h-4 w-4" aria-hidden /> Trzy przykłady za Tobą — teraz Twoja kolej.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
