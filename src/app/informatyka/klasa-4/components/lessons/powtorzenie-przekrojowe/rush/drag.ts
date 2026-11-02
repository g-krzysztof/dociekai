import { useState, type CSSProperties, type PointerEvent } from 'react';

/**
 * Przeciąganie kart do stref — wspólne dla dwóch mikro-gier (pliki do folderów,
 * karty do tac). Karta zostaje w przepływie dokumentu i tylko się **przesuwa**
 * (`transform`), więc sąsiedzi nie skaczą; wskaźnik jest przejęty
 * (`setPointerCapture`), więc puszczenie palca poza planszą kończy gest zamiast
 * zostawiać kartę „w powietrzu”. Strefa upuszczenia to każdy element z
 * `data-zone="…"` pod palcem w chwili puszczenia.
 */

interface DragState {
  id: string;
  sx: number;
  sy: number;
  x: number;
  y: number;
}

export function zoneAt(x: number, y: number): string | null {
  const stack = document.elementsFromPoint(x, y);
  for (const element of stack) {
    const zone = (element as HTMLElement).dataset?.zone;
    if (zone) return zone;
  }
  return null;
}

export function useDragChips({
  disabled,
  onDrop,
}: {
  disabled?: boolean;
  onDrop: (id: string, zone: string | null) => void;
}) {
  const [drag, setDrag] = useState<DragState | null>(null);

  const bind = (id: string) => ({
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (disabled) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDrag({ id, sx: event.clientX, sy: event.clientY, x: event.clientX, y: event.clientY });
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      setDrag((current) => (current && current.id === id ? { ...current, x: event.clientX, y: event.clientY } : current));
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      if (!drag || drag.id !== id) return;
      const zone = zoneAt(event.clientX, event.clientY);
      setDrag(null);
      onDrop(id, zone);
    },
    onPointerCancel: () => setDrag(null),
    style: {
      touchAction: 'none',
      cursor: drag?.id === id ? 'grabbing' : 'grab',
      transform: drag?.id === id ? `translate(${drag.x - drag.sx}px, ${drag.y - drag.sy}px)` : undefined,
      zIndex: drag?.id === id ? 40 : undefined,
      position: 'relative',
    } as CSSProperties,
  });

  return { dragging: drag?.id ?? null, bind };
}
