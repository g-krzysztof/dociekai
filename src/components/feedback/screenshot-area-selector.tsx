'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
// html2canvas-pro, not plain html2canvas: this app's CSS custom properties
// are defined with modern color functions (lab()/oklch(), see globals.css /
// Tailwind v4 tokens) that stock html2canvas's parser throws on outright
// ("Attempting to parse an unsupported color function"). -pro is the
// actively-maintained fork that added support for lab()/lch()/oklab()/
// oklch()/color() while keeping the exact same import/call signature.
import html2canvas from 'html2canvas-pro';

interface Point {
  x: number;
  y: number;
}

interface ScreenshotAreaSelectorProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
}

// Full-viewport drag-to-select overlay. Rendered while the feedback drawer is
// hidden (see feedback-widget.tsx) so it never ends up in its own capture.
// html2canvas rasterizes the live DOM in place — no getDisplayMedia() screen-
// share permission prompt, works the same on mobile as desktop — at the cost
// of not always being pixel-perfect for canvas/WebGL content (the WASM games
// under /gry-edukacyjne) or cross-origin images without CORS headers.
export function ScreenshotAreaSelector({ onCapture, onCancel }: ScreenshotAreaSelectorProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState<Point | null>(null);
  const [current, setCurrent] = useState<Point | null>(null);
  const [capturing, setCapturing] = useState(false);

  const rect = useMemo(
    () =>
      start && current
        ? {
            x: Math.min(start.x, current.x),
            y: Math.min(start.y, current.y),
            width: Math.abs(current.x - start.x),
            height: Math.abs(current.y - start.y),
          }
        : null,
    [start, current]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (capturing) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setStart({ x: event.clientX, y: event.clientY });
    setCurrent({ x: event.clientX, y: event.clientY });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!start || capturing) return;
    setCurrent({ x: event.clientX, y: event.clientY });
  };

  const handlePointerUp = useCallback(async () => {
    if (!rect || capturing) return;

    if (rect.width < 10 || rect.height < 10) {
      // Too small to be an intentional selection — let them redraw it.
      setStart(null);
      setCurrent(null);
      return;
    }

    setCapturing(true);
    try {
      const canvas = await html2canvas(document.body, {
        x: rect.x + window.scrollX,
        y: rect.y + window.scrollY,
        width: rect.width,
        height: rect.height,
        useCORS: true,
        backgroundColor: '#ffffff',
        scale: Math.min(window.devicePixelRatio || 1, 2),
        // The drawer's own DrawerContent is hidden (`invisible`) by the
        // caller while capturing, so html2canvas already skips it on its
        // own — but its backdrop (DrawerOverlay) is a separate sibling node
        // outside the caller's control and would otherwise paint a
        // semi-transparent black tint straight into the captured image.
        ignoreElements: (el) =>
          el.hasAttribute('data-feedback-ui') || el.getAttribute('data-slot') === 'drawer-overlay',
      });
      canvas.toBlob((blob) => {
        if (blob) {
          onCapture(blob);
        } else {
          onCancel();
        }
      }, 'image/png');
    } catch {
      onCancel();
    }
  }, [rect, capturing, onCapture, onCancel]);

  return (
    <div
      ref={overlayRef}
      data-feedback-ui
      // The feedback drawer is a Radix-based modal dialog and stays open
      // (mounted) during capture (see feedback-widget.tsx) — while open,
      // Radix sets `pointer-events: none` on <body> to enforce modality.
      // This overlay is a plain sibling under <body>, not inside Radix's
      // own content, so without an explicit override it silently inherits
      // that and never receives pointer/drag events at all.
      className="pointer-events-auto fixed inset-0 z-[100] touch-none cursor-crosshair select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="absolute inset-0 bg-black/50" />
      {rect && (
        <div
          className="border-primary bg-primary/10 absolute border-2"
          style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
        />
      )}
      <div className="bg-background absolute top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-medium shadow-lg">
        {capturing ? 'Przetwarzanie zrzutu…' : 'Zaznacz obszar, przeciągając kursor'}
      </div>
      <button
        type="button"
        onClick={onCancel}
        aria-label="Anuluj zaznaczanie"
        className="bg-background absolute top-4 right-4 rounded-full p-2 shadow-lg transition-colors hover:bg-muted"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
