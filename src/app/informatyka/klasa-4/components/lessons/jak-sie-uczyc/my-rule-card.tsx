'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Zamknięcie lekcji: z sześciu zasad dziecko wybiera jedną, którą wprowadza
 * u siebie od dziś, i dostaje ją w formie kartki do przepisania i powieszenia
 * nad biurkiem.
 *
 * Jedna, a nie wszystkie — postanowienie „od jutra robię sześć rzeczy inaczej”
 * nie przeżywa tygodnia. Pole na miejsce przypomnienia jest opcjonalne i nie
 * blokuje ukończenia bloku; nie prosimy tu o żadne dane o dziecku.
 */

const RULES = [
  'Ekran na wyciągnięcie ręki — nie bliżej.',
  'Górna krawędź ekranu na wysokości oczu.',
  'Stopy płasko: na podłodze albo na podnóżku.',
  'Co 20 minut patrzę 20 sekund w dal.',
  'Co 45 minut wstaję od biurka.',
  'Żadnych napojów obok klawiatury.',
];

interface MyRuleCardProps {
  color: string;
  onComplete?: () => void;
}

export function MyRuleCard({ color, onComplete }: MyRuleCardProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const [place, setPlace] = useState('');

  const choose = (rule: string) => {
    setPicked(rule);
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Sześć zasad naraz nie przeżyje tygodnia. <strong>Wybierz jedną</strong> — tę, którą u ciebie
        w domu najbardziej trzeba poprawić. Resztą zajmiesz się, kiedy ta jedna wejdzie ci w nawyk.
      </p>

      <ul className="grid gap-2 sm:grid-cols-2">
        {RULES.map((rule) => {
          const isPicked = picked === rule;
          return (
            <li key={rule}>
              <button
                type="button"
                onClick={() => choose(rule)}
                aria-pressed={isPicked}
                className={cn(
                  'flex h-full w-full cursor-pointer items-start gap-3 border p-3 text-left text-sm leading-relaxed transition-colors',
                  isPicked ? 'font-semibold' : 'hover:bg-muted/40'
                )}
                style={isPicked ? { borderColor: color, backgroundColor: `${color}12` } : undefined}
              >
                <Pin
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: isPicked ? color : 'var(--muted-foreground)' }}
                  aria-hidden
                />
                {rule}
              </button>
            </li>
          );
        })}
      </ul>

      {picked && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Twoja kartka nad biurko — przepisz ją na papier
          </p>

          <div
            className="mx-auto max-w-md border-t-2 p-6 text-center"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color }}>
              Od dziś
            </p>
            <p className="mt-3 text-lg font-bold leading-snug sm:text-xl">{picked}</p>
          </div>

          <div className="mt-5 max-w-md">
            <label
              htmlFor="my-rule-place"
              className="mb-1.5 block text-sm font-semibold"
            >
              Gdzie ją powiesisz? <span className="font-normal text-muted-foreground">(nieobowiązkowe)</span>
            </label>
            <input
              id="my-rule-place"
              type="text"
              value={place}
              onChange={(event) => setPlace(event.target.value)}
              placeholder="np. na ramce monitora, na lampce, na drzwiach"
              className="w-full border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
            />
            {place.trim().length > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Świetnie — kartka działa tylko wtedy, gdy wisi tam, gdzie i tak patrzysz.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
