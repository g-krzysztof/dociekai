'use client';

import type { ReactNode } from 'react';
import { GEO_LAKES, GEO_LAND, GEO_RIVERS, GEO_VIEW } from '../../hist-map/geo-polska';
import {
  CITIES,
  MAP_TITLE,
  NEIGHBOURS,
  REGIONS,
  polyPath,
  project,
  type City,
  type MapTap,
  type XY,
} from './kazimierz';

/**
 * Mapa „Polska za panowania Kazimierza Wielkiego” — silnik `hist-map`, pierwszy
 * konsument (L9). SVG z danych: kontury Natural Earth + ręczne granice z
 * `kazimierz.ts`. Bloki 1–3 rysują tę samą mapę; różnią się tym, co się stuka
 * i co leży na wierzchu (`children` — w układzie współrzędnych mapy).
 */

export const MAP_COLORS = {
  sea: '#cfe2ea',
  land: '#f4ecd9',
  river: '#4f86a8',
  dark: '#a3262a',
  light: '#eba49b',
  border: '#6e1013',
  ink: '#2b2118',
  outside: '#8a8073',
};

export const MAP_W = GEO_VIEW.width;
export const MAP_H = GEO_VIEW.height;

const REGION_PATHS = REGIONS.map((r) => ({ ...r, d: polyPath(r.points) }));

export function MapTitle({
  onTap,
  hits,
  className = '',
}: {
  onTap?: (index: number) => void;
  hits?: ReadonlySet<string>;
  className?: string;
}) {
  return (
    <p
      className={`text-center font-serif text-sm font-semibold leading-snug sm:text-base ${className}`}
      style={{ color: MAP_COLORS.ink }}
    >
      {MAP_TITLE.map((part, i) => {
        const hit = hits?.has(`title-${i}`);
        return (
          <span key={part}>
            {i > 0 && ' '}
            {onTap ? (
              <button
                type="button"
                onClick={() => onTap(i)}
                className="cursor-pointer border-b-2 border-dashed px-0.5 transition-colors hover:bg-amber-100 dark:hover:bg-amber-900/40"
                style={{
                  borderColor: hit ? MAP_COLORS.dark : '#c9b99a',
                  backgroundColor: hit ? '#f6d7d2' : undefined,
                }}
              >
                {part}
              </button>
            ) : (
              part
            )}
          </span>
        );
      })}
    </p>
  );
}

export function CrownIcon({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M-9,5 L-9,-4 L-4.5,0 L0,-7 L4.5,0 L9,-4 L9,5 Z"
      fill="#e2b52b"
      stroke={MAP_COLORS.ink}
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  );
}

export function CastleIcon({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M-6,7 L-6,-5 L-6,-8 L-3,-8 L-3,-5 L-1.5,-5 L-1.5,-8 L1.5,-8 L1.5,-5 L3,-5 L3,-8 L6,-8 L6,7 Z"
      fill="#fff"
      stroke={MAP_COLORS.ink}
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  );
}

export function CityDot({ x, y, outside }: { x: number; y: number; outside?: boolean }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={3.6}
      fill={outside ? MAP_COLORS.outside : MAP_COLORS.ink}
      stroke="#fff"
      strokeWidth={1}
    />
  );
}

