import type { ReactNode } from 'react';
import type { RysunekL12 } from './zwroty';

/**
 * Rysunki sensu i dosłownych obrazów zwrotów L12 — kreska w `currentColor`
 * (jak rysunki znaczeń w L10), bez napisów, współrzędne całkowite (hydracja).
 * Złoto i kamień mają własne wypełnienie, bo kolor jest tu treścią.
 */
export function RysunekZwrotu({ kind, className }: { kind: RysunekL12; className?: string }) {
  return (
    <svg viewBox="0 0 100 80" className={className} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      {RYSUNKI[kind]}
    </svg>
  );
}

/** Ludzik: głowa w (x, y), ręce i nogi podane jako ścieżki względem tułowia. */
function Ludzik({ x, y, rece, nogi }: { x: number; y: number; rece: string; nogi: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="0" r="6" />
      <path d="M0 6 V26" />
      <path d={rece} />
      <path d={nogi} />
    </g>
  );
}

const BIEG = { rece: 'M0 12 L-9 18 M0 12 L9 6', nogi: 'M0 26 L-10 34 L-14 42 M0 26 L9 33 L16 30' };

const Twarzyczka = ({ x, y, r = 16, usta }: { x: number; y: number; r?: number; usta: string }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx="0" cy="0" r={r} />
    <path d={usta} />
  </g>
);

