'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { GridFigure } from '../pole-figury/grid-figure';
import type { GridCell } from '../../../lib/area';
import {
  boundingBox,
  complementParts,
  partArea,
  partCells,
  partKey,
  mergeCells,
  splitRegions,
  type FigureCut,
} from '../../../lib/area-split';

const rect = (x: number, y: number, width: number, height: number): GridCell[] =>
  partCells({ x, y, width, height });

/** Figura z ćwiczeń: litera L o polu 14 kratek w ramce 5 na 4. */
const L_SHAPE: GridCell[] = mergeCells(rect(0, 0, 2, 4), rect(2, 2, 3, 2));
/** Prostokąt 6 na 4 z wyciętym kwadratem 2 na 2 przy górnej krawędzi. */
const BITTEN: GridCell[] = rect(0, 0, 6, 4).filter(
  (cell) => !(cell.x >= 2 && cell.x < 4 && cell.y < 2)
);

interface Example {
  id: string;
  board: { width: number; height: number };
  cells: GridCell[];
  method: 'split' | 'fill';
  cuts: FigureCut[];
  story: string;
  steps: string[];
  answer: string;
  moral: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'l-podzial',
    board: { width: 5, height: 4 },
    cells: L_SHAPE,
    method: 'split',
    cuts: [{ dir: 'v', at: 2 }],
    story: 'Figura w kształcie litery L. Liczymy jej pole metodą podziału.',
    steps: [
      'Szukamy linii kratownicy, która przetnie figurę na same prostokąty. Tutaj wystarczy jedno pionowe cięcie.',
      'Po cięciu zostają dwa prostokąty: wysoki 2 · 4 i niski 3 · 2. Każdy liczymy osobno wzorem na pole prostokąta.',
      'Pola kawałków dodajemy: 8 + 6 = 14 kratek.',
    ],
    answer: 'P = 2 · 4 + 3 · 2 = 8 + 6 = 14',
    moral: 'Ta sama figura da się pociąć również poziomo — wyjdzie inna para prostokątów i dokładnie ten sam wynik.',
  },
  {
    id: 'l-uzupelnianie',
    board: { width: 5, height: 4 },
    cells: L_SHAPE,
    method: 'fill',
    cuts: [],
    story: 'Ta sama figura, druga metoda: uzupełnianie do prostokąta.',
    steps: [
      'Dorysowujemy najmniejszy prostokąt, w którym cała figura się mieści — tutaj 5 na 4.',
      'Liczymy pole tego prostokąta: 5 · 4 = 20 kratek. To o tyle za dużo, ile brakuje w figurze.',
      'Brakuje prostokąta 3 · 2, czyli 6 kratek. Odejmujemy: 20 − 6 = 14 kratek.',
    ],
    answer: 'P = 5 · 4 − 3 · 2 = 20 − 6 = 14',
    moral: 'Ten sam wynik co przed chwilą — obie metody muszą się zgadzać, bo figura się nie zmieniła.',
  },
  {
    id: 'wybor-metody',
    board: { width: 6, height: 4 },
    cells: BITTEN,
    method: 'fill',
    cuts: [],
    story: 'Prostokąt z wyciętym kwadratem przy górnej krawędzi. Którą metodą pójdzie szybciej?',
    steps: [
      'Metodą podziału trzeba by ciąć dwa razy i policzyć trzy prostokąty — da się, ale to trzy działania.',
      'Metodą uzupełniania wystarczy jeden duży prostokąt 6 · 4 = 24 i jeden brak: kwadrat 2 · 2 = 4.',
      'Odejmujemy raz: 24 − 4 = 20 kratek. Jedno odejmowanie zamiast trzech mnożeń i dwóch dodawań.',
    ],
    answer: 'P = 6 · 4 − 2 · 2 = 24 − 4 = 20',
    moral: 'Gdy w figurze brakuje jednego kawałka, uzupełnianie jest zwykle najkrótszą drogą. Gdy figura jest długa i poszarpana — wygodniejszy bywa podział.',
  },
];

const UNIT = 34;

