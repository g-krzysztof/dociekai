'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Scissors, Sparkles, Trophy, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

type Col = 'whole' | 'tenths' | 'hundredths';

interface Round {
  id: string;
  start: Record<Col, number>;
  /** Z którego rzędu dziecko zabiera koraliki. */
  removeColumn: Extract<Col, 'tenths' | 'hundredths'>;
  removeCount: number;
  /** Zapis jednego koralika: „0,1" albo „0,01". */
  unitLabel: string;
  equation: string;
  note: string;
  /** Czy pożyczka przeskakuje przez przecinek (dziesiąte pożyczają od jedności). */
  crossesComma: boolean;
}

const ROUNDS: Round[] = [
  {
    id: 'r1',
    start: { whole: 1, tenths: 2, hundredths: 0 },
    removeColumn: 'tenths',
    removeCount: 5,
    unitLabel: '0,1',
    equation: '1,2 − 0,5 = 0,7',
    note: 'W rzędzie dziesiątych były tylko 2 koraliki, a trzeba było zabrać 5. Rozbiliśmy 1 całą na 10 dziesiątych — pożyczka przeskoczyła przez przecinek. Dlatego 1,2 − 0,5 to 0,7.',
    crossesComma: true,
  },
  {
    id: 'r2',
    start: { whole: 0, tenths: 1, hundredths: 3 },
    removeColumn: 'hundredths',
    removeCount: 5,
    unitLabel: '0,01',
    equation: '0,13 − 0,05 = 0,08',
    note: 'Tym razem rozbiliśmy 1 dziesiątą na 10 setnych. Pożyczka NIE przeskoczyła przez przecinek — została w części po przecinku.',
    crossesComma: false,
  },
  {
    id: 'r3',
    start: { whole: 2, tenths: 3, hundredths: 0 },
    removeColumn: 'tenths',
    removeCount: 7,
    unitLabel: '0,1',
    equation: '2,3 − 0,7 = 1,6',
    note: 'Znów rozbiliśmy 1 całą na 10 dziesiątych, więc część całkowita zmalała z 2 do 1, a w rzędzie dziesiątych zostało 6.',
    crossesComma: true,
  },
];

const SOURCE_OF: Record<'tenths' | 'hundredths', Col> = {
  tenths: 'whole',
  hundredths: 'tenths',
};

const COL_LABEL: Record<Col, string> = {
  whole: 'jedności',
  tenths: 'dziesiąte',
  hundredths: 'setne',
};

const SINGULAR: Record<Col, string> = {
  whole: 'całą',
  tenths: 'dziesiątą',
  hundredths: 'setną',
};

interface TenthsBorrowProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: tablica pozycyjna z koralikami — lustrzane odbicie „zwijania
 * dziesiątki" z lekcji o dodawaniu. Tutaj w rzędzie brakuje koralików do
 * zabrania, więc dziecko rozbija JEDEN koralik rzędu po lewej na 10 koralików
 * bieżącego rzędu. W dwóch z trzech rund to rozbicie przechodzi przez przecinek
 * (1 cała → 10 dziesiątych). To ten sam ruch, który w słupku nazywa się
 * „pożyczaniem" — wykonany fizycznie, zanim dziecko zobaczy go w zapisie.
 */
