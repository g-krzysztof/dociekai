'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ParticlesBackgroundProps {
  colors?: string[];
  size?: number;
  countDesktop?: number;
  countTablet?: number;
  countMobile?: number;
  zIndex?: number;
  className?: string;
}

interface Particle {
  id: number;
  /** pozycja startowa poza kontenerem (%) */
  fromX: number;
  fromY: number;
  /** szczyt trasy — wewnątrz kontenera (%) */
  peakX: number;
  peakY: number;
  /** pozycja końcowa poza kontenerem (%) */
  toX: number;
  toY: number;
  radius: number;
  color: string;
  duration: number;
  delay: number;
  peakOpacity: number;
}

function useParticleCount(countDesktop: number, countTablet: number, countMobile: number) {
  const [count, setCount] = useState(countDesktop);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w <= 768) setCount(countMobile);
      else if (w <= 1024) setCount(countTablet);
      else setCount(countDesktop);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [countDesktop, countTablet, countMobile]);

  return count;
}

const OVERSHOOT = 18; // % poza granicą kontenera

/**
 * Zwraca punkt poza jedną z 4 krawędzi kontenera.
 * side: 0=góra 1=dół 2=lewo 3=prawo
 */
function outsidePoint(side: number): { x: number; y: number } {
  const r = () => 5 + Math.random() * 90;
  switch (side) {
    case 0: return { x: r(), y: -OVERSHOOT };
    case 1: return { x: r(), y: 100 + OVERSHOOT };
    case 2: return { x: -OVERSHOOT, y: r() };
    default: return { x: 100 + OVERSHOOT, y: r() };
  }
}

function generateParticles(count: number, colors: string[], size: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const entrySide = Math.floor(Math.random() * 4);
    // wyjście przez inną stronę (nie tę samą)
    let exitSide = Math.floor(Math.random() * 3);
    if (exitSide >= entrySide) exitSide++;

    const from = outsidePoint(entrySide);
    const to = outsidePoint(exitSide);
    const radius = size * 0.6 + Math.random() * size;

    const duration = 12 + Math.random() * 16;
    return {
      id: i,
      fromX: from.x,
      fromY: from.y,
      peakX: 10 + Math.random() * 80,
      peakY: 10 + Math.random() * 80,
      toX: to.x,
      toY: to.y,
      radius,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration,
      // ujemny delay = animacja zaczyna się w losowym miejscu cyklu (widoczne od razu)
      delay: -Math.random() * duration,
      peakOpacity: 0.5 + Math.random() * 0.45,
    };
  });
}

export default function ParticlesBackground({
  colors = [
    '#ff223e', '#ff7300', '#ffd700', '#7fff00', '#00ff7f',
    '#00ced1', '#1e90ff', '#00bfff', '#32cd32', '#ffa500',
    '#ff4500', '#87ceeb', '#00fa9a', '#f0e130', '#ff6347',
    '#40e0d0', '#008080', '#ff8c00', '#adff2f', '#00ff00',
    '#00ffff', '#4682b4', '#7fffd4', '#ffa07a', '#b0e0e6',
    '#ff1493', '#fa8072', '#20b2aa', '#f5deb3', '#ff7f50',
  ],
  size = 5,
  countDesktop = 80,
  countTablet = 60,
  countMobile = 40,
  zIndex = 0,
  className = '',
}: ParticlesBackgroundProps) {
  const count = useParticleCount(countDesktop, countTablet, countMobile);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(generateParticles(count, colors, size));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return (
    <div
      aria-hidden
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex }}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.radius * 2,
            height: p.radius * 2,
            backgroundColor: p.color,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{
            left: [`${p.fromX}%`, `${p.peakX}%`, `${p.toX}%`],
            top: [`${p.fromY}%`, `${p.peakY}%`, `${p.toY}%`],
            opacity: [0, p.peakOpacity, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: 1 + Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
