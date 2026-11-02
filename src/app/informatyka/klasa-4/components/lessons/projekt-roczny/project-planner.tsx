'use client';

import { useEffect, useRef } from 'react';
import { Check, Puzzle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isPlanComplete, type ProjectKind, type ProjectPlan } from './plan';

/**
 * Karta projektu — lekki plan (typ, temat, odbiorca, zasada), zanim dziecko
 * zabierze się za prawdziwe budowanie w zadaniu. Nie ma tu jednej dobrej
 * odpowiedzi do sprawdzenia (to jest PLAN, nie dowód), więc blok kończy się,
 * gdy karta jest po prostu wypełniona.
 */

const WHO = ['Mama', 'Tata', 'Rodzeństwo', 'Kolega/koleżanka', 'Cała rodzina'];

interface ProjectPlannerProps {
  color: string;
  plan: ProjectPlan;
  onChange: (plan: ProjectPlan) => void;
  onComplete?: () => void;
}

export function ProjectPlanner({ color, plan, onChange, onComplete }: ProjectPlannerProps) {
  const reported = useRef(false);
  const complete = isPlanComplete(plan);

  useEffect(() => {
    if (complete && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  }, [complete, onComplete]);

  const setKind = (kind: ProjectKind) => onChange({ ...plan, kind });
  const setField = (field: 'temat' | 'dlaKogo' | 'zasada', value: string) =>
    onChange({ ...plan, [field]: value });

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Co budujesz
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {(['quiz', 'gra'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setKind(option)}
              className="border p-3 text-left text-sm transition-colors hover:bg-muted/50"
              style={plan.kind === option ? { borderColor: color, backgroundColor: `${color}14` } : undefined}
            >
              <span className="block font-semibold" style={plan.kind === option ? { color } : undefined}>
                {option === 'quiz' ? 'Quiz' : 'Gra'}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {option === 'quiz'
                  ? 'sprawdza, co ktoś wie — pytania z odpowiedziami do wyboru'
                  : 'ma cel, do którego trzeba dojść, omijając przeszkody'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Temat</span>
          <input
            type="text"
            value={plan.temat}
            onChange={(event) => setField('temat', event.target.value)}
            placeholder="np. Zwierzęta"
            className="w-full border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Dla kogo</span>
          <div className="flex flex-wrap gap-1.5">
            {WHO.map((who) => (
              <button
                key={who}
                type="button"
                onClick={() => setField('dlaKogo', who)}
                className={cn(
                  'border px-2.5 py-1 text-xs font-medium transition-colors',
                  plan.dlaKogo === who ? 'text-white' : 'hover:bg-muted/50'
                )}
                style={plan.dlaKogo === who ? { backgroundColor: color, borderColor: color } : undefined}
              >
                {who}
              </button>
            ))}
          </div>
        </label>
      </div>

      <label className="mt-4 block text-sm">
        <span className="mb-1 block font-medium">
          {plan.kind === 'quiz' ? 'Jak się liczy wynik' : 'Jak się wygrywa albo przegrywa'}
        </span>
        <input
          type="text"
          value={plan.zasada}
          onChange={(event) => setField('zasada', event.target.value)}
          placeholder={
            plan.kind === 'quiz'
              ? 'np. za każdą dobrą odpowiedź jeden punkt'
              : 'np. dotrzesz do mety, nie dotykając przeszkód'
          }
          className="w-full border px-3 py-2 text-sm"
        />
      </label>

      {complete && (
        <div className="mt-5 flex items-start gap-2.5 border-l-2 p-3" style={{ borderColor: color, backgroundColor: `${color}0f` }}>
          <Puzzle className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold" style={{ color }}>
              <Check className="h-4 w-4 shrink-0" aria-hidden />
              Karta projektu gotowa.
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              To Twój plan — nie musisz się go trzymać co do słowa. W zadaniu wolno Ci zmienić zdanie
              po drodze, tak jak zrobiłby to każdy, kto naprawdę coś buduje.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
