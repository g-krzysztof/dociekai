'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import type { PlotAtlas, PlotBrick } from '../lib/atlas-shape';

/** Ile lekcji działu jest zrobione, licząc lekcje w toku ułamkiem ekranów. */
function columnFill(bricks: PlotBrick[]): number {
  if (bricks.length === 0) return 0;
  const sum = bricks.reduce((acc, brick) => {
    if (brick.status === 'done') return acc + 1;
    if (brick.status === 'in-progress') return acc + (brick.total > 0 ? brick.done / brick.total : 0.4);
    return acc;
  }, 0);
  return sum / bricks.length;
}

/**
 * Wykres roku złożony do jednej linii: odcinek na dział, szerokość według
 * liczby lekcji, wypełnienie według zrobionych. Ten sam porządek i te same
 * kolory co słupki w rozwinięciu, więc skrót i scena czytają się jednakowo.
 */
export function ModuleBar({
  atlas,
  basePath,
  ready,
  activeSlug,
  onActive,
}: {
  atlas: PlotAtlas;
  basePath: string;
  ready: boolean;
  activeSlug: string | null;
  onActive: (slug: string | null) => void;
}) {
  const live = atlas.columns.filter((column) => !column.planned);
  const planned = atlas.columns.filter((column) => column.planned);

  return (
    <div className="flex items-center gap-[3px]">
      {live.map((column) => {
        const { module: mod } = column;
        const fill = ready ? columnFill(column.bricks) : 0;
        const dimmed = Boolean(activeSlug) && activeSlug !== mod.slug;

        return (
          <Link
            key={mod.slug}
            href={`${basePath}/${mod.slug}`}
            className={cn('group block py-2 transition-opacity duration-300', dimmed && 'opacity-40')}
            style={{ flexGrow: Math.max(1, column.bricks.length), flexBasis: 0 }}
            aria-label={`Dział ${mod.number}: ${mod.title} — ${column.doneLessons} z ${column.totalLessons} lekcji zrobionych`}
            onMouseEnter={() => onActive(mod.slug)}
            onMouseLeave={() => onActive(null)}
            onFocus={() => onActive(mod.slug)}
            onBlur={() => onActive(null)}
          >
            <span
              className="relative block h-2.5 overflow-hidden transition-[height] duration-200 group-hover:h-3.5"
              style={{
                backgroundColor: `color-mix(in oklch, ${mod.color} 14%, transparent)`,
                boxShadow: fill === 0 ? `inset 0 0 0 1px color-mix(in oklch, ${mod.color} 34%, transparent)` : undefined,
              }}
            >
              {fill > 0 && (
                <span
                  className="profil-bar__fill absolute inset-y-0 left-0 block"
                  style={{ width: `${Math.max(6, fill * 100)}%`, backgroundColor: mod.color }}
                />
              )}
            </span>
          </Link>
        );
      })}

      {planned.length > 0 && (
        <span
          className="flex shrink-0 items-center gap-1 pl-1 text-[var(--ink-faint)]"
          title={`W przygotowaniu: ${planned.map((column) => column.module.title).join(', ')}`}
        >
          <span className="block h-2.5 w-5 border border-dashed border-[var(--rule)]" aria-hidden />
          <Lock className="h-3 w-3" aria-hidden />
          <span className="sr-only">
            {planned.length} {plural(planned.length, { one: 'dział', few: 'działy', many: 'działów' })} w
            przygotowaniu
          </span>
        </span>
      )}
    </div>
  );
}
