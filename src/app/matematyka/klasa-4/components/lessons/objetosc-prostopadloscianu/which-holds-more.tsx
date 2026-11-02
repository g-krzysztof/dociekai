'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { IsoCube } from '../../iso-cube';
import { SolidSketch } from '../../solid-sketch';
import { boxVolume } from '../../../lib/box-volume';
import type { BoxSpec } from '../../../lib/solids';

const UNIT = 'cm';
const MAX_DIM = 5;

interface Round {
  id: string;
  a: BoxSpec;
  b: BoxSpec;
  /** Co ma zaskoczyć — pokazywane dopiero po trafieniu. */
  moral: string;
}

/** Który wybór jest poprawny, rozstrzyga `boxVolume`, a nie flaga w danych. */
const ROUNDS: Round[] = [
  {
    id: 'wyzsze-czy-szersze',
    a: { width: 4, depth: 2, height: 2 },
    b: { width: 2, depth: 2, height: 3 },
    moral:
      'Nie wygrywa ten, kto jest wyższy. Liczy się, ile kostek wejdzie razem — a to zależy od wszystkich trzech wymiarów naraz.',
  },
  {
    id: 'dlugie-a-plaskie',
    a: { width: 5, depth: 2, height: 1 },
    b: { width: 2, depth: 2, height: 3 },
    moral:
      'Najdłuższe pudełko wcale nie mieści najwięcej. Płaskie pudełko ma tylko jedną warstwę kostek, choćby było bardzo długie.',
  },
  {
    id: 'inny-ksztalt-ta-sama-objetosc',
    a: { width: 3, depth: 3, height: 2 },
    b: { width: 2, depth: 3, height: 3 },
    moral:
      'Dwie zupełnie różne bryły mogą mieścić dokładnie tyle samo. Objętość nie mówi nic o kształcie — mówi tylko, ile się mieści.',
  },
];

type Choice = 'a' | 'b' | 'rowno';

function correctChoice(round: Round): Choice {
  const va = boxVolume(round.a);
  const vb = boxVolume(round.b);
  if (va === vb) return 'rowno';
  return va > vb ? 'a' : 'b';
}

const CHOICE_LABEL: Record<Choice, string> = {
  a: 'Pudełko A',
  b: 'Pudełko B',
  rowno: 'Mieszczą tyle samo',
};

/**
 * Rozgrzewka: dwa pudełka, jedno pytanie — które mieści więcej? Dziecko zna już
 * trzy wymiary bryły (lekcja 1) i wie, że miarką objętości jest kostka
 * (przewodnik), ale jeszcze nie ma wzoru. Runda trzecia celowo kończy się
 * remisem: dwie różne bryły o tej samej objętości to najkrótsza droga do
 * zdania „objętość nie mówi o kształcie".
 *
 * Zły wybór drga i pozwala spróbować dalej — dopiero trafienie odsłania obie
 * bryły wypełnione kostkami (`IsoCube`) i liczby. Który wybór jest poprawny,
 * rozstrzyga `boxVolume`, a nie flaga w danych, więc zmiana wymiarów w tablicy
 * nie może rozjechać klucza.
 */
