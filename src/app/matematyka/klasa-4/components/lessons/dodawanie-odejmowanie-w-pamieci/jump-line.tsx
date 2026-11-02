'use client';

import { Check, Flag } from 'lucide-react';
import { motion } from 'framer-motion';

const BASE_WIDTH = 640;
const HEIGHT = 150;
const PAD_L = 44;
const PAD_R = 44;
const LINE_Y = 112;
const BASE_PLOT_W = BASE_WIDTH - PAD_L - PAD_R;
/** Minimalny odstęp w px między sąsiednimi punktami na osi — mniej i etykiety/kółka się zlewają. */
const MIN_GAP = 64;

export interface JumpLineProps {
  start: number;
  /** Liczba, którą trzeba osiągnąć. Puste kółko-flaga, dopóki `jumps` się do niej nie doliczą. */
  target: number;
  /** Skoki wykonane dotąd, w kolejności. Ujemne = w lewo (odejmowanie). */
  jumps: number[];
  color: string;
  ariaLabel: string;
  formatValue?: (value: number) => string;
  className?: string;
}

const defaultFormat = (value: number) => value.toLocaleString('pl-PL');

function arcHeight(delta: number): number {
  return Math.min(72, Math.max(20, 18 + Math.sqrt(Math.abs(delta)) * 9));
}

/**
 * "Pusta oś liczbowa" — bez podziałki i cyfr z góry, tylko punkt startowy i cel.
 * Dziecko (albo lekcja, w trybie pokazu) dokłada skoki jeden po drugim; każdy nowy
 * skok animuje się jako łuk-podskok, poprzednie zostają na stałe jako ślad. Inny
 * mechanizm niż `NumberLine` (tam pełna podziałka i klik-umieszczanie punktu) —
 * tu liczy się droga między dwiema liczbami, nie miejsce na skali.
 *
 * Pozycje punktów NIE są czysto liniowe: gdy jeden skok jest dużo mniejszy niż
 * pozostałe (np. korekta „+1” po dużym skoku „−30”), czysto proporcjonalna skala
 * ścieśniłaby oba punkty do tego samego piksela i etykiety by się zlały. Zamiast
 * tego pozycje liczymy liniowo, a potem „rozpychamy" je do minimalnego odstępu w
 * px, zachowując kolejność — szerokość SVG rośnie w razie potrzeby (viewBox), więc
 * nic się nie ścieśnia kosztem czytelności.
 */
