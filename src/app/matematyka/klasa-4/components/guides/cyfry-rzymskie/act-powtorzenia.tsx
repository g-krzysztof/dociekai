'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GuideAct } from '../guide-act';
import { ROMAN_SYMBOLS, toRoman } from '../../../lib/roman';

const MAX_REPEATS = 3;

/** Pary „dwa takie same = następny symbol” — wyliczone z tabeli, nie wpisane. */
const NON_REPEATABLE = ROMAN_SYMBOLS.filter((item) => !item.repeatable).map((item) => {
  const doubled = ROMAN_SYMBOLS.find((other) => other.value === item.value * 2)!;
  return { symbol: item.symbol, value: item.value, next: doubled.symbol, nextValue: doubled.value };
});

export function ActPowtorzenia({ color }: { color: string }) {
  const [count, setCount] = useState(0);
  const [refused, setRefused] = useState(false);
  const [flipped, setFlipped] = useState<string | null>(null);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const add = () => {
    if (count >= MAX_REPEATS) {
      setRefused(true);
      window.setTimeout(() => setRefused(false), 600);
      return;
    }
    setCount((prev) => prev + 1);
  };

  return (
    <GuideAct id="powtorzenia" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">
        Najwyżej trzy takie same pod rząd
      </h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Spróbuj dołożyć czwartą jedynkę. Zapis się nie zgodzi — i właśnie dlatego istnieje druga
        zasada, którą poznasz za chwilę.
      </p>

      <div className="mb-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <motion.div
          animate={refused ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-4 flex min-h-[72px] items-center justify-center gap-2"
        >
          {count === 0 ? (
            <span className="text-sm text-muted-foreground">Kliknij „+ I”, żeby zacząć</span>
          ) : (
            Array.from({ length: count }, (_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border px-4 py-2 font-mono text-3xl font-black leading-none"
                style={{
                  borderColor: refused ? '#f43f5e' : `${color}59`,
                  color: refused ? '#f43f5e' : color,
                }}
              >
                I
              </motion.span>
            ))
          )}
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={add}
            className="inline-flex cursor-pointer items-center gap-1.5 border px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            style={{ backgroundColor: color, borderColor: color }}
          >
            <Plus className="h-4 w-4" />I
          </button>
          {count > 0 && (
            <>
              <span
                className="font-mono text-lg font-bold tabular-nums"
                style={{ color: textColor }}
              >
                = {count}
              </span>
              <button
                type="button"
                onClick={() => setCount(0)}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                <RotateCcw className="h-3 w-3" />
                Od nowa
              </button>
            </>
          )}
        </div>

        <AnimatePresence>
          {refused && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 bg-amber-50 p-3 text-center text-sm leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            >
              <strong>Czwarty raz się nie da.</strong> Dlatego 4 to {toRoman(4)} — o tym jest
              następny rozdział.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <p className="mb-4 max-w-2xl text-base leading-relaxed sm:text-lg">
        Trzy takie same znaki pod rząd to maksimum. Ale{' '}
        <strong>V, L i D nie powtarzają się nigdy</strong> — i to nie jest reguła do wykucia, tylko
        prosty wniosek. Odwróć karty.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {NON_REPEATABLE.map((item) => {
          const open = flipped === item.symbol;
          return (
            <button
              key={item.symbol}
              type="button"
              onClick={() => setFlipped(open ? null : item.symbol)}
              aria-pressed={open}
              className={cn(
                'cursor-pointer border p-4 text-center transition-all',
                !open && 'hover:-translate-y-0.5 hover:shadow-md'
              )}
              style={{
                borderColor: open ? color : `${color}40`,
                backgroundColor: open ? `${color}0c` : undefined,
              }}
            >
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.span
                    key="back"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="block"
                  >
                    <span className="block font-mono text-2xl font-black" style={{ color }}>
                      {item.symbol} + {item.symbol} = {item.next}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {item.value} + {item.value} = {item.nextValue}
                    </span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="front"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="block"
                  >
                    <span className="block font-mono text-2xl font-black" style={{ color }}>
                      {item.symbol}
                      {item.symbol}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      Dlaczego tak się nie pisze?
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Dwa takie same znaki to już po prostu następny symbol — dlatego nie ma powodu ich powtarzać.
        Najwięcej powtórzeń zobaczysz w {toRoman(3000)} = 3000: trzy razy M.
      </p>
    </GuideAct>
  );
}
