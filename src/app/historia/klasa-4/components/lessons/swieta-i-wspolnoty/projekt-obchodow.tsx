'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskShell, type ProofCriterion, type ProofOutcome } from '@/components/block-lesson/task-shell';
import { BUDGET_MIN, PUNKTY, PUNKT_BY_ID, judgeObchody, schedule, totalMinutes } from './obchody';

const RED = '#DC143C';

const CRITERIA: ProofCriterion[] = [
  { id: 'symbole', label: 'Jest wprowadzenie flagi i jest hymn.' },
  { id: 'otwarcie', label: 'Uroczystość zaczyna się od flagi i hymnu.' },
  { id: 'rok1918', label: 'Jest punkt, który mówi, co się stało w 1918 roku.' },
  { id: 'wszyscy', label: 'Poza hymnem jest punkt, w którym biorą udział wszyscy, nie tylko występujący.' },
  { id: 'czas', label: `Całość mieści się w ${BUDGET_MIN} minutach.` },
];

/** Odcienie klocków na pasku czasu — kolejne punkty na zmianę. */
const SHADES = ['#fecaca', '#e4e4e7', '#fde68a', '#d1fae5', '#e0e7ff', '#fce7f3'];

/**
 * L11 blok 4 — zadanie: program szkolnych obchodów 11 listopada.
 * **Układa program z klocków na pasku czasu 45 minut** — klocek ma szerokość
 * swoich minut, nadmiar wystaje za kreskę dzwonka. Werdykt z jawnych cech
 * klocków; nagrodą jest zaproszenie z godzinami policzonymi z programu.
 */
export function ProjektObchodow({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [program, setProgram] = useState<string[]>([]);
  const total = totalMinutes(program);
  const scale = Math.max(total, BUDGET_MIN);

  const add = (id: string) => setProgram((p) => (p.includes(id) ? p : [...p, id]));
  const remove = (id: string) => setProgram((p) => p.filter((x) => x !== id));
  const shift = (i: number, d: -1 | 1) =>
    setProgram((p) => {
      const j = i + d;
      if (j < 0 || j >= p.length) return p;
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const judge = (): ProofOutcome<string[]> => ({ verdicts: judgeObchody(program), data: [...program] });

  const workshop = (
    <div className="space-y-4 text-sm">
      {/* Pasek czasu */}
      <div>
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>dzwonek 10:00</span>
          <span className={cn('font-semibold tabular-nums', total > BUDGET_MIN && 'text-destructive')}>
            {total} / {BUDGET_MIN} min
          </span>
        </div>
        <div className="relative h-12 border bg-muted/30">
          <div className="absolute inset-y-0 left-0 flex" style={{ width: `${(total / scale) * 100}%` }}>
            {program.map((id, i) => {
              const p = PUNKT_BY_ID[id];
              return (
                <div
                  key={id}
                  className="h-full overflow-hidden border-r border-white px-1 py-0.5 text-[10px] leading-tight"
                  style={{ width: `${(p.minutes / total) * 100}%`, background: SHADES[i % SHADES.length] }}
                  title={`${p.label} — ${p.minutes} min`}
                >
                  <span className="font-semibold tabular-nums">{p.minutes}′</span> {p.label}
                </div>
              );
            })}
          </div>
          {total > BUDGET_MIN && (
            <div
              className="pointer-events-none absolute inset-y-0 right-0"
              style={{ left: `${(BUDGET_MIN / scale) * 100}%`, background: 'repeating-linear-gradient(135deg, #dc262640 0 6px, transparent 6px 12px)' }}
            />
          )}
          <div className="absolute -bottom-1 -top-1 w-0.5 bg-foreground" style={{ left: `calc(${(BUDGET_MIN / scale) * 100}% - 1px)` }} aria-hidden />
        </div>
        <p className="mt-1 text-right text-[11px] text-muted-foreground">kreska = dzwonek na przerwę (10:45)</p>
      </div>

      {/* Program — kolejność */}
      {program.length > 0 && (
        <ol className="space-y-1">
          {program.map((id, i) => {
            const p = PUNKT_BY_ID[id];
            return (
              <li key={id} className="flex items-center gap-2 border bg-white px-2 py-1 dark:bg-zinc-900/80">
                <span className="w-5 font-mono text-xs text-muted-foreground">{i + 1}.</span>
                <span className="min-w-0 flex-1">{p.label}</span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">{p.minutes}′</span>
                <button type="button" onClick={() => shift(i, -1)} disabled={i === 0} className="cursor-pointer p-1 disabled:opacity-30" aria-label={`Wyżej: ${p.label}`}>
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => shift(i, 1)} disabled={i === program.length - 1} className="cursor-pointer p-1 disabled:opacity-30" aria-label={`Niżej: ${p.label}`}>
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => remove(id)} className="cursor-pointer p-1 text-muted-foreground hover:text-destructive" aria-label={`Usuń: ${p.label}`}>
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {/* Klocki do wyboru */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Klocki — stuknij, żeby dodać na koniec</p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {PUNKTY.filter((p) => !program.includes(p.id)).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => add(p.id)}
              className="flex cursor-pointer items-center gap-2 border border-dashed px-2 py-1.5 text-left hover:bg-muted"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />
              <span className="min-w-0 flex-1">{p.label}</span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{p.minutes}′</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <TaskShell<string[]>
      color={color}
      brief={
        <p>
          Samorząd szkolny prosi cię o program obchodów 11 listopada. Na całość jest jedna lekcja —
          {` ${BUDGET_MIN} minut`} — i ani minuty dłużej, bo potem dzwonek. Ułóż program z klocków.
          Nie ma jednego dobrego programu: liczy się, czy spełnia warunki poniżej.
        </p>
      }
      criteria={CRITERIA}
      workshop={workshop}
      judge={judge}
      canCheck={program.length > 0}
      checkLabel="Sprawdź program"
      onReset={() => setProgram([])}
      acceptedText={
        <p>
          Twój program ma wszystko, czego potrzebuje święto: symbole, które mówią „to my”, opowieść
          o tym, <em>co</em> świętujemy, i chwilę, w której cała szkoła robi coś razem.
        </p>
      }
      reward={<Zaproszenie program={program} />}
      onComplete={onComplete}
    />
  );
}

/** Nagroda: zaproszenie z programem dziecka i godzinami policzonymi z jego minut. */
function Zaproszenie({ program }: { program: string[] }) {
  return (
    <div className="mx-auto max-w-md border-2 bg-white p-5 text-center shadow-sm dark:bg-zinc-900" style={{ borderColor: RED }}>
      <div className="mx-auto mb-3 h-6 w-10 border" aria-hidden>
        <div className="h-1/2 bg-white" />
        <div className="h-1/2" style={{ background: RED }} />
      </div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Zaproszenie</p>
      <p className="mt-1 font-serif text-lg font-bold">Narodowe Święto Niepodległości</p>
      <p className="text-sm">szkolne obchody · 11 listopada, godz. 10:00</p>
      <ol className="mt-4 space-y-1 text-left text-sm">
        {schedule(program).map(({ id, at, punkt }) => (
          <li key={id} className="flex gap-3">
            <span className="w-11 shrink-0 font-mono tabular-nums" style={{ color: RED }}>
              {at}
            </span>
            <span>{punkt.invite}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-muted-foreground">
        Zabierz ten program na prawdziwe obchody w szkole albo w swojej miejscowości i porównaj:
        co tam było takie samo, a co inne?
      </p>
    </div>
  );
}
