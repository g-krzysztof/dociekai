'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { PARTS, TASKS, partScore } from './zadania';
import { useTest } from './test-state';

/**
 * Blok 5 — **Wynik i most**. Bez procentów: przy każdej części „co już
 * umiesz” (trafione zadania) i odnośnik do lekcji przy pomyłce. Potem most
 * do klasy 5: oś wydłuża się za 476 rok, w mgle sylwetki zamku, katedry
 * i grodu Mieszka I. `onDone` od razu po zobaczeniu wyniku (refleksja).
 */
export function WynikWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const { results } = useTest();
  const reported = useRef(false);
  const answered = TASKS.filter((t) => t.id in results).length;

  useEffect(() => {
    if (answered >= TASKS.length && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [answered, onDone]);

  if (answered < TASKS.length) {
    return <p className="text-sm text-muted-foreground">Wynik pojawi się, gdy odpowiesz na wszystkie dwanaście zadań ({answered}/12).</p>;
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-2">
        {PARTS.map((p) => {
          const s = partScore(results, p.id);
          const tasks = TASKS.filter((t) => t.part === p.id);
          return (
            <section key={p.id} className="border bg-white p-3 dark:bg-zinc-900">
              <h3 className="flex items-baseline justify-between text-sm font-semibold">
                {p.title}
                <span className="font-mono text-xs tabular-nums" style={{ color }}>
                  {s.ok}/{s.total}
                </span>
              </h3>
              <ul className="mt-1.5 space-y-1 text-sm">
                {tasks
                  .filter((t) => results[t.id])
                  .map((t) => (
                    <li key={t.id}>✓ {t.skill}</li>
                  ))}
                {tasks
                  .filter((t) => !results[t.id])
                  .map((t) => (
                    <li key={t.id} className="text-muted-foreground">
                      ↺ wróć do{' '}
                      <Link href={`/historia/klasa-4/${t.lesson.href}`} className="underline underline-offset-2" style={{ color }}>
                        {t.lesson.label}
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          );
        })}
      </div>

      <section className="space-y-3 border-t pt-4">
        <h3 className="text-base font-semibold">Most do klasy 5</h3>
        <p className="text-sm leading-relaxed">
          Twoja oś kończy się na upadku Rzymu w 476 roku. Ale czas płynie dalej — do średniowiecza. W klasie 5 przejdziesz przez mgłę:
          zobaczysz, jak powstawały zamki i katedry i jak na ziemiach Polski powstało państwo Mieszka I.
        </p>
        <svg viewBox="0 0 600 170" className="block h-auto w-full" role="img" aria-label="Oś czasu: starożytność do 476 roku, dalej mgła, a w niej sylwetki grodu, katedry i zamku">
          <defs>
            <linearGradient id="tk-mgla" x1="0" x2="1">
              <stop offset="0" stopColor="#cbd5e1" stopOpacity="0" />
              <stop offset="0.2" stopColor="#cbd5e1" stopOpacity="0.85" />
              <stop offset="1" stopColor="#e2e8f0" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect x={10} y={110} width={330} height={10} fill={color} opacity={0.75} />
          <text x={10} y={142} fontSize={16} fill="currentColor">3500 p.n.e.</text>
          <text x={175} y={102} fontSize={16} textAnchor="middle" fill="currentColor">starożytność</text>
          <line x1={340} y1={100} x2={340} y2={124} stroke="currentColor" strokeWidth={2} />
          <text x={340} y={142} fontSize={16} textAnchor="middle" fill="currentColor">476</text>
          {/* Sylwetki za mgłą: gród, katedra, zamek */}
          <g fill="#64748b">
            <path d="M380,110 L380,82 L392,72 L404,82 L404,110 Z M372,110 L372,92 L412,92 L412,110 Z" />
            <path d="M450,110 L450,60 L458,40 L466,60 L466,110 Z M466,110 L466,78 L498,78 L498,110 Z M498,110 L498,60 L506,40 L514,60 L514,110 Z" />
            <path d="M540,110 L540,70 L548,70 L548,62 L556,62 L556,70 L564,70 L564,62 L572,62 L572,70 L580,70 L580,110 Z" />
          </g>
          <rect x={345} y={20} width={255} height={100} fill="url(#tk-mgla)" />
          <rect x={340} y={110} width={250} height={10} fill="#94a3b8" opacity={0.5} />
          <line x1={392} y1={120} x2={392} y2={148} stroke="#64748b" strokeWidth={1.5} />
          <text x={398} y={164} fontSize={16} fill="currentColor">966 · Mieszko I</text>
          <text x={595} y={142} fontSize={16} textAnchor="end" fill="currentColor">klasa 5 →</text>
        </svg>
      </section>
    </div>
  );
}
