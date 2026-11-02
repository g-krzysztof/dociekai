'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PARTS } from './parts';

/**
 * Blok 1 — **zakład z samym sobą**. Zanim dziecko rozwiąże choć jedno zadanie,
 * ustawia cztery suwaki: ile z trzech zadań w każdej części zrobi dobrze. To
 * przewidywanie, tak jak przepowiednia w `GuessFirst`, tylko o sobie, a nie o
 * programie — i tak samo jest po to, żeby po fakcie dało się je porównać z
 * wynikiem. Zakład jest jedynym stanem, który idzie z tego bloku dalej.
 *
 * Suwak startuje na „?” i zmienia się dopiero po dotknięciu, więc nie da się
 * zatwierdzić czterech przypadkowych jedynek, nie patrząc na to, co się wpisało.
 */

export function ConfidenceBet({
  color,
  onBet,
  onComplete,
}: {
  color: string;
  onBet: (bet: number[]) => void;
  onComplete?: () => void;
}) {
  const [values, setValues] = useState<(number | null)[]>(() => PARTS.map(() => null));
  const [locked, setLocked] = useState(false);
  const ready = values.every((value) => value !== null);

  const set = (index: number, value: number) => {
    if (locked) return;
    setValues((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const lock = () => {
    const bet = values.map((value) => value ?? 0);
    setLocked(true);
    onBet(bet);
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Test ma <strong>cztery części po trzy zadania</strong>. Zanim zaczniesz, obstaw: ile zadań z każdej części zrobisz
        dobrze? Przesuń każdy suwak. Po teście zobaczysz, czy znasz siebie lepiej, czy gorzej, niż myślałeś/myślałaś.
      </p>

      <ul className="mt-4 space-y-3">
        {PARTS.map((part, index) => {
          const value = values[index];
          return (
            <li key={part.id} className="border p-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold">
                  <span className="mr-2 font-mono text-base" style={{ color }}>
                    {part.letter}
                  </span>
                  {part.short}
                </p>
                <span className="shrink-0 text-sm font-bold tabular-nums">{value === null ? '?' : `${value} z 3`}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">Sprawdza: {part.measures}.</p>
              <input
                type="range"
                min={0}
                max={3}
                step={1}
                value={value ?? 0}
                disabled={locked}
                onChange={(event) => set(index, Number(event.target.value))}
                onPointerDown={() => value === null && set(index, 0)}
                onKeyDown={() => value === null && set(index, 0)}
                aria-label={`Zakład: ile zadań z części ${part.letter} zrobisz dobrze`}
                className={cn('mt-2 h-8 w-full cursor-pointer accent-slate-600', value === null && 'opacity-50')}
              />
              <div className="flex justify-between px-1 text-[11px] tabular-nums text-muted-foreground" aria-hidden>
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={lock}
          disabled={!ready || locked}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 px-6 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          <Lock className="h-4 w-4" aria-hidden />
          {locked ? 'Zakład zapisany' : 'Zapisuję zakład'}
        </button>
        {!ready && !locked && <span className="text-xs text-muted-foreground">Dotknij każdego suwaka, żeby obstawić.</span>}
        {locked && <span className="text-xs text-muted-foreground">Zakład czeka na wynik testu.</span>}
      </div>
    </div>
  );
}
