'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '../../../lib/money';
import { MoneyToken } from './money-token';

export interface MoneyPurseProps {
  /** Nominały dostępne w portfelu, w groszach. */
  denominations: readonly number[];
  /** Wybrane nominały, w kolejności dodania — stan leży u wywołującego. */
  picked: number[];
  onAdd: (value: number) => void;
  onUndo: () => void;
  color: string;
  /** Kwota docelowa w groszach — pominięta, gdy widget służy tylko do swobodnego liczenia. */
  target?: number;
  walletLabel?: string;
  trayLabel?: string;
}

/**
 * Flagowy widget lekcji: „portfel" nominałów do kliknięcia + „taca" na to, co
 * już wybrano, z sumą na żywo w groszach i złotych. Ten sam mechanizm
 * obsługuje dwa scenariusze w tej lekcji — swobodne budowanie kwoty (Nowe
 * pojęcie) i wydawanie reszty (Zadanie problemowe) — sterowane wyłącznie
 * przez `target` i zestaw `denominations`. Stan wybranych monet leży u
 * wywołującego (ten sam podział odpowiedzialności co `<JumpLine>`/`<ArrayGrid>`)
 * — tu tylko renderowanie i policzenie sumy. Kliknięcie nigdy nie jest
 * „błędne": dziecko może przelicytować cel i cofnąć się jednym przyciskiem,
 * tak jak `Cofnij ostatni skok`/`Cofnij ostatni symbol` w innych lekcjach
 * modułu. Gdy suma po raz pierwszy przekroczy kolejną pełną setkę groszy,
 * na moment pojawia się podpowiedź „100 gr to 1 zł" — dokładnie ten moment,
 * w którym grosze i złote się łączą.
 */
export function MoneyPurse({
  denominations,
  picked,
  onAdd,
  onUndo,
  color,
  target,
  walletLabel = 'Portfel — kliknij, żeby dodać',
  trayLabel = 'Twoja taca',
}: MoneyPurseProps) {
  const total = picked.reduce((sum, value) => sum + value, 0);
  const prevTotalRef = useRef(total);
  const [zlotyBadge, setZlotyBadge] = useState(false);

  useEffect(() => {
    const prev = prevTotalRef.current;
    prevTotalRef.current = total;
    if (total > prev && Math.floor(total / 100) > Math.floor(prev / 100)) {
      setZlotyBadge(true);
      const timeout = setTimeout(() => setZlotyBadge(false), 1800);
      return () => clearTimeout(timeout);
    }
  }, [total]);

  const diff = target !== undefined ? target - total : undefined;

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {walletLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {denominations.map((value, i) => (
            <MoneyToken key={`${value}-${i}`} value={value} color={color} onClick={() => onAdd(value)} />
          ))}
        </div>
      </div>

      <div
        className="border-t-2 p-4 sm:p-5"
        style={{ borderColor: `${color}59`, backgroundColor: `${color}0a` }}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {trayLabel}
          </p>
          <button
            type="button"
            onClick={onUndo}
            disabled={picked.length === 0}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Undo2 className="h-3.5 w-3.5" aria-hidden />
            Cofnij ostatnią monetę
          </button>
        </div>

        <div className="mb-4 flex min-h-16 flex-wrap items-center gap-2">
          {picked.length === 0 && (
            <p className="text-sm text-muted-foreground">Kliknij nominał w portfelu powyżej.</p>
          )}
          <AnimatePresence mode="popLayout">
            {picked.map((value, i) => (
              <motion.div
                key={`tray-${i}-${value}`}
                layout
                initial={{ opacity: 0, y: -10, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 380, damping: 24 }}
              >
                <MoneyToken value={value} color={color} size="sm" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="relative flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="font-mono text-2xl font-black tabular-nums sm:text-3xl" style={{ color }}>
            {formatMoney(total)}
          </span>

          {target !== undefined && (
            <span
              className={cn(
                'text-sm font-semibold',
                diff === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
              )}
            >
              {diff === 0
                ? 'Dokładnie tyle! 🎉'
                : diff !== undefined && diff > 0
                  ? `Brakuje: ${formatMoney(diff)}`
                  : `Za dużo o: ${formatMoney(Math.abs(diff ?? 0))}`}
            </span>
          )}

          <AnimatePresence>
            {zlotyBadge && (
              <motion.span
                initial={{ opacity: 0, y: 4, scale: 0.85 }}
                animate={{ opacity: 1, y: -24, scale: 1 }}
                exit={{ opacity: 0, y: -36 }}
                transition={{ duration: 0.4 }}
                className="pointer-events-none absolute left-0 top-0 text-xs font-bold"
                style={{ color }}
              >
                100 gr to dokładnie 1 zł!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
