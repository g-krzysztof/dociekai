'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { buildDecimalSubtraction } from '../../../lib/decimal-subtraction';
import { ColumnSubGrid } from './column-sub-grid';

type AlignChoice = 'comma' | 'right';

interface RoundConfig {
  a: string;
  b: string;
  options: [AlignChoice, AlignChoice];
}

const ROUNDS: RoundConfig[] = [
  { a: '3,5', b: '0,25', options: ['right', 'comma'] },
  { a: '1,4', b: '0,7', options: ['comma', 'right'] },
  { a: '6', b: '2,45', options: ['right', 'comma'] },
];

const CHOICE_LABEL: Record<AlignChoice, string> = {
  comma: 'Ustawić przecinek pod przecinkiem',
  right: 'Wyrównać ostatnie cyfry do prawej strony',
};

type Phase = 'align' | 'zeros' | 'sub';

interface ColumnSubBuildProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: odejmowanie pisemne ułamków dziesiętnych w trzech ruchach, które
 * dziecko wykonuje samo — (1) wybierz właściwe ustawienie liczb (pułapka:
 * wyrównanie do prawej zamiast przecinka pod przecinkiem), (2) dopisz zera do
 * równej liczby miejsc, (3) odejmuj kolumnami od prawej, z pożyczaniem, które
 * potrafi przeskoczyć przez przecinek.
 */
export function ColumnSubBuild({ color, onComplete }: ColumnSubBuildProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('align');
  const [wrongCount, setWrongCount] = useState(0);
  const [explain, setExplain] = useState<string | null>(null);
  const [zeros, setZeros] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = ROUNDS[roundIndex] ?? ROUNDS[ROUNDS.length - 1];
  const subtraction = useMemo(() => buildDecimalSubtraction(round.a, round.b), [round.a, round.b]);
  const subComplete = phase === 'sub' && revealed >= subtraction.columns.length;
  const containerRef = useSectionScrollAnchor(`${roundIndex}-${phase}-${subComplete}-${finished}`);

  const emptyCells = useMemo(() => {
    const cells: string[] = [];
    subtraction.columns.forEach((column) => {
      if (column.topIsPadded) cells.push(`A-${column.placeIndex}`);
      if (column.bottomIsPadded) cells.push(`B-${column.placeIndex}`);
    });
    return cells;
  }, [subtraction]);

  const allZerosFilled = emptyCells.every((cell) => zeros.has(cell));

  const pickAlign = (choice: AlignChoice) => {
    if (choice === 'comma') {
      setExplain(null);
      setPhase(emptyCells.length > 0 ? 'zeros' : 'sub');
      return;
    }
    setWrongCount((count) => count + 1);
    setExplain(
      `Gdyby wyrównać do prawej, ${round.b} stanęłoby zbyt daleko w prawo — jego setne trafiłyby pod dziesiąte liczby ${round.a}. Odejmowalibyśmy wtedy różne rzędy. Zawsze ustawiamy przecinek pod przecinkiem.`
    );
  };

  const fillZero = (cell: string) => {
    setZeros((prev) => {
      const next = new Set(prev);
      next.add(cell);
      return next;
    });
  };

  const revealNext = () => {
    setRevealed((count) => Math.min(count + 1, subtraction.columns.length));
  };

  const goNextRound = () => {
    if (roundIndex + 1 < ROUNDS.length) {
      setRoundIndex((index) => index + 1);
      setPhase('align');
      setExplain(null);
      setZeros(new Set());
      setRevealed(0);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Umiesz już odjąć ułamki dziesiętne w słupku</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Przecinek pod przecinkiem, dopisane zera do równej liczby miejsc, odejmowanie kolumnami od
          prawej — a pożyczka „1” wędruje z lewej tak samo jak w liczbach naturalnych, nawet gdy musi
          przejść przez przecinek.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {/* Kropki rund */}
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((item, i) => (
          <span
            key={`${item.a}-${item.b}`}
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
          key={`${roundIndex}-${phase}`}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-4 text-center text-base font-bold leading-snug sm:text-lg">
            Odejmij pisemnie:{' '}
            <span className="font-mono tabular-nums" style={{ color }}>
              {subtraction.aText} − {subtraction.bText}
            </span>
          </p>

          {phase === 'align' && (
            <>
              <p className="mb-3 text-center text-sm text-muted-foreground">
                Jak ustawić te dwie liczby jedna pod drugą?
              </p>
              <motion.div
                key={wrongCount}
                animate={wrongCount > 0 ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
                transition={{ duration: 0.4 }}
                className="grid gap-2"
              >
                {round.options.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => pickAlign(choice)}
                    className="cursor-pointer border px-4 py-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md sm:text-base"
                  >
                    {CHOICE_LABEL[choice]}
                  </button>
                ))}
              </motion.div>
              {explain && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
                >
                  {explain}
                </motion.p>
              )}
            </>
          )}

          {phase === 'zeros' && (
            <>
              <ColumnSubGrid
                subtraction={subtraction}
                color={color}
                revealed={0}
                zeroFill={{ filled: zeros, onFill: fillZero }}
              />
              <div className="mt-5">
                <p className="mb-3 text-center text-sm text-muted-foreground">
                  Kliknij puste pola i dopisz zera, aż obie liczby będą miały tyle samo miejsc po
                  przecinku. Dopisane zero na końcu nie zmienia wartości.
                </p>
                <div className="flex justify-center">
                  <Button onClick={() => setPhase('sub')} disabled={!allZerosFilled} className="gap-2">
                    <ArrowRight className="h-4 w-4" aria-hidden />
                    Odejmij kolumnami
                  </Button>
                </div>
              </div>
            </>
          )}

          {phase === 'sub' && (
            <>
              <ColumnSubGrid
                subtraction={subtraction}
                color={color}
                revealed={revealed}
                showAllZeros
                onRevealNext={subComplete ? undefined : revealNext}
              />
              {!subComplete ? (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Stukaj w kolejne kolumny od prawej strony — wynik i pożyczki pojawią się same. Gdy
                  górna cyfra jest za mała, pożyczamy 1 z kolumny po lewej.
                </p>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5"
                >
                  <div
                    className="flex items-center justify-center gap-3 p-4 text-center"
                    style={{ backgroundColor: `${color}0f` }}
                  >
                    <span
                      className="font-mono text-lg font-bold tabular-nums sm:text-xl"
                      style={{ color }}
                    >
                      {subtraction.aText} − {subtraction.bText} = {subtraction.differenceText}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Przecinek w wyniku spadł prosto w dół, pod przecinki odjemnej i odjemnika.
                  </p>
                  <div className="mt-4 flex justify-end">
                    <Button onClick={goNextRound}>
                      {roundIndex + 1 < ROUNDS.length ? (
                        'Następne odejmowanie'
                      ) : (
                        <>
                          <Check className="mr-1 h-4 w-4" /> Zakończ
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </>
          )}

          <p className="mt-4 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {phase === 'align' && 'Krok 1 z 3 · ustaw liczby'}
            {phase === 'zeros' && 'Krok 2 z 3 · dopisz zera'}
            {phase === 'sub' && 'Krok 3 z 3 · odejmuj kolumnami'}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
