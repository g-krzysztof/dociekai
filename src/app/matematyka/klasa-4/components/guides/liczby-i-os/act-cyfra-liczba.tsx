'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { Beat, GuideAct } from '../guide-act';
import { DIGITS_0_9, SHUFFLE_DIGITS } from './guide-content';

function randomOrder(length: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** Losuje układ, ale unika liczby zaczynającej się od zera — brzydko się czyta. */
function shuffledOrder(digits: number[]): number[] {
  for (let attempt = 0; attempt < 20; attempt++) {
    const order = randomOrder(digits.length);
    if (digits[order[0]] !== 0) return order;
  }
  return randomOrder(digits.length);
}

export function ActCyfraLiczba({ color }: { color: string }) {
  return (
    <GuideAct id="cyfra-liczba" mode="flow">
      <CyfraLiczbaBody color={color} />
    </GuideAct>
  );
}

function CyfraLiczbaBody({ color }: { color: string }) {
  const [order, setOrder] = useState(() => SHUFFLE_DIGITS.map((_, i) => i));
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const value = Number(order.map((i) => SHUFFLE_DIGITS[i]).join(''));

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">
        Cyfra to nie to samo, co liczba
      </h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Cyfr jest tylko dziesięć — to znaki, którymi piszesz. Liczb jest nieskończenie wiele — to
        to, co z tych znaków ułożysz.
      </p>

      <Beat at={0.1} className="mb-8">
        <div className="flex flex-wrap justify-center gap-1.5 sm:justify-start sm:gap-2">
          {DIGITS_0_9.map((digit) => (
            <span
              key={digit}
              className="flex h-10 w-10 items-center justify-center border font-mono text-lg font-black sm:h-12 sm:w-12 sm:text-xl"
              style={{ borderColor: `${color}40`, backgroundColor: `${color}0c`, color }}
            >
              {digit}
            </span>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground sm:text-left">
          Dziesięć cyfr. Tyle wystarczy na każdą liczbę, jaka istnieje.
        </p>
      </Beat>

      <Beat at={0.45}>
        <div
          className="border-l-4 p-4 sm:p-5"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <p
            className="mb-1 text-xs font-bold uppercase tracking-[0.15em]"
            style={{ color: textColor }}
          >
            Te same cztery cyfry
          </p>
          <p className="mb-4 text-sm leading-relaxed sm:text-base">
            2, 0, 2, 6 — zawsze te same cyfry. Zmień ich kolejność, a dostaniesz zupełnie inną
            liczbę.
          </p>

          <div className="mb-3 flex items-center justify-center gap-1 sm:gap-1.5">
            {order.map((i) => (
              <motion.span
                layout
                key={i}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                className="font-mono text-4xl font-black leading-none sm:text-5xl"
                style={{ color }}
              >
                {SHUFFLE_DIGITS[i]}
              </motion.span>
            ))}
          </div>

          <p className="mb-4 text-center text-sm text-muted-foreground">
            To liczba: <strong style={{ color: textColor }}>{value.toLocaleString('pl-PL')}</strong>
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setOrder(shuffledOrder(SHUFFLE_DIGITS))}
              className="inline-flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ borderColor: color, color }}
            >
              <Shuffle className="h-4 w-4" aria-hidden />
              Przetasuj cyfry
            </button>
          </div>
        </div>
      </Beat>
    </>
  );
}
