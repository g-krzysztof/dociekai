import type { PozaKota } from './sklep';

/**
 * Mruczek pani Haliny (szary kot) rysowany kodem — L5, blok 3 „Co ucieka?”.
 * Poza powtarza reakcję z `mruczek()` obrazem, żeby skutek złego słuchania
 * było widać, a nie tylko czytać (R6 przeglądu 2026-10-19). Współrzędne
 * całkowite (hydracja).
 */

const FUR = '#8a8f98';
const DARK = '#5b6068';
const INK = '#1f2937';

function Oczy({ zamkniete, x }: { zamkniete: boolean; x: number }) {
  if (zamkniete)
    return (
      <g stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round">
        <path d={`M ${x - 9} 46 q 4 3 8 0`} />
        <path d={`M ${x + 3} 46 q 4 3 8 0`} />
      </g>
    );
  return (
    <g fill={INK}>
      <ellipse cx={x - 5} cy={46} rx="2" ry="3" />
      <ellipse cx={x + 7} cy={46} rx="2" ry="3" />
    </g>
  );
}

export function Kot({ poza = 'czeka', size = 120 }: { poza?: PozaKota; size?: number }) {
  const label: Record<PozaKota, string> = {
    czeka: 'Mruczek czeka przy miskach',
    mruczy: 'Mruczek mruczy zadowolony',
    brzuch: 'Mruczek leży z bolącym brzuchem',
    miauczy: 'Mruczek miauczy z pretensją',
    waha: 'Mruczek nie wie, którą miskę ruszyć',
    odchodzi: 'Mruczek odwraca się i odchodzi',
    pelny: 'Mruczek jest przejedzony',
  };

  if (poza === 'brzuch') {
    return (
      <svg width={size} height={size * 0.75} viewBox="0 0 120 90" role="img" aria-label={label[poza]} className="block">
        <ellipse cx="62" cy="68" rx="40" ry="14" fill={FUR} />
        <circle cx="28" cy="62" r="15" fill={FUR} />
        <path d="M 18 52 L 16 40 L 26 49 Z M 32 49 L 40 40 L 39 54 Z" fill={DARK} />
        <g stroke={INK} strokeWidth="2" strokeLinecap="round">
          <path d="M 20 60 l 5 4 M 25 60 l -5 4 M 30 60 l 5 4 M 35 60 l -5 4" />
          <path d="M 23 71 q 5 -4 10 0" fill="none" />
        </g>
        <path d="M 100 70 q 14 -2 12 10" stroke={DARK} strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  const flip = poza === 'odchodzi';
  const pelny = poza === 'pelny';
  const glowaX = poza === 'waha' ? 56 : 52;
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 120 90" role="img" aria-label={label[poza]} className="block">
      <g transform={flip ? 'translate(126 0) scale(-1 1)' : undefined}>
        {/* ogon */}
        <path
          d={flip ? 'M 76 70 q 22 -6 18 -40' : 'M 78 76 q 26 4 22 -18'}
          stroke={DARK}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />
        {/* tułów */}
        <ellipse cx="60" cy="68" rx={pelny ? 30 : 22} ry={pelny ? 20 : 18} fill={FUR} />
        {flip ? (
          <g>
            <path d="M 41 38 L 43 24 L 51 32 Z M 57 32 L 65 24 L 67 38 Z" fill={DARK} />
            <ellipse cx="54" cy="44" rx="16" ry="15" fill={FUR} />
          </g>
        ) : (
          <g transform={poza === 'waha' ? `rotate(-14 ${glowaX} 46)` : undefined}>
            <circle cx={glowaX} cy="46" r="17" fill={FUR} />
            <path d={`M ${glowaX - 15} 38 L ${glowaX - 13} 23 L ${glowaX - 4} 31 Z M ${glowaX + 4} 31 L ${glowaX + 13} 23 L ${glowaX + 15} 38 Z`} fill={DARK} />
            <Oczy zamkniete={poza === 'mruczy'} x={glowaX} />
            <path d={`M ${glowaX - 1} 51 l 2 0 l -1 2 Z`} fill="#c2410c" />
            {poza === 'miauczy' ? (
              <ellipse cx={glowaX} cy="57" rx="3" ry="4" fill={INK} />
            ) : (
              <path d={`M ${glowaX - 4} 55 q 4 ${poza === 'mruczy' ? 4 : 2} 8 0`} stroke={INK} strokeWidth="1.5" fill="none" />
            )}
            <g stroke={INK} strokeWidth="1" opacity="0.6">
              <path d={`M ${glowaX - 8} 53 l -12 -2 M ${glowaX - 8} 55 l -12 2 M ${glowaX + 8} 53 l 12 -2 M ${glowaX + 8} 55 l 12 2`} />
            </g>
          </g>
        )}
        {/* łapy */}
        <ellipse cx="52" cy="85" rx="6" ry="4" fill={DARK} />
        <ellipse cx="68" cy="85" rx="6" ry="4" fill={DARK} />
      </g>
      {poza === 'mruczy' && (
        <text x="80" y="24" fontSize="12" fill={INK} fontStyle="italic">
          mrr…
        </text>
      )}
      {poza === 'miauczy' && (
        <text x="78" y="26" fontSize="13" fill={INK} fontWeight="700">
          miau!
        </text>
      )}
      {poza === 'waha' && (
        <text x="82" y="26" fontSize="18" fill={INK} fontWeight="700">
          ?
        </text>
      )}
    </svg>
  );
}
