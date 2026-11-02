'use client';

import { motion } from 'framer-motion';
import { Ghost, Orbit, Rocket, Satellite, Sparkles, Star, type LucideIcon } from 'lucide-react';
import { formatMoney } from '../lib/money';
import { MoneyToken } from './money-token';

interface OrderPanelProps {
  itemName: string;
  priceGr: number;
  paidGr: number;
  patienceMs: number;
  color: string;
  roundKey: number;
  phase: 'playing' | 'resolving';
}

const CUSTOMERS: { icon: LucideIcon; label: string }[] = [
  { icon: Rocket, label: 'Pilot z Marsa' },
  { icon: Sparkles, label: 'Iskierka z Andromedy' },
  { icon: Ghost, label: 'Zjawa z Plutona' },
  { icon: Star, label: 'Wędrowiec gwiezdny' },
  { icon: Orbit, label: 'Krążownik z Neptuna' },
  { icon: Satellite, label: 'Satelitka z pierścieni' },
];

/** Karta klienta: kto przyszedł, po co, ile płaci i ile czasu zostało cierpliwości. Reszty nie pokazujemy — trzeba ją policzyć samemu z ceny i wpłaty. */
export function OrderPanel({ itemName, priceGr, paidGr, patienceMs, color, roundKey, phase }: OrderPanelProps) {
  const customer = CUSTOMERS[roundKey % CUSTOMERS.length];
  const Icon = customer.icon;

  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-3 sm:p-4" data-testid="order-panel">
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          key={roundKey}
          className="h-full origin-left rounded-full"
          style={{ backgroundColor: color }}
          initial={{ scaleX: 1 }}
          animate={phase === 'playing' ? { scaleX: 0 } : undefined}
          transition={{ duration: patienceMs / 1000, ease: 'linear' }}
        />
      </div>

      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 sm:h-12 sm:w-12"
          style={{ borderColor: color, boxShadow: `0 0 16px ${color}55` }}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color }} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white sm:text-base">{customer.label}</p>
          <p className="truncate text-xs text-white/50 sm:text-sm">{itemName}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/45 sm:text-xs">Cena</p>
          <p className="font-mono text-lg font-bold tabular-nums text-white sm:text-xl" data-testid="order-price">
            {formatMoney(priceGr)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-white/45 sm:text-xs">Zapłacono</p>
          <div className="mt-0.5" data-testid="order-paid">
            <MoneyToken value={paidGr} color={color} size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
