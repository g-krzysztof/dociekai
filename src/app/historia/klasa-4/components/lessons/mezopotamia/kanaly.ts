/**
 * Kanały (L17, blok 1) — czysta logika. Teren to siatka kratek z wysokościami;
 * w kolumnie 0 płynie rzeka (poziom wody `RIVER_LEVEL`). Dziecko rysuje kanał
 * od rzeki przez sąsiednie kratki. Woda płynie, dopóki każda następna kratka
 * nie jest wyżej od poprzedniej — pod górę staje. Pole jest nawodnione, gdy
 * kanał przez nie przechodzi albo biegnie tuż obok.
 *
 * Potem kopanie: każda kratka kanału to `WORK_PER_CELL` dniówek, do wylewu
 * zostaje `DAYS_LEFT` dni. Do czterech kopaczy pracuje sprawnie; więcej
 * bez nadzorcy wchodzi sobie w drogę (połowa wydajności) — nadzorca rozdziela
 * pracę i zapisuje, kto ile ziarna dostanie (baza F-III.2-05). Liczby to model.
 */

export const COLS = 8;
export const ROWS = 6;
export const RIVER_LEVEL = 5;

/** Wysokości terenu [wiersz][kolumna]; kolumna 0 to rzeka. Grzbiet w kolumnie 3 ma przełęcz w wierszu 3. */
export const HEIGHTS: number[][] = [
  [0, 5, 5, 6, 6, 4, 3, 3],
  [0, 4, 4, 6, 3, 3, 2, 2],
  [0, 4, 3, 6, 3, 2, 2, 1],
  [0, 4, 3, 3, 3, 2, 1, 1],
  [0, 5, 4, 6, 6, 6, 2, 1],
  [0, 5, 5, 6, 6, 5, 3, 2],
];

export type Cell = [row: number, col: number];

export const FIELDS: { id: string; at: Cell; name: string }[] = [
  { id: 'a', at: [1, 2], name: 'pole przy rzece' },
  { id: 'b', at: [2, 5], name: 'pole za grzbietem' },
  { id: 'c', at: [1, 7], name: 'pole najdalej' },
];

export const same = (a: Cell, b: Cell) => a[0] === b[0] && a[1] === b[1];
export const adjacent = (a: Cell, b: Cell) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
export const heightOf = ([r, c]: Cell) => HEIGHTS[r][c];

/**
 * Dokłada kratkę do rysowanego kanału: pierwsza musi leżeć przy rzece
 * (kolumna 1), każda następna — obok ostatniej. Wejście na przedostatnią
 * cofa kanał o jedną kratkę. Kratek rzeki i powtórzeń nie przyjmuje.
 */
export function extendPath(path: readonly Cell[], cell: Cell): Cell[] {
  if (cell[1] === 0) return [...path];
  if (path.length === 0) return cell[1] === 1 ? [cell] : [];
  const last = path[path.length - 1];
  if (same(last, cell)) return [...path];
  if (path.length >= 2 && same(path[path.length - 2], cell)) return path.slice(0, -1);
  if (!adjacent(last, cell) || path.some((p) => same(p, cell))) return [...path];
  return [...path, cell];
}

export interface FlowResult {
  /** Ile kratek kanału dostało wodę (od początku). */
  wet: number;
  /** Kratka, na której woda stanęła (pierwsza wyższa od poprzedniej) — albo null. */
  blockedAt: Cell | null;
  blockedFrom: number | null;
  watered: string[];
}

export function flow(path: readonly Cell[]): FlowResult {
  let level = RIVER_LEVEL;
  let wet = 0;
  let blockedAt: Cell | null = null;
  let blockedFrom: number | null = null;
  for (const cell of path) {
    const h = heightOf(cell);
    if (h > level) {
      blockedAt = cell;
      blockedFrom = level;
      break;
    }
    level = h;
    wet++;
  }
  const wetCells = path.slice(0, wet);
  const watered = FIELDS.filter((f) => wetCells.some((c) => same(c, f.at) || adjacent(c, f.at))).map((f) => f.id);
  return { wet, blockedAt, blockedFrom, watered };
}

export function judgeCanal(path: readonly Cell[]): { ok: boolean; text: string; flow: FlowResult } {
  const f = flow(path);
  if (path.length === 0) return { ok: false, text: 'Zacznij kanał przy rzece — na kratce tuż obok wody.', flow: f };
  if (f.blockedAt) {
    return {
      ok: false,
      text: `Woda stanęła: kanał wchodzi na kratkę o wysokości ${heightOf(f.blockedAt)}, a płynęła na wysokości ${f.blockedFrom}. Woda nie płynie pod górę.`,
      flow: f,
    };
  }
  const missing = FIELDS.filter((x) => !f.watered.includes(x.id));
  if (missing.length) {
    return {
      ok: false,
      text: `Woda płynie, ale ${missing.length === 1 ? 'jedno pole jest' : `${missing.length} pola są`} suche: ${missing.map((m) => m.name).join(', ')}. Poprowadź kanał dalej.`,
      flow: f,
    };
  }
  return { ok: true, text: 'Woda dopłynęła do wszystkich trzech pól!', flow: f };
}

export const WORK_PER_CELL = 20;
export const DAYS_LEFT = 30;
export const MAX_DIGGERS = 12;
/** Do tylu kopaczy praca idzie sprawnie bez nadzorcy. */
export const SOLO_LIMIT = 4;

export function efficiency(diggers: number, overseer: boolean): number {
  return diggers <= SOLO_LIMIT || overseer ? 1 : 0.5;
}

export function daysNeeded(length: number, diggers: number, overseer: boolean): number {
  if (diggers <= 0) return Infinity;
  return Math.ceil((length * WORK_PER_CELL) / (diggers * efficiency(diggers, overseer)));
}

export function judgeDig(length: number, diggers: number, overseer: boolean): { ok: boolean; days: number; text: string } {
  const days = daysNeeded(length, diggers, overseer);
  if (days <= DAYS_LEFT) {
    return { ok: true, days, text: `Kanał gotowy w ${days} dni — przed wylewem rzeki.` };
  }
  if (diggers > SOLO_LIMIT && !overseer) {
    return {
      ok: false,
      days,
      text: `${diggers} kopaczy, a praca trwałaby ${days} dni. Wchodzą sobie w drogę, kopią dwa razy to samo i kłócą się, kto ile zrobił i ile ziarna dostanie. Ktoś musi tym pokierować.`,
    };
  }
  return { ok: false, days, text: `Za mało rąk: ${days} dni, a do wylewu zostało ${DAYS_LEFT}. Potrzeba więcej kopaczy.` };
}
