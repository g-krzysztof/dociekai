'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Scale, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { BarModel } from '../../bar-model';
import type { BarModelSpec } from '../../../lib/word-problem-model';

interface RoundTarget {
  label: string;
  value: number;
  options: number[];
  correct: number;
  /** Pokazuje się po trafieniu — np. dlaczego akurat ta zaokrąglona liczba jest wygodna. */
  note?: string;
}

interface EstimateRound {
  id: string;
  sentence: string;
  model: BarModelSpec;
  fixedNote: string;
  targets: RoundTarget[];
  estimateExpression: (rounded: number[]) => string;
  computeEstimate: (rounded: number[]) => number;
  equation: string;
  exactAnswer: number;
  exactLabel: string;
  compareNote: (estimate: number, exact: number) => string;
}

const ROUNDS: EstimateRound[] = [
  {
    id: 'piekarnia',
    sentence: 'Piekarnia upiekła 9 tac bułek. Na każdej tacy było 47 bułek. Ile bułek upiekła piekarnia?',
    model: {
      type: 'equal-groups',
      groupLabel: 'taca',
      unitLabel: 'bułek razem',
      groups: 9,
      perGroup: 47,
      total: null,
    },
    fixedNote: '9 tac zostaje bez zmian — to już prosta, „okrągła” liczba.',
    targets: [{ label: 'bułki na jednej tacy', value: 47, options: [40, 50, 60], correct: 50 }],
    estimateExpression: (r) => `9 × ${r[0]}`,
    computeEstimate: (r) => 9 * r[0],
    equation: '9 × 47 = ?',
    exactAnswer: 423,
    exactLabel: 'bułek',
    compareNote: (est, exact) =>
      `Szacunek (${est}) i dokładny wynik (${exact}) są blisko siebie — wynik ma sens.`,
  },
  {
    id: 'hala',
    sentence: 'W hali sportowej było 3120 miejsc. Sprzedano 1876 biletów. Ile miejsc zostało wolnych?',
    model: {
      type: 'part-whole',
      wholeLabel: 'miejsca w hali',
      wholeValue: 3120,
      parts: [
        { label: 'sprzedane', value: 1876 },
        { label: 'wolne', value: null },
      ],
    },
    fixedNote: 'Tym razem zaokrąglasz obie liczby naraz — do pełnych setek.',
    targets: [
      { label: 'miejsca w hali', value: 3120, options: [3000, 3100, 3200], correct: 3100 },
      { label: 'sprzedane bilety', value: 1876, options: [1800, 1900, 2000], correct: 1900 },
    ],
    estimateExpression: (r) => `${r[0]} − ${r[1]}`,
    computeEstimate: (r) => r[0] - r[1],
    equation: '3120 − 1876 = ?',
    exactAnswer: 1244,
    exactLabel: 'miejsc',
    compareNote: (est, exact) =>
      `Szacunek (${est}) i dokładny wynik (${exact}) są blisko siebie — wynik ma sens.`,
  },
  {
    id: 'fabryka',
    sentence:
      'Fabryka zapakowała 6480 długopisów po równo do 8 dużych kartonów. Ile długopisów trafiło do jednego kartonu?',
    model: {
      type: 'equal-groups',
      groupLabel: 'karton',
      unitLabel: 'długopisów razem',
      groups: 8,
      perGroup: null,
      total: 6480,
    },
    fixedNote: '8 kartonów zostaje bez zmian.',
    targets: [
      {
        label: 'długopisy razem',
        value: 6480,
        options: [6000, 6400, 7000],
        correct: 6400,
        note: '6400 dzieli się przez 8 bez reszty (6400 : 8 = 800) i jest blisko 6480 — to wygodniejszy wybór do szacowania dzielenia niż zwykłe „najbliższe pełne tysiące”.',
      },
    ],
    estimateExpression: (r) => `${r[0]} : 8`,
    computeEstimate: (r) => r[0] / 8,
    equation: '6480 : 8 = ?',
    exactAnswer: 810,
    exactLabel: 'długopisów',
    compareNote: (est, exact) =>
      `Szacunek (${est}) i dokładny wynik (${exact}) są bardzo blisko siebie — wynik na pewno ma sens.`,
  },
];

