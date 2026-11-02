'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ClockFace } from '../../clock-face';

interface ClockCardProps {
  color: string;
  hours24: number;
  minutes: number;
  /** Krótki opis kontekstu nad tarczą, np. „Budzik dzwoni o" — opcjonalny. */
  context?: string;
  /** Treść odsłaniana po kliknięciu. */
  reveal: ReactNode;
  /** Zwykły tekst tej samej treści — zawsze w DOM jako `sr-only`, żeby odczyt nie zależał od kliknięcia. */
  srRevealText: string;
  innerRing?: boolean;
  ariaLabel: string;
}

/**
 * Klikalna karta: tarcza zegara + przycisk odsłaniający odczyt. Ten sam „no
 * wrong click, tylko odsłonięcie" duch co `PrefixLadder`, użyty tu w dwóch
 * aktach z inną treścią karty (kwadranse i zapis 12/24-godzinny) — ta sama
 * zasada powtórzenia komponentu z inną daną co przy `PrefixLadder`.
 */
export function ClockCard({
  color,
  hours24,
  minutes,
  context,
  reveal,
  srRevealText,
  innerRing = false,
  ariaLabel,
}: ClockCardProps) {
  const [open, setOpen] = useState(false);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="border p-3 text-center sm:p-4" style={{ borderColor: `${color}40` }}>
      {context && (
        <p className="mb-2 min-h-8 text-xs font-semibold text-muted-foreground sm:text-sm">
          {context}
        </p>
      )}
      <ClockFace
        color={color}
        hours24={hours24}
        minutes={minutes}
        innerRing={innerRing}
        size={140}
        ariaLabel={ariaLabel}
      />
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 border-2 px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm"
        style={{
          borderColor: color,
          color: textColor,
          backgroundColor: open ? `${color}1f` : undefined,
        }}
      >
        {open ? 'Ukryj' : 'Jak to przeczytać?'}
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="mt-3 border-l-4 p-3 text-left text-sm leading-relaxed"
              style={{ borderColor: color, backgroundColor: `${color}0c` }}
            >
              {reveal}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && <span className="sr-only">{srRevealText}</span>}
    </div>
  );
}
