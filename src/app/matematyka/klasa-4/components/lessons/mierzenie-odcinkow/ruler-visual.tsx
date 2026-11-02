import { buildTicks, tickHeightForMm } from './ruler-geometry';

const PAD = 14;
const TICK_TOP = 20;
const LABEL_Y = TICK_TOP + 30;
const SEGMENT_Y = LABEL_Y + 22;
const DOT_R = 4;

interface RulerVisualProps {
  color: string;
  /** Zasięg podziałki linijki: 0..maxMm. */
  maxMm: number;
  /** Pusty margines drewna PRZED kreską zero (fizyczny brzeg linijki) — 0, gdy linijka zaczyna się od razu podziałką. */
  edgeMarginMm?: number;
  /** Gdzie zaczyna/kończy się mierzony odcinek, w tych samych jednostkach co podziałka (może być ujemne w granicach -edgeMarginMm). */
  segmentStartMm: number;
  segmentEndMm: number;
  labelA?: string;
  labelB?: string;
  /** Podświetla kreskę zero — do przykładu tłumaczącego, od czego zaczynamy odczyt. */
  highlightZero?: boolean;
}

/**
 * Statyczny rysunek linijki + mierzonego odcinka. Jedna funkcja renderująca
 * karmi trzy różne kroki lekcji (przykłady, ćwiczenia w `DiagnosticQuiz.visual`,
 * łamigłówka z błędnym pomiarem) — ten sam trik co `lib/clock.ts`/`lib/roman.ts`:
 * geometria wynika z liczb (`segmentStartMm`/`segmentEndMm`), nic nie jest
 * narysowane "na oko". `viewBox` w milimetrach, więc linijka i odcinek są
 * zawsze piksel-w-piksel spójne.
 */
export function RulerVisual({
  color,
  maxMm,
  edgeMarginMm = 0,
  segmentStartMm,
  segmentEndMm,
  labelA,
  labelB,
  highlightZero,
}: RulerVisualProps) {
  const ticks = buildTicks(maxMm);
  const minX = -edgeMarginMm - PAD;
  const maxX = maxMm + PAD;
  const width = maxX - minX;
  const height = SEGMENT_Y + 16;

  return (
    <svg
      viewBox={`${minX} 0 ${width} ${height}`}
      className="mx-auto h-auto w-full max-w-md"
      role="img"
      aria-label={`Linijka od ${edgeMarginMm ? `krawędzi ${-edgeMarginMm} mm przed zerem` : 'zera'} do ${maxMm} mm, odcinek od ${segmentStartMm} mm do ${segmentEndMm} mm`}
    >
      {/* Pusty margines drewna przed kreską zero — fizyczny brzeg linijki, bez podziałki */}
      {edgeMarginMm > 0 && (
        <rect
          x={-edgeMarginMm}
          y={TICK_TOP - 4}
          width={edgeMarginMm}
          height={20}
          className="fill-muted-foreground/10"
          stroke="currentColor"
          strokeOpacity={0.3}
          strokeWidth={1}
        />
      )}

      {/* Kreski podziałki */}
      {ticks.map(({ mm, height: h }) => {
        const tickH = h === 'cm' ? 16 : h === 'five' ? 11 : 6;
        return (
          <g key={mm}>
            <line
              x1={mm}
              y1={TICK_TOP}
              x2={mm}
              y2={TICK_TOP + tickH}
              stroke={mm === 0 && highlightZero ? color : 'currentColor'}
              strokeOpacity={mm === 0 && highlightZero ? 1 : h === 'cm' ? 0.75 : 0.4}
              strokeWidth={mm === 0 && highlightZero ? 2.4 : h === 'cm' ? 1.4 : 1}
            />
            {h === 'cm' && (
              <text
                x={mm}
                y={LABEL_Y}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[6px]"
              >
                {mm / 10}
              </text>
            )}
          </g>
        );
      })}

      {highlightZero && (
        <circle cx={0} cy={TICK_TOP - 6} r={3} fill={color} opacity={0.9} />
      )}

      {/* Prowadnice od końców odcinka do podziałki — kończą się dokładnie na końcu właściwej kreski (cm/5mm/1mm), nie generycznie na wysokości kreski centymetrowej */}
      <line
        x1={segmentStartMm}
        y1={TICK_TOP + tickHeightForMm(segmentStartMm)}
        x2={segmentStartMm}
        y2={SEGMENT_Y}
        stroke={color}
        strokeOpacity={0.35}
        strokeDasharray="2 2"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={segmentEndMm}
        y1={TICK_TOP + tickHeightForMm(segmentEndMm)}
        x2={segmentEndMm}
        y2={SEGMENT_Y}
        stroke={color}
        strokeOpacity={0.35}
        strokeDasharray="2 2"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />

      {/* Odcinek — linia + dwie kropki na końcach */}
      <line
        x1={segmentStartMm}
        y1={SEGMENT_Y}
        x2={segmentEndMm}
        y2={SEGMENT_Y}
        stroke={color}
        strokeWidth={2.5}
      />
      <circle cx={segmentStartMm} cy={SEGMENT_Y} r={DOT_R} fill={color} />
      <circle cx={segmentEndMm} cy={SEGMENT_Y} r={DOT_R} fill={color} />

      {labelA && (
        <text
          x={segmentStartMm}
          y={SEGMENT_Y + 13}
          textAnchor="middle"
          className="fill-foreground font-mono text-[7px] font-bold"
        >
          {labelA}
        </text>
      )}
      {labelB && (
        <text
          x={segmentEndMm}
          y={SEGMENT_Y + 13}
          textAnchor="middle"
          className="fill-foreground font-mono text-[7px] font-bold"
        >
          {labelB}
        </text>
      )}
    </svg>
  );
}
