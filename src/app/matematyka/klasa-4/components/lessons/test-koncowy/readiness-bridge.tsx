'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, CircleAlert, PartyPopper } from 'lucide-react';
import { ModuleIcon } from '@/components/ui/module-icon';
import { useLessonProgress } from '../../lesson-shell';
import type { MathLesson } from '../../../data/lessons';

/**
 * Nowość tej lekcji: wynik testu nie jest tylko procentem, tylko **mostem do
 * klasy 5**. Każdy filar sprawdzany w teście (lewa strona) pokazuje temat
 * klasy 5, który na nim stoi (prawa strona), a kolor mostu mówi, czy ten
 * filar jest gotowy. Słaby filar dostaje listę lekcji klasy 4 do dopięcia
 * przed wakacjami. Osobny komponent, bo to inna prezentacja niż
 * `ResultSummary`/`ModuleResultSummary` (tam siatka domen; tu para
 * „umiem teraz → do czego mi to za rok").
 */
export interface Bridge {
  /** Musi pokrywać się z `id` kroku (części testu). */
  id: string;
  /** Umiejętność z klasy 4 sprawdzana w tej części. */
  grade4: string;
  grade4Icon: string;
  /** Temat klasy 5, który na tej umiejętności stoi. */
  grade5: string;
  /** Lekcje klasy 4 do dopięcia, gdy część wypadnie słabo. */
  shoreUp: MathLesson[];
}

interface ReadinessBridgeProps {
  bridges: Bridge[];
  scores: Partial<Record<string, { score: number; total: number }>>;
  color: string;
  onComplete?: () => void;
}

type Band = 'ready' | 'almost' | 'gap';

function bandOf(ratio: number): Band {
  if (ratio >= 0.8) return 'ready';
  if (ratio >= 0.5) return 'almost';
  return 'gap';
}

const BAND_META: Record<Band, { label: string; dot: string; text: string }> = {
  ready: { label: 'gotowe', dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
  almost: { label: 'prawie', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' },
  gap: { label: 'do dopięcia', dot: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300' },
};

export function ReadinessBridge({ bridges, scores, color, onComplete }: ReadinessBridgeProps) {
  const { isDone } = useLessonProgress();
  const allDone = bridges.every((bridge) => isDone(bridge.id));

  useEffect(() => {
    if (allDone) onComplete?.();
  }, [allDone, onComplete]);

  if (!allDone) {
    const remaining = bridges.filter((bridge) => !isDone(bridge.id));
    return (
      <div className="border border-dashed bg-muted/30 p-6 text-center sm:p-8">
        <p className="mb-4 text-sm text-muted-foreground sm:text-base">
          Diagnoza pojawi się tutaj, gdy skończysz wszystkie cztery części testu powyżej.
        </p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {remaining.map((bridge) => (
            <a
              key={bridge.id}
              href={`#${bridge.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              <ModuleIcon name={bridge.grade4Icon} className="h-3.5 w-3.5" />
              {bridge.grade4}
            </a>
          ))}
        </div>
      </div>
    );
  }

  const totalScore = bridges.reduce((sum, b) => sum + (scores[b.id]?.score ?? 0), 0);
  const totalMax = bridges.reduce((sum, b) => sum + (scores[b.id]?.total ?? 0), 0);
  const percent = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  const weak = bridges.filter((b) => {
    const r = scores[b.id];
    return r && r.total > 0 && r.score / r.total < 0.6;
  });

  const headline =
    percent >= 85
      ? 'Gotowy/a na klasę 5!'
      : percent >= 60
        ? 'Prawie gotowy/a na klasę 5'
        : 'Jest co dopiąć przed klasą 5';

  const summary =
    percent >= 85
      ? 'Wszystkie cztery filary pod tematy klasy 5 masz mocne. Możesz spokojnie iść na wakacje.'
      : percent >= 60
        ? 'Większość podstaw pod klasę 5 masz opanowaną. Kilka rzeczy warto dopiąć — patrz niżej.'
        : 'Kilka podstaw wypadło słabiej. Zajrzyj do wskazanych lekcji, zanim zaczną się wakacje — potem trudniej wrócić.';

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

      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Co umiesz teraz → na czym to zbudujesz w klasie 5
      </p>
      <ul className="mb-6 space-y-2">
        {bridges.map((bridge) => {
          const r = scores[bridge.id];
          const ratio = r && r.total > 0 ? r.score / r.total : 0;
          const band = BAND_META[bandOf(ratio)];
          return (
            <li key={bridge.id} className="border">
              <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div className="flex items-start gap-2">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${band.dot}`} aria-hidden />
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-semibold leading-snug">
                      <ModuleIcon
                        name={bridge.grade4Icon}
                        className="h-4 w-4 shrink-0"
                        style={{ color }}
                      />
                      {bridge.grade4}
                    </span>
                    <span className={`text-xs font-bold ${band.text}`}>
                      {r?.score ?? 0}/{r?.total ?? 0} · {band.label}
                    </span>
                  </span>
                </div>

                <ArrowRight
                  className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block"
                  aria-hidden
                />
                <ArrowDown className="h-4 w-4 text-muted-foreground sm:hidden" aria-hidden />

                <span className="text-sm leading-snug text-muted-foreground">
                  <span className="font-semibold text-foreground">Klasa 5:</span> {bridge.grade5}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {weak.length > 0 ? (
        <div className="border-t-2 p-4" style={{ borderColor: color, backgroundColor: `${color}0c` }}>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <CircleAlert className="h-4 w-4" style={{ color }} aria-hidden />
            Zanim zaczną się wakacje, wróć do:
          </p>
          <div className="space-y-3">
            {weak.map((bridge) => (
              <div key={bridge.id}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {bridge.grade4}
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {bridge.shoreUp.map((lesson) => (
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
          <p>Żaden filar nie wypadł słabo — na klasę 5 jesteś przygotowany/a.</p>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Na czym dokładnie polega każdy z tych tematów klasy 5 — w ostatniej lekcji tego działu
        („Co dalej”).
      </p>
    </div>
  );
}
