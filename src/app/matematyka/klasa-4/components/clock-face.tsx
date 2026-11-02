'use client';

import type { ReactNode } from 'react';
import { hourHandAngle, minuteHandAngle, polarPoint, secondHandAngle } from '../lib/clock';

interface ClockFaceProps {
  color: string;
  /** Godzina w zapisie 24-godzinnym (0–23) — kąt wskazówki godzinowej liczy z niej resztę mod 12. */
  hours24: number;
  minutes: number;
  seconds?: number;
  showSecondHand?: boolean;
  /** Drugi, wewnętrzny pierścień z cyframi 13–24 — do aktu o zapisie 24-godzinnym. */
  innerRing?: boolean;
  /** Podświetla jedną wskazówkę pełnym kolorem, resztę wygasza — `null`/pominięte = wszystkie pełne. */
  highlightHand?: 'hour' | 'minute' | 'second' | null;
  /**
   * Dodatkowe SVG rysowane wewnątrz tej samej wyśrodkowanej grupy co tarcza —
   * nad kreskami, pod cyframi/wskazówkami. Do tego służy `CLOCK_FACE_RADIUS`:
   * łuki „skoków" w `<ClockJumps>` muszą trafiać dokładnie w ten sam promień.
   */
  overlay?: ReactNode;
  size?: number;
  ariaLabel: string;
}

const CX = 110;
const R = 96;

/** Środek i promień tarczy — eksportowane, żeby nakładki (`overlay`) mogły liczyć własną geometrię w tym samym układzie współrzędnych. */
export const CLOCK_FACE_CENTER = CX;
export const CLOCK_FACE_RADIUS = R;

/**
 * Tarcza zegara — czysty, prezentacyjny SVG (ta sama filozofia co
 * `NumberLine`/`IsoCube`): kąty i pozycje liczone jednymi funkcjami z
 * `lib/clock.ts`, żeby wskazówki i cyfry nigdy nie mogły się rozjechać.
 * Promowany ze `components/guides/zegar/` do wspólnego `components/`, gdy
 * lekcja `obliczenia-zegarowe` stała się drugim konsumentem — ten sam
 * precedens co `NumberLine`/`FactTriangle`/`TallyMarks`.
 */
export function ClockFace({
  color,
  hours24,
  minutes,
  seconds = 0,
  showSecondHand = false,
  innerRing = false,
  highlightHand = null,
  overlay,
  size = 220,
  ariaLabel,
}: ClockFaceProps) {
  const handOpacity = (hand: 'hour' | 'minute' | 'second') =>
    highlightHand == null || highlightHand === hand ? 1 : 0.22;

  const hourTip = polarPoint(hourHandAngle(hours24, minutes), R * 0.52);
  const minuteTip = polarPoint(minuteHandAngle(minutes), R * 0.8);
  const secondTip = polarPoint(secondHandAngle(seconds), R * 0.86);

  return (
    <svg
      viewBox={`0 0 ${CX * 2} ${CX * 2}`}
      width={size}
      height={size}
      role="img"
      aria-label={ariaLabel}
      className="mx-auto"
    >
      <g transform={`translate(${CX} ${CX})`}>
        <circle
          r={R}
          className="fill-white dark:fill-zinc-900"
          stroke={color}
          strokeWidth={3}
        />

        {/* 60 kresek co minutę, co piątą (godzinową) dłuższa i grubsza */}
        {Array.from({ length: 60 }, (_, i) => {
          const isHourTick = i % 5 === 0;
          const angle = i * 6;
          const outer = polarPoint(angle, R - 3);
          const inner = polarPoint(angle, isHourTick ? R - 15 : R - 8);
          return (
            <line
              key={i}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke={color}
              strokeWidth={isHourTick ? 2.5 : 1}
              strokeOpacity={isHourTick ? 1 : 0.45}
              strokeLinecap="round"
            />
          );
        })}

        {overlay}

        {/* Cyfry zewnętrzne 1–12 */}
        {Array.from({ length: 12 }, (_, i) => {
          const hour = i + 1;
          const { x, y } = polarPoint(i * 30, R - 27);
          return (
            <text
              key={hour}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-mono text-[15px] font-black tabular-nums"
              fill={color}
            >
              {hour}
            </text>
          );
        })}

        {/* Opcjonalny wewnętrzny pierścień 13–24, do aktu o zapisie 24-godzinnym */}
        {innerRing &&
          Array.from({ length: 12 }, (_, i) => {
            const hour24 = i === 11 ? 24 : i + 13;
            const { x, y } = polarPoint(i * 30, R - 48);
            return (
              <text
                key={hour24}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-mono text-[11px] font-bold tabular-nums"
                fill={color}
                opacity={0.55}
              >
                {hour24}
              </text>
            );
          })}

        {showSecondHand && (
          <line
            x1={0}
            y1={0}
            x2={secondTip.x}
            y2={secondTip.y}
            stroke={color}
            strokeOpacity={handOpacity('second')}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        )}

        <line
          x1={0}
          y1={0}
          x2={minuteTip.x}
          y2={minuteTip.y}
          stroke={color}
          strokeOpacity={handOpacity('minute')}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <line
          x1={0}
          y1={0}
          x2={hourTip.x}
          y2={hourTip.y}
          stroke={color}
          strokeOpacity={handOpacity('hour')}
          strokeWidth={6}
          strokeLinecap="round"
        />

        <circle r={5} fill={color} />
      </g>
    </svg>
  );
}
