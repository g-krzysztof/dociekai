'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Scale, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { BalanceScale } from './balance-scale';
import { WeightToken } from './weight-token';
import { WEIGHT_TOKENS } from '../../../lib/mass';

interface Demo {
  id: string;
  leftLabel: string;
  leftGrams: number;
  rightTokenGrams: number;
  rightTokenLabel: string;
  rightCount: number;
  explain: string;
}

const DEMOS: Demo[] = [
  {
    id: 'dag',
    leftLabel: '1 dag',
    leftGrams: 10,
    rightTokenGrams: 1,
    rightTokenLabel: '1 g',
    rightCount: 10,
    explain:
      '10 gramów waży dokładnie tyle samo, co 1 dekagram — dag to po prostu wygodniejszy zapis dla dziesięciu gramów naraz.',
  },
  {
    id: 'kg',
    leftLabel: '1 kg',
    leftGrams: 1000,
    rightTokenGrams: 100,
    rightTokenLabel: '10 dag',
    rightCount: 10,
    explain:
      '1000 gramów, czyli 100 dekagramów, to dokładnie 1 kilogram — trzy różne zapisy tej samej masy.',
  },
];

interface Round {
  id: string;
  targetLabel: string;
  targetGrams: number;
}

const ROUNDS: Round[] = [
  { id: 'r1', targetLabel: '5 dag', targetGrams: 50 },
  { id: 'r2', targetLabel: '3 kg', targetGrams: 3000 },
  { id: 'r3', targetLabel: '120 g', targetGrams: 120 },
  { id: 'r4', targetLabel: '1 kg i 4 dag', targetGrams: 1040 },
];

interface BalanceLabProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: flagowy widget lekcji, `<BalanceScale>` w akcji. Faza demo
 * pokazuje na żywo — nie gotowym tekstem — że 10 g to 1 dag i że 1000 g
 * (czyli 100 dag) to 1 kg, wypełniając prawą szalkę odważnikami aż belka
 * się wypozioma jednym kliknięciem „Zobacz”. Tona zostaje tylko nazwana
 * (zbyt duża, żeby fizycznie zmieściła się na szalce) — jej relacja z kg
 * wraca w kroku Przykłady, na drabince jednostek. Faza ćwiczeniowa
 * odwraca kierunek: dziecko dostaje cel zapisany w dag/kg/g i samo klika
 * odważniki, aż waga się zrówna — dokładnie jak przy prawdziwym ważeniu,
 * z cofnięciem ostatniego odważnika zamiast blokady za złe kliknięcie.
 */
