'use client';

import { useState } from 'react';
import { Check, Trophy } from 'lucide-react';
import type { ProjectPlan } from './plan';

/**
 * Zamknięcie lekcji: karta projektu z bloku 3 wraca tu jako gotowa rzecz, a
 * refleksja pyta o skutek testów — bez jednej dobrej odpowiedzi, bo to, co
 * naprawdę zmieniło się w cudzym, nieznanym z góry projekcie, nie da się
 * sprawdzić automatycznie (tak samo jak dziennik testów w zadaniu).
 */

const OPTIONS = [
  'Nic — testerzy powiedzieli, że wszystko jasne',
  'Dodałem/dodałam podpowiedź na start',
  'Poprawiłem/poprawiłam to, co się zawieszało',
  'Coś innego — sam/sama wiesz co',
];

export function ProjectReflection({
  color,
  plan,
  onComplete,
}: {
  color: string;
  plan: ProjectPlan;
  onComplete?: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  const pick = (option: string) => {
    const first = picked === null;
    setPicked(option);
    if (first) onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        <Trophy className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Twoja karta projektu
      </p>
      <div className="mt-3 border-2 border-dashed p-4" style={{ borderColor: `${color}55` }}>
        <p className="text-lg font-bold">{plan.temat || 'Twój projekt'}</p>
        <p className="text-sm text-muted-foreground">
          {plan.kind === 'quiz' ? 'Quiz' : 'Gra'} dla: {plan.dlaKogo || '—'}
        </p>
        {plan.zasada && <p className="mt-2 text-sm">{plan.zasada}</p>}
      </div>

      <p className="mt-5 text-sm font-medium">Co zmieniło się po testach u innych osób?</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => pick(option)}
            className="flex items-center gap-2 border p-3 text-left text-sm transition-colors hover:bg-muted/50"
            style={picked === option ? { borderColor: color, backgroundColor: `${color}14` } : undefined}
          >
            {picked === option && <Check className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />}
            {option}
          </button>
        ))}
      </div>

      {picked && (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Cały cykl za Tobą: pomysł, budowa, testy u kogoś innego, poprawki. To jest dokładnie to,
          co robi każdy, kto naprawdę coś tworzy.
        </p>
      )}
    </div>
  );
}
