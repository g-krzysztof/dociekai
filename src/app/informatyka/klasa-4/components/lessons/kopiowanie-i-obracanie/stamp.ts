/**
 * Wspólny silnik „wytnij → obróć → wklej” dla lekcji o zaznaczaniu.
 *
 * Trzy widżety tej lekcji operują na tym samym modelu: płótno to płaska tablica
 * kolorów (`Grid`) o znanej szerokości, a zaznaczony fragment to `Stamp` —
 * wycięty prostokąt razem z własnymi wymiarami. Wszystkie przekształcenia są
 * czystymi funkcjami bez stanu, więc `CopyDesk` i `ShortcutShow` liczą to samo
 * co `RepeatFinder`, tylko pokazują na innym ekranie (dyscyplina „jedna czysta
 * funkcja” z kursu matematyki).
 *
 * Kluczowa dla lekcji jest różnica między dwoma rodzajami operacji:
 *  - `rotateStamp`/`flipStampX`/`flipStampY` działają **na wyciętym kawałku** —
 *    tak jak menu „Obróć zaznaczenie” w prawdziwym edytorze;
 *  - `rotateGrid`/`mirrorGrid`/`shiftGrid` działają **na całym płótnie** i służą
 *    haczykowi, który składa cały wzór z jednego fragmentu.
 */

/** Biel płótna. Gumka i „przezroczyste tło” odwołują się do tej wartości. */
export const PAPER = '#ffffff';

export type Grid = string[];

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** Wycięty prostokąt razem z wymiarami — bez nich nie da się go obrócić. */
export interface Stamp {
  w: number;
  h: number;
  cells: string[];
}

export const at = (w: number, x: number, y: number) => y * w + x;

export function makeGrid(w: number, h: number): Grid {
  return new Array<string>(w * h).fill(PAPER);
}

/** Liczba komórek, które naprawdę mają kolor (biel się nie liczy). */
export function inkCount(cells: string[]): number {
  return cells.filter((color) => color !== PAPER).length;
}

export function normalizeBox(a: { x: number; y: number }, b: { x: number; y: number }): Box {
  return {
    x0: Math.min(a.x, b.x),
    y0: Math.min(a.y, b.y),
    x1: Math.max(a.x, b.x),
    y1: Math.max(a.y, b.y),
  };
}

export function boxWidth(box: Box) {
  return box.x1 - box.x0 + 1;
}

export function boxHeight(box: Box) {
  return box.y1 - box.y0 + 1;
}

/** Wycina prostokąt z płótna — odpowiednik zaznaczenia i skopiowania. */
export function cut(grid: Grid, w: number, box: Box): Stamp {
  const width = boxWidth(box);
  const height = boxHeight(box);
  const cells: string[] = [];
  for (let y = box.y0; y <= box.y1; y += 1) {
    for (let x = box.x0; x <= box.x1; x += 1) cells.push(grid[at(w, x, y)] ?? PAPER);
  }
  return { w: width, h: height, cells };
}

/** Obrót wyciętego kawałka o 90° w prawo — zamienia jego szerokość z wysokością. */
export function rotateStamp(stamp: Stamp): Stamp {
  const cells = new Array<string>(stamp.w * stamp.h).fill(PAPER);
  for (let y = 0; y < stamp.h; y += 1) {
    for (let x = 0; x < stamp.w; x += 1) {
      cells[at(stamp.h, stamp.h - 1 - y, x)] = stamp.cells[at(stamp.w, x, y)];
    }
  }
  return { w: stamp.h, h: stamp.w, cells };
}

/** Odbicie lustrzane w poziomie (lewa strona zamienia się z prawą). */
export function flipStampX(stamp: Stamp): Stamp {
  const cells = new Array<string>(stamp.w * stamp.h).fill(PAPER);
  for (let y = 0; y < stamp.h; y += 1) {
    for (let x = 0; x < stamp.w; x += 1) {
      cells[at(stamp.w, stamp.w - 1 - x, y)] = stamp.cells[at(stamp.w, x, y)];
    }
  }
  return { w: stamp.w, h: stamp.h, cells };
}

