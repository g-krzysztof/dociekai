'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Check, MessagesSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Wyszukiwanie w źródłach: zanim dziecko samo pójdzie szukać informacji do Z-1,
 * ćwiczy wyłuskiwanie faktów z dwóch źródeł, które podają trochę co innego.
 * Nie test — zła odpowiedź odsyła z powrotem do tekstu źródeł, nie zamyka
 * pozycji. Blok kończy się po poprawnym przypisaniu wszystkich czterech faktów.
 *
 * Pointa do wyniesienia: pojemność „dyskietki” zależy od typu (dlatego jedno
 * źródło podaje przedział, nie jedną liczbę), a żadne pojedyncze źródło nie
 * miało wszystkiego — stąd polecenie „w różnych źródłach” w zadaniu niżej,
 * gdzie przy każdej dyskietce stoi, z którego źródła pochodzi jej pojemność.
 */

type Origin = 'A' | 'B' | 'AB';

interface Fact {
  id: string;
  text: string;
  origin: Origin;
  note: string;
}

const FACTS: Fact[] = [
  {
    id: 'f1',
    text: 'Dyskietka 3,5-calowa mieści 1,44 MB.',
    origin: 'AB',
    note: 'Tę liczbę podają oba źródła — i to jest ta „pewna”, bo się zgadza.',
  },
  {
    id: 'f2',
    text: 'Dyskietki 5,25-calowe mieściły od 360 KB do 1,2 MB.',
    origin: 'B',
    note: 'Tylko forum wspomina starszy, większy typ. Encyklopedia szkolna go pomija.',
  },
  {
    id: 'f3',
    text: 'Dyskietki 3,5-calowe weszły do powszechnego użytku pod koniec lat 80.',
    origin: 'A',
    note: 'Datę podaje tylko encyklopedia. Forum skupia się na pojemnościach.',
  },
  {
    id: 'f4',
    text: 'Sprzedawano też dyskietki 3,5-calowe o pojemności 2,88 MB.',
    origin: 'B',
    note: 'Tylko forum. To wersja, z której mało kto korzystał — ale istniała.',
  },
];

const OPTIONS: { value: Origin; label: string }[] = [
  { value: 'A', label: 'Źródło A' },
  { value: 'B', label: 'Źródło B' },
  { value: 'AB', label: 'Oba źródła' },
];

interface SourceScanProps {
  color: string;
  onComplete?: () => void;
}

export function SourceScan({ color, onComplete }: SourceScanProps) {
  const [answers, setAnswers] = useState<Record<string, Origin>>({});

  const solved = FACTS.filter((fact) => answers[fact.id] === fact.origin).length;
  const finished = solved === FACTS.length;

  const answer = (fact: Fact, value: Origin) => {
    if (answers[fact.id] === fact.origin) return;
    const next = { ...answers, [fact.id]: value };
    setAnswers(next);
    if (FACTS.every((item) => next[item.id] === item.origin)) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Dwa źródła o dyskietkach. Przeczytaj oba, a potem przy każdym fakcie wskaż,{' '}
          <strong>skąd go wiadomo</strong>: z jednego źródła czy z obu.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {solved}/{FACTS.length}
        </p>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2">
        <article className="border p-3 text-sm leading-relaxed">
          <p className="mb-1.5 flex items-center gap-2 font-bold" style={{ color }}>
            <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
            Źródło A · encyklopedia szkolna
          </p>
          <p className="text-muted-foreground">
            Dyskietka to płaski, magnetyczny nośnik danych w plastikowej kopercie. Najbardziej znana
            wersja, 3,5-calowa, weszła do powszechnego użytku pod koniec lat 80. i mieściła 1,44 MB
            — mniej więcej tyle, co jeden dłuższy dokument tekstowy. Wyparły ją płyty CD, a potem
            pendrive’y.
          </p>
        </article>
        <article className="border p-3 text-sm leading-relaxed">
          <p className="mb-1.5 flex items-center gap-2 font-bold" style={{ color }}>
            <MessagesSquare className="h-4 w-4 shrink-0" aria-hidden />
            Źródło B · forum kolekcjonerów starego sprzętu
          </p>
          <p className="text-muted-foreground">
            „Dyskietka” to cała rodzina. Starsze, większe 5,25-calowe trzymały od 360 KB do 1,2 MB,
            zależnie od typu. Te 3,5-calowe to standardowo 1,44 MB, ale sprzedawano też wersje 2,88
            MB — mało kto z nich korzystał. Podając pojemność, zawsze mów, o którą dyskietkę chodzi.
          </p>
        </article>
      </div>

      <ul className="space-y-3">
        {FACTS.map((fact) => {
          const said = answers[fact.id];
          const settled = said === fact.origin;
          const wrong = said !== undefined && !settled;
          return (
            <li key={fact.id} className="border p-3">
              <p className="mb-2.5 flex items-start gap-2 text-sm leading-relaxed">
                {settled && (
                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                )}
                <span className={cn(settled && 'font-medium')}>{fact.text}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {OPTIONS.map((option) => {
                  const picked = said === option.value;
                  const isRight = settled && picked;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => answer(fact, option.value)}
                      disabled={settled}
                      aria-pressed={picked}
                      className={cn(
                        'inline-flex items-center border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm',
                        settled ? 'cursor-default' : 'cursor-pointer hover:bg-muted/60',
                        picked && !isRight && 'border-red-600 text-red-700 dark:text-red-400'
                      )}
                      style={
                        isRight
                          ? { borderColor: color, backgroundColor: `${color}14`, color }
                          : undefined
                      }
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {said !== undefined && (
                  <motion.p
                    key={settled ? 'ok' : 'nope'}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2.5 border-l-2 pl-3 text-sm leading-relaxed"
                    style={{ borderColor: settled ? color : '#dc2626' }}
                  >
                    {wrong ? (
                      <>
                        <span className="mr-1 inline-flex items-center font-semibold text-red-700 dark:text-red-400">
                          <X className="mr-1 h-4 w-4" aria-hidden />
                          Sprawdź w tekście.
                        </span>
                        Wróć do obu źródeł i znajdź to zdanie — w jednym z nich, w obu, albo w
                        żadnym.
                      </>
                    ) : (
                      fact.note
                    )}
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <p>
              <strong>Dwie rzeczy do zapamiętania.</strong> Po pierwsze: pojemność „dyskietki”{' '}
              <strong>zależy od typu</strong> — dlatego forum podaje przedział, a nie jedną liczbę.
              Po drugie: <strong>żadne pojedyncze źródło nie miało wszystkiego</strong>.
              Encyklopedia znała datę, forum — starsze typy.
            </p>
            <p className="mt-2">
              Z obu tych źródeł skorzystasz w zadaniu niżej — przy każdej dyskietce będzie napisane,
              skąd wiadomo, ile mieści.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
