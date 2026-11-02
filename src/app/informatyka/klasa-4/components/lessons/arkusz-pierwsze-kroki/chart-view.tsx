'use client';

import { formatNumber } from '../../../lib/formula';
import { niceTicks, type ChartModel } from './chart';

/**
 * Wykres narysowany w SVG z modelu `chart.ts`. Trzy rodzaje, bo tyle potrzebuje
 * klasa 4: kolumnowy (porównanie), liniowy (zmiana w czasie) i kołowy (części
 * jednej całości).
 *
 * Kolory i napisy biorą się z `currentColor` i kolorów serii, więc wykres
 * wygląda tak samo w jasnym i ciemnym motywie. Wymiary w `viewBox`, a sufit
 * szerokości nadaje widżet — ta sama zasada co przy scenie Scratcha: kadr o
 * stałych proporcjach bez sufitu rośnie razem z kolumną i zjada ekran.
 */

const SERIES_COLORS = ['#db2777', '#0ea5e9', '#f59e0b', '#10b981'];
const PIE_COLORS = ['#db2777', '#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#14b8a6', '#a3a3a3'];

const W = 360;
const H = 220;

export function ChartView({
  model,
  color,
  title,
  highlightIndex,
}: {
  model: ChartModel;
  color?: string;
  title?: string;
  /** Kategoria do podkreślenia (np. ta, o którą pyta czytelnik). */
  highlightIndex?: number | null;
}) {
  const palette = color ? [color, ...SERIES_COLORS.filter((item) => item !== color)] : SERIES_COLORS;
  const empty = model.series.length === 0 || model.series.every((series) => series.values.every((value) => value === null));

  return (
    <figure className="w-full">
      {title && <figcaption className="mb-1 text-center text-xs font-semibold">{title}</figcaption>}
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full text-foreground" role="img" aria-label={describe(model)}>
        {empty ? (
          <text x={W / 2} y={H / 2} textAnchor="middle" className="fill-current text-[12px] opacity-60">
            W zaznaczeniu nie ma liczb do narysowania
          </text>
        ) : model.kind === 'pie' ? (
          <Pie model={model} highlightIndex={highlightIndex} />
        ) : (
          <Axes model={model} palette={palette} highlightIndex={highlightIndex} />
        )}
      </svg>
      {model.series.length > 1 && model.kind !== 'pie' && (
        <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px]">
          {model.series.map((series, index) => (
            <span key={index} className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5" style={{ backgroundColor: palette[index % palette.length] }} />
              {series.name}
            </span>
          ))}
        </div>
      )}
    </figure>
  );
}

function describe(model: ChartModel): string {
  const kind = model.kind === 'pie' ? 'Wykres kołowy' : model.kind === 'line' ? 'Wykres liniowy' : 'Wykres kolumnowy';
  const first = model.series[0];
  if (!first) return kind;
  const points = first.values
    .map((value, index) => `${model.categories[index]}: ${value === null ? 'brak' : formatNumber(value)}`)
    .join(', ');
  return `${kind}. ${points}`;
}

