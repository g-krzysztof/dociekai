'use client';

import type { ReactNode } from 'react';

/**
 * Rekwizyty świata do `ZoomOutWorld`, po jednym na szczebel drabinki jednostek.
 *
 * Każda scena jest opisana **ułamkami boku kwadratu jednostkowego**, nie
 * pikselami: `fx`/`fy` idą od 0 do 1, przy czym `fy = 0` to dół kwadratu.
 * Dzięki temu ten sam kod rysuje łebek szpilki w kwadracie o boku 1 mm i
 * osiedle w kwadracie o boku 1 km — kamera skaluje, scena nie wie o skali.
 *
 * Proporcje rekwizytów są prawdziwe tam, gdzie to coś znaczy (boisko 105 × 68 m
 * w kwadracie 100 × 100 m, koło środkowe o promieniu 9,15 m) — bo właśnie z
 * tego dziecko odczytuje, ile naprawdę jest wart hektar.
 */

/** Zaokrąglenie do 3 miejsc — identyczny SSR i klient (ta sama zasada co `lib/clock.ts`). */
const r3 = (value: number): number => Math.round(value * 1000) / 1000;

interface Box {
  fx: number;
  /** Dolna krawędź prostokąta. */
  fy: number;
  fw: number;
  fh: number;
}

type ShapeProps = Omit<React.SVGProps<SVGRectElement>, 'x' | 'y' | 'width' | 'height'>;

/** Prostokąt opisany ułamkami boku; `rx` też jest ułamkiem, więc skaluje się razem z figurą. */
function FRect({ side, fx, fy, fw, fh, frx = 0, ...props }: Box & { side: number; frx?: number } & ShapeProps) {
  return (
    <rect
      x={r3(fx * side)}
      y={r3(-(fy + fh) * side)}
      width={r3(fw * side)}
      height={r3(fh * side)}
      rx={frx ? r3(frx * side) : undefined}
      {...props}
    />
  );
}

function FCircle({
  side,
  fx,
  fy,
  fr,
  ...props
}: { side: number; fx: number; fy: number; fr: number } & Omit<
  React.SVGProps<SVGCircleElement>,
  'cx' | 'cy' | 'r'
>) {
  return <circle cx={r3(fx * side)} cy={r3(-fy * side)} r={r3(fr * side)} {...props} />;
}

const OUTLINE = {
  stroke: 'currentColor',
  strokeOpacity: 0.55,
  vectorEffect: 'non-scaling-stroke' as const,
};

/** Łebek szpilki — 1 mm². */
function PinHead({ side }: { side: number }) {
  return (
    <g>
      <FCircle side={side} fx={0.5} fy={0.5} fr={0.4} fill="#9aa3ad" {...OUTLINE} />
      <FCircle side={side} fx={0.41} fy={0.6} fr={0.12} fill="#ffffff" opacity={0.65} />
    </g>
  );
}

/** Opuszek palca z paznokciem — 1 cm². */
function Fingertip({ side }: { side: number }) {
  return (
    <g>
      <FRect side={side} fx={0.18} fy={0.04} fw={0.64} fh={0.92} frx={0.3} fill="#e9c6ac" {...OUTLINE} />
      <FRect side={side} fx={0.3} fy={0.3} fw={0.4} fh={0.55} frx={0.18} fill="#f7ded1" {...OUTLINE} />
      <FRect side={side} fx={0.34} fy={0.32} fw={0.32} fh={0.1} frx={0.05} fill="#ffffff" opacity={0.7} />
    </g>
  );
}

/** Dłoń dorosłego widziana z góry — 1 dm². */
function Hand({ side }: { side: number }) {
  const skin = { fill: '#e9c6ac', ...OUTLINE };
  return (
    <g>
      <FRect side={side} fx={0.3} fy={0.12} fw={0.42} fh={0.46} frx={0.12} {...skin} />
      <FRect side={side} fx={0.31} fy={0.5} fw={0.09} fh={0.3} frx={0.045} {...skin} />
      <FRect side={side} fx={0.42} fy={0.5} fw={0.09} fh={0.38} frx={0.045} {...skin} />
      <FRect side={side} fx={0.53} fy={0.5} fw={0.09} fh={0.35} frx={0.045} {...skin} />
      <FRect side={side} fx={0.64} fy={0.5} fw={0.08} fh={0.27} frx={0.04} {...skin} />
      <g transform={`rotate(-38 ${r3(0.3 * side)} ${r3(-0.3 * side)})`}>
        <FRect side={side} fx={0.19} fy={0.22} fw={0.1} fh={0.3} frx={0.05} {...skin} />
      </g>
    </g>
  );
}

/** Blat biurka z laptopem i kubkiem — 1 m². */
function DeskTop({ side }: { side: number }) {
  return (
    <g>
      <FRect side={side} fx={0.01} fy={0.06} fw={0.98} fh={0.88} frx={0.02} fill="#c9a97c" {...OUTLINE} />
      <FRect side={side} fx={0.28} fy={0.28} fw={0.44} fh={0.3} frx={0.02} fill="#5b6570" {...OUTLINE} />
      <FRect side={side} fx={0.3} fy={0.58} fw={0.4} fh={0.28} frx={0.02} fill="#8d99a6" {...OUTLINE} />
      <FCircle side={side} fx={0.84} fy={0.3} fr={0.07} fill="#f0f2f4" {...OUTLINE} />
      <FRect side={side} fx={0.06} fy={0.24} fw={0.16} fh={0.24} frx={0.01} fill="#f3ede2" {...OUTLINE} />
    </g>
  );
}

