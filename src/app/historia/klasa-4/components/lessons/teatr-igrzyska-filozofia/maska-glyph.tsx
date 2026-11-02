'use client';

import type { Mask } from './maski';

/** Maska teatralna rysowana kodem: tragiczna (kąciki w dół) albo komiczna (szeroki uśmiech). */
export function MaskaGlyph({ mask, className }: { mask: Mask; className?: string }) {
  const sad = mask === 'tragiczna';
  return (
    <svg viewBox="0 0 40 46" className={className} aria-hidden>
      <path d="M4 6 C12 2 28 2 36 6 C38 22 32 40 20 44 C8 40 2 22 4 6 Z" fill={sad ? '#e2e8f0' : '#fde68a'} stroke="#57534e" strokeWidth={1.6} />
      {sad ? (
        <>
          <path d="M9 17 C12 14 16 15 17 18 C14 20 11 20 9 17 Z" fill="#292524" />
          <path d="M31 17 C28 14 24 15 23 18 C26 20 29 20 31 17 Z" fill="#292524" />
          <path d="M10 13 L17 15 M30 13 L23 15" stroke="#57534e" strokeWidth={1.4} strokeLinecap="round" />
          <path d="M12 35 C15 29 25 29 28 35 C24 33 16 33 12 35 Z" fill="#292524" />
        </>
      ) : (
        <>
          <path d="M9 18 C11 14 15 14 17 18 C14 17 12 17 9 18 Z" fill="#292524" />
          <path d="M31 18 C29 14 25 14 23 18 C26 17 28 17 31 18 Z" fill="#292524" />
          <path d="M10 26 C14 37 26 37 30 26 C25 29 15 29 10 26 Z" fill="#292524" />
        </>
      )}
    </svg>
  );
}
