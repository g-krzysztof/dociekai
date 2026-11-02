'use client';

import { useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SolveToken {
  id: string;
  text: string;
  type: 'number' | 'operator';
}

export interface SolveStep {
  tokens: SolveToken[];
  /** Id-ki tokenów tworzących klikalne podwyrażenie w tym kroku — puste w ostatnim kroku (wynik). */
  activeIds: string[];
  /** Dlaczego akurat to liczymy teraz — pomijane w ostatnim kroku. */
  hint?: string;
}

interface ExpressionSolverProps {
  steps: SolveStep[];
  color: string;
  ariaLabel: string;
  className?: string;
}

/**
 * Wyrażenie rozwiązywane krok po kroku: dziecko klika WŁAŚCIWĄ następną część
 * do policzenia (podświetnioną kapsułą), reszta tokenów nie ma uchwytu
 * zdarzeń, więc błędnej kolejności po prostu nie da się kliknąć — ten sam
 * „żaden klik nie jest zły, tylko część kliknięć jest niedostępna" duch co
 * przy chip-pickerach w lekcjach, przeniesiony na wybór *kolejności*
 * obliczeń zamiast wyboru wartości. Krok po kroku wiersz wymienia się na
 * krótszy — świadomie ta sama, już sprawdzona technika co w
 * `ShiftExamples`/`RemainderExamples` (`key={index}` + `AnimatePresence
 * mode="wait"`), a nie osobne pozycjonowanie każdego tokenu — przy
 * wyrażeniu, które faktycznie traci tokeny między krokami, krzyżowe
 * przenikanie całego wiersza czyta się równie czysto i jest niezawodne.
 */
export function ExpressionSolver({ steps, color, ariaLabel, className }: ExpressionSolverProps) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const isFinal = index === steps.length - 1;
  const activeSet = new Set(step.activeIds);

  const advance = () => setIndex((prev) => Math.min(steps.length - 1, prev + 1));
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      advance();
    }
  };

  const runs: { key: string; tokens: SolveToken[]; active: boolean }[] = [];
  for (const token of step.tokens) {
    const active = activeSet.has(token.id);
    const last = runs[runs.length - 1];
    if (last && last.active === active) last.tokens.push(token);
    else runs.push({ key: token.id, tokens: [token], active });
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', className)} role="group" aria-label={ariaLabel}>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-1"
        >
          {runs.map((run) => (
            <div
              key={run.key}
              role={run.active ? 'button' : undefined}
              tabIndex={run.active ? 0 : undefined}
              onClick={run.active ? advance : undefined}
              onKeyDown={run.active ? handleKeyDown : undefined}
              className={cn(
                'flex items-center gap-1 px-2 py-1.5 transition-all sm:px-3 sm:py-2',
                run.active && 'cursor-pointer border-2 hover:-translate-y-0.5 hover:shadow-md'
              )}
              style={run.active ? { borderColor: color, backgroundColor: `${color}14` } : undefined}
            >
              {run.tokens.map((token) => (
                <span
                  key={token.id}
                  className={cn(
                    'font-mono font-black tabular-nums',
                    token.type === 'number' ? 'text-2xl sm:text-3xl' : 'text-xl text-muted-foreground sm:text-2xl'
                  )}
                  style={token.type === 'number' ? { color } : undefined}
                >
                  {token.text}
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {!isFinal ? (
        <p className="max-w-md text-center text-sm text-muted-foreground sm:text-base">
          {step.hint} <span className="font-semibold" style={{ color }}>Kliknij podświetloną część.</span>
        </p>
      ) : (
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color }}>
            <Check className="h-4 w-4" aria-hidden />
            Gotowe!
          </span>
          {index > 0 && (
            <button
              type="button"
              onClick={() => setIndex(0)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <RotateCcw className="h-3 w-3" aria-hidden />
              Od nowa
            </button>
          )}
        </div>
      )}
    </div>
  );
}
