'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { LongMultiplicationGrid, type LongMultiplicationRow } from './long-multiplication-grid';
import {
  buildLongMultiplicationLayout,
  digitsOf,
  shiftDigits,
  type PartialProduct,
} from '../../../lib/column-algorithm';

/** Demo: mnożnik dwucyfrowy bez zer, żeby od razu pokazać dwa pełne iloczyny cząstkowe i przesunięcie. */
const DEMO = { a: 34, multiplier: 26 };
/** Runda 1 sprawdza przesunięcie (drugi iloczyn cząstkowy trzeba wybrać spośród trzech wariantów).
 *  Runda 2 sprawdza dodawanie gotowych iloczynów cząstkowych (trzeba wybrać poprawną sumę). */
const ROUND_1 = { a: 43, multiplier: 12 };
const ROUND_2 = { a: 126, multiplier: 34 };

function placeWord(partial: PartialProduct): string {
  if (partial.place === 'dziesiątki') return 'dziesiątek';
  if (partial.place === 'setki') return 'setek';
  return 'tysięcy';
}

function partialNarrative(a: number, partial: PartialProduct): string {
  if (partial.shift === 0) {
    return `${a} × ${partial.digit} = ${partial.value} — mnożymy przez cyfrę jedności mnożnika, dokładnie tak jak w poprzedniej lekcji.`;
  }
  const multiplierOfTen = partial.digit * 10 ** partial.shift;
  return `${a} × ${partial.digit} = ${partial.value} — ale to cyfra ${placeWord(partial)} mnożnika, czyli tak naprawdę ${a} × ${multiplierOfTen}. Wynik zapisujemy przesunięty o ${partial.shift} ${partial.shift === 1 ? 'kolumnę' : 'kolumny'} w lewo.`;
}

function rowsFromLayout(partials: PartialProduct[], revealedCount: number): LongMultiplicationRow[] {
  return partials.map((partial, i) => ({
    digits: partial.digits,
    revealed: i < revealedCount,
    highlight: i === revealedCount,
  }));
}

interface LongMultiplicationLabProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: demo (klikanie po kolei „Policz iloczyn cząstkowy”, potem
 * „Dodaj do siebie” na w pełni narrowanym przykładzie) + dwie samodzielne
 * rundy, każda sprawdzająca inną połówkę tej samej umiejętności — runda 1
 * przesunięcie (wybór poprawnie ustawionego drugiego iloczynu cząstkowego
 * spośród trzech wariantów), runda 2 dodawanie gotowych iloczynów
 * cząstkowych (wybór poprawnej sumy). Kolumnowe przenoszenie wewnątrz
 * pojedynczego iloczynu cząstkowego nie jest tu ponownie testowane — tego
 * dziecko nauczyło się już w poprzedniej lekcji.
 */
export function LongMultiplicationLab({ color, onComplete }: LongMultiplicationLabProps) {
  const [phase, setPhase] = useState(0);
  const containerRef = useSectionScrollAnchor(phase);
  const phaseCount = 3;

  const advance = () => {
    if (phase + 1 < phaseCount) {
      setPhase((p) => p + 1);
      return;
    }
    onComplete?.();
    setPhase((p) => p + 1);
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        {Array.from({ length: phaseCount }, (_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= phase ? color : `${color}26` }}
          />
        ))}
      </div>

      {phase === 0 && <DemoPhase color={color} onDone={advance} />}
      {phase === 1 && <ShiftRound color={color} onDone={advance} />}
      {phase === 2 && <SumRound color={color} isLast onDone={advance} />}
    </div>
  );
}