export function TenthsBorrow({ color, onComplete }: TenthsBorrowProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [beads, setBeads] = useState<Record<Col, number>>(ROUNDS[0].start);
  const [borrowed, setBorrowed] = useState(false);
  const [removed, setRemoved] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${roundIndex}-${finished}`);

  const round = ROUNDS[roundIndex] ?? ROUNDS[ROUNDS.length - 1];
  const source = SOURCE_OF[round.removeColumn];

  const canRemove = removed < round.removeCount && beads[round.removeColumn] > 0;
  const canBorrow = !borrowed && beads[source] > 0;
  const canUndo = removed > 0;
  const roundDone = removed >= round.removeCount;

  const boardValue = beads.whole + beads.tenths / 10 + beads.hundredths / 100;

  const removeBead = () => {
    if (!canRemove) return;
    setBeads((prev) => ({ ...prev, [round.removeColumn]: prev[round.removeColumn] - 1 }));
    setRemoved((count) => count + 1);
  };

  const undoBead = () => {
    if (!canUndo) return;
    setBeads((prev) => ({ ...prev, [round.removeColumn]: prev[round.removeColumn] + 1 }));
    setRemoved((count) => count - 1);
  };

  const borrow = () => {
    if (!canBorrow) return;
    setBeads((prev) => ({
      ...prev,
      [source]: prev[source] - 1,
      [round.removeColumn]: prev[round.removeColumn] + 10,
    }));
    setBorrowed(true);
  };

  const goNext = () => {
    if (roundIndex + 1 < ROUNDS.length) {
      const nextRound = ROUNDS[roundIndex + 1];
      setRoundIndex((index) => index + 1);
      setBeads(nextRound.start);
      setBorrowed(false);
      setRemoved(0);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Wiesz już, jak rozbić koralik</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Kiedy w rzędzie brakuje koralików do zabrania, rozbijasz jeden koralik rzędu po lewej na 10
          mniejszych. Czasem to rozbicie przechodzi przez przecinek — i właśnie dlatego 1,2 − 0,5 to
          0,7, a nie 0,3.
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
            key={item.id}
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
          key={round.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-1 text-center text-base font-bold leading-snug sm:text-lg">
            Zabierz {round.removeCount} razy po <span style={{ color }}>{round.unitLabel}</span> z
            rzędu <span style={{ color }}>{COL_LABEL[round.removeColumn]}</span>
          </p>
          <p className="mb-4 text-center text-xs text-muted-foreground">
            Gdy w rzędzie zabraknie koralików, rozbij 1 koralik rzędu po lewej na 10 tutejszych.
          </p>

          <BeadBoard
            beads={beads}
            color={color}
            activeColumn={round.removeColumn}
            sourceColumn={source}
            crossesComma={round.crossesComma}
            borrowed={borrowed}
          />

          <p className="mt-4 text-center text-sm">
            Na tablicy:{' '}
            <span className="font-mono font-bold tabular-nums" style={{ color }}>
              {boardValue.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>{' '}
            · zabrano{' '}
            <span className="font-mono font-bold tabular-nums" style={{ color }}>
              {removed}
            </span>{' '}
            z {round.removeCount}
          </p>

          {!roundDone ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Button
                onClick={removeBead}
                disabled={!canRemove}
                className="gap-1.5"
                aria-label={`Zabierz ${round.unitLabel}`}
              >
                <span aria-hidden>−</span> {round.unitLabel}
              </Button>
              <Button
                variant="outline"
                onClick={undoBead}
                disabled={!canUndo}
                className="gap-1.5"
                aria-label="Cofnij ostatni ruch"
              >
                <Undo2 className="h-4 w-4" aria-hidden /> Cofnij
              </Button>
              <Button
                variant={canBorrow && !canRemove ? 'default' : 'outline'}
                onClick={borrow}
                disabled={!canBorrow}
                className="gap-1.5"
                style={canBorrow && !canRemove ? { backgroundColor: color } : undefined}
              >
                <Scissors className="h-4 w-4" aria-hidden />
                Rozbij 1 {SINGULAR[source]} na 10 {COL_LABEL[round.removeColumn]}
              </Button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
              <div
                className="flex items-center justify-center gap-3 p-4 text-center"
                style={{ backgroundColor: `${color}0f` }}
              >
                <Sparkles className="h-5 w-5 shrink-0" style={{ color }} aria-hidden />
                <span
                  className="font-mono text-lg font-bold tabular-nums sm:text-xl"
                  style={{ color }}
                >
                  {round.equation}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{round.note}</p>
              <div className="mt-4 flex justify-end">
                <Button onClick={goNext}>
                  {roundIndex + 1 < ROUNDS.length ? (
                    'Następna runda'
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

function BeadBoard({
  beads,
  color,
  activeColumn,
  sourceColumn,
  crossesComma,
  borrowed,
}: {
  beads: Record<Col, number>;
  color: string;
  activeColumn: Col;
  sourceColumn: Col;
  crossesComma: boolean;
  borrowed: boolean;
}) {
  const columns: Col[] = ['whole', 'tenths', 'hundredths'];

  return (
    <div className="mx-auto flex w-fit items-stretch justify-center gap-1">
      {columns.map((col, i) => (
        <div key={col} className="flex items-stretch">
          <BeadTube
            label={COL_LABEL[col]}
            count={beads[col]}
            color={color}
            active={col === activeColumn}
            source={col === sourceColumn}
          />
          {i === 0 && (
            <div className="mx-1 flex flex-col items-center justify-center">
              <motion.span
                key={`${beads.whole}-${beads.tenths}-${borrowed}`}
                initial={false}
                animate={crossesComma && borrowed ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-3xl font-black leading-none sm:text-4xl"
                style={{ color }}
                aria-hidden
              >
                ,
              </motion.span>
              <span className="mt-1 text-[8px] font-bold uppercase tracking-wide text-muted-foreground">
                przecinek
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function BeadTube({
  label,
  count,
  color,
  active,
  source,
}: {
  label: string;
  count: number;
  color: string;
  active: boolean;
  source: boolean;
}) {
  const beads = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

  return (
    <div className="flex w-14 flex-col items-center sm:w-16">
      <div
        className={cn(
          'flex h-48 w-full flex-col-reverse items-center gap-[3px] border-2 p-1.5 transition-colors',
          active ? 'border-solid' : 'border-dashed'
        )}
        style={{
          borderColor: active ? color : source ? `${color}80` : `${color}40`,
          backgroundColor: count > 10 ? `${color}12` : undefined,
        }}
      >
        <AnimatePresence initial={false}>
          {beads.map((bead) => (
            <motion.span
              key={bead}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className="block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </AnimatePresence>
      </div>
      <span className="mt-1 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className="font-mono text-sm font-bold tabular-nums"
        style={{ color: count > 10 ? color : undefined }}
      >
        {count}
      </span>
    </div>
  );
}
