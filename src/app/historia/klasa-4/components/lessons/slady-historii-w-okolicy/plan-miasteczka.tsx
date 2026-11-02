'use client';

import type { TraceId } from './miasteczko';

/**
 * Plan wymyślonego miasteczka Zawidełki — rysowany kodem (żadnej mapy
 * z generatora). Tropy to niewidzialne pola trafienia z pulsującym kółkiem;
 * przyjęty trop „przypomina” planowi, co tu było (zamek, młyn, garbarnia).
 */

export const HOTSPOTS: Record<TraceId, { x: number; y: number; r: number }> = {
  rynek: { x: 340, y: 228, r: 24 },
  zamkowa: { x: 158, y: 100, r: 22 },
  mlynska: { x: 205, y: 298, r: 22 },
  garbarska: { x: 505, y: 312, r: 22 },
  kolumna: { x: 256, y: 160, r: 16 },
  dworzec: { x: 525, y: 66, r: 22 },
  mural: { x: 476, y: 232, r: 20 },
};

const HOUSES: [number, number, number, number][] = [
  [232, 112, 26, 20], [264, 112, 30, 20], [300, 112, 24, 20], [330, 112, 26, 20], [360, 112, 20, 20],
  [232, 258, 30, 20], [268, 258, 24, 20], [298, 258, 30, 20], [334, 258, 22, 20],
  [200, 150, 22, 26], [200, 182, 22, 26], [200, 214, 22, 28],
  [388, 150, 24, 26], [388, 210, 24, 30],
  [120, 150, 30, 22], [150, 200, 26, 22], [100, 220, 30, 24],
  [430, 150, 30, 24], [470, 150, 26, 24], [520, 150, 34, 24], [540, 210, 40, 28],
  [300, 300, 30, 22], [250, 300, 24, 22], [410, 90, 30, 22], [440, 100, 26, 20],
];

interface Props {
  color: string;
  found: Set<TraceId>;
  remembered: Set<TraceId>;
  active: TraceId | null;
  onTap: (id: TraceId) => void;
}

