'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ParticlesBackground from '@/components/ui/ParticlesBackground';
import SparklesBackground from '@/components/ui/SparklesBackground';

interface DecorativeFrameProps {
  children?: React.ReactNode;
  className?: string;
  /** Kolory cząsteczek (tryb 'dots') */
  particleColors?: string[];
  particleSize?: number;
  particleCountDesktop?: number;
  particleCountTablet?: number;
  particleCountMobile?: number;
  /** Kolory cząsteczek (tryb 'sparkles') */
  sparkleColors?: string[];
  sparkleCount?: number;
  /** Grubość ramki z cząsteczkami w pikselach (domyślnie 10) */
  borderSize?: number;
  /** Padding wewnętrznego panelu z tłem w pikselach (domyślnie 16) */
  insidePadding?: number;
  /** Miękkie przejście na krawędziach wewnętrznego panelu w pikselach (domyślnie 12) */
  edgeBlur?: number;
  /** Efekt świecącego bordera podążający za myszą */
  glowingBorder?: boolean;
  /** Kolor świecenia (domyślnie #6366f1) */
  glowColor?: string;
  /** Promień świecenia w pikselach (domyślnie 150) */
  glowRadius?: number;
  /** Styl tła: 'dots' = pływające kropki, 'sparkles' = migoccące gwiazdki, undefined = brak */
  dotsBackground?: 'dots' | 'sparkles';
}

export function DecorativeFrame({
  children,
  className = '',
  particleColors = [
  '#ff223e', '#ff7300', '#ffd700', '#7fff00', '#00ff7f',
  '#00ced1', '#1e90ff', '#00bfff', '#32cd32', '#ffa500',
  '#ff4500', '#87ceeb', '#00fa9a', '#f0e130', '#ff6347',
  '#40e0d0', '#008080', '#ff8c00', '#adff2f', '#00ff00',
  '#00ffff', '#4682b4', '#7fffd4', '#ffa07a', '#b0e0e6',
  '#ff1493', '#fa8072', '#20b2aa', '#f5deb3', '#ff7f50'
],
  particleSize = 3,
  particleCountDesktop = 60,
  particleCountTablet = 50,
  particleCountMobile = 40,
  sparkleColors = [
  '#ff223e', '#ff7300', '#ffd700', '#7fff00', '#00ff7f',
  '#00ced1', '#1e90ff', '#00bfff', '#32cd32', '#ffa500',
  '#ff4500', '#87ceeb', '#00fa9a', '#f0e130', '#ff6347',
  '#40e0d0', '#008080', '#ff8c00', '#adff2f', '#00ff00',
  '#00ffff', '#4682b4', '#7fffd4', '#ffa07a', '#b0e0e6',
  '#ff1493', '#fa8072', '#20b2aa', '#f5deb3', '#ff7f50'
],
  sparkleCount = 1200,
  borderSize = 10,
  insidePadding = 16,
  edgeBlur = 12,
  glowingBorder = false,
  glowColor = '#6366f1',
  glowRadius = 150,
  dotsBackground = 'dots' as const,
}: DecorativeFrameProps) {
  const stableColors = useMemo(
    () => particleColors,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [particleColors.join(',')]
  );
  const stableSparkleColors = useMemo(
    () => sparkleColors,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sparkleColors.join(',')]
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: -9999, y: -9999 });

  useEffect(() => {
    if (!glowingBorder) return;
    const PROXIMITY = 100;

    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Closest point on rect to cursor
      const cx = Math.max(rect.left, Math.min(e.clientX, rect.right));
      const cy = Math.max(rect.top, Math.min(e.clientY, rect.bottom));
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      if (dist <= PROXIMITY) {
        setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      } else {
        setMouse({ x: -9999, y: -9999 });
      }
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [glowingBorder]);

  const fade = `${edgeBlur}px`;
  const maskImage = [
    `linear-gradient(to right,  transparent, black ${fade}, black calc(100% - ${fade}), transparent)`,
    `linear-gradient(to bottom, transparent, black ${fade}, black calc(100% - ${fade}), transparent)`,
  ].join(', ');

  /**
   * Maska wycinająca środek — glow widoczny TYLKO na obszarze bordera.
   * Technika: dwa nałożone gradienty (cały obszar XOR content-box) = pozostaje tylko padding.
   */
  const glowMask = `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-md overflow-hidden ${className}`}

    >
      {/* Ambient glow w tle śledzący kursor */}
      {glowingBorder && (
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 0,
            background: `radial-gradient(circle ${glowRadius * 2}px at ${mouse.x}px ${mouse.y}px, ${glowColor}40, transparent 70%)`,
            filter: 'blur(24px)',
          }}
          animate={{ opacity: mouse.x === -9999 ? 0 : 1 }}
          transition={{ duration: 0.4 }}
        />
      )}

      {/* Stały szary border — ta sama technika xor-mask co glow, leżą dokładnie na sobie */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none rounded-md"
        style={{
          zIndex: 3,
          background: 'color-mix(in srgb, currentColor 20%, transparent)',
          WebkitMask: glowMask,
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: 1,
        }}
      />

      {/* Tło particle / sparkles */}
      {dotsBackground === 'dots' && (
        <ParticlesBackground
          colors={stableColors}
          size={particleSize}
          countDesktop={particleCountDesktop}
          countTablet={particleCountTablet}
          countMobile={particleCountMobile}
          zIndex={0}
        />
      )}
      {dotsBackground === 'sparkles' && (
        <SparklesBackground
          colors={stableSparkleColors}
          count={sparkleCount}
          zIndex={0}
        />
      )}

      {/* Glow na borderze — gradient śledzi mysz, widoczny tylko w obszarze bordera */}
      {glowingBorder && (
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none rounded-md"
          style={{
            zIndex: 4,
            background: `radial-gradient(circle ${glowRadius}px at ${mouse.x}px ${mouse.y}px, ${glowColor}, transparent 70%)`,
            WebkitMask: glowMask,
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: 2,
          }}
          animate={{ opacity: mouse.x === -9999 ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Treść — wewnętrzny panel zakrywa środek, dots widoczne tylko w "ramce" */}
      <div className="relative" style={{ zIndex: 1 }}>
        <div
          className="bg-white/80 dark:bg-zinc-900/80"
          style={{
            margin: borderSize,
            padding: insidePadding,
            maskImage,
            WebkitMaskImage: maskImage,
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
