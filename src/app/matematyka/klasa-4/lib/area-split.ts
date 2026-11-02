/**
 * Pola figur metodą podziału i uzupełniania — czysta warstwa liczaca dla
 * lekcji `pola-figur/podzial-i-uzupelnianie`.
 *
 * Figura opisana jest tak samo jak w `lib/area.ts`: zbiorem komórek kratki, a
 * nie ścieżką SVG. Dzięki temu ta sama funkcja rozstrzyga, czy cięcie naprawdę
 * rozcina figurę na prostokąty, liczy pole każdego kawałka i podaje klucz
 * odpowiedzi — nic nie jest wpisywane ręcznie obok rysunku.
 *
 * Dwie metody, jedna arytmetyka:
 * - **podział** — rozetnij figurę na prostokąty i pola DODAJ (`splitRegions`),
 * - **uzupełnianie** — domknij figurę do prostokąta i pole braków ODEJMIJ
 *   (`complementParts`).
 */

import { cellKey, type GridCell } from './area';

export interface RectPart {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const partArea = (part: RectPart): number => part.width * part.height;

export const partKey = (part: RectPart): string =>
  `${part.x},${part.y},${part.width},${part.height}`;

export function partCells(part: RectPart): GridCell[] {
  const cells: GridCell[] = [];
  for (let dy = 0; dy < part.height; dy += 1) {
    for (let dx = 0; dx < part.width; dx += 1) cells.push({ x: part.x + dx, y: part.y + dy });
  }
  return cells;
}

/**
 * Suma zbiorów komórek bez powtórzeń. Figury składane z kilku prostokątów
 * potrafią na siebie zachodzić (krzyżyk = pionowa belka + pozioma belka), a
 * zdublowana komórka policzyłaby się w polu dwa razy i dałaby dwa węzły SVG o
 * tym samym kluczu. Każda figura złożona z więcej niż jednego prostokąta musi
 * przejść przez tę funkcję.
 */
export function mergeCells(...groups: GridCell[][]): GridCell[] {
  const seen = new Set<string>();
  const cells: GridCell[] = [];
  for (const group of groups) {
    for (const cell of group) {
      const key = cellKey(cell);
      if (seen.has(key)) continue;
      seen.add(key);
      cells.push(cell);
    }
  }
  return cells;
}

/** Najmniejszy prostokąt obejmujący całą figurę — punkt wyjścia metody uzupełniania. */
export function boundingBox(cells: GridCell[]): RectPart {
  const xs = cells.map((cell) => cell.x);
  const ys = cells.map((cell) => cell.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x + 1, height: Math.max(...ys) - y + 1 };
}

/** Czy zbiór komórek jest pełnym prostokątem (bez wcięć i dziur). */
export function isRectangle(cells: GridCell[]): boolean {
  if (cells.length === 0) return false;
  return partArea(boundingBox(cells)) === cells.length;
}

/* ──────────────────────────────── podział ──────────────────────────────── */

/** Cięcie wzdłuż linii kratownicy: `v` przy `at` rozdziela kolumny `at-1` i `at`. */
export interface FigureCut {
  dir: 'v' | 'h';
  at: number;
}

export const cutKey = (cut: FigureCut): string => `${cut.dir}${cut.at}`;

/**
 * Linie kratownicy, wzdłuż których w ogóle da się ciąć tę figurę: wszystkie
 * wewnętrzne linie prostokąta obejmującego. Widżet renderuje każdą z nich jako
 * widoczny w spoczynku, klikalny cel.
 */
export function cutCandidates(cells: GridCell[]): FigureCut[] {
  const box = boundingBox(cells);
  const cuts: FigureCut[] = [];
  for (let i = 1; i < box.width; i += 1) cuts.push({ dir: 'v', at: box.x + i });
  for (let i = 1; i < box.height; i += 1) cuts.push({ dir: 'h', at: box.y + i });
  return cuts;
}

const blocked = (a: GridCell, b: GridCell, cuts: FigureCut[]): boolean =>
  cuts.some((cut) =>
    cut.dir === 'v'
      ? a.y === b.y && Math.max(a.x, b.x) === cut.at
      : a.x === b.x && Math.max(a.y, b.y) === cut.at
  );

export interface SplitResult {
  /** Spójne kawałki figury po wykonaniu cięć, posortowane od lewej-górnej. */
  regions: GridCell[][];
  /** Prostokąty odpowiadające kawałkom — `null`, jeśli choć jeden nie jest prostokątem. */
  rectangles: RectPart[] | null;
  /** Suma pól kawałków = pole figury (niezależnie od tego, jak ją pociąć). */
  total: number;
}

/**
 * Figura rozcięta podanymi cięciami. Kawałki wychodzą z przeszukiwania wszerz
 * po komórkach figury, w którym cięcie działa jak ściana — dokładnie tak, jak
 * `floodLayers` w `lib/area.ts` traktuje obrys.
 */
export function splitRegions(cells: GridCell[], cuts: FigureCut[]): SplitResult {
  const inside = new Map(cells.map((cell) => [cellKey(cell), cell]));
  const visited = new Set<string>();
  const regions: GridCell[][] = [];

  const ordered = [...cells].sort((a, b) => a.y - b.y || a.x - b.x);
  for (const start of ordered) {
    if (visited.has(cellKey(start))) continue;
    const region: GridCell[] = [];
    const queue: GridCell[] = [start];
    visited.add(cellKey(start));
    while (queue.length > 0) {
      const cell = queue.shift() as GridCell;
      region.push(cell);
      const steps: GridCell[] = [
        { x: cell.x, y: cell.y - 1 },
        { x: cell.x, y: cell.y + 1 },
        { x: cell.x - 1, y: cell.y },
        { x: cell.x + 1, y: cell.y },
      ];
      for (const step of steps) {
        const key = cellKey(step);
        if (!inside.has(key) || visited.has(key)) continue;
        if (blocked(cell, step, cuts)) continue;
        visited.add(key);
        queue.push(step);
      }
    }
    regions.push(region);
  }

  const allRectangles = regions.every(isRectangle);
  return {
    regions,
    rectangles: allRectangles ? regions.map(boundingBox) : null,
    total: cells.length,
  };
}

/* ────────────────────────────── uzupełnianie ────────────────────────────── */

export interface ComplementResult {
  /** Prostokąt, do którego domykamy figurę. */
  box: RectPart;
  /** Spójne kawałki braku — `null`, jeśli któryś nie jest prostokątem. */
  holes: RectPart[] | null;
  /** Pole prostokąta obejmującego. */
  boxArea: number;
  /** Pole figury: `boxArea` minus wszystkie braki. */
  total: number;
}

/**
 * Figura domknięta do prostokąta obejmującego. Braki liczone są jako różnica
 * zbiorów, a potem grupowane w spójne kawałki tą samą funkcją co podział — więc
 * metoda „dopełnij i odejmij” i metoda „potnij i dodaj” stoją na jednym kodzie.
 */
export function complementParts(cells: GridCell[]): ComplementResult {
  const box = boundingBox(cells);
  const inside = new Set(cells.map(cellKey));
  const missing = partCells(box).filter((cell) => !inside.has(cellKey(cell)));

  const grouped = missing.length === 0 ? { rectangles: [] as RectPart[] } : splitRegions(missing, []);

  return {
    box,
    holes: grouped.rectangles,
    boxArea: partArea(box),
    total: cells.length,
  };
}

/* ───────────────────────────────── ściąga ───────────────────────────────── */

export const SPLIT_RULES: string[] = [
  'Pole figury złożonej z prostokątów liczy się bez liczenia kratek — wystarczy rozłożyć ją na prostokąty.',
  'Metoda podziału: potnij figurę wzdłuż linii kratownicy na prostokąty, policz pole każdego i wszystkie DODAJ.',
  'Ta sama figura da się pociąć na kilka sposobów i za każdym razem wyjdzie to samo pole — sposób cięcia wybierasz dla wygody.',
  'Metoda uzupełniania: domknij figurę do dużego prostokąta, policz jego pole i ODEJMIJ pole tego, czego w figurze nie ma.',
  'Uzupełnianie jest szybsze, gdy brakuje jednego kawałka; podział — gdy figura jest długa i poszarpana.',
  'Przesunięcie kawałka figury w inne miejsce nie zmienia jej pola — zmienia tylko kształt, więc wolno tak upraszczać rachunek.',
  'Zanim policzysz, sprawdź długości boków, których nie podano wprost: brakujący bok to zwykle różnica dwóch podanych.',
];
