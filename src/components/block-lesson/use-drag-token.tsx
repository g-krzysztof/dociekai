'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Przeciąganie żetonu (osoby, tabliczki) na cel — oraz stuknięcie jako
 * zamiennik („stuknij żeton, stuknij miejsce”). Wypromowane z historii
 * (L5, drzewo rodziny) do wspólnej powłoki blokowej w E1 kursu polskiego;
 * cele oznaczone `data-drop="<id>"`.
 *
 * Żeton ma `touch-none`, więc na telefonie ruch palcem po żetonie to przeciąganie,
 * a po tle — zwykły scroll strony. Przesunięcie o mniej niż 6 px liczy się
 * jako stuknięcie (`onTap`).
 */

export interface DragState {
  id: string;
  x: number;
  y: number;
}

export function useDragToken({
  onDrop,
  onTap,
  disabled = false,
}: {
  /** `target` = wartość `data-drop` celu pod palcem albo `null`, gdy puszczono w próżni. */
  onDrop: (id: string, target: string | null) => void;
  onTap: (id: string) => void;
  disabled?: boolean;
}) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const start = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);

  const targetAt = (x: number, y: number): string | null =>
    document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-drop]')?.dataset.drop ?? null;

  const bind = (id: string) => ({
    // Kursor „chwyć” (globals.css, `.course-cursors [data-drag-token]`).
    'data-drag-token': disabled ? undefined : '',
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (disabled || e.button > 0) return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Bez przechwycenia ruch i tak działa, dopóki wskaźnik jest nad żetonem.
      }
      start.current = { id, x: e.clientX, y: e.clientY, moved: false };
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const s = start.current;
      if (!s || s.id !== id) return;
      if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) < 6) return;
      s.moved = true;
      setDrag({ id, x: e.clientX, y: e.clientY });
      setHover(targetAt(e.clientX, e.clientY));
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) => {
      const s = start.current;
      start.current = null;
      if (!s || s.id !== id) return;
      if (!s.moved) {
        onTap(id);
        return;
      }
      setDrag(null);
      setHover(null);
      onDrop(id, targetAt(e.clientX, e.clientY));
    },
    onPointerCancel: () => {
      start.current = null;
      setDrag(null);
      setHover(null);
    },
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onTap(id);
      }
    },
  });

  return { drag, hover, bind };
}

/** Duch przeciąganego żetonu przy palcu — w portalu, bo przodkowie mogą mieć `transform`. */
export function DragGhost({ drag, children }: { drag: DragState | null; children: ReactNode }) {
  if (!drag || typeof document === 'undefined') return null;
  return createPortal(
    <div
      aria-hidden
      className="pointer-events-none fixed z-[100] opacity-90 shadow-lg"
      style={{ left: drag.x, top: drag.y, transform: 'translate(-50%, -60%)' }}
    >
      {children}
    </div>,
    document.body
  );
}
