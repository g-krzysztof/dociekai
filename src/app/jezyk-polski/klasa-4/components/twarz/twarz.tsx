'use client';

/**
 * Twarz postaci rysowana kodem (SVG) — twarzy z emocjami do widżetów nie robi
 * generator (§ 11 programu). Wygląd zgodny z arkuszem obsady (włosy, okulary,
 * piegi, kolor ubrania przy szyi). Dwa tryby:
 * - `mina` — gotowa mina (L3: reakcje odbiorców);
 * - `ksztalt` — płynne brwi / oczy / kąciki ust w zakresie −1…1 (L4: dziecko
 *   lepi twarz suwakami); gdy podany, zastępuje `mina`.
 * Wypromowana z L3 przy drugim konsumencie (L4).
 */

/** Płynny kształt twarzy: −1…1 dla każdej części. */
export interface Ksztalt {
  /** −1 zmarszczone (gniew) … 0 … 1 uniesione (zdziwienie, radość). */
  brwi: number;
  /** −1 zmrużone … 1 szeroko otwarte. */
  oczy: number;
  /** −1 kąciki w dół … 1 uśmiech. */
  usta: number;
}

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

export type Postac = 'tymek' | 'halina' | 'dyrektor' | 'zuzia' | 'ola' | 'bogdan' | 'kuba';
export type MinaTwarzy = 'usmiech' | 'smiech' | 'zdziwienie' | 'grymas' | 'spokoj';

interface Wyglad {
  skora: string;
  wlosy: string;
  ubranie: string;
  okulary?: boolean;
  piegi?: boolean;
  fryzura: 'roztrzepane' | 'krotkie-siwe' | 'kok' | 'kucyki' | 'warkocz' | 'krotkie-ciemne';
  broda?: boolean;
}

const WYGLAD: Record<Postac, Wyglad> = {
  tymek: { skora: '#f6dcc8', wlosy: '#d9772b', ubranie: '#f08a3c', piegi: true, fryzura: 'roztrzepane' },
  halina: { skora: '#f3dccd', wlosy: '#d9d9de', ubranie: '#b7a3d6', okulary: true, fryzura: 'krotkie-siwe' },
  dyrektor: { skora: '#f2d6c2', wlosy: '#5b3a29', ubranie: '#2f4a6d', okulary: true, fryzura: 'kok' },
  zuzia: { skora: '#f8e0cf', wlosy: '#efd27a', ubranie: '#f4d03f', fryzura: 'kucyki' },
  bogdan: { skora: '#f2d8c4', wlosy: '#4a3426', ubranie: '#c9a227', okulary: true, broda: true, fryzura: 'krotkie-ciemne' },
  ola: { skora: '#f6dcc8', wlosy: '#8a4b2a', ubranie: '#9fdcc4', piegi: true, fryzura: 'warkocz' },
  /** Kolega Tymka z L17 (spoza kamienicy). */
  kuba: { skora: '#f2d6c2', wlosy: '#4a3426', ubranie: '#3b5b8c', fryzura: 'krotkie-ciemne' },
};

const MOUTH: Record<MinaTwarzy, string> = {
  usmiech: 'M 38 70 Q 50 80 62 70',
  smiech: 'M 36 67 Q 50 86 64 67 Z',
  zdziwienie: 'M 45 72 Q 50 66 55 72 Q 50 78 45 72 Z',
  grymas: 'M 38 75 Q 50 66 62 75',
  spokoj: 'M 40 72 L 60 72',
};

/** Brwi: [lewa, prawa] jako przesunięcie w pionie i kąt. */
const BROWS: Record<MinaTwarzy, { dy: number; rot: number }> = {
  usmiech: { dy: 0, rot: 0 },
  smiech: { dy: -3, rot: 0 },
  zdziwienie: { dy: -6, rot: 0 },
  grymas: { dy: 2, rot: 14 },
  spokoj: { dy: 0, rot: 0 },
};

