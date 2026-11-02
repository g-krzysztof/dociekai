'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { FractionNotation } from '../../fraction-notation';
import { FractionBarGlyph, filledEdgeRatio } from '../../fraction-bar-glyph';
import { round } from '../../../lib/lines';

export type CompareSign = '<' | '=' | '>';

export interface DuelSide {
  licznik: number;
  mianownik: number;
  /** Kto/co reprezentuje ten ułamek w narracji rundy — np. „Ala”, „Tabliczka Oli”. */
  name: string;
}

export interface DuelRound {
  id: string;
  label: string;
  left: DuelSide;
  right: DuelSide;
  /** Zdanie wyjaśniające, którą regułą to rozstrzygnąć — pokazywane po trafieniu. */
  note: string;
  /** Runda „z samej reguły": paski pojawiają się dopiero jako sprawdzenie odpowiedzi. */
  withoutBars?: boolean;
}

const SIGNS: CompareSign[] = ['<', '=', '>'];

function compareSign(left: DuelSide, right: DuelSide): CompareSign {
  const a = left.licznik * right.mianownik;
  const b = right.licznik * left.mianownik;
  if (a < b) return '<';
  if (a > b) return '>';
  return '=';
}

function fillSet(licznik: number): Set<number> {
  return new Set(Array.from({ length: licznik }, (_, i) => i));
}

interface FractionDuelProps {
  color: string;
  rounds: DuelRound[];
  /** Krótka etykieta nad rundą — odróżnia dwie narracje tego samego widżetu. */
  kicker: string;
  onComplete?: () => void;
}

/**
 * Pojedynek dwóch ułamków: dziecko wstawia znak `<`, `=` lub `>` między nimi.
 * Paski (`FractionBarGlyph`) są modelem, po którym można to odczytać — a po
 * trafieniu obie długości dostają wspólną kreskę porównania na krawędzi
 * KRÓTSZEGO paska (`filledEdgeRatio`, ta sama geometria co same odcinki), więc
 * „o ile więcej" przestaje być domysłem i staje się widoczną nadwyżką.
 *
 * Runda z `withoutBars` chowa rysunek do czasu odpowiedzi — to samo pytanie,
 * ale rozstrzygane z reguły, a paski wracają jako sprawdzenie. Błędny znak nie
 * blokuje rundy (shake + kolejna próba), zgodnie z zasadą „żaden klik nie jest
 * złym kliknięciem".
 *
 * Reużywany w dwóch narracjach lekcji — budowanie reguł (Nowe pojęcie) i
 * podwieczorek u babci (Zadanie problemowe) — ten sam wzorzec co
 * `MoneyPurse`/`AngleBuilder`/`FractionLineLab`.
 */
