'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Laptop, Server, Wifi, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Haczyk lekcji: skąd bierze się strona, którą dziecko właśnie czyta? Trzy
 * kandydaci — własny komputer, domowy router, odległy serwer — a przy każdym
 * wyborze osobne wyjaśnienie, także przy złym (wzorzec `LicenseCall`).
 *
 * To haczyk, nie test: zły wybór nie blokuje, tylko odsyła do pytania „skąd
 * znika strona, gdy wyłączysz internet, choć komputer działa dalej?". Trafienie
 * w serwer odsłania krótki pasek „kopia przyjechała do ciebie" i kończy blok.
 */

interface Option {
  id: string;
  label: string;
  icon: typeof Laptop;
  correct?: boolean;
  note: string;
}

const OPTIONS: Option[] = [
  {
    id: 'komputer',
    label: 'Jest zapisana na twoim komputerze',
    icon: Laptop,
    note: 'Twój komputer nie ma jej w środku. Dostał ją przed chwilą i zaraz o niej zapomni — gdy zamkniesz kartę, znika.',
  },
  {
    id: 'router',
    label: 'Jest w routerze, który stoi u ciebie w domu',
    icon: Wifi,
    note: 'Router tylko przepuszcza dane dalej, jak skrzyżowanie na drodze. Sam niczego nie przechowuje.',
  },
  {
    id: 'serwer',
    label: 'Jest na innym komputerze, czasem po drugiej stronie świata',
    icon: Server,
    correct: true,
    note: 'Ta strona mieszka na komputerze zwanym serwerem. Kiedy ją otworzyłeś/otworzyłaś, serwer wysłał ci jej kopię — i ta kopia przyjechała do ciebie w ułamku sekundy.',
  },
];

interface PageOriginProps {
  color: string;
  onComplete?: () => void;
}

export function PageOrigin({ color, onComplete }: PageOriginProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const solved = picked === 'serwer';
  const current = OPTIONS.find((option) => option.id === picked);

  const choose = (id: string) => {
    if (solved) return;
    setPicked(id);
    if (id === 'serwer') onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-5 text-sm leading-relaxed sm:text-base">
        Czytasz teraz tę stronę na swoim ekranie. Ale <strong>gdzie ona tak naprawdę jest</strong>?
      </p>

      <ul className="space-y-2">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const isPicked = picked === option.id;
          const isRight = isPicked && Boolean(option.correct);
          const isWrong = isPicked && !option.correct;
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => choose(option.id)}
                disabled={solved}
                aria-pressed={isPicked}
                className={cn(
                  'flex w-full items-start gap-3 border p-3 text-left text-sm leading-relaxed transition-colors sm:text-base',
                  solved ? 'cursor-default' : 'cursor-pointer hover:bg-muted/50',
                  isWrong && 'border-red-600 text-red-700 dark:text-red-400'
                )}
                style={
                  isRight ? { borderColor: color, backgroundColor: `${color}14`, color } : undefined
                }
              >
                <Icon
                  className="mt-0.5 h-5 w-5 shrink-0"
                  style={{ color: isRight ? color : undefined }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">{option.label}</span>
                {isRight && <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />}
              </button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 pl-3 text-sm leading-relaxed"
            style={{ borderColor: solved ? color : '#dc2626' }}
          >
            {!solved && (
              <span className="mr-1 inline-flex items-center font-semibold text-red-700 dark:text-red-400">
                <X className="mr-1 h-4 w-4" aria-hidden />
                Jeszcze nie.
              </span>
            )}
            {current.note}
            {!solved && (
              <span className="mt-1 block text-muted-foreground">
                Podpowiedź: skąd znika strona, gdy wyłączysz internet, choć komputer działa dalej?
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {solved && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 border-t-2 pt-5"
            style={{ borderColor: color }}
          >
            <JourneyStrip color={color} />
            <p className="mt-4 text-sm leading-relaxed">
              <strong>Nic, co widzisz w internecie, nie jest u ciebie.</strong> Za każdym razem to
              kopia, którą przysłał inny komputer. Reszta lekcji jest o tym, jak ta kopia do ciebie
              trafia.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Trzy przystanki i kropka, która raz przejeżdża od serwera do ekranu dziecka. */
function JourneyStrip({ color }: { color: string }) {
  const nodes = [
    { x: 34, label: 'Serwer' },
    { x: 150, label: 'Internet' },
    { x: 266, label: 'Twój ekran' },
  ];
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <svg
        viewBox="0 0 300 66"
        className="h-16 w-full min-w-[300px]"
        role="img"
        aria-label="Kopia strony jedzie z serwera przez internet na twój ekran."
      >
        <line x1={34} y1={26} x2={266} y2={26} stroke={`${color}40`} strokeWidth={2} />
        {nodes.map((node) => (
          <g key={node.label}>
            <circle cx={node.x} cy={26} r={5} fill="var(--background)" stroke={color} strokeWidth={2} />
            <text x={node.x} y={52} textAnchor="middle" className="fill-muted-foreground text-[9px]">
              {node.label}
            </text>
          </g>
        ))}
        <motion.circle
          cx={34}
          cy={26}
          r={4}
          fill={color}
          initial={{ x: 0 }}
          animate={{ x: [0, 232] }}
          transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.5, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}
