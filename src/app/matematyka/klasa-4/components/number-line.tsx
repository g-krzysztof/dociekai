'use client';

import { useRef, type MouseEvent as ReactMouseEvent } from 'react';

const WIDTH = 640;
const HEIGHT = 110;
const PAD_L = 34;
const PAD_R = 34;
const LINE_Y = 62;
const PLOT_W = WIDTH - PAD_L - PAD_R;

export interface LineMarker {
  value: number;
  /** Etykieta nad/pod punktem, np. nazwa przystanku albo wartość do odsłonięcia. */
  label?: string;
  color?: string;
  /** Wypełniona kropka (domyślnie) czy tylko obrys — przydatne na razie-nie-sprawdzony punkt. */
  filled?: boolean;
  radius?: number;
  labelPosition?: 'above' | 'below';
}

interface NumberLineProps {
  min: number;
  max: number;
  /** Krok dużych, podpisanych kresek. */
  majorStep: number;
  /** Krok małych, niepodpisanych kresek — pomijany, gdy brak subpodziałki. */
  minorStep?: number;
  color: string;
  markers?: LineMarker[];
  /** Gdy podane, oś reaguje na klik/dotyk — zwraca wartość spod kursora (zaokrągloną do `snapStep`, domyślnie `minorStep ?? majorStep`). */
  onPick?: (value: number) => void;
  snapStep?: number;
  formatValue?: (value: number) => string;
  ariaLabel: string;
  className?: string;
}

const defaultFormat = (value: number) => value.toLocaleString('pl-PL');

function range(from: number, to: number, step: number): number[] {
  const values: number[] = [];
  for (let v = from; v <= to + step / 2; v += step) values.push(Math.round(v * 1e6) / 1e6);
  return values;
}

/**
 * Oś liczbowa jako SVG — wspólny prymityw najpierw dla wszystkich widgetów
 * lekcji `os-liczbowa` (rozgrzewki, budowania liczby, przykładów, ćwiczeń,
 * trasy rowerowej), promowany tutaj, do `components/`, gdy przewodnik
 * `liczby-i-os` stał się drugim konsumentem — ten sam precedens co
 * `RomanOdometer`/`TallyMarks`. Bez `onPick` jest czysto prezentacyjna
 * (przykłady/ćwiczenia), z `onPick` — interaktywna (kliknięcie zwraca
 * najbliższą wartość na siatce `snapStep`).
 */
export function NumberLine({
  min,
  max,
  majorStep,
  minorStep,
  color,
  markers = [],
  onPick,
  snapStep,
  formatValue = defaultFormat,
  ariaLabel,
  className,
}: NumberLineProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const xOf = (value: number) => PAD_L + ((value - min) / (max - min)) * PLOT_W;
  const valueOf = (x: number) => min + ((x - PAD_L) / PLOT_W) * (max - min);

  const majorTicks = range(min, max, majorStep);
  const minorTicks = minorStep
    ? range(min, max, minorStep).filter((v) => !majorTicks.includes(v))
    : [];

  const handleClick = (event: ReactMouseEvent<SVGRectElement>) => {
    if (!onPick || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scale = WIDTH / rect.width;
    const localX = (event.clientX - rect.left) * scale;
    const raw = Math.min(max, Math.max(min, valueOf(localX)));
    const step = snapStep ?? minorStep ?? majorStep;
    const snapped = Math.round(raw / step) * step;
    onPick(Math.min(max, Math.max(min, snapped)));
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={className ?? 'h-auto w-full'}
      role="img"
      aria-label={ariaLabel}
    >
      {/* Sama oś */}
      <line x1={PAD_L} y1={LINE_Y} x2={WIDTH - PAD_R} y2={LINE_Y} stroke="currentColor" strokeOpacity={0.35} strokeWidth={2} className="text-muted-foreground" />

      {/* Małe kreski */}
      {minorTicks.map((v) => (
        <line key={`mi-${v}`} x1={xOf(v)} y1={LINE_Y - 5} x2={xOf(v)} y2={LINE_Y + 5} stroke="currentColor" strokeOpacity={0.35} strokeWidth={1.5} className="text-muted-foreground" />
      ))}

      {/* Duże, podpisane kreski */}
      {majorTicks.map((v) => (
        <g key={`ma-${v}`}>
          <line x1={xOf(v)} y1={LINE_Y - 10} x2={xOf(v)} y2={LINE_Y + 10} stroke="currentColor" strokeOpacity={0.6} strokeWidth={2} className="text-muted-foreground" />
          <text x={xOf(v)} y={LINE_Y + 26} textAnchor="middle" fill="currentColor" className="text-[11px] font-semibold text-muted-foreground">
            {formatValue(v)}
          </text>
        </g>
      ))}

      {/* Punkty */}
      {markers.map((marker, i) => {
        const markerColor = marker.color ?? color;
        const filled = marker.filled ?? true;
        const radius = marker.radius ?? 6.5;
        const labelAbove = (marker.labelPosition ?? 'above') === 'above';
        return (
          <g key={i}>
            <circle
              cx={xOf(marker.value)}
              cy={LINE_Y}
              r={radius}
              fill={filled ? markerColor : 'white'}
              stroke={markerColor}
              strokeWidth={2.5}
            />
            {marker.label && (
              <text
                x={xOf(marker.value)}
                y={labelAbove ? LINE_Y - radius - 8 : LINE_Y + radius + 22}
                textAnchor="middle"
                fill={markerColor}
                className="text-[12px] font-bold"
              >
                {marker.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Warstwa klikalna — cały obszar wykresu, przezroczysta */}
      {onPick && (
        <rect
          x={PAD_L}
          y={0}
          width={PLOT_W}
          height={HEIGHT}
          fill="transparent"
          className="cursor-pointer"
          onClick={handleClick}
        />
      )}
    </svg>
  );
}
