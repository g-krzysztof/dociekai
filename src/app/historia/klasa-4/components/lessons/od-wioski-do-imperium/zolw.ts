/**
 * Blok 4 — żółw (testudo, F-V.T1-03). Czysta logika, bez Reacta.
 *
 * Oddział 4 × 4 widziany z góry, wróg z przodu (u góry planszy). Strzały lecą
 * z przodu i spadają z góry. Legionista jest bezpieczny:
 *  - z przodu — jeśli stoi w pierwszym szeregu i trzyma tarczę przed sobą
 *    (strzały z przodu trafiają tylko pierwszy szereg);
 *  - z góry — jeśli trzyma tarczę nad głową, a w pierwszym szeregu także wtedy,
 *    gdy nad jego głową sięga tarcza kolegi z drugiego szeregu.
 * Tarcza z boku (marsz) nie chroni ani z przodu, ani z góry.
 */

export const ROWS = 4;
export const COLS = 4;
export type Shield = 'bok' | 'przod' | 'gora';
export const NEXT: Record<Shield, Shield> = { bok: 'przod', przod: 'gora', gora: 'bok' };

export type Grid = Shield[][];
export const marching = (): Grid => Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => 'bok' as Shield));

export interface Hit {
  r: number;
  c: number;
  from: 'przod' | 'gora';
}

export function hits(g: Grid): Hit[] {
  const out: Hit[] = [];
  for (let c = 0; c < COLS; c++) if (g[0][c] !== 'przod') out.push({ r: 0, c, from: 'przod' });
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const covered = g[r][c] === 'gora' || (r === 0 && g[1][c] === 'gora');
      if (!covered) out.push({ r, c, from: 'gora' });
    }
  return out;
}

export function describeHit(h: Hit, g: Grid): string {
  const where = `${h.r + 1}. szereg, ${h.c + 1}. od lewej`;
  const holds = g[h.r][h.c] === 'bok' ? 'tarcza przy boku' : g[h.r][h.c] === 'przod' ? 'tarcza przed sobą' : 'tarcza nad głową';
  if (h.from === 'przod') return `${where}: ${holds} — strzała z przodu trafia.`;
  return h.r === 0
    ? `${where}: ${holds}, a kolega z drugiego szeregu nie trzyma tarczy nad nim — strzała z góry trafia.`
    : `${where}: ${holds} — nic nad głową, strzała z góry trafia.`;
}
