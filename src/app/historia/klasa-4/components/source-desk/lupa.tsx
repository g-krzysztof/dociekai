'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';

export function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

interface LupaPlaneProps {
  color: string;
  children: ReactNode;
  pos: { x: number; y: number };
  onPosChange: (p: { x: number; y: number }) => void;
  onConfirm?: () => void;
  over?: boolean;
  zoom?: number;
  lupaPx?: number;
  className?: string;
  ariaLabel: string;
  bgClassName?: string;
}

/**
 * Silnik `source-desk` — **płaszczyzna z lupą**. Dziecko przesuwa lupę
 * palcem po torze albo strzałkami (z Shiftem szybciej), Enter/Spacja
 * potwierdza. Zawartość renderowana jest dwa razy: jako podstawa
 * i jako powiększona kopia w okrągłym okienku lupy.
 */
export function LupaPlane({
  color,
  children,
  pos,
  onPosChange,
  onConfirm,
  over = false,
  zoom = 2.5,
  lupaPx = 112,
  className = 'aspect-square',
  ariaLabel,
  bgClassName = 'bg-[#f4f1ea]',
}: LupaPlaneProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const measure = () => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (rect) setSize({ w: rect.width, h: rect.height });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const moveTo = (clientX: number, clientY: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    onPosChange({
      x: clamp01((clientX - rect.left) / rect.width),
      y: clamp01((clientY - rect.top) / rect.height),
    });
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Bez przechwycenia i tak działa (ruch przy wciśniętym przycisku).
    }
    moveTo(e.clientX, e.clientY);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0) return;
    moveTo(e.clientX, e.clientY);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    let next = pos;
    if (e.key === 'ArrowLeft') next = { ...pos, x: pos.x - step };
    else if (e.key === 'ArrowRight') next = { ...pos, x: pos.x + step };
    else if (e.key === 'ArrowUp') next = { ...pos, y: pos.y - step };
    else if (e.key === 'ArrowDown') next = { ...pos, y: pos.y + step };
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onConfirm?.();
      return;
    } else return;
    e.preventDefault();
    onPosChange({ x: clamp01(next.x), y: clamp01(next.y) });
  };

  return (
    <div
      ref={trackRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onKeyDown={onKeyDown}
      tabIndex={0}
      className={`relative w-full cursor-move touch-none overflow-hidden border select-none focus-visible:outline-2 ${bgClassName} ${className}`}
      role="application"
      aria-label={ariaLabel}
    >
      <div className="absolute inset-0">{children}</div>
      {size.w > 0 && (
        <div
          aria-hidden
          className={`absolute overflow-hidden rounded-full border-4 shadow-lg ${bgClassName}`}
          style={{
            width: lupaPx,
            height: lupaPx,
            left: pos.x * size.w - lupaPx / 2,
            top: pos.y * size.h - lupaPx / 2,
            borderColor: over ? 'var(--success)' : color,
          }}
        >
          {/* Powiększona kopia tego samego widoku: punkt spod lupy
              ląduje dokładnie na jej środku (bez transform — sam offset). */}
          <div
            className="absolute"
            style={{
              width: size.w * zoom,
              height: size.h * zoom,
              left: lupaPx / 2 - pos.x * size.w * zoom,
              top: lupaPx / 2 - pos.y * size.h * zoom,
            }}
          >
            {children}
          </div>
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50" />
        </div>
      )}
    </div>
  );
}
