'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Plus, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

interface Round {
  id: string;
  total: number;
  groupSize: number;
}

/** Runda 1: prosty przypadek. Runda 2: inny rozmiar grupy, żeby dziecko nie zapamiętało jednej konkretnej pary liczb. */
const ROUNDS: Round[] = [
  { id: 'r1', total: 23, groupSize: 4 },
  { id: 'r2', total: 27, groupSize: 5 },
];

interface GroupStackerWarmupProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: zanim dziecko zobaczy algorytm dzielenia pisemnego, buduje
 * intuicję „iloraz = ile pełnych grup, reszta = co zostało" własnymi
 * rękami — klikając „+1 grupa" rozgranicza kropki na pełne grupy o stałym
 * rozmiarze, aż nie starczy już na kolejną, a dopiero potem odpowiada, ile
 * zostało luzem. Pierwsza w kursie interakcja typu „buduj grupę po grupie,
 * aż sam mechanizm cię zatrzyma" — inne widżety albo odsłaniają gotowy
 * wynik (`ZeroCountWarmup`), albo przenoszą już istniejące elementy
 * (`PlaceShiftBoard`), żaden nie akumuluje własnych kliknięć w rosnącą
 * strukturę z naturalnym twardym limitem zamiast klucza odpowiedzi.
 */
export function GroupStackerWarmup({ color, onComplete }: GroupStackerWarmupProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [groups, setGroups] = useState(0);
  const [remainderPick, setRemainderPick] = useState<number | null>(null);
  const [wrongPick, setWrongPick] = useState<number | null>(null);
  const containerRef = useSectionScrollAnchor(`${roundIndex}-${remainderPick !== null}`);

  /** Poza `next()`'s ostatnim krokiem `roundIndex` chwilowo wychodzi poza `ROUNDS` — bezpieczny fallback, żeby hooki poniżej nie dostały `undefined` (wynik i tak nie trafia do JSX, patrz `return null` niżej). */
  const round = ROUNDS[roundIndex] ?? ROUNDS[ROUNDS.length - 1];
  const maxGroups = Math.floor(round.total / round.groupSize);
  const capped = groups >= maxGroups;
  const groupedCount = groups * round.groupSize;
  const correctRemainder = round.total - maxGroups * round.groupSize;
  const isLast = roundIndex === ROUNDS.length - 1;
  const answered = remainderPick !== null;

  const options = useMemo(() => {
    const decoyPool = [round.groupSize, correctRemainder + 1, correctRemainder - 1].filter(
      (v) => v >= 0 && v < round.groupSize && v !== correctRemainder
    );
    const decoys = [...new Set(decoyPool)].slice(0, 2);
    const values = [correctRemainder, ...decoys];
    const rotation = roundIndex % values.length;
    return [...values.slice(rotation), ...values.slice(0, rotation)];
  }, [round, correctRemainder, roundIndex]);

  const addGroup = () => {
    if (capped) return;
    setGroups((g) => g + 1);
  };

  const undoGroup = () => {
    if (groups === 0 || answered) return;
    setGroups((g) => g - 1);
  };

  const pickRemainder = (value: number) => {
    if (answered || wrongPick !== null) return;
    if (value === correctRemainder) {
      setRemainderPick(value);
      return;
    }
    setWrongPick(value);
    setTimeout(() => setWrongPick(null), 600);
  };

  const next = () => {
    if (!isLast) {
      setRoundIndex((r) => r + 1);
      setGroups(0);
      setRemainderPick(null);
      return;
    }
    onComplete?.();
    setRoundIndex((r) => r + 1);
  };

  if (roundIndex >= ROUNDS.length) return null;

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        {ROUNDS.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }}
          />
        ))}
      </div>

      <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
        Masz <strong style={{ color }}>{round.total}</strong> kropek. Klikaj „+1 grupa”, żeby
        rozdzielić je na pełne grupy po <strong style={{ color }}>{round.groupSize}</strong> — aż
        nie starczy już na kolejną.
      </p>

      <div
        className="mb-5 flex min-h-[5rem] flex-wrap items-center justify-center gap-2 border p-4"
        style={{ borderColor: `${color}33` }}
        role="img"
        aria-label={`${groupedCount} z ${round.total} kropek pogrupowane w ${groups} grup po ${round.groupSize}`}
      >
        <AnimatePresence>
          {Array.from({ length: groups }, (_, g) => (
            <motion.div
              key={`group-${g}`}
              layout
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="flex items-center gap-1 border-2 px-1.5 py-1"
              style={{ borderColor: color }}
            >
              <span className="mr-0.5 text-[10px] font-bold tabular-nums" style={{ color }} aria-hidden>
                {g + 1}
              </span>
              {Array.from({ length: round.groupSize }, (_, d) => (
                <span key={d} className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} aria-hidden />
              ))}
            </motion.div>
          ))}
        </AnimatePresence>

        {Array.from({ length: round.total - groupedCount }, (_, i) => (
          <motion.span
            key={`loose-${i}`}
            layout
            className="h-3 w-3 shrink-0 rounded-full border-2"
            style={{ borderColor: `${color}80` }}
            aria-hidden
          />
        ))}
      </div>

      {!capped ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button onClick={addGroup} className="gap-1.5">
            <Plus className="h-4 w-4" aria-hidden />
            +1 grupa po {round.groupSize}
          </Button>
          {groups > 0 && (
            <Button variant="ghost" onClick={undoGroup} className="gap-1.5 text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Cofnij ostatnią grupę
            </Button>
          )}
        </div>
      ) : (
        <div>
          {!answered ? (
            <>
              <p className="mb-3 text-center text-sm leading-relaxed sm:text-base">
                Zmieściło się <strong style={{ color }}>{maxGroups}</strong> pełnych grup — na
                kolejną już nie starczy. Ile kropek zostało luzem (reszta)?
              </p>
              <div className="mx-auto grid max-w-xs grid-cols-3 gap-2">
                {options.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => pickRemainder(value)}
                    className={cn(
                      'flex items-center justify-center border-2 px-3 py-3 font-mono text-lg font-bold tabular-nums transition-all',
                      wrongPick === value
                        ? 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                        : 'hover:-translate-y-0.5 hover:shadow-md'
                    )}
                    style={wrongPick === value ? undefined : { borderColor: `${color}55`, color }}
                  >
                    {wrongPick === value && <X className="mr-1 h-4 w-4 shrink-0" aria-hidden />}
                    {value}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex justify-center">
                <Button variant="ghost" onClick={undoGroup} className="gap-1.5 text-xs text-muted-foreground">
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                  Jeszcze się zastanowię — cofnij grupę
                </Button>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <p className="max-w-md text-sm leading-relaxed sm:text-base">
                Dokładnie tak: {round.total} : {round.groupSize} ={' '}
                <strong style={{ color }}>
                  {maxGroups} r {correctRemainder}
                </strong>
                . Za chwilę zobaczysz, jak dokładnie ten sam podział zapisuje się pisemnie, kolumna
                po kolumnie.
              </p>
              <Button onClick={next} className="gap-1.5">
                {isLast ? 'Zakończ' : 'Następna runda'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
