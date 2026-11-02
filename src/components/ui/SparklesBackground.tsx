'use client';

import React, { useEffect, useRef } from 'react';

interface SparklesBackgroundProps {
  colors?: string[];
  count?: number;
  minSize?: number;
  maxSize?: number;
  zIndex?: number;
  className?: string;
}

interface Dot {
  x: number;
  y: number;
  r: number;
  speed: number;
  color: string;
  opacity: number;
}

function SparklesBackground({
  colors = [
  '#ff223e', '#ff7300', '#ffd700', '#7fff00', '#00ff7f',
  '#00ced1', '#1e90ff', '#00bfff', '#32cd32', '#ffa500',
  '#ff4500', '#87ceeb', '#00fa9a', '#f0e130', '#ff6347',
  '#40e0d0', '#008080', '#ff8c00', '#adff2f', '#00ff00',
  '#00ffff', '#4682b4', '#7fffd4', '#ffa07a', '#b0e0e6',
  '#ff1493', '#fa8072', '#20b2aa', '#f5deb3', '#ff7f50'
],
  count = 300,
  minSize = 1,
  maxSize = 3.5,
  zIndex = 0,
  className = '',
}: SparklesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const makeDot = (startAtBottom = false): Dot => ({
      x: rand(0, canvas.width),
      y: startAtBottom ? canvas.height + rand(0, canvas.height) : rand(0, canvas.height),
      r: rand(minSize, maxSize),
      speed: rand(0.4, 2.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: rand(0.3, 0.9),
    });

    dotsRef.current = Array.from({ length: count }, () => makeDot(false));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      for (const d of dotsRef.current) {
        d.y -= d.speed;
        if (d.y + d.r < 0) {
          d.x = rand(0, w);
          d.y = h + d.r;
          d.speed = rand(0.4, 2.2);
          d.opacity = rand(0.3, 0.9);
          d.r = rand(minSize, maxSize);
          d.color = colors[Math.floor(Math.random() * colors.length)];
        }
        ctx.globalAlpha = d.opacity;
        ctx.fillStyle = d.color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [colors, count, minSize, maxSize]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex, width: '100%', height: '100%' }}
    />
  );
}

export default React.memo(SparklesBackground);