export function JumpLine({
  start,
  target,
  jumps,
  color,
  ariaLabel,
  formatValue = defaultFormat,
  className,
}: JumpLineProps) {
  const stops = jumps.reduce<number[]>((acc, delta) => [...acc, acc[acc.length - 1] + delta], [
    start,
  ]);
  const current = stops[stops.length - 1];
  const solved = current === target;

  const allValues = [...stops, target];
  const domainMin = Math.min(...allValues);
  const domainMax = Math.max(...allValues);
  const pad = domainMax === domainMin ? 10 : (domainMax - domainMin) * 0.2;
  const vMin = domainMin - pad;
  const vMax = domainMax + pad;

  // Jedyne wartości, dla których kiedykolwiek pytamy o pozycję — mapa zamiast
  // funkcji ciągłej, żeby można było je "rozepchnąć" niezależnie od odległości w wartości.
  const keyValues = Array.from(new Set(allValues)).sort((a, b) => a - b);
  const xByValue = new Map<number, number>();
  let previousX = -Infinity;
  keyValues.forEach((value) => {
    const raw = PAD_L + ((value - vMin) / (vMax - vMin)) * BASE_PLOT_W;
    const x = Math.max(raw, previousX === -Infinity ? raw : previousX + MIN_GAP);
    xByValue.set(value, x);
    previousX = x;
  });
  const xOf = (value: number) => xByValue.get(value) ?? PAD_L;
  const width = Math.max(BASE_WIDTH, previousX + PAD_R);

  const readout = `${formatValue(start)} ${jumps
    .map((delta) => `${delta >= 0 ? '+' : '−'} ${formatValue(Math.abs(delta))}`)
    .join(' ')}${jumps.length ? ' ' : ''}= ${solved ? formatValue(target) : '?'}`;

  return (
    <div className={className}>
      <p
        className="mb-3 text-center font-mono text-base font-bold tabular-nums sm:text-lg"
        style={{ color: solved ? color : undefined }}
      >
        {readout}
      </p>

      <svg viewBox={`0 0 ${width} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
        {/* Sama oś — bez podziałki, tylko groty na końcach, jak przy "pustej osi liczbowej" */}
        <line
          x1={PAD_L - 10}
          y1={LINE_Y}
          x2={width - PAD_R + 10}
          y2={LINE_Y}
          stroke="currentColor"
          strokeOpacity={0.3}
          strokeWidth={2}
          className="text-muted-foreground"
        />
        <polygon
          points={`${PAD_L - 16},${LINE_Y} ${PAD_L - 6},${LINE_Y - 4} ${PAD_L - 6},${LINE_Y + 4}`}
          fill="currentColor"
          fillOpacity={0.3}
          className="text-muted-foreground"
        />
        <polygon
          points={`${width - PAD_R + 16},${LINE_Y} ${width - PAD_R + 6},${LINE_Y - 4} ${width - PAD_R + 6},${LINE_Y + 4}`}
          fill="currentColor"
          fillOpacity={0.3}
          className="text-muted-foreground"
        />

        {/* Cel — przerywane kółko z chorągiewką, dopóki nie osiągnięte */}
        <g>
          <circle
            cx={xOf(target)}
            cy={LINE_Y}
            r={10}
            fill={solved ? color : 'white'}
            stroke={color}
            strokeWidth={2.5}
            strokeDasharray={solved ? undefined : '3 3'}
          />
          {!solved && (
            <foreignObject x={xOf(target) - 7} y={LINE_Y - 34} width={14} height={14}>
              <Flag className="h-3.5 w-3.5" style={{ color }} aria-hidden />
            </foreignObject>
          )}
          {!solved && (
            <text
              x={xOf(target)}
              y={LINE_Y + 28}
              textAnchor="middle"
              className="text-[11px] font-semibold"
              style={{ fill: color }}
            >
              cel: {formatValue(target)}
            </text>
          )}
        </g>

        {/* Łuki-podskoki, po jednym na każdy wykonany skok */}
        {jumps.map((delta, i) => {
          const x1 = xOf(stops[i]);
          const x2 = xOf(stops[i + 1]);
          const midX = (x1 + x2) / 2;
          const h = arcHeight(delta);
          const peakY = LINE_Y - h;
          return (
            <g key={`arc-${i}`}>
              <motion.path
                d={`M ${x1},${LINE_Y} Q ${midX},${peakY} ${x2},${LINE_Y}`}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
              <motion.text
                x={midX}
                y={peakY - 8}
                textAnchor="middle"
                className="text-[13px] font-bold"
                style={{ fill: color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                {delta >= 0 ? '+' : '−'}
                {formatValue(Math.abs(delta))}
              </motion.text>
            </g>
          );
        })}

        {/* Ślad: wszystkie punkty pośrednie poza aktualnym */}
        {stops.slice(0, -1).map((value, i) => (
          <g key={`stop-${i}`}>
            <circle cx={xOf(value)} cy={LINE_Y} r={4.5} fill={color} fillOpacity={0.55} />
            <text
              x={xOf(value)}
              y={LINE_Y + 28}
              textAnchor="middle"
              className="text-[11px] font-medium text-muted-foreground"
            >
              {formatValue(value)}
            </text>
          </g>
        ))}

        {/* Aktualna pozycja — "skoczek". Klucz na długości `jumps` sprawia, że przy
            każdym nowym skoku element się remontuje i podskok odgrywa się od nowa,
            a poprzednie łuki i punkty zostają nietknięte. */}
        <g key={jumps.length}>
          <motion.circle
            initial={
              stops.length > 1
                ? { cx: xOf(stops[stops.length - 2]), cy: LINE_Y }
                : { cx: xOf(current), cy: LINE_Y }
            }
            animate={
              stops.length > 1
                ? {
                    cx: [xOf(stops[stops.length - 2]), (xOf(stops[stops.length - 2]) + xOf(current)) / 2, xOf(current)],
                    cy: [LINE_Y, LINE_Y - arcHeight(jumps[jumps.length - 1] ?? 0), LINE_Y],
                  }
                : { cx: xOf(current), cy: LINE_Y }
            }
            transition={{ duration: 0.45, ease: 'easeOut' }}
            r={10}
            fill={solved ? color : 'white'}
            stroke={color}
            strokeWidth={3}
          />
          {solved && (
            <foreignObject x={xOf(current) - 7} y={LINE_Y - 7} width={14} height={14}>
              <Check className="h-3.5 w-3.5 text-white" aria-hidden />
            </foreignObject>
          )}
          <motion.text
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            x={xOf(current)}
            y={LINE_Y + 28}
            textAnchor="middle"
            className="text-[12px] font-bold"
            style={{ fill: solved ? color : undefined }}
          >
            {formatValue(current)}
          </motion.text>
        </g>
      </svg>
    </div>
  );
}
