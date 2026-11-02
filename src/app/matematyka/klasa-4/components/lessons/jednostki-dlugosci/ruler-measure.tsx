'use client';

import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

const PAD = 14;
const BAR_Y = 18;
const BAR_H = 20;
const TICK_TOP = BAR_Y + BAR_H + 6;
const LABEL_Y = TICK_TOP + 24;
const HEIGHT = LABEL_Y + 8;

export type MeasuredObjectShape = 'pencil' | 'key' | 'leaf';

/**
 * Rysuje przedmiot jego właściwym kształtem zamiast płaskiego paska — dziecko
 * ma mierzyć rozpoznawalny ołówek/klucz/liść, nie abstrakcyjny klocek. Każdy
 * kształt jest funkcją `lengthMm` (proporcje jako ułamki długości), więc rośnie
 * i kurczy się razem z prawdziwą długością przedmiotu zamiast być narysowany
 * "na oko" — ta sama dyscyplina co `roman.ts`/`place-value.ts`.
 */
function MeasuredObject({
  shape,
  x0,
  lengthMm,
  color,
}: {
  shape: MeasuredObjectShape;
  x0: number;
  lengthMm: number;
  color: string;
}): ReactNode {
  const secondary = `color-mix(in oklch, ${color} 32%, white)`;
  const cy = BAR_Y + BAR_H / 2;

  if (shape === 'pencil') {
    const eraserLen = lengthMm * 0.07;
    const tipLen = lengthMm * 0.13;
    const bodyLen = lengthMm - eraserLen - tipLen;
    return (
      <>
        <rect x={x0} y={BAR_Y} width={eraserLen} height={BAR_H} rx={2} fill={secondary} />
        <rect x={x0 + eraserLen} y={BAR_Y} width={bodyLen} height={BAR_H} fill={color} />
        <polygon
          points={`${x0 + eraserLen + bodyLen},${BAR_Y} ${x0 + eraserLen + bodyLen},${BAR_Y + BAR_H} ${x0 + lengthMm},${cy}`}
          fill={color}
        />
      </>
    );
  }

  if (shape === 'key') {
    const bowR = lengthMm * 0.22;
    const bowInnerR = bowR * 0.45;
    const cx = x0 + bowR;
    const shaftStart = x0 + bowR * 1.7;
    const teethLen = lengthMm * 0.22;
    const shaftEnd = x0 + lengthMm - teethLen;
    const shaftH = BAR_H * 0.34;
    const shaftY = cy - shaftH / 2;
    return (
      <>
        <path
          fillRule="evenodd"
          d={`M ${cx - bowR},${cy} a ${bowR},${bowR} 0 1,0 ${2 * bowR},0 a ${bowR},${bowR} 0 1,0 ${-2 * bowR},0 Z M ${cx - bowInnerR},${cy} a ${bowInnerR},${bowInnerR} 0 1,0 ${2 * bowInnerR},0 a ${bowInnerR},${bowInnerR} 0 1,0 ${-2 * bowInnerR},0 Z`}
          fill={color}
        />
        <rect x={shaftStart} y={shaftY} width={shaftEnd - shaftStart + teethLen} height={shaftH} fill={color} />
        <rect x={shaftEnd + teethLen * 0.15} y={cy} width={shaftH * 0.6} height={shaftH * 0.9} fill={color} />
        <rect x={shaftEnd + teethLen * 0.6} y={cy} width={shaftH * 0.6} height={shaftH * 0.6} fill={color} />
      </>
    );
  }

  // leaf
  const stemLen = lengthMm * 0.12;
  const bladeLen = lengthMm - stemLen;
  const bulge = BAR_H * 0.52;
  const bladeMid = x0 + stemLen + bladeLen * 0.38;
  return (
    <>
      <rect x={x0} y={cy - 1} width={stemLen} height={2} fill={secondary} />
      <path
        d={`M ${x0 + stemLen},${cy} Q ${bladeMid},${cy - bulge} ${x0 + lengthMm},${cy} Q ${bladeMid},${cy + bulge} ${x0 + stemLen},${cy} Z`}
        fill={color}
      />
      <line x1={x0 + stemLen} y1={cy} x2={x0 + lengthMm} y2={cy} stroke={secondary} strokeWidth={1} />
    </>
  );
}

