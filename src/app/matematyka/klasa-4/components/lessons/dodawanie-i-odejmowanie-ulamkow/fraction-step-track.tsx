'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, MoveHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FractionBarGlyph, filledEdgeRatio } from '../../fraction-bar-glyph';
import { MiniFraction } from '../../mini-fraction';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { toMixed, formatMixed } from '../../../lib/mixed-number';

export interface TrackRound {
  id: string;
  mianownik: number;
  /** Licznik, od którego zaczyna krawędź zamalowania. */
  start: number;
  /** Licznik, do którego trzeba dojechać, żeby runda się zaliczyła. */
  target: number;
  label: string;
  note: string;
}

interface TrackMove {
  from: number;
  to: number;
}

interface FractionStepTrackProps {
  color: string;
  rounds: TrackRound[];
  onComplete?: () => void;
}

/**
 * Odwrócony kierunek: dziecko nie dostaje działania do policzenia, tylko
 * przesuwa krawędź zamalowanego paska — a widżet zapisuje ten ruch jako zdanie
 * matematyczne. Gest jest źródłem, notacja skutkiem, nie odwrotnie.
 *
 * Krawędź zatrzaskuje się wyłącznie na kreskach podziału, więc mianownik jest
 * fizycznie nie do ruszenia: jedyne, co da się zmienić, to ile kawałków jest
 * zamalowanych. Właśnie to widżet ma udowodnić — przy dodawaniu i odejmowaniu
 * ułamków o jednakowych mianownikach zmienia się tylko licznik.
 *
 * Zatrzask liczony z `filledEdgeRatio`, nie z proporcji `licznik/mianownik` —
 * przerwy między odcinkami przesuwają krawędź i uchwyt musi lądować dokładnie
 * tam, gdzie kończy się kolor (ta sama zasada co nakładka w `FractionDuel`).
 */
