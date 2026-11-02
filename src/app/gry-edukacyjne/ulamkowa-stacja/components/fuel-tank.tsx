'use client';

import { useEffect, useRef } from 'react';

interface FuelTankProps {
  /** Pojemność całkowita zbiornika w litrach. */
  capacity: number;
  /** Obecny poziom paliwa w litrach. */
  currentLiters: number;
  /** Docelowy poziom paliwa w litrach (do dolania). */
  targetLiters: number;
  /** Ułamek docelowy do wyświetlenia (np. {num: 3, den: 4}). */
  targetFraction?: { num: number; den: number };
  /** Czy pokazać podziałkę na części (dla podpowiedzi). */
  showDivisions?: boolean;
  /** Kolor paliwa (domyślnie zielony/niebieski gradient). */
  fuelColor?: string;
  /** Czy animować wypełnianie. */
  animated?: boolean;
  /** Czy jest w stanie błędu (czerwone świecenie). */
  error?: boolean;
  /** Czy jest w stanie sukcesu (zielone świecenie). */
  success?: boolean;
  /** Czy pokazać etykietę z ilością litrów. */
  showLitersLabel?: boolean;
  /** Jednostka dopisywana do liczb (domyślnie "L"; puste dla zadań bez litrów, np. rozszerzanie ułamków). */
  unit?: string;
  /** Szerokość komponentu. */
  width?: number;
  /** Wysokość komponentu. */
  height?: number;
}

const DEFAULT_FUEL_COLOR = 'linear-gradient(180deg, #22c55e 0%, #16a34a 50%, #15803d 100%)';

