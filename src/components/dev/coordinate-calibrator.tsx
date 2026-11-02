'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';

export interface CalibrationPoint {
  id: string;
  /** Tekst na znaczniku — domyślnie `id`, jeśli pominięte. */
  label?: string;
  /** Procent szerokości/wysokości kontenera (0–100). */
  x: number;
  y: number;
}

interface CoordinateCalibratorProps {
  imageSrc: string;
  imageAlt?: string;
  /** np. `'4 / 3'` — musi pasować do realnych proporcji obrazka, inaczej % się rozjadą. */
  aspectRatio?: string;
  initialPoints: CalibrationPoint[];
  markerColor?: string;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Narzędzie deweloperskie do ręcznej kalibracji współrzędnych (%) punktów na
 * obrazku — np. gdzie dokładnie nałożyć klikalne znaczniki na wygenerowanym
 * zdjęciu (kostki dłoni, tarcza zegara, mapa, cokolwiek z konkretnymi
 * miejscami do wskazania). Przeciągnij znacznik myszką/palcem albo dosuń
 * strzałkami po zaznaczeniu (Shift = krok x10) — po każdej zmianie aktualna
 * tablica punktów leci do `console.log`, gotowa do skopiowania i wklejenia
 * na stałe w kodzie docelowego komponentu.
 *
 * Reużywalne: nie wie nic o konkretnej domenie (miesiącach, godzinach…) —
 * przyjmuje dowolną listę `{ id, label?, x, y }` i dowolny obrazek. Zobacz
 * `src/app/dev/calibrate/page.tsx` po przykład użycia; żeby skalibrować coś
 * innego, podmień tam `imageSrc`/`aspectRatio`/`initialPoints`.
 */
export function CoordinateCalibrator({
  imageSrc,
  imageAlt = '',
  aspectRatio = '4 / 3',
  initialPoints,
  markerColor = '#0891b2',
}: CoordinateCalibratorProps) {
  const [points, setPoints] = useState<CalibrationPoint[]>(initialPoints);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingId = useRef<string | null>(null);
  const pointsRef = useRef(points);

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  const logPoints = useCallback((label: string, next: CalibrationPoint[]) => {
    const clean = next.map(({ id, label: l, x, y }) => ({ id, label: l, x, y }));
    console.log(`CoordinateCalibrator — ${label}:`, clean);
    console.log(JSON.stringify(clean, null, 2));
  }, []);

  const updateFromClientCoords = useCallback((id: string, clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
    setPoints((prev) => prev.map((p) => (p.id === id ? { ...p, x: round1(x), y: round1(y) } : p)));
  }, []);

  const handlePointerDown = (id: string) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSelectedId(id);
    draggingId.current = id;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientCoords(id, e.clientX, e.clientY);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!draggingId.current) return;
    updateFromClientCoords(draggingId.current, e.clientX, e.clientY);
  };

  const endDrag = () => {
    if (!draggingId.current) return;
    draggingId.current = null;
    logPoints('po przeciągnięciu', pointsRef.current);
  };

  const handleKeyDown = (id: string) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = e.shiftKey ? 1 : 0.1;
    let dx = 0;
    let dy = 0;
    if (e.key === 'ArrowLeft') dx = -step;
    else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step;
    else if (e.key === 'ArrowDown') dy = step;
    else return;
    e.preventDefault();
    setPoints((prev) => {
      const next = prev.map((p) =>
        p.id === id ? { ...p, x: clamp(round1(p.x + dx), 0, 100), y: clamp(round1(p.y + dy), 0, 100) } : p
      );
      logPoints('po strzałce', next);
      return next;
    });
  };

  const handleCopy = async () => {
    const clean = points.map(({ id, label, x, y }) => ({ id, label, x, y }));
    await navigator.clipboard.writeText(JSON.stringify(clean, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    setPoints(initialPoints);
    logPoints('reset', initialPoints);
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-2 text-xl font-bold">Kalibrator współrzędnych</h1>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Przeciągnij znaczniki na dokładne miejsce (albo zaznacz klikiem i dosuń strzałkami — Shift
        = krok ×10). Po puszczeniu / każdej strzałce aktualna tablica punktów ląduje w konsoli
        (F12 → Console), gotowa do skopiowania. Przycisk „Kopiuj JSON” kopiuje ją też do schowka.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="cursor-pointer border-2 px-3 py-1.5 text-sm font-semibold"
          style={{ borderColor: markerColor, color: markerColor }}
        >
          {copied ? 'Skopiowano!' : 'Kopiuj JSON'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="cursor-pointer border-2 border-muted-foreground/40 px-3 py-1.5 text-sm font-semibold text-muted-foreground"
        >
          Resetuj
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative w-full touch-none select-none border"
        style={{ aspectRatio, borderColor: `${markerColor}40` }}
      >
        <Image src={imageSrc} alt={imageAlt} fill className="object-cover" sizes="768px" priority />
        {points.map((p) => {
          const selected = p.id === selectedId;
          return (
            <button
              key={p.id}
              type="button"
              onPointerDown={handlePointerDown(p.id)}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onKeyDown={handleKeyDown(p.id)}
              onFocus={() => setSelectedId(p.id)}
              aria-label={`Znacznik ${p.label ?? p.id}, ${p.x}%, ${p.y}%`}
              className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full text-[11px] font-bold tabular-nums active:cursor-grabbing"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                borderWidth: 2,
                borderColor: selected ? markerColor : `${markerColor}90`,
                backgroundColor: selected ? markerColor : 'rgba(255,255,255,0.9)',
                color: selected ? '#fff' : markerColor,
                boxShadow: selected ? `0 0 0 3px ${markerColor}33` : undefined,
              }}
            >
              {p.label ?? p.id}
            </button>
          );
        })}
      </div>

      <pre className="mt-4 max-h-64 overflow-auto border bg-muted/30 p-3 text-xs">
        {JSON.stringify(
          points.map(({ id, label, x, y }) => ({ id, label, x, y })),
          null,
          2
        )}
      </pre>
    </div>
  );
}