export function BalanceLab({ color, onComplete }: BalanceLabProps) {
  const [stage, setStage] = useState<'demo' | 'practice'>('demo');
  const [demoIndex, setDemoIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  // Dwie fazy (demo, ćwiczenie) mają dwa osobne `return` — hook musi być wywołany
  // bezwarunkowo raz, więc trigger łączy stan obu: zmianę fazy, przykładu w demo
  // (i jego odsłonięcia) oraz rundy w ćwiczeniu (reset szalki z odważnikami).
  const containerRef = useSectionScrollAnchor(`${stage}-${demoIndex}-${revealed}-${roundIndex}`);

  if (stage === 'demo') {
    const demo = DEMOS[demoIndex];
    const isLastDemo = demoIndex === DEMOS.length - 1;
    const rightGrams = revealed ? demo.leftGrams : 0;

    const next = () => {
      if (!isLastDemo) {
        setDemoIndex((i) => i + 1);
        setRevealed(false);
        return;
      }
      setStage('practice');
    };

    return (
      <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          {DEMOS.map((_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 transition-colors"
              style={{ backgroundColor: i <= demoIndex ? color : `${color}26` }}
            />
          ))}
          <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
            {demoIndex + 1}/{DEMOS.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={demo.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <BalanceScale
              color={color}
              leftGrams={demo.leftGrams}
              leftContent={
                <WeightToken grams={demo.leftGrams} label={demo.leftLabel} color={color} />
              }
              rightGrams={rightGrams}
              rightContent={
                revealed
                  ? Array.from({ length: demo.rightCount }, (_, i) => (
                      <WeightToken
                        key={i}
                        grams={demo.rightTokenGrams}
                        label={demo.rightTokenLabel}
                        color={color}
                        size="sm"
                      />
                    ))
                  : null
              }
              maxDiffGrams={demo.leftGrams}
            />

            {!revealed && (
              <div className="mt-4 flex justify-center">
                <Button onClick={() => setRevealed(true)} className="gap-1.5">
                  <Scale className="h-4 w-4" />
                  Zobacz na wadze
                </Button>
              </div>
            )}

            {revealed && (
              <>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center text-sm leading-relaxed text-muted-foreground sm:text-base"
                >
                  {demo.explain}
                </motion.p>
                <div className="mt-4 flex justify-end">
                  <Button onClick={next} className="gap-1.5">
                    {isLastDemo ? 'Przejdź do ćwiczenia' : 'Następny przykład'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {isLastDemo && revealed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed text-muted-foreground"
            style={{ borderColor: `${color}33` }}
          >
            A tona? To kolejny wielki skok — aż 1000 kilogramów, tyle co niewielki samochód
            osobowy. Zbyt dużo, żeby zmieściła się na szalce — ale drabinka jednostek w kroku
            Przykłady działa dokładnie tak samo.
          </motion.p>
        )}
      </div>
    );
  }

  const round = ROUNDS[roundIndex];
  const isLastRound = roundIndex === ROUNDS.length - 1;
  const total = picked.reduce((sum, g) => sum + g, 0);
  const diff = round.targetGrams - total;
  const done = diff === 0;

  const add = (grams: number) => setPicked((prev) => [...prev, grams]);
  const undo = () => setPicked((prev) => prev.slice(0, -1));

  const nextRound = () => {
    if (isLastRound) {
      onComplete?.();
      return;
    }
    setRoundIndex((i) => i + 1);
    setPicked([]);
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {roundIndex + 1}/{ROUNDS.length}
        </span>
      </div>

      <p className="mb-4 text-center text-sm text-muted-foreground sm:text-base">
        Dołóż odważniki na prawą szalkę, aż zrównoważysz:{' '}
        <strong style={{ color }}>{round.targetLabel}</strong>
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={round.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <BalanceScale
            color={color}
            leftGrams={round.targetGrams}
            leftContent={
              <WeightToken grams={round.targetGrams} label={round.targetLabel} color={color} />
            }
            rightGrams={total}
            rightContent={picked.map((grams, i) => {
              const token = WEIGHT_TOKENS.find((t) => t.grams === grams);
              return (
                <WeightToken
                  key={i}
                  grams={grams}
                  label={token?.label ?? `${grams} g`}
                  color={color}
                  size="sm"
                />
              );
            })}
            maxDiffGrams={round.targetGrams}
          />
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {WEIGHT_TOKENS.map((token) => (
          <WeightToken
            key={token.grams}
            grams={token.grams}
            label={token.label}
            color={color}
            onClick={() => add(token.grams)}
            disabled={done}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={undo}
          disabled={picked.length === 0}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Undo2 className="h-3.5 w-3.5" aria-hidden />
          Cofnij ostatni odważnik
        </button>

        <span
          className={cn(
            'text-sm font-semibold',
            done ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
          )}
        >
          {done
            ? 'Dokładnie tyle! 🎉'
            : diff > 0
              ? `Brakuje: ${diff} g`
              : `Za dużo o: ${Math.abs(diff)} g`}
        </span>
      </div>

      {done && (
        <div className="mt-4 flex justify-end">
          <Button onClick={nextRound} className="gap-1.5">
            {isLastRound ? 'Zakończ' : 'Następna runda'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
