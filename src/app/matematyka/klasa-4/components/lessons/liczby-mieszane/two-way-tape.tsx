'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { SliceWedge, WholePie } from './mixed-pieces';
import { buildMixedTape, formatMixed } from '../../../lib/mixed-number';

export interface TapeExample {
  id: string;
  licznik: number;
  mianownik: number;
  /** Jednozdaniowa historyjka nad taśmą — skąd wziął się ten ułamek niewłaściwy. */
  story: string;
  noun: string;
}

interface TwoWayTapeProps {
  color: string;
  examples: TapeExample[];
  onComplete?: () => void;
}

/**
 * Przykład, który da się **przewinąć w obie strony**. Taśma to gotowe
 * rozwiązanie rozłożone na klatki (`buildMixedTape`), a dziecko przesuwa po
 * niej głowicę: w prawo kolejne `mianownik` kawałków składa się w całość
 * (ułamek niewłaściwy → liczba mieszana), w lewo ta sama całość rozbija się
 * z powrotem (liczba mieszana → ułamek niewłaściwy). Opis kroku podmienia
 * się na swoją odwrotność zależnie od kierunku ruchu.
 *
 * Nowość: to pierwszy widżet w kursie, w którym rozpisane rozwiązanie da się
 * puścić WSTECZ. Wszystkie dotychczasowe sekwencje są jednokierunkowe
 * i addytywne (`CalculationCascade` kumuluje kroki, `RoundingMachine`
 * odtwarza regułę kolumna po kolumnie) — tu odwrócenie kierunku jest samą
 * treścią nauczaną, bo obie zamiany to dosłownie ta sama droga.
 *
 * Dlatego bramka nie kończy się na dojściu do końca: przykład zalicza się
 * dopiero po powrocie na początek taśmy.
 */
