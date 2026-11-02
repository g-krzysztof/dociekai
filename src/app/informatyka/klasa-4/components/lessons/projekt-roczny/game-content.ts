/**
 * Treść własnej gry dziecka — siatka 5×5 ze startem, metą i przeszkodami.
 * Powstaje w całości na tej stronie, tak jak `quiz-content.ts` dla quizu:
 * to realizacja zadania, nie plan do niego (patrz `plan.ts`).
 */

export const GRID_SIZE = 5;
export const MIN_OBSTACLES = 2;

export interface GameGrid {
  start: number | null;
  goal: number | null;
  obstacles: number[];
}

export const EMPTY_GRID: GameGrid = { start: null, goal: null, obstacles: [] };

export function isGameComplete(grid: GameGrid): boolean {
  return grid.start !== null && grid.goal !== null && grid.obstacles.length >= MIN_OBSTACLES;
}

export type CellKind = 'empty' | 'start' | 'goal' | 'obstacle';

export function cellKind(grid: GameGrid, index: number): CellKind {
  if (grid.start === index) return 'start';
  if (grid.goal === index) return 'goal';
  if (grid.obstacles.includes(index)) return 'obstacle';
  return 'empty';
}

/** Sąsiad w danym kierunku, albo `null`, gdy krok wypadłby poza siatkę. */
export function step(index: number, direction: 'up' | 'down' | 'left' | 'right'): number | null {
  const row = Math.floor(index / GRID_SIZE);
  const col = index % GRID_SIZE;
  if (direction === 'up') return row > 0 ? index - GRID_SIZE : null;
  if (direction === 'down') return row < GRID_SIZE - 1 ? index + GRID_SIZE : null;
  if (direction === 'left') return col > 0 ? index - 1 : null;
  return col < GRID_SIZE - 1 ? index + 1 : null;
}
