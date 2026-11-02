'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { RomanOdometer } from '../../roman-odometer';
import { romanChunksOf, type RomanChunk } from '../../../lib/roman';

interface DemoStep {
  chunk: RomanChunk;
  note: string;
}

const DEMO_TARGET = 1994;
const DEMO_CHUNKS = romanChunksOf(DEMO_TARGET);
const DEMO_STEPS: DemoStep[] = [
  {
    chunk: DEMO_CHUNKS[0],
    note: 'Najpierw tysiące: 1994 to jeden tysiąc, więc jeden symbol M.',
  },
  {
    chunk: DEMO_CHUNKS[1],
    note: 'Setki: w 1994 to 9. Zamiast pisać dziewięć C pod rząd, C przed M oznacza „odejmij": 1000 − 100 = 900.',
  },
  {
    chunk: DEMO_CHUNKS[2],
    note: 'Dziesiątki: 9 dziesiątek to XC — X przed C znowu odejmuje: 100 − 10 = 90.',
  },
  {
    chunk: DEMO_CHUNKS[3],
    note: 'Jedności: 4 to IV — I przed V odejmuje: 5 − 1 = 4. Gotowe: MCMXCIV.',
  },
];

interface Candidate {
  symbols: string;
}

interface PracticeRound {
  target: number;
  chunks: RomanChunk[];
  candidates: Candidate[];
  prompt: string;
}

const PRACTICE_ROUNDS: PracticeRound[] = [
  {
    target: 449,
    chunks: romanChunksOf(449),
    candidates: [
      { symbols: 'DC' },
      { symbols: 'CD' },
      { symbols: 'LX' },
      { symbols: 'IX' },
      { symbols: 'XI' },
      { symbols: 'XL' },
    ],
    prompt: 'Zbuduj liczbę 449 — kliknij symbole w kolejności od setek do jedności.',
  },
  {
    target: 2024,
    chunks: romanChunksOf(2024),
    candidates: [
      { symbols: 'XL' },
      { symbols: 'MM' },
      { symbols: 'VI' },
      { symbols: 'M' },
      { symbols: 'IV' },
      { symbols: 'XX' },
    ],
    prompt: 'Zbuduj liczbę 2024 tą samą metodą — od tysięcy do jedności.',
  },
];

interface RomanForgeIntroProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: symbole rzymskie budują liczbę po jednym miejscu dziesiętnym
 * naraz (tysiące, setki, dziesiątki, jedności — jak w zwykłym zapisie), a
 * mechaniczny licznik (`RomanOdometer`) na żywo pokazuje narastającą wartość.
 * Faza 0: pokaz na 1994. Fazy 1–2: dziecko samo dobiera symbole z zestawu
 * z podpuchami, w poprawnej kolejności — bez kary za błąd, tylko czerwony
 * błysk i spróbuj ponownie (ta sama filozofia co w `JumpLine`/`FactTriangle`).
 */
