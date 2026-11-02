'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { DecimalNumeral } from '../../guides/zapis-dziesietny/decimal-numeral';
import { fractionToDecimal } from '../../../lib/decimal-fraction';

interface Round {
  licznik: number;
  mianownik: number;
  /** Mnożniki do wyboru — dokładnie jeden trafia w potęgę 10. */
  options: number[];
}

const ROUNDS: Round[] = [
  { licznik: 3, mianownik: 4, options: [2, 5, 25, 50] },
  { licznik: 1, mianownik: 5, options: [2, 5, 20, 25] },
  { licznik: 3, mianownik: 8, options: [5, 8, 125, 250] },
];

interface ExpandToDecimalProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie (kierunek: ułamek zwykły → dziesiętny). Dziecko wybiera JEDEN
 * mnożnik, który rozszerza mianownik do 10/100/1000 — licznik mnoży się tym
 * samym, a wynik odczytuje się wprost. Zły mnożnik = drgnięcie i konkret, ile
 * naprawdę daje.
 */
export function ExpandToDecimal({ color, onComplete }: ExpandToDecimalProps) {
  const [index, setIndex] = useState(0);
  const [pickedK, setPickedK] = useState<number | null>(null);
  const [wrongK, setWrongK] = useState<number | null>(null);
  const [wrongTries, setWrongTries] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = ROUNDS[index];
  const solved = fractionToDecimal(round.licznik, round.mianownik)!;
  const isLast = index === ROUNDS.length - 1;
  const done = pickedK === solved.factor;
  const moduleTextColor = `color-mix(in oklch, ${color} 88%, black)`;

  const pick = (k: number) => {
    if (done) return;
    if (k === solved.factor) {
      setPickedK(k);
      setWrongK(null);
      return;
    }
    setWrongK(k);
    setWrongTries((t) => t + 1);
  };

  const advance = () => {
    if (isLast) {
      setFinished(true);
      onComplete?.();
      return;
    }
    setIndex((i) => i + 1);
    setPickedK(null);
    setWrongK(null);
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Sparkles className="mx-auto mb-4 h-9 w-9" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Umiesz zamienić ułamek zwykły na dziesiętny!</h3>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Rozszerz ułamek tak, żeby mianownik był równy 10, 100 albo 1000 — pamiętając, że{' '}
          <strong>licznik mnożymy tą samą liczbą</strong> — i odczytaj liczbę z przecinkiem.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{ROUNDS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-4 text-center text-base font-bold leading-snug sm:text-lg">
            Zamień ten ułamek na liczbę z przecinkiem:
          </p>

          <div className="mb-5 flex items-center justify-center gap-4 sm:gap-6">
            <StackFraction top={round.licznik} bottom={round.mianownik} color={color} />

            {done && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <span className="text-sm font-bold text-muted-foreground">
                  × {solved.factor}
                  <ArrowRight className="mx-1 inline h-4 w-4" aria-hidden />
                </span>
                <StackFraction top={solved.expandedNum} bottom={solved.power} color={color} />
                <span className="text-2xl font-black text-muted-foreground" aria-hidden>
                  =
                </span>
                <DecimalNumeral value={solved.value} color={color} className="text-3xl sm:text-4xl" />
              </motion.div>
            )}
          </div>

          {!done ? (
            <>
              <p className="mb-3 text-center text-sm leading-relaxed">
                Jakim mnożnikiem zmienisz mianownik <strong>{round.mianownik}</strong> w 10, 100 albo
                1000?
              </p>
              <motion.div
                key={`chips-${index}-${wrongTries}`}
                initial={wrongK !== null ? { x: -6 } : false}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 900, damping: 12 }}
                className="flex flex-wrap justify-center gap-2"
              >
                {round.options.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => pick(k)}
                    className="inline-flex h-11 min-w-[3.5rem] items-center justify-center border px-3 font-mono text-base font-bold tabular-nums transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
                  >
                    × {k}
                  </button>
                ))}
              </motion.div>
              {wrongK !== null && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-center text-sm text-amber-700 dark:text-amber-300"
                >
                  {round.mianownik} × {wrongK} = <strong>{round.mianownik * wrongK}</strong> — a to nie
                  jest 10, 100 ani 1000.
                </motion.p>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 border-t pt-4 text-sm leading-relaxed"
            >
              <p>
                Mianownik: {round.mianownik} × {solved.factor} = <strong>{solved.power}</strong>.
              </p>
              <p>
                Licznik mnożymy tym samym: {round.licznik} × {solved.factor} ={' '}
                <strong>{solved.expandedNum}</strong>.
              </p>
              <p>
                <span
                  className="font-mono font-bold"
                  style={{ color: moduleTextColor }}
                >
                  {solved.expandedNum}/{solved.power}
                </span>{' '}
                to <strong style={{ color: moduleTextColor }}>{solved.text}</strong>.
              </p>
              <div className="flex justify-end pt-1">
                <Button onClick={advance}>
                  {isLast ? (
                    <>
                      <Check className="mr-1 h-4 w-4" /> Zakończ
                    </>
                  ) : (
                    'Następny ułamek'
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

function StackFraction({ top, bottom, color }: { top: number; bottom: number; color: string }) {
  return (
    <span
      className="inline-flex flex-col items-center font-mono font-black leading-none tabular-nums"
      style={{ color }}
    >
      <span className="px-1 text-2xl sm:text-3xl">{top}</span>
      <span className="my-1 h-[3px] w-full bg-current" aria-hidden />
      <span className="px-1 text-2xl sm:text-3xl">{bottom}</span>
    </span>
  );
}
