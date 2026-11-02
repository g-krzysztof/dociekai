'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export type AnimatedButtonAnimation =
  /** Subtelny błysk krążący po obwódce (z pauzą) */
  | 'shimmer-border'
  /** Refleks przesuwający się po powierzchni */
  | 'shine'
  /** Miękki pulsujący glow */
  | 'pulse-glow'
  /** Połączenie shimmer-border + pulse-glow */
  | 'shimmer-border-glow'
  /** Brak animacji */
  | 'none';

export type AnimatedButtonProps = React.HTMLAttributes<HTMLDivElement> & {
  animation?: AnimatedButtonAnimation;
  /** Czas pełnego cyklu shimmer w sekundach (domyślnie 3.6) */
  shimmerDuration?: number;
  /** Grubość obwódki (w px) (domyślnie 2) */
  borderWidth?: number;
  /** Kolor shimmer (domyślnie var(--primary)) */
  shimmerColor?: string;
  /** Kolor glow (domyślnie var(--primary)) */
  glowColor?: string;
  /** Promień spread glow (w px, domyślnie 24) */
  glowRadius?: number;
  /** Callback po kliknięciu */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
};

export const AnimatedButton = React.forwardRef<HTMLDivElement, AnimatedButtonProps>(
  (
    {
      animation = 'shimmer-border',
      shimmerDuration = 3.6,
      borderWidth = 2,
      shimmerColor,
      glowColor,
      glowRadius,
      className,
      children,
      style,
      onClick,
      ...props
    },
    ref
  ) => {
    const dataAnim: AnimatedButtonAnimation = animation;

    const rootStyle: React.CSSProperties & { ['--ab-border']?: string; ['--ab-duration']?: string; ['--ab-shimmer-color']?: string; ['--ab-glow-color']?: string; ['--ab-glow-inset']?: string } = {
      ...(style ?? {}),
      ['--ab-border']: `${borderWidth}px`,
      ['--ab-duration']: `${shimmerDuration}s`,
      ...(shimmerColor && { ['--ab-shimmer-color']: shimmerColor }),
      ...(glowColor && { ['--ab-glow-color']: glowColor }),
      ...(glowRadius && { ['--ab-glow-inset']: `-${glowRadius}px` }),
    };

    // Track div dimensions for dynamic SVG viewBox
    const divRef = React.useRef<HTMLDivElement>(null);
    const [viewBox, setViewBox] = React.useState('0 0 100 40');
    const [rectDims, setRectDims] = React.useState({ width: 99, height: 39 });

    React.useLayoutEffect(() => {
      if (!divRef.current) return;

      const updateViewBox = () => {
        const { width, height } = divRef.current!.getBoundingClientRect();
        const w = Math.max(width, 1);
        const h = Math.max(height, 1);
        setViewBox(`0 0 ${w} ${h}`);
        setRectDims({ width: w - 1, height: h - 1 });
      };

      updateViewBox();

      const observer = new ResizeObserver(updateViewBox);
      observer.observe(divRef.current);

      return () => observer.disconnect();
    }, []);

    // Handle keyboard: Enter and Space should trigger click
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.currentTarget?.click?.();
      }
    };

    return (
      <div
        ref={(node) => {
          divRef.current = node;
          if (ref) {
            if (typeof ref === 'function') ref(node);
            else ref.current = node;
          }
        }}
        role="button"
        tabIndex={0}
        data-animated-button
        data-animation={dataAnim}
        className={cn(
          'ab-root',
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md',
          'text-sm font-medium transition-all cursor-pointer',
          'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
        style={rootStyle}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Animowany border (shimmer) – SVG stroke z dynamicznym viewBox */}
        {(animation === 'shimmer-border' || animation === 'shimmer-border-glow') && (
          <svg
            className="ab-border-svg"
            viewBox={viewBox}
            preserveAspectRatio="none"
            aria-hidden
          >
            <rect
              className="ab-stroke-base"
              x="0.5"
              y="0.5"
              width={String(rectDims.width)}
              height={String(rectDims.height)}
              rx="12"
              ry="12"
              pathLength="100"
            />
            <rect
              className="ab-stroke-shimmer"
              x="0.5"
              y="0.5"
              width={String(rectDims.width)}
              height={String(rectDims.height)}
              rx="12"
              ry="12"
              pathLength="100"
            />
          </svg>
        )}

        {/* Glow (puls) */}
        {(animation === 'pulse-glow' || animation === 'shimmer-border-glow') && (
          <span className="ab-glow" aria-hidden />
        )}

        {/* Shine (refleks) */}
        {animation === 'shine' && <span className="ab-shine" aria-hidden />}

        {/* Content */}
        <span className="relative z-10 pointer-events-none">{children}</span>
      </div>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';
