'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BarModel } from '../../bar-model';
import type { BarModelSpec } from '../../../lib/word-problem-model';

interface Candidate {
  id: string;
  spec: BarModelSpec;
  correct: boolean;
}

interface AuditRound {
  id: string;
  problem: string;
  candidates: Candidate[];
}

const ROUNDS: AuditRound[] = [
  {
    id: 'jablka',
    problem: 'W koszu jest 30 jabłek. 12 jest czerwonych, reszta zielona. Który rysunek dobrze pokazuje to zadanie?',
    candidates: [
      {
        id: 'jablka-a',
        correct: true,
        spec: { type: 'part-whole', wholeLabel: 'jabłek razem', wholeValue: 30, parts: [{ label: 'czerwone', value: 12 }, { label: 'zielone', value: null }] },
      },
      {
        id: 'jablka-b',
        correct: false,
        spec: { type: 'part-whole', wholeLabel: 'jabłek razem', wholeValue: 30, parts: [{ label: 'czerwone', value: 18 }, { label: 'zielone', value: null }] },
      },
      {
        id: 'jablka-c',
        correct: false,
        spec: { type: 'part-whole', wholeLabel: 'jabłek razem', wholeValue: 12, parts: [{ label: 'wszystkie', value: 30 }, { label: 'zielone', value: null }] },
      },
    ],
  },
  {
    id: 'autokary',
    problem: 'Na wycieczkę pojechało 5 autokarów, w każdym po 40 uczniów. Który rysunek dobrze pokazuje to zadanie?',
    candidates: [
      {
        id: 'autokary-a',
        correct: true,
        spec: { type: 'equal-groups', groupLabel: 'autokar', unitLabel: 'uczniów', groups: 5, perGroup: 40, total: null },
      },
      {
        id: 'autokary-b',
        correct: false,
        spec: { type: 'equal-groups', groupLabel: 'autokar', unitLabel: 'uczniów', groups: 8, perGroup: 40, total: null },
      },
      {
        id: 'autokary-c',
        correct: false,
        spec: { type: 'equal-groups', groupLabel: 'autokar', unitLabel: 'uczniów', groups: 40, perGroup: 5, total: null },
      },
    ],
  },
];

interface DiagramAuditProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Który rysunek jest poprawny? Dziecko klika wprost w narysowany schemat
 * belkowy (nie w opis pod spodem) — pierwsze w kursie użycie `<BarModel>`
 * jako klikalnego kandydata, nie tylko biernej ilustracji rozwiązania. Ten
 * sam duch audytu co `IntersectingLinesAudit`, tu zastosowany do oceny,
 * czy schemat naprawdę odpowiada treści zadania — błędne kandydatki mają
 * albo zamienione wartości, albo złą strukturę (całość ↔ część).
 */
export function DiagramAudit({ color, onComplete }: DiagramAuditProps) {
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [shakeId, setShakeId] = useState<string | null>(null);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;

  const pick = (candidate: Candidate) => {
    if (solved) return;
    if (candidate.correct) {
      setSolved(true);
      return;
    }
    setShakeId(candidate.id);
    setTimeout(() => setShakeId(null), 400);
  };

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setSolved(false);
      return;
    }
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 transition-colors" style={{ backgroundColor: i <= index ? color : `${color}26` }} />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{ROUNDS.length}
        </span>
      </div>

      <p className="mb-5 text-center text-sm leading-relaxed sm:text-base">{round.problem}</p>

      <div className="grid gap-4 sm:grid-cols-3">
        {round.candidates.map((candidate) => (
          <motion.button
            key={candidate.id}
            type="button"
            onClick={() => pick(candidate)}
            disabled={solved}
            animate={shakeId === candidate.id ? { x: [0, -5, 5, -5, 5, 0] } : undefined}
            transition={{ duration: 0.4 }}
            className="border p-3 text-left transition-all disabled:cursor-default"
            style={{
              borderColor: solved && candidate.correct ? '#10b981' : `${color}40`,
              backgroundColor: solved && candidate.correct ? '#10b98111' : undefined,
              cursor: solved ? 'default' : 'pointer',
            }}
          >
            <BarModel spec={candidate.spec} color={solved && !candidate.correct ? '#9ca3af' : color} size="sm" />
          </motion.button>
        ))}
      </div>

      {solved && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center text-sm font-semibold text-emerald-700 dark:text-emerald-300">
          Dokładnie ten rysunek pasuje do treści — same liczby, na właściwych miejscach.
        </motion.p>
      )}

      {solved && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
            {isLast ? 'Do przykładów' : 'Kolejne zadanie'}
          </Button>
        </div>
      )}
    </div>
  );
}
