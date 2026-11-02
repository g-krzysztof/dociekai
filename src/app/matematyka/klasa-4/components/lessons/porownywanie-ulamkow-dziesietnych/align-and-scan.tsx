'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, MoveHorizontal, Plus, ScanLine, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { DecimalNumeral } from '../../guides/zapis-dziesietny/decimal-numeral';
import {
  DECIMAL_PLACES,
  comparisonSign,
  firstDifferingPlace,
  formatDecimal,
  padDecimalPlaces,
  parseDecimal,
} from '../../../lib/decimal';

interface Pair {
  a: string;
  b: string;
  /** Zdanie-wniosek pokazywane po znalezieniu rozstrzygającego rzędu. */
  note: string;
}

const PAIRS: Pair[] = [
  {
    a: '0,4',
    b: '0,375',
    note: '0,375 ma więcej cyfr, ale po wyrównaniu widać 0,400 i 0,375 — w rzędzie dziesiątych 4 > 3, więc 0,4 jest większe.',
  },
  {
    a: '0,5',
    b: '0,50',
    note: 'Dopisane zero na końcu nic nie zmienia — po wyrównaniu oba zapisy to 0,50. Wszystkie rzędy równe, więc między liczbami stoi znak =.',
  },
  {
    a: '3,08',
    b: '3,1',
    note: 'Części całkowite równe (3 = 3). Po wyrównaniu 3,08 i 3,10 — w rzędzie dziesiątych 0 < 1, więc 3,08 jest mniejsze, choć ma więcej cyfr.',
  },
];

type Stage = 'raw' | 'zeros' | 'scan';

interface AlignAndScanProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: reguła porównywania rozłożona na trzy ruchy, które dziecko
 * wykonuje samo — (1) wyrównaj przecinki, (2) dopisz brakujące zera, tak żeby
 * obie liczby miały tyle samo miejsc po przecinku, (3) skanuj rzędy od lewej,
 * aż trafisz na pierwszą różnicę. To właśnie ten rząd rozstrzyga porównanie.
 */
