'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Volume2, VolumeX, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Haczyk lekcji: trzy rundy, w każdej para zdań o tym samym — jedno krzykliwe,
 * jedno spokojne. Dziecko zgaduje, które jest PRAWDZIWE. Pointa wychodzi z
 * rozkładu: raz prawdę mówi zdanie spokojne, raz krzykliwe, raz znów spokojne —
 * więc po tonie nie da się poznać, co jest prawdą. To otwiera całą lekcję o
 * sprawdzaniu, a nie zgadywaniu.
 *
 * To haczyk, nie test — licznik trafień jest tylko pretekstem. Blok kończy się
 * po rozstrzygnięciu wszystkich trzech rund (trafienie czy nie).
 */

interface Statement {
  tone: 'loud' | 'quiet';
  text: string;
  true: boolean;
  note: string;
}

interface Round {
  id: string;
  topic: string;
  statements: Statement[];
}

const ROUNDS: Round[] = [
  {
    id: 'bateria',
    topic: 'Od czego telefon rozładowuje się szybciej?',
    statements: [
      {
        tone: 'loud',
        text: 'UWAGA! Telefon w kieszeni rozładowuje się dwa razy szybciej przy pełni księżyca!',
        true: false,
        note: 'Księżyc nie ma z tym nic wspólnego. Zdanie brzmi „naukowo”, ale nikt tego nigdy nie zmierzył, bo nie ma czego.',
      },
      {
        tone: 'quiet',
        text: 'Na mrozie bateria telefonu traci moc i telefon wyłącza się szybciej.',
        true: true,
        note: 'To prawda — zimno spowalnia reakcje w baterii. Dlatego telefon na sankach potrafi paść przy 40% naładowania.',
      },
    ],
  },
  {
    id: 'miod',
    topic: 'Czy miód się psuje?',
    statements: [
      {
        tone: 'loud',
        text: 'SZOK: archeolodzy znaleźli w grobowcu miód sprzed 3000 lat — i wciąż nadawał się do jedzenia!',
        true: true,
        note: 'To akurat prawda, choć brzmi jak wymyślone. Miód prawie nie zawiera wody i jest kwaśny, więc bakterie w nim nie żyją. Ten z egipskich grobowców naprawdę był jadalny.',
      },
      {
        tone: 'quiet',
        text: 'Otwarty słoik miodu trzeba wyrzucić po roku, bo robi się trujący.',
        true: false,
        note: 'Nieprawda. Miód może zgęstnieć albo się skrystalizować, ale nie robi się trujący. Wystarczy go podgrzać w ciepłej wodzie.',
      },
    ],
  },
  {
    id: 'guma',
    topic: 'Co się dzieje z połkniętą gumą do żucia?',
    statements: [
      {
        tone: 'loud',
        text: 'Połknięta guma do żucia zalega w żołądku przez całe 7 lat!',
        true: false,
        note: 'To jedna z najstarszych szkolnych bajek. Guma nie trawi się, ale przechodzi przez organizm jak inne niestrawione resztki.',
      },
      {
        tone: 'quiet',
        text: 'Połknięta guma wychodzi z organizmu w ciągu kilku dni, tak jak pestka czy ziarnko kukurydzy.',
        true: true,
        note: 'Tak to działa naprawdę. Żołądek nie umie jej strawić, więc po prostu ją wydala — bez siedmiu lat czekania.',
      },
    ],
  },
];

interface LoudOrTrueProps {
  color: string;
  onComplete?: () => void;
}

export function LoudOrTrue({ color, onComplete }: LoudOrTrueProps) {
  /** id rundy → indeks wybranego zdania. */
  const [picks, setPicks] = useState<Record<string, number>>({});
  const containerRef = useSectionScrollAnchor(Object.keys(picks).length);

  const decided = ROUNDS.filter((round) => picks[round.id] !== undefined).length;
  const hits = ROUNDS.filter((round) => {
    const i = picks[round.id];
    return i !== undefined && round.statements[i].true;
  }).length;
  const finished = decided === ROUNDS.length;

  const choose = (round: Round, index: number) => {
    if (picks[round.id] !== undefined) return;
    const next = { ...picks, [round.id]: index };
    setPicks(next);
    if (ROUNDS.every((item) => next[item.id] !== undefined)) onComplete?.();
  };

  return (
    <div ref={containerRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Trzy pary zdań. W każdej parze <strong>jedno jest prawdziwe, a jedno wymyślone</strong>.
          Wskaż to prawdziwe — kieruj się tym, co wiesz, nie tym, jak głośno brzmi.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          trafienia: {hits}/{ROUNDS.length}
        </p>
      </div>

      <ol className="space-y-5">
        {ROUNDS.map((round, roundIndex) => {
          const picked = picks[round.id];
          const settled = picked !== undefined;

          return (
            <li key={round.id} className="border p-3 sm:p-4">
              <p className="mb-3 flex gap-2 text-sm font-semibold leading-relaxed sm:text-base">
                <span className="font-mono" style={{ color }}>
                  {roundIndex + 1}.
                </span>
                <span>{round.topic}</span>
              </p>

              <div className="space-y-2">
                {round.statements.map((statement, index) => {
                  const Icon = statement.tone === 'loud' ? Volume2 : VolumeX;
                  const isPicked = picked === index;
                  const showTrue = settled && statement.true;
                  const showWrongPick = isPicked && !statement.true;
                  return (
                    <div key={index}>
                      <button
                        type="button"
                        onClick={() => choose(round, index)}
                        disabled={settled}
                        aria-pressed={isPicked}
                        className={cn(
                          'flex w-full items-start gap-2.5 border px-3 py-2 text-left text-sm leading-relaxed transition-colors',
                          settled ? 'cursor-default' : 'cursor-pointer hover:bg-muted/50',
                          !settled && 'opacity-100',
                          settled && !showTrue && !isPicked && 'opacity-60',
                          showWrongPick && 'border-red-600 text-red-700 dark:text-red-400'
                        )}
                        style={
                          showTrue
                            ? { borderColor: color, backgroundColor: `${color}14`, color }
                            : undefined
                        }
                      >
                        <span className="mt-0.5 shrink-0">
                          {showTrue ? (
                            <Check className="h-4 w-4" aria-hidden />
                          ) : showWrongPick ? (
                            <X className="h-4 w-4" aria-hidden />
                          ) : (
                            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">{statement.text}</span>
                      </button>

                      <AnimatePresence>
                        {settled && (
                          <motion.p
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1.5 border-l-2 pl-3 text-xs leading-relaxed text-muted-foreground sm:text-sm"
                            style={{ borderColor: statement.true ? color : 'var(--border)' }}
                          >
                            {statement.note}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>

      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <p>
              Zauważ, jak wypadła prawda: raz po stronie zdania <strong>spokojnego</strong>, raz
              po stronie <strong>krzykliwego</strong>, raz znów spokojnego.{' '}
              <strong>Ton nie zdradza, co jest prawdą.</strong>
            </p>
            <p className="mt-2">
              Zdradza to dopiero sprawdzenie w innym miejscu. O tym jest cała ta lekcja — najpierw
              jak dobrze <em>szukać</em>, potem jak <em>sprawdzać</em> to, co się znajdzie.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
