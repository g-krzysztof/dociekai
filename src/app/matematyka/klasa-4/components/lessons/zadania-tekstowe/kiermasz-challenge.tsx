'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Cookie, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { ProblemUnpacker, type WordProblem } from '../../problem-unpacker';

const PART_ONE: WordProblem = {
  id: 'kiermasz-1',
  phrases: [
    {
      id: 'k1-p1',
      text: 'Klasa 4b piecze ciasta na kiermasz, żeby zebrać pieniądze na wycieczkę do muzeum. Upiekli ',
    },
    { id: 'k1-g1', text: '8 blach ciasta', tappable: true, role: 'given', label: 'blachy' },
    { id: 'k1-p2', text: '. Na każdej blasze było ' },
    { id: 'k1-g2', text: '16 kawałków', tappable: true, role: 'given', label: 'kawałki na blasze' },
    { id: 'k1-p3', text: '. W klasie jest ' },
    { id: 'k1-decoy', text: '25 uczniów', tappable: true, role: 'decoy' },
    { id: 'k1-p4', text: '. ' },
    { id: 'k1-q', text: 'Ile kawałków ciasta upiekli w sumie?', tappable: true, role: 'question' },
  ],
  model: {
    type: 'equal-groups',
    groupLabel: 'blacha',
    unitLabel: 'kawałków razem',
    groups: 8,
    perGroup: 16,
    total: null,
  },
  equation: '8 × 16 = ?',
  answer: 128,
  answerLabel: 'kawałków',
};

const PART_TWO: WordProblem = {
  id: 'kiermasz-2',
  phrases: [
    { id: 'k2-p1', text: 'W poprzednim kroku obliczyłeś, że upieczono ' },
    { id: 'k2-g1', text: '128 kawałków', tappable: true, role: 'given', label: 'upieczone' },
    { id: 'k2-p2', text: '. Podczas kiermaszu sprzedano ' },
    { id: 'k2-g2', text: '103 kawałki', tappable: true, role: 'given', label: 'sprzedane' },
    { id: 'k2-p3', text: '. ' },
    {
      id: 'k2-q',
      text: 'Ile kawałków ciasta zostało niesprzedanych?',
      tappable: true,
      role: 'question',
    },
  ],
  model: {
    type: 'part-whole',
    wholeLabel: 'upieczone',
    wholeValue: 128,
    parts: [
      { label: 'sprzedane', value: 103 },
      { label: 'zostało', value: null },
    ],
  },
  equation: '128 − 103 = ?',
  answer: 25,
  answerLabel: 'kawałków',
};

interface KiermaszChallengeProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Zadanie problemowe: dwuetapowe zadanie z życia (upiecz → sprzedaj →
 * policz resztę), rozwiązywane tą samą metodą co reszta lekcji, a na
 * koniec — sprawdzian sensu wynikiem z poprzedniej lekcji (szacowanie).
 * Podpucha z części 1 (liczba uczniów) wraca w podsumowaniu jako ciekawy
 * zbieg okoliczności, nie jako dana potrzebna do liczenia.
 */
export function KiermaszChallenge({ color, onComplete }: KiermaszChallengeProps) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [part1Solved, setPart1Solved] = useState(false);
  const [part2Solved, setPart2Solved] = useState(false);
  // Tylko przejście 0→1 realnie zapada wysokościowo (rozwiązana część 1 jest
  // dużo wyższa niż świeża część 2) — 1→2 tylko dokłada podsumowanie poniżej,
  // więc nie ma tam czego korygować (i przewijanie cofnęłoby widok w górę).
  const containerRef = useSectionScrollAnchor(phase > 0);

  return (
    <div ref={containerRef} className="space-y-5">
      <div
        className="flex items-start gap-3 border p-4"
        style={{ borderColor: `${color}33`, backgroundColor: `${color}0a` }}
      >
        <Cookie className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed sm:text-base">
          Dwa pytania, jedna historia — wynik pierwszego kroku stanie się daną w drugim.
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
            Zostało dokładnie tyle kawałków, ilu jest uczniów w klasie — <strong>25</strong>! To
            zupełny zbieg okoliczności — liczba uczniów nie była nikomu do niczego potrzebna w
            obliczeniach, po prostu tak wyszło.
          </p>

          <div
            className="flex items-start gap-3 border-l-4 p-4 text-sm leading-relaxed sm:text-base"
            style={{ borderColor: color, backgroundColor: `${color}0a` }}
          >
            <Scale className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
            <div>
              <p className="mb-1 font-bold">Czy wyniki mają sens? Sprawdź szacunkiem.</p>
              <p>
                8 × 16 ≈ 8 × 15 = 120 — blisko dokładnych 128. ✓<br />
                128 − 103 ≈ 130 − 100 = 30 — blisko dokładnych 25. ✓
              </p>
              <p className="mt-1 text-muted-foreground">
                Oba dokładne wyniki pasują do szybkiego szacunku — można im zaufać.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => onComplete?.()} className="gap-1.5">
              Otwórz kiermasz
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
