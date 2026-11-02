'use client';

import { useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, HelpCircle, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { BarModel } from './bar-model';
import type { BarModelSpec } from '../lib/word-problem-model';

export interface ProblemPhrase {
  id: string;
  /** Fragment zdania, ze spacją/interpunkcją tam, gdzie potrzebna — renderowany dosłownie. */
  text: string;
  tappable?: boolean;
  /** `given` — dana liczbowa, `question` — pytanie, `decoy` — liczba niepotrzebna do obliczeń. */
  role?: 'given' | 'question' | 'decoy';
  label?: string;
}

export interface WordProblem {
  id: string;
  phrases: ProblemPhrase[];
  model: BarModelSpec;
  equation: string;
  answer: number;
  answerLabel: string;
}

interface ProblemUnpackerProps {
  problem: WordProblem;
  color: string;
  /** `spot` — tylko wyłap dane i pytanie (Rozgrzewka). `solve` — pełny przebieg ze schematem i odpowiedzią. */
  mode: 'spot' | 'solve';
  onComplete?: () => void;
}

/**
 * Zdanie zadania tekstowego jako klikalny tekst: dane i pytanie „spadają” do
 * zasobnika poniżej, a liczba-podpucha (jeśli jest) tylko lekko drży i
 * przypomina, że nie każda liczba w treści jest potrzebna — dokładnie ta
 * umiejętność, której uczy ta lekcja. Bez kary za błąd: dotknięcie podpuchy
 * nic nie psuje, można próbować dalej (ta sama filozofia co `JumpLine`/`FactTriangle`).
 * W trybie `solve`, po skompletowaniu danych i pytania, odsłania się
 * `<BarModel>` + działanie + pole na wynik.
 *
 * Promowany z `lessons/zadania-tekstowe/` do współdzielonego `components/`
 * 2026-08-19, gdy lekcja `zadania-tekstowe-pisemne` stała się drugim
 * konsumentem — ten sam precedens co `ColumnGrid`/`FactTriangle`.
 */
export function ProblemUnpacker({ problem, color, mode, onComplete }: ProblemUnpackerProps) {
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [decoyHint, setDecoyHint] = useState(false);
  const [answerValue, setAnswerValue] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const completedRef = useRef(false);
  const hintTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const requiredIds = problem.phrases
    .filter((p) => p.role === 'given' || p.role === 'question')
    .map((p) => p.id);
  const allCollected = requiredIds.every((id) => collected.has(id));

  const tapPhrase = (phrase: ProblemPhrase) => {
    if (!phrase.tappable || collected.has(phrase.id)) return;

    if (phrase.role === 'decoy') {
      setShakeId(phrase.id);
      setDecoyHint(true);
      if (hintTimeout.current) clearTimeout(hintTimeout.current);
      hintTimeout.current = setTimeout(() => {
        setShakeId(null);
        setDecoyHint(false);
      }, 1700);
      return;
    }

    const next = new Set(collected);
    next.add(phrase.id);
    setCollected(next);

    if (mode === 'spot' && !completedRef.current && requiredIds.every((id) => next.has(id))) {
      completedRef.current = true;
      onComplete?.();
    }
  };

  const submitAnswer = (event: FormEvent) => {
    event.preventDefault();
    if (!answerValue.trim()) return;
    const numeric = Number(answerValue.replace(',', '.'));
    if (numeric === problem.answer) {
      setFeedback('correct');
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }
    setFeedback('wrong');
  };

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed sm:text-lg">
        {problem.phrases.map((phrase) => {
          if (!phrase.tappable) return <span key={phrase.id}>{phrase.text}</span>;

          const isCollected = collected.has(phrase.id);
          const isQuestion = phrase.role === 'question';

          return (
            <motion.button
              key={phrase.id}
              type="button"
              onClick={() => tapPhrase(phrase)}
              animate={shakeId === phrase.id ? { x: [0, -5, 5, -5, 5, 0] } : undefined}
              transition={{ duration: 0.4 }}
              className={cn(
                'mx-0.5 cursor-pointer border-b-2 border-dashed px-0.5 font-semibold transition-colors',
                isCollected && 'cursor-default border-solid'
              )}
              style={{
                borderColor: color,
                backgroundColor: isCollected ? `${color}22` : 'transparent',
                color: isCollected ? `color-mix(in oklch, ${color} 88%, black)` : undefined,
              }}
            >
              {isCollected &&
                (isQuestion ? (
                  <HelpCircle className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Tag className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                ))}
              {phrase.text}
            </motion.button>
          );
        })}
      </p>

      <div className="min-h-[4.5rem] border-t p-3" style={{ borderColor: `${color}33` }}>
        <p
          className="mb-2 text-xs font-bold uppercase tracking-[0.15em]"
          style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
        >
          Dane i pytanie
        </p>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {problem.phrases
              .filter((p) => (p.role === 'given' || p.role === 'question') && collected.has(p.id))
              .map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: -14, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="flex items-center gap-1.5 border px-3 py-1.5 text-sm"
                  style={{ borderColor: color, backgroundColor: `${color}14` }}
                >
                  {p.role === 'question' ? (
                    <HelpCircle className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  ) : (
                    <Tag className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  )}
                  <span className="font-medium">
                    {p.role === 'question' ? 'Pytanie' : (p.label ?? p.text)}
                  </span>
                </motion.div>
              ))}
          </AnimatePresence>
          {collected.size === 0 && (
            <p className="text-sm text-muted-foreground">
              Kliknij liczby i pytanie w zdaniu powyżej.
            </p>
          )}
        </div>
        {decoyHint && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-xs text-rose-600 dark:text-rose-400"
          >
            Ta liczba nie jest tu potrzebna do obliczenia.
          </motion.p>
        )}
      </div>

      {mode === 'spot' && allCollected && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
        >
          <Check className="h-4 w-4 shrink-0" aria-hidden />
          Świetnie! Znalazłeś/aś dane i pytanie.
        </motion.p>
      )}

      {mode === 'solve' && allCollected && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 border-t pt-5"
          style={{ borderColor: `${color}33` }}
        >
          <BarModel spec={problem.model} color={color} />
          <p className="text-center font-mono text-lg font-bold tabular-nums" style={{ color }}>
            {problem.equation}
          </p>
          <form
            onSubmit={submitAnswer}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            <Input
              value={answerValue}
              onChange={(event) => {
                setAnswerValue(event.target.value);
                if (feedback === 'wrong') setFeedback('idle');
              }}
              disabled={feedback === 'correct'}
              inputMode="numeric"
              autoComplete="off"
              placeholder="?"
              className={cn(
                'w-28 text-center font-mono text-base',
                feedback === 'correct' && 'border-emerald-500',
                feedback === 'wrong' && 'border-rose-400'
              )}
            />
            <span className="text-sm text-muted-foreground">{problem.answerLabel}</span>
            {feedback !== 'correct' && (
              <Button type="submit" disabled={!answerValue.trim()}>
                Sprawdź
              </Button>
            )}
            {feedback === 'correct' && (
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" aria-hidden />
                Brawo, dokładnie {problem.answer}!
              </span>
            )}
          </form>
          {feedback === 'wrong' && (
            <p className="text-center text-xs text-rose-600 dark:text-rose-400">
              Jeszcze nie — sprawdź działanie zapisane pod schematem i spróbuj ponownie.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
