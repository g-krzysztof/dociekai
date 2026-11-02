'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Delete, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

type Col = 'whole' | 'tenths' | 'hundredths';

interface Round {
  id: string;
  /** Ile pełnych jedności, dziesiątych i setnych leży na tablicy na starcie. */
  start: Record<Col, number>;
  /** Do którego rzędu dziecko dokłada porcje. */
  addColumn: Extract<Col, 'tenths' | 'hundredths'>;
  /** Ile porcji trzeba dołożyć. */
  addCount: number;
  /** Zapis jednej porcji: „0,1" albo „0,01". */
  unitLabel: string;
  /** Gotowe równanie wyniku. */
  equation: string;
  /** Zdanie-wniosek po zwinięciu dziesiątki. */
  note: string;
  /** Czy przeniesienie przeskakuje przez przecinek (10 dziesiątych → 1 cała). */
  crossesComma: boolean;
}

const ROUNDS: Round[] = [
  {
    id: 'r1',
    start: { whole: 0, tenths: 7, hundredths: 0 },
    addColumn: 'tenths',
    addCount: 5,
    unitLabel: '0,1',
    equation: '0,7 + 0,5 = 1,2',
    note: '10 dziesiątych zwinęło się w 1 całą — przeniesienie przeskoczyło przez przecinek. Dlatego 0,7 + 0,5 to 1,2, a nie 0,12.',
    crossesComma: true,
  },
  {
    id: 'r2',
    start: { whole: 0, tenths: 0, hundredths: 8 },
    addColumn: 'hundredths',
    addCount: 5,
    unitLabel: '0,01',
    equation: '0,08 + 0,05 = 0,13',
    note: '10 setnych zwinęło się w 1 dziesiątą. Tym razem przeniesienie NIE przeskoczyło przez przecinek — zostało w części po przecinku.',
    crossesComma: false,
  },
  {
    id: 'r3',
    start: { whole: 1, tenths: 6, hundredths: 0 },
    addColumn: 'tenths',
    addCount: 7,
    unitLabel: '0,1',
    equation: '1,6 + 0,7 = 2,3',
    note: 'Znów 10 dziesiątych = 1 cała, więc część całkowita urosła z 1 do 2, a w rzędzie dziesiątych zostały 3.',
    crossesComma: true,
  },
];

const TARGET_OF: Record<'tenths' | 'hundredths', Col> = {
  tenths: 'whole',
  hundredths: 'tenths',
};

const COL_LABEL: Record<Col, string> = {
  whole: 'jedności',
  tenths: 'dziesiąte',
  hundredths: 'setne',
};

interface TenthsRolloverProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka (nowa interakcja lekcji): tablica pozycyjna z koralikami, w której
 * rząd zwija się przy dziesiątce — 10 koralików znika, a jeden przeskakuje o
 * kolumnę w lewo. W dwóch z trzech rund ten przeskok przechodzi przez przecinek
 * (10 dziesiątych → 1 cała), w jednej zostaje w części po przecinku. To ten sam
 * ruch, który w słupku nazywa się „przeniesieniem" — dziecko wykonuje go tu
 * fizycznie, zanim zobaczy go w zapisie pisemnym.
 */
