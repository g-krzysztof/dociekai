'use client';

import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { motion } from 'framer-motion';
import { Check, Minus, Plus } from 'lucide-react';
import { AREA_UNITS, areaUnitSideMm, convertArea, formatArea } from '../../../lib/area-units';
import { WORLD_CAPTIONS, WORLD_SCENES } from './world-scenes';

const MIN_Z = 0;
const MAX_Z = AREA_UNITS.length - 1;
/** Kamera startuje na metrze kwadratowym — jedynej jednostce, którą dziecko już gdzieś słyszało. */
const START_Z = 3;
/** Ułamek szerokości kadru zajmowany przez kwadrat jednostkowy, gdy kamera stoi „u siebie”. */
const HOME_FRACTION = 0.5;
const ASPECT = 0.75;
/** Wspólny róg wszystkich kwadratów — trzymany w stałym punkcie kadru, żeby zagnieżdżenie było widoczne. */
const CORNER_X = 0.27;
const CORNER_Y = 0.84;

const round3 = (value: number): number => Math.round(value * 1000) / 1000;
const clampZ = (value: number): number => Math.min(MAX_Z, Math.max(MIN_Z, value));
const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/** Szerokość kadru w milimetrach. Jeden szczebel drabinki = jedna dekada kamery. */
const viewWidthMm = (z: number): number => 10 ** z / HOME_FRACTION;

/** Szerokość kadru wyrażona w jednostce, która daje wygodną liczbę — to samo, czego uczy lekcja. */
function frameWidthLabel(viewW: number): string {
  if (viewW < 10) return `${round3(viewW).toLocaleString('pl-PL')} mm`;
  if (viewW < 1000) return `${Math.round(viewW / 10).toLocaleString('pl-PL')} cm`;
  if (viewW < 1_000_000) return `${Math.round(viewW / 1000).toLocaleString('pl-PL')} m`;
  return `${(Math.round(viewW / 100) / 10_000).toLocaleString('pl-PL')} km`;
}

interface ZoomOutWorldProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Kamera „o dekadę dalej”: jedno przeciągnięcie odsuwa widok od łebka szpilki aż
 * po kwadrat o boku kilometra, a wszystkie siedem kwadratów jednostkowych stoi
 * przez cały czas w tym samym rogu, jeden w drugim. Dziecko nie dostaje tabelki
 * z przelicznikami — widzi, że m² jest setną częścią ara dokładnie tak, jak ar
 * jest setną częścią hektara, bo za każdym razem patrzy na ten sam obrazek z
 * innej odległości.
 *
 * Czym różni się od tego, co już jest w kursie:
 * - `SquareUnitZoom` (przewodnik „Jednostki pola”) **dzieli** jeden nieruchomy
 *   kwadrat na k·k kratek — kamera stoi, zmienia się rysunek.
 * - `ZoomSplitStrip` (przewodnik „Zapis dziesiętny”) skacze **dyskretnie** i za
 *   każdym razem powiększa fragment poprzedniego rysunku.
 * - Tutaj rysunek jest jeden i nieruchomy (świat opisany w milimetrach), a rusza
 *   się wyłącznie kamera — płynnie, w obie strony. To pierwszy widżet kursu, w
 *   którym skala jest sterowana wprost, a nie odtwarzana krok po kroku.
 *
 * Cała geometria jest czystą funkcją `z` (pozycji suwaka), więc SSR i pierwsza
 * klatka klienta dają identyczny DOM, a Playwright może asertować `opacity`
 * dowolnego elementu bez czekania na animację.
 */