export function WhichHoldsMore({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Choice | null>(null);
  const [wrong, setWrong] = useState<Choice | null>(null);
  const [finished, setFinished] = useState(false);

  const round = ROUNDS[Math.min(index, ROUNDS.length - 1)];
  const containerRef = useSectionScrollAnchor(`${index}-${picked ?? ''}-${finished}`);
  const answer = correctChoice(round);
  const solved = picked === answer;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const pick = (choice: Choice) => {
    if (solved) return;
    if (choice === answer) {
      setPicked(choice);
      setWrong(null);
      return;
    }
    setPicked(null);
    setWrong(choice);
  };

  const goNext = () => {
    setPicked(null);
    setWrong(null);
    if (index + 1 < ROUNDS.length) {
      setIndex(index + 1);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div
        ref={containerRef}
        className="border-t-2 p-5 sm:p-6"
        style={{ borderColor: color, backgroundColor: `${color}0f` }}
      >
        <p className="mb-2 flex items-center gap-2 text-lg font-bold" style={{ color: textColor }}>
          <Check className="h-5 w-5 shrink-0" aria-hidden />
          Trzy porównania za tobą
        </p>
        <p className="text-base leading-relaxed">
          Za każdym razem trzeba było policzyć kostki. Da się to zrobić szybciej niż jedna po
          drugiej — i właśnie tego jest ta lekcja.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-base font-semibold sm:text-lg">Które pudełko mieści więcej?</p>
        <p className="text-sm text-muted-foreground">
          Porównanie{' '}
          <span className="font-mono font-bold tabular-nums" style={{ color }}>
            {index + 1}
          </span>{' '}
          z {ROUNDS.length}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(['a', 'b'] as const).map((side) => {
          const spec = round[side];
          return (
            <div
              key={side}
              className="border p-4"
              style={
                solved && (answer === side || answer === 'rowno')
                  ? { borderColor: color, backgroundColor: `${color}0d` }
                  : undefined
              }
            >
              <p className="mb-2 text-center text-sm font-bold" style={{ color: textColor }}>
                Pudełko {side.toUpperCase()}
              </p>
              {solved ? (
                <IsoCube
                  dims={{ x: spec.width, y: spec.height, z: spec.depth }}
                  maxDim={MAX_DIM}
                  color={color}
                  className="mx-auto h-auto w-full max-w-[190px]"
                  ariaLabel={`Pudełko ${side.toUpperCase()} wypełnione ${boxVolume(spec)} kostkami`}
                />
              ) : (
                <SolidSketch
                  spec={spec}
                  color={color}
                  labels={[`${spec.width} ${UNIT}`, `${spec.depth} ${UNIT}`, `${spec.height} ${UNIT}`]}
                  className="mx-auto h-auto w-full max-w-[210px]"
                  ariaLabel={`Pudełko ${side.toUpperCase()}: ${spec.width} na ${spec.depth} na ${spec.height} centymetrów`}
                />
              )}
              {solved && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-center font-mono text-base font-bold tabular-nums"
                  style={{ color }}
                >
                  {spec.width} · {spec.depth} · {spec.height} = {boxVolume(spec)} kostek
                </motion.p>
              )}
            </div>
          );
        })}
      </div>

      <motion.div
        key={`${round.id}-${wrong ?? 'none'}`}
        animate={wrong ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
        transition={{ duration: 0.4 }}
        className="mt-4 grid gap-2 sm:grid-cols-3"
      >
        {(['a', 'b', 'rowno'] as const).map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => pick(choice)}
            disabled={solved}
            className={cn(
              'cursor-pointer border px-3 py-2.5 text-center text-sm font-semibold transition-all',
              !solved && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
              solved && choice !== answer && 'opacity-50',
              solved && 'cursor-default',
            )}
            style={
              (solved && choice === answer) || (wrong === choice && !solved)
                ? {
                    borderColor: color,
                    backgroundColor: choice === answer ? `${color}1a` : undefined,
                    color: choice === answer ? textColor : undefined,
                  }
                : undefined
            }
          >
            {CHOICE_LABEL[choice]}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {wrong && !solved && (
          <motion.p
            key="wrong"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm leading-relaxed text-muted-foreground"
          >
            Jeszcze nie. Policz, ile kostek zmieści się na dnie każdego pudełka i ile takich warstw
            da się ułożyć jedna na drugiej.
          </motion.p>
        )}
        {solved && (
          <motion.div
            key="solved"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3"
          >
            <p className="mb-3 text-sm leading-relaxed" style={{ color: textColor }}>
              {round.moral}
            </p>
            <Button onClick={goNext} style={{ backgroundColor: color }}>
              {index + 1 < ROUNDS.length ? 'Następne porównanie' : 'Gotowe'}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Klucz w DOM od początku — SEO i czytniki ekranu nie zależą od klikania. */}
      <ul className="sr-only">
        {ROUNDS.map((item) => (
          <li key={item.id}>
            Pudełko A {item.a.width} × {item.a.depth} × {item.a.height} mieści {boxVolume(item.a)}{' '}
            kostek, pudełko B {item.b.width} × {item.b.depth} × {item.b.height} mieści{' '}
            {boxVolume(item.b)} kostek. {item.moral}
          </li>
        ))}
      </ul>
    </div>
  );
}
