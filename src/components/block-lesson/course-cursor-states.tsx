'use client';

import { useEffect } from 'react';

/**
 * Podtrzymuje kursor przeciągania w kursach z powłoką blokową (historia,
 * język polski) — wszystko wewnątrz `.course-cursors` (layout kursu). Widżety deklarują kursor
 * spoczynkowy klasą (`cursor-grab`, `cursor-ew-resize`…); tu, przy wciśnięciu,
 * czytamy go z elementu i do puszczenia ustawiamy na całym dokumencie
 * (`html[data-course-drag]` w `globals.css`). Dzięki temu `grab` zmienia się
 * w `grabbing`, a kursor nie miga, gdy wskaźnik wyjedzie poza widżet.
 */

const HELD: Record<string, string> = {
  grab: 'grabbing',
  grabbing: 'grabbing',
  move: 'move',
  'ew-resize': 'ew-resize',
  'ns-resize': 'ns-resize',
  'col-resize': 'col-resize',
  'row-resize': 'row-resize',
  crosshair: 'crosshair',
};

export function CourseCursorStates() {
  useEffect(() => {
    const root = document.documentElement;

    const release = () => {
      delete root.dataset.courseDrag;
      root.style.removeProperty('--course-drag-cursor');
    };

    const onDown = (e: PointerEvent) => {
      if (e.button > 0 || !(e.target instanceof Element)) return;
      if (!e.target.closest('.course-cursors')) return;
      const held = HELD[getComputedStyle(e.target).cursor];
      if (!held) return;
      root.style.setProperty('--course-drag-cursor', held);
      root.dataset.courseDrag = '';
    };

    document.addEventListener('pointerdown', onDown, true);
    window.addEventListener('pointerup', release, true);
    window.addEventListener('pointercancel', release, true);
    window.addEventListener('blur', release);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('pointerup', release, true);
      window.removeEventListener('pointercancel', release, true);
      window.removeEventListener('blur', release);
      release();
    };
  }, []);

  return null;
}
