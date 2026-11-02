'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { SCALING_OPS, scaleDecimal, type ScalingOp } from '../../../lib/decimal-scaling';

interface RoundConfig {
  input: string;
  op: ScalingOp;
  story: string;
}

const ROUNDS: RoundConfig[] = [
  { input: '3,5', op: 'x100', story: '1 metr wstążki kosztuje 3,5 zł. Ile kosztuje 100 metrów?' },
  { input: '42,7', op: 'd10', story: '10 jednakowych cegieł waży 42,7 kg. Ile waży jedna?' },
  { input: '4,2', op: 'd100', story: '100 jednakowych koralików waży 4,2 g. Ile waży jeden?' },
];

/** Szerokość komórki + odstęp — do wyliczenia pozycji przecinka. */
const STRIDE = 40;
const GAP = 4;

type Phase = 'pick' | 'hop' | 'fill' | 'done';

interface CommaHopBoardProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie (nowa interakcja lekcji): przesuwanie przecinka jako fizyczny
 * przeskok po komórkach tablicy pozycyjnej. Dziecko wybiera działanie (· 10,
 * · 100, · 1000, : 10, : 100, : 1000), przecinek przeskakuje o tyle komórek,
 * ile zer ma liczba, a puste komórki, przez które przeszedł, trzeba dopełnić
 * zerami — samodzielnie, klik po kliku. Krewny `PlaceShiftBoard` z modułu 1
 * (tam między kolumnami wędrowały żetony liczb naturalnych; tu wędruje sam
 * przecinek, a zera pojawiają się na krawędziach).
 */