/** Odbicie lustrzane w pionie (góra zamienia się z dołem). */
export function flipStampY(stamp: Stamp): Stamp {
  const cells = new Array<string>(stamp.w * stamp.h).fill(PAPER);
  for (let y = 0; y < stamp.h; y += 1) {
    for (let x = 0; x < stamp.w; x += 1) {
      cells[at(stamp.w, x, stamp.h - 1 - y)] = stamp.cells[at(stamp.w, x, y)];
    }
  }
  return { w: stamp.w, h: stamp.h, cells };
}

/**
 * Ramka samego rysunku wewnątrz wyciętego kawałka — bez marginesu bieli, który
 * dziecko złapało przy zaznaczaniu. Dzięki niej kopia trafia w miejsce
 * docelowe rysunkiem, a nie rogiem ramki: niechlujne zaznaczenie zostaje
 * niechlujne (biały margines dalej zamalowuje sąsiada), ale nie przesuwa figury.
 * Zwraca `null` dla kawałka bez ani jednej kolorowej kratki.
 */
export function inkBox(stamp: Stamp): Box | null {
  let x0 = stamp.w;
  let y0 = stamp.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < stamp.h; y += 1) {
    for (let x = 0; x < stamp.w; x += 1) {
      if (stamp.cells[at(stamp.w, x, y)] === PAPER) continue;
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
  }
  return x1 < 0 ? null : { x0, y0, x1, y1 };
}

/**
 * Wkleja kawałek w podane miejsce. `transparent` to przełącznik, który w Paincie
 * nazywa się „przezroczyste zaznaczenie”: przy `false` wklejany prostokąt
 * przynosi ze sobą własne białe tło i zasłania to, co pod nim.
 */
export function paste(
  grid: Grid,
  w: number,
  h: number,
  stamp: Stamp,
  origin: { x: number; y: number },
  transparent: boolean
): Grid {
  const next = [...grid];
  for (let y = 0; y < stamp.h; y += 1) {
    for (let x = 0; x < stamp.w; x += 1) {
      const color = stamp.cells[at(stamp.w, x, y)];
      if (transparent && color === PAPER) continue;
      const px = origin.x + x;
      const py = origin.y + y;
      if (px < 0 || py < 0 || px >= w || py >= h) continue;
      next[at(w, px, py)] = color;
    }
  }
  return next;
}

/** Obrót CAŁEGO kwadratowego płótna o 90° w prawo — dla haczyka, nie dla edytora. */
export function rotateGrid(grid: Grid, size: number): Grid {
  const next = makeGrid(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      next[at(size, size - 1 - y, x)] = grid[at(size, x, y)];
    }
  }
  return next;
}

/** Odbicie całego płótna względem pionowej osi. */
export function mirrorGrid(grid: Grid, size: number): Grid {
  const next = makeGrid(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      next[at(size, size - 1 - x, y)] = grid[at(size, x, y)];
    }
  }
  return next;
}

/** Przesunięcie całego płótna w bok; to, co wyjdzie poza krawędź, przepada. */
export function shiftGrid(grid: Grid, size: number, dx: number): Grid {
  const next = makeGrid(size, size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const sx = x - dx;
      if (sx < 0 || sx >= size) continue;
      next[at(size, x, y)] = grid[at(size, sx, y)];
    }
  }
  return next;
}

/** Nakłada warstwy jedna na drugą — biel przepuszcza to, co pod spodem. */
export function mergeGrids(layers: Grid[]): Grid {
  const [first, ...rest] = layers;
  const next = [...first];
  rest.forEach((layer) => {
    layer.forEach((color, i) => {
      if (color !== PAPER) next[i] = color;
    });
  });
  return next;
}

export function sameGrid(a: Grid, b: Grid): boolean {
  return a.length === b.length && a.every((color, i) => color === b[i]);
}
