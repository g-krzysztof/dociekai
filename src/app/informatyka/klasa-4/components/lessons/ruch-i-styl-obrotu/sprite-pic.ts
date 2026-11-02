import { at, PAPER, type Picture } from '../../picture-view';

/**
 * Rysunek duszka i to, co da się o nim policzyć — wspólne dla pracowni z bloku 3
 * (`SpriteStudio`), pola do rysowania (`SpritePad`) i werdyktu zadania Z-7 (`z7.ts`).
 *
 * Werdykt nie ocenia, **co** dziecko narysowało (pomysł jest jego), tylko dwie rzeczy, które
 * da się zmierzyć: czy to jest rysunek, a nie dwie kreski na próbę, i czy jego środek leży na
 * krzyżyku, wokół którego duszek się obraca.
 */

export const SIZE = 22;
/** Tyle zamalowanych pól uznajemy za „duszek narysowany”, a nie „dwie kreski na próbę”. */
export const ENOUGH = 26;
/** Środek rysunku bliżej krzyżyka niż tyle pól — obrót wygląda już jak obrót w miejscu. */
export const CENTERED = 1.6;

export const COLORS = ['#2f3b46', '#d94f3d', '#e8a33d', '#4f9d5b', '#4c97ff', '#9966ff', '#8a5a3b'];

export const EMPTY: Picture = { w: SIZE, h: SIZE, cells: Array(SIZE * SIZE).fill(PAPER) };

export function filled(pic: Picture): number {
  return pic.cells.reduce((sum, cell) => (cell === PAPER ? sum : sum + 1), 0);
}

/** Środek prostokąta opisanego na zamalowanych polach — w polach kratki; `null` dla pustej kratki. */
export function bounds(pic: Picture): { cx: number; cy: number } | null {
  let minX = pic.w;
  let minY = pic.h;
  let maxX = -1;
  let maxY = -1;
  pic.cells.forEach((cell, i) => {
    if (cell === PAPER) return;
    const x = i % pic.w;
    const y = Math.floor(i / pic.w);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });
  if (maxX < 0) return null;
  return { cx: (minX + maxX + 1) / 2, cy: (minY + maxY + 1) / 2 };
}

/** Przesunięcie całego rysunku; co wyjdzie poza kratkę, to przepada — jak w edytorze. */
export function shift(pic: Picture, dx: number, dy: number): Picture {
  if (dx === 0 && dy === 0) return pic;
  const cells = Array(pic.w * pic.h).fill(PAPER);
  pic.cells.forEach((cell, i) => {
    if (cell === PAPER) return;
    const x = (i % pic.w) + dx;
    const y = Math.floor(i / pic.w) + dy;
    if (x < 0 || y < 0 || x >= pic.w || y >= pic.h) return;
    cells[at(pic.w, x, y)] = cell;
  });
  return { ...pic, cells };
}

export interface SpriteMeasure {
  /** Zamalowane pola. */
  cells: number;
  /** Rysunek jest, a nie dwie kreski na próbę. */
  drawn: boolean;
  /** Odległość środka rysunku od krzyżyka, w polach. */
  offset: number;
  /** Środek leży dość blisko krzyżyka, żeby obrót wyglądał jak obrót w miejscu. */
  centered: boolean;
}

export function measure(pic: Picture | null): SpriteMeasure {
  if (!pic) return { cells: 0, drawn: false, offset: 0, centered: false };
  const box = bounds(pic);
  const cells = filled(pic);
  const drawn = box !== null && cells >= ENOUGH;
  const offset = box ? Math.hypot(box.cx - pic.w / 2, box.cy - pic.h / 2) : 0;
  return { cells, drawn, offset, centered: drawn && offset <= CENTERED };
}