export function FractionStepTrack({ color, rounds, onComplete }: FractionStepTrackProps) {
  const [index, setIndex] = useState(0);
  const [licznik, setLicznik] = useState(rounds[0].start);
  const [moves, setMoves] = useState<TrackMove[]>([]);
  const [dragging, setDragging] = useState(false);
  const [finished, setFinished] = useState(false);
  const reducedMotion = useReducedMotion();
  const dragFrom = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = rounds[index];
  const isLast = index === rounds.length - 1;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const reached = licznik === round.target && moves.length > 0;
  const mixed = toMixed(licznik, round.mianownik);
  /** Delikatne kiwnięcie gałki, dopóki dziecko jej nie ruszyło — to ono mówi „mnie się przeciąga”. */
  const nudge = !reducedMotion && !dragging && moves.length === 0;

  /** Najbliższa kreska podziału do pozycji wskaźnika — po tej samej geometrii, po której rysuje się pasek. */
  const snapTo = (clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return licznik;
    const ratio = (clientX - rect.left) / rect.width;
    let best = 0;
    let bestDistance = Infinity;
    for (let k = 0; k <= round.mianownik; k++) {
      const distance = Math.abs(filledEdgeRatio(k, round.mianownik) - ratio);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = k;
      }
    }
    return best;
  };

  const registerMove = (from: number, to: number) => {
    if (from === to) return;
    setMoves((prev) => [...prev, { from, to }]);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reached) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragFrom.current = licznik;
    setDragging(true);
    setLicznik(snapTo(event.clientX));
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setLicznik(snapTo(event.clientX));
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const from = dragFrom.current;
    dragFrom.current = null;
    if (from !== null) registerMove(from, licznik);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (reached) return;
    const step = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const next = Math.min(round.mianownik, Math.max(0, licznik + step));
    if (next === licznik) return;
    setLicznik(next);
    registerMove(licznik, next);
  };

  const restart = () => {
    setLicznik(round.start);
    setMoves([]);
  };

  const next = () => {
    if (!isLast) {
      const upcoming = rounds[index + 1];
      setIndex(index + 1);
      setLicznik(upcoming.start);
      setMoves([]);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  const filled = new Set(Array.from({ length: licznik }, (_, i) => i));
  const edge = filledEdgeRatio(licznik, round.mianownik);
  const targetEdge = filledEdgeRatio(round.target, round.mianownik);

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {rounds.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{rounds.length}
        </span>
      </div>

      {finished ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 p-5 text-center dark:bg-emerald-950/40">
          <Check className="mx-auto mb-2 h-8 w-8 text-emerald-600" aria-hidden />
          <p className="text-base font-bold text-emerald-900 dark:text-emerald-100">Za każdym razem ruszał się tylko licznik</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
            Krawędź zatrzymywała się wyłącznie na kreskach, bo kawałki nie zmieniają wielkości. Dlatego przy jednakowych
            mianownikach dodaje się i odejmuje same liczniki, a mianownik przepisuje się bez zmian.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={round.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <p className="mb-4 text-sm leading-relaxed sm:text-base">{round.label}</p>

            {/* Tor: pasek + cel + przeciągany uchwyt na krawędzi zamalowania */}
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: textColor }}>
                Mianownik {round.mianownik} — nie do ruszenia
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                Cel: {round.target}/{round.mianownik}
              </span>
            </div>

            <p className="mb-1 text-center text-sm font-semibold" style={{ color: textColor }}>
              Chwyć uchwyt <MoveHorizontal className="inline h-4 w-4 align-text-bottom" aria-hidden /> i przeciągnij go w
              lewo albo w prawo.
            </p>

            {/*
              Pionowe `py-10` jest tu funkcjonalne, nie kosmetyczne: uchwyt rysuje się NAD paskiem,
              a to ten kontener łapie zdarzenia wskaźnika. Bez zapasu wysokości gałka wisiałaby poza
              jego prostokątem i nie dałoby się jej złapać myszką (dokładnie ten błąd był tu wcześniej).
            */}
            <div
              ref={trackRef}
              role="slider"
              tabIndex={0}
              aria-label={`Krawędź zamalowania paska podzielonego na ${round.mianownik} równych części`}
              aria-valuemin={0}
              aria-valuemax={round.mianownik}
              aria-valuenow={licznik}
              aria-valuetext={`${licznik} z ${round.mianownik}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onKeyDown={handleKeyDown}
              className="relative mx-auto max-w-md touch-none select-none py-10 outline-none focus-visible:ring-2"
              style={{ cursor: reached ? 'default' : 'ew-resize' }}
            >
              <div className="relative">
                <FractionBarGlyph
                  color={color}
                  mianownik={round.mianownik}
                  filled={filled}
                  ariaLabel={`Pasek podzielony na ${round.mianownik} równych części, zamalowane ${licznik}`}
                />

                {/* Znacznik celu — kreska pod paskiem z podpisem, żeby nie zlewał się z uchwytem nad paskiem */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-0 h-[calc(100%+1.25rem)] border-l-2 border-dashed"
                  style={{ left: `${targetEdge * 100}%`, borderColor: `${color}99` }}
                >
                  <span
                    className="absolute -bottom-1 left-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: `${color}cc` }}
                  >
                    cel
                  </span>
                </span>

                {/* Uchwyt: pionowa oś + duża, pełna gałka nad paskiem */}
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute -top-1 h-[calc(100%+0.5rem)] w-1"
                  /* Obwódka w kolorze tła, żeby oś uchwytu była widoczna także na zamalowanej połowie paska. */
                  style={{ backgroundColor: color, boxShadow: '0 0 0 2px var(--background)' }}
                  animate={{ left: `${edge * 100}%` }}
                  transition={{ type: 'tween', duration: dragging ? 0 : 0.15 }}
                >
                  <motion.span
                    className="absolute -top-9 left-1/2 flex h-8 w-11 -translate-x-1/2 items-center justify-center border-2 shadow-md"
                    style={{ backgroundColor: color, borderColor: color }}
                    animate={nudge ? { y: [0, -3, 0] } : { y: 0 }}
                    transition={nudge ? { duration: 1.1, repeat: Infinity, repeatDelay: 0.9, ease: 'easeInOut' } : { duration: 0.15 }}
                  >
                    <MoveHorizontal className="h-5 w-5 text-white" aria-hidden />
                  </motion.span>
                </motion.span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Możesz też kliknąć w dowolne miejsce paska albo przesuwać krawędź strzałkami na klawiaturze. Jeździć wolno
              w obie strony, ile chcesz.
            </p>

            {/* Odczyt bieżącej wartości */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 border p-3" style={{ borderColor: `${color}33` }}>
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Teraz na pasku</span>
              <MiniFraction licznik={licznik} mianownik={round.mianownik} color={color} />
              {mixed.whole > 0 && (
                <span className="text-xs text-muted-foreground">= {formatMixed(mixed)}</span>
              )}
            </div>

            {/* Zapis ruchów — to, co widżet napisał za dziecko */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: textColor }}>
                Twoje ruchy zapisane działaniem
              </p>
              {moves.length === 0 ? (
                <p className="border border-dashed p-3 text-center text-sm text-muted-foreground" style={{ borderColor: `${color}40` }}>
                  Jeszcze pusto — przesuń krawędź, a działanie dopisze się samo.
                </p>
              ) : (
                <ol className="divide-y border">
                  {moves.map((move, i) => {
                    const delta = move.to - move.from;
                    return (
                      <li key={`${move.from}-${move.to}-${i}`} className="flex flex-wrap items-center gap-2 px-4 py-2 text-sm">
                        <MiniFraction licznik={move.from} mianownik={round.mianownik} size="sm" />
                        <span className="font-mono font-bold" style={{ color: textColor }}>
                          {delta > 0 ? '+' : '−'}
                        </span>
                        <MiniFraction licznik={Math.abs(delta)} mianownik={round.mianownik} size="sm" />
                        <span className="font-mono font-bold">=</span>
                        <MiniFraction licznik={move.to} mianownik={round.mianownik} size="sm" color={color} />
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <Button variant="ghost" size="sm" onClick={restart} className="gap-2">
                <RotateCcw className="h-4 w-4" aria-hidden />
                Zacznij rundę od nowa
              </Button>
              {reached && (
                <Button onClick={next} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
                  {isLast ? 'Do przykładów' : 'Następna runda'}
                </Button>
              )}
            </div>

            {reached && (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {round.note}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
