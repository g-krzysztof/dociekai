'use client';

import type { ColumnPlace } from '../../../lib/column-algorithm';

const PLACE_SHORT: Record<ColumnPlace, string> = {
  tysiące: 'tys.',
  setki: 'set.',
  dziesiątki: 'dzies.',
  jedności: 'jedn.',
};

export interface LongMultiplicationRow {
  /** Cyfry iloczynu cząstkowego, już przesunięte o właściwą liczbę kolumn (index 0 = jedności). */
  digits: (number | null)[];
  /** Wiersz jeszcze nieodsłonięty — zarezerwuj miejsce, ale nie pokazuj cyfr (bez tego wiersze „wskakują” i przesuwają resztę treści). */
  revealed?: boolean;
  /** Etykieta z boku wiersza, np. „27 × 4" — widoczna tylko gdy `revealed`. */
  label?: string;
  /** Przygaszony wiersz — używane w opcjach do porównania (np. błędny, nieprzesunięty zapis). */
  muted?: boolean;
  highlight?: boolean;
}

interface LongMultiplicationGridProps {
  color: string;
  /** Liczba kolumn miejsc dziesiętnych (domyślnie 4 — jedności…tysiące, tak jak reszta modułu). */
  width?: number;
  topDigits: (number | null)[];
  multiplierDigits: (number | null)[];
  /** Podświetla jedną kolumnę w wierszu mnożnika — którą cyfrę mnożnika akurat omawiamy. */
  highlightMultiplierPlace?: ColumnPlace | null;
  rows: LongMultiplicationRow[];
  sumDigits?: (number | null)[] | null;
  showPlaceLabels?: boolean;
  ariaLabel: string;
  className?: string;
}

const PLACE_LABELS_WIDE: ColumnPlace[] = ['jedności', 'dziesiątki', 'setki', 'tysiące'];

/**
 * Wielowierszowa siatka kolumn dla mnożenia pisemnego przez liczbę
 * wielocyfrową: mnożna, mnożnik, jeden wiersz na każdy niezerowy iloczyn
 * cząstkowy (już przesunięty w prawym-do-lewego układzie kolumn), i wiersz
 * sumy końcowej. To, czego `<ColumnGrid>` nie obsługuje — tamten prymityw
 * zakłada dokładnie dwa wiersze działania plus jeden wynik, tu liczba
 * wierszy zależy od liczby cyfr mnożnika. Ta sama dyscyplina CSS-gridu
 * (`display: contents` na wierszach, żeby cyfry trzymały się jednych torów)
 * i te same tokeny wizualne (font-mono, te same wysokości komórek), żeby
 * obie siatki wyglądały jak część jednego systemu.
 */
export function LongMultiplicationGrid({
  color,
  width = 4,
  topDigits,
  multiplierDigits,
  highlightMultiplierPlace = null,
  rows,
  sumDigits = null,
  showPlaceLabels = false,
  ariaLabel,
  className,
}: LongMultiplicationGridProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const places = PLACE_LABELS_WIDE.slice(0, width);
  const lastRowIndex = rows.length - 1;

  return (
    <div className={className}>
      <div
        role="group"
        aria-label={ariaLabel}
        className="inline-grid font-mono text-2xl font-black tabular-nums sm:text-3xl"
        style={{ gridTemplateColumns: `1.75rem repeat(${width}, minmax(2.25rem, 1fr))` }}
      >
        {showPlaceLabels && (
          <div className="contents" aria-hidden>
            <span />
            {Array.from({ length: width }, (_, pos) => {
              const i = width - 1 - pos;
              return (
                <span
                  key={`label-${i}`}
                  className="pb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {PLACE_SHORT[places[i]]}
                </span>
              );
            })}
          </div>
        )}

        {/* Mnożna */}
        <div className="contents">
          <span />
          {Array.from({ length: width }, (_, pos) => {
            const i = width - 1 - pos;
            return (
              <span key={`top-${i}`} className="flex h-11 items-center justify-center sm:h-12">
                {topDigits[i] ?? ''}
              </span>
            );
          })}
        </div>

        {/* Mnożnik, z „×" w rynience i kreską-dzielnikiem pod spodem */}
        <div className="contents">
          <span className="flex items-center justify-center text-xl" style={{ color }} aria-hidden>
            ×
          </span>
          {Array.from({ length: width }, (_, pos) => {
            const i = width - 1 - pos;
            const place = PLACE_LABELS_WIDE[i];
            return (
              <span
                key={`mult-${i}`}
                className="flex h-11 items-center justify-center border-b-2 transition-colors sm:h-12"
                style={{
                  borderColor: color,
                  backgroundColor: highlightMultiplierPlace === place ? `${color}1f` : undefined,
                }}
              >
                {multiplierDigits[i] ?? ''}
              </span>
            );
          })}
        </div>

        {/* Iloczyny cząstkowe */}
        {rows.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="contents">
            <span
              className="flex items-center justify-center text-xl"
              style={{ color: rowIndex === lastRowIndex && sumDigits ? color : 'transparent' }}
              aria-hidden
            >
              {rowIndex === lastRowIndex && sumDigits ? '+' : ''}
            </span>
            {Array.from({ length: width }, (_, pos) => {
              const i = width - 1 - pos;
              const value = row.revealed === false ? null : row.digits[i];
              return (
                <span
                  key={`row-${rowIndex}-${i}`}
                  className="flex h-11 items-center justify-center transition-colors sm:h-12"
                  style={{
                    backgroundColor: row.highlight ? `${color}1f` : undefined,
                    color: row.muted ? undefined : textColor,
                    opacity: row.muted ? 0.45 : 1,
                  }}
                >
                  {value ?? ''}
                </span>
              );
            })}
          </div>
        ))}

        {/* Suma końcowa */}
        {sumDigits && (
          <div className="contents">
            <span />
            {Array.from({ length: width }, (_, pos) => {
              const i = width - 1 - pos;
              return (
                <span
                  key={`sum-${i}`}
                  className="flex h-11 items-center justify-center border-t-2 font-black sm:h-12"
                  style={{ borderColor: color, color }}
                >
                  {sumDigits[i] ?? ''}
                </span>
              );
            })}
          </div>
        )}
      </div>
      <p className="sr-only">{ariaLabel}</p>
    </div>
  );
}
