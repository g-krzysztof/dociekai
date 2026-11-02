'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '../../../lib/plural';
import { zoomArea, type SquareZoomCase } from '../../../lib/area-units';

const VIEW = 480;
/** Lewy górny róg i bok dużego kwadratu w jednostkach `viewBox`. */
const ORIGIN = 40;
const SIDE = 400;
/** Tor suwaka nad kwadratem. */
const TRACK_Y = 22;
const MAX_PARTS = 10;

interface SquareUnitZoomProps {
  item: SquareZoomCase;
  color: string;
  /** Wywoływane raz, gdy dziecko dojdzie do pełnego podziału (bok na `sideRatio` części). */
  onReachTarget?: () => void;
}

/**
 * Sedno przewodnika w jednym ruchu: **jedno pokrętło steruje BOKIEM, a odczyt
 * rośnie jak kwadrat.** Dziecko przeciąga uchwyt „na ile części dzielę bok”, a
 * duży kwadrat natychmiast rozpada się na `k · k` kratek — licznik idzie
 * 1, 4, 9, 16… 100, nigdy 1, 2, 3. To jest cała odpowiedź na pytanie, dlaczego
 * jednostki pola dzieli 100, a nie 10, i widać ją, zanim padnie zdanie.
 *
 * Odróżnia się od `ArrayGrid` z modułu 1 (tam wiersze i kolumny ustawiało się
 * niezależnie — tu jedno sterowanie zmienia oba naraz, bo to właśnie jest
 * treścią) i od `ZoomSplitStrip` z przewodnika o zapisie dziesiętnym (tam każdy
 * krok powiększał FRAGMENT poprzedniego rysunku; tu cały czas patrzysz na ten
 * sam kwadrat).
 *
 * Sterowanie: przeciąganie po torze (pointer events na samym `<svg>` +
 * `setPointerCapture`, `touch-none`), przyciski ± i strzałki klawiatury
 * (`role="slider"`). Wartość jest liczbą całkowitą 1…10, więc stan zostaje
 * deterministyczny i identyczny po stronie serwera i klienta.
 */
