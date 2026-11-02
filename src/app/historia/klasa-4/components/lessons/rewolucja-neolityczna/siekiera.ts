/**
 * Siekiera krzemienna (L16, blok 4) — czysta logika. Żeby założyć pole,
 * trzeba wyciąć las. Każde drzewo pada po `HITS_PER_TREE` uderzeniach,
 * a ostrze krzemiennej siekiery tępi się i w końcu pęka — trzeba nowej.
 * Liczby są modelem; prawdziwe jest to, że rolnicy zużywali bardzo dużo
 * krzemienia, dlatego w Krzemionkach kopano go przez tysiące lat.
 */

export const TREES = 12;
export const HITS_PER_TREE = 3;
/** Tyle uderzeń wytrzymuje jedno ostrze. */
export const AXE_HITS = 8;

export interface ChopState {
  trees: number[]; // ile uderzeń dostało każde drzewo
  axeLeft: number; // ile uderzeń zostało ostrzu
  axesUsed: number; // ile siekier zużyto (łącznie z obecną)
}

export function initialChop(): ChopState {
  return { trees: Array(TREES).fill(0), axeLeft: AXE_HITS, axesUsed: 1 };
}

export function isFelled(s: ChopState, i: number): boolean {
  return s.trees[i] >= HITS_PER_TREE;
}

export function felledCount(s: ChopState): number {
  return s.trees.filter((h) => h >= HITS_PER_TREE).length;
}

/** Uderzenie w drzewo `i`. Pęknięte ostrze od razu zastępuje nowa siekiera. */
export function chop(s: ChopState, i: number): { state: ChopState; broke: boolean } {
  if (isFelled(s, i)) return { state: s, broke: false };
  const trees = s.trees.map((h, k) => (k === i ? h + 1 : h));
  const left = s.axeLeft - 1;
  const done = trees.every((h) => h >= HITS_PER_TREE);
  if (left <= 0 && !done) return { state: { trees, axeLeft: AXE_HITS, axesUsed: s.axesUsed + 1 }, broke: true };
  return { state: { trees, axeLeft: Math.max(0, left), axesUsed: s.axesUsed }, broke: left <= 0 };
}

/** Ile siekier potrzeba na całe pole (do porównania z wynikiem dziecka). */
export function axesForField(): number {
  return Math.ceil((TREES * HITS_PER_TREE) / AXE_HITS);
}
