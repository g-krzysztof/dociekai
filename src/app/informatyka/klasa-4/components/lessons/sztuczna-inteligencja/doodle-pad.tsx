'use client';

import { useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { Eraser, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PAD, doodleBox, type Doodle, type Point } from './doodle';

const INK = '#292524';

/**
 * Płótno, na którym dziecko rysuje przykłady dla maszyny.
 *
 * **Wskaźnik przejmujemy na `pointerdown` i oddajemy na `pointerup`** — ta sama
 * zasada co w `LineDraw` z lekcji o robocie. Bez tego puszczenie palca poza
 * kartką nie dociera do SVG i kreska ciągnie się dalej za samym najechaniem
 * myszą. Punkt jest przycinany do kartki.
 *
 * Rysunek trzyma rodzic (trafia potem do tacy albo do sprawdzianu), ale
 * zdarzenia ruchu przychodzą szybciej, niż React zdąży przerysować — dlatego
 * bieżący stan żyje też w `live`, a nie tylko w propsie. Inaczej szybka kreska
 * gubiłaby punkty.
 */
export function DoodlePad({
  doodle,
  onChange,
  color,
  disabled,
  className,
}: {
  doodle: Doodle;
  onChange: (doodle: Doodle) => void;
  color: string;
  disabled?: boolean;
  className?: string;
}) {
  const live = useRef(doodle);
  const drawing = useRef(false);

  useEffect(() => {
    live.current = doodle;
  }, [doodle]);

  const commit = (next: Doodle) => {
    live.current = next;
    onChange(next);
  };

  const pointer = (phase: 'down' | 'move' | 'up') => (event: ReactPointerEvent<SVGSVGElement>) => {
    if (disabled) return;
    const svg = event.currentTarget;
    try {
      if (phase === 'down') svg.setPointerCapture(event.pointerId);
      if (phase === 'up') svg.releasePointerCapture(event.pointerId);
    } catch {
      /* Starsza przeglądarka bez przejmowania wskaźnika — rysowanie dalej działa. */
    }
    const rect = svg.getBoundingClientRect();
    const clamp = (value: number) => Math.max(2, Math.min(PAD - 2, value));
    const point: Point = {
      x: clamp(((event.clientX - rect.left) / rect.width) * PAD),
      y: clamp(((event.clientY - rect.top) / rect.height) * PAD),
    };

    if (phase === 'down') {
      drawing.current = true;
      commit([...live.current, [point]]);
      return;
    }
    if (phase === 'up') {
      drawing.current = false;
      return;
    }
    if (!drawing.current) return;
    const strokes = live.current;
    const last = strokes[strokes.length - 1];
    const previous = last[last.length - 1];
    if (Math.hypot(point.x - previous.x, point.y - previous.y) < 2.5) return;
    commit([...strokes.slice(0, -1), [...last, point]]);
  };

  return (
    <div className={cn('mx-auto w-full max-w-[300px]', className)}>
      <svg
        viewBox={`0 0 ${PAD} ${PAD}`}
        className={cn(
          'aspect-square w-full touch-none select-none border-2 bg-white',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-crosshair'
        )}
        style={{ borderColor: `${color}66` }}
        onPointerDown={pointer('down')}
        onPointerMove={pointer('move')}
        onPointerUp={pointer('up')}
        onPointerCancel={pointer('up')}
        role="img"
        aria-label="Kartka do rysowania"
      >
        {doodle.length === 0 && (
          <text x={PAD / 2} y={PAD / 2} textAnchor="middle" dominantBaseline="middle" fontSize={15} fill="#a8a29e">
            rysuj tutaj palcem albo myszą
          </text>
        )}
        {doodle.map((stroke, index) =>
          stroke.length === 1 ? (
            <circle key={index} cx={stroke[0].x} cy={stroke[0].y} r={3.5} fill={INK} />
          ) : (
            <polyline
              key={index}
              points={stroke.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={INK}
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )
        )}
      </svg>

      <div className="mt-2 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => commit(live.current.slice(0, -1))}
          disabled={disabled || doodle.length === 0}
          className="inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Undo2 className="h-3.5 w-3.5" aria-hidden />
          cofnij kreskę
        </button>
        <button
          type="button"
          onClick={() => commit([])}
          disabled={disabled || doodle.length === 0}
          className="inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Eraser className="h-3.5 w-3.5" aria-hidden />
          wyczyść
        </button>
      </div>
    </div>
  );
}

/**
 * Miniatura rysunku, przeskalowana tak, jak widzi go maszyna: do wspólnego
 * rozmiaru i na środek. Dzięki temu dziecko porównuje na tacy to samo, co
 * porównuje model — kształt, a nie to, w którym rogu kartki narysowało.
 */
export function DoodleThumb({
  doodle,
  size = 52,
  className,
  stroke = INK,
}: {
  doodle: Doodle;
  size?: number;
  className?: string;
  stroke?: string;
}) {
  const box = doodleBox(doodle);
  const side = Math.max(box.size, 20) * 1.25;
  const cx = (box.minX + box.maxX) / 2;
  const cy = (box.minY + box.maxY) / 2;
  const valid = Number.isFinite(side);

  return (
    <svg
      viewBox={valid ? `${cx - side / 2} ${cy - side / 2} ${side} ${side}` : `0 0 ${PAD} ${PAD}`}
      width={size}
      height={size}
      className={cn('block bg-white', className)}
      aria-hidden
    >
      {doodle.map((line, index) =>
        line.length === 1 ? (
          <circle key={index} cx={line[0].x} cy={line[0].y} r={side / 40} fill={stroke} />
        ) : (
          <polyline
            key={index}
            points={line.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={stroke}
            strokeWidth={2.2}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )
      )}
    </svg>
  );
}