export function Twarz({
  kto,
  mina = 'spokoj',
  ksztalt,
  size = 120,
  label,
}: {
  kto: Postac;
  mina?: MinaTwarzy;
  ksztalt?: Ksztalt;
  size?: number;
  label?: string;
}) {
  const w = WYGLAD[kto];
  const k = ksztalt ? { brwi: clamp(ksztalt.brwi), oczy: clamp(ksztalt.oczy), usta: clamp(ksztalt.usta) } : null;
  const b = k ? { dy: Math.round(-5 * Math.max(0, k.brwi) * 10) / 10, rot: Math.round(16 * Math.max(0, -k.brwi) * 10) / 10 } : BROWS[mina];
  const eyeH = k ? Math.round(Math.max(0.8, 3.2 + 1.8 * k.oczy) * 10) / 10 : mina === 'smiech' ? 1.2 : mina === 'zdziwienie' ? 4.5 : 3.2;
  const mouth = k ? `M 38 72 Q 50 ${Math.round((72 + 11 * k.usta) * 10) / 10} 62 72` : MOUTH[mina];
  const smiling = k ? k.usta > 0.35 : mina === 'usmiech' || mina === 'smiech';
  const filled = !k && (mina === 'smiech' || mina === 'zdziwienie');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={label ?? `${kto}: ${mina}`} className="block">
      {/* szyja i ubranie */}
      <path d="M 26 100 Q 30 84 50 84 Q 70 84 74 100 Z" fill={w.ubranie} />
      {/* włosy z tyłu */}
      {w.fryzura === 'kok' && <circle cx="50" cy="16" r="10" fill={w.wlosy} />}
      {w.fryzura === 'kucyki' && (
        <>
          <ellipse cx="18" cy="52" rx="7" ry="12" fill={w.wlosy} />
          <ellipse cx="82" cy="52" rx="7" ry="12" fill={w.wlosy} />
          <rect x="20" y="40" width="5" height="4" fill="#f1c40f" />
          <rect x="75" y="40" width="5" height="4" fill="#f1c40f" />
        </>
      )}
      {w.fryzura === 'warkocz' && <path d="M 70 46 Q 84 62 76 88 Q 72 92 70 86 Q 76 64 64 50 Z" fill={w.wlosy} />}
      {/* głowa */}
      <ellipse cx="50" cy="54" rx="27" ry="31" fill={w.skora} />
      {/* włosy z przodu */}
      {w.fryzura === 'roztrzepane' && (
        <path d="M 22 46 Q 20 24 38 22 L 42 16 L 48 23 L 55 15 L 60 23 L 68 18 Q 82 28 78 46 Q 66 34 50 36 Q 34 34 22 46 Z" fill={w.wlosy} />
      )}
      {w.fryzura === 'krotkie-siwe' && <path d="M 22 50 Q 18 22 50 21 Q 82 22 78 50 Q 74 34 50 33 Q 28 34 22 50 Z" fill={w.wlosy} />}
      {w.fryzura === 'kok' && <path d="M 23 52 Q 20 24 50 24 Q 80 24 77 52 Q 70 33 50 32 Q 30 33 23 52 Z" fill={w.wlosy} />}
      {w.fryzura === 'krotkie-ciemne' && <path d="M 23 48 Q 21 23 50 22 Q 79 23 77 48 Q 73 31 50 30 Q 27 31 23 48 Z" fill={w.wlosy} />}
      {w.broda && <path d="M 30 62 Q 32 86 50 88 Q 68 86 70 62 Q 66 78 50 79 Q 34 78 30 62 Z" fill={w.wlosy} opacity="0.85" />}
      {w.fryzura === 'warkocz' && <path d="M 23 50 Q 20 23 50 23 Q 80 23 77 50 Q 70 32 46 33 Q 30 35 23 50 Z" fill={w.wlosy} />}
      {w.fryzura === 'kucyki' && <path d="M 23 48 Q 22 25 50 24 Q 78 25 77 48 Q 66 36 50 37 Q 34 36 23 48 Z" fill={w.wlosy} />}
      {/* brwi */}
      <g style={{ transition: 'transform 250ms', transform: `translateY(${b.dy}px)` }}>
        <line x1="34" y1="44" x2="44" y2="44" stroke="#4b3a2f" strokeWidth="2.2" strokeLinecap="round" transform={`rotate(${b.rot} 39 44)`} />
        <line x1="56" y1="44" x2="66" y2="44" stroke="#4b3a2f" strokeWidth="2.2" strokeLinecap="round" transform={`rotate(${-b.rot} 61 44)`} />
      </g>
      {/* oczy */}
      <ellipse cx="39" cy="53" rx="3" ry={eyeH} fill="#2d2a26" />
      <ellipse cx="61" cy="53" rx="3" ry={eyeH} fill="#2d2a26" />
      {w.okulary && (
        <g fill="none" stroke="#6b5b4b" strokeWidth="1.5">
          <circle cx="39" cy="53" r="8" />
          <circle cx="61" cy="53" r="8" />
          <line x1="47" y1="53" x2="53" y2="53" />
        </g>
      )}
      {w.piegi && (
        <g fill="#d99560" opacity="0.7">
          <circle cx="33" cy="62" r="0.9" />
          <circle cx="36" cy="64" r="0.9" />
          <circle cx="64" cy="62" r="0.9" />
          <circle cx="67" cy="64" r="0.9" />
        </g>
      )}
      {/* rumieńce przy uśmiechu */}
      {smiling && (
        <g fill="#f19c9c" opacity="0.45">
          <ellipse cx="31" cy="66" rx="5" ry="3" />
          <ellipse cx="69" cy="66" rx="5" ry="3" />
        </g>
      )}
      {/* usta */}
      <path
        d={mouth}
        fill={filled ? '#9b3b3b' : 'none'}
        stroke="#7a2e2e"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
