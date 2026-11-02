'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { NextStepModel, PlotAtlas } from '../lib/atlas-shape';
import { DisclosurePanel, DisclosureToggle } from './disclosure';
import { ModuleBar } from './module-bar';

interface CourseRowProps {
  id: string;
  name: string;
  basePath: string;
  atlas: PlotAtlas;
  step?: NextStepModel;
  ready: boolean;
  activeSlug: string | null;
  onActive: (slug: string | null) => void;
  open: boolean;
  onToggle: () => void;
  /** Scena kursu: wykres roku, następny krok, rejestr liczb, link do programu. */
  children: React.ReactNode;
}

/**
 * Kurs na pulpicie: jeden wiersz rejestru zamiast całego arkusza. Procent,
 * skrót wykresu roku i następna lekcja mieszczą się w ~64 px; reszta czeka pod
 * „Szczegółami”.
 */
export function CourseRow({
  id,
  name,
  basePath,
  atlas,
  step,
  ready,
  activeSlug,
  onActive,
  open,
  onToggle,
  children,
}: CourseRowProps) {
  const { stats } = atlas;
  const panelId = `${id}-szczegoly`;

  return (
    <li id={id} className="scroll-mt-24 border-t border-[var(--rule-faint)] first:border-t-0">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 gap-y-1.5 py-4 [grid-template-areas:'name_pct_btn''bar_bar_bar''meta_meta_meta'] sm:grid-cols-[9.5rem_4.25rem_minmax(0,1fr)_auto] sm:gap-x-5 sm:gap-y-1 sm:py-5 sm:[grid-template-areas:'name_pct_bar_btn''name_pct_meta_btn']">
        <div className="min-w-0 [grid-area:name]">
          <h3 className="text-lg font-extrabold leading-tight tracking-[-0.02em]">{name}</h3>
          <p className="profil-micro mt-1">klasa 4</p>
        </div>

        <p className="profil-num text-right text-2xl leading-none text-[var(--ink)] [grid-area:pct] sm:text-left sm:text-[1.75rem]">
          {ready ? stats.percent : '—'}
          <span className="text-sm text-[var(--ink-soft)]">%</span>
        </p>

        <div className="min-w-0 [grid-area:bar]">
          <ModuleBar
            atlas={atlas}
            basePath={basePath}
            ready={ready}
            activeSlug={activeSlug}
            onActive={onActive}
          />
        </div>

        <p className="min-w-0 truncate text-sm text-[var(--ink-soft)] [grid-area:meta]">
          <span className="profil-num text-[13px] text-[var(--ink)]">
            {ready ? stats.doneLessons : 0}/{stats.totalLessons}
          </span>{' '}
          lekcji
          {ready && (
            <>
              <span aria-hidden> · </span>
              {step ? (
                <Link
                  href={step.href}
                  className="group/next font-semibold text-[var(--ink)] underline decoration-[var(--rule)] decoration-1 underline-offset-4 hover:decoration-[var(--ink)]"
                >
                  {step.inProgress ? 'Wróć do: ' : 'Dalej: '}
                  {step.short}
                  <ArrowRight
                    className="ml-1 inline h-3.5 w-3.5 align-[-2px] transition-transform group-hover/next:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              ) : (
                <span className="text-[var(--ink)]">cały materiał zrobiony</span>
              )}
            </>
          )}
        </p>

        <DisclosureToggle
          open={open}
          onToggle={onToggle}
          controls={panelId}
          className="justify-self-end [grid-area:btn]"
        >
          Szczegóły<span className="sr-only">: {name}</span>
        </DisclosureToggle>
      </div>

      <DisclosurePanel id={panelId} open={open} className="pb-8 pt-2">
        {children}
      </DisclosurePanel>
    </li>
  );
}