export function PlanMiasteczka({ color, found, remembered, active, onTap }: Props) {
  return (
    <svg viewBox="0 0 600 400" className="block h-auto w-full select-none" role="img" aria-label="Plan wymyślonego miasteczka Zawidełki">
      <rect width="600" height="400" fill="#f7f2e6" />
      {/* tory */}
      <line x1="400" y1="36" x2="600" y2="36" stroke="#8a8172" strokeWidth="2" />
      {Array.from({ length: 20 }, (_, i) => (
        <line key={i} x1={404 + i * 10} y1="31" x2={404 + i * 10} y2="41" stroke="#8a8172" strokeWidth="1.5" />
      ))}
      {/* wzgórze zamkowe */}
      <ellipse cx="78" cy="56" rx="70" ry="40" fill="#d8e4c4" stroke="#b5c79a" />
      {remembered.has('zamkowa') ? (
        <g opacity="0.55" stroke="#6b5e4b" fill="#e9dfcb">
          <rect x="52" y="30" width="52" height="30" />
          <rect x="44" y="18" width="14" height="42" />
          <rect x="98" y="18" width="14" height="42" />
          <path d="M44 18h14M98 18h14" />
        </g>
      ) : (
        <g fill="#b8ad99">
          <rect x="58" y="48" width="10" height="6" />
          <rect x="80" y="44" width="7" height="9" />
          <rect x="94" y="52" width="9" height="5" />
        </g>
      )}
      {/* strumień */}
      <path d="M0 352 C120 330 200 368 300 348 S480 322 600 334 L600 360 C480 348 400 376 300 372 S120 352 0 376 Z" fill="#c9dff0" />
      {/* ulice */}
      <g stroke="#ddd3bf" strokeWidth="14" strokeLinecap="square" fill="none">
        <path d="M230 140 L110 70" />
        <path d="M230 250 L185 342" />
        <path d="M380 250 L425 316 L590 316" />
        <path d="M380 140 L515 82" />
        <path d="M380 196 L600 196" />
        <path d="M230 196 L0 196" />
      </g>
      {/* domy */}
      {HOUSES.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="#eadbc8" stroke="#c4b49d" />
      ))}
      {/* rynek i ratusz */}
      <rect x="230" y="140" width="150" height="110" fill="#efe6d2" stroke="#b9a988" strokeWidth="1.5" />
      <rect x="288" y="180" width="38" height="28" fill="#e2cfb3" stroke="#a08a69" />
      <rect x="302" y="170" width="10" height="10" fill="#e2cfb3" stroke="#a08a69" />
      {/* kolumna */}
      <circle cx="256" cy="160" r="6" fill="#d8d2c6" stroke="#7d7466" />
      <circle cx="256" cy="160" r="2" fill="#7d7466" />
      {/* dworzec */}
      <rect x="492" y="52" width="66" height="28" fill="#d9a48a" stroke="#9c6650" />
      <rect x="518" y="66" width="12" height="14" fill="#9c6650" />
      {/* dom z muralem */}
      <rect x="440" y="214" width="70" height="40" fill="#eadbc8" stroke="#c4b49d" />
      <rect x="462" y="219" width="28" height="30" fill="#a9c4dc" stroke="#7896b3" />
      <path d="M468 240 l8 -12 l8 12 z" fill="#f4f0e6" />
      {/* młyn i garbarnia, gdy plan je „pamięta” */}
      {remembered.has('mlynska') && (
        <g opacity="0.6" stroke="#6b5e4b" fill="none" strokeWidth="1.5">
          <rect x="150" y="318" width="26" height="20" fill="#e9dfcb" />
          <circle cx="186" cy="346" r="12" />
          <path d="M174 346h24M186 334v24M178 338l16 16M194 338l-16 16" />
        </g>
      )}
      {remembered.has('garbarska') && (
        <g opacity="0.6" stroke="#6b5e4b" strokeWidth="1.2">
          {[468, 496, 524].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy="334" rx="10" ry="4" fill="#c79a6b" />
              <line x1={x - 8} y1="300" x2={x + 8} y2="300" />
              <path d={`M${x - 6} 300 l2 10 h8 l2 -10`} fill="#d9b48a" />
            </g>
          ))}
        </g>
      )}
      {/* podpisy */}
      <g fontSize="11" fill="#5c5244" fontFamily="inherit">
        <text x="120" y="122" transform="rotate(30 120 122)">ul. Zamkowa</text>
        <text x="150" y="292" transform="rotate(-64 150 292)">ul. Młyńska</text>
        <text x="430" y="306">ul. Garbarska</text>
        <text x="420" y="122" transform="rotate(-23 420 122)">ul. Dworcowa</text>
        <text x="500" y="190">ul. Długa</text>
        <text x="282" y="236" fontWeight="600">Rynek</text>
        <text x="500" y="96">dworzec</text>
        <text x="30" y="110">wzgórze</text>
      </g>
      <text x="590" y="392" textAnchor="end" fontSize="10" fill="#8a8172" fontStyle="italic">
        Zawidełki — miasteczko wymyślone
      </text>
      {/* tropy */}
      {(Object.keys(HOTSPOTS) as TraceId[]).map((id) => {
        const h = HOTSPOTS[id];
        const isFound = found.has(id);
        return (
          <g key={id} onClick={() => onTap(id)} style={{ cursor: 'pointer' }} role="button" aria-label={`Trop: ${id}`}>
            <circle cx={h.x} cy={h.y} r={h.r} fill="transparent" />
            <circle
              cx={h.x}
              cy={h.y}
              r={h.r - 6}
              fill="none"
              stroke={active === id ? color : isFound ? '#9b917f' : color}
              strokeWidth={active === id ? 3 : 2}
              strokeDasharray={isFound ? undefined : '4 3'}
              className={isFound ? undefined : 'animate-pulse'}
            />
          </g>
        );
      })}
    </svg>
  );
}
