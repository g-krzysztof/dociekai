'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FractionBarGlyph } from '../../fraction-bar-glyph';
import { FractionNotation } from '../../fraction-notation';

const MIN_DENOMINATOR = 2;
const MAX_DENOMINATOR = 10;
const START_DENOMINATOR = 4;

export interface FractionBarRound {
  label: string;
  licznik: number;
  mianownik: number;
}

interface FractionBarProps {
  color: string;
  rounds: FractionBarRound[];
  onComplete?: () => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Flagowy widżet lekcji. W przewodniku mianownik wybierało się z gotowych
 * przycisków — tu dziecko przeciąga uchwyt po torze (pierwszy w kursie
 * ciągły drag sterujący liczbą RÓWNYCH części, a nie kątem/wymiarem/pozycją),
 * a pasek na żywo przemalowuje się na tyle odcinków, ile wskazuje uchwyt.
 * Kliknięcie odcinka buduje licznik — ten sam mechanizm co `FractionPie`,
 * tylko mianownik nie jest tu z góry zadany przez akt, tylko wybrany przez
 * dziecko. Runda (cel: konkretny ułamek) kończy się, gdy zbudowany ułamek
 * dokładnie odpowiada zadanemu — bez blokady, dowolna liczba prób.
 */
export function FractionBar({ color, rounds, onComplete }: FractionBarProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [denominator, setDenominator] = useState(START_DENOMINATOR);
  const [filled, setFilled] = useState<Set<number>>(new Set());
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const round = rounds[roundIndex];
  const isLast = roundIndex === rounds.length - 1;
  const licznik = filled.size;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const matched = Boolean(round) && denominator === round.mianownik && licznik === round.licznik;

  const setFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const next = Math.round(MIN_DENOMINATOR + ratio * (MAX_DENOMINATOR - MIN_DENOMINATOR));
    setDenominator((prev) => {
      if (next === prev) return prev;
      setFilled(new Set());
      return next;
    });
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (event: PointerEvent) => setFromClientX(event.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging]);

  const toggleSegment = (index: number) => {
    setFilled((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const next = () => {
    if (!isLast) {
      setRoundIndex((prev) => prev + 1);
      setDenominator(START_DENOMINATOR);
      setFilled(new Set());
      return;
    }
    onComplete?.();
  };

  if (!round) return null;

  const handlePercent = ((denominator - MIN_DENOMINATOR) / (MAX_DENOMINATOR - MIN_DENOMINATOR)) * 100;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {rounds.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {roundIndex + 1}/{rounds.length}
        </span>
      </div>

      <p className="mb-6 text-sm font-semibold leading-relaxed sm:text-base">{round.label}</p>

      <div className="grid gap-8 md:grid-cols-[1fr_170px] md:items-center">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Przeciągnij uchwyt, żeby wybrać mianownik
          </p>

          <div ref={trackRef} className="relative mb-6 h-8 touch-none select-none">
            <div
              className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2"
              style={{ backgroundColor: `${color}30` }}
              aria-hidden
            />
            <motion.div
              role="slider"
              aria-label="Mianownik ułamka"
              aria-valuemin={MIN_DENOMINATOR}
              aria-valuemax={MAX_DENOMINATOR}
              aria-valuenow={denominator}
              tabIndex={0}
              className="absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center border-2 bg-white font-mono text-xs font-bold active:cursor-grabbing dark:bg-zinc-900"
              style={{ left: `${handlePercent}%`, borderColor: color, color }}
              animate={{ left: `${handlePercent}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onPointerDown={(event) => {
                event.preventDefault();
                setDragging(true);
                setFromClientX(event.clientX);
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') setDenominator((prev) => Math.min(MAX_DENOMINATOR, prev + 1));
                if (event.key === 'ArrowLeft') setDenominator((prev) => Math.max(MIN_DENOMINATOR, prev - 1));
                if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') setFilled(new Set());
              }}
            >
              {denominator}
            </motion.div>
          </div>

          <FractionBarGlyph
            color={color}
            mianownik={denominator}
            filled={filled}
            onToggleSegment={toggleSegment}
            ariaLabel={`Pasek podzielony na ${denominator} części, kliknij kawałki, żeby je zamalować`}
          />
          <p className="mt-3 text-xs" style={{ color: textColor }}>
            Stuknij dowolny kawałek jeszcze raz, żeby go odznaczyć.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <FractionNotation licznik={licznik} mianownik={denominator} color={color} licznikRevealed mianownikRevealed size="md" />
          <p className="text-center text-xs text-muted-foreground">
            Cel: {round.licznik}/{round.mianownik}
          </p>
        </div>
      </div>

      {matched && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 flex flex-wrap items-center justify-between gap-3 bg-emerald-50 p-4 dark:bg-emerald-950/40"
        >
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            Dokładnie tyle! To jest {round.licznik}/{round.mianownik}.
          </p>
          <Button onClick={next} style={{ backgroundColor: color }} className="gap-1.5 text-white hover:opacity-90">
            {isLast ? 'Dalej' : 'Kolejny ułamek'}
            {isLast ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
