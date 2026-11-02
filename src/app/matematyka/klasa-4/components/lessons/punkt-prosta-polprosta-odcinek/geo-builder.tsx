'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { cn } from '@/lib/utils';
import { GeoFigureMarks, VIEW_HEIGHT, VIEW_WIDTH, type GeoKind } from './geo-figure';
import { clampToCanvas, type GeoPoint } from './geo-shape';

const MODES: { key: GeoKind; label: string }[] = [
  { key: 'punkt', label: 'Punkt' },
  { key: 'odcinek', label: 'Odcinek' },
  { key: 'polprosta', label: 'Półprosta' },
  { key: 'prosta', label: 'Prosta' },
];

const CAPTIONS: Record<GeoKind, (a: string, b: string) => string> = {
  punkt: (a) => `To tylko punkt ${a} — dokładne miejsce, bez rozmiaru. Nie da się go niczym zmierzyć.`,
  odcinek: (a, b) =>
    `odcinek ${a}${b} — to ten sam odcinek co ${b}${a}. Ma dwa końce, więc ma długość, którą można zmierzyć.`,
  polprosta: (a, b) =>
    `półprosta ${a}${b} — zaczyna się w punkcie ${a} i biegnie przez ${b} w nieskończoność. Półprosta ${b}${a} zaczynałaby się w zupełnie innym miejscu.`,
  prosta: (a, b) => `prosta ${a}${b} (= prosta ${b}${a}) — biegnie w nieskończoność w obie strony, bez początku i końca.`,
};

type DragTarget = 'A' | 'B' | null;

interface GeoBuilderProps {
  color: string;
  onComplete?: () => void;
}

/**
 * „Coś ekstra” tej lekcji: dwa punkty przeciągane swobodnie po całym
 * płótnie (surowe pointer events przeliczane przez `getBoundingClientRect`,
 * nie 1D suwak jak w `ArrayGrid`) — te same dwa punkty stają się kolejno
 * punktem, odcinkiem, półprostą i prostą pod przełącznikiem trybu. Dziecko
 * fizycznie czuje różnicę: przesunięcie punktu w trybie „odcinek” skraca
 * linię, w trybie „prosta”/„półprosta” tylko obraca ją wokół punktu startu,
 * bo linia i tak ucieka poza krawędź płótna.
 */
export function GeoBuilder({ color, onComplete }: GeoBuilderProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pointA, setPointA] = useState<GeoPoint>({ x: 90, y: 148 });
  const [pointB, setPointB] = useState<GeoPoint>({ x: 246, y: 62 });
  const [mode, setMode] = useState<GeoKind>('odcinek');
  const [dragging, setDragging] = useState<DragTarget>(null);
  const [tried, setTried] = useState<Set<GeoKind>>(new Set(['odcinek']));

  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const chooseMode = (next: GeoKind) => {
    setMode(next);
    const nextTried = new Set(tried);
    nextTried.add(next);
    setTried(nextTried);
    if (nextTried.size === MODES.length) onComplete?.();
  };

  const localPointFromEvent = (event: ReactPointerEvent<SVGCircleElement>): GeoPoint | null => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const scaleX = VIEW_WIDTH / rect.width;
    const scaleY = VIEW_HEIGHT / rect.height;
    return clampToCanvas(
      { x: (event.clientX - rect.left) * scaleX, y: (event.clientY - rect.top) * scaleY },
      VIEW_WIDTH,
      VIEW_HEIGHT
    );
  };

  const startDrag = (target: DragTarget) => (event: ReactPointerEvent<SVGCircleElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(target);
  };

  const handleMove = (event: ReactPointerEvent<SVGCircleElement>) => {
    if (!dragging) return;
    const point = localPointFromEvent(event);
    if (!point) return;
    if (dragging === 'A') setPointA(point);
    else setPointB(point);
  };

  const endDrag = () => setDragging(null);

  const caption = CAPTIONS[mode]('A', 'B');

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Przeciągnij punkty <strong className="font-mono">A</strong> i{' '}
        <strong className="font-mono">B</strong> po całym płótnie, potem przełącz tryb — te same dwa
        punkty za każdym razem stają się czymś innym.
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {MODES.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => chooseMode(option.key)}
            aria-pressed={mode === option.key}
            className={cn(
              'cursor-pointer border px-4 py-2 text-sm font-semibold transition-all',
              mode !== option.key && 'hover:-translate-y-0.5 hover:shadow-md'
            )}
            style={
              mode === option.key
                ? { borderColor: color, backgroundColor: `${color}14`, color }
                : { borderColor: `${color}59`, color }
            }
          >
            {option.label}
            {tried.has(option.key) && mode !== option.key && (
              <span className="ml-1.5 text-xs" style={{ color }} aria-hidden>
                ✓
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="relative mb-4 flex justify-center overflow-hidden border bg-white dark:bg-zinc-900/80">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          className="h-auto w-full max-w-md touch-none"
        >
          <g style={{ pointerEvents: 'none' }}>
            <GeoFigureMarks
              color={color}
              kind={mode}
              pointA={pointA}
              pointB={pointB}
              labelA="A"
              labelB="B"
              strokeWidth={3.5}
            />
          </g>

          <circle
            cx={pointA.x}
            cy={pointA.y}
            r={16}
            fill="transparent"
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={startDrag('A')}
            onPointerMove={handleMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          />
          {mode !== 'punkt' && (
            <circle
              cx={pointB.x}
              cy={pointB.y}
              r={16}
              fill="transparent"
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={startDrag('B')}
              onPointerMove={handleMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            />
          )}
        </svg>
      </div>

      <div
        className="flex min-h-[52px] items-center border-l-4 p-4 sm:p-5"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <p className="font-mono text-sm font-semibold leading-relaxed sm:text-base" style={{ color: textColor }}>
          {caption}
        </p>
      </div>

      {tried.size < MODES.length && (
        <p className="mt-3 text-xs text-muted-foreground">
          Sprawdziłeś/aś {tried.size} z {MODES.length} trybów — kliknij pozostałe, żeby zaliczyć ten krok.
        </p>
      )}
    </div>
  );
}
