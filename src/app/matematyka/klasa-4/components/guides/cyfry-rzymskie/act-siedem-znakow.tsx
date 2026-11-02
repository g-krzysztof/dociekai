'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useTransform } from 'framer-motion';
import { Beat, GuideAct, useActProgress } from '../guide-act';
import { ROMAN_RHYTHM } from '../../../lib/roman';
import { SYMBOL_DETAILS } from './guide-content';
import { SymbolMonolith } from './symbol-monolith';

const COL = 100;
const ARC_H = 54;
const WIDTH = COL * SYMBOL_DETAILS.length;

/** Łuk między środkami dwóch sąsiednich kolumn, rysowany przez `pathLength`. */
function RhythmArc({ index, factor, color }: { index: number; factor: number; color: string }) {
  const progress = useActProgress();
  const at = 0.35 + index * 0.07;
  const draw = useTransform(progress, [at, at + 0.06], [0, 1]);
  const labelOpacity = useTransform(progress, [at + 0.03, at + 0.08], [0, 1]);

  const x1 = COL * index + COL / 2;
  const x2 = COL * (index + 1) + COL / 2;
  const mid = (x1 + x2) / 2;

  return (
    <g>
      <motion.path
        d={`M ${x1} ${ARC_H - 4} Q ${mid} 2 ${x2} ${ARC_H - 4}`}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        pathLength={1}
        style={{ pathLength: draw }}
      />
      <motion.text
        x={mid}
        y={16}
        textAnchor="middle"
        className="font-mono text-[15px] font-black"
        fill={color}
        style={{ opacity: labelOpacity }}
      >
        ×{factor}
      </motion.text>
    </g>
  );
}

export function ActSiedemZnakow({ color }: { color: string }) {
  return (
    <GuideAct id="siedem-znakow" mode="flow">
      <SiedemZnakowBody color={color} />
    </GuideAct>
  );
}

function SiedemZnakowBody({ color }: { color: string }) {
  const [selected, setSelected] = useState(SYMBOL_DETAILS[0].symbol);
  const detail = SYMBOL_DETAILS.find((item) => item.symbol === selected)!;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">
        Siedem znaków i rytm ×5, ×2
      </h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        To siedem liter alfabetu łacińskiego, którym przypisano stałe wartości. Kliknij dowolną,
        żeby zobaczyć szczegóły.
      </p>

      {/* Łuki rytmu — wyliczone z ROMAN_RHYTHM, nie wpisane ręcznie */}
      <svg
        viewBox={`0 0 ${WIDTH} ${ARC_H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Rytm mnożników między symbolami: ${ROMAN_RHYTHM.map((f) => `×${f}`).join(', ')}`}
      >
        {ROMAN_RHYTHM.map((factor, i) => (
          <RhythmArc key={i} index={i} factor={factor} color={color} />
        ))}
      </svg>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {SYMBOL_DETAILS.map((item) => (
          <SymbolMonolith
            key={item.symbol}
            detail={item}
            color={color}
            selected={item.symbol === selected}
            onSelect={() => setSelected(item.symbol)}
          />
        ))}
      </div>

      {/* Panel szczegółów — zawsze obecny, treść zmienia się po kliknięciu */}
      <motion.div
        layout
        className="mt-4 border-l-4 p-4 sm:p-5"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={detail.symbol}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-3xl font-black leading-none" style={{ color }}>
                {detail.symbol}
              </span>
              <span
                className="font-mono text-xl font-bold tabular-nums"
                style={{ color: textColor }}
              >
                = {detail.value}
              </span>
              <span className="text-sm font-semibold" style={{ color: textColor }}>
                {detail.repeatable ? 'można powtarzać' : 'nigdy się nie powtarza'}
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed sm:text-base">{detail.note}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Spotkasz go tam, gdzie są {detail.where}.
            </p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <Beat at={0.78} className="mt-5">
        <p className="max-w-2xl text-base leading-relaxed sm:text-lg">
          Nie musisz uczyć się siedmiu przypadkowych liczb —{' '}
          <strong>musisz zapamiętać jeden rytm</strong>: razy pięć, razy dwa, razy pięć, razy dwa,
          razy pięć, razy dwa. Od 1 dojdziesz tak aż do 1000.
        </p>
      </Beat>
    </>
  );
}
