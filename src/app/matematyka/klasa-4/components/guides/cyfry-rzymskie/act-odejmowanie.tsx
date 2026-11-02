'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Beat, GuideAct } from '../guide-act';
import { SUBTRACTIVE_PAIRS, symbolValue } from '../../../lib/roman';
import { PAIR_CANDIDATES, type PairCandidate } from './guide-content';
import { img } from '@/lib/media';

export function ActOdejmowanie({ color }: { color: string }) {
  return (
    <GuideAct id="odejmowanie" mode="flow">
      <OdejmowanieBody color={color} />
    </GuideAct>
  );
}

function OdejmowanieBody({ color }: { color: string }) {
  const [picked, setPicked] = useState<PairCandidate | null>(null);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_240px]">
      <div>
        <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">
          Sześć par, w których się odejmuje
        </h2>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Gdy mniejszy symbol stoi <strong>przed</strong> większym, odejmujesz go. Takich par jest
          dokładnie sześć — nie więcej.
        </p>

        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SUBTRACTIVE_PAIRS.map((pair, i) => (
            <Beat key={pair.symbols} at={0.08 + i * 0.09}>
              <div
                className="border p-3 text-center"
                style={{ borderColor: `${color}40`, backgroundColor: `${color}0c` }}
              >
                <span
                  className="block font-mono text-2xl font-black leading-none"
                  style={{ color }}
                >
                  {pair.symbols}
                </span>
                <span
                  className="mt-1.5 block font-mono text-xs tabular-nums"
                  style={{ color: textColor }}
                >
                  {symbolValue(pair.from)} − {symbolValue(pair.minus)} = {pair.value}
                </span>
              </div>
            </Beat>
          ))}
        </div>

        <Beat at={0.72} className="mb-6">
          <div
            className="border-l-4 p-4 sm:p-5"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <p
              className="mb-1 text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: textColor }}
            >
              Jedna reguła zamiast sześciu wyjątków
            </p>
            <p className="text-sm leading-relaxed sm:text-base">
              Odejmuje się <strong>tylko I, X albo C</strong> — czyli 1, 10 i 100. I zawsze tylko
              przed <strong>dwoma najbliższymi większymi</strong> znakami: I przed V i X, X przed L
              i C, C przed D i M. V, L ani D nie odejmują się nigdy.
            </p>
          </div>
        </Beat>

        <p className="mb-3 text-sm font-semibold" style={{ color: textColor }}>
          Czy tak wolno? Kliknij i sprawdź.
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {PAIR_CANDIDATES.map((candidate) => {
            const active = picked?.symbols === candidate.symbols;
            return (
              <button
                key={candidate.symbols}
                type="button"
                onClick={() => setPicked(candidate)}
                aria-pressed={active}
                className={cn(
                  'flex cursor-pointer items-center gap-1.5 border px-4 py-2 font-mono text-lg font-bold transition-all',
                  !active && 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={
                  active
                    ? {
                        borderColor: candidate.legal ? '#10b981' : '#f43f5e',
                        backgroundColor: candidate.legal ? '#10b98114' : '#f43f5e14',
                        color: candidate.legal ? '#047857' : '#be123c',
                      }
                    : { borderColor: `${color}59`, color }
                }
              >
                {active &&
                  (candidate.legal ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    <X className="h-4 w-4" aria-hidden />
                  ))}
                {candidate.symbols}
              </button>
            );
          })}
        </div>

        <div className="min-h-[64px]">
          <AnimatePresence mode="wait">
            {picked && (
              <motion.p
                key={picked.symbols}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'p-3 text-sm leading-relaxed',
                  picked.legal
                    ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100'
                    : 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100'
                )}
              >
                {picked.explanation}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Zawsze w DOM — panel wyżej jest ozdobą interakcji, nie jedynym nośnikiem treści */}
        <ul className="sr-only">
          {PAIR_CANDIDATES.map((candidate) => (
            <li key={candidate.symbols}>
              {candidate.symbols}: {candidate.explanation}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[240px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/cyfry-rzymskie/kolumnada.jpg')}
          alt="Kolumnada rzymskiego forum w porannym świetle"
          width={240}
          height={180}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
