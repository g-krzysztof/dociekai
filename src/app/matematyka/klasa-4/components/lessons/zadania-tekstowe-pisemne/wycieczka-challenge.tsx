'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Scale, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { ProblemUnpacker, type WordProblem } from '../../problem-unpacker';

const PART_ONE: WordProblem = {
  id: 'wycieczka-1',
  phrases: [
    { id: 'w1-p1', text: 'Szkoła organizuje wycieczkę do teatru dla ' },
    { id: 'w1-g1', text: '138 uczniów', tappable: true, role: 'given', label: 'uczniowie' },
    { id: 'w1-p2', text: '. Bilet dla jednego ucznia kosztuje ' },
    { id: 'w1-g2', text: '24 zł', tappable: true, role: 'given', label: 'cena biletu' },
    { id: 'w1-p3', text: '. Teatr ma ' },
    { id: 'w1-decoy', text: '512 miejsc', tappable: true, role: 'decoy' },
    { id: 'w1-p4', text: '. ' },
    { id: 'w1-q', text: 'Ile kosztują bilety dla wszystkich uczniów?', tappable: true, role: 'question' },
  ],
  model: {
    type: 'equal-groups',
    groupLabel: 'uczeń',
    unitLabel: 'zł razem',
    groups: 138,
    perGroup: 24,
    total: null,
  },
  equation: '138 × 24 = ?',
  answer: 3312,
  answerLabel: 'zł',
};

const PART_TWO: WordProblem = {
  id: 'wycieczka-2',
  phrases: [
    { id: 'w2-p1', text: 'W poprzednim kroku obliczyłeś, że bilety kosztują łącznie ' },
    { id: 'w2-g1', text: '3312 zł', tappable: true, role: 'given', label: 'koszt biletów' },
    { id: 'w2-p2', text: '. Szkoła miała na wycieczkę budżet ' },
    { id: 'w2-g2', text: '4000 zł', tappable: true, role: 'given', label: 'budżet' },
    { id: 'w2-p3', text: '. ' },
    {
      id: 'w2-q',
      text: 'Ile pieniędzy zostanie w budżecie po zakupie biletów?',
      tappable: true,
      role: 'question',
    },
  ],
  model: {
    type: 'part-whole',
    wholeLabel: 'budżet',
    wholeValue: 4000,
    parts: [
      { label: 'bilety', value: 3312 },
      { label: 'zostało', value: null },
    ],
  },
  equation: '4000 − 3312 = ?',
  answer: 688,
  answerLabel: 'zł',
};

interface WycieczkaChallengeProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: dwuetapowa historia z życia szkoły — policz koszt
 * biletów (mnożenie pisemne przez liczbę wielocyfrową), potem resztę z
 * budżetu (odejmowanie pisemne z pożyczaniem od zer, dokładnie ten
 * przypadek z osobnej lekcji o pożyczaniu). Ten sam szkielet co zadanie
 * problemowe w lekcji o zadaniach tekstowych z modułu 1 (`KiermaszChallenge`) —
 * sprawdzony wzorzec na spięcie dwóch kroków w jedną historię.
 */
export function WycieczkaChallenge({ color, onComplete }: WycieczkaChallengeProps) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [part1Solved, setPart1Solved] = useState(false);
  const [part2Solved, setPart2Solved] = useState(false);
  const containerRef = useSectionScrollAnchor(phase > 0);

  return (
    <div ref={containerRef} className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <Ticket className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Dwa kroki, jedna wycieczka — wynik pierwszego kroku stanie się daną w drugim.
        </p>
      </div>

      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <div className="mb-5 flex items-center gap-2">
          {[0, 1].map((i) => (
            <span
              key={i}
              className="h-1.5 flex-1 transition-colors"
              style={{ backgroundColor: i <= phase ? color : `${color}26` }}
            />
          ))}
          <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
            {Math.min(phase + 1, 2)}/2
          </span>
        </div>

        {phase === 0 && (
          <>
            <ProblemUnpacker
              problem={PART_ONE}
              color={color}
              mode="solve"
              onComplete={() => setPart1Solved(true)}
            />
            {part1Solved && (
              <div className="mt-5 flex justify-end">
                <Button onClick={() => setPhase(1)} className="gap-1.5">
                  Dalej
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {phase >= 1 && (
          <>
            <ProblemUnpacker
              key="part-two"
              problem={PART_TWO}
              color={color}
              mode="solve"
              onComplete={() => setPart2Solved(true)}
            />
            {part2Solved && phase < 2 && (
              <div className="mt-5 flex justify-end">
                <Button onClick={() => setPhase(2)} className="gap-1.5">
                  Zobacz podsumowanie
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {phase === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 border p-5 sm:p-6"
          style={{ borderColor: `${color}33` }}
        >
          <p className="text-sm leading-relaxed sm:text-base">
            W budżecie zostanie <strong>688 zł</strong> — to odejmowanie z pożyczaniem, które
            przechodzi przez sam środek liczby 4000, dokładnie ten trudny przypadek z lekcji o
            odejmowaniu pisemnym.
          </p>

          <div
            className="flex items-start gap-3 border-l-4 p-4 text-sm leading-relaxed sm:text-base"
            style={{ borderColor: color, backgroundColor: `${color}0a` }}
          >
            <Scale className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
            <div>
              <p className="mb-1 font-bold">Czy wyniki mają sens? Sprawdź szacunkiem.</p>
              <p>
                138 × 24 ≈ 140 × 25 = 3500 — blisko dokładnych 3312. ✓<br />
                4000 − 3312 ≈ 4000 − 3300 = 700 — blisko dokładnych 688. ✓
              </p>
              <p className="mt-1 text-muted-foreground">
                Oba dokładne wyniki pasują do szybkiego szacunku — można im zaufać.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => onComplete?.()} className="gap-1.5">
              Wyrusz na wycieczkę
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
