'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { FactTriangle } from '../../fact-triangle';

interface DemoFact {
  text: string;
  highlight: 'a' | 'b' | 'c';
}

const DEMO = { a: 6, b: 7, c: 42 };
const DEMO_FACTS: DemoFact[] = [
  { text: '6 × 7 = 42', highlight: 'c' },
  { text: '7 × 6 = 42', highlight: 'c' },
  { text: '42 : 6 = 7', highlight: 'b' },
  { text: '42 : 7 = 6', highlight: 'a' },
];

interface PracticeRound {
  a: number | null;
  b: number | null;
  c: number | null;
  hidden: 'a' | 'b' | 'c';
  answer: number;
  candidates: number[];
  prompt: string;
}

const PRACTICE_ROUNDS: PracticeRound[] = [
  {
    a: 9,
    b: 6,
    c: null,
    hidden: 'c',
    answer: 54,
    candidates: [45, 54, 56, 63],
    prompt: 'Ile wynosi wierzchołek trójkąta — iloczyn 9 i 6?',
  },
  {
    a: null,
    b: 6,
    c: 48,
    hidden: 'a',
    answer: 8,
    candidates: [7, 8, 9, 6],
    prompt: 'Brakujący czynnik: przez co pomnożyć 6, żeby dostać 48?',
  },
];

interface FactTriangleIntroProps {
  color: string;
  onComplete?: () => void;
}

/** Nowe pojęcie: dwa czynniki i iloczyn — trzy powiązane liczby, z których
 * każde dwie dają trzecią za darmo. Pokaz na 6-7-42, potem dwie samodzielne
 * próby: raz brakuje iloczynu (mnożenie), raz brakuje czynnika (dzielenie). */
export function FactTriangleIntro({ color, onComplete }: FactTriangleIntroProps) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [revealCount, setRevealCount] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const containerRef = useSectionScrollAnchor(phase);

  const isLastPhase = phase === 2;

  const revealNext = () => setRevealCount((prev) => Math.min(DEMO_FACTS.length, prev + 1));
  const demoDone = revealCount === DEMO_FACTS.length;
  const currentHighlight = revealCount > 0 ? DEMO_FACTS[revealCount - 1].highlight : null;

  const round = phase > 0 ? PRACTICE_ROUNDS[phase - 1] : null;
  const solved = picked !== null && picked === round?.answer;

  const goNext = () => {
    if (isLastPhase) {
      onComplete?.();
      return;
    }
    setPhase((prev) => (prev + 1) as 0 | 1 | 2);
    setRevealCount(0);
    setPicked(null);
  };

  const pick = (value: number) => {
    if (picked !== null) return;
    setPicked(value);
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= phase ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {phase + 1}/3
        </span>
      </div>

      <p
        className="mb-1 text-xs font-bold uppercase tracking-[0.15em]"
        style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
      >
        {phase === 0 ? 'Pokaz' : 'Twoja kolej'}
      </p>
      <h3 className="mb-4 text-lg font-bold leading-snug sm:text-xl">
        {phase === 0
          ? '6, 7 i 42 są powiązane — jeden fakt daje ci cztery'
          : round?.prompt}
      </h3>

      <div className="mb-4 flex justify-center">
        <FactTriangle
          a={phase === 0 ? DEMO.a : round!.hidden === 'a' ? picked : round!.a}
          b={phase === 0 ? DEMO.b : round!.hidden === 'b' ? picked : round!.b}
          c={phase === 0 ? DEMO.c : round!.hidden === 'c' ? picked : round!.c}
          color={color}
          highlight={phase === 0 ? currentHighlight : round!.hidden}
          ariaLabel="Trójkąt faktów mnożenia i dzielenia"
        />
      </div>

      {phase === 0 && revealCount > 0 && (
        <motion.p
          key={revealCount}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-center font-mono text-xl font-black tabular-nums" style={{ color }}
        >
          {DEMO_FACTS[revealCount - 1].text}
        </motion.p>
      )}

      {phase > 0 && (
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {round!.candidates.map((value) => {
            const isPicked = picked === value;
            const isAnswer = value === round!.answer;
            const reveal = picked !== null;
            return (
              <button
                key={value}
                type="button"
                onClick={() => pick(value)}
                disabled={reveal}
                className={cn(
                  'flex items-center gap-1.5 border px-4 py-2 font-mono text-base font-bold tabular-nums transition-all disabled:cursor-not-allowed',
                  !reveal && 'hover:-translate-y-0.5 hover:shadow-md',
                  reveal && isAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                  reveal && isPicked && !isAnswer && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40',
                  reveal && !isPicked && !isAnswer && 'opacity-50'
                )}
                style={!reveal ? { borderColor: `${color}59`, color } : undefined}
              >
                {reveal && isAnswer && <Check className="h-4 w-4 text-emerald-600" />}
                {reveal && isPicked && !isAnswer && <X className="h-4 w-4 text-rose-500" />}
                {value}
              </button>
            );
          })}
        </div>
      )}

      {phase > 0 && solved && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-emerald-50 p-3 text-center text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
        >
          {round!.hidden === 'c'
            ? `9 × 6 = 54 — i za darmo dostajesz też 6 × 9 = 54, 54 : 9 = 6 oraz 54 : 6 = 9.`
            : `48 : 6 = 8, bo 6 × 8 = 48 — mnożenie i dzielenie łączą te same trzy liczby.`}
        </motion.p>
      )}

      <div className="flex justify-end">
        {phase === 0 && !demoDone && <Button onClick={revealNext}>Pokaż fakt</Button>}
        {phase === 0 && demoDone && (
          <Button onClick={goNext} className="gap-1.5">
            Dalej
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        {phase > 0 && solved && (
          <Button onClick={goNext} className="gap-1.5">
            {isLastPhase ? 'Zakończ' : 'Dalej'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
