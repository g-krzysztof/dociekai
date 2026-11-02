'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PARTS, TOTAL_ITEMS, lessonLink, type TestPart } from './parts';

/**
 * Blok „wynik” testu końcowego. Dwie rzeczy naraz i obie z tego, co dziecko
 * samo zrobiło:
 *
 * - **zakład kontra wynik** — cztery pary rzędów kropek: ile dziecko obstawiło
 *   i ile naprawdę zrobiło. Różnica jest tu ważniejsza niż wynik: dziecko, które
 *   zaniża się przy dobrym wyniku, i dziecko, które się zawyża, dostają dwie
 *   różne wskazówki;
 * - **most do klasy 5** — każda część stoi na jednym temacie z klasy 5. Wynik
 *   ≥ 2/3 to „gotowe”, 1/3 „prawie”, 0/3 „do dopięcia”, a słaba część wraca z
 *   odnośnikami do konkretnych lekcji, a nie do „powtórz materiał”.
 *
 * Nic tu nie jest oceną w sensie stopnia: nie ma procentów ani „zaliczone”.
 */

type Status = 'ready' | 'almost' | 'todo';

const statusOf = (score: number): Status => (score >= 2 ? 'ready' : score === 1 ? 'almost' : 'todo');

const STATUS_COPY: Record<Status, { label: string; className: string }> = {
  ready: { label: 'gotowe', className: 'bg-emerald-600 text-white' },
  almost: { label: 'prawie', className: 'bg-amber-500 text-white' },
  todo: { label: 'do dopięcia', className: 'bg-rose-600 text-white' },
};

function Dots({ filled, total = 3, tone }: { filled: number; total?: number; tone: 'bet' | 'score' }) {
  return (
    <span className="inline-flex gap-1" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            'h-3.5 w-3.5 rounded-full border-2',
            i < filled ? (tone === 'score' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-500 bg-slate-300 dark:bg-zinc-600') : 'border-slate-300 dark:border-zinc-600'
          )}
        />
      ))}
    </span>
  );
}

function calibration(bet: number, score: number): { text: string; tone: string } {
  if (bet === score) return { text: 'Zakład trafiony — znasz siebie.', tone: 'text-emerald-700 dark:text-emerald-400' };
  if (bet > score) return { text: 'Zawyżyłeś/aś: wydawało ci się, że umiesz więcej. Ten dział warto sprawdzić jeszcze raz.', tone: 'text-amber-700 dark:text-amber-400' };
  return { text: 'Zaniżyłeś/aś: umiesz więcej, niż myślałeś/myślałaś.', tone: 'text-sky-700 dark:text-sky-400' };
}

export function FinalResult({
  color,
  scores,
  bet,
  onComplete,
}: {
  color: string;
  scores: (number | null)[];
  bet: number[] | null;
  onComplete?: () => void;
}) {
  const complete = scores.every((score) => score !== null);
  const total = scores.reduce<number>((sum, score) => sum + (score ?? 0), 0);
  const reported = useRef(false);

  useEffect(() => {
    if (complete && bet && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  }, [complete, bet, onComplete]);

  if (!complete) {
    const missing = PARTS.filter((_, i) => scores[i] === null).map((part) => part.letter);
    return (
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="text-sm leading-relaxed sm:text-base">
          Wynik pojawi się, gdy skończysz wszystkie cztery części testu. Brakuje jeszcze: <strong>{missing.join(', ')}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-center">
        <span className="text-4xl font-black tabular-nums sm:text-5xl" style={{ color }}>
          {total}
        </span>
        <span className="text-xl font-bold text-muted-foreground"> z {TOTAL_ITEMS} zadań zrobionych dobrze</span>
      </p>

      {bet && (
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Zakład kontra wynik</p>
        <ul className="mt-2 space-y-2">
          {PARTS.map((part, index) => {
            const score = scores[index] as number;
            const guess = bet?.[index] ?? score;
            const verdict = calibration(guess, score);
            return (
              <li key={part.id} className="border p-3">
                <p className="text-sm font-semibold">
                  <span className="mr-2 font-mono" style={{ color }}>
                    {part.letter}
                  </span>
                  {part.short}
                </p>
                <div className="mt-2 grid grid-cols-[4.5rem_auto] items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>zakład</span>
                  <Dots filled={guess} tone="bet" />
                  <span>wynik</span>
                  <Dots filled={score} tone="score" />
                </div>
                <p className={cn('mt-2 text-xs leading-snug', verdict.tone)}>{verdict.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
      )}

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Most do klasy 5</p>
        <ul className="mt-2 space-y-2">
          {PARTS.map((part, index) => (
            <Bridge key={part.id} part={part} score={scores[index] as number} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function Bridge({ part, score }: { part: TestPart; score: number }) {
  const status = statusOf(score);
  const copy = STATUS_COPY[status];
  const links = part.revisit.map((item) => lessonLink(item.module, item.slug));
  return (
    <li className="grid gap-2 border p-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.3fr)] sm:items-center sm:gap-3">
      <p className="text-sm font-semibold">
        <span className="mr-2 font-mono">{part.letter}</span>
        {part.short} <span className="font-normal text-muted-foreground">({score} z {part.items.length})</span>
      </p>
      <span className={cn('inline-flex w-fit items-center gap-1.5 px-2.5 py-1 text-xs font-bold', copy.className)}>
        {status === 'ready' ? <Check className="h-3.5 w-3.5" aria-hidden /> : <TriangleAlert className="h-3.5 w-3.5" aria-hidden />}
        {copy.label}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </span>
      <div className="text-sm leading-snug">
        <p className="font-semibold">Klasa 5: {part.next.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{part.next.text}</p>
        {status !== 'ready' && (
          <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
            <span className="text-muted-foreground">Wróć do:</span>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="font-medium underline underline-offset-2 hover:text-primary">
                {link.title}
              </Link>
            ))}
          </p>
        )}
      </div>
    </li>
  );
}
