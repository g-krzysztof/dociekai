'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleAlert, PartyPopper, type LucideIcon } from 'lucide-react';
import { useLessonProgress } from '../../lesson-shell';
import type { DrillScore } from './mouse-keyboard-drill';

/**
 * Podsumowanie testu diagnostycznego. Czeka, aż dziecko skończy wszystkie
 * cztery sprawdziany (stan `isDone` z powłoki lekcji), dopiero potem liczy
 * i pokazuje wynik — dzięki temu działa niezależnie od kolejności przewijania.
 *
 * `total` każdej domeny bierze się z jej wyniku, a nie ze stałej: blok myszy
 * i klawiatury raportuje 1 zamiast 4, gdy dziecko pracuje na tablecie i pomija
 * zadania z myszą. Procent i tak się zgadza.
 *
 * Odpowiednik `ResultSummary` z matematyki — świadomie osobny plik, bo tamten
 * chodzi po ikonach z `ModuleIcon` (mapa nazw), a bloki informatyki noszą
 * komponenty lucide wprost. Jeśli test końcowy modułu 9 będzie potrzebował
 * tego samego, to jest moment na promocję do `src/components/ui/`.
 */

export interface DiagnosticDomain {
  /** Musi być identyfikatorem bloku lekcji — po nim sprawdzamy `isDone`. */
  id: string;
  label: string;
  icon: LucideIcon;
  /** Dokąd odesłać, gdy domena wypadła słabo. */
  href: string;
  hrefLabel: string;
}

interface DiagnosticResultProps {
  domains: DiagnosticDomain[];
  scores: Partial<Record<string, DrillScore>>;
  color: string;
  onComplete?: () => void;
}

export function DiagnosticResult({ domains, scores, color, onComplete }: DiagnosticResultProps) {
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
          {remaining.map((domain) => {
            const Icon = domain.icon;
            return (
              <a
                key={domain.id}
                href={`#${domain.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {domain.label}
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  const totalScore = domains.reduce((sum, d) => sum + (scores[d.id]?.score ?? 0), 0);
  const totalMax = domains.reduce((sum, d) => sum + (scores[d.id]?.total ?? 0), 0);
  const percent = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  const weak = domains.filter((d) => {
    const result = scores[d.id];
    return result && result.total > 0 && result.score / result.total < 0.6;
  });

  const headline =
    percent >= 85 ? 'Solidne podstawy!' : percent >= 55 ? 'Dobry start!' : 'Dokładnie po to jest ten test';
  const summary =
    percent >= 85
      ? 'Komputer nie jest dla ciebie zagadką. W module 1 pójdzie z górki — traktuj go jak porządkowanie tego, co już umiesz.'
      : percent >= 55
        ? 'Większość rzeczy masz opanowaną, kilka warto sobie poukładać. Zaznaczone niżej tematy zrób szczególnie uważnie.'
        : 'Nic straconego — i nic dziwnego. Tego wszystkiego uczy dopiero ten kurs, a test był po to, żeby wiedzieć, na co zwrócić uwagę.';

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
          const Icon = domain.icon;
          const result = scores[domain.id];
          const domainPercent =
            result && result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
          const isWeak = weak.includes(domain);
          return (
            <li key={domain.id} className="border p-4">
              <div className="mb-2 flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">
                  {domain.label}
                </span>
                <span className="shrink-0 text-sm font-bold tabular-nums">
                  {result?.score ?? 0}/{result?.total ?? 0}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden bg-muted">
                <div
                  className="h-full"
                  style={{ width: `${domainPercent}%`, backgroundColor: isWeak ? '#f59e0b' : color }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {weak.length > 0 ? (
        <div className="border-t-2 p-4" style={{ borderColor: color, backgroundColor: `${color}0c` }}>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <CircleAlert className="h-4 w-4" style={{ color }} aria-hidden />
            Na te tematy zwróć szczególną uwagę:
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {weak.map((domain) => (
              <Link
                key={domain.id}
                href={domain.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-transform hover:translate-x-0.5"
                style={{ color }}
              >
                {domain.hrefLabel}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 border-t-2 border-emerald-500 bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          <PartyPopper className="h-5 w-5 shrink-0" aria-hidden />
          <p>Żadna część nie wypadła słabo. Możesz śmiało ruszać do modułu 1.</p>
        </div>
      )}
    </div>
  );
}
