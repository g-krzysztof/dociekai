'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleAlert, PartyPopper } from 'lucide-react';
import { ModuleIcon } from '@/components/ui/module-icon';
import { useLessonProgress } from './lesson-shell';
import type { MathLesson } from '../data/lessons';

export interface ResultCluster {
  id: string;
  label: string;
  icon: string;
  /** Lekcje tego klastra — cel rekomendacji, gdy wynik klastra wypadnie słabo. */
  lessons: MathLesson[];
}

/**
 * Nadpisania tekstów dla podsumowań, które nie zamykają jednego modułu
 * (np. przekrojowa powtórka roku w module 9) — domyślne mówią „moduł".
 * Każdy wariant per pasmo wyniku: `strong` ≥ 90%, `mid` ≥ 60%, `weak` niżej.
 */
export interface ModuleResultCopy {
  headline: { strong: string; mid: string; weak: string };
  summary: { strong: string; mid: string; weak: string };
  /** Zdanie w zielonej stopce, gdy żaden klaster nie wypadł słabo. */
  allGood: string;
}

const DEFAULT_COPY: ModuleResultCopy = {
  headline: {
    strong: 'Moduł opanowany od podszewki!',
    mid: 'Solidne podsumowanie!',
    weak: 'Dobrze, że to sprawdziliśmy',
  },
  summary: {
    strong:
      'Wszystkie kluczowe umiejętności modułu masz mocno utrwalone. Możesz iść dalej bez obaw.',
    mid: 'Większość materiału masz opanowaną. Kilka rzeczy warto sobie przypomnieć — patrz niżej.',
    weak: 'Kilka tematów wypadło słabiej — dokładnie po to jest to podsumowanie. Wróć do wskazanych lekcji, zanim ruszysz dalej.',
  },
  allGood: 'Żaden blok nie wypadł słabo — cały moduł masz solidnie opanowany.',
};

interface ModuleResultSummaryProps {
  clusters: ResultCluster[];
  scores: Partial<Record<string, { score: number; total: number }>>;
  color: string;
  onComplete?: () => void;
  /** Nadpisuje domyślne teksty „modułowe" — patrz `ModuleResultCopy`. */
  copy?: Partial<ModuleResultCopy>;
}

/**
 * Wynik podsumowania modułu — ten sam szkielet co `ResultSummary` w
 * `test-diagnostyczny` (czeka na `isDone` wszystkich klastrów, dopiero
 * potem liczy i pokazuje wynik), ale rekomendacja dla słabego klastra
 * linkuje do KONKRETNYCH lekcji TEGO modułu (nie do całych innych modułów
 * jak w diagnostyku) — bo tu jesteśmy po module, nie przed kursem. Promowany
 * tu z `components/lessons/podsumowanie-liczby-naturalne/` w chwili, gdy
 * `podsumowanie-obliczenia-praktyczne` stało się jego drugim konsumentem —
 * `clusters`/`scores` już były generyczne, więc przeniesienie nie zmieniło
 * niczego poza ścieżkami importu.
 */
export function ModuleResultSummary({
  clusters,
  scores,
  color,
  onComplete,
  copy,
}: ModuleResultSummaryProps) {
  const text: ModuleResultCopy = {
    headline: { ...DEFAULT_COPY.headline, ...copy?.headline },
    summary: { ...DEFAULT_COPY.summary, ...copy?.summary },
    allGood: copy?.allGood ?? DEFAULT_COPY.allGood,
  };
  const { isDone } = useLessonProgress();
  const allDone = clusters.every((cluster) => isDone(cluster.id));

  useEffect(() => {
    if (allDone) onComplete?.();
  }, [allDone, onComplete]);

  if (!allDone) {
    const remaining = clusters.filter((cluster) => !isDone(cluster.id));
    return (
      <div className="border border-dashed bg-muted/30 p-6 text-center sm:p-8">
        <p className="mb-4 text-sm text-muted-foreground sm:text-base">
          Wynik pojawi się tutaj, gdy skończysz wszystkie powtórki powyżej.
        </p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {remaining.map((cluster) => (
            <a
              key={cluster.id}
              href={`#${cluster.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              <ModuleIcon name={cluster.icon} className="h-3.5 w-3.5" />
              {cluster.label}
            </a>
          ))}
        </div>
      </div>
    );
  }

  const totalScore = clusters.reduce((sum, c) => sum + (scores[c.id]?.score ?? 0), 0);
  const totalMax = clusters.reduce((sum, c) => sum + (scores[c.id]?.total ?? 0), 0);
  const percent = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  const weakClusters = clusters.filter((c) => {
    const r = scores[c.id];
    return r && r.total > 0 && r.score / r.total < 0.6;
  });

  const headline =
    percent >= 90 ? text.headline.strong : percent >= 60 ? text.headline.mid : text.headline.weak;

  const summary =
    percent >= 90 ? text.summary.strong : percent >= 60 ? text.summary.mid : text.summary.weak;

  return (
    <div className="border bg-white p-6 dark:bg-zinc-900/80 sm:p-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-extrabold"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          {percent}%
        </span>
        <div>
          <h3 className="text-lg font-bold">{headline}</h3>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
      </div>

      <ul className="mb-6 grid gap-2 sm:grid-cols-2">
        {clusters.map((cluster) => {
          const r = scores[cluster.id];
          const clusterPercent = r && r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
          const weak = weakClusters.includes(cluster);
          return (
            <li key={cluster.id} className="border p-4">
              <div className="mb-2 flex items-center gap-2">
                <ModuleIcon name={cluster.icon} className="h-4 w-4 shrink-0" style={{ color }} />
                <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">
                  {cluster.label}
                </span>
                <span className="shrink-0 text-sm font-bold tabular-nums">
                  {r?.score ?? 0}/{r?.total ?? 0}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden bg-muted">
                <div
                  className="h-full"
                  style={{ width: `${clusterPercent}%`, backgroundColor: weak ? '#f59e0b' : color }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {weakClusters.length > 0 ? (
        <div
          className="border-t-2 p-4"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <CircleAlert className="h-4 w-4" style={{ color }} aria-hidden />
            Warto powtórzyć:
          </p>
          <div className="space-y-3">
            {weakClusters.map((cluster) => (
              <div key={cluster.id}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {cluster.label}
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {cluster.lessons.map((lesson) => (
                    <Link
                      key={lesson.slug}
                      href={`/matematyka/klasa-4/${lesson.moduleSlug}/${lesson.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold transition-transform hover:translate-x-0.5"
                      style={{ color }}
                    >
                      {lesson.short}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 border-t-2 border-emerald-500 bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          <PartyPopper className="h-5 w-5 shrink-0" aria-hidden />
          <p>{text.allGood}</p>
        </div>
      )}
    </div>
  );
}