export function FuelTank({
  capacity,
  currentLiters,
  targetLiters,
  targetFraction,
  showDivisions = false,
  fuelColor = DEFAULT_FUEL_COLOR,
  animated = true,
  error = false,
  success = false,
  showLitersLabel = true,
  unit = 'L',
  width = 80,
  height = 280,
}: FuelTankProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevCurrentRef = useRef(currentLiters);
  const animationFrameRef = useRef<number | null>(null);
  const glowPhaseRef = useRef(0);

  // Animacja płynnego wypełniania
  useEffect(() => {
    if (!animated) {
      prevCurrentRef.current = currentLiters;
      return;
    }

    const start = prevCurrentRef.current;
    const end = currentLiters;
    const duration = 300; // ms
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing: ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      prevCurrentRef.current = start + (end - start) * eased;

      draw();
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draw jest odtwarzana co render; efekt ma biec tylko po zmianie currentLiters/animated
  }, [currentLiters, animated]);

  // Animacja świecenia (error/success)
  useEffect(() => {
    if (!error && !success) return;
    const start = performance.now();
    function glowLoop(now: number) {
      glowPhaseRef.current = (now - start) / 1000;
      draw();
      animationFrameRef.current = requestAnimationFrame(glowLoop);
    }
    animationFrameRef.current = requestAnimationFrame(glowLoop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draw jest odtwarzana co render; efekt ma biec tylko po zmianie error/success
  }, [error, success]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = width * dpr;
    const h = height * dpr;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const padding = 4;
    const tankX = padding;
    const tankY = padding;
    const tankW = width - padding * 2;
    const tankH = height - padding * 2;
    const cornerRadius = 8;

    // Tło zbiornika (szary metaliczny)
    ctx.clearRect(0, 0, width, height);

    // Cień zewnętrzny
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    // Obrys zbiornika
    ctx.beginPath();
    ctx.roundRect(tankX, tankY, tankW, tankH, cornerRadius);
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fill();

    // Wewnętrzne obramowanie
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#334155'; // slate-700
    ctx.stroke();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Podziałki (jeśli showDivisions)
    if (showDivisions && targetFraction) {
      const { den } = targetFraction;
      const divisionH = tankH / den;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)'; // slate-400/30
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (let i = 1; i < den; i++) {
        const y = tankY + i * divisionH;
        ctx.beginPath();
        ctx.moveTo(tankX + 8, y);
        ctx.lineTo(tankX + tankW - 8, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Etykiety podziałek
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '10px "IBM Plex Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let i = 0; i <= den; i++) {
        const y = tankY + tankH - i * divisionH;
        const label = `${i}/${den}`;
        ctx.fillText(label, tankX - 6, y);
      }
    }

    // Poziom paliwa (currentLiters) - guard against invalid capacity
    const safeCapacity = capacity > 0 ? capacity : 1;
    const safeCurrentLiters = Number.isFinite(currentLiters) ? currentLiters : 0;
    const currentRatio = Math.max(0, Math.min(1, safeCurrentLiters / safeCapacity));
    const fuelH = tankH * currentRatio;
    const fuelY = tankY + tankH - fuelH;

    // Gradient paliwa - only create if we have valid coordinates
    const gradient = ctx.createLinearGradient(tankX, tankY + tankH, tankX, fuelY);
    if (fuelColor.includes('gradient')) {
      // Parsuj gradient string (uproszczone)
      gradient.addColorStop(0, '#22c55e');
      gradient.addColorStop(0.5, '#16a34a');
      gradient.addColorStop(1, '#15803d');
    } else {
      gradient.addColorStop(0, fuelColor);
      gradient.addColorStop(1, fuelColor);
    }

    // Efekt błędu/sukcesu - pulsujące świecenie
    if (error || success) {
      const pulse = (Math.sin(glowPhaseRef.current * 8) + 1) / 2; // 0..1
      const glowColor = error ? `rgba(239, 68, 68, ${0.3 + pulse * 0.4})` : `rgba(34, 197, 94, ${0.3 + pulse * 0.4})`;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 20 + pulse * 20;
    }

    // Rysuj paliwo z zaokrągleniem dołu
    ctx.beginPath();
    const bottomRadius = cornerRadius;
    if (fuelH > 0) {
      if (fuelH >= bottomRadius * 2) {
        // roundRect radii: [top-left, top-right, bottom-right, bottom-left]
        ctx.roundRect(tankX + 2, fuelY, tankW - 4, fuelH, [0, 0, bottomRadius, bottomRadius]);
      } else {
        // Bardzo mały poziom - prostokąt
        ctx.rect(tankX + 2, fuelY, tankW - 4, fuelH);
      }
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Linia docelowa (targetLiters)
    if (targetLiters > 0 && targetLiters !== currentLiters && capacity > 0) {
      const targetRatio = Math.max(0, Math.min(1, targetLiters / capacity));
      const targetY = tankY + tankH - targetRatio * tankH;

      ctx.beginPath();
      ctx.moveTo(tankX - 6, targetY);
      ctx.lineTo(tankX + tankW + 6, targetY);
      ctx.strokeStyle = error ? '#ef4444' : success ? '#22c55e' : '#f59e0b';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Etykieta celu
      ctx.fillStyle = error ? '#ef4444' : success ? '#22c55e' : '#f59e0b';
      ctx.font = 'bold 11px "IBM Plex Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const label = targetFraction ? `${targetFraction.num}/${targetFraction.den}` : `${targetLiters}${unit}`;
      ctx.fillText(label, tankX + tankW + 10, targetY);
    }

    // Etykieta pojemności na górze (tylko gdy mamy pojemność)
    if (capacity > 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px "IBM Plex Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${capacity}${unit}`, tankX + tankW / 2, tankY - 4);
    }

    // Etykieta aktualnych litrów
    if (showLitersLabel && Number.isFinite(currentLiters)) {
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 14px "IBM Plex Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`${Math.round(currentLiters)}${unit}`, tankX + tankW / 2, tankY + tankH + 8);
    }
  };

  // Initial draw
  useEffect(() => {
    draw();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width, height, display: 'block' }}
      aria-label={`Zbiornik paliwa: ${Math.round(currentLiters)} z ${capacity} litrów`}
      role="img"
    />
  );
}