export function TenthsRollover({ color, onComplete }: TenthsRolloverProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [beads, setBeads] = useState<Record<Col, number>>(ROUNDS[0].start);
  const [regrouped, setRegrouped] = useState(false);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${roundIndex}-${finished}`);

  const round = ROUNDS[roundIndex] ?? ROUNDS[ROUNDS.length - 1];
  const target = TARGET_OF[round.addColumn];
  const added = beads[round.addColumn] - round.start[round.addColumn] + (regrouped ? 10 : 0);
  const canAdd = added < round.addCount;
  const canUndo = beads[round.addColumn] > round.start[round.addColumn];
  const canRegroup = beads[round.addColumn] >= 10;
  const roundDone = added >= round.addCount && regrouped && beads[round.addColumn] < 10;

  const addBead = () => {
    if (!canAdd) return;
    setBeads((prev) => ({ ...prev, [round.addColumn]: prev[round.addColumn] + 1 }));
  };

  const undoBead = () => {
    if (!canUndo) return;
    setBeads((prev) => ({ ...prev, [round.addColumn]: prev[round.addColumn] - 1 }));
  };

  const regroup = () => {
    if (!canRegroup) return;
    setBeads((prev) => ({
      ...prev,
      [round.addColumn]: prev[round.addColumn] - 10,
      [target]: prev[target] + 1,
    }));
    setRegrouped(true);
  };

  const goNext = () => {
    if (roundIndex + 1 < ROUNDS.length) {
      const nextRound = ROUNDS[roundIndex + 1];
      setRoundIndex((index) => index + 1);
      setBeads(nextRound.start);
      setRegrouped(false);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Wiesz już, jak zwija się dziesiątka</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Kiedy w rzędzie zbierze się 10 takich samych części, zamieniają się w jedną część rzędu po
          lewej. Czasem ten przeskok przechodzi przez przecinek — i właśnie dlatego 0,8 + 0,7 to 1,5,
          a nie 0,15.
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
            Dołóż {round.addCount} razy po <span style={{ color }}>{round.unitLabel}</span> do rzędu{' '}
            <span style={{ color }}>{COL_LABEL[round.addColumn]}</span>
          </p>
          <p className="mb-4 text-center text-xs text-muted-foreground">
            Gdy w rzędzie uzbiera się 10 koralików, zwiń je w jeden koralik rzędu po lewej.
          </p>

          <BeadBoard beads={beads} color={color} activeColumn={round.addColumn} crossesComma={round.crossesComma} />

          {/* Licznik dołożonych porcji */}
          <p className="mt-4 text-center text-sm">
            Dołożono:{' '}
            <span className="font-mono font-bold tabular-nums" style={{ color }}>
              {Math.min(added, round.addCount)}
            </span>{' '}
            z {round.addCount}
          </p>

          {!roundDone ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Button onClick={addBead} disabled={!canAdd} className="gap-1.5">
                <span aria-hidden>+</span> {round.unitLabel}
              </Button>
              <Button variant="outline" onClick={undoBead} disabled={!canUndo} className="gap-1.5">
                <Delete className="h-4 w-4" aria-hidden /> Cofnij
              </Button>
              <Button
                variant={canRegroup ? 'default' : 'outline'}
                onClick={regroup}
                disabled={!canRegroup}
                className="gap-1.5"
                style={canRegroup ? { backgroundColor: color } : undefined}
              >
                <ArrowRight className="h-4 w-4" aria-hidden />
                Zwiń 10 {COL_LABEL[round.addColumn]} w 1{' '}
                {round.addColumn === 'tenths' ? 'całą' : 'dziesiątą'}
              </Button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
              <div
                className="flex items-center justify-center gap-3 p-4 text-center"
                style={{ backgroundColor: `${color}0f` }}
              >
                <Sparkles className="h-5 w-5 shrink-0" style={{ color }} aria-hidden />
                <span className="font-mono text-lg font-bold tabular-nums sm:text-xl" style={{ color }}>
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
  crossesComma,
}: {
  beads: Record<Col, number>;
  color: string;
  activeColumn: Col;
  crossesComma: boolean;
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
          />
          {/* Przecinek jako „bramka" między jednościami a dziesiątymi */}
          {i === 0 && (
            <div className="mx-1 flex flex-col items-center justify-center">
              <motion.span
                key={`${beads.whole}-${beads.tenths}`}
                initial={crossesComma ? { scale: 1 } : false}
                animate={crossesComma ? { scale: [1, 1.35, 1] } : {}}
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
}: {
  label: string;
  count: number;
  color: string;
  active: boolean;
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
          borderColor: active ? color : `${color}40`,
          backgroundColor: count >= 10 ? `${color}12` : undefined,
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
      <span className="font-mono text-sm font-bold tabular-nums" style={{ color: count >= 10 ? color : undefined }}>
        {count}
      </span>
    </div>
  );
}