/**
 * Przykłady: te same figury rozpisane krok po kroku, po jednym kliknięciu na
 * krok. Drugi przykład celowo bierze figurę z pierwszego i liczy ją drugą
 * metodą — żeby „ten sam wynik dwiema drogami” był widoczny na tej samej
 * figurze, a nie tylko zapowiedziany w zdaniu.
 */
export function DecompositionSteps({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const example = EXAMPLES[Math.min(index, EXAMPLES.length - 1)];
  const containerRef = useSectionScrollAnchor(`${index}-${step}-${finished}`);
  const complete = step === example.steps.length;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const box = boundingBox(example.cells);
  const regions = splitRegions(example.cells, example.cuts).rectangles;
  const holes = complementParts(example.cells).holes ?? [];
  const showParts = step >= 2;

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
        Przykład {index + 1} z {EXAMPLES.length} · metoda{' '}
        {example.method === 'split' ? 'podziału' : 'uzupełniania'}
      </p>
      <p className="mb-4 text-sm leading-relaxed sm:text-base">{example.story}</p>

      <div className="grid gap-5 md:grid-cols-[240px_1fr]">
        <GridFigure
          width={example.board.width}
          height={example.board.height}
          cells={example.cells}
          color={color}
          unit={UNIT}
          fillOpacity={example.method === 'split' && showParts ? 0 : 0.22}
          className="mx-auto w-full max-w-[240px]"
          title="Figura na kratownicy"
        >
          {step >= 1 && example.method === 'split' &&
            example.cuts.map((cut) => (
              <line
                key={`${cut.dir}${cut.at}`}
                x1={cut.dir === 'v' ? cut.at * UNIT : box.x * UNIT}
                y1={cut.dir === 'h' ? cut.at * UNIT : box.y * UNIT}
                x2={cut.dir === 'v' ? cut.at * UNIT : (box.x + box.width) * UNIT}
                y2={cut.dir === 'h' ? cut.at * UNIT : (box.y + box.height) * UNIT}
                stroke={color}
                strokeWidth={4}
              />
            ))}

          {step >= 1 && example.method === 'fill' && (
            <rect
              x={box.x * UNIT}
              y={box.y * UNIT}
              width={box.width * UNIT}
              height={box.height * UNIT}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeDasharray="7 5"
            />
          )}

          {showParts && example.method === 'split' &&
            regions?.map((part, i) => (
              <g key={partKey(part)}>
                <rect
                  x={part.x * UNIT + 2}
                  y={part.y * UNIT + 2}
                  width={part.width * UNIT - 4}
                  height={part.height * UNIT - 4}
                  fill={color}
                  fillOpacity={i % 2 === 0 ? 0.36 : 0.16}
                />
                <text
                  x={(part.x + part.width / 2) * UNIT}
                  y={(part.y + part.height / 2) * UNIT + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={700}
                  fill={textColor}
                >
                  {part.width} · {part.height}
                </text>
              </g>
            ))}

          {showParts && example.method === 'fill' &&
            holes.map((hole) => (
              <g key={partKey(hole)}>
                <rect
                  x={hole.x * UNIT + 3}
                  y={hole.y * UNIT + 3}
                  width={hole.width * UNIT - 6}
                  height={hole.height * UNIT - 6}
                  fill="#f59e0b"
                  fillOpacity={0.3}
                  stroke="#f59e0b"
                  strokeWidth={2}
                />
                <text
                  x={(hole.x + hole.width / 2) * UNIT}
                  y={(hole.y + hole.height / 2) * UNIT + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={700}
                  fill="#b45309"
                >
                  −{partArea(hole)}
                </text>
              </g>
            ))}
        </GridFigure>

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
            <>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 border p-3 font-mono text-base font-bold tabular-nums sm:text-lg"
                style={{ color, backgroundColor: `${color}0f` }}
              >
                {example.answer}
              </motion.p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{example.moral}</p>
            </>
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
                {index + 1 < EXAMPLES.length ? 'Następny przykład' : 'Rozumiem obie metody'}
              </Button>
            )}
            {finished && (
              <p className="flex items-center gap-2 text-sm font-medium" style={{ color }}>
                <Check className="h-4 w-4" aria-hidden /> Obie metody rozpisane — teraz Twoja kolej.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
