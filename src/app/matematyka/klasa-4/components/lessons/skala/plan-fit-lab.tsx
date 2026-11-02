'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SCALE_OPTIONS = [100, 200, 500, 1000];
const PX_PER_CM = 9;
const PAGE_HEIGHT = 40;

export interface FitRound {
  label: string;
  realCm: number;
  pageCm: number;
}

interface PlanFitLabProps {
  color: string;
  rounds: FitRound[];
  onComplete?: () => void;
}

function formatCm(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1).replace('.', ',');
}

/**
 * Który rysunek się zmieści? Dziecko wybiera skalę z czterech opcji, a pasek
 * przedstawiający rysunek na żywo rośnie/kurczy się i albo mieści się w
 * ramce kartki, albo z niej wystaje — nowy typ sprzężenia zwrotnego w kursie
 * (nie tolerancja trafienia w punkt, tylko „mieści się / nie mieści się" w
 * ograniczonym polu). To samo pytanie (który rozmiar kartki potrzebny) wraca
 * z inną parą liczb w drugiej rundzie, żeby dziecko nie zapamiętało jednej
 * odpowiedzi, tylko powtórzyło rozumowanie.
 */
export function PlanFitLab({ color, rounds, onComplete }: PlanFitLabProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [scale, setScale] = useState<number | null>(null);

  const round = rounds[roundIndex];
  const isLast = roundIndex === rounds.length - 1;
  const drawnCm = scale ? round.realCm / scale : 0;
  const fits = scale !== null && drawnCm <= round.pageCm;
  const pageWidthPx = round.pageCm * PX_PER_CM;
  const drawnWidthPx = Math.min(drawnCm * PX_PER_CM, pageWidthPx * 1.6);

  const next = () => {
    if (!isLast) {
      setRoundIndex((prev) => prev + 1);
      setScale(null);
      return;
    }
    onComplete?.();
  };

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

      <p className="mb-4 text-sm font-semibold leading-relaxed sm:text-base">{round.label}</p>

      <div className="mb-4 grid grid-cols-4 gap-2">
        {SCALE_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setScale(option)}
            className={cn(
              'border px-2 py-3 text-center font-mono text-sm font-bold tabular-nums transition-all',
              scale === option ? 'text-white' : 'hover:border-current'
            )}
            style={scale === option ? { backgroundColor: color, borderColor: color } : { borderColor: `${color}55`, color }}
          >
            1:{option}
          </button>
        ))}
      </div>

      <div className="border bg-zinc-50 p-4 dark:bg-zinc-950/40">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Kartka robocza — szerokość {formatCm(round.pageCm)} cm
        </p>
        <div className="relative" style={{ height: PAGE_HEIGHT, width: pageWidthPx, maxWidth: '100%' }}>
          <div className="absolute inset-y-0 left-0 border-2" style={{ width: pageWidthPx, borderColor: color }} />
          {scale !== null && (
            <motion.div
              initial={false}
              animate={{ width: drawnWidthPx }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className="absolute inset-y-0 left-0 flex items-center justify-end pr-1"
              style={{ backgroundColor: fits ? '#10b98155' : '#ef444455', borderTop: `2px solid ${fits ? '#10b981' : '#ef4444'}`, borderBottom: `2px solid ${fits ? '#10b981' : '#ef4444'}` }}
            >
              {fits ? <Check className="h-4 w-4 shrink-0 text-emerald-700" /> : <X className="h-4 w-4 shrink-0 text-rose-700" />}
            </motion.div>
          )}
        </div>
        {scale !== null && (
          <p className={cn('mt-2 text-sm font-semibold', fits ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300')}>
            {formatCm(round.realCm)} cm ÷ {scale} = {formatCm(drawnCm)} cm na rysunku —{' '}
            {fits ? 'mieści się na kartce.' : 'wystaje poza kartkę!'}
          </p>
        )}
      </div>

      {fits && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next} style={{ backgroundColor: color }} className="gap-1.5 text-white hover:opacity-90">
            {isLast ? 'Dalej' : 'Kolejny rysunek'}
            {isLast ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