export function TwoWayTape({ color, examples, onComplete }: TwoWayTapeProps) {
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState(0);
  const [reachedEnd, setReachedEnd] = useState(false);
  /** Ostatni przebyty krok — decyduje, czy pokazać opis „w przód”, czy jego odwrotność. */
  const [lastMove, setLastMove] = useState<{ transition: number; direction: 'forward' | 'back' } | null>(null);
  const containerRef = useSectionScrollAnchor(index);

  const example = examples[index] ?? examples[examples.length - 1];
  const isLast = index === examples.length - 1;
  const tape = useMemo(() => buildMixedTape(example.licznik, example.mianownik), [example.licznik, example.mianownik]);

  const frame = tape.frames[pos];
  const atEnd = pos === tape.frames.length - 1;
  const atStart = pos === 0;
  const done = reachedEnd && atStart;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const step = (direction: 'forward' | 'back') => {
    if (direction === 'forward') {
      if (atEnd) return;
      setLastMove({ transition: pos, direction: 'forward' });
      setPos(pos + 1);
      if (pos + 1 === tape.frames.length - 1) setReachedEnd(true);
      return;
    }
    if (atStart) return;
    setLastMove({ transition: pos - 1, direction: 'back' });
    setPos(pos - 1);
  };

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      setPos(0);
      setReachedEnd(false);
      setLastMove(null);
      return;
    }
    onComplete?.();
  };

  if (index >= examples.length) return null;

  const caption = lastMove ? tape.transitions[lastMove.transition][lastMove.direction] : null;

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {examples.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{examples.length}
        </span>
      </div>

      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        Przykład do przewinięcia w obie strony
      </p>
      <p className="mb-5 text-sm leading-relaxed sm:text-base">{example.story}</p>

      {/* Scena: całości i luźne kawałki w bieżącej klatce */}
      <div className="flex min-h-[120px] flex-wrap items-center justify-center gap-3 border p-4" style={{ borderColor: `${color}33` }}>
        <AnimatePresence mode="popLayout">
          {Array.from({ length: frame.wholes }, (_, i) => (
            <motion.div
              key={`w-${i}`}
              layout
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="w-16 sm:w-20"
            >
              <WholePie color={color} mianownik={example.mianownik} label={`Cała ${example.noun}`} />
            </motion.div>
          ))}
          {Array.from({ length: frame.parts }, (_, i) => (
            <motion.div
              key={`p-${i}`}
              layout
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <SliceWedge color={color} mianownik={example.mianownik} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Taśma: klatki na osi + głowica */}
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => step('back')}
          disabled={atStart}
          aria-label="Rozłóż całość z powrotem na kawałki"
          className="flex h-11 shrink-0 items-center gap-1 border-2 px-2.5 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:-translate-y-0.5"
          style={{ borderColor: `${color}55`, color }}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
          Rozłóż
        </button>

        <div className="relative flex flex-1 items-center justify-between">
          <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2" style={{ backgroundColor: `${color}33` }} aria-hidden />
          {tape.frames.map((_, i) => (
            <span
              key={i}
              className={cn('relative h-4 w-4 rounded-full border-2 transition-all', i === pos && 'scale-150')}
              style={{ borderColor: color, backgroundColor: i <= pos ? color : 'var(--background)' }}
              aria-hidden
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => step('forward')}
          disabled={atEnd}
          aria-label="Złóż kolejne kawałki w całość"
          className="flex h-11 shrink-0 items-center gap-1 border-2 px-2.5 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:-translate-y-0.5"
          style={{ borderColor: `${color}55`, color }}
        >
          Złóż
          <ChevronRight className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {/* Odczyt bieżącej klatki + opis ostatniego kroku */}
      <div className="mt-4 text-center">
        <p className="font-mono text-2xl font-black tabular-nums sm:text-3xl" style={{ color }}>
          {frame.reading}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Cokolwiek zrobisz, kawałków jest tyle samo — zmienia się tylko to, ile z nich jest już złożonych.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {caption && (
          <motion.p
            key={`${lastMove?.transition}-${lastMove?.direction}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 border-l-2 py-2 pl-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            {caption}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Bramka: koniec taśmy, a potem powrót na start */}
      <ol className="mt-5 grid gap-2 border p-4 sm:grid-cols-2" style={{ borderColor: `${color}33` }}>
        <GateRow done={reachedEnd} text={`Złóż wszystko do końca: ${example.licznik}/${example.mianownik} = ${formatMixed(tape.target)}`} color={color} />
        <GateRow done={done} text={`Wróć na początek: ${formatMixed(tape.target)} = ${example.licznik}/${example.mianownik}`} color={color} />
      </ol>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex flex-wrap items-center justify-between gap-4 bg-emerald-50 p-4 dark:bg-emerald-950/40"
        >
          <p className="flex max-w-2xl items-start gap-2 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            <span>
              Przeszedłeś tę samą drogę tam i z powrotem. W prawo dzielisz {example.licznik} przez {example.mianownik} i patrzysz
              na resztę, w lewo mnożysz {tape.target.whole} przez {example.mianownik} i dodajesz {tape.target.licznik}. To dwa opisy
              jednego ruchu, nie dwie osobne reguły do zapamiętania.
            </span>
          </p>
          <Button onClick={next} style={{ backgroundColor: color }} className="gap-1.5 text-white hover:opacity-90">
            {isLast ? 'Do ćwiczeń' : 'Kolejny przykład'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function GateRow({ done, text, color }: { done: boolean; text: string; color: string }) {
  return (
    <li className="flex items-start gap-2 text-sm leading-relaxed">
      <span
        className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border-2 transition-colors')}
        style={{ borderColor: done ? '#10b981' : `${color}55`, backgroundColor: done ? '#10b981' : 'transparent' }}
        aria-hidden
      >
        {done && <Check className="h-3.5 w-3.5 text-white" />}
      </span>
      <span className={cn(!done && 'text-muted-foreground')}>{text}</span>
    </li>
  );
}
