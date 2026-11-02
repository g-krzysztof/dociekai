'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Hammer, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { FractionPie } from '../../fraction-pie';
import { FractionNotation } from '../../fraction-notation';
import { SliceWedge } from './mixed-pieces';
import { toMixed } from '../../../lib/mixed-number';

export interface PackRound {
  id: string;
  /** `pack` — składamy luźne części w całości; `unpack` — rozbijamy całości z powrotem. */
  direction: 'pack' | 'unpack';
  label: string;
  /** Licznik ułamka niewłaściwego, od którego (albo do którego) idziemy. */
  licznik: number;
  mianownik: number;
  /** Rzeczownik na jedną całość w tej narracji, w liczbie pojedynczej i mnogiej — „tort”/„torty”. */
  noun: string;
  nounPlural: string;
  note: string;
}

interface WholePackBoardProps {
  color: string;
  rounds: PackRound[];
  onComplete?: () => void;
}

/**
 * Flagowy mechanizm lekcji o liczbach mieszanych: **pojemnik, który domyka
 * się sam po napełnieniu i zamienia w inną reprezentację**. Luźne kawałki
 * (każdy 1/`mianownik`) wędrują klikiem do pudełka; gdy zbierze się ich
 * `mianownik`, pudełko zatrzaskuje się w jedną CAŁOŚĆ — i to jest dokładnie
 * ta operacja, którą zapisujemy jako zamianę ułamka niewłaściwego na liczbę
 * mieszaną. `direction: 'unpack'` puszcza ten sam mechanizm od tyłu: klik
 * w gotową całość rozbija ją z powrotem na `mianownik` luźnych kawałków.
 *
 * Nowość względem biblioteki: żaden dotychczasowy widżet nie ma pojemnika
 * o POJEMNOŚCI, który po zapełnieniu przestaje być zbiorem elementów i staje
 * się jednym obiektem (`DealerBoard` rozdaje round-robin, ale kubełki nigdy
 * się nie domykają; `PeelBoard` przenosi te same żetony między kontenerami,
 * ale ich nie scala).
 *
 * Zasada „żaden klik nie jest złym kliknięciem”: nie da się tu kliknąć
 * źle — każdy klik posuwa rundę w jedyną sensowną stronę, a licznik u dołu
 * cały czas pokazuje obie nazwy tej samej liczby.
 */
