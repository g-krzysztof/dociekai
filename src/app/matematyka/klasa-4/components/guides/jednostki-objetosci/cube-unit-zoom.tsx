'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { motion } from 'framer-motion';
import { Layers, Minus, Package, Plus } from 'lucide-react';
import { plural } from '../../../lib/plural';
import { round3 } from '../../../lib/solids';
import { zoomLayer, zoomVolume, type CubeZoomCase } from '../../../lib/volume-units';

/** Krawędź dużego sześcianu w jednostkach `viewBox`. Sam sześcian NIE zmienia
 *  rozmiaru — to jest 1 dm³ i ma zostać tą samą bryłą przez całą rundę; zmienia
 *  się wyłącznie to, na ile części dzielimy jego bok. */
const E = 118;
/** Ile dodatkowej wysokości (w krawędziach sześcianu) zajmują rozsunięte warstwy.
 *  Stała, niezależna od liczby warstw — dzięki temu kadr nigdy nie skacze. */
const EXTRA = 0.5;
const MAX_PARTS = 10;

const TRACK_Y = -(1 + EXTRA) * E - 34;
const VIEW_X = -(E + 16);
const VIEW_W = 2 * (E + 16);
const VIEW_Y = TRACK_Y - 18;
const VIEW_H = E + 16 - VIEW_Y;

interface Pt {
  x: number;
  y: number;
}

/**
 * Rzut izometryczny 2:1 — ten sam co w `IsoCube` z modułu 1, tylko na
 * współrzędnych ułamkowych (0–1 wzdłuż każdej krawędzi), bo tu sześcian ma stały
 * rozmiar, a zmienia się gęstość podziału.
 */
function P(u: number, v: number, w: number): Pt {
  return { x: round3((u - w) * E), y: round3((u + w) * (E / 2) - v * E) };
}

const poly = (points: Pt[]): string => points.map((p) => `${p.x},${p.y}`).join(' ');

const strokeOf = (color: string): string => `color-mix(in oklch, ${color} 85%, black)`;

/** Sześciokątny zarys całej bryły plus trzy krawędzie zbiegające się w narożniku
 *  najbliżej patrzącego — to one każą czytać rysunek jako sześcian, a nie jako
 *  stos naleśników. Rysowane tylko przy złożonych warstwach. */
const SILHOUETTE = poly([P(0, 1, 0), P(1, 1, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1), P(0, 1, 1)]);
const FRONT_CORNER = P(1, 1, 1);
const FRONT_EDGES: Pt[] = [P(0, 1, 1), P(1, 1, 0), P(1, 0, 1)];

interface CubeUnitZoomProps {
  item: CubeZoomCase;
  color: string;
  /** Wywoływane raz, gdy dziecko dojdzie do pełnego podziału boku. */
  onReachTarget?: () => void;
}

/**
 * Sedno przewodnika w jednym ruchu: **jedno pokrętło steruje BOKIEM, a odczyt
 * rośnie jak sześcian.** Dziecko przeciąga uchwyt „na ile części dzielę bok”,
 * a sześcian natychmiast rozpada się na `k · k · k` kostek — licznik idzie
 * 1, 8, 27, 64… 1000, nigdy 1, 2, 3.
 *
 * Drugie sterowanie — **rozsuwanie warstw** — jest tym, czego nie dało się
 * pokazać w płaskim `SquareUnitZoom` z przewodnika o jednostkach pola: sześcian
 * rozjeżdża się na `k` naleśników, każdy po `k²` kostek, więc `k³` przestaje być
 * wzorem, a staje się widokiem „tyle w warstwie, tyle warstw”. Rozsunięcie to
 * czysty `translate` w osi ekranu (podniesienie o `lift` krawędzi = przesunięcie
 * o `−lift · E` px), więc geometria warstwy zależy wyłącznie od `k` i nie musi
 * być liczona dwa razy.
 *
 * Kadr jest liczony raz, z najwyższego możliwego przypadku (warstwy rozsunięte
 * na `1 + EXTRA` krawędzi), więc ani zmiana `k`, ani rozsunięcie nie
 * przeskalowują rysunku.
 *
 * Sterowanie: przeciąganie po torze (pointer events na całym `<svg>` +
 * `setPointerCapture`, `touch-none`), przyciski ± i strzałki klawiatury
 * (`role="slider"`). Wartość to liczba całkowita 1…10, więc stan jest
 * deterministyczny i identyczny po stronie serwera i klienta.
 */
