'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlotAtlas, PlotBrick, PlotColumn, PlotModule } from '../lib/atlas-shape';

interface YearPlotProps {
  /** Nagłówek arkusza, np. „Rok matematyki, klasa 4”; w rozwinięciu wiersza kursu zbędny. */
  title?: string;
  /** Korzeń kursu, np. `/matematyka/klasa-4` — z niego powstają linki działów. */
  basePath: string;
  atlas: PlotAtlas;
  ready: boolean;
  activeSlug: string | null;
  onActive: (slug: string | null) => void;
}

/** Ile cegły jest zatuszowane, gdy lekcja jest w toku. */
function brickFill(brick: PlotBrick): number {
  if (brick.status === 'done') return 1;
  if (brick.status !== 'in-progress') return 0;
  return brick.total > 0 ? Math.max(0.18, brick.done / brick.total) : 0.4;
}

function Brick({ brick, color }: { brick: PlotBrick; color: string }) {
  const fill = brickFill(brick);

  return (
    <span
      className="relative block flex-1 overflow-hidden"
      style={{
        backgroundColor: `color-mix(in oklch, ${color} ${brick.status === 'not-started' ? 10 : 16}%, transparent)`,
        boxShadow:
          brick.status === 'not-started'
            ? `inset 0 0 0 1px color-mix(in oklch, ${color} 38%, transparent)`
            : undefined,
      }}
    >
      {fill > 0 && (
        <span
          className="absolute inset-y-0 left-0 block"
          style={{ width: `${fill * 100}%`, backgroundColor: color }}
        />
      )}
    </span>
  );
}

/**
 * Wspólna skorupa slotu: słupek działu i kikut zapowiedzi mają tę samą
 * szerokość i to samo zachowanie na hover — podświetlenie tła na pełną wysokość
 * wykresu plus przygaszenie sąsiadów.
 */
function Slot({
  color,
  active,
  dimmed,
  label,
  children,
}: {
  color: string;
  active: boolean;
  dimmed: boolean;
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <span className="relative flex w-full flex-col justify-end" style={{ height: 'var(--plot-h)' }}>
        <span
          className="pointer-events-none absolute inset-y-0 -inset-x-px block transition-opacity duration-300"
          style={{
            opacity: active ? 1 : 0,
            backgroundImage: `linear-gradient(to top, color-mix(in oklch, ${color} 22%, transparent), color-mix(in oklch, ${color} 5%, transparent) 62%, transparent)`,
          }}
          aria-hidden
        />
        <span
          className={cn(
            'relative flex w-full flex-col justify-end transition-opacity duration-300',
            dimmed && 'opacity-40'
          )}
          style={{ height: '100%' }}
        >
          {children}
        </span>
      </span>

      <span
        className={cn(
          'mt-2.5 flex items-center justify-center gap-1 transition-opacity duration-300',
          dimmed && 'opacity-40'
        )}
      >
        {label}
      </span>
    </>
  );
}

function Column({
  column,
  basePath,
  tallest,
  index,
  ready,
  active,
  dimmed,
  onActive,
}: {
  column: PlotColumn;
  basePath: string;
  tallest: number;
  index: number;
  ready: boolean;
  active: boolean;
  dimmed: boolean;
  onActive: (slug: string | null) => void;
}) {
  const { module: mod, bricks } = column;
  const heightPercent = Math.max(6, (bricks.length / tallest) * 100);

  return (
    <Link
      href={`${basePath}/${mod.slug}`}
      className="flex min-w-0 flex-1 flex-col"
      aria-label={`Dział ${mod.number}: ${mod.title} — ${column.doneLessons} z ${column.totalLessons} lekcji zrobionych`}
      onMouseEnter={() => onActive(mod.slug)}
      onMouseLeave={() => onActive(null)}
      onFocus={() => onActive(mod.slug)}
      onBlur={() => onActive(null)}
    >
      <Slot
        color={mod.color}
        active={active}
        dimmed={dimmed}
        label={
          <span
            className="profil-num profil-modtext text-sm sm:text-base"
            style={{ '--mod': mod.color } as React.CSSProperties}
          >
            {mod.number}
          </span>
        }
      >
        <span
          className="profil-plot__col flex w-full flex-col-reverse gap-[3px]"
          style={{
            height: `${heightPercent}%`,
            animationDelay: `${140 + index * 55}ms`,
            animationPlayState: ready ? 'running' : 'paused',
          }}
        >
          {bricks.map((brick) => (
            <Brick key={brick.lesson.slug} brick={brick} color={mod.color} />
          ))}
        </span>
      </Slot>
    </Link>
  );
}

/** Działy bez ani jednej lekcji nie zajmują po słupku — wchodzą w jeden kikut. */
function PlannedSlot({
  modules,
  active,
  dimmed,
  onHover,
}: {
  modules: PlotModule[];
  active: boolean;
  dimmed: boolean;
  onHover: (hovered: boolean) => void;
}) {
  const first = modules[0];
  const last = modules[modules.length - 1];

  return (
    <span
      className="flex min-w-0 flex-1 flex-col"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <Slot
        color={first.color}
        active={active}
        dimmed={dimmed}
        label={
          <>
            <span className="profil-num profil-ghostnum text-sm sm:text-base">
              {modules.length > 1 ? `${first.number}–${last.number}` : first.number}
            </span>
            <Lock
              className="hidden h-2.5 w-2.5 shrink-0 text-[var(--ink-faint)] sm:block"
              aria-hidden
            />
          </>
        }
      >
        <span
          className="block h-[9%] w-full border border-dashed"
          style={{ borderColor: `color-mix(in oklch, ${first.color} 34%, transparent)` }}
        />
      </Slot>
    </span>
  );
}

