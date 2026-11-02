'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { SolidSketch } from '../../solid-sketch';
import { boxEdgeGroups, boxFacePairs, type BoxSpec } from '../../../lib/solids';

interface Example {
  id: string;
  /** Proporcje do rysunku — realne centymetry bywają za duże na `MAX_SIDE`. */
  sketch: BoxSpec;
  labels: [string | null, string | null, string | null];
  story: string;
  steps: string[];
  answer: string;
  moral: string;
}

/** Karton: prawdziwe wymiary do treści, osobne proporcje do rysunku. */
const KARTON: BoxSpec = { width: 30, height: 15, depth: 20 };
const KARTON_PAIRS = boxFacePairs(KARTON);
const KARTON_GROUPS = boxEdgeGroups(KARTON);

const SZESCIAN: BoxSpec = { width: 4, height: 4, depth: 4 };

const EXAMPLES: Example[] = [
  {
    id: 'karton',
    sketch: { width: 5, height: 2.5, depth: 3.4 },
    labels: ['30 cm', '20 cm', '15 cm'],
    story: 'Karton ma długość 30 cm, szerokość 20 cm i wysokość 15 cm. Wypisz jego ściany i krawędzie.',
    steps: [
      'Zapisujemy trzy wymiary: długość 30 cm, szerokość 20 cm, wysokość 15 cm. Nic więcej nie trzeba mierzyć.',
      `Ściany chodzą parami — przeciwległe są identyczne: ${KARTON_PAIRS.map(
        (pair) => `${pair.label} to prostokąty ${pair.sides[0]} × ${pair.sides[1]} cm`
      ).join(', ')}. Trzy pary, czyli sześć ścian.`,
      `Krawędzie chodzą czwórkami: ${KARTON_GROUPS.map(
        (group) => `cztery po ${group.length} cm`
      ).join(', ')}. Razem dwanaście.`,
    ],
    answer: '3 pary ścian · 3 czwórki krawędzi · 8 wierzchołków',
    moral: 'Z trzech zmierzonych liczb odczytujesz wszystkie ściany i wszystkie krawędzie bryły.',
  },
  {
    id: 'szescian',
    sketch: SZESCIAN,
    labels: ['4 cm', '4 cm', '4 cm'],
    story: 'Sześcian ma krawędź 4 cm. Jakie ma ściany, a jakie krawędzie?',
    steps: [
      'W sześcianie wszystkie trzy wymiary są równe: 4 cm, 4 cm i 4 cm.',
      'Każda para wymiarów to więc 4 × 4 — wszystkie sześć ścian to identyczne kwadraty o boku 4 cm.',
      'Trzy czwórki krawędzi mają tę samą długość, więc zlewają się w jedną grupę: dwanaście krawędzi po 4 cm.',
    ],
    answer: '6 kwadratów 4 × 4 cm · 12 krawędzi po 4 cm',
    moral:
      'Sześcian to prostopadłościan, w którym trzy liczby są takie same — dlatego wystarczy podać jedną.',
  },
  {
    id: 'z-dwoch-scian',
    sketch: { width: 5, height: 2, depth: 3.2 },
    labels: ['8 cm', '5 cm', '3 cm'],
    story:
      'Ktoś zmierzył dwie sąsiednie ściany pudełka: jedna ma 8 cm × 5 cm, druga 5 cm × 3 cm. Jakie są wymiary pudełka?',
    steps: [
      'Ściany sąsiednie stykają się wzdłuż wspólnej krawędzi, więc jeden wymiar muszą mieć taki sam. Tu w obu pomiarach powtarza się 5 cm — to właśnie ta wspólna krawędź.',
      'Pierwsza ściana dokłada 8 cm, druga dokłada 3 cm. To dwa pozostałe wymiary bryły.',
      'Pudełko ma więc 8 cm × 5 cm × 3 cm. Trzecia para ścian, której nikt nie mierzył, to prostokąty 8 × 3 cm.',
    ],
    answer: '8 cm × 5 cm × 3 cm',
    moral:
      'Dwie sąsiednie ściany wystarczą, żeby odtworzyć całą bryłę — trzecia para wynika z nich sama.',
  },
];

/**
 * Przykłady: trzy rozwiązania odsłaniane krok po kroku. Trzeci idzie celowo
 * w odwrotną stronę — z wymiarów ścian trzeba odtworzyć wymiary bryły, bo to
 * właśnie tam „trzy liczby opisują bryłę" przestaje być formułką do powtórzenia.
 */
export function BoxFactSteps({ color, onComplete }: { color: string; onComplete?: () => void }) {
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

      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        <SolidSketch
          spec={example.sketch}
          color={color}
          labels={complete || step > 0 ? example.labels : [null, null, null]}
          ariaLabel={`Prostopadłościan z podpisanymi wymiarami: ${example.labels
            .filter(Boolean)
            .join(', ')}`}
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
                {index + 1 < EXAMPLES.length ? 'Następny przykład' : 'Rozumiem opis bryły'}
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
