'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FractionBarGlyph } from '../../fraction-bar-glyph';
import { MiniFraction } from '../../mini-fraction';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { toMixed, formatMixed } from '../../../lib/mixed-number';
import { plural } from '../../../lib/plural';

export interface RepeatRound {
  id: string;
  mianownik: number;
  /** Licznik JEDNEJ porcji — to jego wielokrotnością jest wynik. */
  licznik: number;
  /** Ile porcji trzeba dołożyć, żeby runda się zaliczyła. */
  copies: number;
  label: string;
  /** Rzeczownik porcji w mianowniku liczby mnogiej, np. „szklanki mąki”. */
  unit: string;
  note: string;
}

interface RepeatStripProps {
  color: string;
  rounds: RepeatRound[];
  onComplete?: () => void;
}

function fill(count: number): Set<number> {
  return new Set(Array.from({ length: count }, (_, i) => i));
}

/**
 * Mnożenie jako powtarzanie tej samej porcji: każde kliknięcie dokłada
 * kolejny identyczny pasek, a pod stosem rośnie zapis `k · a/b`. Licznik
 * skacze o `a` przy każdej porcji, mianownik stoi — tak samo jak przy
 * dodawaniu, bo mnożenie jest tu tylko skrótem wielokrotnego dodawania.
 *
 * Porcje da się zdejmować („Zabierz porcję”), więc przestrzelenie liczby
 * kopii nie kończy rundy — ta sama zasada odwracalności co przy
 * `Cofnij ostatni…` w innych widżetach kursu.
 */
export function RepeatStrip({ color, rounds, onComplete }: RepeatStripProps) {
  const [index, setIndex] = useState(0);
  const [added, setAdded] = useState(0);
  const [finished, setFinished] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${finished}`);

  const round = rounds[index];
  const isLast = index === rounds.length - 1;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const total = added * round.licznik;
  const mixed = toMixed(total, round.mianownik);
  const reached = added === round.copies;

  const next = () => {
    if (!isLast) {
      setIndex(index + 1);
      setAdded(0);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

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
          <p className="text-base font-bold text-emerald-900 dark:text-emerald-100">Licznik skakał, mianownik stał</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
            Za każdą dołożoną porcją licznik rósł dokładnie o licznik jednej porcji. Dlatego mnożąc ułamek przez liczbę
            naturalną, mnoży się sam licznik, a mianownik przepisuje bez zmian.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={round.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <p className="mb-4 text-sm leading-relaxed sm:text-base">{round.label}</p>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: textColor }}>
                Jedna porcja: {round.licznik}/{round.mianownik} {round.unit}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                Cel: {round.copies} {plural(round.copies, { one: 'porcja', few: 'porcje', many: 'porcji' })}
              </span>
            </div>

            <div className="min-h-[80px] space-y-1.5 border p-4" style={{ borderColor: `${color}33` }}>
              {added === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Na razie nic nie odmierzono. Dołóż pierwszą porcję.
                </p>
              ) : (
                <div className="mx-auto max-w-sm space-y-3">
                  <AnimatePresence initial={false}>
                    {Array.from({ length: added }, (_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FractionBarGlyph
                          color={color}
                          mianownik={round.mianownik}
                          filled={fill(round.licznik)}
                          ariaLabel={`Porcja ${i + 1}: ${round.licznik} z ${round.mianownik} części`}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAdded((prev) => Math.max(0, prev - 1))}
                disabled={added === 0}
                className="gap-2"
              >
                <Minus className="h-4 w-4" aria-hidden />
                Zabierz porcję
              </Button>
              <Button
                size="sm"
                onClick={() => setAdded((prev) => Math.min(round.copies + 2, prev + 1))}
                style={{ backgroundColor: color }}
                className="gap-2 text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Dołóż porcję
              </Button>
            </div>

            {/* Zapis rosnący razem ze stosem porcji */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border p-3" style={{ borderColor: `${color}33` }}>
              <span className="font-mono text-base font-bold tabular-nums" style={{ color }}>
                {added}
              </span>
              <span className="font-mono text-base font-bold">·</span>
              <MiniFraction licznik={round.licznik} mianownik={round.mianownik} />
              <span className="font-mono text-base font-bold">=</span>
              <MiniFraction licznik={total} mianownik={round.mianownik} color={color} />
              {mixed.whole > 0 && <span className="text-xs text-muted-foreground">= {formatMixed(mixed)}</span>}
            </div>

            {reached && (
              <>
                <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {round.note}
                </motion.p>
                <div className="mt-4 flex justify-end">
                  <Button onClick={next} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
                    {isLast ? 'Do przykładów' : 'Następna runda'}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