function DemoPhase({ color, onDone }: { color: string; onDone: () => void }) {
  const layout = useMemo(() => buildLongMultiplicationLayout(DEMO.a, DEMO.multiplier), []);
  const totalSteps = layout.partials.length + 1;
  const [revealed, setRevealed] = useState(0);
  const finished = revealed >= totalSteps;
  const currentPartial = revealed < layout.partials.length ? layout.partials[revealed] : null;

  const rows = rowsFromLayout(layout.partials, Math.min(revealed, layout.partials.length));

  return (
    <div>
      <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
        Mnożnik {DEMO.multiplier} rozkłada się na 2 dziesiątki i 6 jedności — dwie cyfry, dwa
        iloczyny cząstkowe. Obejrzyj, jak każdy z nich powstaje i jak łączą się w wynik.
      </p>

      <div className="mb-4 flex justify-center overflow-x-auto">
        <LongMultiplicationGrid
          color={color}
          topDigits={layout.topDigits}
          multiplierDigits={layout.multiplierDigits}
          highlightMultiplierPlace={currentPartial?.place ?? null}
          rows={rows}
          sumDigits={revealed >= totalSteps ? layout.sumDigits : null}
          showPlaceLabels
          ariaLabel={`Mnożenie pisemne ${DEMO.a} razy ${DEMO.multiplier}`}
        />
      </div>

      <div className="mb-4 flex min-h-[4.5rem] items-center justify-center">
        <AnimatePresence mode="wait">
          {!finished ? (
            <motion.p
              key={revealed}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-lg text-center text-sm leading-relaxed sm:text-base"
            >
              {revealed < layout.partials.length
                ? partialNarrative(DEMO.a, layout.partials[revealed])
                : `Zostało dodać ${layout.partials.length} iloczyny cząstkowe, kolumna po kolumnie — dokładnie tak jak w dodawaniu pisemnym.`}
            </motion.p>
          ) : (
            <motion.p
              key="done"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center font-mono text-lg font-black tabular-nums"
              style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
            >
              {DEMO.a} × {DEMO.multiplier} = {layout.total}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center">
        {!finished ? (
          <Button onClick={() => setRevealed((r) => r + 1)} className="gap-2">
            <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
            {revealed < layout.partials.length
              ? `Policz ${DEMO.a} × ${layout.partials[revealed].digit}`
              : 'Dodaj do siebie'}
          </Button>
        ) : (
          <Button onClick={onDone} className="gap-1.5">
            Spróbuj sam/a
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface ShiftOption {
  id: string;
  digits: (number | null)[];
  isCorrect: boolean;
}

function ShiftRound({ color, onDone }: { color: string; onDone: () => void }) {
  const layout = useMemo(() => buildLongMultiplicationLayout(ROUND_1.a, ROUND_1.multiplier), []);
  const secondPartial = layout.partials[1];
  const [picked, setPicked] = useState(false);
  const [wrongId, setWrongId] = useState<string | null>(null);

  const options = useMemo<ShiftOption[]>(() => {
    const base = digitsOf(secondPartial.value, 4);
    return [
      { id: 'a', digits: shiftDigits(base, 0), isCorrect: false },
      { id: 'b', digits: shiftDigits(base, secondPartial.shift), isCorrect: true },
      { id: 'c', digits: shiftDigits(base, secondPartial.shift + 1), isCorrect: false },
    ];
  }, [secondPartial]);

  const rows: LongMultiplicationRow[] = [
    { digits: layout.partials[0].digits, revealed: true },
    { digits: secondPartial.digits, revealed: picked, highlight: picked },
  ];

  const pick = (option: ShiftOption) => {
    if (picked) return;
    if (option.isCorrect) {
      setPicked(true);
      return;
    }
    setWrongId(option.id);
    setTimeout(() => setWrongId(null), 600);
  };

  return (
    <div>
      <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
        Runda 1: {ROUND_1.a} × {ROUND_1.multiplier}. Pierwszy iloczyn cząstkowy ({ROUND_1.a} ×{' '}
        {layout.partials[0].digit} = {layout.partials[0].value}) już policzony. Wybierz, jak
        poprawnie zapisać drugi — {ROUND_1.a} × {secondPartial.digit} = {secondPartial.value}, ale
        przez cyfrę {placeWord(secondPartial)}.
      </p>

      <div className="mb-4 flex justify-center overflow-x-auto">
        <LongMultiplicationGrid
          color={color}
          topDigits={layout.topDigits}
          multiplierDigits={layout.multiplierDigits}
          rows={rows}
          sumDigits={picked ? layout.sumDigits : null}
          showPlaceLabels
          ariaLabel={`Runda 1 — mnożenie pisemne ${ROUND_1.a} razy ${ROUND_1.multiplier}`}
        />
      </div>

      <div className="min-h-[7rem]">
        {!picked ? (
          <div className="grid grid-cols-3 gap-2">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => pick(option)}
                aria-label={`Wariant: liczba ${option.digits.reduce((acc: string, d) => (d == null ? acc : acc + d), '') || '0'} zaczynająca się w odpowiedniej kolumnie`}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 border-2 px-2 py-3 transition-all',
                  wrongId === option.id
                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40'
                    : 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={wrongId === option.id ? undefined : { borderColor: `${color}55` }}
              >
                {wrongId === option.id && <X className="h-4 w-4 shrink-0 text-rose-600" aria-hidden />}
                <span
                  className="inline-grid font-mono text-lg font-black tabular-nums sm:text-xl"
                  style={{ gridTemplateColumns: 'repeat(4, minmax(1.5rem, 1fr))', color }}
                  aria-hidden
                >
                  {Array.from({ length: 4 }, (_, pos) => {
                    const i = 3 - pos;
                    return (
                      <span key={i} className="flex h-8 items-center justify-center">
                        {option.digits[i] ?? ''}
                      </span>
                    );
                  })}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold sm:text-base" style={{ color }}>
              <Check className="h-4 w-4 shrink-0" aria-hidden />
              {ROUND_1.a} × {ROUND_1.multiplier} = {layout.total}
            </p>
            <Button onClick={onDone} className="gap-1.5">
              Następna runda
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function SumRound({ color, isLast, onDone }: { color: string; isLast: boolean; onDone: () => void }) {
  const layout = useMemo(() => buildLongMultiplicationLayout(ROUND_2.a, ROUND_2.multiplier), []);
  const [picked, setPicked] = useState(false);
  const [wrongValue, setWrongValue] = useState<number | null>(null);

  const options = useMemo(() => {
    const forgotShift = layout.partials.reduce((sum, p) => sum + p.value, 0);
    const additionSlip = layout.total + 100;
    return [
      { value: forgotShift, isCorrect: false },
      { value: layout.total, isCorrect: true },
      { value: additionSlip, isCorrect: false },
    ];
  }, [layout]);

  const rows: LongMultiplicationRow[] = layout.partials.map((partial) => ({
    digits: partial.digits,
    revealed: true,
  }));

  const pick = (option: (typeof options)[number]) => {
    if (picked) return;
    if (option.isCorrect) {
      setPicked(true);
      return;
    }
    setWrongValue(option.value);
    setTimeout(() => setWrongValue(null), 600);
  };

  return (
    <div>
      <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
        Runda 2: {ROUND_2.a} × {ROUND_2.multiplier}. Oba iloczyny cząstkowe są już gotowe i
        poprawnie przesunięte. Wybierz poprawną sumę.
      </p>

      <div className="mb-4 flex justify-center overflow-x-auto">
        <LongMultiplicationGrid
          color={color}
          topDigits={layout.topDigits}
          multiplierDigits={layout.multiplierDigits}
          rows={rows}
          sumDigits={picked ? layout.sumDigits : null}
          showPlaceLabels
          ariaLabel={`Runda 2 — mnożenie pisemne ${ROUND_2.a} razy ${ROUND_2.multiplier}`}
        />
      </div>

      <div className="min-h-[7rem]">
        {!picked ? (
          <div className="grid grid-cols-3 gap-2">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => pick(option)}
                className={cn(
                  'flex items-center justify-center border-2 px-3 py-3 font-mono text-lg font-bold tabular-nums transition-all',
                  wrongValue === option.value
                    ? 'border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                    : 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={wrongValue === option.value ? undefined : { borderColor: `${color}55`, color }}
              >
                {wrongValue === option.value && <X className="mr-1 h-4 w-4 shrink-0" aria-hidden />}
                {option.value}
              </button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold sm:text-base" style={{ color }}>
              <Check className="h-4 w-4 shrink-0" aria-hidden />
              {ROUND_2.a} × {ROUND_2.multiplier} = {layout.total}
            </p>
            <Button onClick={onDone} className="gap-1.5">
              {isLast ? 'Zakończ' : 'Następna runda'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
