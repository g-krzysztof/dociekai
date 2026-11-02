'use client';

import { isSquare, type RectangleSpec } from '../../../lib/rectangle-area';

interface RectSketchProps {
  spec: RectangleSpec;
  color: string;
  /** Podpisy boków — domyślnie same liczby, ale zwykle chcesz jednostkę („5 m”). */
  unitLabel?: string;
  /** Rysuj kratownicę jednostkową w środku (pokazuje, skąd bierze się mnożenie). */
  tiles?: boolean;
  /** Bok kratki w pikselach `viewBox`; ramka i tak jest stała. */
  cellPx?: number;
  /** Podpis pod prostokątem — np. znak zapytania przy szukanym boku. */
  caption?: string;
  /** Zastąp podpis jednego z boków, gdy to on jest niewiadomą. */
  widthLabel?: string;
  heightLabel?: string;
}

/**
 * Prostokąt z podpisanymi bokami — jeden rysunek dla przykładów, ćwiczeń i
 * podsumowania tej lekcji. Rozmiar `viewBox` liczony jest ze stałego maksimum,
 * więc mniejszy prostokąt nie rozdmuchuje się na całą ramkę.
 */
export function RectSketch({
  spec,
  color,
  unitLabel = '',
  tiles = false,
  cellPx = 20,
  caption,
  widthLabel,
  heightLabel,
}: RectSketchProps) {
  /** Lewy margines musi pomieścić podpis boku z jednostką („? cm”), górny jest niższy. */
  const padL = 48;
  const padT = 24;
  const pad = 14;
  const maxSide = 9;
  const viewW = padL + maxSide * cellPx + pad;
  const viewH = padT + maxSide * cellPx * 0.78 + pad + 4;
  const w = Math.min(spec.width, maxSide) * cellPx;
  const h = Math.min(spec.height, maxSide) * cellPx;
  const suffix = unitLabel ? ` ${unitLabel}` : '';

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="mx-auto w-full max-w-[220px]"
        role="img"
        aria-label={`Prostokąt o bokach ${widthLabel ?? spec.width} i ${heightLabel ?? spec.height}`}
      >
        {tiles && (
          <g stroke={`${color}44`} strokeWidth={1}>
            {Array.from({ length: spec.width + 1 }, (_, i) => (
              <line key={`v${i}`} x1={padL + i * cellPx} y1={padT} x2={padL + i * cellPx} y2={padT + h} />
            ))}
            {Array.from({ length: spec.height + 1 }, (_, i) => (
              <line key={`h${i}`} x1={padL} y1={padT + i * cellPx} x2={padL + w} y2={padT + i * cellPx} />
            ))}
          </g>
        )}
        <rect
          x={padL}
          y={padT}
          width={w}
          height={h}
          fill={color}
          fillOpacity={tiles ? 0.12 : 0.2}
          stroke={color}
          strokeWidth={2.5}
        />
        {/* Kreski równości boków dla kwadratu — ta sama notacja co w module geometrii. */}
        {isSquare(spec) && (
          <g stroke={color} strokeWidth={2}>
            <line x1={padL + w / 2} y1={padT - 4} x2={padL + w / 2} y2={padT + 4} />
            <line x1={padL + w / 2} y1={padT + h - 4} x2={padL + w / 2} y2={padT + h + 4} />
            <line x1={padL - 4} y1={padT + h / 2} x2={padL + 4} y2={padT + h / 2} />
            <line x1={padL + w - 4} y1={padT + h / 2} x2={padL + w + 4} y2={padT + h / 2} />
          </g>
        )}
        <text
          x={padL + w / 2}
          y={padT - 8}
          textAnchor="middle"
          fontSize={13}
          fontWeight={700}
          fill={color}
        >
          {widthLabel ?? `${spec.width}${suffix}`}
        </text>
        <text
          x={padL - 8}
          y={padT + h / 2 + 4}
          textAnchor="end"
          fontSize={13}
          fontWeight={700}
          fill={color}
        >
          {heightLabel ?? `${spec.height}${suffix}`}
        </text>
      </svg>
      {caption && (
        <figcaption className="mt-1 text-center text-xs text-muted-foreground">{caption}</figcaption>
      )}
    </figure>
  );
}