/** Ogródek działkowy 10 × 10 m — 1 ar. */
function AllotmentGarden({ side }: { side: number }) {
  const rows = [0.14, 0.3, 0.46, 0.62];
  const beds: ReactNode[] = [];
  rows.forEach((fy, rowIndex) => {
    for (let i = 0; i < 4; i += 1) {
      beds.push(
        <FCircle
          key={`l${rowIndex}-${i}`}
          side={side}
          fx={0.09 + i * 0.09}
          fy={fy}
          fr={0.028}
          fill="#6d9773"
        />,
      );
      beds.push(
        <FCircle
          key={`r${rowIndex}-${i}`}
          side={side}
          fx={0.59 + i * 0.09}
          fy={fy}
          fr={0.028}
          fill="#6d9773"
        />,
      );
    }
  });
  return (
    <g>
      <FRect side={side} fx={0} fy={0} fw={1} fh={1} fill="#b7cfae" opacity={0.75} {...OUTLINE} />
      <FRect side={side} fx={0.47} fy={0} fw={0.07} fh={1} fill="#ddd3bd" />
      {beds}
      <FRect side={side} fx={0.06} fy={0.76} fw={0.26} fh={0.18} frx={0.01} fill="#a9784f" {...OUTLINE} />
      <FCircle side={side} fx={0.78} fy={0.83} fr={0.11} fill="#6d9773" {...OUTLINE} />
    </g>
  );
}

/**
 * Boisko piłkarskie w kwadracie o boku 100 m — 1 hektar. Wymiary prawdziwe:
 * 105 × 68 m, koło środkowe o promieniu 9,15 m, pole karne 16,5 × 40,3 m.
 * Dlatego boisko wystaje bokiem poza hektar, a i tak ma od niego MNIEJSZE pole —
 * to jest cała pointka tego szczebla.
 */
function FootballPitch({ side }: { side: number }) {
  const lines = { fill: 'none', stroke: '#ffffff', strokeOpacity: 0.85, vectorEffect: 'non-scaling-stroke' as const };
  const fy = 0.16;
  const fh = 0.68;
  return (
    <g>
      <FRect side={side} fx={-0.025} fy={fy} fw={1.05} fh={fh} fill="#7fa86f" {...OUTLINE} />
      <FRect side={side} fx={-0.025} fy={fy} fw={1.05} fh={fh} {...lines} />
      <line
        x1={r3(0.5 * side)}
        y1={r3(-fy * side)}
        x2={r3(0.5 * side)}
        y2={r3(-(fy + fh) * side)}
        {...lines}
      />
      <FCircle side={side} fx={0.5} fy={fy + fh / 2} fr={0.0915} {...lines} />
      <FRect side={side} fx={-0.025} fy={fy + fh / 2 - 0.2015} fw={0.165} fh={0.403} {...lines} />
      <FRect side={side} fx={1.025 - 0.165} fy={fy + fh / 2 - 0.2015} fw={0.165} fh={0.403} {...lines} />
    </g>
  );
}

/** Osiedle z ulicami, parkiem i stawem w kwadracie o boku 1 km — 1 km². */
function Neighbourhood({ side }: { side: number }) {
  const streets: ReactNode[] = [];
  [0.24, 0.5, 0.76].forEach((f, i) => {
    streets.push(
      <FRect key={`h${i}`} side={side} fx={0} fy={f - 0.018} fw={1} fh={0.036} fill="#cfd4d9" />,
    );
    streets.push(
      <FRect key={`v${i}`} side={side} fx={f - 0.018} fy={0} fw={0.036} fh={1} fill="#cfd4d9" />,
    );
  });

  const blocks: ReactNode[] = [];
  const bands = [0.03, 0.29, 0.55, 0.81];
  bands.forEach((bx, col) =>
    bands.forEach((by, row) => {
      if (col === 2 && row === 0) return;
      if (col === 3 && row === 2) return;
      blocks.push(
        <FRect
          key={`b${col}-${row}`}
          side={side}
          fx={bx + 0.02}
          fy={by + 0.02}
          fw={0.16}
          fh={0.16}
          frx={0.006}
          fill="#b9a99a"
          {...OUTLINE}
        />,
      );
    }),
  );

  return (
    <g>
      <FRect side={side} fx={0} fy={0} fw={1} fh={1} fill="#e7e4de" opacity={0.7} />
      {streets}
      {blocks}
      <FRect side={side} fx={0.55} fy={0.03} fw={0.2} fh={0.2} frx={0.01} fill="#8fb383" {...OUTLINE} />
      <FRect side={side} fx={0.83} fy={0.55} fw={0.16} fh={0.2} frx={0.01} fill="#8fb383" {...OUTLINE} />
      <ellipse
        cx={r3(0.9 * side)}
        cy={r3(-0.65 * side)}
        rx={r3(0.055 * side)}
        ry={r3(0.04 * side)}
        fill="#8fb8cf"
        {...OUTLINE}
      />
    </g>
  );
}

/** Scena przypisana do szczebla drabinki — indeks jak w `AREA_UNITS`. */
export const WORLD_SCENES: readonly ((props: { side: number }) => ReactNode)[] = [
  PinHead,
  Fingertip,
  Hand,
  DeskTop,
  AllotmentGarden,
  FootballPitch,
  Neighbourhood,
];

/** Podpis rekwizytu — to on tłumaczy, „ile to naprawdę jest”. */
export const WORLD_CAPTIONS: readonly string[] = [
  'łebek szpilki wbitej w korkową tablicę',
  'opuszek palca z paznokciem',
  'dłoń dorosłego człowieka położona płasko',
  'blat biurka z laptopem i kubkiem',
  'ogródek działkowy o boku 10 metrów',
  'boisko piłkarskie ma 105 × 68 m, czyli około 0,7 hektara — mieści się w hektarze, choć wystaje bokiem',
  'osiedle z ulicami, parkiem i stawem — kwadrat o boku 1 kilometra',
];