interface RulerMeasureProps {
  color: string;
  /** Długość linijki w mm — stała dla wszystkich rund, żeby układ się nie przeskalowywał. */
  maxMm: number;
  /** Rzeczywista długość mierzonego przedmiotu (pasek zawsze zaczyna się od 0). */
  objectMm: number;
  /** Jaki kształt narysować na długości `objectMm` — patrz `MeasuredObject`. */
  shape: MeasuredObjectShape;
  /** Bieżące położenie suwmiarki w mm — komponent jest w pełni sterowany z zewnątrz. */
  value: number;
  onChange: (mm: number) => void;
  /** Po zatwierdzeniu poprawnego pomiaru blokuje dalsze przeciąganie. */
  locked?: boolean;
}

/**
 * Linijka z przeciąganą suwmiarką — widget symulujący prawdziwy przyrząd
 * pomiarowy, w odróżnieniu od `ArrayGrid` (przeciąganie dzieli powierzchnię)
 * czy `PowerDial` (przeciąganie wybiera z dyskretnych, zatrzaskujących się
 * pozycji). Tu przeciąganie ma jeden cel: zrównać suwmiarkę z krawędzią
 * narysowanego przedmiotu, dokładnie jak w realnym mierzeniu linijką.
 * `viewBox` w milimetrach (1 jednostka SVG = 1 mm), więc linijka i przedmiot
 * są piksel-w-piksel spójne niezależnie od szerokości ekranu — ten sam trik
 * co `roman.ts`/`place-value.ts`: geometria wynika wprost z liczb, nic nie
 * jest narysowane "na oko".
 */
export function RulerMeasure({
  color,
  maxMm,
  objectMm,
  shape,
  value,
  onChange,
  locked,
}: RulerMeasureProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const width = maxMm + PAD * 2;

  const mmFromEvent = (clientX: number): number => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return value;
    const scale = width / rect.width;
    const localX = (clientX - rect.left) * scale - PAD;
    return Math.min(maxMm, Math.max(0, Math.round(localX)));
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGCircleElement>) => {
    if (locked) return;
    (event.target as Element).setPointerCapture?.(event.pointerId);
    onChange(mmFromEvent(event.clientX));
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGCircleElement>) => {
    if (locked || event.buttons === 0) return;
    onChange(mmFromEvent(event.clientX));
  };

  const ticks = Array.from({ length: maxMm + 1 }, (_, mm) => mm);
  const caliperX = PAD + value;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${HEIGHT}`}
      className="mx-auto h-auto w-full max-w-xl"
      role="img"
      aria-label={`Linijka do ${maxMm} milimetrów z przeciąganą suwmiarką, obecny pomiar ${value} mm`}
    >
      {/* Mierzony przedmiot — kształt właściwy dla `shape`, długości dokładnie objectMm */}
      <MeasuredObject shape={shape} x0={PAD} lengthMm={objectMm} color={color} />

      {/* Kreski linijki: co 1 mm krótka, co 5 mm średnia, co 10 mm (1 cm) długa + opis.
          Font w jednostkach viewBoxa (mm), nie w CSS px, więc rozstaw etykiet musi
          zostawiać miejsce na dwie cyfry (do „20") w 10-jednostkowej szczelinie
          między kreskami centymetrowymi — stąd celowo mały rozmiar czcionki. */}
      {ticks.map((mm) => {
        const isCm = mm % 10 === 0;
        const is5 = mm % 5 === 0;
        const h = isCm ? 16 : is5 ? 11 : 6;
        return (
          <g key={mm}>
            <line
              x1={PAD + mm}
              y1={TICK_TOP}
              x2={PAD + mm}
              y2={TICK_TOP + h}
              stroke="currentColor"
              strokeOpacity={isCm ? 0.75 : 0.4}
              strokeWidth={isCm ? 1.4 : 1}
            />
            {isCm && (
              <text
                x={PAD + mm}
                y={LABEL_Y}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[5px]"
              >
                {mm / 10}
              </text>
            )}
          </g>
        );
      })}

      {/* Suwmiarka — pionowa kreska + uchwyt do przeciągania */}
      <line
        x1={caliperX}
        y1={BAR_Y - 4}
        x2={caliperX}
        y2={TICK_TOP + 16}
        stroke={locked ? '#16a34a' : color}
        strokeWidth={2}
        strokeDasharray={locked ? undefined : '3 3'}
      />
      <circle
        cx={caliperX}
        cy={BAR_Y - 4}
        r={locked ? 7 : 9}
        fill={locked ? '#16a34a' : color}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        style={{ cursor: locked ? 'default' : 'ew-resize', touchAction: 'none' }}
      />
    </svg>
  );
}
