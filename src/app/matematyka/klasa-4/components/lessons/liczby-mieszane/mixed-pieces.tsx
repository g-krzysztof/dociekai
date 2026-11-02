'use client';

import { FractionPie } from '../../fraction-pie';
import { buildPieSlices } from '../../../lib/fraction';

const WEDGE_CENTER = { x: 50, y: 50 };
const WEDGE_RADIUS = 46;

/**
 * Pojedynczy luźny kawałek — dosłownie pierwszy wycinek z tej samej
 * `buildPieSlices`, którą rysuje `FractionPie`. Dzięki temu kawałek leżący
 * osobno ma dokładnie ten sam kształt i kąt, co kawałek w domkniętej
 * całości: dziecko widzi jeden przedmiot w dwóch miejscach, nie dwa różne
 * rysunki.
 */
export function SliceWedge({ color, mianownik, className = 'h-11 w-11 sm:h-12 sm:w-12' }: { color: string; mianownik: number; className?: string }) {
  const [slice] = buildPieSlices(WEDGE_CENTER, WEDGE_RADIUS, mianownik);
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={`Kawałek jedna ${mianownik}`}>
      <path d={slice.path} fill={color} stroke={color} strokeWidth={3} strokeLinejoin="round" />
    </svg>
  );
}

/** Cała, domknięta całość — koło z zamalowanymi wszystkimi wycinkami, z widocznymi liniami podziału. */
export function WholePie({ color, mianownik, label }: { color: string; mianownik: number; label: string }) {
  return (
    <FractionPie
      color={color}
      mianownik={mianownik}
      filled={new Set(Array.from({ length: mianownik }, (_, s) => s))}
      ariaLabel={label}
    />
  );
}
