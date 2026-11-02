'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Fence, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  factorRectangles,
  isSquare,
  rectanglePerimeter,
  shortestPerimeter,
} from '../../../lib/rectangle-area';

interface Round {
  id: string;
  area: number;
  story: string;
  question: string;
  /** Co kosztuje obwód — żeby „najkrótszy płot” miał powód. */
  costLabel: string;
  costPerMeter: number;
}

const ROUNDS: Round[] = [
  {
    id: 'grzadka',
    area: 24,
    story:
      'Dziadek wydzielił w ogrodzie prostokątną grządkę o polu 24 m² i chce ją całą obsiać oraz ogrodzić niską siatką.',
    question: 'Ustaw taki kształt grządki, żeby siatki poszło jak najmniej.',
    costLabel: 'siatka',
    costPerMeter: 9,
  },
  {
    id: 'wybieg',
    area: 36,
    story:
      'Ten sam problem, inne pole: wybieg dla królików ma mieć 36 m², a każdy metr płotka kosztuje 14 zł.',
    question: 'Znajdź kształt, przy którym płotek będzie najtańszy.',
    costLabel: 'płotek',
    costPerMeter: 14,
  },
];

const MAX_SIDE = 12;
const UNIT = 22;
/** Lewy margines musi pomieścić dwucyfrowy podpis boku („12 m”), górny — jednowierszowy. */
const PAD_L = 46;
const PAD_T = 22;
const PAD = 16;
const VIEW_W = PAD_L + MAX_SIDE * UNIT + PAD;
const VIEW_H = PAD_T + MAX_SIDE * UNIT + PAD;

/**
 * Zadanie problemowe lekcji o wzorze — **flagowa interakcja tej lekcji**.
 *
 * Dziecko przeciąga róg prostokąta, ale przeciąga tylko JEDEN wymiar: drugi
 * dolicza się sam tak, żeby pole zostało niezmienione. Prostokąt przyskakuje
 * wyłącznie do par dzielników pola, więc kratki nigdy się nie „rozjeżdżają”, a
 * licznik pola stoi w miejscu przez całe przeciąganie. Zmienia się natomiast
 * obwód — i to on rozstrzyga zadanie.
 *
 * To pierwszy widżet w kursie, w którym gest zmienia jedną wielkość, a druga
 * jest *wyliczana tak, aby zachować niezmiennik* — wcześniejsze przeciągania
 * (`ArrayGrid`, `RectangleBuilder`, `AngleBuilder`) zmieniały to, co dziecko
 * chwytało, i nic poza tym.
 */