function CityMark({
  city,
  hit,
  onTap,
}: {
  city: City;
  hit: boolean;
  onTap?: (tap: MapTap) => void;
}) {
  const [x, y] = project(city.at);
  const side = city.side ?? 'r';
  const off = city.kind === 'miasto' ? 6 : 12;
  const tx = side === 'l' ? x - off : side === 'r' ? x + off : x;
  const ty = side === 't' ? y - off - 2 : side === 'b' ? y + off + 10 : y + 4.5;
  const anchor = side === 'l' ? 'end' : side === 'r' ? 'start' : 'middle';
  return (
    <g
      onClick={
        onTap ? (e) => (e.stopPropagation(), onTap({ kind: 'city', id: city.id })) : undefined
      }
      style={{ cursor: onTap ? 'pointer' : undefined }}
      data-city={city.id}
    >
      {hit && (
        <circle
          cx={x}
          cy={y}
          r={15}
          fill="none"
          stroke={MAP_COLORS.ink}
          strokeWidth={2.5}
          strokeDasharray="4 3"
        />
      )}
      {city.kind === 'koronacja' ? (
        <>
          <CityDot x={x} y={y + 9} />
          <CrownIcon x={x} y={y - 4} />
        </>
      ) : city.kind === 'zamek' ? (
        <CastleIcon x={x} y={y} />
      ) : (
        <CityDot x={x} y={y} outside={city.outside} />
      )}
      <text
        x={tx}
        y={ty}
        textAnchor={anchor}
        fontSize={14}
        fontWeight={city.outside ? 400 : 600}
        fill={city.outside ? MAP_COLORS.outside : MAP_COLORS.ink}
        stroke="#fffaf0"
        strokeWidth={3}
        paintOrder="stroke"
        style={{ pointerEvents: onTap ? 'visiblePainted' : 'none' }}
      >
        {city.name}
      </text>
      {/* Duże pole trafienia — znak ma kilkanaście jednostek, palec dziecka więcej. */}
      {onTap && <circle cx={x} cy={y} r={20} fill="transparent" />}
    </g>
  );
}

