'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Eye, Grid3x3, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GridFigure } from './grid-figure';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { cellKey, type GridCell } from '../../../lib/area';

/** Prostokąt komórek — wszystkie figury budowane są z bloków, nie z ręcznych list. */
function rect(x: number, y: number, w: number, h: number): GridCell[] {
  const cells: GridCell[] = [];
  for (let dy = 0; dy < h; dy += 1) {
    for (let dx = 0; dx < w; dx += 1) cells.push({ x: x + dx, y: y + dy });
  }
  return cells;
}

/** Różnica dwóch zbiorów komórek — do figur z dziurą (ramka = duży prostokąt bez środka). */
function without(cells: GridCell[], removed: GridCell[]): GridCell[] {
  const drop = new Set(removed.map(cellKey));
  return cells.filter((cell) => !drop.has(cellKey(cell)));
}

type Verdict = 'a' | 'b' | 'equal';

interface Duel {
  id: string;
  question: string;
  a: { label: string; cells: GridCell[] };
  b: { label: string; cells: GridCell[] };
  /** Komentarz do złudzenia — dlaczego oko się myli akurat tutaj. */
  reveal: string;
}

const BOARD = 6;

const DUELS: Duel[] = [
  {
    id: 'waski-vs-szeroki',
    question: 'Który dywanik zajmuje więcej miejsca na podłodze?',
    a: { label: 'Wąski i długi', cells: rect(0, 0, 2, 6) },
    b: { label: 'Szeroki i niski', cells: rect(0, 0, 4, 3) },
    reveal:
      'Oba mają po 12 kratek — mimo że jeden jest wysoki i chudy, a drugi niski i szeroki. Kształt się różni, pole nie.',
  },
  {
    id: 'schodki-vs-kwadrat',
    question: 'Która figura ma większe pole?',
    a: {
      label: 'Schodki',
      cells: [...rect(0, 0, 2, 1), ...rect(1, 1, 2, 1), ...rect(2, 2, 2, 1), ...rect(3, 3, 2, 1)],
    },
    b: { label: 'Kwadracik', cells: rect(0, 0, 3, 3) },
    reveal:
      'Schodki rozciągają się przez pół planszy, więc wyglądają na większe — a mają tylko 8 kratek. Kwadracik ma ich 9. To, ile miejsca figura „zajmuje wzrokiem”, nie jest jej polem.',
  },
  {
    id: 'ramka-vs-blok',
    question: 'Która figura ma większe pole?',
    a: { label: 'Ramka', cells: without(rect(0, 0, 5, 5), rect(1, 1, 3, 3)) },
    b: { label: 'Pełny blok', cells: rect(0, 0, 3, 4) },
    reveal:
      'Ramka ma dziurę w środku, więc wygląda na lżejszą — ale liczy się to, co jest zamalowane: 16 kratek przeciwko 12.',
  },
];

const verdictOf = (duel: Duel): Verdict => {
  if (duel.a.cells.length === duel.b.cells.length) return 'equal';
  return duel.a.cells.length > duel.b.cells.length ? 'a' : 'b';
};

interface EyeCheckDuelProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: najpierw wybór „na oko”, dopiero potem kratownica. Dziecko musi
 * zadeklarować odpowiedź, zanim dostanie narzędzie pomiaru — dzięki temu widzi
 * na własnym przykładzie, że wrażenie wielkości i pole to dwie różne rzeczy.
 * Licznik pomyłek oka jest treścią, nie karą (nie blokuje przejścia dalej).
 */
export function EyeCheckDuel({ color, onComplete }: EyeCheckDuelProps) {
  const [index, setIndex] = useState(0);
  const [pick, setPick] = useState<Verdict | null>(null);
  const [fooled, setFooled] = useState(0);
  const [finished, setFinished] = useState(false);

  const duel = DUELS[index] ?? DUELS[DUELS.length - 1];
  const truth = verdictOf(duel);
  const containerRef = useSectionScrollAnchor(`${index}-${pick ?? 'x'}-${finished}`);

  const choose = (value: Verdict) => {
    if (pick) return;
    setPick(value);
    if (value !== truth) setFooled((n) => n + 1);
  };

  const goNext = () => {
    if (index + 1 < DUELS.length) {
      setIndex((i) => i + 1);
      setPick(null);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">
          {fooled === 0
            ? 'Oko dało radę — ale nie zawsze da'
            : `Oko pomyliło się ${fooled} ${fooled === 1 ? 'raz' : 'razy'}`}
        </h3>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
          Wysokość, szerokość, rozmach ani dziura w środku nie mówią, ile miejsca figura naprawdę
          zajmuje. Potrzebna jest wspólna miarka — i taką miarką będzie{' '}
          <strong>kwadrat jednostkowy</strong>, czyli jedna kratka.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {DUELS.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{DUELS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={duel.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-4 flex items-center justify-center gap-2 text-center text-base font-bold sm:text-lg">
            {pick ? (
              <Grid3x3 className="h-5 w-5 shrink-0" style={{ color }} aria-hidden />
            ) : (
              <Eye className="h-5 w-5 shrink-0" style={{ color }} aria-hidden />
            )}
            {duel.question}
          </p>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            {(['a', 'b'] as const).map((side) => {
              const figure = duel[side];
              const isWinner = pick !== null && (truth === side || truth === 'equal');
              return (
                <div
                  key={side}
                  className={cn(
                    'border p-3 transition-colors',
                    pick !== null && isWinner && 'border-2',
                  )}
                  style={{
                    borderColor: pick !== null && isWinner ? color : undefined,
                    backgroundColor: pick !== null && isWinner ? `${color}0f` : undefined,
                  }}
                >
                  <p
                    className="mb-2 text-center text-xs font-semibold uppercase tracking-wide"
                    style={{ color }}
                  >
                    {figure.label}
                  </p>
                  <GridFigure
                    width={BOARD}
                    height={BOARD}
                    cells={figure.cells}
                    color={color}
                    unit={28}
                    outline
                    /* Kratownica pojawia się dopiero po deklaracji — najpierw sama sylwetka. */
                    grid={pick !== null}
                    fillOpacity={0.3}
                    className="mx-auto h-auto w-full max-w-[220px]"
                    title={`${figure.label} — figura ${pick === null ? 'bez kratownicy' : 'na kratownicy'}`}
                  />
                  {pick !== null && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-center font-mono text-2xl font-bold tabular-nums"
                      style={{ color }}
                    >
                      {figure.cells.length}
                    </motion.p>
                  )}
                </div>
              );
            })}
          </div>

          {pick === null ? (
            <div className="grid gap-2 sm:grid-cols-3">
              {(
                [
                  { id: 'a', label: duel.a.label },
                  { id: 'equal', label: 'Mają tyle samo' },
                  { id: 'b', label: duel.b.label },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => choose(option.id)}
                  className="cursor-pointer border px-3 py-3 text-center text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <p
                className="p-3 text-center text-sm font-semibold"
                style={{
                  backgroundColor: pick === truth ? `${color}14` : undefined,
                  color: pick === truth ? color : undefined,
                }}
              >
                {pick === truth
                  ? 'Oko trafiło — a kratki to potwierdzają.'
                  : 'Oko się pomyliło. Kratki mówią co innego.'}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{duel.reveal}</p>
              <div className="mt-4 flex justify-end">
                <Button onClick={goNext} style={{ backgroundColor: color }}>
                  {index + 1 < DUELS.length ? (
                    'Następna para'
                  ) : (
                    <>
                      <Check className="mr-1 h-4 w-4" /> Zakończ
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