export function AreaFactorGarden({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [index, setIndex] = useState(0);
  const [pick, setPick] = useState(0);
  const [tried, setTried] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<'idle' | 'wrong' | 'right'>('idle');
  const [shake, setShake] = useState(0);
  const [dragging, setDragging] = useState(false);

  const allDone = index >= ROUNDS.length;
  const round = ROUNDS[Math.min(index, ROUNDS.length - 1)];
  const options = factorRectangles(round.area, MAX_SIDE);
  const current = options[Math.min(pick, options.length - 1)];
  const best = shortestPerimeter(options);
  const perimeter = rectanglePerimeter(current);
  const isLast = index === ROUNDS.length - 1;

  const choose = (next: number) => {
    const clamped = Math.min(Math.max(next, 0), options.length - 1);
    if (clamped === pick) return;
    setPick(clamped);
    setVerdict('idle');
    if (!tried.includes(clamped)) setTried([...tried, clamped]);
  };

  const pointerToPick = (event: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) * VIEW_W) / rect.width - PAD_L;
    const cells = x / UNIT;
    // Najbliższy dostępny prostokąt, a nie najbliższa kratka — kształt nie może
    // stanąć na szerokości, która nie dzieli pola.
    let nearest = 0;
    for (let i = 1; i < options.length; i += 1) {
      if (Math.abs(options[i].width - cells) < Math.abs(options[nearest].width - cells)) nearest = i;
    }
    choose(nearest);
  };

  const check = () => {
    if (perimeter === rectanglePerimeter(best)) {
      setVerdict('right');
      return;
    }
    setVerdict('wrong');
    setShake((value) => value + 1);
  };

  const next = () => {
    setPick(0);
    setTried([]);
    setVerdict('idle');
    if (isLast) {
      setIndex(ROUNDS.length);
      onComplete?.();
      return;
    }
    setIndex(index + 1);
  };

  if (allDone) {
    return (
      <div className="border-l-2 bg-white p-5 dark:bg-zinc-900/80 sm:p-6" style={{ borderColor: color }}>
        <p className="flex items-center gap-2 text-base font-bold" style={{ color }}>
          <Check className="h-5 w-5" aria-hidden /> Znalezione: to samo pole, różne płoty
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Prostokąty o tym samym polu mogą mieć bardzo różne obwody, a najkrótszy płot ma zawsze ten
          kształt, który jest najbliższy kwadratowi. Przy 36 m² wyszedł dokładnie kwadrat 6 · 6, bo
          36 ma równe boki; przy 24 m² kwadrat nie wychodzi na całych metrach, więc najlepszy jest
          prostokąt 4 · 6 — najbliższy kwadratowi z możliwych.
        </p>
      </div>
    );
  }

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            Zadanie {index + 1} z {ROUNDS.length}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{round.story}</p>
          <p className="mt-1 text-sm font-medium">{round.question}</p>
        </div>
        <div className="flex gap-1.5 pt-1">
          {ROUNDS.map((item, i) => (
            <span
              key={item.id}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: i <= index ? color : `${color}33` }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <motion.div key={shake} animate={shake ? { x: [0, -8, 8, -5, 0] } : undefined}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="mx-auto w-full max-w-[340px] touch-none select-none"
            role="slider"
            tabIndex={0}
            aria-label="Szerokość grządki"
            aria-valuemin={options[0].width}
            aria-valuemax={options[options.length - 1].width}
            aria-valuenow={current.width}
            aria-valuetext={`${current.width} na ${current.height} metra`}
            onPointerDown={(event) => {
              svgRef.current?.setPointerCapture(event.pointerId);
              setDragging(true);
              pointerToPick(event);
            }}
            onPointerMove={(event) => {
              if (dragging) pointerToPick(event);
            }}
            onPointerUp={() => setDragging(false)}
            onPointerLeave={() => setDragging(false)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
                event.preventDefault();
                choose(pick + 1);
              }
              if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
                event.preventDefault();
                choose(pick - 1);
              }
            }}
          >
            {/* Warstwa łapiąca wskaźnik również między kratkami. */}
            <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#fff" fillOpacity={0.001} />

            <g stroke={`${color}22`} strokeWidth={1}>
              {Array.from({ length: MAX_SIDE + 1 }, (_, i) => (
                <line
                  key={`v${i}`}
                  x1={PAD_L + i * UNIT}
                  y1={PAD_T}
                  x2={PAD_L + i * UNIT}
                  y2={PAD_T + MAX_SIDE * UNIT}
                />
              ))}
              {Array.from({ length: MAX_SIDE + 1 }, (_, i) => (
                <line
                  key={`h${i}`}
                  x1={PAD_L}
                  y1={PAD_T + i * UNIT}
                  x2={PAD_L + MAX_SIDE * UNIT}
                  y2={PAD_T + i * UNIT}
                />
              ))}
            </g>

            <motion.rect
              animate={{
                width: current.width * UNIT,
                height: current.height * UNIT,
              }}
              initial={false}
              transition={{ type: 'tween', duration: 0.18 }}
              x={PAD_L}
              y={PAD_T}
              width={current.width * UNIT}
              height={current.height * UNIT}
              fill={color}
              fillOpacity={0.26}
              stroke={color}
              strokeWidth={3}
            />

            {/* Uchwyt rogu — cel przeciągania. */}
            <motion.g
              animate={{
                x: PAD_L + current.width * UNIT,
                y: PAD_T + current.height * UNIT,
              }}
              initial={false}
              transition={{ type: 'tween', duration: 0.18 }}
            >
              <circle r={11} fill={color} fillOpacity={0.18} />
              <circle r={6} fill={color} stroke="#fff" strokeWidth={2} className="cursor-ew-resize" />
            </motion.g>

            <text
              x={PAD_L + (current.width * UNIT) / 2}
              y={PAD_T - 6}
              textAnchor="middle"
              fontSize={13}
              fontWeight={700}
              fill={color}
            >
              {current.width} m
            </text>
            <text
              x={PAD_L - 8}
              y={PAD_T + (current.height * UNIT) / 2 + 4}
              textAnchor="end"
              fontSize={13}
              fontWeight={700}
              fill={color}
            >
              {current.height} m
            </text>
          </svg>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Przeciągnij kropkę w rogu (albo użyj strzałek) — drugi bok dopasuje się sam.
          </p>
        </motion.div>

        <div>
          <div className="border p-4" style={{ backgroundColor: `${color}0d` }}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pole grządki</p>
            <p className="font-mono text-2xl font-bold tabular-nums" style={{ color }}>
              {current.width} · {current.height} = {round.area} m²
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              To się nie zmienia, choćbyś przeciągał do końca planszy.
            </p>
            <div className="mt-3 border-t pt-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Obwód — czyli {round.costLabel}
              </p>
              <p className="font-mono text-2xl font-bold tabular-nums">
                {perimeter} m
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {perimeter * round.costPerMeter} zł
                </span>
              </p>
            </div>
          </div>

          {tried.length > 1 && (
            <div className="mt-3 border">
              <p className="border-b px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sprawdzone kształty
              </p>
              <ul className="divide-y text-sm">
                {[...tried]
                  .sort((a, b) => options[a].width - options[b].width)
                  .map((i) => {
                    const item = options[i];
                    const p = rectanglePerimeter(item);
                    const isBest = p === rectanglePerimeter(best);
                    return (
                      <li
                        key={item.width}
                        className="flex items-center justify-between px-3 py-1.5 font-mono tabular-nums"
                        style={{ backgroundColor: i === pick ? `${color}14` : undefined }}
                      >
                        <span>
                          {item.width} · {item.height}
                          {isSquare(item) && (
                            <span className="ml-1 font-sans text-xs text-muted-foreground">kwadrat</span>
                          )}
                        </span>
                        <span style={{ color: isBest ? color : undefined }}>
                          {p} m {isBest && '✓'}
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {verdict === 'right' ? (
              <Button size="sm" onClick={next} style={{ backgroundColor: color }}>
                {isLast ? 'Zakończ zadanie' : 'Następne zadanie'}
              </Button>
            ) : (
              <Button size="sm" onClick={check} style={{ backgroundColor: color }}>
                <Fence className="mr-1 h-4 w-4" aria-hidden /> To mój wybór
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => choose(0)}>
              <RotateCcw className="mr-1 h-4 w-4" aria-hidden /> Od nowa
            </Button>
          </div>

          {verdict === 'wrong' && (
            <p className="mt-3 border-l-2 border-amber-500 bg-amber-50 px-3 py-2 text-sm leading-relaxed dark:bg-amber-950/30">
              Pole się zgadza, ale da się krócej. Poprzeciągaj róg jeszcze kilka razy i patrz na
              obwód — im bardziej prostokąt przypomina kwadrat, tym mniej płotu potrzeba.
            </p>
          )}
          {verdict === 'right' && (
            <p className="mt-3 border-l-2 px-3 py-2 text-sm leading-relaxed" style={{ borderColor: color, backgroundColor: `${color}0f` }}>
              Dokładnie tak: {best.width} · {best.height} to {round.area} m² przy obwodzie{' '}
              {rectanglePerimeter(best)} m — najmniej ze wszystkich możliwych kształtów.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