export function SquareUnitZoom({ item, color, onReachTarget }: SquareUnitZoomProps) {
  const [parts, setParts] = useState(1);
  const [reached, setReached] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const cells = parts * parts;
  const target = item.sideRatio;
  const targetCells = zoomArea(item);

  const apply = (next: number) => {
    const clamped = Math.min(MAX_PARTS, Math.max(1, Math.round(next)));
    setParts(clamped);
    if (clamped === target && !reached) {
      setReached(true);
      onReachTarget?.();
    }
  };

  const partsFromEvent = (event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return null;
    const x = ((event.clientX - rect.left) / rect.width) * VIEW;
    const ratio = (x - ORIGIN) / SIDE;
    return 1 + ratio * (MAX_PARTS - 1);
  };

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    dragging.current = true;
    svgRef.current?.setPointerCapture(event.pointerId);
    const next = partsFromEvent(event);
    if (next !== null) apply(next);
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const next = partsFromEvent(event);
    if (next !== null) apply(next);
  };

  const endDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    dragging.current = false;
    svgRef.current?.releasePointerCapture?.(event.pointerId);
  };

  const step = SIDE / parts;
  const knobX = ORIGIN + ((parts - 1) / (MAX_PARTS - 1)) * SIDE;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{item.story}</p>

      <div
        role="slider"
        tabIndex={0}
        aria-label={`Na ile równych części dzielisz bok kwadratu o polu 1 ${item.bigUnit}`}
        aria-valuemin={1}
        aria-valuemax={MAX_PARTS}
        aria-valuenow={parts}
        aria-valuetext={`bok podzielony na ${parts}, kratek ${cells}`}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault();
            apply(parts + 1);
          }
          if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault();
            apply(parts - 1);
          }
        }}
        className="mx-auto w-full max-w-[440px] outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ ['--tw-ring-color' as string]: color }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW} ${VIEW + 20}`}
          className="h-auto w-full cursor-ew-resize touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          role="presentation"
        >
          {/* Pełnowymiarowy, praktycznie niewidoczny cel — żeby przerwy między
              elementami też łapały przeciąganie (ten sam trik co `CutListTape`). */}
          <rect x={0} y={0} width={VIEW} height={VIEW + 20} fill="#fff" fillOpacity={0.001} />

          {/* Tor suwaka */}
          <line
            x1={ORIGIN}
            y1={TRACK_Y}
            x2={ORIGIN + SIDE}
            y2={TRACK_Y}
            stroke={color}
            strokeOpacity={0.28}
            strokeWidth={4}
            strokeLinecap="round"
          />
          {Array.from({ length: MAX_PARTS }, (_, i) => {
            const x = ORIGIN + (i / (MAX_PARTS - 1)) * SIDE;
            return (
              <circle
                key={i}
                cx={x}
                cy={TRACK_Y}
                r={i + 1 === parts ? 0 : 3}
                fill={color}
                fillOpacity={0.35}
              />
            );
          })}
          <motion.g animate={{ x: knobX }} initial={false} transition={{ type: 'spring', stiffness: 320, damping: 28 }}>
            <circle cx={0} cy={TRACK_Y} r={13} fill={color} />
            <circle cx={0} cy={TRACK_Y} r={5} fill="#fff" fillOpacity={0.85} />
          </motion.g>

          {/* Kratki — jedno sterowanie, dwa wymiary naraz */}
          <g>
            {Array.from({ length: cells }, (_, i) => {
              const row = Math.floor(i / parts);
              const col = i % parts;
              return (
                <motion.rect
                  key={`${parts}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.18, delay: Math.min(0.3, (row + col) * 0.012) }}
                  x={ORIGIN + col * step}
                  y={ORIGIN + 20 + row * step}
                  width={step}
                  height={step}
                  fill={color}
                  fillOpacity={0.16}
                  stroke={color}
                  strokeOpacity={0.55}
                  strokeWidth={1.5}
                />
              );
            })}
          </g>

          {/* Obrys całego kwadratu — niezmiennik, nie drgnie przez całą rundę */}
          <rect
            x={ORIGIN}
            y={ORIGIN + 20}
            width={SIDE}
            height={SIDE}
            fill="none"
            stroke={color}
            strokeWidth={5}
          />

          {/* Znaczniki podziału boku — pokazują, że to BOK jest dzielony */}
          <g stroke={color} strokeWidth={3} strokeLinecap="round">
            {Array.from({ length: parts + 1 }, (_, i) => (
              <line
                key={`tick-${i}`}
                x1={ORIGIN + i * step}
                y1={ORIGIN + 8}
                x2={ORIGIN + i * step}
                y2={ORIGIN + 20}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Sterowanie krokowe */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => apply(parts - 1)}
          disabled={parts <= 1}
          aria-label="Podziel bok na mniej części"
          className="flex h-9 w-9 cursor-pointer items-center justify-center border transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <p className="text-sm text-muted-foreground">
          Bok podzielony na{' '}
          <span className="font-mono text-base font-bold tabular-nums" style={{ color }}>
            {parts}
          </span>{' '}
          {plural(parts, { one: 'część', few: 'części', many: 'części' })}
        </p>
        <button
          type="button"
          onClick={() => apply(parts + 1)}
          disabled={parts >= MAX_PARTS}
          aria-label="Podziel bok na więcej części"
          className="flex h-9 w-9 cursor-pointer items-center justify-center border transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* Odczyt: bok rośnie o 1, pole skacze o kwadrat */}
      <div
        className="mt-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 border-t-2 p-3"
        style={{ borderColor: color, backgroundColor: `${color}0f` }}
      >
        <span className="font-mono text-lg font-bold tabular-nums" style={{ color }}>
          {parts} · {parts} =
        </span>
        <span
          className="font-mono text-3xl font-bold leading-none tabular-nums"
          style={{ color }}
          data-cells={cells}
        >
          {cells}
        </span>
        <span className="text-sm text-muted-foreground">
          {plural(cells, { one: 'kratka', few: 'kratki', many: 'kratek' })} po 1 {item.smallUnit}
        </span>
      </div>

      <p
        className={cn(
          'mt-3 text-center text-sm leading-relaxed transition-opacity',
          parts === target ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden={parts !== target}
      >
        <Sparkles className="mr-1 inline h-4 w-4 align-[-2px]" style={{ color }} aria-hidden />
        Bok wydłużył się <strong>{target} razy</strong>, a pole urosło{' '}
        <strong>{targetCells} razy</strong>. Czyli{' '}
        <strong style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}>
          1 {item.bigUnit} = {targetCells} {item.smallUnit}
        </strong>
        .
      </p>

      {/* Treść odsłaniana ruchem musi istnieć w DOM zawsze — SEO i czytniki ekranu. */}
      <p className="sr-only">
        Kwadrat o boku podzielonym na {target} części ma {targetCells} kratek, więc 1 {item.bigUnit}{' '}
        = {targetCells} {item.smallUnit}.
      </p>
    </div>
  );
}
