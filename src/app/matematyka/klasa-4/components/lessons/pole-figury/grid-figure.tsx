'use client';

import type { ReactNode } from 'react';
import {
  cellKey,
  halfPath,
  outlineEdges,
  type GridCell,
  type HalfCell,
} from '../../../lib/area';

interface GridFigureProps {
  /** Rozmiar planszy w kratkach — nie rozmiar figury. Stały dla całej rundy. */
  width: number;
  height: number;
  /** Całe kratki należące do figury. */
  cells?: GridCell[];
  /** Połówki kratek (trójkąty) należące do figury. */
  halves?: HalfCell[];
  color: string;
  /** Bok kratki w pikselach `viewBox`. */
  unit?: number;
  /** Rysuj gruby obrys figury (domyślnie tak). */
  outline?: boolean;
  /** Rysuj linie kratownicy. `false` daje samą sylwetkę figury — bez miarki. */
  grid?: boolean;
  /** Przezroczystość wypełnienia całych kratek — `0` chowa je, zostawiając sam obrys. */
  fillOpacity?: number;
  /** Warstwa rysowana nad figurą, w tym samym układzie współrzędnych. */
  children?: ReactNode;
  className?: string;
  /** Tekst dla czytnika ekranu — SVG bez niego jest niemy. */
  title?: string;
}

/**
 * Kratownica z narysowaną na niej figurą — wspólny obraz dla wszystkich widżetów
 * i ilustracji tej lekcji (rozgrzewka, przykłady, wizualizacje w drillu).
 *
 * Wypełnienie i obrys liczone są z tego samego zbioru komórek (`outlineEdges`),
 * więc nie mogą się rozjechać: nie ma tu ani jednej współrzędnej wpisanej ręcznie.
 */
export function GridFigure({
  width,
  height,
  cells = [],
  halves = [],
  color,
  unit = 28,
  outline = true,
  grid = true,
  fillOpacity = 0.28,
  children,
  className,
  title,
}: GridFigureProps) {
  const edges = outline ? outlineEdges({ width, height, cells }) : [];

  return (
    <svg
      viewBox={`0 0 ${width * unit} ${height * unit}`}
      className={className}
      role="img"
      aria-label={title}
    >
      {/* Kratownica */}
      {grid && (
        <g stroke={`${color}33`} strokeWidth={1}>
          {Array.from({ length: width + 1 }, (_, i) => (
            <line key={`v${i}`} x1={i * unit} y1={0} x2={i * unit} y2={height * unit} />
          ))}
          {Array.from({ length: height + 1 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * unit} x2={width * unit} y2={i * unit} />
          ))}
        </g>
      )}

      {/* Wypełnienie całych kratek */}
      <g fill={color} fillOpacity={fillOpacity}>
        {cells.map((cell) => (
          <rect
            key={cellKey(cell)}
            x={cell.x * unit}
            y={cell.y * unit}
            width={unit}
            height={unit}
          />
        ))}
      </g>

      {/* Połówki */}
      <g fill={color} fillOpacity={fillOpacity}>
        {halves.map((half) => (
          <path
            key={`${cellKey(half)}-${half.cut}`}
            d={halfPath(half.x, half.y, half.cut, unit)}
            stroke={color}
            strokeOpacity={0.7}
            strokeWidth={1.5}
          />
        ))}
      </g>

      {/* Obrys */}
      <g stroke={color} strokeWidth={3} strokeLinecap="square">
        {edges.map((edge) => (
          <line
            key={`${edge.dir}${edge.x},${edge.y}`}
            x1={edge.x * unit}
            y1={edge.y * unit}
            x2={(edge.dir === 'h' ? edge.x + 1 : edge.x) * unit}
            y2={(edge.dir === 'v' ? edge.y + 1 : edge.y) * unit}
          />
        ))}
      </g>

      {children}
    </svg>
  );
}
