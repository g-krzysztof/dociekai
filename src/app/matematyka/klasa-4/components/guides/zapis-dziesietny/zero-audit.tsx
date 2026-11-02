'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { pieceFill, pieceStroke } from '../../../lib/fraction';
import { round } from '../../../lib/lines';
import { readDecimal, toHundredths } from '../../../lib/decimal';
import { DecimalNumeral } from './decimal-numeral';
import { ZERO_CASES } from './guide-content';

const TRACK_W = 320;
const TRACK_H = 52;
const STROKE = 2;
const INSET = STROKE / 2;
const BLOCK_GAP = 3;
const BLOCKS = 10;
const BLOCK_W = round((TRACK_W - STROKE - BLOCK_GAP * (BLOCKS - 1)) / BLOCKS);

function blockX(index: number): number {
  return round(INSET + index * (BLOCK_W + BLOCK_GAP));
}

/**
 * Prawa krawędź zamalowania dla `h` setnych. Liczona z geometrii bloków, nie
 * proporcją `h/100` — przerwy między dziesiątymi przesuwają krawędź (ta sama
 * zasada co `filledEdgeRatio` w `FractionBarGlyph`).
 */
function edgeX(h: number): number {
  if (h <= 0) return INSET;
  const block = Math.ceil(h / 10) - 1;
  const within = h - block * 10;
  return round(blockX(block) + (BLOCK_W * within) / 10);
}

interface ZeroAuditProps {
  color: string;
}

/**
 * Jedna taśma, trzy zapisy. Dziecko maluje ją kolejnymi liczbami, a każda
 * sprawdzona zostawia TRWAŁY znacznik na krawędzi zamalowania — dzięki temu
 * 0,5 i 0,50 dosłownie kładą swoje znaczniki jeden na drugim (ta sama długość),
 * a 0,05 ląduje dziesięć razy bliżej początku. Reguła o zerach nie jest tu
 * powiedziana przed rysunkiem, tylko z niego odczytana.
 */
export function ZeroAudit({ color }: ZeroAuditProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [seen, setSeen] = useState<number[]>([0]);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const active = ZERO_CASES[activeIndex];
  const hundredths = toHundredths(active.value);
  const allSeen = seen.length === ZERO_CASES.length;

  const choose = (index: number) => {
    setActiveIndex(index);
    setSeen((prev) => (prev.includes(index) ? prev : [...prev, index]));
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Zamaluj taśmę:
        </span>
        {ZERO_CASES.map((zeroCase, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={zeroCase.label}
              type="button"
              onClick={() => choose(index)}
              aria-pressed={isActive}
              className={cn(
                'cursor-pointer border px-4 py-1.5 transition-all',
                !isActive && 'hover:-translate-y-0.5 hover:shadow-md'
              )}
              style={
                isActive
                  ? { borderColor: color, backgroundColor: `${color}14` }
                  : { borderColor: `${color}40` }
              }
            >
              <DecimalNumeral
                value={zeroCase.value}
                color={isActive ? color : textColor}
                className="text-base"
              />
            </button>
          );
        })}
      </div>

      {/* Etykiety znaczników jako zwykły tekst HTML pozycjonowany procentowo —
          ta sama skala co `viewBox`, więc trafiają dokładnie w swoje kreski,
          a zostają ostrym, wybieralnym tekstem zamiast <text> w SVG. */}
      <div className="relative pt-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12">
          {seen.map((index, order) => {
            const zeroCase = ZERO_CASES[index];
            const percent = (edgeX(toHundredths(zeroCase.value)) / TRACK_W) * 100;
            return (
              <span
                key={zeroCase.label}
                className="absolute -translate-x-1/2 whitespace-nowrap"
                style={{ left: `${percent}%`, top: order * 16 }}
              >
                <DecimalNumeral value={zeroCase.value} color={textColor} className="text-xs" />
              </span>
            );
          })}
        </div>

        <svg
          viewBox={`0 0 ${TRACK_W} ${TRACK_H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Taśma podzielona na dziesięć części dziesiątych, każda na dziesięć setnych; zamalowane ${hundredths} setnych`}
        >
          {Array.from({ length: BLOCKS }, (_, block) => {
            const x = blockX(block);
            const filledInBlock = Math.max(0, Math.min(10, hundredths - block * 10));

            return (
              <g key={block}>
                <rect
                  x={x}
                  y={INSET}
                  width={BLOCK_W}
                  height={TRACK_H - STROKE}
                  rx={4}
                  fill={pieceFill(color, false)}
                  stroke={pieceStroke(color, false)}
                  strokeWidth={STROKE}
                />
                {filledInBlock > 0 && (
                  <motion.rect
                    initial={false}
                    animate={{ width: round((BLOCK_W * filledInBlock) / 10) }}
                    transition={{ duration: 0.25 }}
                    x={x}
                    y={INSET}
                    height={TRACK_H - STROKE}
                    rx={4}
                    fill={color}
                  />
                )}
                {/* Kreski setnych — ledwie widoczne, żeby taśma dalej czytała się jako
                    dziesiątki. Nad zamalowaniem muszą być jasne: kreska w kolorze modułu
                    na tle tego samego koloru znika, a to właśnie tam trzeba je policzyć. */}
                {Array.from({ length: 9 }, (_, tick) => (
                  <line
                    key={tick}
                    x1={round(x + (BLOCK_W * (tick + 1)) / 10)}
                    x2={round(x + (BLOCK_W * (tick + 1)) / 10)}
                    y1={TRACK_H - 14}
                    y2={TRACK_H - INSET}
                    stroke={tick + 1 <= filledInBlock ? '#ffffffa6' : `${color}59`}
                    strokeWidth={0.6}
                  />
                ))}
              </g>
            );
          })}

          {/* Znacznik krawędzi: jasna otoczka pod spodem, kreskowana linia w kolorze
              modułu na wierzchu. Bez otoczki znacznik 0,05 ginął w zamalowanym polu —
              a to właśnie ten, który ma pokazać, jak blisko początku się kończy. */}
          {seen.map((index) => {
            const x = edgeX(toHundredths(ZERO_CASES[index].value));
            return (
              <g key={ZERO_CASES[index].label}>
                <line x1={x} x2={x} y1={0} y2={TRACK_H} stroke="#ffffff" strokeWidth={3.5} />
                <line
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={TRACK_H}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-5 text-base leading-relaxed sm:text-lg">
        <DecimalNumeral value={active.value} color={textColor} /> — <span className="italic">{readDecimal(active.value)}</span>. {active.note}
      </p>

      {allSeen && (
        <div
          className="mt-5 border-l-4 p-4 text-sm leading-relaxed sm:text-base"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          Znaczniki <strong style={{ color: textColor }}>0,5</strong> i{' '}
          <strong style={{ color: textColor }}>0,50</strong> stoją w tym samym miejscu — to ta sama
          długość, tylko opowiedziana innymi kawałkami. Znacznik{' '}
          <strong style={{ color: textColor }}>0,05</strong> jest dziesięć razy bliżej początku.
        </div>
      )}

      {/* Wnioski odsłaniane klikaniem muszą być w DOM od pierwszego renderu. */}
      <ul className="sr-only">
        {ZERO_CASES.map((zeroCase) => (
          <li key={zeroCase.label}>
            {zeroCase.label} to {readDecimal(zeroCase.value)}. {zeroCase.note}
          </li>
        ))}
      </ul>
    </div>
  );
}