export function FractionDuel({ color, rounds, kicker, onComplete }: FractionDuelProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<CompareSign | null>(null);
  const [solved, setSolved] = useState(false);
  const [wrongKey, setWrongKey] = useState(0);
  const containerRef = useSectionScrollAnchor(index);

  const roundData = rounds[index] ?? rounds[rounds.length - 1];
  const isLast = index === rounds.length - 1;
  const correct = compareSign(roundData.left, roundData.right);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const leftEdge = filledEdgeRatio(roundData.left.licznik, roundData.left.mianownik);
  const rightEdge = filledEdgeRatio(roundData.right.licznik, roundData.right.mianownik);
  const shortEdge = Math.min(leftEdge, rightEdge);
  const longEdge = Math.max(leftEdge, rightEdge);
  const showBars = !roundData.withoutBars || solved;

  const choose = (sign: CompareSign) => {
    if (solved) return;
    setPicked(sign);
    if (sign === correct) {
      setSolved(true);
      return;
    }
    setWrongKey((prev) => prev + 1);
  };

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setPicked(null);
      setSolved(false);
      return;
    }
    onComplete?.();
  };

  if (index >= rounds.length) return null;

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

      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        {kicker}
      </p>
      <p className="mb-5 text-sm font-semibold leading-relaxed sm:text-base">{roundData.label}</p>

      {/* Paski — model, po którym da się odczytać odpowiedź */}
      {showBars ? (
        <div className="mb-6 space-y-4">
          {[roundData.left, roundData.right].map((side, i) => {
            const edge = i === 0 ? leftEdge : rightEdge;
            const isLonger = solved && edge === longEdge && longEdge !== shortEdge;
            return (
              <div key={`${side.name}-${i}`}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="text-sm font-semibold" style={{ color: textColor }}>
                    {side.name}
                  </span>
                  <span className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
                    {side.licznik}/{side.mianownik}
                  </span>
                </div>
                <div className="relative">
                  <FractionBarGlyph
                    color={color}
                    mianownik={side.mianownik}
                    filled={fillSet(side.licznik)}
                    ariaLabel={`${side.name}: pasek podzielony na ${side.mianownik} równych części, zamalowane ${side.licznik}`}
                  />
                  {solved && (
                    <>
                      {isLonger && (
                        <motion.span
                          aria-hidden
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="pointer-events-none absolute inset-y-0 border-y-2 border-r-2 border-emerald-600"
                          style={{
                            left: `${round(shortEdge * 100)}%`,
                            width: `${round((longEdge - shortEdge) * 100)}%`,
                            // Kreskowanie zamiast wypełnienia: półprzezroczysta zieleń na
                            // pomarańczowym pasku dawała brudną oliwkę, a nie „nadwyżkę".
                            backgroundImage:
                              'repeating-linear-gradient(45deg, rgba(255,255,255,0.72) 0 5px, rgba(255,255,255,0) 5px 11px)',
                          }}
                        />
                      )}
                      <motion.span
                        aria-hidden
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pointer-events-none absolute inset-y-0 border-l-2 border-dashed border-emerald-600"
                        style={{ left: `${round(shortEdge * 100)}%` }}
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="mb-6 flex items-center justify-center gap-2 border-2 border-dashed p-5 text-sm text-muted-foreground"
          style={{ borderColor: `${color}40` }}
        >
          <EyeOff className="h-4 w-4 shrink-0" aria-hidden />
          Tym razem bez rysunku — rozstrzygnij z samej reguły. Paski pokażą się jako sprawdzenie.
        </div>
      )}

      {/* Wyrażenie ze slotem na znak */}
      <motion.div
        key={`expr-${index}-${picked !== null && !solved ? wrongKey : 'calm'}`}
        animate={picked !== null && !solved ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-center gap-5 sm:gap-7"
      >
        <FractionNotation
          licznik={roundData.left.licznik}
          mianownik={roundData.left.mianownik}
          color={color}
          licznikRevealed
          mianownikRevealed
          size="md"
        />
        <span
          className={cn(
            'flex h-14 w-14 items-center justify-center border-2 font-mono text-3xl font-black leading-none',
            solved ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200' : 'text-muted-foreground'
          )}
          style={solved ? undefined : { borderColor: `${color}40` }}
          aria-live="polite"
        >
          {solved ? correct : (picked ?? '?')}
        </span>
        <FractionNotation
          licznik={roundData.right.licznik}
          mianownik={roundData.right.mianownik}
          color={color}
          licznikRevealed
          mianownikRevealed
          size="md"
        />
      </motion.div>

      <div className="mt-5 flex justify-center gap-3">
        {SIGNS.map((sign) => (
          <button
            key={sign}
            type="button"
            onClick={() => choose(sign)}
            disabled={solved}
            aria-label={sign === '<' ? 'mniejszy niż' : sign === '>' ? 'większy niż' : 'równy'}
            className={cn(
              'h-14 w-16 border-2 font-mono text-2xl font-black transition-all disabled:cursor-not-allowed',
              !solved && 'hover:-translate-y-0.5 hover:shadow-md',
              solved && sign === correct && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
              solved && sign !== correct && 'opacity-40'
            )}
            style={solved && sign === correct ? undefined : { borderColor: `${color}55`, color }}
          >
            {sign}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {picked !== null && !solved && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center text-sm leading-relaxed text-muted-foreground"
          >
            Jeszcze nie ten znak. Ostry koniec znaku zawsze wskazuje mniejszy ułamek — spróbuj raz jeszcze.
          </motion.p>
        )}
      </AnimatePresence>

      {solved && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex flex-wrap items-center justify-between gap-4 bg-emerald-50 p-4 dark:bg-emerald-950/40"
        >
          <p className="flex max-w-2xl items-start gap-2 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            <span>{roundData.note}</span>
          </p>
          <Button onClick={next} style={{ backgroundColor: color }} className="gap-1.5 text-white hover:opacity-90">
            {isLast ? 'Dalej' : 'Kolejny pojedynek'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
