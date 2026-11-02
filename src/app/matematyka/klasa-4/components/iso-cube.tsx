'use client';

import { AnimatePresence, motion } from 'framer-motion';

/** Bok jednostkowej kostki w jednostkach SVG (rozmiar rombu górnej ścianki). */
const S = 18;

interface UnitCube {
  x: number;
  y: number;
  z: number;
  key: string;
}

export interface IsoDims {
  /** Długość — w prawo w dół. */
  x: number;
  /** Wysokość — w górę. */
  y: number;
  /** Szerokość — w lewo w dół. */
  z: number;
}

function buildCubes({ x: sx, y: sy, z: sz }: IsoDims, layers: number): UnitCube[] {
  const cubes: UnitCube[] = [];
  const top = Math.max(0, Math.min(sy, layers));
  for (let x = 0; x < sx; x++) {
    for (let y = 0; y < top; y++) {
      for (let z = 0; z < sz; z++) {
        cubes.push({ x, y, z, key: `${x}-${y}-${z}` });
      }
    }
  }
  // Malarski algorytm: dalsze kostki (mniejsze x+y+z) rysujemy pierwsze, bliższe na wierzchu.
  return cubes.sort((a, b) => a.x + a.y + a.z - (b.x + b.y + b.z));
}

/** Rzutuje róg (x,y,z) siatki na płaski punkt ekranu w rzucie izometrycznym 2:1. */
function project(x: number, y: number, z: number) {
  return { px: (x - z) * S, py: (x + z) * (S / 2) - y * S };
}

function facesOf(cube: UnitCube) {
  const { px, py } = project(cube.x, cube.y, cube.z);
  const hh = S / 2;
  const top = [
    [px, py],
    [px + S, py + hh],
    [px, py + 2 * hh],
    [px - S, py + hh],
  ];
  const left = [
    [px - S, py + hh],
    [px, py + 2 * hh],
    [px, py + 2 * hh + S],
    [px - S, py + hh + S],
  ];
  const right = [
    [px, py + 2 * hh],
    [px + S, py + hh],
    [px + S, py + hh + S],
    [px, py + 2 * hh + S],
  ];
  return { top, left, right };
}

function pointsToStr(points: number[][]): string {
  return points.map(([x, y]) => `${x},${y}`).join(' ');
}

export interface IsoCubeProps {
  /** Wymiary bryły w kostkach jednostkowych. Sześcian to po prostu `x = y = z`. */
  dims: IsoDims;
  /**
   * Ile dolnych warstw jest wypełnionych. Domyślnie wszystkie — podaj mniej, gdy
   * bryła ma się napełniać warstwa po warstwie.
   */
  filledLayers?: number;
  /** Największy wymiar, jaki ten widget kiedykolwiek pokaże — z niego (nie z bieżących
   *  `dims`) liczony jest `viewBox`, więc rosnąca bryła dokłada kostki w stabilnej ramce
   *  zamiast przeskalowywać cały rysunek. */
  maxDim: number;
  color: string;
  ariaLabel: string;
  className?: string;
}

/**
 * Bryła złożona z jednostkowych kostek w rzucie izometrycznym — pierwsza
 * w kursie wizualizacja przestrzenna (rzut 3D→2D), zamiast płaskiego kształtu
 * na płótnie SVG jak we wszystkich wcześniejszych prymitywach. Każda
 * jednostkowa kostka to trzy wielokąty (góra/lewo/prawo) w różnych odcieniach
 * `color`, namalowane algorytmem malarskim (od najdalszej do najbliższej —
 * `x+y+z` rosnąco), więc się poprawnie zasłaniają bez żadnego bufora
 * głębi. Kostki wjeżdżają przez `AnimatePresence` z opóźnieniem rosnącym wraz
 * z `x+y+z` — ten sam mechanizm co `DealerBoard`, tu użyty do zbudowania
 * kształtu „od rogu na zewnątrz" zamiast rozdania do grup.
 *
 * Powstał w lekcji `kwadraty-i-szesciany` jako sześcian `n³`; promowany do
 * współdzielonych `components/` i uogólniony na dowolny prostopadłościan
 * (`dims`) z częściowym wypełnieniem (`filledLayers`) przy drugim konsumencie —
 * lekcji `objetosc-prostopadloscianu`, gdzie bryła napełnia się warstwami.
 */
export function IsoCube({
  dims,
  filledLayers,
  maxDim,
  color,
  ariaLabel,
  className,
}: IsoCubeProps) {
  const cubes = buildCubes(dims, filledLayers ?? dims.y);

  const topFill = `color-mix(in oklch, ${color} 45%, white)`;
  const rightFill = color;
  const leftFill = `color-mix(in oklch, ${color} 70%, black)`;
  const strokeColor = `color-mix(in oklch, ${color} 90%, black)`;

  const half = maxDim * S + S;
  const top = -(maxDim - 1) * S - S;
  const height = 2 * maxDim * S + 2 * S;

  return (
    <svg
      viewBox={`${-half} ${top} ${2 * half} ${height}`}
      className={className ?? 'mx-auto h-auto w-full max-w-xs'}
      role="img"
      aria-label={ariaLabel}
    >
      <AnimatePresence>
        {cubes.map((cube) => {
          const { top: topPts, left, right } = facesOf(cube);
          return (
            <motion.g
              key={cube.key}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ delay: (cube.x + cube.y + cube.z) * 0.03, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <polygon points={pointsToStr(left)} fill={leftFill} stroke={strokeColor} strokeWidth={0.75} />
              <polygon points={pointsToStr(right)} fill={rightFill} stroke={strokeColor} strokeWidth={0.75} />
              <polygon points={pointsToStr(topPts)} fill={topFill} stroke={strokeColor} strokeWidth={0.75} />
            </motion.g>
          );
        })}
      </AnimatePresence>
    </svg>
  );
}
