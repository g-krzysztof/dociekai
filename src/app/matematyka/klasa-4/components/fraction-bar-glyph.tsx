'use client';

import { pieceFill, pieceStroke } from '../lib/fraction';
import { round } from '../lib/lines';

interface FractionBarGlyphProps {
  color: string;
  mianownik: number;
  /** Indeksy zamalowanych odcinków. */
  filled: Set<number>;
  onToggleSegment?: (index: number) => void;
  ariaLabel: string;
}

export const BAR_WIDTH = 320;
export const BAR_HEIGHT = 58;

/**
 * Obrys rysuje się NA krawędzi prostokąta, więc bez wcięcia o pół grubości
 * `viewBox` obcinał zewnętrzną ramkę paska do połowy — górna i dolna krawędź
 * wychodziły cieńsze niż wewnętrzne i pasek czytał się jak fragment kraty,
 * a nie jak zamknięty przedmiot.
 */
const STROKE = 2;
const INSET = STROKE / 2;
const TRACK_WIDTH = BAR_WIDTH - STROKE;
const TRACK_HEIGHT = BAR_HEIGHT - STROKE;

/**
 * Przerwa między kawałkami zależy od gęstości podziału. Przy stałej przerwie
 * albo kawałki zlewały się w jeden prostokąt (mało części), albo przerwy
 * zjadały same kawałki (24 części w `SplitFoldBoard`).
 */
export function barGap(mianownik: number): number {
  if (mianownik <= 6) return 7;
  if (mianownik <= 10) return 5;
  if (mianownik <= 16) return 4;
  return 3;
}

/**
 * Szerokość jednego odcinka paska w jednostkach `viewBox` — jedna funkcja
 * karmi i rysunek, i wszystko, co musi się z nim wyrównać (patrz
 * `filledEdgeRatio`).
 */
export function segmentWidth(mianownik: number): number {
  return round((TRACK_WIDTH - barGap(mianownik) * (mianownik - 1)) / mianownik);
}

/**
 * Promień narożnika liczony z rozmiaru kawałka, nigdy stały: przy stałym `rx`
 * ten sam narożnik był ledwie ścięty na szerokim kawałku (1/2) i przesadnie
 * okrągły na wąskim (1/12) — to stąd brało się wrażenie kanciastych klocków.
 * Ułamek krótszego boku daje każdemu kawałkowi to samo optyczne zaokrąglenie,
 * a `segW / 3` pilnuje, żeby najwęższe nie zamieniły się w pigułki.
 */
function cornerRadius(segW: number): number {
  const soft = Math.min(segW, TRACK_HEIGHT) * 0.24;
  return round(Math.min(12, Math.max(3, soft), segW / 3));
}

/**
 * Ułamek szerokości paska, na którym kończy się zamalowana część — potrzebny
 * każdemu nakładanemu na pasek elementowi (linia porównania w `FractionDuel`,
 * uchwyt w `FractionStepTrack`). Nie jest to po prostu `licznik / mianownik`:
 * przerwy między odcinkami i wcięcie na obrys przesuwają krawędź, więc liczy
 * się ją z tej samej geometrii co same odcinki, zamiast przybliżać proporcją.
 */
export function filledEdgeRatio(licznik: number, mianownik: number): number {
  if (licznik <= 0) return 0;
  const seg = segmentWidth(mianownik);
  // Wcięcie z lewej + kawałki + przerwy między nimi + pół obrysu z prawej.
  return round((licznik * seg + barGap(mianownik) * (licznik - 1) + STROKE) / BAR_WIDTH);
}

/**
 * Pasek podzielony na `mianownik` równych odcinków — ten sam wzorzec „jedna
 * funkcja/kształt karmi widżet i statyczne przykłady" co `FractionPie`
 * (opcjonalny `onToggleSegment` włącza interaktywność), tylko wzdłuż jednej
 * osi zamiast po okręgu. Reużywany zarówno jako klikalny kształt we
 * `FractionBar`, jak i jako statyczna ilustracja w rozgrzewce/ćwiczeniach.
 *
 * Pierwotnie `lessons/ulamek-jako-czesc-calosci/`, wypromowany do
 * współdzielonych 2026-08-26 po drugim konsumencie
 * (`lessons/porownywanie-ulamkow`) — ten sam precedens co `FractionNotation`.
 */
export function FractionBarGlyph({ color, mianownik, filled, onToggleSegment, ariaLabel }: FractionBarGlyphProps) {
  const interactive = Boolean(onToggleSegment);
  const gap = barGap(mianownik);
  const segW = segmentWidth(mianownik);
  const rx = cornerRadius(segW);

  return (
    <svg
      viewBox={`0 0 ${BAR_WIDTH} ${BAR_HEIGHT}`}
      className="mx-auto h-auto w-full"
      role="img"
      aria-label={ariaLabel}
    >
      {Array.from({ length: mianownik }, (_, i) => {
        const isFilled = filled.has(i);
        return (
          <rect
            key={i}
            x={round(INSET + i * (segW + gap))}
            y={INSET}
            width={segW}
            height={TRACK_HEIGHT}
            rx={rx}
            fill={pieceFill(color, isFilled)}
            stroke={pieceStroke(color, isFilled)}
            strokeWidth={STROKE}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              transition: 'fill 0.15s ease, stroke 0.15s ease',
            }}
            onClick={interactive ? () => onToggleSegment?.(i) : undefined}
          />
        );
      })}
    </svg>
  );
}
