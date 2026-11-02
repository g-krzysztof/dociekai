'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SolidGlyph } from '../../solid-glyph';
import { SolidSketch } from '../../solid-sketch';
import {
  boxPolyhedron,
  prismPolyhedron,
  pyramidPolyhedron,
  type Polyhedron,
  type SolidKind,
} from '../../../lib/solids';

interface Suspect {
  id: string;
  name: string;
  /** Czy ma powierzchnię zaokrągloną. */
  round: boolean;
  /** Ile ma podstaw — kula nie ma żadnej, stożek jedną, walec i graniastosłupy dwie. */
  bases: 0 | 1 | 2;
  vertices: number;
  glyph?: SolidKind;
  polyhedron?: Polyhedron;
}

const SUSPECTS: Suspect[] = [
  {
    id: 'prostopadloscian',
    name: 'Prostopadłościan',
    round: false,
    bases: 2,
    vertices: 8,
    polyhedron: boxPolyhedron({ width: 4, height: 2.6, depth: 3 }),
  },
  {
    id: 'graniastoslup-3',
    name: 'Graniastosłup trójkątny',
    round: false,
    bases: 2,
    vertices: 6,
    polyhedron: prismPolyhedron(3, 2, 3.4),
  },
  {
    id: 'ostroslup-4',
    name: 'Ostrosłup czworokątny',
    round: false,
    bases: 1,
    vertices: 5,
    polyhedron: pyramidPolyhedron(4, 2.2, 3.4),
  },
  {
    id: 'ostroslup-3',
    name: 'Ostrosłup trójkątny',
    round: false,
    bases: 1,
    vertices: 4,
    polyhedron: pyramidPolyhedron(3, 2.2, 3.4),
  },
  { id: 'walec', name: 'Walec', round: true, bases: 2, vertices: 0, glyph: 'walec' },
  { id: 'stozek', name: 'Stożek', round: true, bases: 1, vertices: 1, glyph: 'stozek' },
  { id: 'kula', name: 'Kula', round: true, bases: 0, vertices: 0, glyph: 'kula' },
];

type ClueId = 'round' | 'bases' | 'vertices';

interface Clue {
  id: ClueId;
  question: string;
  answer: (s: Suspect) => string;
}

const CLUES: Clue[] = [
  {
    id: 'round',
    question: 'Czy ma zaokrągloną powierzchnię?',
    answer: (s) => (s.round ? 'Tak, da się po niej przejechać palcem bez krawędzi.' : 'Nie, ma same płaskie ściany.'),
  },
  {
    id: 'bases',
    question: 'Ile ma podstaw?',
    answer: (s) =>
      s.bases === 0
        ? 'Ani jednej — nie ma żadnej płaskiej podstawy.'
        : s.bases === 1
          ? 'Jedną.'
          : 'Dwie, identyczne i naprzeciw siebie.',
  },
  {
    id: 'vertices',
    question: 'Ile ma wierzchołków?',
    answer: (s) => (s.vertices === 0 ? 'Ani jednego.' : `${s.vertices}.`),
  },
];

function matches(suspect: Suspect, hidden: Suspect, clue: ClueId): boolean {
  if (clue === 'round') return suspect.round === hidden.round;
  if (clue === 'bases') return suspect.bases === hidden.bases;
  return suspect.vertices === hidden.vertices;
}

/** Runda 1 rozstrzyga się dwiema podpowiedziami, runda 2 wymaga wszystkich trzech. */
const ROUNDS = ['walec', 'ostroslup-3'];

function SuspectFigure({ suspect, color }: { suspect: Suspect; color: string }) {
  if (suspect.polyhedron) {
    return (
      <SolidSketch
        polyhedron={suspect.polyhedron}
        color={color}
        ariaLabel={suspect.name}
        // Szerzej niż glify obok: `SolidSketch` ma własny margines na podpisy,
        // więc przy równych szerokościach bryła wychodziłaby wyraźnie mniejsza.
        className="mx-auto h-auto w-full max-w-[116px]"
      />
    );
  }
  return (
    <SolidGlyph
      kind={suspect.glyph ?? 'kula'}
      color={color}
      className="mx-auto h-auto w-full max-w-[92px]"
    />
  );
}

/**
 * Zadanie problemowe: bryła schowana pod chustą. Dziecko zadaje pytania z listy
 * (zaokrąglona powierzchnia? ile podstaw? ile wierzchołków?), a odpowiedzi na
 * bieżąco wygaszają podejrzanych, którzy do nich nie pasują. Dopiero potem
 * wskazuje bryłę.
 *
 * To jedyny widżet kursu, w którym postęp polega na **odejmowaniu możliwości**,
 * a nie na dokładaniu poprawnych elementów — i to jest cała nauka rozpoznawania
 * brył: nie „pamiętam, jak wygląda”, tylko „jakie cechy ją wyróżniają”.
 */
