'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

const CELL = 28;
const GAP = 4;
const PAD = 14;

export interface ArrayGridProps {
  rows: number;
  cols: number;
  color: string;
  /** Kolumna, po której następuje podział (1..cols-1) — 0 lub `cols` = brak podziału, jeden kolor. */
  split?: number;
  /** Gdy podane, po siatce pojawia się przeciągalna linia podziału; wywoływane z nową kolumną. */
  onSplitChange?: (col: number) => void;
  ariaLabel: string;
  className?: string;
}

/**
 * Siatka jednostkowych kwadracików `rows × cols` — model tablicowy mnożenia
 * (array model). Bez podziału to po prostu wizualny dowód `rows × cols`;
 * z `onSplitChange` linia podziału staje się przeciągalna, dzieląc kolumny na
 * dwie grupy w dwóch odcieniach tego samego koloru modułu — to właśnie ten
 * podział, na żywo przeciągany, pokazuje rozdzielność mnożenia względem
 * dodawania. Inny mechanizm niż `NumberLine`/`JumpLine` — tu liczy się
 * powierzchnia/liczba pól, nie pozycja na osi.
 */
export function ArrayGrid({
  rows,
  cols,
  color,
  split = 0,
  onSplitChange,
  ariaLabel,
  className,
}: ArrayGridProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const width = cols * CELL + (cols - 1) * GAP;
  const height = rows * CELL + (rows - 1) * GAP;
  const totalW = width + PAD * 2;
  const totalH = height + PAD * 2;
  const secondaryFill = `color-mix(in oklch, ${color} 32%, white)`;
  const dividerX = PAD + split * (CELL + GAP) - GAP / 2;

  const colFromX = (localX: number) => {
    const raw = (localX - PAD) / (CELL + GAP);
    return Math.min(cols - 1, Math.max(1, Math.round(raw)));
  };

  const updateFromEvent = (event: ReactPointerEvent<SVGGElement | SVGSVGElement>) => {
    if (!onSplitChange || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scale = totalW / rect.width;
    const localX = (event.clientX - rect.left) * scale;
    onSplitChange(colFromX(localX));
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${totalW} ${totalH}`}
      className={className ?? 'mx-auto h-auto w-full max-w-xs'}
      role="img"
      aria-label={ariaLabel}
      onPointerMove={dragging ? updateFromEvent : undefined}
      onPointerUp={() => setDragging(false)}
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <rect
            key={`${r}-${c}`}
            x={PAD + c * (CELL + GAP)}
            y={PAD + r * (CELL + GAP)}
            width={CELL}
            height={CELL}
            rx={4}
            fill={split > 0 && c >= split ? secondaryFill : color}
          />
        ))
      )}

      {onSplitChange && split > 0 && split < cols && (
        <g
          onPointerDown={(event) => {
            setDragging(true);
            (event.target as Element).setPointerCapture?.(event.pointerId);
          }}
          style={{ cursor: 'ew-resize', touchAction: 'none' }}
        >
          <rect x={dividerX - 10} y={0} width={20} height={totalH} fill="transparent" />
          <line
            x1={dividerX}
            y1={2}
            x2={dividerX}
            y2={totalH - 2}
            stroke={color}
            strokeWidth={3}
            strokeDasharray="2 5"
            strokeLinecap="round"
          />
          <circle cx={dividerX} cy={totalH / 2} r={9} fill={color} />
          <circle cx={dividerX} cy={totalH / 2} r={3} fill="white" />
        </g>
      )}
    </svg>
  );
}