type Phase = 'rounding' | 'estimated' | 'exact' | 'compared';

interface EstimateFirstLabProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie: „najpierw oszacuj, potem policz dokładnie". Zanim dziecko
 * w ogóle zobaczy dokładne działanie, musi zaokrąglić liczby z zadania
 * (klikalne żetony, bez kary za błąd) i policzyć szybki szacunek — dopiero
 * to odsłania dokładne równanie z polem na wynik, a na koniec porównanie
 * szacunku z dokładnym wynikiem. To pierwsza w kursie brama „oszacuj, zanim
 * zaczniesz liczyć" osadzona wewnątrz samego zadania tekstowego — do tej
 * pory szacowanie pojawiało się tylko jako gotowy, opisowy komentarz po
 * fakcie (np. w zadaniu problemowym lekcji o zadaniach tekstowych).
 */
export function EstimateFirstLab({ color, onComplete }: EstimateFirstLabProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('rounding');
  const [picks, setPicks] = useState<(number | null)[]>(() => ROUNDS[0].targets.map(() => null));
  const [shakeValue, setShakeValue] = useState<number | null>(null);
  const [exactValue, setExactValue] = useState('');
  const [exactFeedback, setExactFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const containerRef = useSectionScrollAnchor(`${roundIndex}-${phase}`);

  const round = ROUNDS[roundIndex];
  const isLast = roundIndex === ROUNDS.length - 1;
  const roundedValues = picks as number[];

  const pickOption = (targetIndex: number, value: number) => {
    if (picks[targetIndex] !== null) return;
    const target = round.targets[targetIndex];
    if (value !== target.correct) {
      setShakeValue(value);
      setTimeout(() => setShakeValue(null), 400);
      return;
    }
    const next = [...picks];
    next[targetIndex] = value;
    setPicks(next);
    if (next.every((p) => p !== null)) setPhase('estimated');
  };

  const submitExact = (event: FormEvent) => {
    event.preventDefault();
    if (!exactValue.trim()) return;
    const numeric = Number(exactValue.replace(',', '.'));
    if (numeric === round.exactAnswer) {
      setExactFeedback('correct');
      setPhase('compared');
      return;
    }
    setExactFeedback('wrong');
  };

  const nextRound = () => {
    if (!isLast) {
      const next = roundIndex + 1;
      setRoundIndex(next);
      setPicks(ROUNDS[next].targets.map(() => null));
      setPhase('rounding');
      setExactValue('');
      setExactFeedback('idle');
      return;
    }
    onComplete?.();
  };

  const estimateValue = phase !== 'rounding' ? round.computeEstimate(roundedValues) : null;

  return (
    <div ref={containerRef} className="space-y-5">
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          {ROUNDS.map((item, i) => (
            <span
              key={item.id}
              className="h-1.5 flex-1 transition-colors"
              style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }}
            />
          ))}
          <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
            {roundIndex + 1}/{ROUNDS.length}
          </span>
        </div>

        <p className="mb-4 text-base leading-relaxed sm:text-lg">{round.sentence}</p>
        <div className="mb-5">
          <BarModel spec={round.model} color={color} size="sm" />
        </div>

        {/* Krok 1: zaokrąglanie */}
        <div className="border-t pt-4" style={{ borderColor: `${color}33` }}>
          <p
            className="mb-3 text-xs font-bold uppercase tracking-[0.15em]"
            style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
          >
            Krok 1 · Zaokrąglij, żeby oszacować
          </p>
          <p className="mb-3 text-sm text-muted-foreground">{round.fixedNote}</p>

          <div className="space-y-4">
            {round.targets.map((target, ti) => {
              const picked = picks[ti];
              return (
                <div key={target.label}>
                  <p className="mb-2 text-sm font-medium">
                    Zaokrąglij <span className="font-mono font-bold">{target.value}</span> ({target.label}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {target.options.map((option) => {
                      const isCorrectPick = picked === option;
                      return (
                        <motion.button
                          key={option}
                          type="button"
                          onClick={() => pickOption(ti, option)}
                          disabled={picked !== null}
                          animate={shakeValue === option ? { x: [0, -6, 6, -6, 6, 0] } : undefined}
                          transition={{ duration: 0.4 }}
                          className={cn(
                            'border-2 px-4 py-2 font-mono text-base font-bold tabular-nums transition-all',
                            picked === null && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md',
                            picked !== null && !isCorrectPick && 'opacity-40'
                          )}
                          style={{
                            borderColor: isCorrectPick ? color : `${color}45`,
                            backgroundColor: isCorrectPick ? `${color}1f` : 'transparent',
                            color: isCorrectPick ? color : undefined,
                          }}
                        >
                          {option}
                        </motion.button>
                      );
                    })}
                  </div>
                  {picked !== null && target.note && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-xs text-muted-foreground"
                    >
                      {target.note}
                    </motion.p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Krok 2: szacowany wynik */}
        {phase !== 'rounding' && estimateValue !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t pt-4"
            style={{ borderColor: `${color}33` }}
          >
            <p
              className="mb-2 text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
            >
              Krok 2 · Szacowany wynik
            </p>
            <p className="font-mono text-lg font-bold tabular-nums" style={{ color }}>
              {round.estimateExpression(roundedValues)} ≈ {estimateValue}
            </p>

            {phase === 'estimated' && (
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setPhase('exact')} className="gap-1.5">
                  Teraz policz dokładnie
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Krok 3: dokładne działanie */}
        {(phase === 'exact' || phase === 'compared') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t pt-4"
            style={{ borderColor: `${color}33` }}
          >
            <p
              className="mb-2 text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
            >
              Krok 3 · Policz dokładnie (w słupku, na kartce)
            </p>
            <form onSubmit={submitExact} className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-base font-bold tabular-nums" style={{ color }}>
                {round.equation}
              </span>
              <Input
                value={exactValue}
                onChange={(event) => {
                  setExactValue(event.target.value);
                  if (exactFeedback === 'wrong') setExactFeedback('idle');
                }}
                disabled={exactFeedback === 'correct'}
                inputMode="numeric"
                autoComplete="off"
                placeholder="?"
                className={cn(
                  'w-28 text-center font-mono text-base',
                  exactFeedback === 'correct' && 'border-emerald-500',
                  exactFeedback === 'wrong' && 'border-rose-400'
                )}
              />
              <span className="text-sm text-muted-foreground">{round.exactLabel}</span>
              {exactFeedback !== 'correct' && (
                <Button type="submit" disabled={!exactValue.trim()}>
                  Sprawdź
                </Button>
              )}
            </form>
            {exactFeedback === 'wrong' && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                <X className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Jeszcze nie — policz działanie w słupku jeszcze raz.
              </p>
            )}
          </motion.div>
        )}

        {/* Krok 4: porównanie */}
        {phase === 'compared' && estimateValue !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 flex items-start gap-3 border-l-4 p-4 text-sm leading-relaxed sm:text-base"
            style={{ borderColor: color, backgroundColor: `${color}0a` }}
          >
            <Scale className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
            <div>
              <p className="mb-1 flex items-center gap-1.5 font-bold">
                <Check className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                {round.compareNote(estimateValue, round.exactAnswer)}
              </p>
              <p className="text-muted-foreground">
                Gdyby dokładny wynik wyszedł zupełnie inny niż szacunek — na przykład dziesięć razy
                większy — to znak, że warto sprawdzić rachunek jeszcze raz.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {phase === 'compared' && (
        <div className="flex justify-end">
          <Button onClick={nextRound} className="gap-1.5">
            {isLast ? 'Zakończ' : 'Następne zadanie'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