export function RomanForgeIntro({ color, onComplete }: RomanForgeIntroProps) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [revealCount, setRevealCount] = useState(0);
  const [builtCount, setBuiltCount] = useState(0);
  const [usedSymbols, setUsedSymbols] = useState<string[]>([]);
  const [wrongSymbol, setWrongSymbol] = useState<string | null>(null);
  const wrongTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useSectionScrollAnchor(phase);

  useEffect(
    () => () => {
      if (wrongTimeout.current) clearTimeout(wrongTimeout.current);
    },
    []
  );

  const isLastPhase = phase === 2;
  const round = phase > 0 ? PRACTICE_ROUNDS[phase - 1] : null;

  const demoDone = revealCount === DEMO_STEPS.length;
  const builtChunks = round
    ? round.chunks.slice(0, builtCount)
    : DEMO_STEPS.slice(0, revealCount).map((s) => s.chunk);
  const roundSolved = round ? builtCount === round.chunks.length : false;
  const odometerValue = builtChunks.reduce((sum, c) => sum + c.value, 0);
  const tablet = builtChunks.map((c) => c.symbols).join('');
  const lastChunk = builtChunks[builtChunks.length - 1];

  const revealNext = () => setRevealCount((prev) => Math.min(DEMO_STEPS.length, prev + 1));

  const pickCandidate = (symbols: string) => {
    if (!round || roundSolved || usedSymbols.includes(symbols)) return;
    const expected = round.chunks[builtCount];
    if (expected && expected.symbols === symbols) {
      setUsedSymbols((prev) => [...prev, symbols]);
      setBuiltCount((prev) => prev + 1);
      return;
    }
    setWrongSymbol(symbols);
    if (wrongTimeout.current) clearTimeout(wrongTimeout.current);
    wrongTimeout.current = setTimeout(() => setWrongSymbol(null), 500);
  };

  const undoLast = () => {
    if (!round || builtCount === 0) return;
    const removed = round.chunks[builtCount - 1];
    setUsedSymbols((prev) => prev.filter((s) => s !== removed.symbols));
    setBuiltCount((prev) => prev - 1);
  };

  const goNext = () => {
    if (isLastPhase) {
      onComplete?.();
      return;
    }
    setPhase((prev) => (prev + 1) as 0 | 1 | 2);
    setRevealCount(0);
    setBuiltCount(0);
    setUsedSymbols([]);
    setWrongSymbol(null);
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= phase ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {phase + 1}/3
        </span>
      </div>

      <p
        className="mb-1 text-xs font-bold uppercase tracking-[0.15em]"
        style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
      >
        {phase === 0 ? 'Pokaz' : 'Twoja kolej'}
      </p>
      <h3 className="mb-5 text-lg font-bold leading-snug sm:text-xl">
        {phase === 0 ? `Zbudujmy 1994 krok po kroku` : round?.prompt}
      </h3>

      {/* Licznik + rosnący zapis rzymski */}
      <div className="mb-5 flex flex-col items-center gap-4 bg-muted/30 p-5 sm:flex-row sm:justify-center sm:gap-8">
        <RomanOdometer value={odometerValue} color={color} label="wartość" />
        <div
          className="flex min-h-[2.5rem] items-center font-mono text-3xl font-black tracking-wide sm:text-4xl"
          style={{ color }}
        >
          <AnimatePresence mode="popLayout">
            {tablet ? (
              <motion.span
                key={tablet}
                initial={{ opacity: 0, scale: lastChunk?.subtractive ? 0.6 : 0.9 }}
                animate={{ opacity: 1, scale: lastChunk?.subtractive ? [1.2, 1] : 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                {tablet}
              </motion.span>
            ) : (
              <span className="text-2xl text-muted-foreground/40">?</span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {phase === 0 && revealCount > 0 && (
        <motion.p
          key={revealCount}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mb-4 p-3 text-sm leading-relaxed',
            DEMO_STEPS[revealCount - 1].chunk.subtractive
              ? 'border-l-4 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
              : 'bg-muted/40'
          )}
          style={DEMO_STEPS[revealCount - 1].chunk.subtractive ? { borderColor: color } : undefined}
        >
          {DEMO_STEPS[revealCount - 1].note}
        </motion.p>
      )}

      {phase > 0 && round && (
        <>
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            {round.candidates.map(({ symbols }) => {
              const used = usedSymbols.includes(symbols);
              const isWrong = wrongSymbol === symbols;
              return (
                <button
                  key={symbols}
                  type="button"
                  onClick={() => pickCandidate(symbols)}
                  disabled={used}
                  className={cn(
                    'border px-4 py-2 font-mono text-lg font-bold tabular-nums transition-all disabled:cursor-not-allowed sm:text-xl',
                    !used && !isWrong && 'hover:-translate-y-0.5 hover:shadow-md',
                    used &&
                      'border-emerald-500 bg-emerald-50 text-emerald-700 opacity-70 dark:bg-emerald-950/40 dark:text-emerald-300',
                    isWrong &&
                      'animate-pulse border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                  )}
                  style={!used && !isWrong ? { borderColor: `${color}59`, color } : undefined}
                >
                  {used && <Check className="mr-1 inline h-3.5 w-3.5" />}
                  {symbols}
                </button>
              );
            })}
          </div>

          {builtCount > 0 && !roundSolved && (
            <div className="mb-4 flex justify-center">
              <button
                type="button"
                onClick={undoLast}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                <RotateCcw className="h-3 w-3" />
                Cofnij ostatni symbol
              </button>
            </div>
          )}

          {roundSolved && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-emerald-50 p-3 text-center text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
            >
              {tablet} = {round.target}. Dokładnie to samo miejsce-po-miejscu, co przy zwykłych
              liczbach — tylko innymi symbolami.
            </motion.p>
          )}
        </>
      )}

      <div className="flex justify-end">
        {phase === 0 && !demoDone && <Button onClick={revealNext}>Pokaż kolejny symbol</Button>}
        {phase === 0 && demoDone && (
          <Button onClick={goNext} className="gap-1.5">
            Dalej
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        {phase > 0 && roundSolved && (
          <Button onClick={goNext} className="gap-1.5">
            {isLastPhase ? 'Zakończ' : 'Dalej'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