/**
 * Rok narysowany jako wykres: jeden słupek = jeden dział, jedna cegła = jedna
 * lekcja, wypełnienie cegły = ukończone ekrany tej lekcji. Przerywana linia to
 * poziom całego roku. Odczyt nad wykresem zmienia się na dział, na który
 * patrzysz — i to samo wskazanie przestawia poświatę całej strony.
 *
 * Odczyt ma na stałe zarezerwowane dwa wiersze i nie zawija: inaczej najechanie
 * na dział z dłuższym tytułem przesuwałoby cały wykres w dół.
 */
export function YearPlot({ title, basePath, atlas, ready, activeSlug, onActive }: YearPlotProps) {
  const { columns, stats, tallestColumn } = atlas;
  const [plannedHover, setPlannedHover] = useState(false);

  const live = columns.filter((column) => !column.planned);
  const planned = columns.filter((column) => column.planned).map((column) => column.module);
  const active = live.find((column) => column.module.slug === activeSlug);

  const readout: { lead: React.ReactNode; detail: React.ReactNode } = active
    ? {
        lead: (
          <>
            <span
              className="profil-modtext font-bold"
              style={{ '--mod': active.module.color } as React.CSSProperties}
            >
              Dział {active.module.number}
            </span>
            <span className="text-[var(--ink)]"> · {active.module.title}</span>
          </>
        ),
        detail: (
          <>
            <span className="text-[var(--ink)]">
              {active.doneLessons}/{active.totalLessons} lekcji
            </span>
            {' · '}
            {active.module.hours}
          </>
        ),
      }
    : plannedHover && planned.length > 0
      ? {
          lead: (
            <span className="text-[var(--ink)]">
              {planned.length === 1
                ? 'Dział w przygotowaniu'
                : `${planned.length} działy w przygotowaniu`}
            </span>
          ),
          detail: planned.map((mod) => mod.title).join(' · '),
        }
      : {
          lead: (
            <>
              Cały rok w jednym rysunku
              <span className="hidden sm:inline"> · wskaż dział</span>
            </>
          ),
          detail: (
            <>
              <span className="text-[var(--ink)]">
                {stats.doneLessons}/{stats.totalLessons} lekcji
              </span>
              {' · '}
              <span className="text-[var(--ink)]">
                {stats.doneModules}/{stats.totalModules} działów
              </span>
            </>
          ),
        };

  const anyHover = Boolean(activeSlug) || plannedHover;

  return (
    <div>
      {title && (
        <h2 className="mb-4 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">{title}</h2>
      )}

      {/* Stała wysokość = dokładnie dwa wiersze odczytu, bez zawijania. Procent
          roku stoi tutaj, a nie przy tytule: przy tytule zawijał się w węższym
          arkuszu i zsuwał cały wykres w dół względem sąsiada. */}
      <div className="h-[2.15rem] overflow-hidden">
        <div className="flex items-baseline gap-3">
          <p className="profil-micro min-w-0 flex-1 truncate text-[11px]">{readout.lead}</p>
          <p className="profil-num shrink-0 text-[11px] text-[var(--ink-soft)]">
            <span className="text-[var(--ink)]">{ready ? stats.percent : 0}%</span> roku
          </p>
        </div>
        <p className="profil-micro mt-1 truncate text-[11px]">{readout.detail}</p>
      </div>

      <div className="relative mt-5 [--plot-h:170px] sm:[--plot-h:230px] lg:[--plot-h:270px]">
        <div className="flex items-end gap-1 sm:gap-2">
          {live.map((column, index) => (
            <Column
              key={column.module.slug}
              column={column}
              basePath={basePath}
              tallest={tallestColumn}
              index={index}
              ready={ready}
              active={activeSlug === column.module.slug}
              dimmed={anyHover && activeSlug !== column.module.slug}
              onActive={onActive}
            />
          ))}

          {planned.length > 0 && (
            <PlannedSlot
              modules={planned}
              active={plannedHover}
              dimmed={Boolean(activeSlug)}
              onHover={setPlannedHover}
            />
          )}
        </div>

        {/* Oś: jedna ciągła linia pod wszystkimi słupkami. */}
        <span
          className="pointer-events-none absolute inset-x-0 block h-px bg-[var(--rule)]"
          style={{ top: 'var(--plot-h)' }}
          aria-hidden
        />

        {/* Poziom roku — przerywana kreska odniesienia z podpisem. */}
        {ready && stats.percent > 0 && (
          <span
            className="pointer-events-none absolute inset-x-0 top-0 block"
            style={{ height: 'var(--plot-h)' }}
            aria-hidden
          >
            <span
              className="profil-plot__level absolute inset-x-0 flex items-center gap-2"
              style={{ bottom: `${stats.percent}%` }}
            >
              <span className="h-px flex-1 border-t border-dashed border-[color-mix(in_oklch,var(--ink-faint)_50%,transparent)]" />
              <span className="profil-num bg-[var(--paper)] px-1 text-[10px] text-[var(--ink-soft)]">
                {stats.percent}%
              </span>
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