export function CubeUnitZoom({ item, color, onReachTarget }: CubeUnitZoomProps) {
  const [parts, setParts] = useState(1);
  const [exploded, setExploded] = useState(false);
  const [reached, setReached] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const layer = parts * parts;
  const cubes = layer * parts;
  const target = item.sideRatio;
  const targetLayer = zoomLayer(item);
  const targetCubes = zoomVolume(item);

  const apply = (next: number) => {
    const clamped = Math.min(MAX_PARTS, Math.max(1, Math.round(next)));
    setParts(clamped);
    if (clamped === 1) setExploded(false);
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
    const x = VIEW_X + ((event.clientX - rect.left) / rect.width) * VIEW_W;
    const ratio = (x + E) / (2 * E);
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

  const knobX = -E + ((parts - 1) / (MAX_PARTS - 1)) * 2 * E;
  const gap = parts > 1 ? EXTRA / (parts - 1) : 0;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{item.story}</p>

      <div
        role="slider"
        tabIndex={0}
        aria-label={`Na ile równych części dzielisz krawędź sześcianu o objętości 1 ${item.bigUnit}`}
        aria-valuemin={1}
        aria-valuemax={MAX_PARTS}
        aria-valuenow={parts}
        aria-valuetext={`krawędź podzielona na ${parts}, kostek ${cubes}`}
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
        className="mx-auto w-full max-w-[420px] outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ ['--tw-ring-color' as string]: color }}
      >
        <svg
          ref={svgRef}
          viewBox={`${VIEW_X} ${VIEW_Y} ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full cursor-ew-resize touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          role="presentation"
        >
          {/* Pełnowymiarowy, praktycznie niewidoczny cel — żeby przerwy między
              warstwami też łapały przeciąganie (ten sam trik co w `SquareUnitZoom`). */}
          <rect
            x={VIEW_X}
            y={VIEW_Y}
            width={VIEW_W}
            height={VIEW_H}
            fill="#fff"
            fillOpacity={0.001}
          />

          {/* Tor suwaka */}
          <line
            x1={-E}
            y1={TRACK_Y}
            x2={E}
            y2={TRACK_Y}
            stroke={color}
            strokeOpacity={0.28}
            strokeWidth={4}
            strokeLinecap="round"
          />
          {Array.from({ length: MAX_PARTS }, (_, i) => (
            <circle
              key={i}
              cx={round3(-E + (i / (MAX_PARTS - 1)) * 2 * E)}
              cy={TRACK_Y}
              r={i + 1 === parts ? 0 : 3}
              fill={color}
              fillOpacity={0.35}
            />
          ))}
          <motion.g
            animate={{ x: knobX }}
            initial={false}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <circle cx={0} cy={TRACK_Y} r={13} fill={color} />
            <circle cx={0} cy={TRACK_Y} r={5} fill="#fff" fillOpacity={0.85} />
          </motion.g>

          {/* Warstwy od dołu do góry — malarsko, więc wyższa zasłania niższą */}
          {Array.from({ length: parts }, (_, i) => (
            <Slab
              key={`${parts}-${i}`}
              index={i}
              parts={parts}
              color={color}
              lift={exploded ? i * gap : 0}
              showTop={exploded || i === parts - 1}
              outlined={exploded}
            />
          ))}

          {/* Złożony sześcian ma jeden mocny obrys zamiast `parts` mocnych szwów
              między warstwami — inaczej poziome kreski czytają się grubiej niż
              pionowe i bryła wygląda jak stos, a nie jak podzielony sześcian. */}
          {!exploded && (
            <g
              fill="none"
              stroke={strokeOf(color)}
              strokeWidth={1.6}
              strokeLinejoin="round"
              strokeLinecap="round"
            >
              <polygon points={SILHOUETTE} />
              {FRONT_EDGES.map((end) => (
                <line
                  key={`${end.x}-${end.y}`}
                  x1={FRONT_CORNER.x}
                  y1={FRONT_CORNER.y}
                  x2={end.x}
                  y2={end.y}
                />
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* Sterowanie krokowe */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
        <button
          type="button"
          onClick={() => apply(parts - 1)}
          disabled={parts <= 1}
          aria-label="Podziel krawędź na mniej części"
          className="flex h-9 w-9 cursor-pointer items-center justify-center border transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <p className="text-sm text-muted-foreground">
          Krawędź podzielona na{' '}
          <span className="font-mono text-base font-bold tabular-nums" style={{ color }}>
            {parts}
          </span>{' '}
          {plural(parts, { one: 'część', few: 'części', many: 'części' })}
        </p>
        <button
          type="button"
          onClick={() => apply(parts + 1)}
          disabled={parts >= MAX_PARTS}
          aria-label="Podziel krawędź na więcej części"
          className="flex h-9 w-9 cursor-pointer items-center justify-center border transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={() => setExploded((prev) => !prev)}
          disabled={parts <= 1}
          className="inline-flex cursor-pointer items-center gap-2 border px-3 py-2 text-sm font-semibold transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10"
          style={exploded ? { borderColor: color, color } : undefined}
        >
          {exploded ? (
            <Package className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <Layers className="h-4 w-4 shrink-0" aria-hidden />
          )}
          {exploded ? 'Złóż warstwy z powrotem' : 'Rozsuń na warstwy'}
        </button>
      </div>

      {/* Odczyt: krawędź rośnie o 1, objętość skacze o sześcian */}
      <div
        className="mt-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 border-t-2 p-3"
        style={{ borderColor: color, backgroundColor: `${color}0f` }}
      >
        <span className="font-mono text-lg font-bold tabular-nums" style={{ color }}>
          {parts} · {parts} · {parts} =
        </span>
        <span
          className="font-mono text-3xl font-bold leading-none tabular-nums"
          style={{ color }}
          data-cubes={cubes}
        >
          {cubes}
        </span>
        <span className="text-sm text-muted-foreground">
          {plural(cubes, { one: 'kostka', few: 'kostki', many: 'kostek' })} po 1 {item.smallUnit}
        </span>
      </div>

      <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">
        {parts === 1 ? (
          <>Przesuń uchwyt w prawo — albo użyj przycisków ＋ i −.</>
        ) : (
          <>
            W jednej warstwie{' '}
            <strong className="font-mono tabular-nums" style={{ color }}>
              {parts} · {parts} = {layer}
            </strong>{' '}
            {plural(layer, { one: 'kostka', few: 'kostki', many: 'kostek' })}, a warstw jest{' '}
            <strong className="font-mono tabular-nums" style={{ color }}>
              {parts}
            </strong>
            .
          </>
        )}
      </p>

      <p className="sr-only">
        Sześcian o objętości 1 {item.bigUnit} ma krawędź {target} razy dłuższą od krawędzi kostki o
        objętości 1 {item.smallUnit}. Mieści {targetLayer} takich kostek w jednej warstwie i {target}{' '}
        warstw, czyli razem {targetCubes} kostek.
      </p>
    </div>
  );
}

interface SlabProps {
  index: number;
  parts: number;
  color: string;
  /** Podniesienie warstwy w krawędziach sześcianu (0 = warstwy stykają się). */
  lift: number;
  /** Górna ścianka rysuje się tylko tam, gdzie naprawdę ją widać — przy złożonym
   *  sześcianie to wyłącznie warstwa najwyższa. */
  showTop: boolean;
  /** Czy warstwa niesie własny mocny obrys. Przy złożonym sześcianie obrys robi
   *  jedna wspólna sylwetka, a szwy między warstwami zostają cienkie jak siatka. */
  outlined: boolean;
}

/** Jedna pozioma warstwa sześcianu: trzy widoczne ścianki plus kreski podziału. */
function Slab({ index, parts, color, lift, showTop, outlined }: SlabProps) {
  const v0 = index / parts;
  const v1 = (index + 1) / parts;
  const cuts = Array.from({ length: parts + 1 }, (_, j) => j / parts);

  const topFill = `color-mix(in oklch, ${color} 22%, white)`;
  const rightFill = `color-mix(in oklch, ${color} 45%, white)`;
  const leftFill = `color-mix(in oklch, ${color} 68%, white)`;
  const line = strokeOf(color);
  const edgeWidth = outlined ? 1.4 : 0.7;
  const edgeOpacity = outlined ? 1 : 0.45;

  return (
    <motion.g
      animate={{ y: round3(-lift * E) }}
      initial={false}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
    >
      {/* Ścianka lewa (w = 1) i prawa (u = 1) — obie zwrócone do patrzącego */}
      <polygon
        points={poly([P(0, v1, 1), P(1, v1, 1), P(1, v0, 1), P(0, v0, 1)])}
        fill={leftFill}
        stroke={line}
        strokeWidth={edgeWidth}
        strokeOpacity={edgeOpacity}
        strokeLinejoin="round"
      />
      <polygon
        points={poly([P(1, v1, 0), P(1, v1, 1), P(1, v0, 1), P(1, v0, 0)])}
        fill={rightFill}
        stroke={line}
        strokeWidth={edgeWidth}
        strokeOpacity={edgeOpacity}
        strokeLinejoin="round"
      />

      {/* Pionowe kreski podziału na obu ściankach bocznych */}
      <g stroke={line} strokeOpacity={0.45} strokeWidth={0.7}>
        {cuts.map((t) => (
          <line
            key={`l-${t}`}
            x1={P(t, v0, 1).x}
            y1={P(t, v0, 1).y}
            x2={P(t, v1, 1).x}
            y2={P(t, v1, 1).y}
          />
        ))}
        {cuts.map((t) => (
          <line
            key={`r-${t}`}
            x1={P(1, v0, t).x}
            y1={P(1, v0, t).y}
            x2={P(1, v1, t).x}
            y2={P(1, v1, t).y}
          />
        ))}
      </g>

      {showTop && (
        <>
          <polygon
            points={poly([P(0, v1, 0), P(1, v1, 0), P(1, v1, 1), P(0, v1, 1)])}
            fill={topFill}
            stroke={line}
            strokeWidth={edgeWidth}
            strokeOpacity={edgeOpacity}
            strokeLinejoin="round"
          />
          <g stroke={line} strokeOpacity={0.45} strokeWidth={0.7}>
            {cuts.map((t) => (
              <line
                key={`tu-${t}`}
                x1={P(t, v1, 0).x}
                y1={P(t, v1, 0).y}
                x2={P(t, v1, 1).x}
                y2={P(t, v1, 1).y}
              />
            ))}
            {cuts.map((t) => (
              <line
                key={`tw-${t}`}
                x1={P(0, v1, t).x}
                y1={P(0, v1, t).y}
                x2={P(1, v1, t).x}
                y2={P(1, v1, t).y}
              />
            ))}
          </g>
        </>
      )}
    </motion.g>
  );
}
