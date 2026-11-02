'use client';

import type { ReactNode } from 'react';
import { GEO_LAKES, GEO_LAND, GEO_RIVERS, GEO_VIEW } from './geo-polska';
import { REGION_SHAPES, type RegionId } from './geo-regiony';

/**
 * Mapa przybliżonych regionów Polski (L12) — kontury z `geo-regiony.ts` na lądzie
 * i rzekach z Natural Earth. Wygląd każdego kawałka podaje konsument (`fill`),
 * bo raz kawałek jest dziurą układanki, raz obszarem gwary, raz celem stuknięcia.
 *
 * `dropPrefix` zamienia kawałki w cele `useDragToken` (`data-drop="<prefix><id>"`).
 * `children` rysują się na wierzchu, w układzie mapy (600 × 506,6).
 */

export const RMAP = {
  sea: '#d6e6ec',
  land: '#f6f0e1',
  river: '#5b8fae',
  edge: '#8a7b63',
  ink: '#2b2118',
} as const;

export interface PieceLook {
  fill: string;
  opacity?: number;
  stroke?: string;
  dashed?: boolean;
  label?: boolean;
}

export function RegionMap({
  look,
  onTap,
  dropPrefix,
  hover,
  children,
  label,
  showRivers = true,
  className,
  viewBox,
}: {
  look: (id: RegionId) => PieceLook;
  onTap?: (id: RegionId) => void;
  dropPrefix?: string;
  /** Wartość `data-drop` celu pod palcem — dostaje grubszy obrys. */
  hover?: string | null;
  children?: ReactNode;
  label: string;
  showRivers?: boolean;
  className?: string;
  /** Wycinek mapy (domyślnie cała). */
  viewBox?: string;
}) {
  return (
    <svg
      viewBox={viewBox ?? `0 0 ${GEO_VIEW.width} ${GEO_VIEW.height}`}
      className={className ?? 'block h-auto w-full select-none'}
      role="img"
      aria-label={label}
    >
      <rect x={0} y={0} width={GEO_VIEW.width} height={GEO_VIEW.height} fill={RMAP.sea} />
      {GEO_LAND.map((d, i) => (
        <path key={i} d={d} fill={RMAP.land} stroke="#a9bfc8" strokeWidth={0.8} />
      ))}
      {REGION_SHAPES.map((r) => {
        const l = look(r.id);
        const drop = dropPrefix ? `${dropPrefix}${r.id}` : undefined;
        const hot = drop !== undefined && hover === drop;
        return (
          <path
            key={r.id}
            d={r.d}
            data-drop={drop}
            fill={l.fill}
            fillOpacity={l.opacity ?? 1}
            stroke={hot ? RMAP.ink : (l.stroke ?? RMAP.edge)}
            strokeWidth={hot ? 3 : 1.2}
            strokeDasharray={l.dashed ? '5 4' : undefined}
            strokeLinejoin="round"
            onClick={onTap ? () => onTap(r.id) : undefined}
            style={{ cursor: onTap ? 'pointer' : undefined, transition: 'fill 300ms, fill-opacity 300ms' }}
          >
            <title>{r.name}</title>
          </path>
        );
      })}
      {showRivers && (
        <g style={{ pointerEvents: 'none' }}>
          {GEO_LAKES.map((d, i) => (
            <path key={i} d={d} fill={RMAP.sea} stroke={RMAP.river} strokeWidth={0.5} />
          ))}
          {GEO_RIVERS.map((r) => (
            <path
              key={r.name}
              d={r.d}
              fill="none"
              stroke={RMAP.river}
              strokeOpacity={0.7}
              strokeWidth={r.name === 'Wisła' || r.name === 'Odra' ? 1.6 : 0.9}
              strokeLinejoin="round"
            />
          ))}
        </g>
      )}
      <g style={{ pointerEvents: 'none' }}>
        {REGION_SHAPES.map((r) =>
          look(r.id).label ? (
            <text
              key={r.id}
              x={LABEL_AT[r.id]?.[0] ?? r.label[0]}
              y={LABEL_AT[r.id]?.[1] ?? r.label[1]}
              textAnchor="middle"
              fontSize={15}
              fontWeight={600}
              fill={RMAP.ink}
              stroke="#fffaf0"
              strokeWidth={3.5}
              paintOrder="stroke"
            >
              {r.name.startsWith('Ziemia ') && r.id === 'ziemia-lubuska' ? (
                <>
                  <tspan x={LABEL_AT[r.id]![0]} dy={-8}>
                    Ziemia
                  </tspan>
                  <tspan x={LABEL_AT[r.id]![0]} dy={17}>
                    {r.name.slice(7)}
                  </tspan>
                </>
              ) : (
                r.name
              )}
            </text>
          ) : null
        )}
      </g>
      {children}
    </svg>
  );
}

/** Ręcznie dosunięte podpisy (punkt reprezentatywny bywa przy brzegu). */
const LABEL_AT: Partial<Record<RegionId, readonly [number, number]>> = {
  pomorze: [150, 90],
  'warmia-mazury': [330, 110],
  podlasie: [410, 150],
  kujawy: [215, 165],
  'ziemia-lubuska': [70, 222],
  wielkopolska: [172, 232],
  mazowsze: [345, 215],
  'ziemia-lodzka': [255, 268],
  lubelszczyzna: [412, 295],
  slask: [150, 345],
  malopolska: [340, 385],
};

/** Mały podgląd jednego kawałka (żeton układanki) — kształt w swoim pudełku. */
export function PieceGlyph({ id, fill, size = 56, className }: { id: RegionId; fill: string; size?: number; className?: string }) {
  const r = REGION_SHAPES.find((s) => s.id === id)!;
  const [x0, y0, x1, y1] = r.box;
  const pad = 4;
  return (
    <svg
      viewBox={`${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`}
      width={size}
      height={size}
      className={`pointer-events-none block ${className ?? ''}`}
      aria-hidden
    >
      <path d={r.d} fill={fill} stroke={RMAP.ink} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}