/** Warstwy mapy bez ramki `<svg>` — do wstawienia w przybliżany `<g>` (blok 3). */
export function MapLayers({
  hits,
  onTap,
  showSymbols = true,
  showColors = true,
}: {
  hits?: ReadonlySet<string>;
  onTap?: (tap: MapTap) => void;
  showSymbols?: boolean;
  showColors?: boolean;
}) {
  return (
    <>
      <rect
        x={0}
        y={0}
        width={MAP_W}
        height={MAP_H}
        fill={MAP_COLORS.sea}
        onClick={onTap ? () => onTap({ kind: 'outside' }) : undefined}
      />
      <g onClick={onTap ? () => onTap({ kind: 'outside' }) : undefined}>
        {GEO_LAND.map((d, i) => (
          <path
            key={i}
            d={d}
            fill={MAP_COLORS.land}
            stroke="#9fb7c2"
            strokeWidth={0.8}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
      {showColors &&
        REGION_PATHS.map((r) => (
          <path
            key={r.id}
            d={r.d}
            fill={r.layer === 1333 ? MAP_COLORS.dark : MAP_COLORS.light}
            fillOpacity={r.layer === 1333 ? 0.78 : 0.85}
            stroke={hits?.has(r.id) ? MAP_COLORS.ink : 'none'}
            strokeWidth={hits?.has(r.id) ? 3 : 0}
            strokeDasharray={hits?.has(r.id) ? '6 4' : undefined}
            vectorEffect="non-scaling-stroke"
            onClick={
              onTap ? (e) => (e.stopPropagation(), onTap({ kind: 'region', id: r.id })) : undefined
            }
            style={{ cursor: onTap ? 'pointer' : undefined }}
            data-region={r.id}
          />
        ))}
      {/* Obrys każdego obszaru — linie wewnątrz to granice ziem. */}
      {showColors &&
        REGION_PATHS.map((r) => (
          <path
            key={`b-${r.id}`}
            d={r.d}
            fill="none"
            stroke={MAP_COLORS.border}
            strokeWidth={1.3}
            vectorEffect="non-scaling-stroke"
            style={{ pointerEvents: 'none' }}
          />
        ))}
      <g style={{ pointerEvents: 'none' }}>
        {GEO_LAKES.map((d, i) => (
          <path
            key={i}
            d={d}
            fill={MAP_COLORS.sea}
            stroke={MAP_COLORS.river}
            strokeWidth={0.6}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {GEO_RIVERS.map((r) => (
          <path
            key={r.name}
            d={r.d}
            fill="none"
            stroke={MAP_COLORS.river}
            strokeWidth={r.name === 'Wisła' || r.name === 'Odra' ? 1.8 : 1.1}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {showSymbols &&
          NEIGHBOURS.map((n) => {
            const [x, y] = project(n.at);
            return (
              <text
                key={n.name}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize={13}
                fontStyle="italic"
                fill={MAP_COLORS.outside}
              >
                {n.name}
              </text>
            );
          })}
      </g>
      {showSymbols &&
        CITIES.map((c) => <CityMark key={c.id} city={c} hit={!!hits?.has(c.id)} onTap={onTap} />)}
    </>
  );
}

/** Mapa w ramce, z tytułem nad rysunkiem. */
export function KazimierzMap({
  hits,
  onTap,
  onTitleTap,
  children,
  showTitle = true,
  label = 'Mapa: Polska za panowania Kazimierza Wielkiego, 1333–1370',
}: {
  hits?: ReadonlySet<string>;
  onTap?: (tap: MapTap) => void;
  onTitleTap?: (index: number) => void;
  children?: ReactNode;
  showTitle?: boolean;
  label?: string;
}) {
  return (
    <figure className="border-2 bg-[#fffaf0] p-2" style={{ borderColor: MAP_COLORS.ink }}>
      {showTitle && <MapTitle onTap={onTitleTap} hits={hits} className="mb-1.5" />}
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="block h-auto w-full touch-manipulation select-none"
        role="img"
        aria-label={label}
      >
        <MapLayers hits={hits} onTap={onTap} />
        {children}
      </svg>
    </figure>
  );
}

/** Legenda mapy — te same znaki co na rysunku. */
export function MapLegend({ compact = false }: { compact?: boolean }) {
  const row = 'flex items-center gap-2.5';
  const sw = (fill: string, op: number) => (
    <svg width="26" height="16" aria-hidden className="shrink-0">
      <rect
        x="1"
        y="1"
        width="24"
        height="14"
        fill={fill}
        fillOpacity={op}
        stroke={MAP_COLORS.border}
        strokeWidth="1"
      />
    </svg>
  );
  return (
    <div
      className={`border-2 bg-[#fffaf0] p-3 ${compact ? 'text-xs' : 'text-sm'}`}
      style={{ borderColor: MAP_COLORS.ink, color: MAP_COLORS.ink }}
    >
      <p className="mb-2 font-serif text-xs font-bold uppercase tracking-[0.2em]">Legenda</p>
      <ul className="space-y-1.5">
        <li className={row}>
          {sw(MAP_COLORS.dark, 0.78)}
          <span>Królestwo Polskie w 1333 r.</span>
        </li>
        <li className={row}>
          {sw(MAP_COLORS.light, 0.85)}
          <span>ziemie przyłączone do 1370 r.</span>
        </li>
        <li className={row}>
          <svg width="26" height="22" viewBox="-13 -11 26 22" aria-hidden className="shrink-0">
            <CrownIcon x={0} y={0} />
          </svg>
          <span>miejsce koronacji króla</span>
        </li>
        <li className={row}>
          <svg width="26" height="22" viewBox="-13 -11 26 22" aria-hidden className="shrink-0">
            <CastleIcon x={0} y={0} />
          </svg>
          <span>zamek zbudowany przez Kazimierza</span>
        </li>
        <li className={row}>
          <svg width="26" height="14" viewBox="-13 -7 26 14" aria-hidden className="shrink-0">
            <CityDot x={0} y={0} />
          </svg>
          <span>miasto</span>
        </li>
        <li className={row}>
          <svg width="26" height="14" aria-hidden className="shrink-0">
            <path
              d="M1,9 C7,3 12,12 18,6 S24,6 25,5"
              fill="none"
              stroke={MAP_COLORS.river}
              strokeWidth="1.8"
            />
          </svg>
          <span>rzeka</span>
        </li>
      </ul>
    </div>
  );
}

/** Punkt miasta w układzie mapy — do linijki i przybliżenia. */
export function cityXY(id: string): XY {
  return project(CITIES.find((c) => c.id === id)!.at);
}
