'use client';

import { buildPieSlices, pieceFill, pieceStroke } from '../lib/fraction';
import { round } from '../lib/lines';

interface FractionPieProps {
  color: string;
  mianownik: number;
  /** Indeksy zamalowanych wycinków. */
  filled: Set<number>;
  onToggleSlice?: (index: number) => void;
  ariaLabel: string;
}

const RADIUS = 92;
/** Zapas na obrys — bez niego `viewBox` obcinałby kreskę biegnącą po krawędzi koła. */
const PADDING = 8;
/**
 * Bok `viewBox` liczony z promienia, nie z pozycji środka. Wcześniej stało tu
 * `(CENTER.x + RADIUS) * 2`, czyli 384 przy kole o średnicy 184 — koło zajmowało
 * niecałą ćwiartkę swojego pudełka i siedziało w jego lewym górnym rogu. Stąd
 * „znowu małe koło" w każdym miejscu, gdzie rysunek dostawał `max-w-*`: żeby
 * urosło, trzeba było zamawiać ponad dwa razy większy kontener niż potrzebny.
 * Przy tej proporcji (92/200) koło i luźny kawałek `SliceWedge` (46/100) mają
 * już dokładnie tę samą skalę w kontenerach tej samej szerokości.
 */
const VIEW_SIZE = round((RADIUS + PADDING) * 2);
const CENTER = { x: VIEW_SIZE / 2, y: VIEW_SIZE / 2 };

/**
 * Koło podzielone na `mianownik` równych wycinków (geometria z
 * `buildPieSlices`, ten sam wzorzec „jedna funkcja karmi rysunek" co
 * `CircleFigure`). Kliknięcie wycinka (gdy podano `onToggleSlice`) zamalowuje
 * go, budując `licznik` na żywo — pierwszy w kursie mechanizm, w którym
 * liczba w stanie Reacta powstaje wprost z klikania kształtów, a nie z
 * osobnego licznika czy pola do wpisania.
 *
 * Pierwotnie `guides/slownik-ulamkow/`, wypromowany do współdzielonych
 * 2026-08-26 po drugim konsumencie (`lessons/liczby-mieszane` — pudełka
 * `WholePackBoard` domykające się w całości) — ten sam precedens co
 * `FractionNotation`/`FractionBarGlyph`.
 */
export function FractionPie({ color, mianownik, filled, onToggleSlice, ariaLabel }: FractionPieProps) {
  const slices = buildPieSlices(CENTER, RADIUS, mianownik);
  const interactive = Boolean(onToggleSlice);

  return (
    <svg
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      className="mx-auto h-auto w-full"
      role="img"
      aria-label={ariaLabel}
    >
      {slices.map((slice, i) => {
        const isFilled = filled.has(i);
        return (
          <path
            key={i}
            d={slice.path}
            fill={pieceFill(color, isFilled)}
            stroke={pieceStroke(color, isFilled)}
            strokeWidth={2}
            strokeLinejoin="round"
            style={{ cursor: interactive ? 'pointer' : 'default', transition: 'fill 0.15s ease, stroke 0.15s ease' }}
            onClick={interactive ? () => onToggleSlice?.(i) : undefined}
          />
        );
      })}
    </svg>
  );
}