export function ZoomOutWorld({ color, onComplete }: ZoomOutWorldProps) {
  const [z, setZ] = useState(START_Z);
  const [visited, setVisited] = useState<number[]>([START_Z]);
  const [done, setDone] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const apply = (next: number) => {
    const clamped = clampZ(next);
    setZ(clamped);

    const level = Math.round(clamped);
    if (Math.abs(clamped - level) > 0.2 || visited.includes(level)) return;

    const nextVisited = [...visited, level];
    setVisited(nextVisited);
    if (nextVisited.length === AREA_UNITS.length && !done) {
      setDone(true);
      onComplete?.();
    }
  };

  const fromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    apply(((event.clientX - rect.left) / rect.width) * MAX_Z);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    fromPointer(event);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    fromPointer(event);
  };

  const stopDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = {
      ArrowRight: 0.5,
      ArrowUp: 0.5,
      ArrowLeft: -0.5,
      ArrowDown: -0.5,
    };
    if (event.key === 'Home') {
      event.preventDefault();
      apply(MIN_Z);
      return;
    }
    if (event.key === 'End') {
      event.preventDefault();
      apply(MAX_Z);
      return;
    }
    const delta = steps[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    apply(z + delta);
  };

  const viewW = viewWidthMm(z);
  const viewH = viewW * ASPECT;
  const viewBox = [
    round3(-CORNER_X * viewW),
    round3(-CORNER_Y * viewH),
    round3(viewW),
    round3(viewH),
  ].join(' ');

  const nearest = Math.round(z);
  const unit = AREA_UNITS[nearest];
  const previous = AREA_UNITS[nearest - 1];
  const beforePrevious = AREA_UNITS[nearest - 2];
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="border bg-white dark:bg-zinc-900/80">
      {/* Kadr */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#fbfaf7] text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
        <svg
          viewBox={viewBox}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label={`Widok świata z odległości, przy której kadr ma ${frameWidthLabel(viewW)} szerokości`}
        >
          {/* Wypełnienia kwadratów idą POD rekwizyty, żeby ich nie przebarwiały. */}
          {AREA_UNITS.map((areaUnit, index) => {
            const side = areaUnitSideMm(index);
            if (side / viewW > 4) return null;
            const closeness = clamp01(1 - Math.abs(z - index));
            if (closeness <= 0.01) return null;
            return (
              <rect
                key={`fill-${areaUnit.code}`}
                x={0}
                y={round3(-side)}
                width={round3(side)}
                height={round3(side)}
                fill={color}
                fillOpacity={round3(closeness * 0.12)}
              />
            );
          })}

          {/* Rekwizyty — każdy pojawia się przy swoim szczeblu i gaśnie przy sąsiednim. */}
          {WORLD_SCENES.map((Scene, index) => {
            const opacity = clamp01(1 - Math.abs(z - index));
            if (opacity <= 0.01) return null;
            return (
              <g key={AREA_UNITS[index].code} opacity={round3(opacity)} data-scene={AREA_UNITS[index].code}>
                <Scene side={areaUnitSideMm(index)} />
              </g>
            );
          })}

          {/* Obrysy kwadratów — nad rekwizytami, żeby zagnieżdżenie było widoczne także na scenie. */}
          {AREA_UNITS.map((areaUnit, index) => {
            const side = areaUnitSideMm(index);
            const fraction = side / viewW;
            if (fraction > 4) return null;
            const opacity = clamp01((Math.log10(fraction) + 2.4) / 0.6);
            if (opacity <= 0.01) return null;
            const closeness = clamp01(1 - Math.abs(z - index));
            return (
              <rect
                key={areaUnit.code}
                data-square={areaUnit.code}
                x={0}
                y={round3(-side)}
                width={round3(side)}
                height={round3(side)}
                fill="none"
                stroke={color}
                strokeOpacity={round3(opacity)}
                strokeWidth={round3(1 + closeness * 1.6)}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

        </svg>

        {/*
          Podpis kwadratu jest HTML-em, nie `<text>` w SVG: font-size wyrażony w
          jednostkach `viewBox` przy kadrze o szerokości 2 000 000 wpadał w limit
          maksymalnego rozmiaru czcionki przeglądarki i podpis „1 km²” malał do
          kilku pikseli. Pozycję liczymy z tej samej geometrii co kwadrat.
        */}
        <p
          className="pointer-events-none absolute font-mono text-base font-bold sm:text-xl"
          style={{
            color,
            left: `${CORNER_X * 100}%`,
            top: `${Math.max(2, (CORNER_Y - areaUnitSideMm(nearest) / viewH) * 100)}%`,
            transform: 'translateY(-115%)',
            opacity: round3(clamp01(1 - Math.abs(z - nearest) * 1.6)),
          }}
        >
          1 {unit.code}
        </p>

        <p className="absolute bottom-2 right-3 font-mono text-[11px] tabular-nums text-muted-foreground sm:text-xs">
          szerokość kadru: {frameWidthLabel(viewW)}
        </p>
      </div>

      {/* Suwak kamery */}
      <div className="border-t px-4 pb-3 pt-1 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => apply(Math.ceil(z - 1e-6) - 1)}
            disabled={z <= MIN_Z}
            aria-label="Przybliż o jeden szczebel"
            className="shrink-0 border p-2 transition-colors disabled:opacity-30"
            style={{ borderColor: `${color}59`, color }}
          >
            <Minus className="h-4 w-4" aria-hidden />
          </button>

          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label="Jak daleko odsuwa się kamera"
            aria-valuemin={MIN_Z}
            aria-valuemax={MAX_Z}
            aria-valuenow={round3(z)}
            aria-valuetext={`1 ${unit.code} — ${unit.name}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            onKeyDown={onKeyDown}
            className="relative w-full cursor-grab touch-none select-none py-9 active:cursor-grabbing"
          >
            <div className="h-1.5 w-full" style={{ backgroundColor: `${color}24` }} />
            <div
              className="absolute top-1/2 h-1.5 -translate-y-1/2"
              style={{ backgroundColor: color, width: `${(z / MAX_Z) * 100}%` }}
            />
            {AREA_UNITS.map((areaUnit, index) => (
              <span
                key={areaUnit.code}
                className="pointer-events-none absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                style={{ left: `${(index / MAX_Z) * 100}%` }}
              >
                <span
                  className="h-3 w-0.5"
                  style={{ backgroundColor: visited.includes(index) ? color : `${color}4d` }}
                />
                <span
                  className="absolute top-4 whitespace-nowrap font-mono text-[10px] font-semibold tabular-nums sm:text-[11px]"
                  style={{ color: visited.includes(index) ? textColor : undefined }}
                >
                  {areaUnit.code}
                </span>
              </span>
            ))}
            <motion.span
              layout
              className="pointer-events-none absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 border-2 bg-white shadow-sm dark:bg-zinc-900"
              style={{ left: `${(z / MAX_Z) * 100}%`, borderColor: color }}
            />
          </div>

          <button
            type="button"
            onClick={() => apply(Math.floor(z + 1e-6) + 1)}
            disabled={z >= MAX_Z}
            aria-label="Oddal o jeden szczebel"
            className="shrink-0 border p-2 transition-colors disabled:opacity-30"
            style={{ borderColor: `${color}59`, color }}
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Odczyt */}
      <div className="grid gap-4 border-t p-4 sm:p-6 md:grid-cols-[auto_1fr] md:items-center md:gap-8">
        <div>
          <p
            className="font-mono text-4xl font-bold leading-none tabular-nums sm:text-5xl"
            style={{ color }}
          >
            1 {unit.code}
          </p>
          <p className="mt-1 text-sm font-semibold" style={{ color: textColor }}>
            {unit.name}
          </p>
          <p className="text-sm text-muted-foreground">kwadrat o boku {unit.side}</p>
        </div>
        <div>
          <p className="text-sm leading-relaxed sm:text-base">W kadrze: {WORLD_CAPTIONS[nearest]}.</p>
          {previous ? (
            <p
              className="mt-2 font-mono text-sm font-semibold tabular-nums sm:text-base"
              style={{ color: textColor }}
            >
              1 {unit.code} = {formatArea(convertArea(1, unit.code, previous.code))} {previous.code}
              {beforePrevious
                ? ` = ${formatArea(convertArea(1, unit.code, beforePrevious.code))} ${beforePrevious.code}`
                : ''}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Najmniejsza jednostka pola, jakiej używamy — mniejszej po prostu nie ma potrzeby.
            </p>
          )}
        </div>
      </div>

      {/* Postęp zwiedzania */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 text-sm sm:px-6"
        style={{ backgroundColor: done ? `${color}12` : undefined }}
      >
        {done ? (
          <p className="flex items-center gap-2 font-semibold" style={{ color: textColor }}>
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Zwiedzone wszystkie siedem szczebli — od łebka szpilki po kilometr kwadratowy.
          </p>
        ) : (
          <p className="text-muted-foreground">
            Przeciągnij suwak w obie strony i zatrzymaj się na każdym szczeblu.
          </p>
        )}
        <p className="font-mono text-sm tabular-nums" style={{ color: textColor }}>
          {visited.length}/{AREA_UNITS.length}
        </p>
      </div>

      {/* Ta sama treść dla czytnika ekranu i wyszukiwarki — kadr jest tylko rysunkiem. */}
      <ul className="sr-only">
        {AREA_UNITS.map((areaUnit, index) => (
          <li key={areaUnit.code}>
            1 {areaUnit.code} ({areaUnit.name}) to kwadrat o boku {areaUnit.side} —{' '}
            {WORLD_CAPTIONS[index]}.
          </li>
        ))}
      </ul>
    </div>
  );
}