export function AlignAndScan({ color, onComplete }: AlignAndScanProps) {
  const [pairIndex, setPairIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('raw');
  const [zeros, setZeros] = useState<Set<string>>(new Set());
  const [revealed, setRevealed] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${pairIndex}-${stage}-${finished}`);

  const pair = PAIRS[pairIndex] ?? PAIRS[PAIRS.length - 1];
  const rawA = useMemo(() => parseDecimal(pair.a), [pair]);
  const rawB = useMemo(() => parseDecimal(pair.b), [pair]);
  const places = Math.max(rawA.digits.length, rawB.digits.length);
  const a = padDecimalPlaces(rawA, places);
  const b = padDecimalPlaces(rawB, places);

  /** Puste komórki (poza własnymi cyframi liczby) do dopisania zera. */
  const emptyCells = useMemo(() => {
    const cells: string[] = [];
    for (let i = rawA.digits.length; i < places; i += 1) cells.push(`A-${i}`);
    for (let i = rawB.digits.length; i < places; i += 1) cells.push(`B-${i}`);
    return cells;
  }, [rawA.digits.length, rawB.digits.length, places]);

  const allZerosFilled = emptyCells.every((cell) => zeros.has(cell));

  /** Kolumny w kolejności skanowania: najpierw jedności, potem rzędy po przecinku. */
  const scanColumns = useMemo(
    () => ['whole', ...Array.from({ length: places }, (_, i) => i)] as const,
    [places]
  );
  const diff = firstDifferingPlace(rawA, rawB);
  /** Ile odsłon trzeba, żeby rozstrzygający rząd był już widoczny (i wtedy stop). */
  const stopAt =
    diff === null
      ? scanColumns.length
      : (diff.section === 'whole' ? 0 : diff.place + 1) + 1;
  const scanDone = revealed >= stopAt;
  const sign = comparisonSign(rawA, rawB);

  const goToNextPair = () => {
    if (pairIndex + 1 < PAIRS.length) {
      setPairIndex((i) => i + 1);
      setStage('raw');
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
        <h3 className="mb-2 text-xl font-bold">Znasz już regułę porównywania</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Wyrównaj przecinki, dopisz zera do równej liczby miejsc, a potem porównuj rzędy od lewej —
          pierwszy rząd, który się różni, rozstrzyga. Liczba cyfr po przecinku niczego nie mówi.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {/* Kropki par */}
      <div className="mb-4 flex items-center gap-2">
        {PAIRS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= pairIndex ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {pairIndex + 1}/{PAIRS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pairIndex}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-4 text-center text-base font-bold leading-snug sm:text-lg">
            Która liczba jest większa?
          </p>

          {stage === 'raw' ? (
            <>
              <div className="mb-6 flex items-center justify-center gap-4">
                <DecimalNumeral value={rawA} color={color} className="text-3xl sm:text-4xl" />
                <span className="text-2xl font-black text-muted-foreground" aria-hidden>
                  ?
                </span>
                <DecimalNumeral value={rawB} color={color} className="text-3xl sm:text-4xl" />
              </div>
              <p className="mb-4 text-center text-sm text-muted-foreground">
                Zapisy mają różną długość — najpierw ustaw je jeden pod drugim, przecinek pod
                przecinkiem.
              </p>
              <div className="flex justify-center">
                <Button onClick={() => setStage('zeros')} className="gap-2">
                  <MoveHorizontal className="h-4 w-4" aria-hidden />
                  Wyrównaj przecinki
                </Button>
              </div>
            </>
          ) : (
            <>
              <PlaceGrid
                color={color}
                places={places}
                a={a}
                b={b}
                ownDigitsA={rawA.digits.length}
                ownDigitsB={rawB.digits.length}
                zeros={zeros}
                stage={stage}
                revealed={revealed}
                scanColumns={scanColumns}
                diff={diff}
                onFillZero={(cell) =>
                  setZeros((prev) => {
                    const next = new Set(prev);
                    next.add(cell);
                    return next;
                  })
                }
              />

              {stage === 'zeros' && (
                <div className="mt-5">
                  {emptyCells.length > 0 ? (
                    <p className="mb-3 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                      <Plus className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                      Kliknij puste pola i dopisz zera, aż obie liczby będą miały tyle samo miejsc po
                      przecinku.
                    </p>
                  ) : (
                    <p className="mb-3 text-center text-sm text-muted-foreground">
                      Obie liczby mają już tyle samo miejsc po przecinku — można skanować rzędy.
                    </p>
                  )}
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setStage('scan')}
                      disabled={!allZerosFilled}
                      className="gap-2"
                    >
                      <ScanLine className="h-4 w-4" aria-hidden />
                      Porównaj rzędy
                    </Button>
                  </div>
                </div>
              )}

              {stage === 'scan' && (
                <div className="mt-5">
                  {!scanDone ? (
                    <div className="flex justify-center">
                      <Button onClick={() => setRevealed((r) => r + 1)} className="gap-2">
                        <ArrowRight className="h-4 w-4" aria-hidden />
                        {revealed === 0
                          ? 'Sprawdź jedności'
                          : `Sprawdź rząd: ${DECIMAL_PLACES[revealed - 1]?.name ?? ''}`}
                      </Button>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                      <div
                        className="flex items-center justify-center gap-3 p-4 text-center"
                        style={{ backgroundColor: `${color}0f` }}
                      >
                        <span className="font-mono text-lg font-bold tabular-nums">
                          {formatDecimal(rawA)}
                        </span>
                        <span className="font-mono text-2xl font-black" style={{ color }}>
                          {sign}
                        </span>
                        <span className="font-mono text-lg font-bold tabular-nums">
                          {formatDecimal(rawB)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {pair.note}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <Button onClick={goToNextPair}>
                          {pairIndex + 1 < PAIRS.length ? (
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
                </div>
              )}
            </>
          )}

          {/* Etykieta stanu — mały licznik kroku wewnątrz pary */}
          <p className="mt-4 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {stage === 'raw' && 'Krok 1 z 3 · wyrównaj'}
            {stage === 'zeros' && 'Krok 2 z 3 · dopisz zera'}
            {stage === 'scan' && 'Krok 3 z 3 · skanuj rzędy'}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface PlaceGridProps {
  color: string;
  places: number;
  a: { whole: number; digits: number[] };
  b: { whole: number; digits: number[] };
  ownDigitsA: number;
  ownDigitsB: number;
  zeros: Set<string>;
  stage: Stage;
  revealed: number;
  scanColumns: readonly (number | 'whole')[];
  diff: ReturnType<typeof firstDifferingPlace>;
  onFillZero: (cell: string) => void;
}

function PlaceGrid({
  color,
  places,
  a,
  b,
  ownDigitsA,
  ownDigitsB,
  zeros,
  stage,
  revealed,
  scanColumns,
  diff,
  onFillZero,
}: PlaceGridProps) {
  const headers = ['jedności', ',', ...DECIMAL_PLACES.slice(0, places).map((p) => p.name)];

  const columnScanState = (col: number | 'whole') => {
    if (stage !== 'scan') return 'idle' as const;
    const order = scanColumns.indexOf(col);
    if (order >= revealed) return 'idle' as const;
    const isDiff =
      diff !== null &&
      ((diff.section === 'whole' && col === 'whole') ||
        (diff.section === 'fraction' && col === diff.place));
    return isDiff ? ('diff' as const) : ('same' as const);
  };

  const renderRow = (
    row: 'A' | 'B',
    value: { whole: number; digits: number[] },
    ownDigits: number
  ) => (
    <div className="flex items-stretch gap-1">
      <Cell state={columnScanState('whole')} color={color}>
        {value.whole}
      </Cell>
      <span className="flex w-4 items-center justify-center text-2xl font-black" style={{ color }} aria-hidden>
        ,
      </span>
      {Array.from({ length: places }, (_, i) => {
        const isOwn = i < ownDigits;
        const cellKey = `${row}-${i}`;
        const filled = isOwn || zeros.has(cellKey);
        const canFill = stage === 'zeros' && !isOwn && !zeros.has(cellKey);

        if (!filled) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => canFill && onFillZero(cellKey)}
              disabled={!canFill}
              aria-label={`Dopisz zero: ${DECIMAL_PLACES[i]?.name ?? ''}`}
              className={cn(
                'flex h-12 w-10 items-center justify-center border-2 border-dashed text-xl font-bold tabular-nums transition-colors sm:h-14 sm:w-12',
                canFill && 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/10'
              )}
              style={{ borderColor: `${color}59`, color }}
            >
              {canFill ? '+' : ''}
            </button>
          );
        }

        return (
          <Cell key={i} state={columnScanState(i)} color={color} muted={!isOwn}>
            {value.digits[i] ?? 0}
          </Cell>
        );
      })}
    </div>
  );

  return (
    <div className="mx-auto w-fit">
      {/* Nagłówki rzędów */}
      <div className="mb-1 flex items-stretch gap-1">
        <HeaderCell>{headers[0]}</HeaderCell>
        <span className="w-4" aria-hidden />
        {headers.slice(2).map((name, i) => (
          <HeaderCell key={i}>{name}</HeaderCell>
        ))}
      </div>
      <div className="space-y-1">
        {renderRow('A', a, ownDigitsA)}
        {renderRow('B', b, ownDigitsB)}
      </div>
    </div>
  );
}

function HeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex w-10 items-end justify-center pb-1 text-center text-[9px] font-bold uppercase leading-tight tracking-wide text-muted-foreground sm:w-12">
      {children}
    </span>
  );
}

function Cell({
  children,
  state,
  color,
  muted = false,
}: {
  children: React.ReactNode;
  state: 'idle' | 'same' | 'diff';
  color: string;
  muted?: boolean;
}) {
  return (
    <span
      className={cn(
        'flex h-12 w-10 items-center justify-center border font-mono text-xl font-bold tabular-nums transition-colors sm:h-14 sm:w-12 sm:text-2xl',
        state === 'same' && 'border-muted-foreground/40 bg-muted/50 text-muted-foreground',
        state === 'diff' && 'border-2',
        muted && state === 'idle' && 'text-muted-foreground'
      )}
      style={
        state === 'diff'
          ? { borderColor: color, backgroundColor: `${color}1f`, color }
          : state === 'idle'
            ? { borderColor: `${color}33` }
            : undefined
      }
    >
      {children}
    </span>
  );
}