export function CommaHopBoard({ color, onComplete }: CommaHopBoardProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('pick');
  const [filled, setFilled] = useState<Set<number>>(new Set());
  const [wrongOp, setWrongOp] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = ROUNDS[roundIndex] ?? ROUNDS[ROUNDS.length - 1];
  const scaling = useMemo(() => scaleDecimal(round.input, round.op), [round.input, round.op]);
  const containerRef = useSectionScrollAnchor(`${roundIndex}-${phase}-${finished}`);

  const addedIndices = useMemo(
    () => scaling.cells.map((c, i) => (c.added ? i : -1)).filter((i) => i >= 0),
    [scaling]
  );
  const allFilled = addedIndices.every((i) => filled.has(i));
  const commaPos = phase === 'pick' ? scaling.commaFrom : scaling.commaTo;

  const pickOp = (op: ScalingOp) => {
    if (op !== round.op) {
      setWrongOp((n) => n + 1);
      return;
    }
    setPhase('hop');
    window.setTimeout(() => {
      setPhase(scaling.zerosToFill > 0 ? 'fill' : 'done');
    }, 650);
  };

  const fillCell = (index: number) => {
    setFilled((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const goNext = () => {
    if (roundIndex + 1 < ROUNDS.length) {
      setRoundIndex((i) => i + 1);
      setPhase('pick');
      setFilled(new Set());
      setWrongOp(0);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Przecinek słucha się zer</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Ile zer w mnożniku albo dzielniku, o tyle miejsc przeskakuje przecinek: w prawo przy
          mnożeniu, w lewo przy dzieleniu. A gdzie zabraknie cyfry — trzeba dopisać zero.
        </p>
      </div>
    );
  }

  const rowWidth = scaling.cells.length * STRIDE + (scaling.cells.length - 1) * GAP;

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {/* Kropki rund */}
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((item, i) => (
          <span
            key={item.input + item.op}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {roundIndex + 1}/{ROUNDS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={roundIndex}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-1 text-sm leading-relaxed text-muted-foreground">{round.story}</p>
          <p className="mb-5 text-center text-base font-bold leading-snug sm:text-lg">
            Oblicz:{' '}
            <span className="font-mono tabular-nums" style={{ color }}>
              {scaling.inputText} {scaling.meta.label.replace('·', '×').replace(':', '÷')}
            </span>
          </p>

          {/* Tablica komórek z przeskakującym przecinkiem */}
          <div className="mb-5 flex justify-center overflow-x-auto">
            <div className="relative" style={{ width: rowWidth }}>
              {/* Przecinek — na linii cyfr; znika, gdy wychodzi poza ostatnią komórkę (wynik całkowity) */}
              <motion.span
                className="pointer-events-none absolute left-0 top-0 z-10 flex h-12 w-4 items-center justify-center text-2xl font-black leading-none sm:h-14 sm:text-3xl"
                style={{ color }}
                initial={false}
                animate={{
                  x: commaPos * (STRIDE + GAP) - 8,
                  opacity: commaPos >= scaling.cells.length ? 0 : 1,
                }}
                transition={{
                  x: { type: 'spring', stiffness: 160, damping: 18 },
                  opacity: { duration: 0.2 },
                }}
                aria-hidden
              >
                ,
              </motion.span>

              <div className="flex gap-1">
                {scaling.cells.map((cell, i) => {
                  const isAdded = cell.added;
                  const isFilled = filled.has(i);
                  const canFill = phase === 'fill' && isAdded && !isFilled;
                  const showChar = !isAdded || isFilled || phase === 'done';

                  if (canFill) {
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => fillCell(i)}
                        aria-label="Dopisz zero w tej komórce"
                        className="flex h-12 w-10 animate-pulse items-center justify-center border-2 border-dashed font-mono text-xl font-bold transition-colors hover:bg-black/5 dark:hover:bg-white/10 sm:h-14"
                        style={{ borderColor: color, color }}
                      >
                        +
                      </button>
                    );
                  }

                  return (
                    <span
                      key={i}
                      className={cn(
                        'flex h-12 w-10 items-center justify-center border font-mono text-xl font-bold tabular-nums sm:h-14 sm:text-2xl',
                        isAdded && showChar && 'border-2'
                      )}
                      style={{
                        borderColor: isAdded && showChar ? color : `${color}33`,
                        backgroundColor: isAdded && showChar ? `${color}14` : undefined,
                        color: isAdded ? color : `color-mix(in oklch, ${color} 92%, black)`,
                        visibility: isAdded && !showChar ? 'hidden' : undefined,
                      }}
                    >
                      {showChar ? cell.char : '0'}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {phase === 'pick' && (
            <>
              <p className="mb-3 text-center text-sm text-muted-foreground">
                Wybierz działanie. Przecinek przeskoczy o tyle miejsc, ile zer ma liczba.
              </p>
              <motion.div
                key={wrongOp}
                animate={wrongOp > 0 ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-3 gap-2"
              >
                {SCALING_OPS.map((meta) => (
                  <button
                    key={meta.op}
                    type="button"
                    onClick={() => pickOp(meta.op)}
                    aria-label={
                      meta.multiply ? `Pomnóż przez ${meta.factor}` : `Podziel przez ${meta.factor}`
                    }
                    className="cursor-pointer border px-2 py-2.5 text-center font-mono text-sm font-bold transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
                  >
                    {meta.label.replace('·', '×').replace(':', '÷')}
                  </button>
                ))}
              </motion.div>
              {wrongOp > 0 && (
                <p className="mt-3 text-center text-sm text-amber-700 dark:text-amber-300">
                  To nie to działanie. Spójrz jeszcze raz na polecenie u góry.
                </p>
              )}
            </>
          )}

          {phase === 'hop' && (
            <p className="text-center text-sm font-semibold" style={{ color }}>
              Przecinek przeskakuje o {scaling.hops}{' '}
              {scaling.direction === 'right' ? 'w prawo' : 'w lewo'}…
            </p>
          )}

          {phase === 'fill' && (
            <p className="flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
              {scaling.direction === 'right' ? (
                <ArrowRight className="h-4 w-4" style={{ color }} aria-hidden />
              ) : (
                <ArrowLeft className="h-4 w-4" style={{ color }} aria-hidden />
              )}
              Przecinek wyszedł poza cyfry — stuknij puste komórki i dopisz zera
              {allFilled ? '' : ` (${addedIndices.filter((i) => !filled.has(i)).length} do dopisania)`}.
            </p>
          )}

          {phase === 'done' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div
                className="flex items-center justify-center gap-3 p-4 text-center"
                style={{ backgroundColor: `${color}0f` }}
              >
                <Sparkles className="h-5 w-5 shrink-0" style={{ color }} aria-hidden />
                <span
                  className="font-mono text-lg font-bold tabular-nums sm:text-xl"
                  style={{ color }}
                >
                  {scaling.inputText} {scaling.meta.label.replace('·', '×').replace(':', '÷')} ={' '}
                  {scaling.resultText}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {scaling.meta.multiply
                  ? `${scaling.meta.factor} ma ${scaling.hops} ${scaling.hops === 1 ? 'zero' : 'zera'}, więc przecinek przeskoczył o ${scaling.hops} w prawo — liczba urosła.`
                  : `${scaling.meta.factor} ma ${scaling.hops} ${scaling.hops === 1 ? 'zero' : 'zera'}, więc przecinek przeskoczył o ${scaling.hops} w lewo — liczba zmalała.`}
              </p>
              <div className="mt-4 flex justify-end">
                <Button onClick={goNext}>
                  {roundIndex + 1 < ROUNDS.length ? (
                    'Następne działanie'
                  ) : (
                    <>
                      <Check className="mr-1 h-4 w-4" /> Zakończ
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {phase === 'fill' && allFilled && (
            <div className="mt-4 flex justify-center">
              <Button onClick={() => setPhase('done')} style={{ backgroundColor: color }}>
                Gotowe
              </Button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
