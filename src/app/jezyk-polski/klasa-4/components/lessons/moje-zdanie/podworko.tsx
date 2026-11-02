'use client';

import type { ReactNode } from 'react';

/**
 * Plan podwórka kamienicy (L6) — rysowany kodem, wspólny dla bloków 1, 2 i 4.
 * Lewa połowa: przyszły ogródek (grządki), prawa: przyszłe boisko (bramki).
 * Oś pozioma 0…100 to miejsce na planie (`argumenty.ts` → `miejsce`).
 */
export function Podworko({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 300 150" className={`block w-full select-none ${className}`} aria-hidden>
      <rect x="0" y="0" width="300" height="150" fill="#efe6d4" />
      {/* ogródek */}
      <rect x="6" y="6" width="138" height="138" fill="#e3edd2" stroke="#9cb37a" strokeDasharray="4 3" />
      {[24, 54, 84, 114].map((y) => (
        <g key={y}>
          <rect x="20" y={y} width="110" height="14" fill="#c9a27a" />
          {[30, 50, 70, 90, 110].map((x) => (
            <circle key={x} cx={x} cy={y + 7} r="3.5" fill="#7fae5a" />
          ))}
        </g>
      ))}
      {/* boisko */}
      <rect x="156" y="6" width="138" height="138" fill="#dcebd3" stroke="#8fb08a" strokeDasharray="4 3" />
      <line x1="225" y1="6" x2="225" y2="144" stroke="#fff" strokeWidth="2" />
      <circle cx="225" cy="75" r="16" fill="none" stroke="#fff" strokeWidth="2" />
      <rect x="156" y="58" width="10" height="34" fill="none" stroke="#fff" strokeWidth="3" />
      <rect x="284" y="58" width="10" height="34" fill="none" stroke="#fff" strokeWidth="3" />
      {/* granica */}
      <line x1="150" y1="0" x2="150" y2="150" stroke="#b9a684" strokeWidth="2" strokeDasharray="2 4" />
      {children}
    </svg>
  );
}

/** Chorągiewka w punkcie (x: 0–300, y: podstawa). `chwieje` — kołysze się, bo nie ma powodu. */
export function Choragiewka({ x, y, color, chwieje, label }: { x: number; y: number; color: string; chwieje?: boolean; label?: string }) {
  return (
    <g transform={`translate(${Math.round(x)} ${Math.round(y)})`}>
      <g style={chwieje ? { animation: 'pol-chwiej 0.9s ease-in-out infinite', transformOrigin: '0px 0px' } : undefined}>
        <line x1="0" y1="0" x2="0" y2="-38" stroke="#5b4a2e" strokeWidth="2.5" />
        <path d="M 0 -38 L 22 -31 L 0 -24 Z" fill={color} />
      </g>
      {label && (
        <text x="0" y="12" textAnchor="middle" fontSize="9" fill="#3f3221">
          {label}
        </text>
      )}
      <style>{'@keyframes pol-chwiej{0%,100%{transform:rotate(-9deg)}50%{transform:rotate(9deg)}}'}</style>
    </g>
  );
}