export function WholePackBoard({ color, rounds, onComplete }: WholePackBoardProps) {
  const [index, setIndex] = useState(0);
  /** W trybie `pack`: ile kawałków już schowano. W trybie `unpack`: ile całości już rozbito. */
  const [moved, setMoved] = useState(0);
  const containerRef = useSectionScrollAnchor(index);

  const round = rounds[index] ?? rounds[rounds.length - 1];
  const isLast = index === rounds.length - 1;
  const target = toMixed(round.licznik, round.mianownik);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  /** Ile pełnych całości i ile luźnych kawałków widać w tej chwili. */
  const packing = round.direction === 'pack';
  const wholesDone = packing ? Math.floor(moved / round.mianownik) : target.whole - moved;
  const looseCount = packing ? round.licznik - moved : target.licznik + moved * round.mianownik;
  const inOpenBox = packing ? moved % round.mianownik : 0;
  /** Kawałki, które nie są (jeszcze) częścią domkniętej całości — na tacy albo w otwartym pudełku. */
  const restCount = inOpenBox + looseCount;
  const improperCount = wholesDone * round.mianownik + restCount;

  const totalMoves = packing ? round.licznik : target.whole;
  const finished = moved >= totalMoves;
  /** Otwarte pudełko znika dopiero wtedy, gdy naprawdę jest puste — inaczej reszta kawałków zniknęłaby z rysunku. */
  const showOpenBox = packing && (!finished || inOpenBox > 0);

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      setMoved(0);
      return;
    }
    onComplete?.();
  };

  if (index >= rounds.length) return null;

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {rounds.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{rounds.length}
        </span>
      </div>

      <p className="mb-5 text-sm font-semibold leading-relaxed sm:text-base">{round.label}</p>

      {/* Pełne całości + pudełko w trakcie napełniania */}
      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: textColor }}>
        <PackageCheck className="h-4 w-4" aria-hidden />
        Całe {round.nounPlural}
      </div>

      <div className="flex min-h-[92px] flex-wrap items-center gap-3 border p-3" style={{ borderColor: `${color}33` }}>
        <AnimatePresence mode="popLayout">
          {Array.from({ length: wholesDone }, (_, i) => (
            <motion.button
              key={`whole-${i}`}
              layout
              type="button"
              initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              onClick={() => !packing && !finished && setMoved(moved + 1)}
              disabled={packing || finished}
              aria-label={`Cała ${round.noun}${packing ? '' : ' — kliknij, żeby rozbić na kawałki'}`}
              className={cn(
                'w-16 transition-transform sm:w-20',
                !packing && !finished && 'cursor-pointer hover:-translate-y-1',
                (packing || finished) && 'cursor-default'
              )}
            >
              <FractionPie
                color={color}
                mianownik={round.mianownik}
                filled={new Set(Array.from({ length: round.mianownik }, (_, s) => s))}
                ariaLabel={`Cała ${round.noun}`}
              />
            </motion.button>
          ))}

          {/* Pudełko w trakcie napełniania — widoczne tylko przy składaniu */}
          {showOpenBox && (
            <motion.div key="open-box" layout className="w-16 sm:w-20" style={{ opacity: inOpenBox === 0 ? 0.55 : 1 }}>
              <FractionPie
                color={color}
                mianownik={round.mianownik}
                filled={new Set(Array.from({ length: inOpenBox }, (_, s) => s))}
                ariaLabel={`Pudełko w trakcie napełniania: ${inOpenBox} z ${round.mianownik} kawałków`}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {wholesDone === 0 && !showOpenBox && (
          <p className="text-sm text-muted-foreground">Ani jednej całej — same luźne kawałki.</p>
        )}
      </div>

      {/* Taca z luźnymi kawałkami */}
      <div className="mt-4 mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: textColor }}>
        <Hammer className="h-4 w-4" aria-hidden />
        Luźne kawałki po 1/{round.mianownik}
      </div>

      <div className="flex min-h-[76px] flex-wrap items-center gap-2 border p-3" style={{ borderColor: `${color}33` }}>
        <AnimatePresence mode="popLayout">
          {Array.from({ length: looseCount }, (_, i) => (
            <motion.button
              key={`loose-${i}`}
              layout
              type="button"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              onClick={() => packing && !finished && setMoved(moved + 1)}
              disabled={!packing || finished}
              aria-label={`Kawałek 1/${round.mianownik}${packing && !finished ? ' — kliknij, żeby włożyć do pudełka' : ''}`}
              className={cn(
                'transition-transform',
                packing && !finished && 'cursor-pointer hover:-translate-y-1',
                (!packing || finished) && 'cursor-default'
              )}
            >
              <SliceWedge color={color} mianownik={round.mianownik} />
            </motion.button>
          ))}
        </AnimatePresence>

        {looseCount === 0 && <p className="text-sm text-muted-foreground">Taca pusta — wszystkie kawałki są już w całościach.</p>}
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        {packing
          ? `Kliknij kawałek, żeby przełożyć go do pudełka. Pudełko mieści dokładnie ${round.mianownik} kawałków — gdy się zapełni, zatrzaskuje się w jedną całość.`
          : `Kliknij całą ${round.noun}, żeby rozkroić ją z powrotem na ${round.mianownik} kawałków.`}
      </p>

      {/* Dwie nazwy tej samej liczby, na żywo */}
      <div className="mt-5 grid items-center gap-4 border p-4 sm:grid-cols-[1fr_auto_1fr]" style={{ borderColor: `${color}33` }}>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Same kawałki</span>
          <FractionNotation licznik={improperCount} mianownik={round.mianownik} color={color} size="md" />
        </div>

        <span className="mx-auto font-mono text-3xl font-black" style={{ color }} aria-hidden>
          =
        </span>

        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Całości i reszta</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-4xl font-black leading-none tabular-nums sm:text-5xl" style={{ color }}>
              {wholesDone}
            </span>
            {restCount > 0 && (
              <FractionNotation licznik={restCount} mianownik={round.mianownik} color={color} size="md" />
            )}
          </div>
        </div>
      </div>

      {finished && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex flex-wrap items-center justify-between gap-4 bg-emerald-50 p-4 dark:bg-emerald-950/40"
        >
          <p className="flex max-w-2xl items-start gap-2 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            <span>{round.note}</span>
          </p>
          <Button onClick={next} style={{ backgroundColor: color }} className="gap-1.5 text-white hover:opacity-90">
            {isLast ? 'Dalej' : 'Kolejne zadanie'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Dla czytnika ekranu — pełny stan liczbowy, niezależny od rysunku */}
      <p className="sr-only" aria-live="polite">
        {`Ułamek niewłaściwy: ${improperCount} przez ${round.mianownik}. Liczba mieszana: ${wholesDone} całych i ${restCount} przez ${round.mianownik}.`}
      </p>
    </div>
  );
}
