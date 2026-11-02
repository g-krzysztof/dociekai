'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Timer, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Fact {
  prompt: string;
  options: number[];
  correctIndex: number;
}

/** Poprawna odpowiedź celowo na różnych miejscach — nigdy zawsze na tym samym. */
const FACTS: Fact[] = [
  { prompt: '6 × 7', options: [36, 49, 42, 35], correctIndex: 2 },
  { prompt: '8 × 4', options: [32, 28, 36, 24], correctIndex: 0 },
  { prompt: '9 × 3', options: [24, 30, 18, 27], correctIndex: 3 },
  { prompt: '7 × 6', options: [35, 42, 48, 36], correctIndex: 1 },
  { prompt: '5 × 9', options: [40, 50, 45, 36], correctIndex: 2 },
  { prompt: '8 × 8', options: [64, 56, 72, 63], correctIndex: 0 },
  { prompt: '6 × 6', options: [30, 42, 35, 36], correctIndex: 3 },
  { prompt: '9 × 7', options: [56, 63, 70, 54], correctIndex: 1 },
  { prompt: '4 × 9', options: [32, 40, 36, 27], correctIndex: 2 },
  { prompt: '7 × 7', options: [49, 42, 56, 48], correctIndex: 0 },
  { prompt: '56 : 7', options: [7, 9, 6, 8], correctIndex: 3 },
  { prompt: '63 : 9', options: [6, 7, 8, 9], correctIndex: 1 },
  { prompt: '45 : 5', options: [8, 10, 9, 7], correctIndex: 2 },
  { prompt: '36 : 6', options: [6, 5, 7, 9], correctIndex: 0 },
  { prompt: '72 : 8', options: [8, 10, 7, 9], correctIndex: 3 },
  { prompt: '64 : 8', options: [7, 8, 9, 6], correctIndex: 1 },
  { prompt: '48 : 6', options: [7, 9, 8, 6], correctIndex: 2 },
  { prompt: '54 : 9', options: [6, 5, 7, 9], correctIndex: 0 },
  { prompt: '9 × 8', options: [64, 81, 63, 72], correctIndex: 3 },
  { prompt: '8 × 6', options: [42, 48, 54, 40], correctIndex: 1 },
];

const ROUND_SECONDS = 30;
const ADVANCE_DELAY_MS = 450;

interface SpeedRoundProps {
  color: string;
  onComplete?: () => void;
}

/** Ćwiczenia: "Błyskawiczna tabliczka" — 30-sekundowa runda na czas, tyle faktów,
 * ile zdążysz. Pierwsza w kursie interakcja z odliczaniem — inne widgety są
 * bez presji czasu, ale tabliczka mnożenia to sprawność, nie tylko rozumienie. */
export function SpeedRound({ color, onComplete }: SpeedRoundProps) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [factIndex, setFactIndex] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const advanceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (phase !== 'running') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === 'running' && timeLeft === 0) {
      setPhase('done');
      onComplete?.();
    }
  }, [phase, timeLeft, onComplete]);

  useEffect(() => {
    return () => {
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
    };
  }, []);

  const start = () => {
    setPhase('running');
    setTimeLeft(ROUND_SECONDS);
    setFactIndex(0);
    setAttempted(0);
    setCorrect(0);
    setFeedback(null);
    setPickedIndex(null);
    setLocked(false);
  };

  const answer = (optionIndex: number) => {
    if (locked || phase !== 'running') return;
    setLocked(true);
    setPickedIndex(optionIndex);
    const fact = FACTS[factIndex % FACTS.length];
    const isCorrect = optionIndex === fact.correctIndex;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setAttempted((prev) => prev + 1);
    if (isCorrect) setCorrect((prev) => prev + 1);

    advanceTimeout.current = setTimeout(() => {
      setFactIndex((prev) => prev + 1);
      setFeedback(null);
      setPickedIndex(null);
      setLocked(false);
    }, ADVANCE_DELAY_MS);
  };

  if (phase === 'idle') {
    return (
      <div className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Zap className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Błyskawiczna tabliczka</h3>
        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          Masz {ROUND_SECONDS} sekund. Fakty mnożenia i dzielenia lecą jeden po drugim — klikaj
          poprawną odpowiedź tak szybko, jak umiesz. Nie ma kar za pomyłkę, liczy się tempo.
        </p>
        <Button onClick={start} size="lg" style={{ backgroundColor: color }}>
          Start
        </Button>
      </div>
    );
  }

  if (phase === 'done') {
    const perMinute = Math.round((correct / ROUND_SECONDS) * 60);
    const good = attempted > 0 && correct / attempted >= 0.7;
    return (
      <div className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-extrabold"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          {correct}/{attempted}
        </motion.div>
        <h3 className="mb-2 text-xl font-bold">
          {good ? 'Świetne tempo!' : 'Dobra runda — tempo przyjdzie z ćwiczeniem'}
        </h3>
        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          {correct} poprawnych faktów w {ROUND_SECONDS} sekund — to jakieś {perMinute} na minutę.
          Im częściej grasz, tym szybciej rośnie ten wynik.
        </p>
        <Button onClick={start} variant="outline" className="gap-2">
          <Timer className="h-4 w-4" />
          Zagraj jeszcze raz
        </Button>
      </div>
    );
  }

  const fact = FACTS[factIndex % FACTS.length];

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <Check className="h-4 w-4 text-emerald-600" aria-hidden />
          {correct} poprawnych
        </span>
        <span
          className="inline-flex items-center gap-1.5 font-mono text-2xl font-black tabular-nums"
          style={{ color: timeLeft <= 5 ? '#e11d48' : color }}
        >
          <Timer className="h-5 w-5" aria-hidden />
          {timeLeft}s
        </span>
      </div>

      <div className="mb-2 h-2 overflow-hidden bg-muted">
        <motion.div
          className="h-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${(timeLeft / ROUND_SECONDS) * 100}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>

      <p
        key={factIndex}
        className="my-6 text-center font-mono text-4xl font-black tabular-nums sm:text-5xl"
        style={{ color }}
      >
        {fact.prompt}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {fact.options.map((value, i) => {
          const isCorrectAnswer = locked && i === fact.correctIndex;
          const isWrongPick = locked && pickedIndex === i && i !== fact.correctIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => answer(i)}
              disabled={locked}
              className={cn(
                'border py-6 font-mono text-2xl font-bold tabular-nums transition-all disabled:cursor-not-allowed',
                !locked && 'hover:-translate-y-0.5 hover:shadow-md',
                isCorrectAnswer && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                isWrongPick && 'border-rose-400 bg-rose-50 dark:bg-rose-950/40'
              )}
              style={!locked ? { borderColor: `${color}59`, color } : undefined}
            >
              {value}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className="mt-4 flex justify-center">
          {feedback === 'correct' ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <Check className="h-4 w-4" /> Dobrze!
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600">
              <X className="h-4 w-4" /> Poprawna odpowiedź: {fact.options[fact.correctIndex]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
