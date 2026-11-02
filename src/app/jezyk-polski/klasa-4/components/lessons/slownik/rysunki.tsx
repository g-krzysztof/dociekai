import type { ReactNode } from 'react';
import type { RysunekZnaczenia } from '../../../data/slownik/hasla';

/**
 * Rysunki znaczeń z hasła słownika — kreska w kolorze `currentColor`, bez
 * napisów. Współrzędne całkowite (hydracja).
 */
export function Rysunek({ kind, className }: { kind: RysunekZnaczenia; className?: string }) {
  return (
    <svg viewBox="0 0 100 80" className={className} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      {RYSUNKI[kind]}
    </svg>
  );
}

const RYSUNKI: Record<RysunekZnaczenia, ReactNode> = {
  'zamek-budowla': (
    <>
      <path d="M8 74 Q50 58 92 74" />
      <path d="M20 66 V30 h-4 v-6 h4 v4 h4 v-4 h4 v4 h4 v-4 h4 v6 h-4 V66" />
      <path d="M64 66 V30 h-4 v-6 h4 v4 h4 v-4 h4 v4 h4 v-4 h4 v6 h-4 V66" />
      <path d="M36 66 V42 h28 V66" />
      <path d="M36 42 v-5 h5 v5 m4 0 v-5 h5 v5 m4 0 v-5 h5 v5" />
      <path d="M45 66 V56 a5 5 0 0 1 10 0 V66" />
      <path d="M28 18 V8 l8 3 -8 3" />
    </>
  ),
  'zamek-drzwi': (
    <>
      <rect x="24" y="8" width="52" height="68" />
      <rect x="40" y="30" width="20" height="28" />
      <circle cx="50" cy="40" r="4" />
      <path d="M48 44 l-2 8 h8 l-2 -8" />
      <path d="M60 40 h12 M66 40 v5 M70 40 v4" />
    </>
  ),
  'zamek-blyskawiczny': (
    <>
      <path d="M50 4 V76" strokeWidth={1.5} strokeDasharray="3 3" />
      {[10, 18, 26, 34, 42].map((y) => (
        <path key={y} d={`M44 ${y} h6 M50 ${y + 4} h6`} />
      ))}
      <path d="M42 50 L50 46 L58 50 L56 60 H44 Z" />
      <rect x="45" y="60" width="10" height="14" />
      <path d="M36 52 Q30 66 40 76 M64 52 Q70 66 60 76" />
    </>
  ),
  'klucz-drzwi': (
    <>
      <circle cx="24" cy="40" r="12" />
      <circle cx="24" cy="40" r="4" />
      <path d="M36 40 H86 M74 40 v8 M82 40 v10 M66 40 v6" />
    </>
  ),
  'klucz-nuty': (
    <>
      {[24, 32, 40, 48, 56].map((y) => (
        <path key={y} d={`M6 ${y} H94`} strokeWidth={1.2} />
      ))}
      <path d="M26 70 Q20 72 21 66 Q22 62 26 64 L30 10 Q36 16 28 28 Q14 40 18 50 Q24 60 34 52 Q38 44 30 40 Q22 40 24 48" />
      <ellipse cx="62" cy="52" rx="5" ry="4" fill="currentColor" />
      <path d="M67 52 V28" />
      <ellipse cx="80" cy="44" rx="5" ry="4" fill="currentColor" />
      <path d="M85 44 V20" />
    </>
  ),
  'klucz-ptaki': (
    <>
      {[
        [50, 18],
        [40, 28],
        [60, 28],
        [30, 38],
        [70, 38],
        [20, 48],
        [80, 48],
        [10, 58],
      ].map(([x, y]) => (
        <path key={`${x}-${y}`} d={`M${x - 6} ${y} q3 -4 6 0 q3 -4 6 0`} />
      ))}
      <path d="M4 74 Q50 66 96 74" strokeWidth={1.5} />
    </>
  ),
};