const RYSUNKI: Record<RysunekL12, ReactNode> = {
  'pies-buda': (
    <>
      <path d="M62 70 V44 L76 32 L90 44 V70 Z" />
      <path d="M70 70 V56 a6 6 0 0 1 12 0 V70" />
      <path d="M14 56 q2 -8 10 -8 h14 q6 0 8 -6 l4 4 -2 6 v10 m-24 -6 v10 m6 -10 v10 m10 -10 v10" />
      <path d="M14 56 l-6 -4" />
      <path d="M50 46 l3 -4" />
      <path d="M2 62 h8 M0 54 h6" strokeWidth={1.4} />
    </>
  ),
  'muchy-sens': (
    <>
      <Twarzyczka x={50} y={36} r={22} usta="M-9 12 Q0 5 9 12" />
      <path d="M38 28 l8 3 M62 28 l-8 3" />
      <circle cx="42" cy="34" r="1.5" fill="currentColor" />
      <circle cx="58" cy="34" r="1.5" fill="currentColor" />
      <path d="M22 70 q28 -12 56 0" />
      <path d="M78 12 l6 -6 M84 18 l8 -2" strokeWidth={1.6} />
    </>
  ),
  'muchy-dosl': (
    <>
      <Twarzyczka x={42} y={40} r={22} usta="M-6 13 q6 -3 12 0" />
      <circle cx="35" cy="36" r="1.5" fill="currentColor" />
      <circle cx="49" cy="36" r="1.5" fill="currentColor" />
      <path d="M42 38 q4 6 0 9" />
      {[
        [66, 30],
        [78, 44],
        [72, 60],
        [88, 26],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <ellipse cx="0" cy="0" rx="3" ry="2" fill="currentColor" />
          <path d="M-1 -2 q-4 -5 -6 -1 M1 -2 q4 -5 6 -1" strokeWidth={1.2} />
        </g>
      ))}
      <path d="M46 46 q8 -6 16 -14 M46 47 q12 0 28 -3" strokeWidth={1} strokeDasharray="2 3" />
    </>
  ),
  prezent: (
    <>
      <rect x="28" y="34" width="44" height="36" />
      <rect x="24" y="26" width="52" height="10" />
      <path d="M50 26 V70" />
      <path d="M50 26 q-14 -16 -18 -4 q4 6 18 4 q14 -16 18 -4 q-4 6 -18 4" />
    </>
  ),
  'nogi-sens': (
    <>
      <Ludzik x={46} y={22} {...BIEG} />
      <path d="M14 30 h14 M10 40 h16 M16 50 h12" strokeWidth={1.4} />
      <path d="M4 72 H96" strokeWidth={1.2} />
    </>
  ),
  'nogi-dosl': (
    <>
      <circle cx="50" cy="14" r="6" />
      <path d="M50 20 V42" />
      <path d="M50 28 L40 36 M50 28 L60 36" />
      <path d="M40 42 H60" strokeWidth={4} />
      <path d="M50 42 q-12 10 -8 0 q-4 -2 0 -2 M50 42 q12 10 8 0 q4 -2 0 -2" />
      <path d="M38 42 q-2 6 4 8 M62 42 q2 6 -4 8" strokeWidth={1.4} />
      <path d="M30 60 q20 8 40 0" strokeDasharray="3 3" strokeWidth={1.2} />
      <path d="M24 72 H76" strokeWidth={1.2} />
      <path d="M74 14 q6 4 2 10 M80 10 q8 8 2 18" strokeWidth={1.4} />
    </>
  ),
  'garsc-sens': (
    <>
      <circle cx="30" cy="62" r="10" />
      <circle cx="72" cy="62" r="10" />
      <path d="M30 62 L44 46 H62 L72 62 M44 46 L52 62 L62 46 M42 40 h6" />
      <Ludzik x={52} y={14} rece="M0 12 L-8 26 M0 12 L10 4" nogi="M0 26 L-6 34 M0 26 L6 34" />
      <path d="M68 6 l4 -4 M72 10 h6" strokeWidth={1.4} />
    </>
  ),
  'garsc-dosl': (
    <>
      <path d="M12 74 Q14 46 30 44 L76 40 Q86 40 84 48 Q82 54 70 54 L56 56" />
      <path d="M30 44 Q28 30 40 30 L66 30 Q74 30 74 36 Q74 40 66 40" />
      <path d="M40 30 Q40 22 50 22 L62 22 Q68 22 68 27" />
      <Ludzik x={52} y={2} rece="M0 12 L-6 18 M0 12 L6 18" nogi="M0 26 L-3 30 M0 26 L3 30" />
      <path d="M86 20 q4 -4 8 0 M88 28 q4 -2 6 2" strokeWidth={1.4} />
    </>
  ),
  'kot-kanapa': (
    <>
      <path d="M10 48 V40 q0 -6 6 -6 h68 q6 0 6 6 v8" />
      <rect x="6" y="48" width="88" height="16" />
      <path d="M12 64 v8 M88 64 v8" />
      <path d="M34 48 q0 -12 16 -12 q14 0 16 12" />
      <path d="M60 38 l2 -6 4 5 4 -5 1 7" />
      <path d="M64 42 h2 M68 42 h2" strokeWidth={1.4} />
      <path d="M34 48 q-10 0 -8 -6" />
      <path d="M76 22 h6 l-6 6 h6 M84 12 h4 l-4 4 h4" strokeWidth={1.4} />
    </>
  ),
  arbuz: (
    <>
      <path d="M8 46 A42 26 0 0 0 92 46 Z" />
      <path d="M14 46 A36 20 0 0 0 86 46" />
      {[26, 38, 50, 62, 74].map((x, i) => (
        <ellipse key={x} cx={x} cy={i % 2 ? 54 : 58} rx="1.6" ry="2.6" fill="currentColor" />
      ))}
      <path d="M4 46 h92" />
      <Ludzik x={50} y={8} rece="M0 12 L-10 4 M0 12 L10 4" nogi="M0 26 L-5 30 M0 26 L5 30" />
    </>
  ),
  'kark-sens': (
    <>
      <circle cx="40" cy="38" r="16" />
      <path d="M40 54 V72" />
      <path d="M33 40 h2 M45 40 h2 M35 46 q5 4 10 0" />
      <path d="M68 20 a9 9 0 1 1 14 8 v6 h-10 v-6 a9 9 0 0 1 -4 -8 z" />
      <path d="M72 38 h8" />
      <path d="M62 12 l-4 -4 M76 6 V2 M88 12 l4 -4" strokeWidth={1.4} />
    </>
  ),
  'kark-dosl': (
    <>
      <circle cx="50" cy="30" r="16" />
      <path d="M44 46 V64 M56 46 V64" />
      <path d="M30 70 q20 -8 40 0" />
      <path d="M43 32 h2 M55 32 h2 M46 38 h8" />
      <path d="M76 18 q0 -8 8 -8 q8 0 8 7 q0 6 -8 8 v6 M84 38 v1" strokeWidth={2} />
      <path d="M12 24 q0 -6 6 -6 q6 0 6 5 q0 4 -6 6 v4 M18 40 v1" strokeWidth={2} />
    </>
  ),
  'drzwi-cicho': (
    <>
      <rect x="44" y="8" width="38" height="66" />
      <path d="M44 8 L30 14 V72 L44 74" />
      <circle cx="34" cy="44" r="2" />
      <path d="M8 66 q4 -4 8 0 M16 58 q4 -4 8 0" strokeWidth={1.6} />
      <path d="M90 30 h6 M90 40 h4" strokeWidth={1.2} strokeDasharray="1 4" />
    </>
  ),
  'wiatr-sens': (
    <>
      <path d="M6 54 L30 46 Q38 44 44 46 L56 50" />
      <path d="M94 54 L70 46 Q62 44 56 46 L44 50" />
      <path d="M40 50 q10 8 20 0" />
      <path d="M46 30 l4 -10 4 10 M38 34 l-6 -6 M62 34 l6 -6" strokeWidth={1.6} />
    </>
  ),
  'wiatr-dosl': (
    <>
      <Twarzyczka x={20} y={40} r={14} usta="M6 0 a3 3 0 1 0 0.1 0" />
      <path d="M38 34 q16 -6 30 0 q10 4 18 -4 M40 46 q20 6 34 -2 q8 -4 14 2" strokeWidth={1.4} />
      {[
        [48, 26, -10],
        [62, 50, 12],
        [78, 22, 20],
        [86, 46, -16],
      ].map(([x, y, r]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
          <rect x="-6" y="-4" width="12" height="8" />
          <path d="M-3 0 h6" strokeWidth={1.2} />
        </g>
      ))}
    </>
  ),
  'zlote-sens': (
    <>
      <path d="M50 18 L76 36 H24 Z" />
      <rect x="30" y="36" width="40" height="26" />
      <circle cx="50" cy="48" r="5" />
      <path d="M50 62 V74" />
      <path d="M78 54 l12 -12 M86 38 l8 8 -4 4 -8 -8 z" />
      <path d="M14 30 q4 -4 8 0 M10 44 q4 -4 8 0" strokeWidth={1.4} />
    </>
  ),
  'zlote-dosl': (
    <>
      {[30, 70].map((x, i) => (
        <g key={x} transform={`translate(${x} 44) scale(${i ? -1 : 1} 1)`}>
          <path d="M-10 26 V4 q0 -4 3 -4 v-10 q0 -3 3 -3 q3 0 3 3 v8 v-12 q0 -3 3 -3 q3 0 3 3 v12 v-9 q0 -3 3 -3 q3 0 3 3 v14 q0 10 -8 16 v4 z" fill="#e8c44a" stroke="#a07c12" />
        </g>
      ))}
      <path d="M50 10 v8 M34 14 l4 6 M66 14 l-4 6 M22 28 l6 2 M78 28 l-6 2" stroke="#c9a227" strokeWidth={1.8} />
    </>
  ),
  'kamien-sens': (
    <>
      <Twarzyczka x={44} y={40} r={22} usta="M-10 6 Q0 16 10 6" />
      <path d="M34 34 q3 -3 6 0 M48 34 q3 -3 6 0" />
      <path d="M70 34 q8 -2 12 4 q-6 2 -12 -4 M74 44 q8 0 12 6 q-8 0 -12 -6" strokeWidth={1.4} />
      <path d="M22 72 q22 -10 44 0" />
    </>
  ),
  'kamien-dosl': (
    <>
      <path d="M36 30 q-10 -14 -20 -4 q-8 10 6 22 l14 12 l14 -12 q14 -12 6 -22 q-10 -10 -20 4 z" />
      <path d="M64 48 q4 -8 12 -6 q8 2 8 8 q0 6 -8 7 q-10 1 -12 -9 z" fill="#b8b2a7" stroke="#6b665e" />
      <path d="M70 36 v-6 M78 34 v-6" strokeWidth={1.2} strokeDasharray="2 2" />
      <path d="M58 72 H96" strokeWidth={1.2} />
      <path d="M70 62 l-2 6 M80 62 l2 6" strokeWidth={1.2} />
    </>
  ),
};
