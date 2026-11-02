'use client';

import type { PartId } from './stroje';

/**
 * Schematyczna postać w stroju ludowym (viewBox 0 0 100 200). Każda część jest
 * osobną grupą — `onPart` robi z niej cel stuknięcia, `lifted` ją unosi.
 * Wzory pasów mają stałe id (`l12-*`): kilka postaci na stronie powtarza te same
 * definicje, a `useId` rozjeżdżał się między serwerem a klientem.
 * Rysunek ma pokazać różnice między strojami, nie odtworzyć haft co do nitki.
 */
export function PostacWStroju({
  parts,
  onPart,
  lifted,
  wrong,
  className,
  title,
  box,
}: {
  parts: PartId[];
  onPart?: (p: PartId) => void;
  lifted?: PartId | null;
  wrong?: PartId | null;
  className?: string;
  title: string;
  /** Położenie, gdy postać stoi wewnątrz innego `<svg>` (np. na mapie). */
  box?: { x: number; y: number; width: number; height: number };
}) {
  const has = (p: PartId) => parts.includes(p);
  const part = (p: PartId, node: React.ReactNode) =>
    has(p) ? (
      <g
        key={p}
        onClick={onPart ? () => onPart(p) : undefined}
        style={{
          cursor: onPart ? 'pointer' : undefined,
          outline: 'none',
          transform: lifted === p ? 'translateY(-4px)' : undefined,
          transition: 'transform 200ms',
          filter: lifted === p ? 'drop-shadow(0 0 3px #f2b705)' : wrong === p ? 'drop-shadow(0 0 3px #d97706)' : undefined,
        }}
        data-part={p}
      >
        {node}
      </g>
    ) : null;

  const top = parts.find((p) => p === 'kamizelka-krakowska' || p === 'cucha' || p === 'kamizelka-lowicka');

  return (
    <svg viewBox="-2 -8 104 200" className={className} {...box} role="img" aria-label={title}>
      <defs>
        <pattern id="l12-prazki" width="5" height="10" patternUnits="userSpaceOnUse">
          <rect width="5" height="10" fill="#fbf7ef" />
          <rect width="2.2" height="10" fill="#c8102e" />
        </pattern>
        <pattern id="l12-pasiak" width="12" height="10" patternUnits="userSpaceOnUse">
          <rect width="12" height="10" fill="#f07f13" />
          <rect x="3" width="1.4" height="10" fill="#1a1a1a" />
          <rect x="5" width="1.6" height="10" fill="#1f8a3b" />
          <rect x="7.2" width="0.9" height="10" fill="#ffffff" />
          <rect x="9" width="1.4" height="10" fill="#b0127a" />
        </pattern>
      </defs>

      {/* buty */}
      <rect x="32" y="180" width="17" height="9" fill="#3a2a1e" />
      <rect x="51" y="180" width="17" height="9" fill="#3a2a1e" />

      {/* koszula i ręce */}
      <path d="M33,58 L67,58 L70,112 L30,112 Z" fill="#fbfaf5" stroke="#b9b2a2" strokeWidth="0.8" />
      <path d="M33,58 L22,104 L28,106 L37,72 Z" fill="#fbfaf5" stroke="#b9b2a2" strokeWidth="0.8" />
      <path d="M67,58 L78,104 L72,106 L63,72 Z" fill="#fbfaf5" stroke="#b9b2a2" strokeWidth="0.8" />
      <circle cx="25" cy="107" r="3.6" fill="#f1d3b5" />
      <circle cx="75" cy="107" r="3.6" fill="#f1d3b5" />

      {/* spodnie — przerwa między nogawkami też ma łapać palec */}
      {onPart &&
        parts
          .filter((x) => x === 'portki-prazki' || x === 'portki-pasiak' || x === 'portki-parzenice')
          .map((x) => (
            <rect key={`hit-${x}`} x="32" y="128" width="36" height="53" fill="transparent" onClick={() => onPart(x)} style={{ cursor: 'pointer' }} />
          ))}
      {part(
        'portki-prazki',
        <path d="M32,110 L68,110 L68,181 L51.5,181 L50,128 L48.5,181 L32,181 Z" fill="url(#l12-prazki)" stroke="#7c1b22" strokeWidth="0.8" />
      )}
      {part(
        'portki-pasiak',
        <path d="M32,110 L68,110 L68,181 L51.5,181 L50,128 L48.5,181 L32,181 Z" fill="url(#l12-pasiak)" stroke="#6b3a0c" strokeWidth="0.8" />
      )}
      {part(
        'portki-parzenice',
        <g>
          <path d="M32,110 L68,110 L68,181 L51.5,181 L50,128 L48.5,181 L32,181 Z" fill="#f2ede0" stroke="#9c937f" strokeWidth="0.8" />
          {[40.5, 59.5].map((cx) => (
            <g key={cx} fill="none" strokeLinecap="round">
              <path d={`M${cx},118 C${cx - 7},124 ${cx - 6},136 ${cx},140 C${cx + 6},136 ${cx + 7},124 ${cx},118`} stroke="#c8102e" strokeWidth="1.6" />
              <path d={`M${cx},123 C${cx - 3.5},127 ${cx - 3},133 ${cx},135 C${cx + 3},133 ${cx + 3.5},127 ${cx},123`} stroke="#1f2f6b" strokeWidth="1.3" />
              <line x1={cx} y1={140} x2={cx} y2={148} stroke="#1f2f6b" strokeWidth="1.3" />
            </g>
          ))}
        </g>
      )}

      {/* wierzch */}
      {top === 'kamizelka-krakowska' &&
        part(
          'kamizelka-krakowska',
          <g>
            <path d="M34,58 L46,58 L50,84 L54,58 L66,58 L68,108 L32,108 Z" fill="#1f2f6b" stroke="#c8102e" strokeWidth="2" strokeLinejoin="round" />
            {[66, 76, 86, 96].map((y) => (
              <g key={y}>
                <circle cx="45" cy={y + 2} r="1.6" fill="#e3b341" />
                <circle cx="55" cy={y + 2} r="1.6" fill="#e3b341" />
              </g>
            ))}
          </g>
        )}
      {top === 'kamizelka-lowicka' &&
        part(
          'kamizelka-lowicka',
          <g>
            <path d="M34,58 L46,58 L50,84 L54,58 L66,58 L68,108 L32,108 Z" fill="#191919" stroke="#2c2c2c" strokeWidth="1" strokeLinejoin="round" />
            {[
              [39, 70, '#e0245e'],
              [61, 70, '#e0245e'],
              [38, 84, '#f2c230'],
              [62, 84, '#f2c230'],
              [40, 98, '#2fa84f'],
              [60, 98, '#2fa84f'],
            ].map(([x, y, c]) => (
              <g key={`${x}-${y}`}>
                <circle cx={x as number} cy={y as number} r="3.2" fill={c as string} />
                <circle cx={x as number} cy={y as number} r="1.2" fill="#fff" />
              </g>
            ))}
          </g>
        )}
      {top === 'cucha' &&
        part(
          'cucha',
          <g>
            <path d="M31,57 L69,57 L72,128 L52,128 L50,70 L48,128 L28,128 Z" fill="#e6dcc4" stroke="#8b7a5a" strokeWidth="1" strokeLinejoin="round" />
            <path d="M31,57 L20,104 L28,106 L36,72 Z" fill="#e6dcc4" stroke="#8b7a5a" strokeWidth="1" />
            <path d="M69,57 L80,104 L72,106 L64,72 Z" fill="#e6dcc4" stroke="#8b7a5a" strokeWidth="1" />
            <path d="M48,70 L48,128 M52,70 L52,128" stroke="#9e1b1b" strokeWidth="2" />
            <circle cx="46" cy="74" r="2.4" fill="#9e1b1b" />
            <circle cx="54" cy="74" r="2.4" fill="#9e1b1b" />
            <path d="M46,74 L42,86 M54,74 L58,86" stroke="#9e1b1b" strokeWidth="1.4" />
          </g>
        )}

      {/* głowa */}
      <rect x="45" y="48" width="10" height="11" fill="#f1d3b5" />
      <circle cx="50" cy="38" r="12" fill="#f1d3b5" />
      <path d="M38.5,35 C40,25 60,25 61.5,35 C58,30 42,30 38.5,35 Z" fill="#7a4b26" />
      <circle cx="45.5" cy="39" r="1.3" fill="#2b2118" />
      <circle cx="54.5" cy="39" r="1.3" fill="#2b2118" />
      <path d="M46,44.5 Q50,47 54,44.5" stroke="#a5523a" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* nakrycie głowy */}
      {part(
        'krakuska',
        <g>
          <path d="M36,29 L64,29 L69,14 Q50,11 31,14 Z" fill="#c8102e" stroke="#7c0a1d" strokeWidth="1" strokeLinejoin="round" />
          <path d="M50,12 L50,29" stroke="#7c0a1d" strokeWidth="0.7" />
          <rect x="35" y="27" width="30" height="6" fill="#4b4b4b" />
          <path d="M63,22 C70,12 74,4 78,-2" stroke="#2f7a3a" strokeWidth="1.6" fill="none" />
          <ellipse cx="78" cy="-1" rx="4" ry="5" fill="#2a9d8f" transform="rotate(30 78 -1)" />
          <circle cx="78" cy="-1" r="1.8" fill="#1b2a6b" />
          {onPart && <rect x="28" y="-6" width="56" height="40" fill="transparent" />}
        </g>
      )}
      {part(
        'kapelusz-goralski',
        <g>
          <ellipse cx="50" cy="29" rx="20" ry="3.6" fill="#1b1b1b" />
          <path d="M39,29 L40,19 Q50,15 60,19 L61,29 Z" fill="#1b1b1b" />
          {[42, 45.5, 49, 52.5, 56].map((x) => (
            <ellipse key={x} cx={x + 1} cy="25.5" rx="1.4" ry="1.9" fill="#fbf7ef" />
          ))}
        </g>
      )}
      {part(
        'kapelusz-lowicki',
        <g>
          <ellipse cx="50" cy="29" rx="17" ry="3.4" fill="#1b1b1b" />
          <path d="M40,29 L41,9 Q50,5 59,9 L60,29 Z" fill="#1b1b1b" />
        </g>
      )}

      {/* rzecz w ręce */}
      {part(
        'ciupaga',
        <g>
          <rect x="79" y="84" width="3" height="104" fill="#7a5230" />
          <path d="M80.5,84 L92,80 L92,90 L82,88 Z" fill="#9aa3ab" stroke="#4d555c" strokeWidth="0.8" />
          <rect x="74" y="104" width="9" height="5" fill="#f1d3b5" />
          {/* Kij ma 3 jednostki — bez szerokiego pola trafienia palec go nie złapie. */}
          {onPart && <rect x="70" y="76" width="28" height="114" fill="transparent" />}
        </g>
      )}
    </svg>
  );
}
