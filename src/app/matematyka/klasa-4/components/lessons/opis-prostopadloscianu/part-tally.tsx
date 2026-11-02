'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SolidSpinner, type SolidPart } from '../../solid-spinner';
import { BOX_PARTS, type BoxSpec } from '../../../lib/solids';

const SPEC: BoxSpec = { width: 4.6, height: 3, depth: 3.4 };

interface Round {
  part: SolidPart;
  total: number;
  title: string;
  /** Mianownik liczby mnogiej — „ściany", do etykiet i przycisków. */
  nameMany: string;
  /** Dopełniacz liczby mnogiej — „ścian", po „brakuje jeszcze 3…". Liczby są tu
   *  stałe (6/12/8), więc dwie gotowe formy są pewniejsze niż `plural()`. */
  nameGenitive: string;
  hint: string;
  /** Ile sztuk widać naraz z jednego ustawienia — to jest cała pointa tego kroku. */
  visibleAtOnce: number;
}

const ROUNDS: Round[] = [
  {
    part: 'sciany',
    total: BOX_PARTS.sciany,
    title: 'Policz ściany',
    nameMany: 'ściany',
    nameGenitive: 'ścian',
    hint: 'Klikaj kolejne ściany. Naraz widać najwyżej trzy — po resztę trzeba obrócić bryłę, także do góry i do dołu.',
    visibleAtOnce: 3,
  },
  {
    part: 'krawedzie',
    total: BOX_PARTS.krawedzie,
    title: 'Policz krawędzie',
    nameMany: 'krawędzie',
    nameGenitive: 'krawędzi',
    hint: 'Klikaj kolejne krawędzie. Z jednego ustawienia widać dziewięć — trzy są schowane z drugiej strony.',
    visibleAtOnce: 9,
  },
  {
    part: 'wierzcholki',
    total: BOX_PARTS.wierzcholki,
    title: 'Policz wierzchołki',
    nameMany: 'wierzchołki',
    nameGenitive: 'wierzchołków',
    hint: 'Klikaj kolejne narożniki. Siedem widać od razu, ósmy siedzi dokładnie za bryłą.',
    visibleAtOnce: 7,
  },
];

/**
 * Rozgrzewka: policz części bryły, klikając je po jednej. Klikalne jest
 * **wyłącznie to, co widać** (`showHidden={false}`), więc dojście do sześciu
 * ścian wymaga obrócenia bryły — dokładnie tak samo, jak przy liczeniu ścian
 * prawdziwego pudełka w ręku. Podwójne kliknięcie tej samej części nic nie
 * zmienia, bo cały problem tego zadania to nie pomylić się w drugą stronę:
 * policzyć coś dwa razy.
 */
export function PartTally({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [marked, setMarked] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const round = ROUNDS[Math.min(index, ROUNDS.length - 1)];
  const complete = marked.length >= round.total;
  const stalled = !complete && marked.length >= round.visibleAtOnce;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const goNext = () => {
    if (index + 1 < ROUNDS.length) {
      setIndex(index + 1);
      setMarked([]);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        {ROUNDS.map((item, i) => (
          <span
            key={item.part}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
            style={{ color: i === index ? textColor : undefined }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: i < index || finished ? color : `${color}33` }}
              aria-hidden
            />
            {item.nameMany}
          </span>
        ))}
      </div>

      <div className="grid items-center gap-6 md:grid-cols-[300px_1fr]">
        <SolidSpinner
          spec={SPEC}
          color={color}
          showHidden={false}
          picking={{
            part: round.part,
            marked,
            onPick: (id) => setMarked((prev) => (prev.includes(id) ? prev : [...prev, id])),
          }}
          ariaLabel={`Prostopadłościan do obracania — zaznacz kolejne ${round.nameMany}`}
        />

        <div>
          <p className="text-lg font-bold sm:text-xl">{round.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{round.hint}</p>

          <p className="mt-4 font-mono text-4xl font-black tabular-nums" style={{ color }}>
            {marked.length}
            <span className="text-xl text-muted-foreground"> / {round.total}</span>
          </p>
          <p className="text-sm" style={{ color: textColor }}>
            {round.nameMany}
          </p>

          {stalled && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 border-l-4 py-1 pl-3 text-sm leading-relaxed"
              style={{ borderColor: color }}
            >
              Z tej strony nie zostało już nic do kliknięcia. Obróć bryłę — brakuje jeszcze{' '}
              {round.total - marked.length} {round.nameGenitive} z drugiej strony. Spód bryły
              pokażesz strzałką w górę.
            </motion.p>
          )}

          {complete && !finished && (
            <Button size="sm" className="mt-4" onClick={goNext} style={{ backgroundColor: color }}>
              {index + 1 < ROUNDS.length
                ? `Teraz ${ROUNDS[index + 1].nameMany}`
                : 'Mam komplet'}
            </Button>
          )}

          {finished && (
            <div className="mt-4 border-l-4 py-2 pl-4" style={{ borderColor: color }}>
              <p className="font-mono text-xl font-black tabular-nums" style={{ color }}>
                {BOX_PARTS.sciany} · {BOX_PARTS.krawedzie} · {BOX_PARTS.wierzcholki}
              </p>
              <p className="mt-1 flex items-start gap-2 text-sm leading-relaxed">
                <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                Sześć ścian, dwanaście krawędzi, osiem wierzchołków. Te trzy liczby są takie same dla
                każdego prostopadłościanu — dużego, małego i sześcianu też.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
