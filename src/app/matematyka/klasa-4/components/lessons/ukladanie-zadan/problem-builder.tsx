'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BuilderRound {
  id: string;
  before: string;
  aUnit: string;
  mid: string;
  bUnit: string;
  after: string;
  question: string;
  operation: '×' | '−';
  target: number;
  aOptions: number[];
  bOptions: number[];
}

const ROUNDS: BuilderRound[] = [
  {
    id: 'naklejki',
    before: 'W sklepie jest',
    aUnit: 'zestawów naklejek',
    mid: '. W każdym zestawie jest',
    bUnit: 'naklejek',
    after: '.',
    question: 'Ile naklejek jest w sklepie razem?',
    operation: '×',
    target: 48,
    aOptions: [4, 6, 8],
    bOptions: [6, 8, 12],
  },
  {
    id: 'jablka',
    before: 'W koszyku było',
    aUnit: 'jabłek',
    mid: '. Zjedliśmy',
    bUnit: 'jabłek',
    after: '.',
    question: 'Ile jabłek zostało w koszyku?',
    operation: '−',
    target: 15,
    aOptions: [20, 25, 30],
    bOptions: [5, 10, 15],
  },
];

function compute(a: number, b: number, op: '×' | '−'): number {
  return op === '×' ? a * b : a - b;
}

interface ProblemBuilderProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Ułóż własne zadanie: dziecko wybiera dwie liczby z podanych opcji tak, żeby
 * zbudowany na żywo tekst zadania dawał dokładnie zadany wynik — pierwsze w
 * kursie ćwiczenie odwracające kierunek (nie „rozwiąż zadanie", tylko
 * „skonstruuj zadanie, które da ten wynik"). Kilka par liczb bywa poprawnych
 * naraz (np. 4×12 i 6×8 oba dają 48) — to celowe, pokazuje, że to samo
 * zadanie da się ułożyć na więcej niż jeden sposób.
 */
export function ProblemBuilder({ color, onComplete }: ProblemBuilderProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [a, setA] = useState<number | null>(null);
  const [b, setB] = useState<number | null>(null);

  const round = ROUNDS[roundIndex];
  const isLast = roundIndex === ROUNDS.length - 1;
  const computed = a !== null && b !== null ? compute(a, b, round.operation) : null;
  const matched = computed === round.target;

  const next = () => {
    if (!isLast) {
      setRoundIndex((prev) => prev + 1);
      setA(null);
      setB(null);
      return;
    }
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {roundIndex + 1}/{ROUNDS.length}
        </span>
      </div>

      <p className="mb-4 text-center text-sm font-semibold sm:text-base">
        Ułóż zadanie, którego wynikiem będzie dokładnie{' '}
        <span className="font-mono text-base" style={{ color }}>
          {round.target}
        </span>
        .
      </p>

      <div className="border bg-zinc-50 p-4 leading-relaxed dark:bg-zinc-950/40">
        {round.before}{' '}
        <span className="font-mono font-bold" style={{ color }}>
          {a ?? '___'}
        </span>{' '}
        {round.aUnit}
        {round.mid}{' '}
        <span className="font-mono font-bold" style={{ color }}>
          {b ?? '___'}
        </span>{' '}
        {round.bUnit}
        {round.after} <span className="italic text-muted-foreground">{round.question}</span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pierwsza liczba</p>
          <div className="grid grid-cols-3 gap-2">
            {round.aOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setA(option)}
                className={cn('border px-2 py-3 text-center font-mono text-sm font-bold tabular-nums transition-all', a === option ? 'text-white' : 'hover:border-current')}
                style={a === option ? { backgroundColor: color, borderColor: color } : { borderColor: `${color}55`, color }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Druga liczba</p>
          <div className="grid grid-cols-3 gap-2">
            {round.bOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setB(option)}
                className={cn('border px-2 py-3 text-center font-mono text-sm font-bold tabular-nums transition-all', b === option ? 'text-white' : 'hover:border-current')}
                style={b === option ? { backgroundColor: color, borderColor: color } : { borderColor: `${color}55`, color }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {computed !== null && (
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn('mt-4 text-center font-mono text-base font-bold tabular-nums', matched ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground')}
        >
          {a} {round.operation} {b} = {computed} {matched ? `— trafiłeś/aś w ${round.target}!` : `(szukasz ${round.target})`}
        </motion.p>
      )}

      {matched && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next} style={{ backgroundColor: color }} className="gap-1.5 text-white hover:opacity-90">
            {isLast ? 'Do przykładów' : 'Kolejne zadanie'}
            {isLast ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
