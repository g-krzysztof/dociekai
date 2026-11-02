'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PrefixRung } from './guide-content';

interface PrefixLadderProps {
  color: string;
  rungs: PrefixRung[];
  /** Etykieta bazy pokazywana pod szczeblem `baza`, np. „metr" albo „gram". */
  baseLabel: string;
}

/**
 * Drabinka przedrostków: sześć szczebli mili–centy–decy–(baza)–deka–kilo w
 * jednym rzędzie. W przeciwieństwie do `<UnitLadder>` (klikana wspinaczka
 * jednej wartości między dwoma szczeblami, do zamiany) to statyczny widok
 * całego systemu naraz — tego samego układu używają trzy akty przewodnika:
 * raz abstrakcyjnie (wszystkie sześć aktywne), potem sparametryzowany
 * metrem i gramem (część szczebli wygaszona, bo kurs ich nie używa dla tej
 * jednostki). Aktywny szczebel (ma `code`) jest klikalny i odsłania swój
 * `fact` — ten sam „no wrong click" duch co `<TermSlot>` w słowniku działań,
 * tylko zastosowany do szczebli drabinki zamiast liczb w równaniu.
 * Wygaszony szczebel (bez `code`) nie reaguje na klik — samo to, że nie da
 * się go kliknąć, jest częścią komunikatu „ta jednostka tu nie istnieje".
 */
export function PrefixLadder({ color, rungs, baseLabel }: PrefixLadderProps) {
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const revealedRung = rungs.find((rung) => rung.id === revealedId);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-6 gap-1 sm:gap-2">
        {rungs.map((rung) => {
          const active = Boolean(rung.code);
          const selected = revealedId === rung.id;
          return (
            <button
              key={rung.id}
              type="button"
              disabled={!active}
              onClick={() => setRevealedId((prev) => (prev === rung.id ? null : rung.id))}
              aria-pressed={selected}
              className={cn(
                'flex flex-col items-center gap-1 border-2 p-1.5 text-center transition-all sm:p-2.5',
                active ? 'cursor-pointer' : 'cursor-default border-dashed',
                active && !selected && 'hover:-translate-y-0.5 hover:shadow-md'
              )}
              style={{
                borderColor: active ? color : `${color}30`,
                backgroundColor: selected ? `${color}1f` : active ? `${color}0a` : undefined,
              }}
            >
              <span
                className="font-mono text-[10px] font-bold sm:text-xs"
                style={{ color: active ? color : `${color}70` }}
              >
                {rung.id === 'baza' ? baseLabel : rung.prefixLabel}
              </span>
              <span
                className="font-mono text-base font-black tabular-nums sm:text-xl"
                style={{ color: active ? color : `${color}55` }}
              >
                {rung.code ?? '·'}
              </span>
              <span className="text-[9px] font-semibold text-muted-foreground sm:text-[11px]">
                {rung.factorLabel}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {revealedRung?.fact && (
          <motion.p
            key={revealedRung.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="min-h-10 border-l-4 p-3 text-sm leading-relaxed sm:text-base"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            {revealedRung.fact}
          </motion.p>
        )}
      </AnimatePresence>

      {!revealedRung && (
        <p className="min-h-10 text-center text-xs text-muted-foreground">
          Kliknij aktywny szczebel, żeby zobaczyć, co dokładnie znaczy.
        </p>
      )}
    </div>
  );
}
