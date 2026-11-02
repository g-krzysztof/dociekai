import { imgMap } from '@/lib/media';
import { COIN_LETTERS, COIN_VIEWBOX } from './lupa';

const IMAGES = imgMap({
  moneta: '/images/historia/lekcje/zrodla-historyczne/moneta-sunburst.jpg',
});

/**
 * Moneta w bloku 4 — kompozyt (decyzja autora kursu, 2026-09-26): krążek
 * z ptakiem to ilustracja z modelu sunburst (pusta obwódka, bez liter),
 * a legendę PRINCES POLONIE dorysowuje wektorowy SVG na podstawie fotografii
 * denara Bolesława Chrobrego. Fragment do wypełnienia rodzica
 * (`absolute inset-0` na obu warstwach) — stoi w bazie i w powiększonej
 * kopii w lupie, więc obie zawsze pokazują to samo.
 */
export function MonetaSunburst() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMAGES.moneta}
        alt="Ilustracja srebrnej monety z ptakiem; na obwódce wokół ptaka biegnie napis Princes Polonie (dorysowany)"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <svg
        viewBox={`0 0 ${COIN_VIEWBOX} ${COIN_VIEWBOX}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <g
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize={14}
          fontWeight="bold"
          fill="#4c4437"
          fillOpacity={0.88}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {COIN_LETTERS.map((letter, i) => (
            <text
              key={`litera-${i}`}
              x={letter.x}
              y={letter.y}
              transform={`rotate(${letter.rotate} ${letter.x} ${letter.y})`}
            >
              {letter.char}
            </text>
          ))}
        </g>
      </svg>
    </>
  );
}
