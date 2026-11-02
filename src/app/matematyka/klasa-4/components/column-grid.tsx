'use client';

import type { ColumnPlace } from '../lib/column-algorithm';

const PLACE_SHORT: Record<ColumnPlace, string> = {
  tysiące: 'tys.',
  setki: 'set.',
  dziesiątki: 'dzies.',
  jedności: 'jedn.',
};

export interface ColumnCellData {
  place: ColumnPlace;
  /** Cyfra górnej liczby. `null` = puste pole (liczba jest krótsza w tym miejscu). */
  top: number | null;
  bottom: number | null;
  /** Cyfra wyniku — `undefined`/`null` renderuje puste pole (jeszcze nieodsłonięte). */
  result?: number | null;
  /** Mała cyfra przeniesienia nad kolumną (dodawanie). */
  carry?: number | null;
  /** Ta kolumna oddała dziesiątkę sąsiadowi po prawej — pokaż przekreśloną cyfrę `from` i małą `to`. */
  crossedOut?: { from: number; to: number } | null;
  /** Ta kolumna pożyczyła dziesiątkę z sąsiada po lewej — dopisz małą „1" przed cyfrą `top`. */
  borrowedTen?: boolean;
  /** Aktualnie omawiana kolumna — podświetlenie tła. */
  highlight?: boolean;
}

interface ColumnGridProps {
  color: string;
  operator: '+' | '−' | '×';
  cells: ColumnCellData[];
  showPlaceLabels?: boolean;
  /** Zarezerwuj miejsce na wiersz przeniesienia/pożyczki, nawet gdy chwilowo pusty — bez tego wiersz „wskakuje" po pierwszym kliknięciu i przesuwa resztę treści. */
  reserveAnnotationRow?: boolean;
  ariaLabel: string;
  className?: string;
}

/**
 * Siatka kolumn miejsc dziesiętnych — wspólny prymityw dla przewodnika o
 * zapisie pisemnym (`guides/zapis-pisemny/`) i lekcji o dodawaniu/odejmowaniu
 * pisemnym: statyczne porównanie ustawienia liczb (bez `carry`/`crossedOut`)
 * i sterowane klikiem odsłanianie przeniesienia/pożyczania (te same pola,
 * tylko wypełniane krok po kroku przez wywołujący komponent). Kolumny
 * współdzielą siatkę CSS przez `display: contents` na wierszach, żeby cyfry
 * we wszystkich rzędach trzymały się dokładnie tych samych torów.
 *
 * Promowany z `guides/zapis-pisemny/column-grid.tsx` do współdzielonego
 * `components/` 2026-08-17, gdy lekcja `dodawanie-pisemne` stała się drugim
 * konsumentem — ten sam precedens co `<FactTriangle>`/`<NumberLine>`.
 */
export function ColumnGrid({
  color,
  operator,
  cells,
  showPlaceLabels = false,
  reserveAnnotationRow = false,
  ariaLabel,
  className,
}: ColumnGridProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const hasCarryRow = reserveAnnotationRow || cells.some((cell) => cell.carry != null || cell.crossedOut);
  const hasResultRow = cells.some((cell) => cell.result !== undefined);

  const summary = cells
    .map((cell) => {
      const parts = [`${cell.place}: ${cell.top ?? '—'} ${operator} ${cell.bottom ?? '—'}`];
      if (cell.result != null) parts.push(`wynik ${cell.result}`);
      return parts.join(', ');
    })
    .join('; ');

  return (
    <div className={className}>
      <div
        role="group"
        aria-label={ariaLabel}
        className="inline-grid font-mono text-2xl font-black tabular-nums sm:text-3xl"
        style={{ gridTemplateColumns: `1.75rem repeat(${cells.length}, minmax(2.25rem, 1fr))` }}
      >
        {showPlaceLabels && (
          <div className="contents" aria-hidden>
            <span />
            {cells.map((cell, i) => (
              <span
                key={`label-${i}`}
                className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {PLACE_SHORT[cell.place]}
              </span>
            ))}
          </div>
        )}

        {hasCarryRow && (
          <div className="contents" aria-hidden>
            <span />
            {cells.map((cell, i) => (
              <span key={`carry-${i}`} className="relative flex h-6 items-end justify-center">
                {cell.carry != null && (
                  <span className="text-sm font-black leading-none" style={{ color }}>
                    {cell.carry}
                  </span>
                )}
                {cell.crossedOut && (
                  <span className="relative inline-flex items-baseline text-sm font-black leading-none">
                    <span
                      className="relative text-muted-foreground line-through decoration-2"
                      style={{ textDecorationColor: color }}
                    >
                      {cell.crossedOut.from}
                    </span>
                    <span className="ml-0.5" style={{ color }}>
                      {cell.crossedOut.to}
                    </span>
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        <div className="contents">
          <span />
          {cells.map((cell, i) => (
            <span
              key={`top-${i}`}
              className="flex h-11 items-center justify-center transition-colors sm:h-12"
              style={{ backgroundColor: cell.highlight ? `${color}1f` : undefined }}
            >
              {cell.borrowedTen && (
                <sup className="mr-0.5 -translate-y-1 text-xs font-black" style={{ color }}>
                  1
                </sup>
              )}
              {cell.top ?? ''}
            </span>
          ))}
        </div>

        <div className="contents">
          <span className="flex items-center justify-center text-xl" style={{ color }} aria-hidden>
            {operator}
          </span>
          {cells.map((cell, i) => (
            <span
              key={`bottom-${i}`}
              className="flex h-11 items-center justify-center border-b-2 transition-colors sm:h-12"
              style={{
                borderColor: color,
                backgroundColor: cell.highlight ? `${color}1f` : undefined,
              }}
            >
              {cell.bottom ?? ''}
            </span>
          ))}
        </div>

        {hasResultRow && (
          <div className="contents">
            <span />
            {cells.map((cell, i) => (
              <span
                key={`result-${i}`}
                className="flex h-11 items-center justify-center sm:h-12"
                style={{ color: cell.result != null ? textColor : undefined }}
              >
                {cell.result ?? ''}
              </span>
            ))}
          </div>
        )}
      </div>
      <p className="sr-only">{summary}</p>
    </div>
  );
}