function Axes({
  model,
  palette,
  highlightIndex,
}: {
  model: ChartModel;
  palette: string[];
  highlightIndex?: number | null;
}) {
  const all = model.series.flatMap((series) => series.values.filter((value): value is number => value !== null));
  const max = Math.max(...all, 0);
  const min = Math.min(...all, 0);
  const ticks = niceTicks(max, min);
  const top = ticks[ticks.length - 1];
  const bottom = ticks[0];

  const left = 34;
  const right = W - 8;
  const chartTop = 10;
  const chartBottom = H - 34;
  const y = (value: number) => chartBottom - ((value - bottom) / (top - bottom || 1)) * (chartBottom - chartTop);

  const count = Math.max(model.categories.length, 1);
  const slot = (right - left) / count;
  const groupWidth = slot * 0.72;
  const barWidth = groupWidth / Math.max(model.series.length, 1);
  const labelEvery = count > 12 ? Math.ceil(count / 12) : 1;
  const longLabels = model.categories.some((label) => label.length > 6) && count > 5;

  return (
    <g>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={left} x2={right} y1={y(tick)} y2={y(tick)} stroke="currentColor" strokeOpacity={tick === 0 ? 0.45 : 0.12} />
          <text x={left - 5} y={y(tick) + 3.5} textAnchor="end" className="fill-current text-[10px] opacity-60">
            {formatNumber(tick)}
          </text>
        </g>
      ))}

      {model.categories.map((label, index) => {
        const cx = left + slot * index + slot / 2;
        if (index % labelEvery !== 0) return null;
        const text = label.length > 10 ? `${label.slice(0, 9)}…` : label;
        return (
          <text
            key={`c${index}`}
            x={cx}
            y={chartBottom + 13}
            textAnchor={longLabels ? 'end' : 'middle'}
            transform={longLabels ? `rotate(-30 ${cx} ${chartBottom + 13})` : undefined}
            className="fill-current text-[10px]"
            fontWeight={highlightIndex === index ? 700 : 400}
          >
            {text}
          </text>
        );
      })}

      {model.kind === 'column'
        ? model.series.map((series, seriesIndex) =>
            series.values.map((value, index) => {
              if (value === null) return null;
              const x = left + slot * index + (slot - groupWidth) / 2 + barWidth * seriesIndex;
              const y0 = y(Math.max(value, 0));
              const height = Math.abs(y(value) - y(0));
              const fill = palette[seriesIndex % palette.length];
              return (
                <g key={`${seriesIndex}-${index}`}>
                  <rect
                    x={x + 1}
                    y={value >= 0 ? y0 : y(0)}
                    width={Math.max(barWidth - 2, 2)}
                    height={Math.max(height, 0.5)}
                    fill={fill}
                    fillOpacity={highlightIndex === undefined || highlightIndex === null || highlightIndex === index ? 0.9 : 0.35}
                  />
                  {model.series.length === 1 && count <= 10 && (
                    <text
                      x={x + barWidth / 2}
                      y={(value >= 0 ? y0 : y(value)) - 3}
                      textAnchor="middle"
                      className="fill-current text-[9px] opacity-75"
                    >
                      {formatNumber(value)}
                    </text>
                  )}
                </g>
              );
            })
          )
        : model.series.map((series, seriesIndex) => {
            const stroke = palette[seriesIndex % palette.length];
            const points = series.values
              .map((value, index) => (value === null ? null : `${left + slot * index + slot / 2},${y(value)}`))
              .filter(Boolean)
              .join(' ');
            return (
              <g key={seriesIndex}>
                <polyline points={points} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" />
                {series.values.map((value, index) =>
                  value === null ? null : (
                    <g key={index}>
                      <circle cx={left + slot * index + slot / 2} cy={y(value)} r={highlightIndex === index ? 5 : 3.5} fill={stroke} />
                      {model.series.length === 1 && count <= 10 && (
                        <text
                          x={left + slot * index + slot / 2}
                          y={y(value) - 7}
                          textAnchor="middle"
                          className="fill-current text-[9px] opacity-75"
                        >
                          {formatNumber(value)}
                        </text>
                      )}
                    </g>
                  )
                )}
              </g>
            );
          })}
    </g>
  );
}

function Pie({ model, highlightIndex }: { model: ChartModel; highlightIndex?: number | null }) {
  const values = (model.series[0]?.values ?? []).map((value) => Math.max(value ?? 0, 0));
  const total = values.reduce((sum, value) => sum + value, 0);
  const cx = 110;
  const cy = H / 2;
  const r = 88;
  if (total <= 0) return null;

  let angle = -Math.PI / 2;
  const slices = values.map((value, index) => {
    const share = value / total;
    const start = angle;
    angle += share * Math.PI * 2;
    return { index, share, start, end: angle };
  });

  const point = (a: number, radius = r) =>
    `${Math.round((cx + Math.cos(a) * radius) * 100) / 100},${Math.round((cy + Math.sin(a) * radius) * 100) / 100}`;

  return (
    <g>
      {slices.map((slice) => {
        if (slice.share <= 0) return null;
        const large = slice.end - slice.start > Math.PI ? 1 : 0;
        const d =
          slice.share >= 0.9999
            ? `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 ${-r * 2},0`
            : `M ${cx},${cy} L ${point(slice.start)} A ${r},${r} 0 ${large} 1 ${point(slice.end)} Z`;
        return (
          <path
            key={slice.index}
            d={d}
            fill={PIE_COLORS[slice.index % PIE_COLORS.length]}
            fillOpacity={highlightIndex === undefined || highlightIndex === null || highlightIndex === slice.index ? 0.9 : 0.35}
            stroke="white"
            strokeWidth={1.5}
          />
        );
      })}
      {slices.map((slice, row) => {
        const y = 22 + row * Math.min(22, (H - 30) / Math.max(slices.length, 1));
        return (
          <g key={`l${slice.index}`}>
            <rect x={218} y={y - 9} width={10} height={10} fill={PIE_COLORS[slice.index % PIE_COLORS.length]} />
            <text x={233} y={y} className="fill-current text-[10px]">
              {(model.categories[slice.index] ?? '').slice(0, 12)} · {Math.round(slice.share * 100)}%
            </text>
          </g>
        );
      })}
    </g>
  );
}
