'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RomanOdometer } from '../../roman-odometer';
import { Beat, GuideAct, useActStep } from '../guide-act';
import { symbolValue, toRoman } from '../../../lib/roman';
import { ADDITIVE_READING } from './guide-content';

/**
 * Obie liczby w tym akcie MUSZĄ mieć zapis czysto addytywny — naiwne sumowanie
 * wartości kolejnych liter jest poprawne wyłącznie wtedy. Nie podmieniaj ich na
 * zapis z odejmowaniem (np. MCMXCIV), bo licznik zacząłby kłamać.
 */
const DEMO = toRoman(ADDITIVE_READING); // MMXXVI
const PRACTICE_VALUE = 1666;
const PRACTICE = toRoman(PRACTICE_VALUE); // MDCLXVI — każdy z siedmiu symboli dokładnie raz

const sumOfFirst = (symbols: string, count: number): number =>
  symbols
    .slice(0, count)
    .split('')
    .reduce((total, char) => total + symbolValue(char), 0);

export function ActDodawanie({ color }: { color: string }) {
  return (
    <GuideAct id="dodawanie" mode="flow">
      <DodawanieBody color={color} />
    </GuideAct>
  );
}

function DodawanieBody({ color }: { color: string }) {
  const read = useActStep(DEMO.length, 0.05, 0.6);
  const [clicked, setClicked] = useState(0);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const practiceDone = clicked === PRACTICE.length;

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">
        Czytasz od lewej i dodajesz
      </h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Gdy symbole stoją od największego do najmniejszego, po prostu je sumujesz.
      </p>

      {/* Pokaz sterowany przewijaniem */}
      <div className="mb-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-center gap-1 sm:gap-2">
          {DEMO.split('').map((char, i) => {
            const active = i < read;
            return (
              <span key={i} className="flex flex-col items-center gap-1.5">
                <span
                  className="font-mono text-3xl font-black leading-none transition-opacity sm:text-5xl"
                  style={{ color, opacity: active ? 1 : 0.22 }}
                >
                  {char}
                </span>
                <span
                  className="font-mono text-[10px] font-bold tabular-nums transition-opacity sm:text-xs"
                  style={{ color: textColor, opacity: active ? 1 : 0 }}
                >
                  +{symbolValue(char)}
                </span>
                {/* Głowica odczytu — CSS translate na elemencie DOM, nie atrybut SVG */}
                <span
                  className="h-0.5 w-full transition-all"
                  style={{ backgroundColor: i === read - 1 ? color : 'transparent' }}
                />
              </span>
            );
          })}
        </div>

        <div className="flex justify-center">
          <RomanOdometer value={sumOfFirst(DEMO, read)} color={color} label="suma" />
        </div>
      </div>

      <Beat at={0.66} className="mb-6">
        <p className="max-w-2xl text-base leading-relaxed sm:text-lg">
          Żadnej sztuczki — <strong>{DEMO}</strong> to 1000 + 1000 + 10 + 10 + 5 + 1 ={' '}
          {ADDITIVE_READING}.
        </p>
      </Beat>

      {/* Twoja kolej — klikanie, dostępne niezależnie od przewijania */}
      <div
        className="border-l-4 p-4 sm:p-5"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <p
          className="mb-1 text-xs font-bold uppercase tracking-[0.15em]"
          style={{ color: textColor }}
        >
          Przeczytaj sam
        </p>
        <p className="mb-4 text-sm leading-relaxed sm:text-base">
          Tu każdy z siedmiu symboli występuje dokładnie raz. Klikaj je od lewej.
        </p>

        <div className="mb-4 flex flex-wrap justify-center gap-1.5">
          {PRACTICE.split('').map((char, i) => {
            const done = i < clicked;
            const isNext = i === clicked;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  // Filozofia „nie ma złego kliknięcia”: zły klik po prostu nic nie robi.
                  if (isNext) setClicked((prev) => prev + 1);
                }}
                disabled={done}
                className={cn(
                  'flex cursor-pointer flex-col items-center gap-0.5 border px-3 py-2 transition-all disabled:cursor-default',
                  isNext && 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={{
                  borderColor: done ? color : `${color}40`,
                  backgroundColor: done ? `${color}14` : undefined,
                  opacity: done || isNext ? 1 : 0.45,
                }}
              >
                <span
                  className="font-mono text-xl font-black leading-none sm:text-2xl"
                  style={{ color }}
                >
                  {char}
                </span>
                <span className="font-mono text-[10px] font-bold tabular-nums text-muted-foreground">
                  {done ? `+${symbolValue(char)}` : '?'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <RomanOdometer value={sumOfFirst(PRACTICE, clicked)} color={color} label="twoja suma" />
          {clicked > 0 && (
            <button
              type="button"
              onClick={() => setClicked(0)}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <RotateCcw className="h-3 w-3" />
              Od nowa
            </button>
          )}
        </div>

        {practiceDone && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-emerald-50 p-3 text-center text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
          >
            {PRACTICE} = {PRACTICE_VALUE}. Wszystkie siedem symboli, każdy raz, od największego do
            najmniejszego.
          </motion.p>
        )}
      </div>
    </>
  );
}
