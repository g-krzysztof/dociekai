'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleAlert, PartyPopper } from 'lucide-react';
import { ModuleIcon } from '@/components/ui/module-icon';
import { useLessonProgress } from '../../lesson-shell';

export interface DiagnosticDomain {
  id: string;
  label: string;
  icon: string;
  recommendedHref: string;
  recommendedLabel: string;
}

interface ResultSummaryProps {
  domains: DiagnosticDomain[];
  scores: Partial<Record<string, { score: number; total: number }>>;
  color: string;
  onComplete?: () => void;
}

/**
 * Podsumowanie testu diagnostycznego. Czeka, aż dziecko skończy wszystkie
 * cztery sprawdziany (stan `isDone` z shellu), dopiero potem liczy i pokazuje
 * wynik — dzięki temu działa niezależnie od kolejności przewijania sekcji.
 */
export function ResultSummary({ domains, scores, color, onComplete }: ResultSummaryProps) {
  const { isDone } = useLessonProgress();
  const allDone = domains.every((domain) => isDone(domain.id));

  useEffect(() => {
    if (allDone) onComplete?.();
  }, [allDone, onComplete]);

  if (!allDone) {
    const remaining = domains.filter((domain) => !isDone(domain.id));
    return (
      <div className="border border-dashed bg-muted/30 p-6 text-center sm:p-8">
        <p className="mb-4 text-sm text-muted-foreground sm:text-base">
          Wynik pojawi się tutaj, gdy skończysz wszystkie sprawdziany powyżej.
        </p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {remaining.map((domain) => (
            <a
              key={domain.id}
              href={`#${domain.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              <ModuleIcon name={domain.icon} className="h-3.5 w-3.5" />
              {domain.label}
            </a>
          ))}
        </div>
      </div>
    );
  }

  const totalScore = domains.reduce((sum, d) => sum + (scores[d.id]?.score ?? 0), 0);
  const totalMax = domains.reduce((sum, d) => sum + (scores[d.id]?.total ?? 0), 0);
  const percent = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  const weakDomains = domains.filter((d) => {
    const r = scores[d.id];
    return r && r.total > 0 && r.score / r.total < 0.6;
  });

  const headline =
    percent >= 90 ? 'Solidne podstawy!' : percent >= 60 ? 'Dobry start!' : 'To dokładnie po to jest ten test';

  const summary =
    percent >= 90
      ? 'Masz mocne fundamenty z klas I–III. W module 1 pójdzie z górki.'
      : percent >= 60
        ? 'Większość tematów masz opanowaną. Kilka rzeczy warto sobie przypomnieć — patrz niżej.'
        : 'Nic straconego — cały moduł 1 jest po to, żeby uzupełnić te braki krok po kroku.';

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
        {domains.map((domain) => {
          const r = scores[domain.id];
          const domainPercent = r && r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
          const weak = weakDomains.includes(domain);
          return (
            <li key={domain.id} className="border p-4">
              <div className="mb-2 flex items-center gap-2">
                <ModuleIcon name={domain.icon} className="h-4 w-4 shrink-0" style={{ color }} />
                <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">
                  {domain.label}
                </span>
                <span className="shrink-0 text-sm font-bold tabular-nums">
                  {r?.score ?? 0}/{r?.total ?? 0}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden bg-muted">
                <div
                  className="h-full"
                  style={{ width: `${domainPercent}%`, backgroundColor: weak ? '#f59e0b' : color }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {weakDomains.length > 0 ? (
        <div className="border-t-2 p-4" style={{ borderColor: color, backgroundColor: `${color}0c` }}>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <CircleAlert className="h-4 w-4" style={{ color }} aria-hidden />
            Warto powtórzyć przed startem:
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {weakDomains.map((domain) => (
              <Link
                key={domain.id}
                href={domain.recommendedHref}
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-transform hover:translate-x-0.5"
                style={{ color }}
              >
                {domain.recommendedLabel}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 border-t-2 border-emerald-500 bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          <PartyPopper className="h-5 w-5 shrink-0" aria-hidden />
          <p>Żaden temat nie wypadł słabo — możesz śmiało ruszać do modułu 1.</p>
        </div>
      )}
    </div>
  );
}
