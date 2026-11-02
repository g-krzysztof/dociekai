'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, MapPin, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Haczyk lekcji: jeden wesoły wpis, a w nim ukryte cztery informacje, których
 * obcy człowiek nie powinien mieć. Dziecko stuka fragmenty tekstu i przy każdym
 * dowiaduje się, co z niego wynika. Makieta wpisu jest w czystym DOM — świadomie
 * poza językiem wizualnym kursu, jak `DesktopFinder` w teście diagnostycznym.
 *
 * Klikanie nie blokuje; blok kończy się po odsłonięciu wszystkich czterech
 * fragmentów. Wtedy pokazuje się podsumowanie „co obcy wie z jednego posta”.
 */

interface Leak {
  id: string;
  /** Tekst fragmentu w zdaniu wpisu. */
  chunk: string;
  /** Co z tego wynika — odsłaniane po kliknięciu. */
  reveal: string;
  /** Krótkie hasło do listy podsumowania. */
  summary: string;
}

const LEAKS: Leak[] = [
  {
    id: 'wiek',
    chunk: 'moje 10. urodziny',
    reveal:
      'Obcy zna teraz twój wiek co do roku, a z datą wpisu — także dzień urodzin. To jedna z rzeczy, które podaje się przy zakładaniu kont „na kogoś innego”.',
    summary: 'ile masz lat i kiedy masz urodziny',
  },
  {
    id: 'adres',
    chunk: 'pod blokiem na Lipowej 4',
    reveal:
      'To jest twój adres. Ulica i numer wystarczą, żeby ktoś przyszedł pod twój dom — albo sprawdził w mapach, jak wygląda i kiedy nikogo nie ma.',
    summary: 'gdzie mieszkasz (ulica i numer)',
  },
  {
    id: 'nieobecnosc',
    chunk: 'jutro rano jedziemy całą rodziną do babci, wracamy w niedzielę',
    reveal:
      'Właśnie ogłosiłeś/ogłosiłaś, że przez trzy dni w domu nikogo nie będzie. Taka informacja przydaje się tylko jednej grupie osób — i nie są to twoi znajomi.',
    summary: 'kiedy nie ma was w domu',
  },
  {
    id: 'szkola',
    chunk: 'nowej klasie — SP nr 7',
    reveal:
      'Numer szkoły plus imię plus wiek to komplet, którym obca osoba może udawać, że cię zna: „jestem od was ze szkoły, pamiętasz?”.',
    summary: 'do której szkoły chodzisz',
  },
];

/** Wpis rozbity na kawałki: zwykły tekst (`string`) i klikalne fragmenty (`Leak`). */
const POST: (string | Leak)[] = [
  'Dziś ',
  LEAKS[0],
  '! 🎂 Dostałam rower i od razu przejażdżka ',
  LEAKS[1],
  '. ',
  LEAKS[2],
  '. A w poniedziałek pierwszy dzień w ',
  LEAKS[3],
  ' — trzymajcie kciuki!',
];

interface OnePostProps {
  color: string;
  onComplete?: () => void;
}

export function OnePost({ color, onComplete }: OnePostProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);

  const reveal = (id: string) => {
    setActive((prev) => (prev === id ? null : id));
    if (opened.includes(id)) return;
    const next = [...opened, id];
    setOpened(next);
    if (next.length === LEAKS.length) onComplete?.();
  };

  const finished = opened.length === LEAKS.length;
  const activeLeak = LEAKS.find((leak) => leak.id === active);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Oto wpis, który ktoś mógłby wrzucić do sieci. <strong>Stuknij fragmenty</strong>, które
          mówią o tobie za dużo — jest ich cztery.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {opened.length}/{LEAKS.length}
        </p>
      </div>

      {/* Makieta wpisu */}
      <div className="mx-auto max-w-md border bg-zinc-50 p-4 dark:bg-zinc-800/60">
        <div className="mb-3 flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: `${color}22`, color }}
          >
            <UserRound className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-sm font-semibold">Ty</span>
          <span className="ml-auto text-xs text-muted-foreground">przed chwilą</span>
        </div>

        <p className="text-sm leading-relaxed">
          {POST.map((part, index) => {
            if (typeof part === 'string') return <span key={index}>{part}</span>;
            const isOpen = opened.includes(part.id);
            const isActive = active === part.id;
            return (
              <button
                key={part.id}
                type="button"
                onClick={() => reveal(part.id)}
                className={cn(
                  'cursor-pointer border-b-2 px-0.5 transition-colors',
                  isOpen ? 'font-semibold' : 'border-dashed hover:bg-muted'
                )}
                style={
                  isOpen
                    ? { borderColor: color, color, backgroundColor: `${color}12` }
                    : { borderColor: 'var(--muted-foreground)' }
                }
                aria-expanded={isActive}
              >
                {part.chunk}
                {isOpen && <Check className="ml-0.5 inline h-3 w-3" aria-hidden />}
              </button>
            );
          })}
        </p>

        <div className="mt-3 flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          zdjęcie: ja przed blokiem
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeLeak && (
          <motion.p
            key={activeLeak.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto mt-4 max-w-md border-l-2 pl-3 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            {activeLeak.reveal}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <p className="mb-2">
              <strong>Z jednego wesołego wpisu obcy człowiek wie:</strong>
            </p>
            <ul className="space-y-1">
              {LEAKS.map((leak) => (
                <li key={leak.id} className="flex items-start gap-2">
                  <span style={{ color }} aria-hidden>
                    •
                  </span>
                  <span>{leak.summary}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3">
              Żaden z tych fragmentów osobno nie wygląda groźnie. Razem składają się na coś, czego
              nie chcesz dawać nieznajomym. Ta lekcja jest o tym, co zostawiać przy sobie — i jak
              pilnować haseł.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
