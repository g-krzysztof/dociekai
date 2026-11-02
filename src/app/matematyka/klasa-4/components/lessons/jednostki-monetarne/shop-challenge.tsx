'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { COIN_VALUES, formatMoney } from '../../../lib/money';
import { MoneyPurse } from './money-purse';
import { MoneyToken } from './money-token';

interface ShopItem {
  id: string;
  name: string;
  price: number;
}

const ITEMS: ShopItem[] = [
  { id: 'bulka', name: 'Bułka', price: 250 },
  { id: 'sok', name: 'Sok', price: 320 },
  { id: 'jablko', name: 'Jabłko', price: 110 },
  { id: 'ciastko', name: 'Ciastko', price: 180 },
  { id: 'banan', name: 'Banan', price: 150 },
];

const PAID = 1000; // banknot 10 zł

interface ShopChallengeProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: kupujesz dwie rzeczy w sklepiku szkolnym, płacisz
 * banknotem 10 zł, a potem sam/a wydajesz sobie resztę — drugie zastosowanie
 * flagowego `<MoneyPurse>` z tej lekcji, tym razem z celem równym reszcie
 * zamiast dowolnie wybranej kwocie.
 */
export function ShopChallenge({ color, onComplete }: ShopChallengeProps) {
  const [phase, setPhase] = useState<'wybor' | 'reszta' | 'gotowe'>('wybor');
  const [selected, setSelected] = useState<string[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const containerRef = useSectionScrollAnchor(phase);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const chosenItems = ITEMS.filter((item) => selected.includes(item.id));
  const cost = chosenItems.reduce((sum, item) => sum + item.price, 0);
  const change = PAID - cost;
  const total = picked.reduce((sum, value) => sum + value, 0);
  const reached = total === change;

  const add = (value: number) => setPicked((prev) => [...prev, value]);
  const undo = () => setPicked((prev) => prev.slice(0, -1));

  return (
    <div ref={containerRef} className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <ShoppingBag className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          W sklepiku szkolnym płacisz zawsze banknotem 10 zł — Twoim zadaniem jest samodzielnie
          wydać sobie resztę co do grosza.
        </p>
      </div>

      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        {phase === 'wybor' && (
          <>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Wybierz dokładnie <strong>dwie</strong> rzeczy, które dziś kupujesz.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {ITEMS.map((item) => {
                const isPicked = selected.includes(item.id);
                const disabled = !isPicked && selected.length >= 2;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.id)}
                    disabled={disabled}
                    className={cn(
                      'flex items-center justify-between gap-3 border px-4 py-3 text-left text-sm transition-all sm:text-base disabled:cursor-not-allowed disabled:opacity-40',
                      !disabled && !isPicked && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                      isPicked && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {isPicked && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                      {item.name}
                    </span>
                    <span className="font-mono font-bold tabular-nums" style={{ color }}>
                      {formatMoney(item.price)}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">Razem do zapłaty:</span>
              <span className="font-mono text-xl font-black tabular-nums" style={{ color }}>
                {formatMoney(cost)}
              </span>
            </div>

            {selected.length === 2 && (
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setPhase('reszta')} className="gap-1.5">
                  Płacę banknotem 10 zł
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {phase !== 'wybor' && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Kupujesz: <strong>{chosenItems.map((item) => item.name).join(' i ')}</strong> za{' '}
                <strong>{formatMoney(cost)}</strong>. Płacisz:
              </p>
              <MoneyToken value={PAID} color={color} />
            </div>

            <p className="mb-4 text-sm font-semibold" style={{ color }}>
              Ile reszty musisz wydać? Ułóż ją z monet.
            </p>

            <MoneyPurse
              denominations={COIN_VALUES}
              picked={picked}
              onAdd={add}
              onUndo={undo}
              color={color}
              target={change}
              walletLabel="Kasa — kliknij, żeby wydać monetę"
              trayLabel="Reszta, którą wydajesz"
            />

            {reached && phase === 'reszta' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 space-y-4 border-t pt-4"
              >
                <p className="text-sm leading-relaxed sm:text-base">
                  Dokładnie tyle! 10 zł − {formatMoney(cost)} = {formatMoney(change)}.
                </p>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setPhase('gotowe');
                      onComplete?.();
                    }}
                    className="gap-1.5"
                  >
                    Zamknij kasę
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
