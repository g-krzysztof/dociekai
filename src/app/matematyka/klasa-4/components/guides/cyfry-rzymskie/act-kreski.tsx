'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TallyMarks } from '../../tally-marks';
import { Beat, GuideAct, useActStep } from '../guide-act';
import { toRoman } from '../../../lib/roman';
import { TALLY_TARGET } from './guide-content';
import { img } from '@/lib/media';

type Grouping = 'none' | 'five' | 'ten';

interface ActKreskiProps {
  color: string;
}

/** Wnętrze aktu — osobny komponent, bo `useActStep` wymaga kontekstu z `GuideAct`. */
function KreskiBody({ color }: { color: string }) {
  const count = useActStep(TALLY_TARGET, 0, 0.55);
  const [grouping, setGrouping] = useState<Grouping>('none');

  const fives = Math.floor(TALLY_TARGET / 5);
  const fivesRest = TALLY_TARGET % 5;
  const tens = Math.floor(TALLY_TARGET / 10);
  const tensRest = TALLY_TARGET % 10;

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[1fr_220px]">
      <div>
        <h2 className="mb-6 text-2xl font-bold leading-snug sm:text-3xl">
          Dlaczego kreska po kresce się nie opłaca
        </h2>

        <div className="mb-6 min-h-[120px] border bg-white p-5 dark:bg-zinc-900/80">
          <AnimatePresence mode="wait">
            {grouping === 'none' && (
              <motion.div
                key="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TallyMarks count={count} color={color} />
                <p
                  className="mt-3 text-center font-mono text-sm font-bold tabular-nums"
                  style={{ color }}
                >
                  {count}
                </p>
              </motion.div>
            )}

            {grouping === 'five' && (
              <motion.div
                key="five"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap items-center justify-center gap-2"
              >
                {Array.from({ length: fives }, (_, i) => (
                  <motion.span
                    layout
                    key={`v-${i}`}
                    className="border px-3 py-2 font-mono text-xl font-black"
                    style={{ borderColor: `${color}59`, color }}
                  >
                    V
                  </motion.span>
                ))}
                {Array.from({ length: fivesRest }, (_, i) => (
                  <motion.span
                    layout
                    key={`i-${i}`}
                    className="border px-3 py-2 font-mono text-xl font-black"
                    style={{ borderColor: `${color}59`, color }}
                  >
                    I
                  </motion.span>
                ))}
              </motion.div>
            )}

            {grouping === 'ten' && (
              <motion.div
                key="ten"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: tens }, (_, i) => (
                    <motion.span
                      layout
                      key={`x-${i}`}
                      className="border px-3 py-2 font-mono text-xl font-black"
                      style={{ borderColor: `${color}59`, color }}
                    >
                      X
                    </motion.span>
                  ))}
                  <motion.span
                    layout
                    className="border px-3 py-2 font-mono text-xl font-black"
                    style={{ borderColor: `${color}59`, color }}
                  >
                    {toRoman(tensRest)}
                  </motion.span>
                </div>
                <p className="font-mono text-2xl font-black tracking-wide" style={{ color }}>
                  {toRoman(TALLY_TARGET)}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Beat at={0.6} className="mb-5">
          <p className="max-w-xl text-base leading-relaxed sm:text-lg">
            <strong>{TALLY_TARGET} kresek.</strong> Policz je szybko — nie da się. Trzeba je liczyć
            po jednej, a przy każdej można się pomylić. Dokładnie ten problem trzeba było rozwiązać.
          </p>
        </Beat>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'five' as const, label: 'Zgrupuj po 5' },
            { key: 'ten' as const, label: 'Zgrupuj po 10' },
            { key: 'none' as const, label: 'Pokaż znów kreski' },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setGrouping(option.key)}
              aria-pressed={grouping === option.key}
              className={cn(
                'cursor-pointer border px-4 py-2 text-sm font-semibold transition-all',
                grouping !== option.key && 'hover:-translate-y-0.5 hover:shadow-md'
              )}
              style={
                grouping === option.key
                  ? { borderColor: color, backgroundColor: `${color}14`, color }
                  : { borderColor: `${color}59`, color }
              }
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Zamiast rysować kreskę za kreską, każdej grupie nadano <strong>własny znak</strong>. Tych
          znaków jest tylko siedem — i to one są całym systemem.
        </p>
      </div>

      <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[220px] lg:block">
        <Image
          src={img('/images/matematyka/przewodniki/cyfry-rzymskie/kamienne-bloki.jpg')}
          alt="Kamienne bloki ustawione w rosnące schodki na drewnianym warsztacie"
          width={220}
          height={165}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>
    </div>
  );
}

export function ActKreski({ color }: ActKreskiProps) {
  return (
    <GuideAct id="kreski" mode="flow">
      <KreskiBody color={color} />
    </GuideAct>
  );
}
