'use client';

import { Bird, Crown, Dog, Feather, Flower2, Wheat, Zap, type LucideIcon } from 'lucide-react';
import type { AttributeId } from './olimp';

/** Trójząb Posejdona — w lucide go nie ma. */
function Trojzab({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 3v19" />
      <path d="M5 4v4a7 7 0 0 0 14 0V4" />
      <path d="M3.5 5.5 5 3l1.5 2.5M10.5 4.5 12 2l1.5 2.5M17.5 5.5 19 3l1.5 2.5" />
    </svg>
  );
}

/** Kaduceusz Hermesa — laska z dwoma wężami i skrzydełkami. */
function Laska({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 3v19" />
      <path d="M12 5c-3 0-5-1-7-2 1 2 3 3 7 3s6-1 7-3c-2 1-4 2-7 2" />
      <path d="M9 9c0 2 6 2 6 4s-6 2-6 4 6 2 6 3M15 9c0 2-6 2-6 4s6 2 6 4-6 2-6 3" />
    </svg>
  );
}

/** Sierp Kronosa. */
function Sierp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M8 21l4-6" />
      <path d="M12 15C7 13 6 6 11 3c6-2 11 3 9 9-1-4-4-6-7-5-3 1-3 5-1 8" />
    </svg>
  );
}

const ICONS: Record<AttributeId, LucideIcon | typeof Trojzab> = {
  piorun: Zap,
  paw: Feather,
  trojzab: Trojzab,
  pies: Dog,
  klos: Wheat,
  sowa: Bird,
  laska: Laska,
  kwiat: Flower2,
  sierp: Sierp,
  korona: Crown,
};

export function AtrybutGlyph({ id, className }: { id: AttributeId; className?: string }) {
  const Icon = ICONS[id];
  return <Icon className={className} aria-hidden />;
}
