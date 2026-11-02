'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Undo2 } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';
import { cn } from '@/lib/utils';
import { formatMoney } from '../lib/money';
import { MoneyToken } from './money-token';

interface TillProps {
  denominations: readonly number[];
  picked: number[];
  onAdd: (value: number) => void;
  onUndo: () => void;
  onSubmit: () => void;
  color: string;
  disabled?: boolean;
}

/**
 * Kasa: nominały do kliknięcia + taca na wybraną resztę + przycisk zatwierdzenia.
 * Celowo nie pokazuje, ile dokładnie trzeba wydać — tylko sumę tego, co dziecko
 * już wybrało — bo docelową kwotę trzeba samodzielnie policzyć z ceny i wpłaty
 * w <OrderPanel>. Błędne kliknięcie nigdy nie jest karane w locie, tylko przy
 * zatwierdzeniu (ten sam "brak błędnego kliknięcia" co w innych widgetach).
 */
export function Till({ denominations, picked, onAdd, onUndo, onSubmit, color, disabled }: TillProps) {
  const total = picked.reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/45">
          Kasa — kliknij, żeby dodać do reszty
        </p>
        <div className="flex flex-wrap gap-2" data-testid="till-denominations">
          {denominations.map((value, i) => (
            <MoneyToken
              key={`${value}-${i}`}
              value={value}
              color={color}
              onClick={() => onAdd(value)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      <div className="border-t-2 p-3 sm:p-4" style={{ borderColor: `${color}59`, backgroundColor: `${color}0a` }}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/45">Reszta do wydania</p>
          <button
            type="button"
            onClick={onUndo}
            disabled={disabled || picked.length === 0}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-medium text-white/50 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Undo2 className="h-3.5 w-3.5" aria-hidden />
            Cofnij
          </button>
        </div>

        <div className="mb-4 flex min-h-14 flex-wrap items-center gap-2" data-testid="tray">
          {picked.length === 0 && <p className="text-sm text-white/40">Kliknij nominał w kasie powyżej.</p>}
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

        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-xl font-bold tabular-nums text-white sm:text-2xl" data-testid="till-total">
            {formatMoney(total)}
          </span>
          <AnimatedButton
            animation="shimmer-border-glow"
            glowColor={color}
            shimmerColor={color}
            glowRadius={6}
            data-testid="submit-change"
            className={cn(
              'gap-2 px-5 py-2.5 text-sm font-semibold text-white',
              (disabled || picked.length === 0) && 'pointer-events-none opacity-40',
            )}
            onClick={disabled || picked.length === 0 ? undefined : onSubmit}
          >
            Wydaj resztę
          </AnimatedButton>
        </div>
      </div>
    </div>
  );
}
