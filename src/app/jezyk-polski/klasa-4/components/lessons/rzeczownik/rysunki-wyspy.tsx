import type { ReactNode } from 'react';

/**
 * Rzeczy, które słowa stawiają na wyspie (L14, wracają w L15–L17), i sama
 * wyspa. Kreska z kolorami natury, bez napisów; współrzędne całkowite
 * (hydracja).
 */

const KRESKA = '#44403c';

export function RzeczWyspy({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke={KRESKA} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      {RZECZY[id] ?? <circle cx="20" cy="20" r="8" />}
    </svg>
  );
}

const RZECZY: Record<string, ReactNode> = {
  dom: (
    <>
      <path d="M6 20 L20 8 L34 20" fill="#e8b4a0" />
      <rect x="10" y="20" width="20" height="16" fill="#f5ead6" />
      <rect x="17" y="27" width="6" height="9" fill="#a8846a" />
      <path d="M26 12 V7 h4 v8" />
      <path d="M28 5 q2 -3 0 -5" stroke="#a8a29e" />
    </>
  ),
  latarnia: (
    <>
      <path d="M14 36 L17 10 H23 L26 36 Z" fill="#fafaf9" />
      <path d="M15 28 H25 M16 20 H24" stroke="#dc2626" strokeWidth={2.4} />
      <rect x="16" y="5" width="8" height="5" fill="#fde68a" />
      <path d="M15 5 L20 1 L25 5" fill="#dc2626" />
      <path d="M10 36 H30" />
    </>
  ),
  koza: (
    <>
      <path d="M10 22 q0 -6 8 -6 h8 q4 0 4 6 v2 q0 4 -4 4 h-12 q-4 0 -4 -6 z" fill="#fafaf9" />
      <path d="M12 28 v8 M16 28 v8 M24 28 v8 M28 28 v8" />
      <path d="M28 16 q4 -2 6 2 q0 4 -4 4" fill="#fafaf9" />
      <path d="M30 14 q0 -4 3 -6 M32 14 q2 -3 5 -3" />
      <path d="M33 22 v3" />
      <path d="M10 20 q-3 -2 -2 -5" />
    </>
  ),
  studnia: (
    <>
      <path d="M8 6 L20 2 L32 6" fill="#a8846a" />
      <path d="M11 6 V22 M29 6 V22" />
      <path d="M11 12 H29" />
      <path d="M20 12 V18" stroke="#78716c" />
      <rect x="17" y="18" width="6" height="4" fill="#a8a29e" />
      <path d="M7 22 H33 V36 H7 Z" fill="#d6d3d1" />
      <path d="M7 27 H33 M7 32 H33 M14 22 V27 M24 27 V32 M17 32 V36" stroke="#a8a29e" />
    </>
  ),
  drzewo: (
    <>
      <path d="M18 36 V24 h4 v12" fill="#a8846a" />
      <circle cx="20" cy="16" r="11" fill="#bbe3b0" />
      <circle cx="13" cy="19" r="6" fill="#a3d69a" />
      <circle cx="27" cy="18" r="6" fill="#a3d69a" />
    </>
  ),
  lodka: (
    <>
      <path d="M4 26 H36 L31 34 H9 Z" fill="#c9a978" />
      <path d="M20 26 V4" />
      <path d="M21 6 L32 22 H21 Z" fill="#fafaf9" />
      <path d="M2 37 q6 -3 12 0 q6 3 12 0 q6 -3 12 0" stroke="#7dd3fc" />
    </>
  ),
  pies: (
    <>
      <path d="M8 22 q0 -6 8 -6 h10 q4 0 4 6 v2 q0 4 -4 4 h-14 q-4 0 -4 -6 z" fill="#e7cfa4" />
      <path d="M11 28 v8 M15 28 v8 M24 28 v8 M28 28 v8" />
      <circle cx="31" cy="15" r="5" fill="#e7cfa4" />
      <path d="M28 12 q-2 6 1 8" fill="#c9a978" />
      <circle cx="35" cy="16" r="1" fill={KRESKA} />
      <path d="M8 20 q-5 -4 -3 -9" />
    </>
  ),
  kot: (
    <>
      <path d="M10 24 q0 -8 10 -8 q10 0 10 8 q0 8 -10 8 q-10 0 -10 -8 z" fill="#d6d3d1" />
      <circle cx="28" cy="14" r="5" fill="#d6d3d1" />
      <path d="M25 10 l0 -4 3 3 M30 9 l3 -3 0 4" fill="#d6d3d1" />
      <path d="M10 26 q-6 4 -4 10" />
    </>
  ),
  ognisko: (
    <>
      <path d="M8 34 L32 28 M8 28 L32 34" stroke="#a8846a" strokeWidth={3} />
      <path d="M20 28 q-8 -6 -2 -14 q0 6 4 6 q-2 -6 4 -12 q2 10 2 14 q-2 6 -8 6 z" fill="#fdba74" stroke="#ea580c" />
    </>
  ),
  mgla: (
    <>
      {[10, 18, 26, 34].map((y, i) => (
        <path key={y} d={`M${2 + (i % 2) * 4} ${y} q6 -3 12 0 q6 3 12 0 q4 -2 8 0`} stroke="#94a3b8" strokeWidth={2.2} />
      ))}
    </>
  ),
  wiatr: (
    <>
      <path d="M4 14 H26 q6 0 6 -5 q0 -5 -5 -5 q-4 0 -4 4" stroke="#64748b" />
      <path d="M4 22 H32 q5 0 5 5 q0 5 -5 5 q-4 0 -4 -4" stroke="#64748b" />
      <path d="M8 30 H20" stroke="#64748b" />
      <path d="M30 14 l4 -2 M33 20 l4 0" stroke="#a3d69a" />
    </>
  ),
  jablko: (
    <>
      <path d="M20 12 q-10 -4 -12 6 q-2 12 8 16 q4 2 8 0 q10 -4 8 -16 q-2 -10 -12 -6 z" fill="#fca5a5" stroke="#dc2626" />
      <path d="M20 12 q0 -6 3 -8" />
      <path d="M22 8 q6 -4 8 0 q-4 3 -8 0" fill="#a3d69a" />
    </>
  ),
};

/** Wyspa z lotu ptaka: morze, piasek, łąka i pomost. Dzieci w `children` leżą na warstwie HTML nad nią. */
export function PlanszaWyspy() {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
      <rect width="400" height="300" fill="#bae6fd" />
      <path d="M0 40 q40 -10 80 0 M220 270 q40 -10 80 0 M300 30 q30 -8 60 0" stroke="#e0f2fe" strokeWidth={3} fill="none" />
      <path d="M60 150 Q50 60 160 46 Q280 30 340 100 Q378 170 320 236 Q250 290 150 262 Q60 240 60 150 Z" fill="#fde68a" />
      <path d="M84 150 Q78 78 164 68 Q268 56 318 110 Q348 170 302 222 Q244 266 154 242 Q86 222 84 150 Z" fill="#bbf7d0" />
      <path d="M318 224 L370 262" stroke="#a8846a" strokeWidth={10} />
      <path d="M318 224 L370 262" stroke="#c9a978" strokeWidth={6} strokeDasharray="4 4" />
    </svg>
  );
}