export function SolidDetective({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [round, setRound] = useState(0);
  const [asked, setAsked] = useState<ClueId[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);

  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const hidden = SUSPECTS.find((s) => s.id === ROUNDS[Math.min(round, ROUNDS.length - 1)]) ?? SUSPECTS[0];

  const isOut = (suspect: Suspect) => asked.some((clue) => !matches(suspect, hidden, clue));
  const remaining = SUSPECTS.filter((s) => !isOut(s));

  const ask = (clue: ClueId) => {
    if (asked.includes(clue) || solved) return;
    setAsked([...asked, clue]);
  };

  const guess = (suspect: Suspect) => {
    if (solved) return;
    if (suspect.id === hidden.id) {
      setWrong(null);
      setSolved(true);
      return;
    }
    setWrong(suspect.id);
  };

  const nextRound = () => {
    if (round + 1 < ROUNDS.length) {
      setRound(round + 1);
      setAsked([]);
      setWrong(null);
      setSolved(false);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((id, i) => (
          <span
            key={id}
            className="h-2 w-8"
            style={{ backgroundColor: i <= round ? color : `${color}26` }}
            aria-hidden
          />
        ))}
        <span className="ml-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Zagadka {Math.min(round + 1, ROUNDS.length)} z {ROUNDS.length}
        </span>
      </div>

      {finished ? (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Check className="h-8 w-8 shrink-0" style={{ color }} aria-hidden />
          <p className="text-base leading-relaxed sm:text-lg">
            Obie bryły rozpoznane — i ani razu nie trzeba było ich zobaczyć. Do rozpoznania bryły
            wystarczą <strong style={{ color: textColor }}>trzy pytania</strong>: o zaokrąglenie,
            o podstawy i o wierzchołki.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm leading-relaxed sm:text-base">
            Pod chustą leży bryła. Nie widzisz jej — możesz tylko zadawać pytania. Po każdej
            odpowiedzi zgaśnie to, co już odpada. Kiedy zostanie jedna, kliknij ją.
          </p>

          <div className="mb-5 grid gap-2 sm:grid-cols-3">
            {CLUES.map((clue) => {
              const done = asked.includes(clue.id);
              return (
                <button
                  key={clue.id}
                  type="button"
                  onClick={() => ask(clue.id)}
                  disabled={done}
                  className={cn(
                    'cursor-pointer border p-3 text-left transition-all disabled:cursor-default',
                    !done && 'hover:-translate-y-0.5 hover:shadow-md'
                  )}
                  style={{
                    borderColor: done ? color : `${color}40`,
                    backgroundColor: done ? `${color}0c` : undefined,
                  }}
                >
                  <span className="flex items-start gap-2 text-sm font-semibold" style={{ color: textColor }}>
                    {!done && <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
                    {clue.question}
                  </span>
                  {done && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 block text-sm leading-relaxed"
                    >
                      {clue.answer(hidden)}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Zostało {remaining.length} z {SUSPECTS.length}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {SUSPECTS.map((suspect) => {
              const out = isOut(suspect);
              const isWrong = wrong === suspect.id;
              const isHit = solved && suspect.id === hidden.id;
              return (
                <motion.button
                  key={suspect.id}
                  type="button"
                  onClick={() => guess(suspect)}
                  disabled={out || solved}
                  animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.35 }}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-1 border p-2 text-center transition-all disabled:cursor-default',
                    out && 'opacity-30 grayscale',
                    !out && !solved && 'hover:-translate-y-0.5 hover:shadow-md'
                  )}
                  style={
                    isHit
                      ? { borderColor: color, backgroundColor: `${color}14` }
                      : isWrong
                        ? { borderColor: '#dc2626' }
                        : { borderColor: `${color}40` }
                  }
                >
                  <SuspectFigure suspect={suspect} color={color} />
                  <span
                    className="text-[11px] font-semibold leading-tight"
                    style={{ color: isHit ? textColor : undefined }}
                  >
                    {suspect.name}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {solved ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 border-l-4 py-2 pl-4"
                style={{ borderColor: color, backgroundColor: `${color}0c` }}
              >
                <p className="text-sm leading-relaxed sm:text-base">
                  To był <strong style={{ color: textColor }}>{hidden.name.toLowerCase()}</strong> —
                  rozpoznany po {asked.length === 0 ? 'samym strzale' : `${asked.length === 1 ? 'jednej podpowiedzi' : `${asked.length} podpowiedziach`}`}.
                </p>
                <Button size="sm" className="mt-3" onClick={nextRound} style={{ backgroundColor: color }}>
                  {round + 1 < ROUNDS.length ? 'Następna zagadka' : 'Zamknij śledztwo'}
                </Button>
              </motion.div>
            ) : wrong ? (
              <motion.p
                key="wrong"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-sm leading-relaxed text-muted-foreground"
              >
                Ta bryła jeszcze pasuje do tego, co wiesz — ale nie ona leży pod chustą. Zadaj
                kolejne pytanie, zamiast zgadywać.
              </motion.p>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
